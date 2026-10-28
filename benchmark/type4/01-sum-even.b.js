export const sumEvenSquares = (values) =>
  values
    .filter((value) => value % 2 === 0)
    .map((value) => value ** 2)
    .reduce((acc, square) => acc + square, 0)
