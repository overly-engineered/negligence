// Precision
// Takes in the string and constructs it into a function
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const executeAsync = async (fn, args) => {
  return new AsyncFunction(
    "args",
    '"use strict"; return new Promise(async (resolve,reject) => {const fn = ' +
      fn +
      "; const returnValue = await fn(args); resolve(returnValue)})"
  )(args);
};

const execute = async (fn, args) => {
  return new Promise(async (resolve, reject) => {
    try {
      const returnValue = await fn(args);
      resolve(returnValue);
    } catch (e) {
      console.error(e);
    }
  });
};

const PRECISE = "precise";
const STANDARD = "standard";
const QUICK = "quick";
const precisionAmounts = {
  [PRECISE]: 10_000,
  [STANDARD]: 1_000,
  [QUICK]: 100
};

import generateMockData from "./data.js";

const executor = async (fn, { precision = STANDARD, complexity, schema }) => {
  let arrayAmount = Number.isInteger(precision) ? precision : precisionAmounts[precision];
  let timings = {};
  const executions = [];
  const envExecutor = typeof fn === "string" ? executeAsync : execute;
  for (let i = 0; i < arrayAmount; i++) {
    const data = generateMockData({ schema, complexity });
    timings[i] = { start: Date.now() };
    const run = envExecutor(fn, data).then(d => {
      timings[i].end = Date.now();
      return d;
    });
    executions.push(run);
  }
  return Promise.all(executions).then(data => {
    return { data, results: timings };
  });
};

export default executor;
