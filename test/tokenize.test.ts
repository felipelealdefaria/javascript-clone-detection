import { describe, expect, it } from 'vitest'
import { emitUnit, extractUnits, normalizedSource, parseSource } from '../src/core/index.js'

function units(code: string, file = 'input.tsx') {
  return extractUnits(parseSource(code, file).ast)
}

function tokens(code: string, file = 'input.tsx') {
  const [unit] = units(code, file)
  if (!unit) throw new Error('no unit found')
  return emitUnit(unit.node)
}

describe('tokenizer', () => {
  it('ignores whitespace, comments and semicolons', () => {
    const a = tokens('function f(a, b) { return a + b; }')
    const b = tokens(`function f(a,b){
      // add them
      return a+b /* sum */
    }`)
    expect(b.raw).toEqual(a.raw)
  })

  it('treats arrow functions, function expressions and declarations alike', () => {
    const declaration = tokens('function add(x) { return x + 1 }')
    expect(tokens('const add = (x) => x + 1').raw).toEqual(declaration.raw)
    expect(tokens('const add = function (x) { return x + 1 }').raw).toEqual(declaration.raw)
  })

  it('leaves the unit name out but keeps every other identifier', () => {
    const a = tokens('function one(x) { return x }')
    const b = tokens('function two(x) { return x }')
    const c = tokens('function one(y) { return y }')
    expect(a.raw).toEqual(b.raw)
    expect(a.raw).not.toEqual(c.raw)
    expect(a.norm).toEqual(c.norm)
  })

  it('renames consistently, so swapped operands stay different', () => {
    const ab = tokens('function f(a, b) { return a - b }')
    const ba = tokens('function f(a, b) { return b - a }')
    expect(ab.norm).not.toEqual(ba.norm)
  })

  it('abstracts literal values but keeps their kind', () => {
    const a = tokens('function f() { return "a" + 1 }')
    expect(tokens('function f() { return "b" + 2 }').norm).toEqual(a.norm)
    expect(tokens('function f() { return 1 + 1 }').norm).not.toEqual(a.norm)
  })

  it('drops TypeScript type annotations', () => {
    const js = tokens('const f = (a, b) => a.concat(b)', 'a.js')
    const ts = tokens(
      'const f = <T,>(a: T[], b: T[]): T[] => (a as T[]).concat(b!) satisfies T[]',
      'a.ts',
    )
    expect(ts.raw).toEqual(js.raw)
  })

  it('ignores layout whitespace in JSX but keeps text content', () => {
    const a = tokens('const C = () => <div><b>Hi</b></div>')
    const b = tokens(`const C = () => (
      <div>
        <b>Hi</b>
      </div>
    )`)
    expect(b.raw).toEqual(a.raw)
    expect(tokens('const C = () => <div><b>Bye</b></div>').raw).not.toEqual(a.raw)
  })

  it('separates block boundaries', () => {
    const inside = tokens('function f(a) { if (a) { g(); h() } }')
    const after = tokens('function f(a) { if (a) { g() } h() }')
    expect(inside.norm).not.toEqual(after.norm)
  })
})

describe('extractUnits', () => {
  it('finds nested functions, methods and classes with useful names', () => {
    const found = units(`
      export default function App() { const onClick = useCallback(() => go(), []) }
      const Button = React.forwardRef((props, ref) => null)
      const Memo = memo(function Inner() {})
      class Store { load() {} #save() {} }
      module.exports.helper = () => {}
      items.map((x) => x.id)
      const api = { fetch() {}, post: async () => {} }
    `).map((u) => `${u.kind}:${u.name}`)
    expect(found).toEqual([
      'function:App',
      'function:onClick',
      'function:Button',
      'function:Inner',
      'class:Store',
      'method:load',
      'method:#save',
      'function:module.exports.helper',
      'function:<items.map callback>',
      'method:fetch',
      'function:post',
    ])
  })

  it('records the enclosing unit', () => {
    const [outer, inner] = units('function outer() { function inner() {} }')
    expect(outer?.parent).toBe(-1)
    expect(inner?.parent).toBe(0)
  })
})

describe('normalizedSource', () => {
  it('prints the canonical form the detector compares', () => {
    const [unit] = units(`export const greet = (name) => {
      // say hi
      return 'Hello ' + name + 42
    }`)
    expect(normalizedSource(unit!.node)).toBe('function (v0) {\n  return "str" + v0 + 0;\n}')
  })
})
