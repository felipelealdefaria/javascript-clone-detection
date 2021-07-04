export const arrowTwo = (op, valueOne, valueTwo) => {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (op === 'sum') {
    return valueOne + valueTwo
  } else {
    return valueOne - valueTwo
  }
}

export function regularTwo (state, vOne, vTwo) {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (state === 'sum') {
    return vOne + vTwo
  } else {
    return vOne - vTwo // subtract the values
  }
}