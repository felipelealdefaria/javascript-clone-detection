const util = require('util')
const { compare } = require('ast-compare')
const { parse } = require('abstract-syntax-tree')
const stringSimilarity = require('string-similarity')
const stringComparision = require('string-comparison')

const arrowFunction = (value) => {
  const { type } = value
  return type
}

function regularFunction (value) {
  // this is a regular function
  const { type } = value
  return type
};

const arrowTree = parse(`${arrowFunction}`)
const regularTree = parse(`${regularFunction}`)
const similarity = stringSimilarity.compareTwoStrings(JSON.stringify(arrowTree), JSON.stringify(regularTree))

console.log('string-similarity: ', similarity)
console.log('ast-compare: ', compare(arrowTree, regularTree))
console.log('string-comparison (Cosine): ', stringComparision.cosine.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log('string-comparison (Levenshtein): ', stringComparision.levenshtein.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log('string-comparison (Longest Common Subsequence): ', stringComparision.lcs.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log('string-comparison (Metric Longest Common Subsequence): ', stringComparision.mlcs.similarity(JSON.stringify(arrowTree), JSON.stringify(regularTree)))
console.log(util.inspect(arrowTree, false, null))
// console.log(util.inspect(regularTree, false, null))
