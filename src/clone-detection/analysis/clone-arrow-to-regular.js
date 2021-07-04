import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'
import * as arrowToRegular from '../../clones/arrow-to-regular.js'

const controlTree = parseOptmized(`${arrowToRegular.arrowFunction}`)
const challengeTree = parseOptmized(`${arrowToRegular.regularFunction}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

printResults('RESULT - ARROW TO REGULAR EXPRESSION:', controlCleanned, challengeCleanned);

