export function sumOfEvenSquares(numbers) {
  let total = 0
  for (let i = 0; i < numbers.length; i++) {
    const n = numbers[i]
    if (n % 2 === 0) {
      total += n * n
    }
  }
  return total
}
