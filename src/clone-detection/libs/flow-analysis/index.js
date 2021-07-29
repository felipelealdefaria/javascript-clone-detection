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

import util from 'util'
// console.log(util.inspect(astControl, false, null))
// console.log(util.inspect(controlFlow, false, null))
// console.log(util.inspect(challengeFlow, false, null))

printResults('RESULT AST - TYPE MIX:', controlTree, challengeTree);


import { compare } from 'ast-compare'
import stringSimilarity from 'string-similarity'
import stringComparision from 'string-comparison'

console.log('RESULT FLOW - TYPE MIX:');
console.log('ast-compare: ', compare(`${util.inspect(controlFlow, false, null)}`, `${util.inspect(challengeFlow, false, null)}`))
console.log("string-similarity (Dice's): ", stringSimilarity.compareTwoStrings(`${util.inspect(controlFlow, false, null)}`, `${util.inspect(challengeFlow, false, null)}`))
console.log('string-comparison (Cosine): ', stringComparision.cosine.similarity(`${util.inspect(controlFlow, false, null)}`, `${util.inspect(challengeFlow, false, null)}`))
console.log('string-comparison (Levenshtein): ', stringComparision.levenshtein.similarity(`${util.inspect(controlFlow, false, null)}`, `${util.inspect(challengeFlow, false, null)}`))
console.log('string-comparison (Longest Common Subsequence): ', stringComparision.lcs.similarity(`${util.inspect(controlFlow, false, null)}`, `${util.inspect(challengeFlow, false, null)}`))
console.log('string-comparison (Metric Longest Common Subsequence): ', stringComparision.mlcs.similarity(`${util.inspect(controlFlow, false, null)}`, `${util.inspect(challengeFlow, false, null)}`))
console.log('---------------------------------------------------------------------------------------------------------')