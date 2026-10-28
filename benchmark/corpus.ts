import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type * as t from '@babel/types'
import { emitUnit, parseSource } from '../src/core/index.js'

export const CACHE_DIR = path.join(import.meta.dirname, '.cache')

/**
 * Real code the benchmark mutates. Pinned versions, MIT-licensed, downloaded with `npm pack`
 * (integrity-checked by npm) and only ever parsed, never executed.
 */
export const PACKAGES = [
  {
    name: 'lodash-es',
    version: '4.17.21',
    domain: 'js',
    include: (file: string) => /^[^/]+\.js$/.test(file),
  },
  {
    name: 'reactstrap',
    version: '9.2.3',
    domain: 'react',
    include: (file: string) => /^src\/[^/]+\.js$/.test(file),
  },
  {
    name: 'semantic-ui-react',
    version: '2.1.5',
    domain: 'react',
    include: (file: string) => /^src\/.+\.js$/.test(file) && !file.endsWith('index.js'),
  },
] as const

export type Domain = (typeof PACKAGES)[number]['domain']

export interface Candidate {
  /** `package/file.js:line` */
  source: string
  domain: Domain
  code: string
  tokens: number
  /** Normalized token stream; equal shapes are Type-1/2 clones of each other. */
  shape: string
  hasJsx: boolean
}

/** Downloads and extracts each package once. Returns `{ name: directory }`. */
export function fetchPackages(): Record<string, string> {
  mkdirSync(CACHE_DIR, { recursive: true })
  const dirs: Record<string, string> = {}
  for (const pkg of PACKAGES) {
    const dir = path.join(CACHE_DIR, `${pkg.name}@${pkg.version}`)
    if (!existsSync(dir)) {
      const out = execFileSync(
        'npm',
        [
          'pack',
          `${pkg.name}@${pkg.version}`,
          '--pack-destination',
          CACHE_DIR,
          '--json',
          '--ignore-scripts',
        ],
        { encoding: 'utf8' },
      )
      const tarball = path.join(CACHE_DIR, JSON.parse(out)[0].filename)
      mkdirSync(dir)
      execFileSync('tar', ['-xzf', tarball, '-C', dir, '--strip-components=1'])
    }
    dirs[pkg.name] = dir
  }
  return dirs
}

export function packageFiles(dir: string, include: (file: string) => boolean): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((f) => f.split(path.sep).join('/'))
    .filter(include)
    .sort()
}

const UNIT_TYPES = new Set(['FunctionDeclaration', 'ClassDeclaration'])

/** The function or class a top-level statement declares, if any. */
function declaredUnit(statement: t.Statement): t.Node | null {
  const node: t.Node =
    (statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration') &&
    statement.declaration
      ? statement.declaration
      : statement
  if (UNIT_TYPES.has(node.type)) return node
  if (node.type === 'VariableDeclaration' && node.declarations.length === 1) {
    const init = node.declarations[0]?.init
    if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
      return init
    }
  }
  return null
}

function containsJsx(code: string): boolean {
  return /<[A-Za-z][\w.]*[\s/>]/.test(code) && /\/>|<\/[A-Za-z]/.test(code)
}

/** Top-level functions and classes from the corpus packages, within a token-size window. */
export function collectCandidates(minTokens: number, maxTokens: number): Candidate[] {
  const dirs = fetchPackages()
  const candidates: Candidate[] = []
  for (const pkg of PACKAGES) {
    const dir = dirs[pkg.name] as string
    for (const file of packageFiles(dir, pkg.include)) {
      const code = readFileSync(path.join(dir, file), 'utf8')
      let ast: t.File
      try {
        const parsed = parseSource(code, file)
        if (parsed.warnings.length > 0) continue
        ast = parsed.ast
      } catch {
        continue
      }
      for (const statement of ast.program.body) {
        const unit = declaredUnit(statement)
        if (!unit || statement.start == null || statement.end == null) continue
        const norm = emitUnit(unit).norm
        const tokens = norm.length
        if (tokens < minTokens || tokens > maxTokens) continue
        const slice = code.slice(statement.start, statement.end)
        candidates.push({
          source: `${pkg.name}/${file}:${statement.loc?.start.line}`,
          domain: pkg.domain,
          code: slice,
          tokens,
          shape: norm.join(' '),
          hasJsx: containsJsx(slice),
        })
      }
    }
  }
  return candidates
}
