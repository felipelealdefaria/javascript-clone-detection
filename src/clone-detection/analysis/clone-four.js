import { cleanning } from '../libs/pre-processing.js'
import * as typeFour from '../../clones/type-four.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'

const controlTree = parseOptmized(`${typeFour.arrowFour}`)
const challengeTree = parseOptmized(`${typeFour.regularFour}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

printResults('RESULT - TYPE 4:', controlCleanned, challengeCleanned);

