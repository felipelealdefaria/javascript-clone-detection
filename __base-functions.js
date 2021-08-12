

function fibonacciOne_824(n) {
  for (var fibonacci = [0, 1], i = 1; i < n; i++) {
    fibonacci.push(fibonacci[i] + fibonacci[i - 1]);
  }
  return fibonacci;
}

function fibonacciTwo_239() {
  var fib = [];
  fib[0] = 0;
  fib[1] = 1;
  for (var i = 2; i <= 10; i++) {
    fib[i] = fib[i - 2] + fib[i - 1];
    console.log(fib[i]);
  }
  return fib;
}

const arrowFunction_82 = value => {
  const {type} = value;
  return type;
};

function regularFunction_906(value) {
  const {type} = value;
  return type;
}

const arrowFour_418 = (op, valueOne, valueTwo) => {
  if (op === "sub") {
    return valueOne - valueTwo;
  } else {
    return valueOne + valueTwo;
  }
};

function regularFour_158(operation, firstValue, secondValue) {
  switch (operation) {
    case "sub":
      return firstValue - secondValue;
    default:
      return firstValue + secondValue;
  }
}

const arrowThree_437 = (state, value) => {
  if (state) {
    return value * 3.14;
  }
};

function regularThree_319(state, value) {
  const pi = 3.14;
  if (state) return value * pi;
}

const arrowTwo_346 = (op, valueOne, valueTwo) => {
  if (op === "sum") {
    return valueOne + valueTwo;
  } else {
    return valueOne - valueTwo;
  }
};

function regularTwo_960(state, vOne, vTwo) {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
}

const arrowFunction_245 = value => {
  const {type} = value;
  return type;
};

function regularFunction_296(value) {
  const {type} = value;
  return type;
}

const arrowFour_155 = (op, valueOne, valueTwo) => {
  if (op === "sub") {
    return valueOne - valueTwo;
  } else {
    return valueOne + valueTwo;
  }
};

function regularFour_461(operation, firstValue, secondValue) {
  switch (operation) {
    case "sub":
      return firstValue - secondValue;
    default:
      return firstValue + secondValue;
  }
}

function funcOne_956(valueOne, valueTwo) {
  return valueOne + valueTwo;
}

const funcOne_323 = (valueOne, valueTwo) => {
  return valueOne + valueTwo;
};

const arrowThree_610 = (state, value) => {
  if (state) {
    return value * 3.14;
  }
};

function regularThree_86(state, value) {
  const pi = 3.14;
  if (state) return value * pi;
}

const arrowTwo_922 = (op, valueOne, valueTwo) => {
  if (op === "sum") {
    return valueOne + valueTwo;
  } else {
    return valueOne - valueTwo;
  }
};

function regularTwo_577(state, vOne, vTwo) {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
}

function funcaoSemEXPORT_622(state, vOne, vTwo) {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
}

const arrowSemEXPORT_716 = (state, vOne, vTwo) => {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
};