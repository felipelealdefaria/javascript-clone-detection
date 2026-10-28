import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { changedLines, detectClonesInPaths } from '../src/index.js'

const format = readFileSync(
  path.join(import.meta.dirname, 'fixtures/project/src/utils/format.js'),
  'utf8',
)

let repo: string
const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' })

// A repository whose main branch already has a clone pair (formatPrice / formatCost).
beforeEach(() => {
  repo = realpathSync(mkdtempSync(path.join(tmpdir(), 'jscd-git-')))
  git('init', '-q', '-b', 'main')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'Test')
  writeFileSync(path.join(repo, 'format.js'), format)
  writeFileSync(path.join(repo, 'other.js'), 'export function other(a) {\n  return a\n}\n')
  git('add', '.')
  git('commit', '-q', '-m', 'base')
  git('switch', '-q', '-c', 'feature')
})

const scan = (changedSince?: string) => detectClonesInPaths(['.'], { cwd: repo, changedSince })

describe('--changed', () => {
  it('reports nothing when the clones predate the branch', async () => {
    expect((await scan()).pairs.length).toBeGreaterThan(0)
    expect((await scan('main')).pairs).toEqual([])
  })

  it('reports a clone added in an untracked file', async () => {
    writeFileSync(path.join(repo, 'copy.js'), format.replaceAll('formatPrice', 'formatAmount'))
    const result = await scan('main')
    expect(result.pairs.length).toBeGreaterThan(0)
    expect(result.pairs.every((p) => p.a.file === 'copy.js' || p.b.file === 'copy.js')).toBe(true)
  })

  it('reports an existing clone when one copy is edited, committed or not', async () => {
    const edited = format.replace("if (total < 0) return 'negative'", "if (total < 0) return 'neg'")
    writeFileSync(path.join(repo, 'format.js'), edited)
    expect((await scan('main')).pairs.length).toBeGreaterThan(0)
    git('commit', '-q', '-am', 'edit')
    expect((await scan('main')).pairs.length).toBeGreaterThan(0)
  })

  it('ignores edits outside every copy', async () => {
    writeFileSync(path.join(repo, 'other.js'), 'export function other(a) {\n  return a + 1\n}\n')
    expect((await scan('main')).pairs).toEqual([])
  })

  it('maps hunks to line ranges, including deletions', () => {
    writeFileSync(path.join(repo, 'other.js'), 'export function other(a) {\n}\n')
    const ranges = changedLines('main', repo).get(path.join(repo, 'other.js'))
    expect(ranges).toEqual([[1, 2]])
  })

  it('fails clearly on an unknown ref', async () => {
    await expect(scan('no-such-branch')).rejects.toThrow(/git diff failed/)
  })
})
