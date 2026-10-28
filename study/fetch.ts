import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import type { Project } from './projects.js'

export const CACHE_DIR = path.join(import.meta.dirname, '.cache')

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, stdio: ['ignore', 'ignore', 'pipe'] })

/**
 * Checks out only the scanned folders of one commit (shallow, sparse, blobs on demand).
 * The code is only ever parsed, never installed or executed.
 */
export function fetchProject(project: Project): string {
  const dir = path.join(CACHE_DIR, `${project.id}@${project.sha.slice(0, 12)}`)
  if (existsSync(path.join(dir, '.done'))) return dir
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  git(dir, 'init', '-q')
  git(dir, 'remote', 'add', 'origin', `https://github.com/${project.repo}.git`)
  if (!project.dirs.includes('.')) {
    git(dir, 'sparse-checkout', 'set', '--cone', ...project.dirs)
  }
  git(dir, 'fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', project.sha)
  git(dir, 'checkout', '-q', 'FETCH_HEAD')
  execFileSync('touch', [path.join(dir, '.done')])
  return dir
}
