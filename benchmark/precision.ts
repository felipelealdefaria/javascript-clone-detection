/**
 * Precision on real, unmodified code. Mutation benchmarks measure recall well but say little
 * about false positives, so a seeded sample of what jscd reports on the corpus packages is
 * labeled by hand in `precision-labels.json`. The sample with full code is written to
 * `results/precision-sample.md` so anyone can audit the labels.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { type ClonePair, detectClones, type SourceFile } from '../src/core/index.js'
import { fetchPackages, PACKAGES, packageFiles } from './corpus.js'
import { Rng } from './rng.js'

const LABELS_FILE = path.join(import.meta.dirname, 'precision-labels.json')
const SAMPLE_FILE = path.join(import.meta.dirname, 'results', 'precision-sample.md')
const PER_TYPE = 16
/** Type-3 is sampled evenly across similarity bands, so borderline matches get checked too. */
const TYPE3_BANDS = [0.8, 0.85, 0.9, 0.95, 1.0001]

type Label = 'clone' | 'not-clone'
interface LabelEntry {
  label: Label
  note?: string
}

/** Lower bound of the 95% Wilson score interval for k successes in n trials. */
export function wilsonLower(k: number, n: number, z = 1.96): number {
  if (n === 0) return 0
  const p = k / n
  const denom = 1 + (z * z) / n
  const centre = p + (z * z) / (2 * n)
  const margin = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return (centre - margin) / denom
}

export const sampleKey = (p: ClonePair) =>
  `${p.a.file}:${p.a.start.line}-${p.a.end.line}|${p.b.file}:${p.b.start.line}-${p.b.end.line}`

export function precisionOnRealCode(): { json: unknown; markdown: string } {
  const dirs = fetchPackages()
  const files: SourceFile[] = []
  for (const pkg of PACKAGES) {
    const dir = dirs[pkg.name] as string
    for (const file of packageFiles(dir, pkg.include)) {
      files.push({ path: `${pkg.name}/${file}`, code: readFileSync(path.join(dir, file), 'utf8') })
    }
  }
  const code = new Map(files.map((f) => [f.path, f.code.split('\n')]))
  const result = detectClones(files)

  // At most one pair per clone class: a class of k copies has k² pairs and would dominate.
  const classOf = new Map<string, number>()
  result.classes.forEach((cls, i) => {
    for (const m of cls.members) classOf.set(`${m.file}:${m.start.line}:${m.start.column}`, i)
  })
  const classKey = (p: ClonePair) =>
    classOf.get(`${p.a.file}:${p.a.start.line}:${p.a.start.column}`)
  const rng = new Rng(7)
  const onePerClass = (pairs: ClonePair[], n: number) => {
    const seen = new Set<number | undefined>()
    return rng
      .shuffle(pairs)
      .filter((p) => !seen.has(classKey(p)) && seen.add(classKey(p)))
      .slice(0, n)
  }
  const byType = (type: number) => result.pairs.filter((p) => p.type === type)
  const perBand = PER_TYPE / (TYPE3_BANDS.length - 1)
  const sample = [
    ...onePerClass(byType(1), PER_TYPE),
    ...onePerClass(byType(2), PER_TYPE),
    ...TYPE3_BANDS.slice(0, -1).flatMap((low, i) =>
      onePerClass(
        byType(3).filter(
          (p) => p.similarity >= low && p.similarity < (TYPE3_BANDS[i + 1] as number),
        ),
        perBand,
      ),
    ),
  ]

  const entries: Record<string, LabelEntry> = existsSync(LABELS_FILE)
    ? JSON.parse(readFileSync(LABELS_FILE, 'utf8')).labels
    : {}
  const labels = Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, v.label]))

  const slice = (ref: ClonePair['a']) =>
    (code.get(ref.file) ?? []).slice(ref.start.line - 1, ref.end.line).join('\n')
  writeFileSync(
    SAMPLE_FILE,
    [
      '# Precision sample',
      '',
      `${sample.length} pairs sampled (seed 7) from the ${result.pairs.length} that jscd reports on the unmodified corpus packages: up to ${PER_TYPE} per type, at most one per clone class, Type-3 spread evenly over similarity bands. Labels live in [precision-labels.json](../precision-labels.json).`,
      '',
      ...sample.flatMap((p, i) => [
        `## ${i + 1}. Type-${p.type}${p.type === 3 ? ` · ${(p.similarity * 100).toFixed(0)}%` : ''} · ${labels[sampleKey(p)] ?? 'unlabeled'}`,
        '',
        `\`${sampleKey(p)}\``,
        '',
        ...(entries[sampleKey(p)]?.note ? [`> ${entries[sampleKey(p)]?.note}`, ''] : []),
        '```js',
        slice(p.a),
        '```',
        '',
        '```js',
        slice(p.b),
        '```',
        '',
      ]),
    ].join('\n'),
  )

  const stats = ([1, 2, 3] as const).map((type) => {
    const pairs = sample.filter((p) => p.type === type)
    const labeled = pairs.filter((p) => labels[sampleKey(p)])
    const clones = labeled.filter((p) => labels[sampleKey(p)] === 'clone').length
    return {
      type,
      reported: result.pairs.filter((p) => p.type === type).length,
      sampled: pairs.length,
      labeled: labeled.length,
      clones,
    }
  })
  const unlabeled = sample.filter((p) => !labels[sampleKey(p)]).length
  if (unlabeled > 0) console.warn(`${unlabeled} sampled pairs are unlabeled. See ${SAMPLE_FILE}.`)

  const row = (name: string, reported: number, labeled: number, clones: number) =>
    `| ${name} | ${reported} | ${labeled} | ${labeled === 0 ? '–' : `${clones}/${labeled}`} | ${labeled === 0 ? '–' : `≥ ${(wilsonLower(clones, labeled) * 100).toFixed(0)}%`} |`
  const total = stats.reduce(
    (acc, t) => ({ labeled: acc.labeled + t.labeled, clones: acc.clones + t.clones }),
    { labeled: 0, clones: 0 },
  )
  const rows = [
    ...stats.map((t) => row(`Type-${t.type}`, t.reported, t.labeled, t.clones)),
    row('**All**', result.pairs.length, total.labeled, total.clones),
  ]
  const markdown = [
    '## Precision on real code (manual)',
    '',
    `jscd with defaults on the ${files.length} unmodified corpus files reports ${result.pairs.length} pairs in ${result.classes.length} clone classes. A seeded sample (one pair per class, Type-3 spread over similarity bands), labeled by inspection ([sample with code](precision-sample.md)):`,
    '',
    '| Type | Pairs reported | Labeled | Real clones | Precision, 95% lower bound |',
    '|---|---:|---:|---:|---:|',
    ...rows,
    '',
  ].join('\n')
  return { json: { files: files.length, pairs: result.pairs.length, byType: stats }, markdown }
}
