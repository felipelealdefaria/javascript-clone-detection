import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { type Candidate, collectCandidates, type Domain } from './corpus.js'
import { type MutationType, mutate, sameAst } from './mutate.js'
import { Rng } from './rng.js'
import { runAll } from './tools.js'

export const DATA_DIR = path.join(import.meta.dirname, '.data')
export const DATASET_DIR = path.join(DATA_DIR, 'dataset')
const TYPE4_DIR = path.join(import.meta.dirname, 'type4')

export const SEED = 2021
export const FAMILIES_PER_DOMAIN = 100
/** Above the detector's 50-token minimum, so a Type-3 deletion does not push a unit out of scope. */
const MIN_TOKENS = 60
const MAX_TOKENS = 600

export interface Family {
  id: string
  domain: Domain
  source: string
  tokens: number
  files: { original: string; t1: string; t2: string; t3: string }
  operations: { t1: string[]; t2: string[]; t3: string[] }
  /** Number of statement-level edits in the Type-3 mutant (1–3). */
  t3Edits: number
}

export interface Type4Pair {
  id: string
  a: string
  b: string
}

export interface Dataset {
  seed: number
  candidates: number
  naturalClonesRemoved: number
  families: Family[]
  type4: Type4Pair[]
}

function writeFile(rel: string, code: string): string {
  const file = path.join(DATASET_DIR, rel)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${code}\n`)
  return rel
}

/**
 * Originals must not already be clones of each other, or a detector would be penalized for
 * finding real clones. Any pair flagged by any tool is resolved by dropping the later original.
 */
function removeNaturalClones(pool: Candidate[]): { kept: Candidate[]; removed: number } {
  const dir = path.join(DATA_DIR, 'pool')
  rmSync(dir, { recursive: true, force: true })
  pool.forEach((c, i) => {
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, `${i}.${c.domain === 'react' ? 'jsx' : 'js'}`), c.code)
  })
  const dropped = new Set<number>()
  for (const run of runAll(dir)) {
    for (const key of run.pairs) {
      const [a, b] = key.split('|').map((f) => Number.parseInt(f, 10)) as [number, number]
      if (!dropped.has(a) && !dropped.has(b)) dropped.add(Math.max(a, b))
    }
  }
  rmSync(dir, { recursive: true, force: true })
  return { kept: pool.filter((_, i) => !dropped.has(i)), removed: dropped.size }
}

function mutateWithRetries(code: string, type: MutationType, rng: Rng) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const mutant = mutate(code, type, rng)
    if (!mutant) continue
    if (type === 1 && !sameAst(code, mutant.code)) continue
    if (type > 1 && sameAst(code, mutant.code)) continue
    return mutant
  }
  return null
}

export function buildDataset(): Dataset {
  const rng = new Rng(SEED)
  const all = collectCandidates(MIN_TOKENS, MAX_TOKENS)

  // One candidate per normalized shape: exact duplicates in the corpus are natural clones.
  const unique = [...new Map(all.map((c) => [c.shape, c])).values()]
  const pool: Candidate[] = []
  for (const domain of ['js', 'react'] as const) {
    const eligible = unique.filter((c) => c.domain === domain && (domain === 'js' || c.hasJsx))
    pool.push(...rng.shuffle(eligible).slice(0, Math.ceil(FAMILIES_PER_DOMAIN * 1.5)))
  }
  const { kept, removed } = removeNaturalClones(pool)

  rmSync(DATASET_DIR, { recursive: true, force: true })
  const families: Family[] = []
  for (const domain of ['js', 'react'] as const) {
    let n = 0
    for (const candidate of kept.filter((c) => c.domain === domain)) {
      if (n >= FAMILIES_PER_DOMAIN) break
      const t1 = mutateWithRetries(candidate.code, 1, rng)
      const t2 = mutateWithRetries(candidate.code, 2, rng)
      const t3 = mutateWithRetries(candidate.code, 3, rng)
      if (!t1 || !t2 || !t3) continue
      n++
      const id = `${domain}-${String(n).padStart(3, '0')}`
      const ext = domain === 'react' ? 'jsx' : 'js'
      families.push({
        id,
        domain,
        source: candidate.source,
        tokens: candidate.tokens,
        files: {
          original: writeFile(`${id}/original.${ext}`, candidate.code),
          t1: writeFile(`${id}/t1.${ext}`, t1.code),
          t2: writeFile(`${id}/t2.${ext}`, t2.code),
          t3: writeFile(`${id}/t3.${ext}`, t3.code),
        },
        operations: { t1: t1.operations, t2: t2.operations, t3: t3.operations },
        t3Edits: t3.operations.filter((o) => /^(insert|delete|modify)/.test(o)).length,
      })
    }
  }

  // Type-4 pairs are hand-written: no mutation can produce "same behavior, different code".
  const type4: Type4Pair[] = []
  const names = readdirSync(TYPE4_DIR)
    .filter((f) => /\.a\.jsx?$/.test(f))
    .sort()
  for (const a of names) {
    const b = a.replace('.a.', '.b.')
    const id = `t4-${a.split('.')[0]}`
    type4.push({
      id,
      a: writeFile(`${id}/${a}`, readFileSync(path.join(TYPE4_DIR, a), 'utf8').trimEnd()),
      b: writeFile(`${id}/${b}`, readFileSync(path.join(TYPE4_DIR, b), 'utf8').trimEnd()),
    })
  }

  const dataset: Dataset = {
    seed: SEED,
    candidates: unique.length,
    naturalClonesRemoved: removed,
    families,
    type4,
  }
  writeFileSync(path.join(DATA_DIR, 'dataset.json'), `${JSON.stringify(dataset, null, 2)}\n`)
  return dataset
}
