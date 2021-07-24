import ast from 'abstract-syntax-tree'

export const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isParams = (type, params) => {
  return (type === 'FunctionDeclaration' && Array.isArray(params))
}

export const convertArrowtoRegular = (node) => {
  node = { ...node.expression }
  node?.params?.map((element) => element.name = 'params_name')
  node.id = { type: 'Identifier', name: 'functiondeclaration_name' }
  if (node?.type === 'ArrowFunctionExpression') node.type = 'FunctionDeclaration'

  const { expression, ...convertedNode } = node
  return convertedNode
}

export const normalizeNamesByNode = (tree) => {
  ast.walk(tree, (node, parent) => {
    if (node?.name) node.name = `${parent?.type}_name`.toLowerCase()

    if (isParams(parent?.type, parent?.params)) {
      parent.id.name = `${parent?.type}_name`.toLowerCase()
      parent.params.map((element) => element.name = 'params_name')
    }
  })
}

export const normalizeLiteralValues = (tree) => {
  ast.walk(tree, (node) => {
    if (node?.type === 'Literal') node.value = typeof node.value
  })
}

export const deleteAttrsByNode = (tree) => {
  ast.walk(tree, (node) => {
    if (node?.generator === false) delete node.generator
    if (node?.sourceType === 'module') delete node.sourceType
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
  deleteAttrsByNode(tree)
  normalizeNamesByNode(tree)
  normalizeLiteralValues(tree)
  return ast.replace(tree, (node) => {
    if (isObject(node?.expression)) node = convertArrowtoRegular(node)
    return organizeAttrsByNode(node)
  })
}
