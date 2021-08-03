

const generateASTFile_879 = (nameFile, ast) => {
  const astForRead = util.inspect(ast, false, null);
  if (nameFile.match("/")) {
    const splitPath = nameFile.split("/");
    splitPath.pop();
    const buildPath = splitPath.reduce((last, current) => last + "/" + current);
    fs.mkdirSync(`src/clone-detection/ast-output/${buildPath}`, {
      recursive: true
    }, err => {
      if (err) throw err;
    });
  }
  fs.writeFile(`src/clone-detection/ast-output/${nameFile}`, `${astForRead}`, err => {
    if (err) return console.log(err);
    console.log(`Generated ast file in [src/clone-detection/ast-output/${nameFile}] ✨`);
  });
};

const parseOptmized_833 = snippet => {
  return ast.binaryExpressionReduction(ast.parse(`${snippet}`));
};

const parse_634 = snippet => {
  return ast.parse(`${snippet}`);
};

const isObject_434 = value => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isParams_274 = (type, params) => {
  return type === "FunctionDeclaration" && Array.isArray(params);
};

const convertArrowtoRegular_473 = node => {
  node = {
    ...node.expression
  };
  node?.params?.map(element => element.name = "params_name");
  node.id = {
    type: "Identifier",
    name: "functiondeclaration_name"
  };
  if (node?.type === "ArrowFunctionExpression") node.type = "FunctionDeclaration";
  const {expression, ...convertedNode} = node;
  return convertedNode;
};

const normalizeNamesByNode_724 = tree => {
  ast.walk(tree, (node, parent) => {
    if (node?.name) node.name = `${parent?.type}_name`.toLowerCase();
    if (isParams(parent?.type, parent?.params)) {
      parent.id.name = `${parent?.type}_name`.toLowerCase();
      parent.params.map(element => element.name = "params_name");
    }
  });
};

const normalizeLiteralValues_859 = tree => {
  ast.walk(tree, node => {
    if (node?.type === "Literal") node.value = typeof node.value;
  });
};

const deleteAttrsByNode_521 = tree => {
  ast.walk(tree, node => {
    if (node?.generator === false) delete node.generator;
    if (node?.sourceType === "module") delete node.sourceType;
  });
};

const organizeAttrsByNode_348 = node => {
  const arraySort = Object.entries(node).sort((a, b) => {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  });
  return Object.fromEntries(arraySort);
};

const cleanning_886 = tree => {
  return ast.replace(tree, node => {
    if (isObject(node?.expression)) node = convertArrowtoRegular(node);
    deleteAttrsByNode(tree);
    normalizeNamesByNode(tree);
    normalizeLiteralValues(tree);
    return organizeAttrsByNode(node);
  });
};

const printResults_828 = (title, astControl, astChallenge) => {
  console.log(title);
  console.log("ast-compare: ", compare(astControl, astChallenge));
  console.log("string-similarity (Dice's): ", stringSimilarity.compareTwoStrings(JSON.stringify(astControl), JSON.stringify(astChallenge)));
  console.log("string-comparison (Cosine): ", stringComparision.cosine.similarity(JSON.stringify(astControl), JSON.stringify(astChallenge)));
  console.log("string-comparison (Levenshtein): ", stringComparision.levenshtein.similarity(JSON.stringify(astControl), JSON.stringify(astChallenge)));
  console.log("string-comparison (Longest Common Subsequence): ", stringComparision.lcs.similarity(JSON.stringify(astControl), JSON.stringify(astChallenge)));
  console.log("string-comparison (Metric Longest Common Subsequence): ", stringComparision.mlcs.similarity(JSON.stringify(astControl), JSON.stringify(astChallenge)));
  console.log("---------------------------------------------------------------------------------------------------------");
};

const isDirectory_91 = (dirPath, file) => fs.statSync(dirPath + "/" + file).isDirectory();

const getAllFiles_907 = (dirPath, arrayOfFiles) => {
  arrayOfFiles = arrayOfFiles || [];
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (["__base-functions.js", "__similarity-matrix.js"].includes(file)) return;
    if (isDirectory(dirPath, file)) arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    if (!isDirectory(dirPath, file)) arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
  });
  return arrayOfFiles;
};

const addTreeWithNameHashed_5 = tree => {
  ast.walk(tree, node => {
    if (node?.type === "FunctionDeclaration" && node?.id?.name) node.id.name = `${node.id.name}_${Math.floor(Math.random() * 999 + 1)}`;
  });
  ast.walk(tree, (node, parent) => {
    if (node?.type === "ArrowFunctionExpression" && parent?.id?.name) parent.id.name = `${parent.id.name}_${Math.floor(Math.random() * 999 + 1)}`;
  });
};

