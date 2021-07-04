const espree = require("espree")
import { arrowFunction } from './arrow';
import { regularFunction } from './regular';
import { writeFile } from '../../libs/write-file';
import { astResults } from '../../libs/ast-results';
const { parse, binaryExpressionReduction } = require('abstract-syntax-tree');

const regularTree = binaryExpressionReduction(parse(`${regularFunction}`, { module: true, next: true, jsx: true }));
const arrowTree = binaryExpressionReduction(parse(`${arrowFunction}`, { module: true, next: true, jsx: true }));

// console.log(espree.parse(`${regularFunction}`, { ecmaVersion: 6 }));

writeFile('src/ast-output/arrow-to-regular/original/arrow.sh', arrowTree)
writeFile('src/ast-output/arrow-to-regular/original/regular.sh', regularTree)
writeFile('src/ast-output/arrow-to-regular/original/results.sh', astResults(arrowTree, regularTree))
