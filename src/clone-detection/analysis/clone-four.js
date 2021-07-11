import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'
import * as typeFour from '../../clones-example/type-four.js'
import { generateASTFile } from '../libs/generate-ast-file.js'

const controlTree = parseOptmized(`${typeFour.arrowFour}`)
const challengeTree = parseOptmized(`${typeFour.regularFour}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

generateASTFile('clone-four/control.sh', controlCleanned)
generateASTFile('clone-four/challenge.sh', challengeCleanned)
printResults('RESULT - TYPE 4:', controlCleanned, challengeCleanned);

