{
  type: 'Program',
  body: [
    {
      type: 'FunctionDeclaration',
      params: [ { type: 'Identifier', name: 'params_name' } ],
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
                init: { type: 'Identifier', name: 'variabledeclarator_name' },
                id: {
                  type: 'ObjectPattern',
                  properties: [
                    {
                      value: { type: 'Identifier', name: 'property_name' },
                      type: 'Property',
                      shorthand: true,
                      method: false,
                      kind: 'init',
                      key: { type: 'Identifier', name: 'property_name' },
                      computed: false
                    }
                  ]
                }
              }
            ]
          },
          {
            type: 'ReturnStatement',
            argument: { type: 'Identifier', name: 'returnstatement_name' }
          }
        ]
      },
      async: false
    }
  ]
}