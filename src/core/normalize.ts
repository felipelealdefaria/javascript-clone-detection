import generateModule from '@babel/generator'
import type * as t from '@babel/types'
import {
  blockStatement,
  cloneNode,
  functionExpression,
  returnStatement,
  VISITOR_KEYS,
} from '@babel/types'
import { FUNCTION_TYPES, isPropertyNameSlot, SKIP_KEYS } from './tokenize.js'

// biome-ignore lint/suspicious/noExplicitAny: generic AST walking
type AnyNode = any

// Babel 8 exports the function itself; older builds expose it as `.default`.
const generate = ((generateModule as AnyNode).default ?? generateModule) as typeof generateModule

const PLACEHOLDERS: Record<string, AnyNode> = {
  StringLiteral: { value: 'str' },
  NumericLiteral: { value: 0 },
  BigIntLiteral: { value: '0' },
  BooleanLiteral: { value: true },
  RegExpLiteral: { pattern: 're', flags: '' },
}

/**
 * Prints a unit the way the detector sees it: one function form, identifiers renamed
 * `v0, v1, …` by first appearance, literals replaced by placeholders, comments and types gone.
 *
 * For display only. Detection works on token streams; this mirrors the same rules.
 */
export function normalizedSource(node: t.Node): string {
  let root: AnyNode = cloneNode(node, true, true)

  if (FUNCTION_TYPES.has(root.type)) {
    const body =
      root.body.type === 'BlockStatement' ? root.body : blockStatement([returnStatement(root.body)])
    root = functionExpression(null, root.params, body, root.generator, root.async)
  } else if (root.id) {
    root.id = null
  }

  const namer = (prefix: string) => {
    const names = new Map<string, string>()
    return (name: string): string => {
      let renamed = names.get(name)
      if (!renamed) {
        renamed = `${prefix}${names.size}`
        names.set(name, renamed)
      }
      return renamed
    }
  }
  const rename = namer('v')
  const renameProperty = namer('p')

  const visit = (n: AnyNode): void => {
    if (n == null || typeof n !== 'object') return
    if (Array.isArray(n)) {
      for (const child of n) visit(child)
      return
    }
    if (typeof n.type !== 'string') return
    for (const key of SKIP_KEYS) if (key in n) n[key] = null

    if (n.type === 'Identifier' || n.type === 'JSXIdentifier') {
      n.name = rename(n.name)
      return
    }
    if (n.type === 'JSXText') {
      if (n.value.trim()) n.value = 'text'
      return
    }
    if (n.type === 'TemplateElement') {
      n.value = { raw: 'str', cooked: 'str' }
      return
    }
    const placeholder = PLACEHOLDERS[n.type]
    if (placeholder) {
      Object.assign(n, placeholder)
      n.extra = undefined
      return
    }
    if (n.type === 'ObjectProperty') n.shorthand = false
    for (const key of VISITOR_KEYS[n.type] ?? []) {
      const child = n[key]
      const isProperty =
        (isPropertyNameSlot(n, key) ||
          (key === 'key' && FUNCTION_TYPES.has(n.type) && !n.computed)) &&
        (child?.type === 'Identifier' || child?.type === 'JSXIdentifier')
      if (isProperty) child.name = renameProperty(child.name)
      else visit(child)
    }
  }
  visit(root)

  return generate(root, { comments: false }).code
}
