var espree = require("espree"); // hash

function onSubmit(data) {
  if (!data) return false // hash
  var payload = data; // hash
  var something = 'string'; // hash
  try {
    axios.post(MY_ENDPOINT, payload); // hash
    return true; // hash
  } catch (e) {
    console.error(e); // hash
    return false; // hash
  };
}

var ast = espree.parse(onSubmit); // hash

// console.log(ast); // hash

// Conjunto com 6 hashes (onSubmit);