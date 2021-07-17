{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [
        { type: 'Identifier', name: 'identifier_name' },
        { type: 'Identifier', name: 'identifier_name' },
        { type: 'Identifier', name: 'identifier_name' }
      ],
      id: { type: 'Identifier', name: 'identifier_name' },
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'SwitchStatement',
            discriminant: { type: 'Identifier', name: 'identifier_name' },
            cases: [
              {
                type: 'SwitchCase',
                test: { value: 'string', type: 'Literal' },
                consequent: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      right: { type: 'Identifier', name: 'identifier_name' },
                      operator: '-',
                      left: { type: 'Identifier', name: 'identifier_name' }
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
                      right: { type: 'Identifier', name: 'identifier_name' },
                      operator: '+',
                      left: { type: 'Identifier', name: 'identifier_name' }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      async: false
    }
  ]
}