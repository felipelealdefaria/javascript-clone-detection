export function queryToObject(queryString) {
  const result = {}
  new URLSearchParams(queryString).forEach((value, key) => {
    result[key] = value
  })
  return result
}
