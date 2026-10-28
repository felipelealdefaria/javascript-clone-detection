export function search(list, wanted, from = 0, to = list.length - 1) {
  if (from > to) {
    return -1
  }
  const middle = (from + to) >> 1
  switch (Math.sign(list[middle] - wanted)) {
    case 0:
      return middle
    case 1:
      return search(list, wanted, from, middle - 1)
    default:
      return search(list, wanted, middle + 1, to)
  }
}
