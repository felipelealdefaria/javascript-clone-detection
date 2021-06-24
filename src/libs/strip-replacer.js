export const stripReplacer = (key, value) => {
  switch (key) {
      case "start":
      case "end":
      case "loc":
      case "extra":
      case "comments":
      case "leadingComments":
      case "trailingComments":
          return undefined;
      default:
          return value
  }
}