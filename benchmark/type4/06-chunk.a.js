export function chunk(array, size) {
  const chunks = []
  let index = 0
  while (index < array.length) {
    chunks.push(array.slice(index, index + size))
    index += size
  }
  return chunks
}
