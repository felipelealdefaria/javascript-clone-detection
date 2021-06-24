import { parser } from "@babel/parser";

export const parse = (text, plugins = []) => {
  return parser.parse(text, {
      sourceType: "module",
      plugins: plugins.concat([
          'doExpressions',
          'objectRestSpread',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'asyncGenerators',
          'functionBind',
          'functionSent',
          'dynamicImport',
          'numericSeparator',
          'optionalChaining',
          'importMeta',
          'bigInt',
          'optionalCatchBinding',
          'throwExpressions'
      ]),
      ranges: false
  });
};