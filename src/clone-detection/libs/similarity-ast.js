const util = require('util')
const { compare } = require('ast-compare')
const stringSimilarity = require('string-similarity')
const stringComparision = require('string-comparison')
const { parse, replace, binaryExpressionReduction } = require('abstract-syntax-tree')

const arrowFunction = (value) => {
  const { type } = value
  return type
}

function regularFunction(value) {
  // this is a regular function
  const { type } = value
  return type
};

const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// const cleanning = (tree) => {
//   return replace(tree, (node) => {
//     if (node.name) node.name = 'fakeName'
//     if (isObject(node.expression)) {
//       node = { ...node.expression }
//       node.id = { type: 'Identifier', name: 'fakeName' }
//       if (node.type === 'ArrowFunctionExpression') node.type = 'FunctionDeclaration'
//       const { expression, generator, ...newNode } = node
//       return newNode
//     }
//     return node
//   })
// }

const arrowTree = binaryExpressionReduction(parse(`${arrowFunction}`))
const regularTree = binaryExpressionReduction(parse(`${regularFunction}`))

// const arrowCleaned = cleanning(arrowTree)
// const regularCleaned = cleanning(regularTree)

const similarity = stringSimilarity.compareTwoStrings(JSON.stringify(arrowTree), JSON.stringify(regularTree))

console.log('ast-compare: ', compare(arrowTree, regularTree))

console.log('string-similarity: ', similarity)
console.log('string-comparison (Cosine): ', stringComparision.cosine.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log('string-comparison (Levenshtein): ', stringComparision.levenshtein.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log('string-comparison (Longest Common Subsequence): ', stringComparision.lcs.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log('string-comparison (Metric Longest Common Subsequence): ', stringComparision.mlcs.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
// console.log(util.inspect(arrowCleaned, false, null))
