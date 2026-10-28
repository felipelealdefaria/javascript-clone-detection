import { describe, expect, it } from 'vitest'
import { lcsLength, lcsSimilarity } from '../src/core/similarity.js'

function lcsReference(a: number[], b: number[]): number {
  const row = new Array(b.length + 1).fill(0)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = 0
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]
      row[j] = a[i - 1] === b[j - 1] ? diagonal + 1 : Math.max(row[j], row[j - 1])
      diagonal = above
    }
  }
  return row[b.length]
}

// Deterministic PRNG so failures are reproducible.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('lcsLength (bit-parallel)', () => {
  it('handles edge cases', () => {
    expect(lcsLength([], [1, 2])).toBe(0)
    expect(lcsLength([1, 2, 3], [1, 2, 3])).toBe(3)
    expect(lcsLength([1, 2, 3], [4, 5, 6])).toBe(0)
  })

  it('matches the dynamic-programming reference across word boundaries', () => {
    const random = mulberry32(42)
    for (let run = 0; run < 500; run++) {
      const alphabet = 2 + Math.floor(random() * 8)
      const seq = () =>
        Array.from({ length: Math.floor(random() * 140) }, () => Math.floor(random() * alphabet))
      const a = seq()
      const b = seq()
      expect(lcsLength(a, b)).toBe(lcsReference(a, b))
    }
  })
})

describe('lcsSimilarity', () => {
  it('is 1 for identical sequences and symmetric', () => {
    expect(lcsSimilarity([1, 2, 3], [1, 2, 3])).toBe(1)
    expect(lcsSimilarity([1, 2, 3, 4], [1, 3])).toBeCloseTo(lcsSimilarity([1, 3], [1, 2, 3, 4]))
    expect(lcsSimilarity([1, 2, 3, 4], [1, 3])).toBeCloseTo(4 / 6)
  })
})
