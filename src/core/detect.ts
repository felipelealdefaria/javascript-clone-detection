import type * as t from '@babel/types'
import { parseSource } from './parse.js'
import { LcsQuery, similarityUpperBound } from './similarity.js'
import { emitUnit, extractUnits } from './tokenize.js'
import type {
  CloneClass,
  ClonePair,
  CloneType,
  DetectionResult,
  DetectOptions,
  ParseError,
  SourceFile,
  UnitRef,
} from './types.js'

export const DEFAULT_THRESHOLD = 0.8
export const DEFAULT_MIN_TOKENS = 50

/**
 * Type-3 candidate search. Tuned against an exhaustive run on grafana (39k units): these values
 * keep 99.9% of its Type-3 pairs at ~1/13 of the cost, with no change in benchmark recall.
 * See benchmark/README.md.
 */
const SHINGLE_SIZE = 8
/** Short units may not share an 8-token run, so they are also indexed by 3-token shingles. */
const SHORT_UNIT = 64
const SHORT_SHINGLE_SIZE = 3
/** Shingles found in more units than this (boilerplate) are skipped. */
const MAX_POSTING = 1000

/** Index of the first entry greater than `value` in an ascending list. */
function firstAfter(list: number[], value: number): number {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if ((list[mid] as number) <= value) lo = mid + 1
    else hi = mid
  }
  return lo
}

export interface Unit {
  id: number
  ref: UnitRef
  /** Only kept when `buildUnits` is called with `keepNodes`, to let the file ASTs be collected. */
  node?: t.Node
  /** Ids of enclosing units, innermost first. */
  ancestors: number[]
  rawKey: string
  normKey: string
  norm: Int32Array
  sortedNorm: Int32Array
}

class Interner {
  private readonly ids = new Map<string, number>()
  intern(tokens: string[]): Int32Array {
    const out = new Int32Array(tokens.length)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i] as string
      let id = this.ids.get(token)
      if (id === undefined) {
        id = this.ids.size
        this.ids.set(token, id)
      }
      out[i] = id
    }
    return out
  }
}

/** Parses files and turns every function, method and class into a comparable unit. */
export function buildUnits(
  files: SourceFile[],
  minTokens: number,
  { keepNodes = false } = {},
): { units: Unit[]; errors: ParseError[] } {
  const interner = new Interner()
  const units: Unit[] = []
  const errors: ParseError[] = []

  for (const file of files) {
    let ast: t.File
    try {
      ast = parseSource(file.code, file.path).ast
    } catch (error) {
      errors.push({
        file: file.path,
        message: error instanceof Error ? error.message : String(error),
      })
      continue
    }

    const extracted = extractUnits(ast)
    // Maps each extracted unit to its global id, or -1 when it is too small to keep.
    const globalIds: number[] = []
    for (const unit of extracted) {
      const stream = emitUnit(unit.node)
      const parentId = unit.parent >= 0 ? (globalIds[unit.parent] as number) : -1
      if (stream.norm.length < minTokens) {
        globalIds.push(-1)
        continue
      }
      const id = units.length
      globalIds.push(id)

      const ancestors: number[] = []
      if (parentId >= 0) ancestors.push(parentId, ...(units[parentId] as Unit).ancestors)

      const raw = interner.intern(stream.raw)
      const norm = interner.intern(stream.norm)
      const normKey = norm.join(',')
      const loc = unit.node.loc
      units.push({
        id,
        node: keepNodes ? unit.node : undefined,
        ancestors,
        rawKey: raw.join(','),
        normKey,
        norm,
        sortedNorm: norm.slice().sort(),
        ref: {
          file: file.path,
          name: unit.name,
          kind: unit.kind,
          start: { line: loc?.start.line ?? 0, column: loc?.start.column ?? 0 },
          end: { line: loc?.end.line ?? 0, column: loc?.end.column ?? 0 },
          tokens: norm.length,
          shape: hash64(normKey),
        },
      })
    }
  }
  return { units, errors }
}

function pairKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

interface RawPair {
  a: number
  b: number
  type: CloneType
  similarity: number
}

