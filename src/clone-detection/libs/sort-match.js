import fs from 'fs'
import stringComparision from 'string-comparison'
import { cleanning } from '../../clone-detection/libs/pre-processing.js'
import { parseOptmized } from '../../clone-detection/libs/parse-to-ast.js'

export const cloneDetection = (functionsName, functionsArray) => {
  const arr = []
  const parsedArray = functionsArray.map(element => parseOptmized(element))
  const cleannedTree = parsedArray.map(tree => JSON.stringify(cleanning(tree)))
  
  const arrayLength = cleannedTree.length
  console.log(`\n✨✨ SÃO ${arrayLength + 1} FUNÇÕES SENDO ANALISADAS AOS PARES. ✨✨\n`)
  
  for (let i = 0; i < arrayLength; i++) {
    const treeControl = cleannedTree.splice(0, 1)
    // if (cleannedTree.length <= 0) return console.log('\n-----------------------------------------------------------')
    // const result = stringComparision.levenshtein.sortMatch(...treeControl, cleannedTree)

    let string = ''
    for (let j = 0; j < i; j++) { string += ' 0.000' }
    string += ' 1.000'

    for (let k = 0; k < cleannedTree.length; k++) {
      const simi = stringComparision.levenshtein.similarity(JSON.stringify(treeControl), JSON.stringify(cleannedTree[k]))
      string += ` ${simi.toFixed(3)}`
    }
    
    console.log([i], string)
    arr.push(`${functionsName[i]} ${string}`)
    
    // console.log('\n----------------------------------------------------------------------------------------------\n')
    // console.log(functionsName[i],"-", ...result.map(el => `[${el.index}]: ${el.rating} |`))
  }
  
  fs.writeFileSync(`${process.cwd()}/__similarity-matrix.csv`, '')
  
  arr.forEach(el => {
    const content = fs.readFileSync(`${process.cwd()}/__similarity-matrix.csv`, 'utf-8')
    fs.writeFileSync(`${process.cwd()}/__similarity-matrix.csv`, `${content}\n${el}`)
  })

  console.log(`\n⚡⚡ UMA MATRIZ QUADRADA FOI GERADA EM: ${process.cwd()}/__similarity-matrix.csv ⚡⚡\n`)
}

//--> quanto menor a arvore, menor o tempo de processamento (alem de outros metodos de similaridade)
//--> adicionar minifier (entender impacto no coeficiente)
//--> husky: pegar tudo que foi alterado (git) e rodar a ferramenta em cima deles
//--> Organizar o codigo por steps e notificar etapas via console.log