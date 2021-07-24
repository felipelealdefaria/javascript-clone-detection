{
  type: 'Program',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [
        { type: 'Identifier', name: 'params_name' },
        { type: 'Identifier', name: 'params_name' },
        { type: 'Identifier', name: 'params_name' }
      ],
      id: { type: 'Identifier', name: 'functiondeclaration_name' },
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: {
              type: 'BinaryExpression',
              right: { value: 'string', type: 'Literal' },
              operator: '===',
              left: { type: 'Identifier', name: 'binaryexpression_name' }
            },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'BinaryExpression',
                    right: {
                      type: 'Identifier',
                      name: 'binaryexpression_name'
                    },
                    operator: '+',
                    left: {
                      type: 'Identifier',
                      name: 'binaryexpression_name'
                    }
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
                    right: {
                      type: 'Identifier',
                      name: 'binaryexpression_name'
                    },
                    operator: '-',
                    left: {
                      type: 'Identifier',
                      name: 'binaryexpression_name'
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      async: false
    }
  ]
}