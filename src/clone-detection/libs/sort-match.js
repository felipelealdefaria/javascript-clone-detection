import fs from 'fs'
import ast from 'abstract-syntax-tree'
import stringComparision from 'string-comparison'
import { cleanning } from '../../clone-detection/libs/pre-processing.js'
import { parseOptmized } from '../../clone-detection/libs/parse-to-ast.js'

export const cloneDetection = (
  functionsName,
  functionsArray,
  similarityIndex = 0.8
) => {
  const arr = []
  const cloneInfo = { count: 0, similarity: 0 }
  const parsedArray = functionsArray.map((element) => parseOptmized(element))
  const cleannedTree = parsedArray.map((tree, i) =>
    cleanning(tree, functionsName[i])
  )
  const cleannedCode = cleannedTree.map((tree) => ast.generate(tree))

  fs.writeFileSync(`${process.cwd()}/__cleanned-functions.js`, '')

  cleannedCode.forEach((el) => {
    const content = fs.readFileSync(
      `${process.cwd()}/__cleanned-functions.js`,
      'utf-8'
    )
    fs.writeFileSync(
      `${process.cwd()}/__cleanned-functions.js`,
      `${content}\n${el}`
    )
  })

  console.log(
    `⚡⚡ FUNÇÕES EXTRAÍDAS E NORMALIZADAS FORAM GERADAS EM: ${process.cwd()}/__cleanned-functions.js ⚡⚡\n`
  )

  const arrayLength = cleannedCode.length
  console.log(
    `\n✨✨ SÃO ${arrayLength} FUNÇÕES SENDO ANALISADAS AOS PARES. ✨✨\n`
  )

  if (fs.existsSync(`${process.cwd()}/__coefficient-by-functions`))
    fs.rmdirSync(`${process.cwd()}/__coefficient-by-functions`, {
      recursive: true,
    })
  fs.mkdirSync(`${process.cwd()}/__coefficient-by-functions`)

  for (let i = 0; i < arrayLength; i++) {
    const controlNoNormalized = functionsArray.splice(0, 1)
    const treeControl = cleannedCode.splice(0, 1)

    let coefficient = ''
    for (let j = 0; j < i; j++) {
      coefficient += ' 0.000'
    }
    coefficient += ' 1.000'

    for (let k = 0; k < cleannedCode.length; k++) {
      const simi = stringComparision.levenshtein.similarity(
        `${treeControl}`,
        `${cleannedCode[k]}`
      )
      coefficient += ` ${simi.toFixed(3)}`

      cloneInfo.similarity = similarityIndex

      if (simi >= similarityIndex) {
        if (
          !fs.existsSync(
            `${process.cwd()}/__coefficient-by-functions/${functionsName[i]}.js`
          )
        )
          fs.writeFileSync(
            `${process.cwd()}/__coefficient-by-functions/${
              functionsName[i]
            }.js`,
            `// [CONTROL FUNCTION]: ${functionsName[i]}\n${controlNoNormalized}\n`
          )

        const content = fs.readFileSync(
          `${process.cwd()}/__coefficient-by-functions/${functionsName[i]}.js`,
          'utf-8'
        )

        fs.writeFileSync(
          `${process.cwd()}/__coefficient-by-functions/${functionsName[i]}.js`,
          `${content}\n// [CHALLENGE FUNCTION]: ${
            functionsName[i + k + 1]
          } | SIMILARITY: ${simi}\n${functionsArray[k]}\n`
        )

        cloneInfo.count++
      }
    }

    console.log(`[${i}]${coefficient}`)
    arr.push(`${functionsName[i]}${coefficient}`)
  }

  fs.writeFileSync(`${process.cwd()}/__similarity-matrix.csv`, '')

  arr.forEach((el) => {
    const content = fs.readFileSync(
      `${process.cwd()}/__similarity-matrix.csv`,
      'utf-8'
    )
    fs.writeFileSync(
      `${process.cwd()}/__similarity-matrix.csv`,
      `${content}\n${el}`
    )
  })

  console.log(
    `\n👾👾 FOI DETECTADO ${cloneInfo.count} CANDIDATOS A CLONE COM ${cloneInfo.similarity} OU MAIS DE SIMILARIDADE.👾👾\n`
  )

  console.log(
    `⚡⚡ CANDIDATOS A CLONE FORAM GERADOS EM: ${process.cwd()}/__coefficient-by-functions ⚡⚡`
  )
  console.log(
    `⚡⚡ UMA MATRIZ QUADRADA FOI GERADA EM: ${process.cwd()}/__similarity-matrix.csv ⚡⚡\n`
  )
}

//--> quanto menor a arvore, menor o tempo de processamento (alem de outros metodos de similaridade)
//--> adicionar minifier (entender impacto no coeficiente)
//--> husky: pegar tudo que foi alterado (git) e rodar a ferramenta em cima deles
//--> Organizar o codigo por steps e notificar etapas via console.log
