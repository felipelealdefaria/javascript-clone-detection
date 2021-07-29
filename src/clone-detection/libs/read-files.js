import fs from 'fs'
import ast from 'abstract-syntax-tree'
import { cloneDetection } from './sort-match.js'
import { parseOptmized } from './parse-to-ast.js'

let arrayFiles = []

fs.readdirSync('src/clones-example/')
  .map(file => {
    if (!((file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))) return
    if (!fs.existsSync('src/base.js')) fs.writeFileSync('src/base.js', '')

    const content = fs.readFileSync(`src/clones-example/${file}`, 'utf-8')

    let arr = []
    const fileToTree = parseOptmized(content)
    fileToTree.body.map((el) => { if (el.type === 'ExportNamedDeclaration') arr.push(el.declaration) })
    
    arr.map(el => arrayFiles.push(el))
  })

arrayFiles.forEach(tree => {
  const contentBase = fs.readFileSync(`src/base.js`, 'utf-8')
  const fileWrite = `${contentBase}\n\n${ast.generate(tree)}`
  fs.writeFileSync('src/base.js', fileWrite)
})
  
const file = fs.readFileSync('src/base.js', 'utf-8')
const parseFile = parseOptmized(file)

let arrayNames = []
let arrayFunctions = []

parseFile.body.map((el) => {
  if (el?.id?.name) arrayNames.push(el?.id?.name)
  if (el?.declarations && el?.declarations[0]?.init?.type === 'ArrowFunctionExpression') arrayNames.push(el?.declarations[0]?.id?.name)

  if (el?.type !== 'VariableDeclaration') return arrayFunctions.push(el)
  return arrayFunctions.push(el.declarations[0].init)
  
})

cloneDetection(arrayNames, arrayFunctions.map(el => ast.generate(el)))