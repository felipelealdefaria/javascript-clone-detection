import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectClonesInPaths, toJson, toSarif, toText } from '../src/index.js'

const cwd = path.join(import.meta.dirname, 'fixtures', 'project')
const result = await detectClonesInPaths(['src'], { cwd })

describe('reports', () => {
  it('uses portable, relative paths', () => {
    expect(
      result.pairs.every((p) => p.a.file.startsWith('src/') && p.b.file.startsWith('src/')),
    ).toBe(true)
  })

  it('text: lists clones and a summary', () => {
    const text = toText(result)
    expect(text).toContain('Type-2 clone')
    expect(text).toContain('src/components/TeamMemberCard.tsx')
    expect(text).toMatch(
      /\d+ clone pairs \(\d+ Type-1, \d+ Type-2, \d+ Type-3\) in 2 clone classes\./,
    )
    expect(text).toContain('Skipped src/utils/broken.js')
  })

  it('json: round-trips the result', () => {
    const json = JSON.parse(toJson(result))
    expect(json.tool).toBe('javascript-clone-detection')
    expect(json.pairs).toEqual(result.pairs)
  })

  it('sarif: is valid 2.1.0 with 1-based columns and related locations', () => {
    const sarif = JSON.parse(toSarif(result))
    expect(sarif.version).toBe('2.1.0')
    const run = sarif.runs[0]
    expect(run.tool.driver.rules.map((r: { id: string }) => r.id)).toEqual([
      'clone/type-1',
      'clone/type-2',
      'clone/type-3',
    ])
    expect(run.results).toHaveLength(result.pairs.length)
    const first = run.results[0]
    const pair = result.pairs[0]!
    expect(first.ruleId).toBe(`clone/type-${pair.type}`)
    expect(first.locations[0].physicalLocation.region.startColumn).toBe(pair.a.start.column + 1)
    expect(first.relatedLocations[0].physicalLocation.artifactLocation.uri).toBe(pair.b.file)
    expect(first.partialFingerprints['cloneFingerprint/v1']).toMatch(/^[0-9a-f]{16}$/)
    expect(run.invocations[0].toolExecutionNotifications).toHaveLength(1)
  })
})