function groupBy(units: Unit[], key: (u: Unit) => string): Unit[][] {
  const groups = new Map<string, Unit[]>()
  for (const unit of units) {
    const k = key(unit)
    const group = groups.get(k)
    if (group) group.push(unit)
    else groups.set(k, [unit])
  }
  return [...groups.values()].filter((g) => g.length > 1)
}

function isNested(a: Unit, b: Unit): boolean {
  return a.ancestors.includes(b.id) || b.ancestors.includes(a.id)
}

/** Finds clone pairs among units. Type-1 and Type-2 by hashing, Type-3 by candidate search plus LCS. */
export function matchUnits(
  units: Unit[],
  threshold: number,
): { pairs: RawPair[]; comparisons: number } {
  const found = new Map<string, RawPair>()
  const add = (a: Unit, b: Unit, type: CloneType, similarity: number) => {
    if (a.id === b.id || isNested(a, b)) return
    const key = pairKey(a.id, b.id)
    if (!found.has(key))
      found.set(key, { a: Math.min(a.id, b.id), b: Math.max(a.id, b.id), type, similarity })
  }

  // Type-1: identical raw tokens. Type-2: identical after renaming and literal abstraction.
  for (const type of [1, 2] as const) {
    for (const group of groupBy(units, (u) => (type === 1 ? u.rawKey : u.normKey))) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) add(group[i] as Unit, group[j] as Unit, type, 1)
      }
    }
  }

  // Type-3. Units with the same normalized shape compare identically to everything else,
  // so only one representative per shape is compared and matches are expanded to the group.
  const shapes = new Map<string, Unit[]>()
  for (const unit of units) {
    const group = shapes.get(unit.normKey)
    if (group) group.push(unit)
    else shapes.set(unit.normKey, [unit])
  }
  // Sorted by length, so every posting list is too, and a unit only needs to walk the partners
  // whose length can still reach the threshold: 2·min / (n + m) ≥ t  ⇔  m ≤ n · (2 − t) / t.
  const groups = [...shapes.values()].sort(
    (x, y) => (x[0] as Unit).norm.length - (y[0] as Unit).norm.length,
  )
  const reps = groups.map((group) => group[0] as Unit)
  const lengths = reps.map((rep) => rep.norm.length)
  const lastWithin = (maxLength: number) => {
    let lo = 0
    let hi = lengths.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if ((lengths[mid] as number) <= maxLength) lo = mid + 1
      else hi = mid
    }
    return lo - 1
  }

  // Index token shingles. Long shingles are rare, which keeps posting lists short.
  const postings = new Map<number, number[]>()
  const shingles: number[][] = reps.map((rep, index) => {
    const seen = new Set<number>()
    const n = rep.norm
    const sizes = n.length < SHORT_UNIT ? [SHINGLE_SIZE, SHORT_SHINGLE_SIZE] : [SHINGLE_SIZE]
    for (const size of sizes) {
      for (let i = 0; i + size <= n.length; i++) {
        // The size seeds the hash, so 3- and 8-token shingles never collide.
        let h = Math.imul(0x811c9dc5 ^ size, 0x01000193)
        for (let k = 0; k < size; k++) h = Math.imul(h ^ (n[i + k] as number), 0x01000193)
        seen.add(h)
      }
    }
    for (const h of seen) {
      const list = postings.get(h)
      if (list) list.push(index)
      else postings.set(h, [index])
    }
    return [...seen]
  })

  let comparisons = 0
  const visited = new Uint32Array(reps.length)

  for (let i = 0; i < reps.length; i++) {
    const rep = reps[i] as Unit
    const last = lastWithin(Math.floor((rep.norm.length * (2 - threshold)) / threshold + 1e-9))
    let query: LcsQuery | null = null
    for (const h of shingles[i] as number[]) {
      const list = postings.get(h) as number[]
      // Shingles found in very many units (boilerplate) carry little signal and cost O(n²).
      if (list.length > MAX_POSTING) continue
      for (let p = firstAfter(list, i); p < list.length; p++) {
        const j = list[p] as number
        if (j > last) break
        if (visited[j] === i + 1) continue
        visited[j] = i + 1
        const other = reps[j] as Unit
        if (similarityUpperBound(rep.sortedNorm, other.sortedNorm) < threshold) continue
        comparisons++
        query ??= new LcsQuery(rep.norm)
        const similarity = query.similarity(other.norm)
        if (similarity < threshold) continue
        for (const a of groups[i] as Unit[]) {
          for (const b of groups[j] as Unit[]) add(a, b, 3, similarity)
        }
      }
    }
  }

  // A clone inside a clone is not news: drop pairs whose enclosing units already match.
  const pairs = [...found.values()].filter((pair) => {
    const a = units[pair.a] as Unit
    const b = units[pair.b] as Unit
    for (const x of [a.id, ...a.ancestors]) {
      for (const y of [b.id, ...b.ancestors]) {
        if ((x !== a.id || y !== b.id) && x !== y && found.has(pairKey(x, y))) return false
      }
    }
    return true
  })
  return { pairs, comparisons }
}

