const { walk } = require("abstract-syntax-tree");

export const normalizeNamesByNode = (tree: any): void => {
  walk(tree, (node: any, parent: any) => {
    if (node.name) node.name = `${parent.type}_name`.toLowerCase()
  })
}

export const normalizeLiteralValues = (tree: any): void => {
  walk(tree, (node: any) => {
    if (node.type === 'Literal') node.value = `${node.type}_value`.toLowerCase()
  })
}