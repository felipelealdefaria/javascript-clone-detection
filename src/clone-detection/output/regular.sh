Node {
  type: 'Program',
  start: 0,
  end: 140,
  body: [
    Node {
      type: 'FunctionDeclaration',
      start: 0,
      end: 140,
      id: Node {
        type: 'Identifier',
        start: 9,
        end: 37,
        name: 'multipleValueRegularFunction'
      },
      expression: false,
      generator: false,
      params: [
        Node { type: 'Identifier', start: 39, end: 44, name: 'value' }
      ],
      body: Node {
        type: 'BlockStatement',
        start: 46,
        end: 140,
        body: [
          Node {
            type: 'IfStatement',
            start: 91,
            end: 118,
            test: Node {
              type: 'UnaryExpression',
              start: 95,
              end: 101,
              operator: '!',
              prefix: true,
              argument: Node {
                type: 'Identifier',
                start: 96,
                end: 101,
                name: 'value'
              }
            },
            consequent: Node {
              type: 'ReturnStatement',
              start: 103,
              end: 118,
              argument: Node {
                type: 'Literal',
                start: 110,
                end: 117,
                value: 'error',
                raw: "'error'"
              }
            },
            alternate: null
          },
          Node {
            type: 'ReturnStatement',
            start: 121,
            end: 138,
            argument: Node {
              type: 'BinaryExpression',
              start: 128,
              end: 137,
              left: Node {
                type: 'Identifier',
                start: 128,
                end: 133,
                name: 'value'
              },
              operator: '*',
              right: Node {
                type: 'Literal',
                start: 136,
                end: 137,
                value: 3,
                raw: '3'
              }
            }
          }
        ]
      }
    }
  ],
  sourceType: 'script'
}