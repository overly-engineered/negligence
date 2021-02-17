const { generateMockData } = require("./data.js");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/* For ultimate security we should do all exec's in a vm for node. I think its ok though,
As the original code should still have the context of the vm the file was parsed in. */

/**
 *
 * Function used to execute a string function in an async way.
 *
 * @param {Object} param0
 * @param {Function} param0.fn Function to be executed
 * @param {Array} param0.data Array to be passed into the function supplied
 */
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

/**
 *
 * Excecutes js function objects.
 *
 * @param {Object} param0
 * @param {Function} param0.fn Function to be executed
 * @param {Array} param0.data Array to be passed into the function supplied
 */
const execute = async ({ fn, data }) => {
  return await fn(data);
};

/**
 *
 * Generates a set of data to be provided and executed a given number of times
 *
 * @param {Function} fn The function provided
 * @param {Number} param1.complexity How many items should be in a data array or sub data array
 * @param {Object} param1.schema The data schema we should generate from
 * @param {Number} param1.iterations How many times should we execute a given function
 * @param {Boolean} param1.isNode Are we running inside node or browser
 */
const executor = async (fn, { complexity, schema, iterations, isNode } = {}) => {
  let timings = {};
  const envExecutor = typeof fn === "string" ? executeString : execute;
  for (let i = 0; i < iterations; i++) {
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
    if (i === iterations - 1) {
      return timings;
    }
  }
};

module.exports = executor;
