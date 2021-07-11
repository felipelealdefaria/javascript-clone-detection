{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'regularFour' },
      params: [
        { type: 'Identifier', name: 'operation' },
        { type: 'Identifier', name: 'firstValue' },
        { type: 'Identifier', name: 'secondValue' }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'SwitchStatement',
            discriminant: { type: 'Identifier', name: 'operation' },
            cases: [
              {
                type: 'SwitchCase',
                test: { type: 'Literal', value: 'string' },
                consequent: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      left: { type: 'Identifier', name: 'firstValue' },
                      right: { type: 'Identifier', name: 'secondValue' },
                      operator: '-'
                    }
                  }
                ]
              },
              {
                type: 'SwitchCase',
                test: null,
                consequent: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      left: { type: 'Identifier', name: 'firstValue' },
                      right: { type: 'Identifier', name: 'secondValue' },
                      operator: '+'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      async: false,
      generator: false
    }
  ]
}