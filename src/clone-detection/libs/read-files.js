import fs from 'fs'
import path from "path"
import ast from 'abstract-syntax-tree'
import { cloneDetection } from './sort-match.js'
import { parseOptmized } from './parse-to-ast.js'

const arrayFiles = []
const __dirname = path.resolve();
const isDirectory = (dirPath, file) => fs.statSync(dirPath + "/" + file).isDirectory()

// const hashCode = s => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)

const getAllFiles = (dirPath, arrayOfFiles) => {
  arrayOfFiles = arrayOfFiles || []
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    if (['__base-functions.js', '__similarity-matrix.js'].includes(file)) return
    if (isDirectory(dirPath, file)) arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    if (!isDirectory(dirPath, file)) arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
  })

  return arrayOfFiles
}

const addTreeWithNameHashed = (tree) => {
  ast.walk(tree, (node) => { if (node?.type === 'FunctionDeclaration' && node?.id?.name) node.id.name = `${node.id.name}_${Math.floor(Math.random() * 999 + 1)}` })
  ast.walk(tree, (node, parent) => { if (node?.type === 'ArrowFunctionExpression' && parent?.id?.name) parent.id.name = `${parent.id.name}_${Math.floor(Math.random() * 999 + 1)}` })
}

getAllFiles(process.argv[2])
  .map(file => {
    fs.writeFileSync(`${process.cwd()}/__base-functions.js`, '')
    if (!((file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))) return
    
    const content = fs.readFileSync(`${file}`, 'utf-8')
    const fileToTree = parseOptmized(content)
    
    fileToTree.body.forEach((tree) => {
      addTreeWithNameHashed(tree)
      
      if (tree?.type === 'FunctionDeclaration') arrayFiles.push(tree)
      if (tree?.declaration?.type === 'FunctionDeclaration') arrayFiles.push(tree.declaration)
  
      if (tree?.declarations && tree?.declarations[0]?.init?.type === 'ArrowFunctionExpression') arrayFiles.push(tree)
      if (tree?.declaration?.declarations && tree?.declaration?.declarations[0]?.init?.type === 'ArrowFunctionExpression') arrayFiles.push(tree.declaration)
    })
  })

arrayFiles.forEach(tree => {
  const contentBase = fs.readFileSync(`${process.cwd()}/__base-functions.js`, 'utf-8')
  const fileWrite = `${contentBase}\n\n${ast.generate(tree)}`

  fs.writeFileSync(`${process.cwd()}/__base-functions.js`, fileWrite)
})
  
const file = fs.readFileSync(`${process.cwd()}/__base-functions.js`, 'utf-8')
const parseFile = parseOptmized(file)

const arrayNames = []
const arrayFunctions = []

parseFile.body.map((el) => {
  if (el?.id?.name) arrayNames.push(el?.id?.name)
  if (el?.declarations && el?.declarations[0]?.init?.type === 'ArrowFunctionExpression') arrayNames.push(el?.declarations[0]?.id?.name)

  if (el?.type !== 'VariableDeclaration') return arrayFunctions.push(el)
  return arrayFunctions.push(el.declarations[0].init)
})

cloneDetection(arrayNames, arrayFunctions.map(el => ast.generate(el)))