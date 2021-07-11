{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'regularThree' },
      params: [
        { type: 'Identifier', name: 'state' },
        { type: 'Identifier', name: 'value' }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'pi' },
                init: { type: 'Literal', value: 'number' }
              }
            ]
          },
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'state' },
            consequent: {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                left: { type: 'Identifier', name: 'value' },
                right: { type: 'Identifier', name: 'pi' },
                operator: '*'
              }
            },
            alternate: null
          }
        ]
      },
      async: false,
      generator: false
    }
  ]
}