{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'funcOne' },
      params: [
        { type: 'Identifier', name: 'valueOne' },
        { type: 'Identifier', name: 'valueTwo' }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'BinaryExpression',
              left: { type: 'Identifier', name: 'valueOne' },
              right: { type: 'Identifier', name: 'valueTwo' },
              operator: '+'
            }
          }
        ]
      },
      async: false,
      generator: false
    }
  ]
}