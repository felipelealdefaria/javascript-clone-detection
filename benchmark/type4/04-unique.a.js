export function uniqueBy(items, key) {
  const seen = new Set()
  const result = []
  for (const item of items) {
    const id = item[key]
    if (!seen.has(id)) {
      seen.add(id)
      result.push(item)
    }
  }
  return result
}
