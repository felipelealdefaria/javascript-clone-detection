/**
 * Mutation operators that turn an original unit into a known clone of a given type, after
 * Roy & Cordy's mutation-based framework for evaluating clone detectors (2009).
 *
 * - Type-1: layout and comment changes (`formatting`).
 * - Type-2: Type-1 + consistent renaming of bindings + changed literal values.
 * - Type-3: Type-2 + 1–3 statement-level edits (insert, delete, modify).
 */
import generateModule from '@babel/generator'
import { parse } from '@babel/parser'
import traverseModule, { type NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import type { Rng } from './rng.js'

// biome-ignore lint/suspicious/noExplicitAny: interop with CJS/ESM default exports
const generate = ((generateModule as any).default ?? generateModule) as typeof generateModule
// biome-ignore lint/suspicious/noExplicitAny: interop with CJS/ESM default exports
const traverse = ((traverseModule as any).default ?? traverseModule) as typeof traverseModule

export type MutationType = 1 | 2 | 3

export interface Mutant {
  code: string
  /** Human-readable list of the operators applied. */
  operations: string[]
}

const WORDS = [
  'item',
  'value',
  'entry',
  'node',
  'data',
  'result',
  'target',
  'source',
  'record',
  'element',
  'config',
  'state',
  'field',
  'list',
  'index',
  'count',
  'total',
  'option',
  'payload',
  'handler',
  'current',
  'next',
  'prev',
  'temp',
  'output',
  'input',
  'key',
  'label',
  'model',
  'context',
]
const COMMENTS = [
  'TODO: revisit this',
  'copied from the other module',
  'keep in sync',
  'handle edge cases',
  'see issue tracker',
  'fast path',
  'normalize first',
  'legacy behavior',
]

export function parseCode(code: string): t.File {
  return parse(code, { sourceType: 'module', plugins: ['jsx', 'decorators-legacy'] })
}

function freshName(rng: Rng, used: Set<string>): string {
  for (;;) {
    const a = rng.pick(WORDS)
    const b = rng.pick(WORDS)
    const name = `${a}${b[0]?.toUpperCase()}${b.slice(1)}${rng.chance(0.3) ? rng.int(2, 9) : ''}`
    if (!used.has(name)) {
      used.add(name)
      return name
    }
  }
}

/** Type-2: rename most bindings declared in the unit, consistently, through Babel's scope tracker. */
function renameBindings(ast: t.File, rng: Rng, ops: string[]): void {
  const used = new Set<string>()
  let renamed = 0
  traverse(ast, {
    Scopable(path) {
      for (const name of Object.keys(path.scope.bindings)) {
        if (!rng.chance(0.8)) continue
        path.scope.rename(name, freshName(rng, used))
        renamed++
      }
    },
  })
  ops.push(`rename ${renamed} bindings`)
}

/** Type-2: change about half of the literal values. */
function changeLiterals(ast: t.File, rng: Rng, ops: string[]): void {
  let changed = 0
  traverse(ast, {
    StringLiteral(path) {
      if (path.parentPath.isImportDeclaration() || path.parentPath.isExportDeclaration()) return
      if (!rng.chance(0.5)) return
      path.node.value = `${rng.pick(WORDS)}-${rng.pick(WORDS)}`
      path.node.extra = undefined
      changed++
    },
    NumericLiteral(path) {
      if (!rng.chance(0.5)) return
      path.node.value = path.node.value + rng.int(1, 9)
      path.node.extra = undefined
      changed++
    },
    JSXText(path) {
      if (!path.node.value.trim() || !rng.chance(0.5)) return
      path.node.value = path.node.value.replace(
        /\S.*\S|\S/,
        `${rng.pick(WORDS)} ${rng.pick(WORDS)}`,
      )
      path.node.extra = undefined
      changed++
    },
  })
  ops.push(`change ${changed} literals`)
}

const OPERATOR_SWAPS: Record<string, string> = {
  '+': '-',
  '-': '+',
  '*': '/',
  '/': '*',
  '===': '!==',
  '!==': '===',
  '==': '!=',
  '!=': '==',
  '<': '<=',
  '<=': '<',
  '>': '>=',
  '>=': '>',
  '&&': '||',
  '||': '&&',
}

/** Type-3: one statement-level edit. Returns a description, or null if none applies. */
function edit(ast: t.File, rng: Rng): string | null {
  const blocks: NodePath<t.BlockStatement>[] = []
  const binaries: NodePath<t.BinaryExpression | t.LogicalExpression>[] = []
  const calls: NodePath<t.CallExpression>[] = []
  traverse(ast, {
    BlockStatement(path) {
      blocks.push(path)
    },
    'BinaryExpression|LogicalExpression'(path: NodePath<t.BinaryExpression | t.LogicalExpression>) {
      if (OPERATOR_SWAPS[path.node.operator]) binaries.push(path)
    },
    CallExpression(path) {
      calls.push(path)
    },
  })

  const options: (() => string | null)[] = []
  if (blocks.length > 0) {
    options.push(() => {
      const block = rng.pick(blocks)
      const names = Object.keys(block.scope.getAllBindings())
      const subject =
        names.length > 0 ? t.identifier(rng.pick(names)) : t.stringLiteral(rng.pick(WORDS))
      const statement = rng.pick([
        () =>
          t.expressionStatement(
            t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('log')), [
              subject,
            ]),
          ),
        () =>
          t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(`tmp${rng.int(1, 99)}`), subject),
          ]),
        () => t.ifStatement(t.unaryExpression('!', subject), t.returnStatement()),
      ])()
      const body = block.node.body
      body.splice(rng.int(0, body.length), 0, statement)
      return 'insert statement'
    })
  }
  const deletable = blocks.filter((b) => b.node.body.length >= 2)
  if (deletable.length > 0) {
    options.push(() => {
      const body = rng.pick(deletable).node.body
      body.splice(rng.int(0, body.length - 1), 1)
      return 'delete statement'
    })
  }
  if (binaries.length > 0) {
    options.push(() => {
      const node = rng.pick(binaries).node
      node.operator = OPERATOR_SWAPS[node.operator] as never
      return 'modify operator'
    })
  }
  if (calls.length > 0) {
    options.push(() => {
      rng.pick(calls).node.arguments.push(t.booleanLiteral(rng.chance(0.5)))
      return 'modify call arguments'
    })
  }
  return options.length > 0 ? rng.pick(options)() : null
}

