import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { detectClones } from '../src/core/index.js'

const ROOT = path.join(import.meta.dirname, '..')

export interface ToolRun {
  tool: string
  /** Detected cross-file pairs, as sorted `fileA|fileB` keys relative to the dataset root. */
  pairs: Set<string>
  durationMs: number
}

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

export function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((f) => f.split(path.sep).join('/'))
    .filter((f) => /\.(jsx?|tsx?)$/.test(f))
    .sort()
}

export function runJscd(dir: string, name = 'jscd', options = {}): ToolRun {
  const files = listFiles(dir).map((f) => ({
    path: f,
    code: readFileSync(path.join(dir, f), 'utf8'),
  }))
  const started = performance.now()
  const result = detectClones(files, options)
  const durationMs = performance.now() - started
  const pairs = new Set<string>()
  for (const p of result.pairs) if (p.a.file !== p.b.file) pairs.add(pairKey(p.a.file, p.b.file))
  return { tool: name, pairs, durationMs }
}

interface JscpdReport {
  duplicates: { firstFile: { name: string }; secondFile: { name: string } }[]
}

export function runJscpd(dir: string, name: string, args: string[] = []): ToolRun {
  const out = mkdtempSync(path.join(tmpdir(), 'jscpd-'))
  const bin = path.join(ROOT, 'node_modules', '.bin', 'jscpd')
  const started = performance.now()
  // The dataset lives in a git-ignored folder, so .gitignore handling must be off.
  execFileSync(bin, [dir, '--reporters', 'json', '--output', out, '--no-gitignore', ...args], {
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  const durationMs = performance.now() - started
  const report = JSON.parse(
    readFileSync(path.join(out, 'jscpd-report.json'), 'utf8'),
  ) as JscpdReport
  rmSync(out, { recursive: true, force: true })

  // jscpd reports paths relative to the scanned directory, or absolute: normalize both.
  const rel = (f: string) =>
    (path.isAbsolute(f) ? path.relative(dir, f) : f).split(path.sep).join('/')
  const pairs = new Set<string>()
  for (const d of report.duplicates) {
    const a = rel(d.firstFile.name)
    const b = rel(d.secondFile.name)
    if (a !== b) pairs.add(pairKey(a, b))
  }
  return { tool: name, pairs, durationMs }
}

export function jscpdVersion(): string {
  return execFileSync(path.join(ROOT, 'node_modules', '.bin', 'jscpd'), ['--version'], {
    encoding: 'utf8',
  })
    .trim()
    .replace(/^jscpd\s+/, '')
}

export const SWEEP = [0.6, 0.7, 0.8, 0.9]

/** Both Type-3 detectors across thresholds. Their scores differ, so one cut-off alone is unfair. */
export function runSweep(dir: string): { threshold: number; runs: ToolRun[] }[] {
  return SWEEP.map((threshold) => ({
    threshold,
    runs: [
      runJscd(dir, 'jscd', { threshold }),
      runJscpd(dir, 'jscpd (structural)', [
        '--ignore-identifiers',
        '--ignore-literals',
        '--similarity',
        String(threshold),
      ]),
    ],
  }))
}

/** Every tool configuration the benchmark compares. */
export function runAll(dir: string): ToolRun[] {
  return [
    runJscd(dir, 'jscd (defaults)'),
    runJscpd(dir, 'jscpd (defaults)'),
    runJscpd(dir, 'jscpd (structural)', [
      '--ignore-identifiers',
      '--ignore-literals',
      '--similarity',
      '0.8',
    ]),
  ]
}
