// Precision
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

const PRECISE = "precise";
const STANDARD = "standard";
const QUICK = "quick";
const precisionAmounts = {
  [PRECISE]: 10_000,
  [STANDARD]: 1_000,
  [QUICK]: 100
};

import generateMockData from "./data.js";

const executor = async (fn, { precision = STANDARD, complexity, schema } = {}) => {
  const arrayAmount = (() => {
    const e = `Invalid precision provided(${precision}). Allowed values are 'precise', 'standard', 'quick', or an integer`;
    if (typeof precision === "object") {
      throw new Error(e);
    } else if (Number.isInteger(precision)) {
      return precision;
    } else if (precisionAmounts[precision]) {
      return precisionAmounts[precision];
    }
    throw new Error(e);
  })();
  let timings = {};
  let abort = false;
  const executions = [];
  const envExecutor = typeof fn === "string" ? executeAsync : execute;
  for (let i = 0; i < arrayAmount; i++) {
    if (abort) continue;
    const data = generateMockData({ schema, complexity });
    timings[i] = { start: Date.now() };
    const run = envExecutor(fn, data)
      .then(d => {
        timings[i].end = Date.now();
        return d;
      })
      .catch(e => {
        abort = true;
        throw e;
      });
    executions.push(run);
  }
  return Promise.all(executions)
    .then(data => {
      return { data, results: timings };
    })
    .catch(e => {
      throw e;
    });
};

export default executor;
