// import util from 'util'
import { compare } from 'ast-compare'
import stringSimilarity from 'string-similarity'
import stringComparision from 'string-comparison'

export const printResults = (title, astControl, astChallenge) => {
  console.log(title);
  // console.log('ast-compare: ', compare(astControl, astChallenge))
  console.log("string-similarity (Dice's): ", stringSimilarity.compareTwoStrings(`${astControl}`, `${astChallenge}`))
  console.log('string-comparison (Cosine): ', stringComparision.cosine.similarity(`${astControl}`, `${astChallenge}`))
  console.log('string-comparison (Levenshtein): ', stringComparision.levenshtein.similarity(`${astControl}`, `${astChallenge}`))
  console.log('string-comparison (Longest Common Subsequence): ', stringComparision.lcs.similarity(`${astControl}`, `${astChallenge}`))
  console.log('string-comparison (Metric Longest Common Subsequence): ', stringComparision.mlcs.similarity(`${astControl}`, `${astChallenge}`))
  
  // console.log(util.inspect(astControl, false, null))
  // console.log(util.inspect(astChallenge, false, null))
  
  console.log('---------------------------------------------------------------------------------------------------------')
}