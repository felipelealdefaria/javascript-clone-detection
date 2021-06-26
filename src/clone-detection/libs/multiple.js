const espree = require('espree')
const stringSimilarity = require('string-similarity')

const babelParse = (text) => {
  return espree.parse(text, { ecmaVersion: 6 })
}

const multipleValueArrowFunction = (value) => {
  if (!value) return 'error'
  const data = value
  return data * 3
}

function multipleValueRegularFunction (value) {
  // return 'error' if dont exists value
  if (!value) return 'error'
  return value * 3
};

const arrow = babelParse(multipleValueArrowFunction)
const regular = babelParse(multipleValueRegularFunction)

// ----------------------------------------------------------------

const cleaningAST = (entryAST) => {
  return Object.entries(entryAST).reduce((cleanedAST, [key, value]) => {
    if (['end', 'start'].includes(key)) return cleanedAST
    if (isObject(value)) cleanedAST[key] = cleaningAST(value)
    if (Array.isArray(value)) cleanedAST[key] = value.map(cleaningAST)
    if (!Array.isArray(value) && !isObject(value)) cleanedAST[key] = value

    return cleanedAST
  }, {})
}

const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const arrowAST = JSON.stringify(cleaningAST(arrow), null, 2)
const regularAST = JSON.stringify(cleaningAST(regular), null, 2)

const similarity = stringSimilarity.compareTwoStrings(JSON.stringify(arrowAST, null, 2), JSON.stringify(regularAST, null, 2))
console.log(arrowAST, similarity)

// tem o mesmo resultado quando nao temos em representacao AST
// ler artigo do GPT-2 (normalizacao)
// utilizar mais de uma lib de comparacao de strings

// HIPOTESE: quanto mais lixo removermos da AST, maior sera o grau de similaridade
// -> proxima etapa sera:
// 1) descobrir o que mais poderá ser limpo na AST
// 2) processo de normalizaçao de nomes de funcoes e variaveis (converter type: 'ArrowFunctionExpression' -> type: 'FunctionDeclaration')

// -> para implementar o modelo treinado, posso fazer um script para clonar
// projetos React.Js no github e realizar pequenas alteraçoes (nome de variavel,
// comentarios, layout), mas essa tecnica sera dificil de aplicar pra clones do tipo 3 e tipo 4

// -> a comparação dos clones podem ser feitas em duas etapas:
// 1) comparar cada bloco de codigo separadamente dentro do proprio arquivo
// 2) comparar arquivos com outros arquivos
// ((melhora de processamento) arquivos A e B comparados nao serao comparados novamente quando for B e A)
