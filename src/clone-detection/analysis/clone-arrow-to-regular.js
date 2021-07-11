import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'
import { generateASTFile } from '../libs/generate-ast-file.js'
import * as arrowToRegular from '../../clones-example/arrow-to-regular.js'

const controlTree = parseOptmized(`${arrowToRegular.arrowFunction}`)
const challengeTree = parseOptmized(`${arrowToRegular.regularFunction}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

generateASTFile('clone-arrow-to-regular/arrow-ast.sh', controlCleanned)
generateASTFile('clone-arrow-to-regular/regular-ast.sh', challengeCleanned)
printResults('RESULT - ARROW TO REGULAR EXPRESSION:', controlCleanned, challengeCleanned);

