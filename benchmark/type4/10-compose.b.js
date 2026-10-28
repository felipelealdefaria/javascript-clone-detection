export const flow =
  (...steps) =>
  (start) =>
    steps.reduce((current, step) => step(current), start)
