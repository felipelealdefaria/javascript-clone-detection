export function pipe(...fns) {
  return function piped(initial) {
    let value = initial
    for (const fn of fns) {
      value = fn(value)
    }
    return value
  }
}
