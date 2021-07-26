<ref *3> {
  name: 'Program: source module',
  type: 'Program',
  key: 'program',
  isBodyEntry: false,
  body: [
    <ref *2> {
      name: '(state, value) =>',
      pathParentType: 'ExpressionStatement',
      type: 'Function',
      key: 'program',
      isBodyEntry: false,
      subType: 'ArrowFunctionExpression',
      body: [
        <ref *1> {
          name: '(state)',
          type: 'Conditional',
          key: 'body',
          isBodyEntry: false,
          subType: 'IfStatement',
          body: [
            {
              name: 'return value * 3.14',
              type: 'ReturnStatement',
              key: 'consequent',
              isBodyEntry: false,
              body: [],
              parent: [Circular *1]
            }
          ],
          parent: [Circular *2]
        }
      ],
      parent: [Circular *3]
    }
  ],
  parent: [ [Circular *3] ]
}