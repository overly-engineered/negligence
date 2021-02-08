import generateMockData from "./data.js";
// Takes in the string and constructs it into a function
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const executeAsync = async (fn, args) => {
  return new AsyncFunction(
    "args",
    `"use strict";
      let fn = ${fn};
      let returnValue;
      try {
        returnValue = await fn(args);
      } catch (e) {
        throw new Error("Error running provided function", e);
      }
    return returnValue;`
  )(args);
};

const execute = async (fn, args) => {
  let returnValue;
  try {
    returnValue = await fn(args);
  } catch (e) {
    throw new Error("Error running provided function", e);
  }
  return returnValue;
};

const executor = async (fn, { complexity, schema, arrayAmount, isNode } = {}) => {
  let timings = {};
  const envExecutor = typeof fn === "string" ? executeAsync : execute;
  for (let i = 0; i < arrayAmount; i++) {
    if (!timings[complexity]) {
      timings[complexity] = [];
    }
    const data = generateMockData({ schema, complexity });
    let hrStart;
    if (isNode) {
      hrStart = process.hrtime();
      timings[complexity].push({ start: hrStart });
    } else {
      timings[complexity].push({ start: performance.now() });
    }
    try {
      await envExecutor(fn, data);
    } catch (e) {
      throw new Error("Error running provided function", e);
    }
    if (isNode) {
      timings[complexity][i].end = process.hrtime(hrStart);
    } else {
      timings[complexity][i].end = performance.now();
    }
    if (i === arrayAmount - 1) {
      return timings;
    }
  }
};

export default executor;