/** Type-1: comments on some statements, a different quote style and indentation. */
function format(ast: t.File, rng: Rng, ops: string[]): string {
  let comments = 0
  traverse(ast, {
    Statement(path) {
      if (path.parentPath?.isProgram() || !rng.chance(0.2)) return
      t.addComment(path.node, 'leading', ` ${rng.pick(COMMENTS)}`, true)
      comments++
    },
  })
  const quotes = rng.chance(0.5) ? 'single' : 'double'
  let code = generate(ast, { comments: true, jsescOption: { quotes } }).code

  // Re-indent, unless a multi-line template literal would change its value.
  const indent = rng.pick(['  ', '    ', '\t'])
  if (indent !== '  ' && !/`[^`]*\n[^`]*`/.test(code)) {
    code = code.replace(/^((?: {2})+)/gm, (m) => indent.repeat(m.length / 2))
  }
  ops.push(`format (${comments} comments, ${quotes} quotes, ${JSON.stringify(indent)} indent)`)
  return code
}

export function mutate(original: string, type: MutationType, rng: Rng): Mutant | null {
  const ast = parseCode(original)
  const operations: string[] = []
  if (type >= 2) {
    renameBindings(ast, rng, operations)
    changeLiterals(ast, rng, operations)
  }
  if (type === 3) {
    const edits = rng.int(1, 3)
    for (let i = 0; i < edits; i++) {
      const op = edit(ast, rng)
      if (op) operations.push(op)
    }
    if (!operations.some((o) => /^(insert|delete|modify)/.test(o))) return null
  }
  const code = format(ast, rng, operations)
  try {
    parseCode(code)
  } catch {
    return null
  }
  return { code, operations }
}

/** Structural equality ignoring locations, comments and raw spellings: checks a Type-1 mutant by construction. */
export function sameAst(a: string, b: string): boolean {
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip)
    if (node && typeof node === 'object') {
      // JSX collapses whitespace in text, so re-indenting JSX does not change it.
      const n = node as { type?: string; value?: string }
      if (n.type === 'JSXText')
        return { type: 'JSXText', value: String(n.value).replace(/\s+/g, ' ').trim() }
      const out: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(node)) {
        if (
          /^(start|end|loc|range|extra|comments|leadingComments|trailingComments|innerComments|tokens|errors)$/.test(
            key,
          )
        )
          continue
        out[key] = strip(value)
      }
      return out
    }
    return node
  }
  return JSON.stringify(strip(parseCode(a).program)) === JSON.stringify(strip(parseCode(b).program))
}
