export const cached = (compute) => {
  const store = Object.create(null)
  return (input) => {
    if (!(input in store)) store[input] = compute(input)
    return store[input]
  }
}
