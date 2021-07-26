import pkg from 'js2flowchart';
const { convertCodeToFlowTree } = pkg;
import { parseOptmized } from '../parse-to-ast.js'
import { printResults } from '../print-results.js'
import { generateASTFile } from '../generate-ast-file.js'
import * as typeTwo from '../../../clones-example/type-two.js'
import * as typeThree from '../../../clones-example/type-three.js'

const controlTree = parseOptmized(`${typeThree.arrowThree}`)
const challengeTree = parseOptmized(`${typeTwo.regularTwo}`)

const controlFlow = convertCodeToFlowTree(`${typeThree.arrowThree}`)
const challengeFlow = convertCodeToFlowTree(`${typeTwo.regularTwo}`)

generateASTFile('flow-analysis/arrow-ast.sh', controlTree)
generateASTFile('flow-analysis/regular-ast.sh', challengeTree)

generateASTFile('flow-analysis/arrow-flow.sh', controlFlow)
generateASTFile('flow-analysis/regular-flow.sh', challengeFlow)

printResults('RESULT AST - TYPE MIX:', controlTree, challengeTree);


import { compare } from 'ast-compare'
import stringSimilarity from 'string-similarity'
import stringComparision from 'string-comparison'

console.log('RESULT FLOW - TYPE MIX:');
console.log('ast-compare: ', compare(`${controlFlow}`, `${challengeFlow}`))
console.log("string-similarity (Dice's): ", stringSimilarity.compareTwoStrings(`${controlFlow}`, `${challengeFlow}`))
console.log('string-comparison (Cosine): ', stringComparision.cosine.similarity(`${controlFlow}`, `${challengeFlow}`))
console.log('string-comparison (Levenshtein): ', stringComparision.levenshtein.similarity(`${controlFlow}`, `${challengeFlow}`))
console.log('string-comparison (Longest Common Subsequence): ', stringComparision.lcs.similarity(`${controlFlow}`, `${challengeFlow}`))
console.log('string-comparison (Metric Longest Common Subsequence): ', stringComparision.mlcs.similarity(`${controlFlow}`, `${challengeFlow}`))
console.log('---------------------------------------------------------------------------------------------------------')