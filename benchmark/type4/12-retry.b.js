export function retry(operation, retriesLeft = 3, wait = 100, round = 1) {
  return operation().catch((err) => {
    if (retriesLeft <= 1) return Promise.reject(err)
    return new Promise((done) => setTimeout(done, wait * round)).then(() =>
      retry(operation, retriesLeft - 1, wait, round + 1),
    )
  })
}
