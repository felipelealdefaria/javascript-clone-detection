{
  type: 'Program',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [
        { type: 'Identifier', name: 'params_name' },
        { type: 'Identifier', name: 'params_name' }
      ],
      id: { type: 'Identifier', name: 'functiondeclaration_name' },
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'ifstatement_name' },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'BinaryExpression',
                    right: { value: 'number', type: 'Literal' },
                    operator: '*',
                    left: {
                      type: 'Identifier',
                      name: 'binaryexpression_name'
                    }
                  }
                }
              ]
            },
            alternate: null
          }
        ]
      },
      async: false
    }
  ]
}