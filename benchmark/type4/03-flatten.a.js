export function flattenDeep(array) {
  const result = []
  for (const value of array) {
    if (Array.isArray(value)) {
      result.push(...flattenDeep(value))
    } else {
      result.push(value)
    }
  }
  return result
}
