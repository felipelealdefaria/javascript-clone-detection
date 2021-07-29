import stringComparision from 'string-comparison'
import { cleanning } from '../../clone-detection/libs/pre-processing.js'
import { parseOptmized } from '../../clone-detection/libs/parse-to-ast.js'

export const cloneDetection = (functionsName, functionsArray) => {
  const parsedArray = functionsArray.map(element => parseOptmized(element))
  const cleannedTree = parsedArray.map(tree => JSON.stringify(cleanning(tree)))
  const arrayLength = cleannedTree.length
  console.log(arrayLength)
  
  for (let i = 0; i < arrayLength; i++) {
    const treeControl = cleannedTree.splice(0, 1)
    if (cleannedTree.length <= 0) return console.log('\n----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------')
  
    const result = stringComparision.levenshtein.sortMatch(...treeControl, cleannedTree)
    console.log('\n----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n')
    console.log(functionsName[i],"-", ...result.map(el => `[${el.index}]: ${el.rating} |`))
  }
}

// percorrer os subsdiretorios
// validar se apenas funcoes (regular and arrow) sao extraidas, sem css-in-js ou jsx
// apagar arquivo base quando tiver os resultados definidos
// cada nome de funcao devera receber um hash para diferencia-la
// publica no npm

// melhorar a visualizacao dos resultados

//--> quanto menor a arvore, menor o tempo de processamento (alem de outros metodos de similaridade)
//--> adicionar minifier
//--> husky: pegar tudo que foi alterado (git) e rodar a ferramenta em cima deles

// ======================
// funcao_1
// ======================

// \t [funcao_1] vs funcao_2 = 0.124124
// \t [funcao_1] vs funcao_3 = 0.143