{
  type: 'Program',
  sourceType: 'module',
  body: [
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'state' },
          { type: 'Identifier', name: 'value' }
        ],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Identifier', name: 'state' },
              consequent: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      left: { type: 'Identifier', name: 'value' },
                      right: { type: 'Literal', value: 3.14 },
                      operator: '*'
                    }
                  }
                ]
              },
              alternate: null
            }
          ]
        },
        async: false,
        expression: false
      }
    }
  ]
}