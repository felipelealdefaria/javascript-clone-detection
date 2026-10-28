import { hash64 } from '../core/detect.js'
import type { CloneClass, CloneType, DetectionResult, UnitRef } from '../core/types.js'
import { VERSION } from '../version.js'

const REPO = 'https://github.com/felipelealdefaria/javascript-clone-detection'

/** Other copies linked from each result. Code scanning UIs get noisy beyond this. */
const MAX_RELATED = 10

const RULES: Record<CloneType, { name: string; short: string; full: string }> = {
  1: {
    name: 'ExactClone',
    short: 'Type-1 clone: identical code',
    full: 'Units are identical apart from whitespace, layout, comments and function syntax (arrow vs. regular).',
  },
  2: {
    name: 'RenamedClone',
    short: 'Type-2 clone: identical after renaming',
    full: 'Units have the same structure; only identifier names and literal values differ.',
  },
  3: {
    name: 'NearMissClone',
    short: 'Type-3 clone: near-miss copy',
    full: 'Units share most of their structure; statements were added, removed or changed.',
  },
}

const ruleId = (type: CloneType) => `clone/type-${type}`

function location(ref: UnitRef) {
  return {
    physicalLocation: {
      artifactLocation: { uri: encodeURI(ref.file), uriBaseId: '%SRCROOT%' },
      // SARIF columns are 1-based; Babel's are 0-based.
      region: {
        startLine: ref.start.line,
        startColumn: ref.start.column + 1,
        endLine: ref.end.line,
        endColumn: ref.end.column + 1,
      },
    },
  }
}

/** One result per class member, linking to the other copies. */
function results(cls: CloneClass) {
  return cls.members.map((member) => {
    const others = cls.members.filter((m) => m !== member)
    const related = others.slice(0, MAX_RELATED)
    const links = related.map((m, i) => `[\`${m.name}\`](${i + 1})`).join(', ')
    const more = others.length > related.length ? ` and ${others.length - related.length} more` : ''
    const score = cls.type === 3 ? ` (≥ ${Math.floor(cls.similarity * 100)}% similar)` : ''
    return {
      ruleId: ruleId(cls.type),
      ruleIndex: cls.type - 1,
      level: 'warning',
      message: {
        text: `\`${member.name}\` is duplicated${score}: ${links}${more}.`,
      },
      locations: [location(member)],
      relatedLocations: related.map((m, i) => ({
        id: i + 1,
        ...location(m),
        message: { text: `${m.name} (${m.file}:${m.start.line})` },
      })),
      // Location-independent, so alerts survive unrelated edits above the unit.
      partialFingerprints: { 'cloneFingerprint/v1': hash64(`${member.file}|${member.shape}`) },
      properties: { copies: cls.members.length, similarity: Number(cls.similarity.toFixed(4)) },
    }
  })
}

/** SARIF 2.1.0, ready for GitHub code scanning (`github/codeql-action/upload-sarif`). */
export function toSarif(result: DetectionResult): string {
  const sarif = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'javascript-clone-detection',
            semanticVersion: VERSION,
            informationUri: REPO,
            rules: ([1, 2, 3] as const).map((type) => ({
              id: ruleId(type),
              name: RULES[type].name,
              shortDescription: { text: RULES[type].short },
              fullDescription: { text: RULES[type].full },
              helpUri: `${REPO}#clone-types`,
              defaultConfiguration: { level: 'warning' },
              properties: { tags: ['maintainability', 'duplication'] },
            })),
          },
        },
        results: result.classes.flatMap(results),
        invocations: [
          {
            executionSuccessful: true,
            toolExecutionNotifications: result.errors.map((e) => ({
              level: 'warning',
              message: { text: `Could not parse: ${e.message}` },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: encodeURI(e.file), uriBaseId: '%SRCROOT%' },
                  },
                },
              ],
            })),
          },
        ],
      },
    ],
  }
  return `${JSON.stringify(sarif, null, 2)}\n`
}
