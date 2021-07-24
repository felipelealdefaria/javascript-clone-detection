import stringComparision from 'string-comparison'
import { cleanning } from '../../clone-detection/libs/pre-processing.js'
import { parseOptmized } from '../../clone-detection/libs/parse-to-ast.js'

export const cloneDetection = (functionsArray) => {
  const parsedArray = functionsArray.map(element => parseOptmized(`${element}`))
  const cleannedTree = parsedArray.map(tree => JSON.stringify(cleanning(tree)))
  const arrayLength = cleannedTree.length

  for (let i = 0; i < arrayLength; i++) {
    const treeControl = cleannedTree.splice(0, 1)
    if (cleannedTree.length <= 0) return

    const result = stringComparision.levenshtein.sortMatch(...treeControl, cleannedTree)
    console.log(i,"- LEVENSTHEIN:", ...result.map(el => `[${el.index}]: ${el.rating} |`))
  }
}
