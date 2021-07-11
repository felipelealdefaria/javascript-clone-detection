import { cleanning } from '../libs/pre-processing.js'
import { parseOptmized } from '../libs/parse-to-ast.js'
import { printResults } from '../libs/print-results.js'
import { generateASTFile } from '../libs/generate-ast-file.js'
import * as typeThree from '../../clones-example/type-three.js'

const controlTree = parseOptmized(`${typeThree.arrowThree}`)
const challengeTree = parseOptmized(`${typeThree.regularThree}`)

const controlCleanned = cleanning(controlTree)
const challengeCleanned = cleanning(challengeTree)

generateASTFile('clone-three/control.sh', controlCleanned)
generateASTFile('clone-three/challenge.sh', challengeCleanned)
printResults('RESULT - TYPE 3:', controlCleanned, challengeCleanned);

