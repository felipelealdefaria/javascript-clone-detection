const espree = require("espree");

const onSubmit = (data) => {
  if (!data) return false
  const payload = data;
  try {
    axios.post(MY_ENDPOINT, payload);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  };
};

const tokens = espree.tokenize(onSubmit, { ecmaVersion: 6 });

// console.log(tokens);