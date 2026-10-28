/**
 * Empirical study: how much code is cloned in real JavaScript and React projects?
 *
 *   npm run study            fetch (once) and analyze every project
 *   npm run study -- <id>    only some projects
 *
 * Writes study/results/{results.json,results.md,sample.md}.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Rng } from '../benchmark/rng.js'
import {
  type CloneClass,
  type ClonePair,
  DEFAULT_IGNORE,
  type DetectionResult,
  detectClonesInPaths,
  type UnitRef,
} from '../src/index.js'
import { fetchProject } from './fetch.js'
import { PROJECTS, type Project } from './projects.js'

const RESULTS_DIR = path.join(import.meta.dirname, 'results')
const LABELS_FILE = path.join(import.meta.dirname, 'labels.json')
const ROOT = path.join(import.meta.dirname, '..')

/** Generated, vendored and translation files are not written by people. */
const IGNORE = [
  '**/__generated__/**',
  '**/generated/**',
  '**/*.generated.*',
  '**/*.gen.*',
  '**/vendor/**',
  '**/locales/**',
  '**/locale/**',
  '**/__snapshots__/**',
  '**/*.min.*',
]

/** The replication excludes tests: v0.6 compared top-level functions only, never test callbacks. */
const TEST_GLOBS = [
  '**/__test__/**',
  '**/__tests__/**',
  '**/test/**',
  '**/tests/**',
  '**/*.test.*',
  '**/*.spec.*',
]

type FileKind = 'production' | 'test' | 'story'
type UnitKind = 'component' | 'hook' | 'test' | 'story' | 'other'

const TEST_PATH =
  /(^|\/)(__tests?__|tests?|test[-_][\w-]+|spec|specs|__mocks__|mocks?|e2e|fixtures?|testing|test-utils)\/|[._](test|spec)\.[\w.]*[cm]?[jt]sx?$/i
const STORY_PATH = /\.(stories|story)\.[cm]?[jt]sx?$/i

export function fileKind(file: string): FileKind {
  if (STORY_PATH.test(file)) return 'story'
  if (TEST_PATH.test(file)) return 'test'
  return 'production'
}

/** Heuristic: components are capitalized functions/classes in JSX/TSX files; hooks start with `use`. */
export function unitKind(ref: UnitRef): UnitKind {
  const kind = fileKind(ref.file)
  if (kind !== 'production') return kind
  if (/^use[A-Z0-9]/.test(ref.name)) return 'hook'
  if (/^[A-Z]/.test(ref.name) && /\.[jt]sx$/.test(ref.file)) return 'component'
  return 'other'
}

interface LabelEntry {
  label: 'clone' | 'not-clone'
  note?: string
}

interface ProjectResult {
  id: string
  repo: string
  sha: string
  date: string
  group: Project['group']
  thesis?: Project['thesis']
  files: Record<FileKind, number>
  loc: Record<FileKind, number>
  clonedLoc: Record<FileKind, number>
  units: number
  pairs: number
  pairsByType: [number, number, number]
  classes: number
  classesByType: [number, number, number]
  classesByKind: Record<UnitKind, number>
  largestClass: number
  parseErrors: number
  durationMs: number
  jscpd?: { percentage: number; durationMs: number }
  sample: Sample[]
  /** Replication only: v1 with no minimum size, like v0.6. */
  noMinimum?: { units: number; pairs: number; classes: number; sample: Sample[] }
}

interface Sample {
  key: string
  type: number
  similarity: number
  a: string
  b: string
}

const nonBlank = (text: string) => text.split('\n').filter((l) => l.trim()).length

function lineSets(classes: CloneClass[]): Map<string, Set<number>> {
  const lines = new Map<string, Set<number>>()
  for (const cls of classes) {
    for (const m of cls.members) {
      const set = lines.get(m.file) ?? new Set<number>()
      for (let l = m.start.line; l <= m.end.line; l++) set.add(l)
      lines.set(m.file, set)
    }
  }
  return lines
}

function majority<T extends string>(values: T[]): T {
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] as T
}

