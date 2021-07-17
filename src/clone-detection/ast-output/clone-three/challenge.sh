{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [
        { type: 'Identifier', name: 'identifier_name' },
        { type: 'Identifier', name: 'identifier_name' }
      ],
      id: { type: 'Identifier', name: 'identifier_name' },
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
                id: { type: 'Identifier', name: 'identifier_name' }
              }
            ]
          },
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'identifier_name' },
            consequent: {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                right: { type: 'Identifier', name: 'identifier_name' },
                operator: '*',
                left: { type: 'Identifier', name: 'identifier_name' }
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