export const splitIntoBatches = (items, batchSize) =>
  Array.from({ length: Math.ceil(items.length / batchSize) }, (_, batch) =>
    items.slice(batch * batchSize, (batch + 1) * batchSize),
  )
