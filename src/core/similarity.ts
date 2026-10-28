/** Length of the longest common subsequence of two integer sequences. */
export function lcsLength(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length > b.length) [a, b] = [b, a]
  return new LcsQuery(a).length(b)
}

/**
 * LCS against a fixed sequence `a`, reusable across many `b`s: the bit masks for `a` are built
 * once. Bit-parallel (Allison & Dix 1986, Hyyrö 2004): each step handles 32 cells of the DP
 * table, so one query costs O(|a| · |b| / 32).
 */
export class LcsQuery {
  private readonly m: number
  private readonly words: number
  private readonly masks = new Map<number, Uint32Array>()
  private readonly v: Uint32Array

  constructor(a: ArrayLike<number>) {
    this.m = a.length
    this.words = Math.max(1, Math.ceil(a.length / 32))
    this.v = new Uint32Array(this.words)
    for (let i = 0; i < a.length; i++) {
      const symbol = a[i] as number
      let mask = this.masks.get(symbol)
      if (!mask) {
        mask = new Uint32Array(this.words)
        this.masks.set(symbol, mask)
      }
      mask[i >>> 5] = ((mask[i >>> 5] as number) | (1 << (i & 31))) >>> 0
    }
  }

  length(b: ArrayLike<number>): number {
    const { m, words, masks, v } = this
    if (m === 0 || b.length === 0) return 0
    v.fill(0xffffffff)
    for (let j = 0; j < b.length; j++) {
      const mask = masks.get(b[j] as number)
      if (!mask) continue
      let carry = 0
      let borrow = 0
      for (let w = 0; w < words; w++) {
        const vw = v[w] as number
        const u = (vw & (mask[w] as number)) >>> 0
        const sum = vw + u + carry
        carry = sum > 0xffffffff ? 1 : 0
        const diff = vw - u - borrow
        borrow = diff < 0 ? 1 : 0
        v[w] = ((sum >>> 0) | (diff >>> 0)) >>> 0
      }
    }
    // LCS = number of zero bits among the first m bits.
    let ones = 0
    for (let w = 0; w < words; w++) {
      let x = v[w] as number
      if (w === words - 1 && m % 32 !== 0) x &= (1 << (m % 32)) - 1
      ones += popcount(x)
    }
    return m - ones
  }

  /** Dice-style similarity 2·LCS / (|a| + |b|). */
  similarity(b: ArrayLike<number>): number {
    const total = this.m + b.length
    return total === 0 ? 1 : (2 * this.length(b)) / total
  }
}

function popcount(x: number): number {
  let n = x >>> 0
  n = n - ((n >>> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333)
  return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

/** Dice-style LCS similarity: 2·LCS / (|a| + |b|), from 0 to 1. */
export function lcsSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const total = a.length + b.length
  return total === 0 ? 1 : (2 * lcsLength(a, b)) / total
}

/**
 * Upper bound of `lcsSimilarity` from token counts alone (multiset intersection), in
 * O(|a| + |b|) on pre-sorted arrays. Used to skip pairs that cannot reach the threshold.
 */
export function similarityUpperBound(
  sortedA: ArrayLike<number>,
  sortedB: ArrayLike<number>,
): number {
  let i = 0
  let j = 0
  let common = 0
  while (i < sortedA.length && j < sortedB.length) {
    const x = sortedA[i] as number
    const y = sortedB[j] as number
    if (x === y) {
      common++
      i++
      j++
    } else if (x < y) i++
    else j++
  }
  const total = sortedA.length + sortedB.length
  return total === 0 ? 1 : (2 * common) / total
}

/** Upper bound of `lcsSimilarity` from lengths alone. */
export function lengthUpperBound(n: number, m: number): number {
  return n + m === 0 ? 1 : (2 * Math.min(n, m)) / (n + m)
}
