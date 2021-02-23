const { STRING, INT, FLOAT, BOOLEAN, BIGINT } = require("./dataTypes.js");

const generateRandomInt = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
const generateRandomFloat = () => Math.random();
const generateRandomString = () => makeString();
const generateRandomBoolean = () => Math.random() < 0.5;
const generateRandomBigInt = () => BigInt(Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER * 2)));

module.exports = {
  typeMap: {
    [STRING]: generateRandomString,
    [INT]: generateRandomInt,
    [FLOAT]: generateRandomFloat,
    [BOOLEAN]: generateRandomBoolean,
    [BIGINT]: generateRandomBigInt
  }
};

const makeString = (len = 30) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++) {
    if (Math.random() < 0.1) {
      text += " ";
    }
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};
