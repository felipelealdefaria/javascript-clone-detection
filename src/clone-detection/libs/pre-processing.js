import ast from 'abstract-syntax-tree'

export const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const convertArrowtoRegular = (node) => {
  node = { ...node.expression }
  node.id = { type: 'Identifier', name: 'identifier_name' }
  if (node?.type === 'ArrowFunctionExpression') node.type = 'FunctionDeclaration'

  const { expression, ...convertedNode } = node
  return convertedNode
}

export const normalizeNamesByNode = (tree) => {
  ast.walk(tree, (node, parent) => {
    if (node?.name) node.name = `${node?.type}_name`.toLowerCase()
  })
}

export const normalizeLiteralValues = (tree) => {
  ast.walk(tree, (node) => {
    if (node?.type === 'Literal') node.value = typeof node.value
    if (node?.generator === false) delete node.generator
  })
}

export const organizeAttrsByNode = (node) => {
  const arraySort = Object.entries(node).sort((a, b) => {
    if (a < b) return 1
    if (a > b) return -1
    return 0
  })
  return Object.fromEntries(arraySort)
}

export const cleanning = (tree) => {
  normalizeNamesByNode(tree)
  normalizeLiteralValues(tree)
  return ast.replace(tree, (node) => {
    if (isObject(node?.expression)) node = convertArrowtoRegular(node)
    return organizeAttrsByNode(node)
  })
}
