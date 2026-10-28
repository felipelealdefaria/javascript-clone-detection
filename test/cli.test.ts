import { execFile } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const cli = path.join(import.meta.dirname, '..', 'src', 'cli.ts')
const tsx = path.join(import.meta.dirname, '..', 'node_modules', '.bin', 'tsx')

// A copy of the fixture project, plus folders that must be ignored by default.
const project = mkdtempSync(path.join(tmpdir(), 'jscd-'))
cpSync(path.join(import.meta.dirname, 'fixtures', 'project'), project, { recursive: true })
for (const dir of ['node_modules/pkg', 'dist']) {
  mkdirSync(path.join(project, dir), { recursive: true })
  cpSync(path.join(project, 'src/utils/format.js'), path.join(project, dir, 'index.js'))
}
writeFileSync(
  path.join(project, 'src/utils/format.min.js'),
  readFileSync(path.join(project, 'src/utils/format.js')),
)

async function jscd(...args: string[]) {
  try {
    const { stdout, stderr } = await run(tsx, [cli, ...args], {
      cwd: project,
      env: { ...process.env, NO_COLOR: '1' },
    })
    return { code: 0, stdout, stderr }
  } catch (error) {
    const e = error as { code: number; stdout: string; stderr: string }
    return { code: e.code, stdout: e.stdout, stderr: e.stderr }
  }
}

describe('cli', { timeout: 30_000 }, () => {
  it('scans the current directory by default and skips ignored folders', async () => {
    const { code, stdout } = await jscd('--format', 'json')
    expect(code).toBe(0)
    const files = new Set(
      JSON.parse(stdout).pairs.flatMap((p: { a: { file: string }; b: { file: string } }) => [
        p.a.file,
        p.b.file,
      ]),
    )
    expect([...files].some((f) => /node_modules|dist|\.min\.js/.test(f as string))).toBe(false)
    expect(files.size).toBeGreaterThan(0)
  })

  it('supports --ignore', async () => {
    const { stdout } = await jscd('src', '--ignore', '**/components/**', '--format', 'json')
    const names = JSON.parse(stdout).pairs.map((p: { a: { name: string } }) => p.a.name)
    expect(names).not.toContain('UserCard')
    expect(names).not.toContain('TeamMemberCard')
  })

  it('writes reports to a file', async () => {
    const { code, stderr } = await jscd('src', '-f', 'sarif', '-o', 'out.sarif')
    expect(code).toBe(0)
    expect(stderr).toMatch(/Wrote \d+ clone pairs to out.sarif/)
    expect(JSON.parse(readFileSync(path.join(project, 'out.sarif'), 'utf8')).version).toBe('2.1.0')
  })

  it('exits 1 with --fail when clones exist, 0 otherwise', async () => {
    expect((await jscd('src', '--fail')).code).toBe(1)
    expect((await jscd('src/utils/broken.js', '--fail')).code).toBe(0)
  })

  it('exits 2 on bad input', async () => {
    expect((await jscd('--threshold', 'abc')).code).toBe(2)
    expect((await jscd('--threshold', '0')).code).toBe(2)
    expect((await jscd('--format', 'xml')).code).toBe(2)
    expect((await jscd('missing-dir')).stderr).toContain('Path not found')
    expect((await jscd('--nope')).code).toBe(2)
  })

  it('prints help and version', async () => {
    expect((await jscd('--help')).stdout).toContain('Usage')
    expect((await jscd('--version')).stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
