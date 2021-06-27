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
            kind: 'const',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: {
                  type: 'ObjectPattern',
                  properties: [
                    {
                      type: 'Property',
                      key: { type: 'Identifier', name: 'type' },
                      value: { type: 'Identifier', name: 'type' },
                      kind: 'init',
                      computed: false,
                      method: false,
                      shorthand: true
                    }
                  ]
                },
                init: { type: 'Identifier', name: 'value' }
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
      generator: false # remove
    }
  ]
}