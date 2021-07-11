import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'
import * as typeTwo from '../../clones-example/type-two.js'
import { generateASTFile } from '../libs/generate-ast-file.js'

const controlTree = parseOptmized(`${typeTwo.arrowTwo}`)
const challengeTree = parseOptmized(`${typeTwo.regularTwo}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

generateASTFile('clone-two/control.sh', controlCleanned)
generateASTFile('clone-two/challenge.sh', challengeCleanned)
printResults('RESULT - TYPE 2:', controlCleanned, challengeCleanned);