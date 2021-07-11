import ast from 'abstract-syntax-tree'

export const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const convertArrowtoRegular = (node) => {
  node = { ...node.expression }
  node.id = { type: 'Identifier', name: 'function_name' }
  if (node?.type === 'ArrowFunctionExpression') node.type = 'FunctionDeclaration'

  const { expression, ...convertedNode } = node
  return convertedNode
}

export const normalizeNamesByNode = (tree) => {
  ast.walk(tree, (node, parent) => {
    if (node?.name) node.name = `${parent?.type}_name`.toLowerCase()
  })
}

export const normalizeLiteralValues = (tree) => {
  ast.walk(tree, (node) => {
    // if (node?.type === 'Literal') node.value = `${node?.type}_value`.toLowerCase()
    if (node?.type === 'Literal') node.value = typeof node.value
  })
}

export const cleanning = (tree) => {
  // normalizeNamesByNode(tree)
  normalizeLiteralValues(tree)
  return ast.replace(tree, (node) => {
    if (isObject(node?.expression)) return convertArrowtoRegular(node)
    return node
  })
}

