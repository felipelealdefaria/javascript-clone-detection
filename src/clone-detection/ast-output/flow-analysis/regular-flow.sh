<ref *3> {
  name: 'Program: source module',
  type: 'Program',
  key: 'program',
  isBodyEntry: false,
  body: [
    <ref *2> {
      name: 'function regularTwo(state, vOne, vTwo)',
      pathParentType: 'Program',
      type: 'Function',
      key: 'program',
      isBodyEntry: false,
      subType: 'FunctionDeclaration',
      body: [
        <ref *1> {
          name: "(state === 'sum')",
          type: 'Conditional',
          key: 'body',
          isBodyEntry: false,
          subType: 'IfStatement',
          body: [
            {
              name: 'return vOne + vTwo',
              type: 'ReturnStatement',
              key: 'consequent',
              isBodyEntry: false,
              body: [],
              parent: [Circular *1]
            },
            {
              name: 'return vOne - vTwo',
              type: 'ReturnStatement',
              key: 'alternate',
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