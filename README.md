# JavaScript Clone Detection - (v0.1.0)

Academic study project on JavaScript code duplication using AST parsing with text similarity and machine learning techniques.

## Current Process

We select a piece of code to convert it into an Abstract Syntax Tree (AST) representation. Then, the cleaning and normalization phase is carried out, in which we remove unwanted attributes and apply a standardization between similar structures, such as the example of an arrow function for a regular function.

``` javascript
// the both code snippets are characterized as type 2 clone

const arrowFunction = (value) => {
  const { type } = value
  return type
}

function regularFunction(value) {
  // this is a regular function
  const { type } = value
  return type
};
```

<!-- imagem da representacao em ast de cada modelo e o resultado -->

To perform a representation of code snippets in AST, we have good libraries like:

|                                    Library                                       |    Version    |
|----------------------------------------------------------------------------------|:-------------:|
|[espree](https://github.com/eslint/espree)                                        |     7.3.1     |
|[@babel/parser](https://github.com/babel/babel/tree/main/packages/babel-parser)   |    7.14.7     |
|[abstract-syntax-tree](https://github.com/buxlabs/abstract-syntax-tree)           |    2.19.1     |


```In this project we are using abstract-syntax-tree because it is a library that offers greater facilities to manipulate an AST.```

## Similarity between ASTs

To perform the comparison between ASTs, even in this current version, we had two options, namely: i) Comparison between pure ASTs where we only have the return if they are identical or not, or; ii) Convert the ASTs to text (string) and use libraries that check the textual similarity between the code snippets.

|                                 Library                                |    Version    |        Type       |
|------------------------------------------------------------------------|:-------------:|:-----------------:|
|[ast-compare](https://codsen.com/os/ast-compare)                        |     2.1.0     |    Compare ASTs   |
|[string-similarity](https://github.com/aceakash/string-similarity)      |     4.0.4     |  Compare strings  |
|[string-comparison](https://github.com/Rabbitzzc/js-string-comparision) |     1.0.9     |  Compare strings  |

The decision to compare ASTs directly seems to be the most coherent decision, but so far lib ast-compare can only identify whether the pieces are identical or not. In this scenario, using the representation of Abstract Syntax Trees still gives us the advantage of being a uniform and easy-to-manipulate representation for pre-processing and normalizations, in addition to transforming it into text so that it can be compared as a textual element.

<!-- ## Contextualizacao sobre abordagens de comparacao textual -->

## Results

Using the code snippets examples above, we have:

### No pre-processing and normalization

```javascript
ast-compare:  false
string-similarity:  0.925351071692535
string-comparison (Cosine):  0.9672041516493517
string-comparison (Levenshtein):  0.9072164948453608
string-comparison (Longest Common Subsequence):  0.9357933579335793
string-comparison (Metric Longest Common Subsequence):  0.9337260677466863
```

### With pre-processing and normalization

```javascript
ast-compare:  false
string-similarity:  0.9852941176470589
string-comparison (Cosine):  1.0000000000000002
string-comparison (Levenshtein):  0.8855072463768116
string-comparison (Longest Common Subsequence):  0.9383259911894273
string-comparison (Metric Longest Common Subsequence):  0.9260869565217391
```

To learn more about the issues addressed, read: [ESTUDO EMPÍRICO SOBRE DUPLICAÇÃO DE CÓDIGO EM APLICAÇÕES REACT.JS](https://drive.google.com/file/d/1MN8iBSfdD1yGMQ9aV-jwjdwJvRckiLfy/view?usp=sharing).