function runJscpd(cwd: string, dirs: string[]): ProjectResult['jscpd'] {
  const out = mkdtempSync(path.join(tmpdir(), 'jscpd-study-'))
  const started = performance.now()
  try {
    execFileSync(
      path.join(ROOT, 'node_modules', '.bin', 'jscpd'),
      [
        ...dirs,
        '--reporters',
        'json',
        '--output',
        out,
        '--no-gitignore',
        '--format',
        'javascript,typescript,jsx,tsx',
        '--ignore',
        [...DEFAULT_IGNORE, ...IGNORE].join(','),
      ],
      { cwd, stdio: ['ignore', 'ignore', 'ignore'], maxBuffer: 1 << 28 },
    )
    const report = JSON.parse(readFileSync(path.join(out, 'jscpd-report.json'), 'utf8'))
    return {
      percentage: Number(report.statistics.total.percentage),
      durationMs: Math.round(performance.now() - started),
    }
  } catch {
    return undefined
  } finally {
    rmSync(out, { recursive: true, force: true })
  }
}

const permalink = (p: Project, ref: UnitRef) =>
  `https://github.com/${p.repo}/blob/${p.sha}/${ref.file}#L${ref.start.line}-L${ref.end.line}`
const sampleKey = (p: Project, pair: ClonePair) =>
  `${p.id}:${pair.a.file}:${pair.a.start.line}|${pair.b.file}:${pair.b.start.line}`

async function analyze(project: Project): Promise<ProjectResult> {
  const cwd = fetchProject(project)
  const ignore = project.group === 'replication' ? [...IGNORE, ...TEST_GLOBS] : IGNORE
  const started = performance.now()
  const result: DetectionResult = await detectClonesInPaths(project.dirs, { cwd, ignore })
  const durationMs = Math.round(performance.now() - started)

  // Lines of code per file kind, and how many of them sit in a cloned unit.
  const { findSourceFiles } = await import('../src/index.js')
  const files = await findSourceFiles(project.dirs, { cwd, ignore })
  const cloned = lineSets(result.classes)
  const zero = () => ({ production: 0, test: 0, story: 0 })
  const fileCount = zero()
  const loc = zero()
  const clonedLoc = zero()
  for (const abs of files) {
    const rel = path.relative(cwd, abs).split(path.sep).join('/')
    const kind = fileKind(rel)
    const lines = readFileSync(abs, 'utf8').split('\n')
    fileCount[kind]++
    loc[kind] += nonBlank(lines.join('\n'))
    const set = cloned.get(rel)
    if (set) for (const l of set) if (lines[l - 1]?.trim()) clonedLoc[kind]++
  }

  const classesByKind: Record<UnitKind, number> = {
    component: 0,
    hook: 0,
    test: 0,
    story: 0,
    other: 0,
  }
  for (const cls of result.classes) classesByKind[majority(cls.members.map(unitKind))]++

  // Precision sample: one pair per clone class, seeded. The thesis labeled every candidate;
  // here the replication projects get up to 12 pairs each and the React apps 3.
  const sample = samplePairs(project, result, project.group === 'replication' ? 12 : 3)

  // v0.6 had no minimum size. Running v1 the same way makes the replication like-for-like.
  let noMinimum: ProjectResult['noMinimum']
  if (project.group === 'replication') {
    const loose = await detectClonesInPaths(project.dirs, { cwd, ignore, minTokens: 0 })
    noMinimum = {
      units: loose.units,
      pairs: loose.pairs.length,
      classes: loose.classes.length,
      sample: samplePairs(project, loose, 12),
    }
  }

  const byType = (items: { type: number }[]) =>
    [1, 2, 3].map((t) => items.filter((x) => x.type === t).length) as [number, number, number]

  return {
    id: project.id,
    repo: project.repo,
    sha: project.sha,
    date: project.date,
    group: project.group,
    thesis: project.thesis,
    files: fileCount,
    loc,
    clonedLoc,
    units: result.units,
    pairs: result.pairs.length,
    pairsByType: byType(result.pairs),
    classes: result.classes.length,
    classesByType: byType(result.classes),
    classesByKind,
    largestClass: Math.max(0, ...result.classes.map((c) => c.members.length)),
    parseErrors: result.errors.length,
    durationMs,
    jscpd: project.group === 'react' ? runJscpd(cwd, project.dirs) : undefined,
    sample,
    noMinimum,
  }
}

