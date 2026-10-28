const VIEWS = {
  loading: () => <p className="muted">Loading…</p>,
  error: ({ error }) => <p className="error">Something went wrong: {error.message}</p>,
}

export const StatusMessage = (props) => {
  const View = VIEWS[props.status]
  return View ? <View {...props} /> : <p className="ok">All good</p>
}
