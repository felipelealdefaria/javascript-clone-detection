import ast from 'abstract-syntax-tree'

export const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isParams = (type, params) => {
  return (type === 'FunctionDeclaration' && Array.isArray(params))
}

export const convertArrowtoRegular = (node, isArrow) => {
  if (isArrow) {
    const aux = node?.declarations[0]
    node = { ...aux?.init }
  }
  if (!isArrow) node = { ...node?.expression }

  if (Array.isArray(node?.params)) node?.params?.map((element) => element.name = 'params_name')
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

export const cleanning = (tree, nameTree) => {
  // console.log('[CLEANNED TREE NAME]: ', nameTree)
  return ast.replace(tree, (node) => {
    const isArroww = isObject(node?.expression) && node?.expression?.type === 'ArrowFunctionExpression'
    const isArrow = node?.type === 'VariableDeclaration' && node?.kind === 'const' && node?.declarations[0]?.init?.type === 'ArrowFunctionExpression'
    if (isArroww || isArrow) node = convertArrowtoRegular(node, isArrow)
  
    deleteAttrsByNode(tree)
    normalizeNamesByNode(tree)
    normalizeLiteralValues(tree)
    return organizeAttrsByNode(node)
  })
}
