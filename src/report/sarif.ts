import type { ClonePair, CloneType, DetectionResult, UnitRef } from '../core/types.js'
import { VERSION } from '../version.js'

const REPO = 'https://github.com/felipelealdefaria/javascript-clone-detection'

const RULES: Record<CloneType, { name: string; short: string; full: string }> = {
  1: {
    name: 'ExactClone',
    short: 'Type-1 clone: identical code',
    full: 'Two units are identical apart from whitespace, layout, comments and function syntax (arrow vs. regular).',
  },
  2: {
    name: 'RenamedClone',
    short: 'Type-2 clone: identical after renaming',
    full: 'Two units have the same structure; only identifier names and literal values differ.',
  },
  3: {
    name: 'NearMissClone',
    short: 'Type-3 clone: near-miss copy',
    full: 'Two units share most of their structure; statements were added, removed or changed.',
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

function result(pair: ClonePair) {
  const where = `${pair.b.file}:${pair.b.start.line}-${pair.b.end.line}`
  const score = pair.type === 3 ? `, similarity ${pair.similarity.toFixed(2)}` : ''
  return {
    ruleId: ruleId(pair.type),
    ruleIndex: pair.type - 1,
    level: 'warning',
    message: {
      text: `\`${pair.a.name}\` is a Type-${pair.type} clone of [\`${pair.b.name}\`](1) (${where}${score}).`,
    },
    locations: [location(pair.a)],
    relatedLocations: [{ id: 1, ...location(pair.b), message: { text: pair.b.name } }],
    partialFingerprints: { 'cloneFingerprint/v1': pair.fingerprint },
    properties: { similarity: Number(pair.similarity.toFixed(4)) },
  }
}

/** SARIF 2.1.0, ready for GitHub code scanning (`github/codeql-action/upload-sarif`). */
export function toSarif(result_: DetectionResult): string {
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
        results: result_.pairs.map(result),
        invocations: [
          {
            executionSuccessful: true,
            toolExecutionNotifications: result_.errors.map((e) => ({
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
