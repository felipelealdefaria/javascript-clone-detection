import { cleanning } from '../libs/pre-processing.js'
import { printResults } from '../libs/print-results.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { generateASTFile } from '../libs/generate-ast-file.js'
import { funcOne } from '../../clones-example/type-one/control.js'
import * as challenge from '../../clones-example/type-one/challenge.js'

const controlTree = parseOptmized(`${funcOne}`)
const challengeTree = parseOptmized(`${challenge.funcOne}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

generateASTFile('clone-one/control.sh', controlCleanned)
generateASTFile('clone-one/challenge.sh', challengeCleanned)
printResults('RESULT - TYPE 1:', controlCleanned, challengeCleanned)