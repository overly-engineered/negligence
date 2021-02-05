import { STRING, INT, FLOAT, BOOLEAN, BIGINT } from "./dataTypes.js";

export const generateRandomInt = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
export const generateRandomFloat = () => Math.random();
export const generateRandomString = () => makeString();
export const generateRandomBoolean = () => Math.random() < 0.5;
export const generateRandomBigInt = () => BigInt(Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER * 2)));

export default {
  [STRING]: generateRandomString,
  [INT]: generateRandomInt,
  [FLOAT]: generateRandomFloat,
  [BOOLEAN]: generateRandomBoolean,
  [BIGINT]: generateRandomBigInt
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
