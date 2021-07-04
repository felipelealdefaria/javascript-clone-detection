import fs from 'fs';
import util from 'util'

export const writeFile = (path: string, content: any, callback?: any) => {
  fs.writeFile(path, util.inspect(content, false, null), (err) => {
    if (callback) callback
    console.log(path, ' completed! ✨')
    if (err) return console.log(err)
  })
}
