{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [
        { type: 'Identifier', name: 'state' },
        { type: 'Identifier', name: 'value' }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'state' },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'BinaryExpression',
                    left: { type: 'Identifier', name: 'value' },
                    right: { type: 'Literal', value: 'number' },
                    operator: '*'
                  }
                }
              ]
            },
            alternate: null
          }
        ]
      },
      async: false,
      id: { type: 'Identifier', name: 'function_name' }
    }
  ]
}