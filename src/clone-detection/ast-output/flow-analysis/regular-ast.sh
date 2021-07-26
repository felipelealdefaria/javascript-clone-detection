{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'regularTwo' },
      params: [
        { type: 'Identifier', name: 'state' },
        { type: 'Identifier', name: 'vOne' },
        { type: 'Identifier', name: 'vTwo' }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: {
              type: 'BinaryExpression',
              left: { type: 'Identifier', name: 'state' },
              right: { type: 'Literal', value: 'sum' },
              operator: '==='
            },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'BinaryExpression',
                    left: { type: 'Identifier', name: 'vOne' },
                    right: { type: 'Identifier', name: 'vTwo' },
                    operator: '+'
                  }
                }
              ]
            },
            alternate: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'BinaryExpression',
                    left: { type: 'Identifier', name: 'vOne' },
                    right: { type: 'Identifier', name: 'vTwo' },
                    operator: '-'
                  }
                }
              ]
            }
          }
        ]
      },
      async: false,
      generator: false
    }
  ]
}