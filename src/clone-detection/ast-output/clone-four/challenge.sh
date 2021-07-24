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
            type: 'SwitchStatement',
            discriminant: { type: 'Identifier', name: 'switchstatement_name' },
            cases: [
              {
                type: 'SwitchCase',
                test: { value: 'string', type: 'Literal' },
                consequent: [
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
              },
              {
                type: 'SwitchCase',
                test: null,
                consequent: [
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
              }
            ]
          }
        ]
      },
      async: false
    }
  ]
}