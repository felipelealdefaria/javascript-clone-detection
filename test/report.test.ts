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

  it('text: lists clone classes and a summary', () => {
    const text = toText(result)
    expect(text).toContain('#1 Type-2 · 2 copies')
    expect(text).toContain('src/components/TeamMemberCard.tsx')
    expect(text).toContain('2 clone classes from 2 clone pairs (0 Type-1, 1 Type-2, 1 Type-3).')
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
    const members = result.classes.flatMap((c) => c.members)
    expect(run.results).toHaveLength(members.length)
    const [first, second] = run.results
    const cls = result.classes[0]!
    expect(first.ruleId).toBe(`clone/type-${cls.type}`)
    expect(first.locations[0].physicalLocation.region.startColumn).toBe(
      cls.members[0]!.start.column + 1,
    )
    expect(first.relatedLocations[0].physicalLocation.artifactLocation.uri).toBe(
      cls.members[1]!.file,
    )
    expect(first.message.text).toContain('](1)')
    const fingerprints = run.results.map(
      (r: { partialFingerprints: Record<string, string> }) =>
        r.partialFingerprints['cloneFingerprint/v1'],
    )
    expect(fingerprints.every((f: string) => /^[0-9a-f]{16}$/.test(f))).toBe(true)
    expect(new Set(fingerprints).size).toBe(fingerprints.length)
    expect(second.locations[0].physicalLocation.artifactLocation.uri).toBe(cls.members[1]!.file)
    expect(run.invocations[0].toolExecutionNotifications).toHaveLength(1)
  })
})
