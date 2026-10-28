export function flatten(input) {
  const stack = [...input]
  const output = []
  while (stack.length > 0) {
    const next = stack.pop()
    if (Array.isArray(next)) stack.push(...next)
    else output.unshift(next)
  }
  return output
}
