{
  type: 'Program',
  start: 0,
  end: 85,
  body: [
    {
      type: 'ExpressionStatement',
      start: 0,
      end: 85,
      expression: {
        type: 'ArrowFunctionExpression',
        start: 0,
        end: 85,
        id: null,
        expression: false,
        generator: false,
        params: [
          { type: 'Identifier', start: 1, end: 6, name: 'value' }
        ],
        body: {
          type: 'BlockStatement',
          start: 11,
          end: 85,
          body: [
            {
              type: 'IfStatement',
              start: 15,
              end: 42,
              test: {
                type: 'UnaryExpression',
                start: 19,
                end: 25,
                operator: '!',
                prefix: true,
                argument: {
                  type: 'Identifier',
                  start: 20,
                  end: 25,
                  name: 'value'
                }
              },
              consequent: {
                type: 'ReturnStatement',
                start: 27,
                end: 42,
                argument: {
                  type: 'Literal',
                  start: 34,
                  end: 41,
                  value: 'error',
                  raw: "'error'"
                }
              },
              alternate: null
            },
            {
              type: 'VariableDeclaration',
              start: 45,
              end: 64,
              declarations: [
                {
                  type: 'VariableDeclarator',
                  start: 51,
                  end: 63,
                  id: {
                    type: 'Identifier',
                    start: 51,
                    end: 55,
                    name: 'data'
                  },
                  init: {
                    type: 'Identifier',
                    start: 58,
                    end: 63,
                    name: 'value'
                  }
                }
              ],
              kind: 'const'
            },
            {
              type: 'ReturnStatement',
              start: 67,
              end: 83,
              argument: {
                type: 'BinaryExpression',
                start: 74,
                end: 82,
                left: {
                  type: 'Identifier',
                  start: 74,
                  end: 78,
                  name: 'data'
                },
                operator: '*',
                right: {
                  type: 'Literal',
                  start: 81,
                  end: 82,
                  value: 3,
                  raw: '3'
                }
              }
            }
          ]
        }
      }
    }
  ],
  sourceType: 'script'
}