const util = require('util')
const { compare } = require('ast-compare')
const stringSimilarity = require('string-similarity')
const stringComparision = require('string-comparison')
const { parse, replace, walk, binaryExpressionReduction } = require('abstract-syntax-tree')

const arrowFunction = (value) => {
  const { type } = value
  return type
}

function regularFunction (value) {
  // this is a regular function
  const { type } = value
  return type
};

const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const convertArrowtoRegular = (node) => {
  node = { ...node.expression }
  node.id = { type: 'Identifier', name: 'function_name' }
  if (node.type === 'ArrowFunctionExpression') node.type = 'FunctionDeclaration'

  const { expression, ...convertedNode } = node
  return convertedNode
}

const normalizeNamesByNode = (tree) => {
  walk(tree, (node, parent) => {
    if (node.name) node.name = `${parent.type}_name`.toLowerCase()
  })
}

const cleanning = (tree) => {
  normalizeNamesByNode(tree)
  return replace(tree, (node) => {
    if (isObject(node.expression)) return convertArrowtoRegular(node)
    return node
  })
}

const arrowTree = binaryExpressionReduction(parse(`${arrowFunction}`))
const regularTree = binaryExpressionReduction(parse(`${regularFunction}`))

const arrowCleaned = cleanning(arrowTree)
const regularCleaned = cleanning(regularTree)

const similarity = stringSimilarity.compareTwoStrings(JSON.stringify(arrowCleaned), JSON.stringify(regularCleaned))

console.log('ast-compare: ', compare(arrowCleaned, regularCleaned))
console.log('string-similarity: ', similarity)
console.log('string-comparison (Cosine): ', stringComparision.cosine.similarity(JSON.stringify(arrowCleaned), JSON.stringify(regularCleaned)))
console.log('string-comparison (Levenshtein): ', stringComparision.levenshtein.similarity(JSON.stringify(arrowCleaned), JSON.stringify(regularCleaned)))
console.log('string-comparison (Longest Common Subsequence): ', stringComparision.lcs.similarity(JSON.stringify(arrowCleaned), JSON.stringify(regularCleaned)))
console.log('string-comparison (Metric Longest Common Subsequence): ', stringComparision.mlcs.similarity(JSON.stringify(arrowCleaned), JSON.stringify(regularCleaned)))
console.log(util.inspect(arrowCleaned, false, null))
console.log(util.inspect(regularCleaned, false, null))
