import ast from 'abstract-syntax-tree'
import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'
import { generateASTFile } from '../libs/generate-ast-file.js'

const controlTree = parseOptmized(`
const arrowFunction_257 = (value) => {
  const { type } = value
  return type
}
`)
const challengeTree = parseOptmized(`
function regularFunction_67 (value) {
  // this is a regular function
  const { type } = value
  return type
}
`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

const codeControlCleanned = ast.generate(controlCleanned)
const codeChallengeCleanned = ast.generate(challengeCleanned)

generateASTFile('clone-arrow-to-regular/arrow-ast.sh', controlCleanned)
generateASTFile('clone-arrow-to-regular/regular-ast.sh', challengeCleanned)
printResults('RESULT - ARROW TO REGULAR EXPRESSION CODE:', codeControlCleanned, codeChallengeCleanned);
console.log(codeControlCleanned, codeChallengeCleanned);

