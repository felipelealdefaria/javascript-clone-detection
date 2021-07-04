import ast from 'abstract-syntax-tree'

export const parseOptmized = (snippet) => {
  return ast.binaryExpressionReduction(ast.parse(`${snippet}`))
}

export const parse = (snippet) => {
  return ast.parse(`${snippet}`)
}