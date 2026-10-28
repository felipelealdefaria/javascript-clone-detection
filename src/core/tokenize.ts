import type * as t from '@babel/types'
import { VISITOR_KEYS } from '@babel/types'
import type { UnitKind } from './types.js'

// Babel nodes are walked generically through VISITOR_KEYS, so fields are read by name.
// biome-ignore lint/suspicious/noExplicitAny: generic AST walking
type AnyNode = any

export const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
])
export const CLASS_TYPES = new Set(['ClassDeclaration', 'ClassExpression'])

/** Type-only children: annotations never change runtime behavior. */
export const SKIP_KEYS = new Set([
  'typeAnnotation',
  'returnType',
  'typeParameters',
  'typeArguments',
  'superTypeParameters',
  'superTypeArguments',
  'implements',
  'predicate',
])

const LITERAL_TYPES = new Set([
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
  'BigIntLiteral',
  'RegExpLiteral',
  'DirectiveLiteral',
])

/** TypeScript nodes that exist at runtime and are walked like regular nodes. */
const RUNTIME_TS_TYPES = new Set(['TSEnumDeclaration', 'TSEnumMember', 'TSModuleDeclaration'])

/**
 * Children that hold a property name rather than a variable reference, when not computed:
 * `obj.name`, `{ name: value }`, `class { name() {} }`, `<a name="…">`. They get their own
 * renaming namespace, so destructuring `{ a }` and `{ a: b }` compare as equal shapes.
 */
const PROPERTY_NAME_KEYS: Record<string, string> = {
  MemberExpression: 'property',
  OptionalMemberExpression: 'property',
  ObjectProperty: 'key',
  ClassProperty: 'key',
  ClassPrivateProperty: 'key',
  ClassAccessorProperty: 'key',
  JSXAttribute: 'name',
  JSXMemberExpression: 'property',
}

/** The name of a property-name node, or null if the child is something else (e.g. a string key). */
export function propertyName(node: AnyNode): string | null {
  if (node?.type === 'Identifier' || node?.type === 'JSXIdentifier') return node.name
  if (node?.type === 'PrivateName') return `#${node.id?.name ?? node.name}`
  return null
}

export function isPropertyNameSlot(parent: AnyNode, key: string): boolean {
  return !parent.computed && PROPERTY_NAME_KEYS[parent.type] === key
}

/** Closing markers keep `if (a) { b } c` and `if (a) { b c }` apart. */
const BLOCK_END_TYPES = new Set(['BlockStatement', 'ClassBody', 'JSXElement', 'JSXFragment'])

/**
 * Two parallel token streams for one unit:
 * - `raw` keeps identifier names and literal values (Type-1 comparison).
 * - `norm` renames identifiers by order of first appearance and keeps only literal kinds (Type-2/3).
 *
 * Renaming is consistent, not blind: `a + b` and `b + a` stay different.
 */
export class TokenStream {
  readonly raw: string[] = []
  readonly norm: string[] = []
  private readonly names = new Map<string, number>()
  private readonly properties = new Map<string, number>()

  push(token: string): void {
    this.raw.push(token)
    this.norm.push(token)
  }

  identifier(name: string): void {
    let index = this.names.get(name)
    if (index === undefined) {
      index = this.names.size
      this.names.set(name, index)
    }
    this.raw.push(`Id:${name}`)
    this.norm.push(`Id#${index}`)
  }

  property(name: string): void {
    let index = this.properties.get(name)
    if (index === undefined) {
      index = this.properties.size
      this.properties.set(name, index)
    }
    this.raw.push(`Prop:${name}`)
    this.norm.push(`Prop#${index}`)
  }

  literal(kind: string, value: string): void {
    this.raw.push(`${kind}:${value}`)
    this.norm.push(kind)
  }
}

/** Tokenizes one unit (function, method or class) into raw and normalized streams. */
export function emitUnit(root: t.Node, stream: TokenStream = new TokenStream()): TokenStream {
  emit(root, stream, root)
  return stream
}

function emit(node: AnyNode, out: TokenStream, root: t.Node): void {
  if (node == null) return
  if (Array.isArray(node)) {
    for (const child of node) emit(child, out, root)
    return
  }
  const type: unknown = node.type
  if (typeof type !== 'string') return

  if (type.startsWith('TS') && !RUNTIME_TS_TYPES.has(type)) {
    // `x as T`, `x!`, `<T>x`, `x satisfies T`: keep the expression, drop the type.
    if (node.expression && type !== 'TSExternalModuleReference') emit(node.expression, out, root)
    else if (type === 'TSParameterProperty') emit(node.parameter, out, root)
    return
  }
  if (FUNCTION_TYPES.has(type)) {
    emitFunction(node, out, root)
    return
  }
  if (CLASS_TYPES.has(type)) {
    emitClass(node, out, root)
    return
  }

  switch (type) {
    case 'Identifier':
    case 'JSXIdentifier':
      out.identifier(node.name)
      return
    case 'JSXText': {
      // Whitespace between JSX tags is layout, not content.
      const text = String(node.value).replace(/\s+/g, ' ').trim()
      if (text) out.literal('JSXText', text)
      return
    }
    case 'TemplateElement':
      out.literal('TemplateElement', node.value.cooked ?? node.value.raw)
      return
    case 'NullLiteral':
      out.push('null')
      return
    case 'RegExpLiteral':
      out.literal('RegExpLiteral', `/${node.pattern}/${node.flags}`)
      return
  }
  if (LITERAL_TYPES.has(type)) {
    out.literal(type, String(node.value))
    return
  }

  let token = type
  if (node.operator) token += node.operator
  if (type === 'VariableDeclaration') token += `:${node.kind}`
  if (node.computed) token += '[]'
  if (node.static) token += ':static'
  if (type === 'UpdateExpression' && node.prefix) token += ':prefix'
  out.push(token)

  for (const key of VISITOR_KEYS[type] ?? []) {
    if (SKIP_KEYS.has(key)) continue
    const child = node[key]
    const name = isPropertyNameSlot(node, key) ? propertyName(child) : null
    if (name !== null) out.property(name)
    else emit(child, out, root)
  }
  if (BLOCK_END_TYPES.has(type)) out.push('}')
}

