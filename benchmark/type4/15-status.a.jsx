export function StatusMessage({ status, error }) {
  if (status === 'loading') {
    return <p className="muted">Loading…</p>
  }
  if (status === 'error') {
    return <p className="error">Something went wrong: {error.message}</p>
  }
  return <p className="ok">All good</p>
}
