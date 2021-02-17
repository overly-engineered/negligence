const executor = require("./executor.js");
const pluralize = require("pluralize");
const {
  complexity: defaultComplexity,
  iterations: defaultIterations,
} = require("./utils/defaults");

/**
 * Handles the loading and storing of all benchmarks we find
 */
class BenchManager {
  constructor({ isNode = true, logger, bail, iterations, complexity }) {
    this.isNode = isNode;
    this.logger = logger;
    this.bail = bail;
    this.iterations = iterations;
    this.complexity = complexity;
    this.runs = new Set();
  }

  /**
   *
   * Our exported function which people
   *
   * @param {Object} name Bench name
   * @param {Function} fn Bench function
   * @param {Object} options overwride options for this specific bench
   */
  benchmark(name, fn, options = {}) {
    this.addBench({ name, fn, options });
  }

  /**
   * Function to start the execution of all benches
   */
  async execute() {
    return await this._process();
  }

  /**
   * Clear all our benches
   */
  clear() {
    this.runs.clear();
  }

  /**
   *
   * Our exported function
   *
   * @param {String} name
   * @param {Function} fn
   * @param {Object} options
   */
  addBench({ name, fn, options = {} }) {
    this.runs.add({ name, fn, options });
  }

  /**
   * Async generator for runnning our benchmarks
   */
  async *_processGenerator() {
    for (const run of this.runs) {
      const { fn, name, options } = run;
      const runResult = await this._runBenchmark(fn, name, options);
      yield { ...options, name, ...runResult };
    }
  }

  /**
   * Main process function which runs all our benchmarks and collects the results.
   */
  async _process() {
    const progress = this.logger.startTask(`Executing ${pluralize("function", this.runs.size, true)}`, this.runs.size);
    let array;
    for await (let process of this._processGenerator()) {
      if (!array) array = [];
      const pro = await process;
      progress.tick();
      array.push(pro);
    }
    return array;
  }

  /**
   * Run an individual benchmark
   *
   * @param {Function} fn function to be run
   * @param {String} name the name of the function to be run
   * @param {Object} options overwrite options for this benchmark
   */
  async _runBenchmark(fn, name, { complexity: benchComplexity, iterations: benchIterations, schema } = {}) {
    let data = {};
    const complexity = (() => {
      if (benchComplexity) {
        if (Array.isArray(benchComplexity) && benchComplexity.length > 1) {
          return benchComplexity;
        }
      } else if (Array.isArray(this.complexity) && this.complexity.length > 1) {
        return this.complexity;
      } else {
        throw {
          error: `Invalid complexity value should be an array of integers. Default is ${defaultComplexity}. Provided ${
            benchComplexity ? benchComplexity : this.complexity
          }`,
          benchName: name,
        };
      }
    })();
    const iterations = (() => {
      if (benchIterations) {
        if (Number.isInteger(+benchIterations)) {
          return +benchIterations;
        }
      } else if (Number.isInteger(+this.iterations)) {
        return +this.iterations;
      } else {
        throw {
          error: `Invalid iteration value for ${name} should be an integer. Default is ${defaultIterations}. Provided ${
            benchIterations ? benchIterations : this.iterations
          }`,
          benchName: name,
        };
      }
    })();
    for (let i = 0; i < complexity.length; i++) {
      let runData;
      try {
        runData = await executor(fn, {
          schema,
          iterations,
          complexity: +complexity[i],
          isNode: this.isNode,
          name,
        });
        data = { ...data, ...runData };
      } catch (e) {
        if (this.bail === true) {
          throw { error: e, benchName: name };
        } else {
          return { error: e };
        }
      }
      // If we have run all the iterations we should return the values
      if (i === complexity.length - 1) {
        return { data };
      }
    }
  }
}

module.exports = BenchManager;
