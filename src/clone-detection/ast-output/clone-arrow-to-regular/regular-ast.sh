{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [ { type: 'Identifier', name: 'identifier_name' } ],
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
                init: { type: 'Identifier', name: 'identifier_name' },
                id: {
                  type: 'ObjectPattern',
                  properties: [
                    {
                      value: { type: 'Identifier', name: 'identifier_name' },
                      type: 'Property',
                      shorthand: true,
                      method: false,
                      kind: 'init',
                      key: { type: 'Identifier', name: 'identifier_name' },
                      computed: false
                    }
                  ]
                }
              }
            ]
          },
          {
            type: 'ReturnStatement',
            argument: { type: 'Identifier', name: 'identifier_name' }
          }
        ]
      },
      async: false
    }
  ]
}