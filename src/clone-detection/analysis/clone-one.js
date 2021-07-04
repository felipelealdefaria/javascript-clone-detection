import { cleanning } from '../libs/pre-processing.js'
import { printResults } from '../libs/print-results.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { funcOne } from '../../clones/type-one/control.js'
import * as challenge from '../../clones/type-one/challenge.js'

const controlTree = parseOptmized(`${funcOne}`)
const challengeTree = parseOptmized(`${challenge.funcOne}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

printResults('RESULT - TYPE 1:', controlCleanned, challengeCleanned)