import fs from 'fs'
import util from 'util'

export const generateASTFile = (nameFile, ast) => {
  const astForRead = util.inspect(ast, false, null)

  if (nameFile.match('/')) {
    const splitPath = nameFile.split('/')
    splitPath.pop();

    const buildPath = splitPath.reduce((last, current) => last + '/' + current)
    fs.mkdirSync(`src/clone-detection/ast-output/${buildPath}`, { recursive: true }, (err) => { if (err) throw err });
  }

  fs.writeFile(`src/clone-detection/ast-output/${nameFile}`, `${astForRead}`, (err) => {
    if (err) return console.log(err)
    console.log(`Generated ast file in [src/clone-detection/ast-output/${nameFile}] ✨`)
  })
}