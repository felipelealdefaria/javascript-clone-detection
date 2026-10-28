export const fizzBuzz = (count) =>
  Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const word = (n % 3 === 0 ? 'Fizz' : '') + (n % 5 === 0 ? 'Buzz' : '')
    return word || `${n}`
  })
