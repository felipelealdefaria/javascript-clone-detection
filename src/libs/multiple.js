const util = require('util')
const espree = require("espree");
const stringSimilarity = require("string-similarity");

const babelParse = (text) => {
  return espree.parse(text, { ecmaVersion: 6 })
};

const multipleValueArrowFunction =  (value) => {
  if (!value) return 'error';
  const data = value;
  return data * 3;
};

function multipleValueRegularFunction (value) {
  // return 'error' if dont exists value
  if (!value) return 'error';
  return value * 3;
};

const arrow = babelParse(multipleValueArrowFunction);
const regular = babelParse(multipleValueRegularFunction);

// console.log('arrow: ', util.inspect(arrow, false, null, true));
// console.log(' ');
// console.log(' ');
// console.log('_______________________________________________');
// console.log(' ');
// console.log(' ');
// console.log('regular: ', util.inspect(regular, false, null, true));

// const preProcessing = (ast) => {
//   const { start, end, ...newAst } = ast;
//   console.log(newAst);
//   console.log('_______________________________________________');
//   return newAst;
// }

// const traverseObject = (object) => {
//   const cleannedObject = preProcessing(object);
//   for (attr in cleannedObject) {
//     console.log(attr);
//     if (Array.isArray(cleannedObject[attr])) return mapperAttr(cleannedObject[attr]);
//     if (typeof cleannedObject[attr] === 'object' && cleannedObject[attr] !== null) return traverseObject(cleannedObject[attr]);
//   }
//   return cleannedObject;
// };

// const mapperAttr = (attr) => {
//   if (!Array.isArray(attr)) return;
//   attr.map(element => traverseObject(element));
// };




















// -> percorrer o objeto removendo os attrs
// (start e end) e verificando se existe um
// outro objeto (node) e repetir o processo

const cleaningAST = (entryAST) => {
  return Object.entries(entryAST).reduce((cleanedAST, [key, value]) => {
    
    if (['end', 'start'].includes(key)) return cleanedAST;

    if (Array.isArray(value)) {
      cleanedAST[key] = value.map(cleaningAST)
    } else if (typeof value === 'object' && value !== null) {
      cleanedAST[key] = cleaningAST(value)
    } else {
      cleanedAST[key] = value
    }

    return cleanedAST
  }, {})
}

const arrowAST = JSON.stringify(cleaningAST(arrow), null, 2);
const regularAST = JSON.stringify(cleaningAST(regular), null, 2);

const similarity = stringSimilarity.compareTwoStrings(JSON.stringify(arrow, null, 2), JSON.stringify(regular, null, 2));
console.log(similarity);

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