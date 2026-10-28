export const groupBy = (list, keyFn) =>
  list.reduce((acc, element) => {
    const groupKey = keyFn(element)
    return { ...acc, [groupKey]: [...(acc[groupKey] ?? []), element] }
  }, {})