/**
 * Every function form is emitted the same way, so `const f = (x) => x + 1` and
 * `function g(x) { return x + 1 }` produce identical tokens. The unit's own name is
 * left out: two copies of a function with different names are still copies.
 */
function emitFunction(node: AnyNode, out: TokenStream, root: t.Node): void {
  let token = 'Function'
  if (node.async) token += ':async'
  if (node.generator) token += ':generator'
  if (node.static) token += ':static'
  if (node.kind && node.kind !== 'method') token += `:${node.kind}`
  out.push(token)

  if (node !== root) {
    if (node.key) {
      if (node.computed) out.push('[]')
      const name = node.computed ? null : propertyName(node.key)
      if (name !== null) out.property(name)
      else emit(node.key, out, root)
    } else if (node.id) {
      emit(node.id, out, root)
    }
  }

  out.push('(')
  emit(node.params, out, root)
  out.push(')')

  if (node.body.type === 'BlockStatement') {
    emit(node.body, out, root)
  } else {
    // Expression-bodied arrow: `=> expr` is the same as `{ return expr }`.
    out.push('BlockStatement')
    out.push('ReturnStatement')
    emit(node.body, out, root)
    out.push('}')
  }
}

function emitClass(node: AnyNode, out: TokenStream, root: t.Node): void {
  out.push('Class')
  if (node !== root && node.id) emit(node.id, out, root)
  emit(node.decorators, out, root)
  if (node.superClass) {
    out.push('extends')
    emit(node.superClass, out, root)
  }
  emit(node.body, out, root)
}

export interface ExtractedUnit {
  node: t.Node
  name: string
  kind: UnitKind
  /** Index of the innermost enclosing unit, or -1. */
  parent: number
}

/** Collects every function, method and class in a file, including nested ones. */
export function extractUnits(ast: t.File): ExtractedUnit[] {
  const units: ExtractedUnit[] = []
  const ancestors: AnyNode[] = []

  const visit = (node: AnyNode, parentUnit: number): void => {
    if (node == null || typeof node !== 'object') return
    if (Array.isArray(node)) {
      for (const child of node) visit(child, parentUnit)
      return
    }
    const type: unknown = node.type
    if (typeof type !== 'string') return

    let current = parentUnit
    const isFunction = FUNCTION_TYPES.has(type)
    if (isFunction || CLASS_TYPES.has(type)) {
      current = units.length
      units.push({
        node,
        name: unitName(node, ancestors),
        kind: isFunction ? (node.key ? 'method' : 'function') : 'class',
        parent: parentUnit,
      })
    }

    ancestors.push(node)
    for (const key of VISITOR_KEYS[type] ?? []) visit(node[key], current)
    ancestors.pop()
  }

  visit(ast.program, -1)
  return units
}

function keyName(key: AnyNode): string | null {
  if (!key) return null
  if (key.type === 'Identifier') return key.name
  if (key.type === 'StringLiteral' || key.type === 'NumericLiteral') return String(key.value)
  if (key.type === 'PrivateName') return `#${key.id?.name ?? ''}`
  return null
}

function memberName(node: AnyNode): string | null {
  if (node?.type === 'Identifier') return node.name
  if (node?.type === 'ThisExpression') return 'this'
  if (node?.type === 'MemberExpression' && !node.computed) {
    const object = memberName(node.object)
    const property = keyName(node.property)
    return object && property ? `${object}.${property}` : null
  }
  return null
}

function unitName(node: AnyNode, ancestors: AnyNode[]): string {
  const own = keyName(node.id) ?? keyName(node.key)
  if (own) return own

  // Walk up through wrappers such as `memo(...)`, `forwardRef(...)` or `useCallback(...)`.
  let wrapper: string | null = null
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const parent = ancestors[i]
    switch (parent.type) {
      case 'VariableDeclarator':
        return keyName(parent.id) ?? '<anonymous>'
      case 'AssignmentExpression':
        return memberName(parent.left) ?? '<anonymous>'
      case 'ObjectProperty':
      case 'ClassProperty':
      case 'ClassPrivateProperty':
        return keyName(parent.key) ?? '<anonymous>'
      case 'ExportDefaultDeclaration':
        return 'default'
      case 'CallExpression': {
        const callee = memberName(parent.callee)
        // `memo(fn)` and `React.forwardRef(fn)` wrap a named unit; `items.map(fn)` does not.
        const isWrapper =
          parent.callee.type === 'Identifier' || callee?.startsWith('React.') === true
        if (!isWrapper) return callee ? `<${callee} callback>` : '<anonymous>'
        wrapper ??= callee
        continue
      }
      case 'TSAsExpression':
      case 'TSSatisfiesExpression':
      case 'TSNonNullExpression':
        continue
      default:
        return wrapper ? `<${wrapper} callback>` : '<anonymous>'
    }
  }
  return '<anonymous>'
}
