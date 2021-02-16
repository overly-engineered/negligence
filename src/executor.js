const { generateMockData } = require("./data.js");
// Takes in the string and constructs it into a function
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const executeString = async ({ fn, data }) => {
  let result = await new AsyncFunction(
    "data",
    `"use strict";
      let fn = ${fn};
      let returnValue;
      returnValue = await fn(data);
    return returnValue;`
  )(data);
  return result;
};

/* For ultimate security we should exec this in a vm. I think its ok though, As the original code should still have the context of the vm the file was parsed in. */

// const exec = async ({ fn, data }) => {
//   let script = new vm.Script(`(${fn})(data)`);
//   const context = vm.createContext({
//     data,
//     console: {
//       log: (...args) => {
//         console.log(...args);
//       }
//     }
//   });
//   script.runInNewContext(context)
// };

const execute = async ({ fn, data }) => {
  return await fn(data);
};

const executor = async (fn, { complexity, schema, arrayAmount, isNode } = {}) => {
  let timings = {};
  const envExecutor = typeof fn === "string" ? executeString : execute;
  for (let i = 0; i < arrayAmount; i++) {
    if (!timings[complexity]) {
      timings[complexity] = [];
    }
    const data = generateMockData({ schema, complexity });
    let hrStart;
    if (isNode) {
      hrStart = process.hrtime();
    } else {
      timings[complexity].push({ start: performance.now() });
    }
    await envExecutor({ fn, data, isNode });
    if (isNode) {
      timings[complexity][i] = process.hrtime(hrStart);
    } else {
      timings[complexity][i].end = performance.now();
    }
    if (i === arrayAmount - 1) {
      return timings;
    }
  }
};

module.exports = executor;