function samplePairs(project: Project, result: DetectionResult, n: number): Sample[] {
  const classOf = new Map<string, number>()
  result.classes.forEach((cls, i) => {
    for (const m of cls.members) classOf.set(`${m.file}:${m.start.line}:${m.start.column}`, i)
  })
  const seen = new Set<number | undefined>()
  return new Rng(2021)
    .shuffle(result.pairs)
    .filter((p) => {
      const k = classOf.get(`${p.a.file}:${p.a.start.line}:${p.a.start.column}`)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, n)
    .map((p) => ({
      key: sampleKey(project, p),
      type: p.type,
      similarity: p.similarity,
      a: permalink(project, p.a),
      b: permalink(project, p.b),
    }))
}

const pct = (n: number, d: number) => (d === 0 ? '–' : `${((n / d) * 100).toFixed(1)}%`)
const int = (n: number) => n.toLocaleString('en-US')
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? (s[m] as number) : ((s[m - 1] as number) + (s[m] as number)) / 2
}

function markdown(results: ProjectResult[], labels: Record<string, LabelEntry>): string {
  const precision = (r: { sample: Sample[] }) => {
    const labeled = r.sample.filter((s) => labels[s.key])
    const clones = labeled.filter((s) => labels[s.key]?.label === 'clone').length
    return labeled.length === 0 ? '–' : `${clones}/${labeled.length}`
  }
  const replication = results.filter((r) => r.group === 'replication')
  const react = results.filter((r) => r.group === 'react')
  const lines: string[] = ['# Study results', '']

  if (replication.length > 0) {
    lines.push(
      '## Part 1: replication of the 2021 thesis',
      '',
      'Same projects and folders as the thesis, at the last commit before October 2021, threshold 0.8. Test files are excluded (v0.6 only saw top-level functions, so it never compared test callbacks).',
      '',
      '| Project | Version | Units compared | Pairs reported | Clone classes | Real clones |',
      '|---|---|---:|---:|---:|---:|',
      ...replication.flatMap((r) => {
        const t = r.thesis
        const link = `[${r.repo}](https://github.com/${r.repo}/tree/${r.sha})`
        return [
          `| ${link} | v0.6 (thesis, all candidates labeled) | ${t?.functions ?? '–'} | ${t?.candidates ?? '–'} | – | ${t ? `${t.clones}/${t.candidates} (${pct(t.clones, t.candidates)})` : '–'} |`,
          r.noMinimum
            ? `| | v1, no size minimum (like v0.6) | ${int(r.noMinimum.units)} | ${int(r.noMinimum.pairs)} | ${int(r.noMinimum.classes)} | ${precision(r.noMinimum)} sampled |`
            : '',
          `| | v1, defaults (≥ 50 tokens) | ${int(r.units)} | ${int(r.pairs)} | ${int(r.classes)} | ${precision(r)} sampled |`,
        ].filter(Boolean)
      }),
      '',
    )
  }

  if (react.length > 0) {
    const coverage = (r: ProjectResult) =>
      r.loc.production ? r.clonedLoc.production / r.loc.production : 0
    lines.push(
      '## Part 2: React applications',
      '',
      "**Cloned code** = share of non-blank lines inside a function, method or class that has at least one clone (jscd defaults: Type-1–3, threshold 0.8, ≥ 50 tokens). jscpd's figure is its own duplicated-lines percentage over all scanned files, for reference.",
      '',
      '| App | Files | Lines | Cloned code | Cloned test code | jscpd dup. | Clone classes (T1/T2/T3) | Largest class | Precision (sample) | Time |',
      '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
      ...react.map(
        (r) =>
          `| [${r.repo}](https://github.com/${r.repo}/tree/${r.sha}) | ${int(r.files.production + r.files.test + r.files.story)} | ${int(r.loc.production + r.loc.test + r.loc.story)} | **${pct(r.clonedLoc.production, r.loc.production)}** | ${pct(r.clonedLoc.test, r.loc.test)} | ${r.jscpd ? `${r.jscpd.percentage.toFixed(1)}%` : '–'} | ${int(r.classes)} (${r.classesByType.join('/')}) | ${r.largestClass} | ${precision(r)} | ${(r.durationMs / 1000).toFixed(1)} s |`,
      ),
      '',
      `Median cloned production code: **${(median(react.map(coverage)) * 100).toFixed(1)}%** (range ${(Math.min(...react.map(coverage)) * 100).toFixed(1)}–${(Math.max(...react.map(coverage)) * 100).toFixed(1)}%).`,
      '',
      '### What gets cloned',
      '',
      'Clone classes by the kind of unit most of their copies are (heuristic: hooks start with `use`, components are capitalized units in `.jsx`/`.tsx` files, tests and stories by file path):',
      '',
      '| App | Components | Hooks | Other production | Tests | Stories |',
      '|---|---:|---:|---:|---:|---:|',
      ...react.map((r) => {
        const k = r.classesByKind
        const total = r.classes
        return `| ${r.id} | ${pct(k.component, total)} | ${pct(k.hook, total)} | ${pct(k.other, total)} | ${pct(k.test, total)} | ${pct(k.story, total)} |`
      }),
      '',
    )
    const sum = (f: (r: ProjectResult) => number) => react.reduce((acc, r) => acc + f(r), 0)
    const all = sum((r) => r.classes)
    lines.push(
      `All apps together: ${int(all)} clone classes; components ${pct(
        sum((r) => r.classesByKind.component),
        all,
      )}, hooks ${pct(
        sum((r) => r.classesByKind.hook),
        all,
      )}, other production ${pct(
        sum((r) => r.classesByKind.other),
        all,
      )}, tests ${pct(
        sum((r) => r.classesByKind.test),
        all,
      )}, stories ${pct(
        sum((r) => r.classesByKind.story),
        all,
      )}. Type-1/2/3 split of classes: ${[0, 1, 2]
        .map((i) =>
          pct(
            sum((r) => r.classesByType[i] as number),
            all,
          ),
        )
        .join(' / ')}.`,
      '',
    )
  }
  return lines.join('\n')
}

