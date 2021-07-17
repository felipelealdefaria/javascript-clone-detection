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
            type: 'ReturnStatement',
            argument: {
              type: 'BinaryExpression',
              right: { type: 'Identifier', name: 'identifier_name' },
              operator: '+',
              left: { type: 'Identifier', name: 'identifier_name' }
            }
          }
        ]
      },
      async: false
    }
  ]
}