function fnv1a(text: string, seed = 0x811c9dc5): number {
  let h = seed
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193)
  return h >>> 0
}

/** 64-bit hex digest from two 32-bit FNV-1a passes. Stable, not cryptographic. */
export function hash64(text: string): string {
  return (
    fnv1a(text).toString(16).padStart(8, '0') +
    fnv1a(text, 0x01234567).toString(16).padStart(8, '0')
  )
}

function fingerprint(a: Unit, b: Unit): string {
  return hash64([a.ref.shape, b.ref.shape].sort().join('|'))
}

function compareRefs(a: UnitRef, b: UnitRef): number {
  return (
    a.file.localeCompare(b.file) || a.start.line - b.start.line || a.start.column - b.start.column
  )
}

function buildClasses(units: Unit[], pairs: RawPair[]): CloneClass[] {
  const parent = new Map<number, number>()
  const find = (x: number): number => {
    let root = x
    while (parent.get(root) !== root) root = parent.get(root) as number
    parent.set(x, root)
    return root
  }
  for (const { a, b } of pairs) {
    if (!parent.has(a)) parent.set(a, a)
    if (!parent.has(b)) parent.set(b, b)
    parent.set(find(a), find(b))
  }
  const classes = new Map<number, { type: CloneType; similarity: number; members: Set<number> }>()
  for (const pair of pairs) {
    const root = find(pair.a)
    const entry = classes.get(root) ?? { type: 1, similarity: 1, members: new Set<number>() }
    entry.type = Math.max(entry.type, pair.type) as CloneType
    entry.similarity = Math.min(entry.similarity, pair.similarity)
    entry.members.add(pair.a).add(pair.b)
    classes.set(root, entry)
  }
  return [...classes.values()]
    .map(({ type, similarity, members }) => ({
      type,
      similarity,
      members: [...members].map((id) => (units[id] as Unit).ref).sort(compareRefs),
    }))
    .sort(
      (x, y) =>
        y.members.length - x.members.length ||
        compareRefs(x.members[0] as UnitRef, y.members[0] as UnitRef),
    )
}

/**
 * Detects code clones across a set of source files.
 *
 * Works in Node and in the browser: it takes file contents, not paths.
 */
export function detectClones(files: SourceFile[], options: DetectOptions = {}): DetectionResult {
  const started = performance.now()
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const minTokens = options.minTokens ?? DEFAULT_MIN_TOKENS
  if (!(threshold > 0 && threshold <= 1)) throw new RangeError('threshold must be in (0, 1]')
  if (!(minTokens >= 0)) throw new RangeError('minTokens must be >= 0')

  const { units, errors } = buildUnits(files, minTokens)
  const { pairs: rawPairs, comparisons } = matchUnits(units, threshold)

  const pairs: ClonePair[] = rawPairs
    .map(({ a, b, type, similarity }) => {
      let [ua, ub] = [units[a] as Unit, units[b] as Unit]
      if (compareRefs(ua.ref, ub.ref) > 0) [ua, ub] = [ub, ua]
      return { type, similarity, a: ua.ref, b: ub.ref, fingerprint: fingerprint(ua, ub) }
    })
    .sort(
      (x, y) =>
        x.type - y.type ||
        y.similarity - x.similarity ||
        compareRefs(x.a, y.a) ||
        compareRefs(x.b, y.b),
    )

  return {
    files: files.length,
    units: units.length,
    pairs,
    classes: buildClasses(units, rawPairs),
    errors,
    stats: { durationMs: Math.round(performance.now() - started), comparisons },
  }
}
