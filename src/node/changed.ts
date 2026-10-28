import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import path from 'node:path'
import type { DetectionResult, UnitRef } from '../core/types.js'

/** Changed line ranges per absolute file path; `'all'` for new, untracked files. */
export type ChangedLines = Map<string, [number, number][] | 'all'>

function git(args: string[], cwd: string): string {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 256 * 1024 * 1024,
    })
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr?.trim()
    throw new Error(`git ${args[0]} failed${stderr ? `: ${stderr}` : ''}`)
  }
}

/**
 * Lines changed in the working tree (committed, staged or not) since the merge-base with `ref`,
 * plus untracked files. Same view as a pull request diff against `ref`.
 */
export function changedLines(ref: string, cwd: string): ChangedLines {
  const root = git(['rev-parse', '--show-toplevel'], cwd).trim()
  const diff = git(
    ['diff', '--merge-base', ref, '--unified=0', '--no-color', '--no-ext-diff', '--no-renames'],
    cwd,
  )

  const changed: ChangedLines = new Map()
  let current: [number, number][] | null = null
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      const target = line.slice(4)
      if (target === '/dev/null') {
        current = null
      } else {
        current = []
        changed.set(path.join(root, target.replace(/^b\//, '')), current)
      }
      continue
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line)
    if (hunk && current) {
      const start = Number(hunk[1])
      const count = hunk[2] === undefined ? 1 : Number(hunk[2])
      // A pure deletion has count 0: it touches the lines around where the code was removed.
      current.push(count === 0 ? [Math.max(start, 1), start + 1] : [start, start + count - 1])
    }
  }

  for (const file of git(['ls-files', '--others', '--exclude-standard', '-z'], root).split('\0')) {
    if (file) changed.set(path.join(root, file), 'all')
  }
  return changed
}

function touches(ref: UnitRef, root: string, changed: ChangedLines): boolean {
  const ranges = changed.get(path.resolve(root, ref.file))
  if (!ranges) return false
  if (ranges === 'all') return true
  return ranges.some(([from, to]) => from <= ref.end.line && to >= ref.start.line)
}

/** Keeps the clone classes and pairs in which at least one copy overlaps a changed line. */
export function onlyChanged(
  result: DetectionResult,
  changed: ChangedLines,
  cwd: string,
): DetectionResult {
  // git reports real paths; the scan directory may sit behind a symlink (e.g. /var on macOS).
  const root = realpathSync(cwd)
  const hit = (ref: UnitRef) => touches(ref, root, changed)
  return {
    ...result,
    pairs: result.pairs.filter((p) => hit(p.a) || hit(p.b)),
    classes: result.classes.filter((c) => c.members.some(hit)),
  }
}
