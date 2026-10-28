export const dedupeByField = (records, field) =>
  records.filter(
    (record, index) => records.findIndex((other) => other[field] === record[field]) === index,
  )
