export const arrowThree = (state, value) => {
  if (state) {
    return value * 3.14
  }
}

export function regularThree (state, value) {
  const pi = 3.14
  if (state) return value * pi
}