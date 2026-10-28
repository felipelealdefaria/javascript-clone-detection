export async function withRetry(task, attempts = 3, delayMs = 100) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await task()
    } catch (error) {
      if (attempt === attempts) throw error
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }
}
