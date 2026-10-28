export function binarySearch(sorted, target) {
  let low = 0
  let high = sorted.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (sorted[mid] === target) return mid
    if (sorted[mid] < target) low = mid + 1
    else high = mid - 1
  }
  return -1
}
