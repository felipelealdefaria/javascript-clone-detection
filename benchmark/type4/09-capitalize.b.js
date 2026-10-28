export function capitalizeWords(text) {
  let output = ''
  let startOfWord = true
  for (const char of text.toLowerCase()) {
    output += startOfWord ? char.toUpperCase() : char
    startOfWord = char === ' '
  }
  return output
}
