export const cleaningAST = (entryAST: any): any => {
  return Object.entries(entryAST).reduce((cleanedAST: any, [key, value]) => {
    console.log(`cleanedAST: ${cleanedAST}`)
    console.log(`[${key}]: ${value}`)

    if (['end', 'start'].includes(key)) return cleanedAST
    if (isObject(value)) cleanedAST[key] = cleaningAST(value)
    if (Array.isArray(value)) cleanedAST[key] = value.map(cleaningAST)
    if (!Array.isArray(value) && !isObject(value)) cleanedAST[key] = value

    return cleanedAST
  }, {})
}

const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
