import { cloneDetection } from "../clone-detection/libs/sort-match.js";

export function fibonacciOne(n) {
  // declare the array starting with the first 2 values of the fibonacci sequence
  // starting at array index 1, and push current index + previous index to the array
  for (var fibonacci = [0, 1], i = 1; i < n; i++) 
    fibonacci.push(fibonacci[i] + fibonacci[i - 1])

  return fibonacci
}

export function fibonacciTwo() {
  var fib = []; // Initialize array!

  fib[0] = 0;
  fib[1] = 1;
  for (var i = 2; i <= 10; i++) {
    // Next fibonacci number = previous + one before previous
    // Translated to JavaScript:
    fib[i] = fib[i - 2] + fib[i - 1];
    console.log(fib[i]);
  }
}

export const arrowFunction = (value) => {
  const { type } = value
  return type
}

export function regularFunction (value) {
  // this is a regular function
  const { type } = value
  return type
}

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

export const arrowThree = (state, value) => {
  if (state) {
    return value * 3.14
  }
}

export function regularThree (state, value) {
  const pi = 3.14
  if (state) return value * pi
}

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

cloneDetection([
  arrowFour,
  arrowTwo,
  fibonacciOne,
  regularFunction,
  arrowThree,
  regularFour,
  regularTwo,
  regularThree,
  arrowFunction,
  fibonacciTwo,
])