const espree = require("espree"); // hash

const onSubmit = (data) => {
  if (!data) return false; //hash
  var payload = data; //hash
  try {
    axios.post(MY_ENDPOINT, payload); //hash
    return true; //hash
  } catch (e) {
    console.error(e); //hash
    return false; //hash
  };
};

const ast = espree.parse(onSubmit); // hash

// console.log(ast); // hash

// Conjunto com 6 hashes (onSubmit);
// S = 6
// L = 0
// R = 1

2 * 6 / ( 2 * 6 + 0 + 1)