function sampleLine(s: Sample, i: number, label: LabelEntry | undefined): string {
  return `${i + 1}. Type-${s.type}${s.type === 3 ? ` (${(s.similarity * 100).toFixed(0)}%)` : ''} · [A](${s.a}) ↔ [B](${s.b}) · **${label?.label ?? 'unlabeled'}**${label?.note ? `: ${label.note}` : ''}`
}

function sampleMarkdown(results: ProjectResult[], labels: Record<string, LabelEntry>): string {
  return [
    '# Precision sample',
    '',
    'One pair per clone class, seeded. Links point to the pinned commits; no third-party code is copied here. Labels: [labels.json](../labels.json).',
    '',
    ...results.flatMap((r) => [
      `## ${r.repo}`,
      '',
      ...(r.noMinimum ? ['Defaults:', ''] : []),
      ...r.sample.map((s, i) => {
        const label = labels[s.key]
        return sampleLine(s, i, label)
      }),
      '',
      ...(r.noMinimum
        ? [
            'No size minimum:',
            '',
            ...r.noMinimum.sample.map((s, i) => sampleLine(s, i, labels[s.key])),
            '',
          ]
        : []),
    ]),
  ].join('\n')
}

async function main() {
  const only = new Set(process.argv.slice(2))
  const selected = PROJECTS.filter((p) => only.size === 0 || only.has(p.id))
  const labels: Record<string, LabelEntry> = existsSync(LABELS_FILE)
    ? JSON.parse(readFileSync(LABELS_FILE, 'utf8')).labels
    : {}

  const results: ProjectResult[] = []
  for (const project of selected) {
    process.stdout.write(`${project.repo}… `)
    const r = await analyze(project)
    results.push(r)
    console.log(
      `${int(r.units)} units, ${int(r.classes)} classes, cloned ${pct(r.clonedLoc.production, r.loc.production)} (${(r.durationMs / 1000).toFixed(1)} s)`,
    )
  }

  writeFileSync(path.join(RESULTS_DIR, 'results.json'), `${JSON.stringify(results, null, 2)}\n`)
  writeFileSync(path.join(RESULTS_DIR, 'results.md'), `${markdown(results, labels).trimEnd()}\n`)
  writeFileSync(
    path.join(RESULTS_DIR, 'sample.md'),
    `${sampleMarkdown(results, labels).trimEnd()}\n`,
  )
  const unlabeled = results
    .flatMap((r) => [...r.sample, ...(r.noMinimum?.sample ?? [])])
    .filter((s) => !labels[s.key]).length
  if (unlabeled > 0)
    console.warn(`${unlabeled} sampled pairs unlabeled (see study/results/sample.md).`)
}

await main()
