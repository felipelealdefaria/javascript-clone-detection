import { compare } from 'ast-compare';
import stringSimilarity from 'string-similarity';
const stringComparision = require('string-comparison');

export const astResults = (astPrimary: any, astSecondary: any) => {
  return (`
    ast-compare: ${compare(astPrimary, astSecondary)}
    string-similarity: ${stringSimilarity.compareTwoStrings(JSON.stringify(astPrimary), JSON.stringify(astSecondary))}
    string-comparison (Cosine): ${stringComparision.cosine.similarity(JSON.stringify(astPrimary), JSON.stringify(astSecondary))}
    string-comparison (Levenshtein): ${stringComparision.levenshtein.similarity(JSON.stringify(astPrimary), JSON.stringify(astSecondary))}
    string-comparison (Longest Common Subsequence): ${stringComparision.lcs.similarity(JSON.stringify(astPrimary), JSON.stringify(astSecondary))}
    string-comparison (Metric Longest Common Subsequence): ${stringComparision.mlcs.similarity(JSON.stringify(astPrimary), JSON.stringify(astSecondary))}
  `)
} 