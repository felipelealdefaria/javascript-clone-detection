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
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                type: 'VariableDeclarator',
                init: { value: 'number', type: 'Literal' },
                id: { type: 'Identifier', name: 'variabledeclarator_name' }
              }
            ]
          },
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'ifstatement_name' },
            consequent: {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                right: { type: 'Identifier', name: 'binaryexpression_name' },
                operator: '*',
                left: { type: 'Identifier', name: 'binaryexpression_name' }
              }
            },
            alternate: null
          }
        ]
      },
      async: false
    }
  ]
}