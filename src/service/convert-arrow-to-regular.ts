import { isObject } from '../libs/is-object'
const { replace } = require("abstract-syntax-tree");

export const convertArrowtoRegular = (tree: any): any => {
  replace(tree, (node: any) => {
    if (isObject(node.expression)) {
      node = { ...node.expression }
      node.id = { type: 'Identifier', name: 'function_name' }
      if (node.type === 'ArrowFunctionExpression') node.type = 'FunctionDeclaration'
    
      const { expression, ...convertedNode } = node
      return convertedNode
    }
    return node;
  })
}