const cloneDetection_466 = (functionsName, functionsArray) => {
  const arr = [];
  const parsedArray = functionsArray.map(element => parseOptmized(element));
  const cleannedTree = parsedArray.map(tree => JSON.stringify(cleanning(tree)));
  const arrayLength = cleannedTree.length;
  console.log(`\n✨✨ SÃO ${arrayLength + 1} FUNÇÕES SENDO ANALISADAS AOS PARES. ✨✨\n`);
  for (let i = 0; i < arrayLength; i++) {
    const treeControl = cleannedTree.splice(0, 1);
    let string = "";
    for (let j = 0; j < i; j++) {
      string += " 0.000";
    }
    string += " 1.000";
    for (let k = 0; k < cleannedTree.length; k++) {
      const simi = stringComparision.levenshtein.similarity(JSON.stringify(treeControl), JSON.stringify(cleannedTree[k]));
      string += ` ${simi.toFixed(3)}`;
    }
    console.log([i], string);
    arr.push(`${functionsName[i]} ${string}`);
  }
  fs.writeFileSync(`${process.cwd()}/__similarity-matrix.csv`, "");
  arr.forEach(el => {
    const content = fs.readFileSync(`${process.cwd()}/__similarity-matrix.csv`, "utf-8");
    fs.writeFileSync(`${process.cwd()}/__similarity-matrix.csv`, `${content}\n${el}`);
  });
  console.log(`\n⚡⚡ UMA MATRIZ QUADRADA FOI GERADA EM: ${process.cwd()}/__similarity-matrix.csv ⚡⚡\n`);
};

function fibonacciOne_458(n) {
  for (var fibonacci = [0, 1], i = 1; i < n; i++) fibonacci.push(fibonacci[i] + fibonacci[i - 1]);
  return fibonacci;
}

function fibonacciTwo_425() {
  var fib = [];
  fib[0] = 0;
  fib[1] = 1;
  for (var i = 2; i <= 10; i++) {
    fib[i] = fib[i - 2] + fib[i - 1];
    console.log(fib[i]);
  }
}

const arrowFunction_395 = value => {
  const {type} = value;
  return type;
};

function regularFunction_174(value) {
  const {type} = value;
  return type;
}

const arrowFour_775 = (op, valueOne, valueTwo) => {
  if (op === "sub") {
    return valueOne - valueTwo;
  } else {
    return valueOne + valueTwo;
  }
};

function regularFour_930(operation, firstValue, secondValue) {
  switch (operation) {
    case "sub":
      return firstValue - secondValue;
    default:
      return firstValue + secondValue;
  }
}

const arrowThree_395 = (state, value) => {
  if (state) {
    return value * 3.14;
  }
};

function regularThree_228(state, value) {
  const pi = 3.14;
  if (state) return value * pi;
}

const arrowTwo_583 = (op, valueOne, valueTwo) => {
  if (op === "sum") {
    return valueOne + valueTwo;
  } else {
    return valueOne - valueTwo;
  }
};

function regularTwo_387(state, vOne, vTwo) {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
}

const arrowFunction_533 = value => {
  const {type} = value;
  return type;
};

function regularFunction_110(value) {
  const {type} = value;
  return type;
}

const arrowFour_326 = (op, valueOne, valueTwo) => {
  if (op === "sub") {
    return valueOne - valueTwo;
  } else {
    return valueOne + valueTwo;
  }
};

function regularFour_13(operation, firstValue, secondValue) {
  switch (operation) {
    case "sub":
      return firstValue - secondValue;
    default:
      return firstValue + secondValue;
  }
}

function funcOne_891(valueOne, valueTwo) {
  return valueOne + valueTwo;
}

const funcOne_195 = (valueOne, valueTwo) => {
  return valueOne + valueTwo;
};

const arrowThree_801 = (state, value) => {
  if (state) {
    return value * 3.14;
  }
};

function regularThree_164(state, value) {
  const pi = 3.14;
  if (state) return value * pi;
}

const arrowTwo_853 = (op, valueOne, valueTwo) => {
  if (op === "sum") {
    return valueOne + valueTwo;
  } else {
    return valueOne - valueTwo;
  }
};

function regularTwo_295(state, vOne, vTwo) {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
}

function funcaoSemEXPORT_766(state, vOne, vTwo) {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
}

const arrowSemEXPORT_459 = (state, vOne, vTwo) => {
  if (state === "sum") {
    return vOne + vTwo;
  } else {
    return vOne - vTwo;
  }
};