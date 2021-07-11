{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
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
      id: { type: 'Identifier', name: 'function_name' }
    }
  ]
}