import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { type ClonePair, detectClones, type SourceFile } from '../src/core/index.js'

const fixtures = path.join(import.meta.dirname, 'fixtures')

function load(dir: string): SourceFile[] {
  return readdirSync(path.join(fixtures, dir), { recursive: true, encoding: 'utf8' })
    .filter((f) => /\.[jt]sx?$/.test(f))
    .map((f) => ({ path: f, code: readFileSync(path.join(fixtures, dir, f), 'utf8') }))
}

const find = (pairs: ClonePair[], a: string, b: string) =>
  pairs.find((p) => [p.a.name, p.b.name].sort().join() === [a, b].sort().join())

describe('detectClones on the original 2021 examples', () => {
  const result = detectClones(load('legacy'), { minTokens: 0 })

  it('classifies arrow vs. regular copies as Type-1', () => {
    expect(find(result.pairs, 'arrowFunction', 'regularFunction')?.type).toBe(1)
    expect(find(result.pairs, 'funcOne', 'funcOne')?.type).toBe(1)
  })

  it('classifies renamed copies as Type-2', () => {
    expect(find(result.pairs, 'arrowTwo', 'regularTwo')?.type).toBe(2)
  })

  it('scores the if/else vs. switch pair as a borderline Type-3', () => {
    const pair = find(result.pairs, 'arrowFour', 'regularFour')
    expect(pair?.type).toBe(3)
    expect(pair?.similarity).toBeCloseTo(0.8, 2)
  })

  it('misses the Type-3 example below the default threshold, like v0.6 did', () => {
    expect(find(result.pairs, 'arrowThree', 'regularThree')).toBeUndefined()
    const loose = detectClones(load('legacy'), { minTokens: 0, threshold: 0.7 })
    expect(find(loose.pairs, 'arrowThree', 'regularThree')?.type).toBe(3)
  })
})

describe('detectClones on a React project', () => {
  const result = detectClones(load('project'))

  it('detects a component copied from JSX into TSX as Type-2', () => {
    const pair = find(result.pairs, 'UserCard', 'TeamMemberCard')
    expect(pair?.type).toBe(2)
  })

  it('does not also report the nested callbacks inside the copied components', () => {
    const nested = result.pairs.filter(
      (p) => p.a.name.includes('callback') || p.b.name.includes('callback'),
    )
    expect(nested).toEqual([])
  })

  it('detects an edited copy as Type-3 with its similarity', () => {
    const pair = find(result.pairs, 'formatPrice', 'formatCost')
    expect(pair?.type).toBe(3)
    expect(pair?.similarity).toBeGreaterThan(0.8)
    expect(pair?.similarity).toBeLessThan(1)
  })

  it('reports unparseable files without failing the run', () => {
    expect(result.errors.map((e) => e.file)).toEqual(['src/utils/broken.js'])
  })

  it('is deterministic', () => {
    expect(detectClones(load('project'))).toMatchObject({
      pairs: result.pairs,
      classes: result.classes,
    })
  })

  it('groups pairs into clone classes', () => {
    expect(result.classes.length).toBe(2)
  })
})

describe('options', () => {
  const files = load('project')

  it('respects minTokens', () => {
    expect(detectClones(files, { minTokens: 10_000 }).pairs).toEqual([])
  })

  it('stricter thresholds never add pairs', () => {
    const loose = detectClones(files, { threshold: 0.6 }).pairs.length
    const strict = detectClones(files, { threshold: 0.95 }).pairs.length
    expect(strict).toBeLessThanOrEqual(loose)
  })

  it('rejects invalid options', () => {
    expect(() => detectClones(files, { threshold: 0 })).toThrow(RangeError)
    expect(() => detectClones(files, { threshold: 1.5 })).toThrow(RangeError)
    expect(() => detectClones(files, { minTokens: -1 })).toThrow(RangeError)
  })
})
