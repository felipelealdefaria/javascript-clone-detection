import { buildUnits, DEFAULT_THRESHOLD, type Unit } from './detect.js'
import { normalizedSource } from './normalize.js'
import { lcsSimilarity } from './similarity.js'
import type { CloneType, ParseError, SourceFile, UnitRef } from './types.js'

export interface UnitComparison {
  a: UnitRef
  b: UnitRef
  /** null when the pair is below the threshold. */
  type: CloneType | null
  similarity: number
  /** Each unit printed the way the detector sees it. */
  normalized: { a: string; b: string }
}

/**
 * Compares every top-level unit of `a` with every top-level unit of `b`, without a minimum size
 * and reporting similarity even below the threshold. Meant for explaining one pair, as in the
 * playground; use `detectClones` to scan projects.
 */
export function compareSources(
  a: SourceFile,
  b: SourceFile,
  { threshold = DEFAULT_THRESHOLD } = {},
): { comparisons: UnitComparison[]; errors: ParseError[] } {
  const { units, errors } = buildUnits([a, b], 0, { keepNodes: true })
  const topLevel = (file: string) =>
    units.filter((u) => u.ref.file === file && u.ancestors.length === 0)
  const left = topLevel(a.path)
  const right = topLevel(b.path)
  const print = (u: Unit) => (u.node ? normalizedSource(u.node) : '')

  const comparisons: UnitComparison[] = []
  for (const x of left) {
    for (const y of right) {
      const similarity = x.normKey === y.normKey ? 1 : lcsSimilarity(x.norm, y.norm)
      const type: CloneType | null =
        x.rawKey === y.rawKey ? 1 : x.normKey === y.normKey ? 2 : similarity >= threshold ? 3 : null
      comparisons.push({
        a: x.ref,
        b: y.ref,
        type,
        similarity,
        normalized: { a: print(x), b: print(y) },
      })
    }
  }
  comparisons.sort((p, q) => q.similarity - p.similarity)
  return { comparisons, errors }
}
