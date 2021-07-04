import * as typeTwo from '../../clones/type-two.js'
import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'

const controlTree = parseOptmized(`${typeTwo.arrowTwo}`)
const challengeTree = parseOptmized(`${typeTwo.regularTwo}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

printResults('RESULT - TYPE 2:', controlCleanned, challengeCleanned);