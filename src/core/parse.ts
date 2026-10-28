import { type ParserPlugin, parse } from '@babel/parser'
import type * as t from '@babel/types'

function pluginsFor(filename: string): ParserPlugin[] {
  const ext = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
  if (ext === 'ts' || ext === 'mts' || ext === 'cts') return ['typescript', 'decorators-legacy']
  if (ext === 'tsx') return ['typescript', 'jsx', 'decorators-legacy']
  // Plain .js files often contain JSX in React projects.
  return ['jsx', 'decorators-legacy']
}

export interface ParsedFile {
  ast: t.File
  /** Recoverable syntax errors. The AST is still usable. */
  warnings: string[]
}

/** Parses JS/JSX/TS/TSX. Throws only on unrecoverable syntax errors. */
export function parseSource(code: string, filename = 'input.tsx'): ParsedFile {
  const ast = parse(code, {
    sourceType: 'unambiguous',
    sourceFilename: filename,
    errorRecovery: true,
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    plugins: pluginsFor(filename),
  })
  const warnings = (ast.errors ?? []).map((e) => e.reasonCode ?? String(e))
  return { ast, warnings }
}
