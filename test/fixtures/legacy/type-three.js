export const arrowThree = (state, value) => {
  const pi = regularThree(true, 5)
  const aux = pi + 2
  if (state) {
    return value * 3.14
  }
}

export function regularThree (state, value) {
  const pi = 3.14
  if (state) return value * pi
}