{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'regularFunction' },
      params: [ { type: 'Identifier', name: 'value' } ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'var',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'type' },
                init: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'value' },
                  computed: false,
                  property: { type: 'Identifier', name: 'type' }
                }
              }
            ]
          },
          {
            type: 'ReturnStatement',
            argument: { type: 'Identifier', name: 'type' }
          }
        ]
      },
      async: false,
      generator: false
    }
  ]
}