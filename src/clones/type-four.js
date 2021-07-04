export const arrowFour = (op, valueOne, valueTwo) => {
  if (op === "sub") {
    return valueOne - valueTwo
  } else {
    return valueOne + valueTwo
  }
}

export function regularFour (operation, firstValue, secondValue) {
  switch (operation) {
    case "sub":
      return firstValue - secondValue
    default:
      return firstValue + secondValue
  }
}
