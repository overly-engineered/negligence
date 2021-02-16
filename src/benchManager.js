const executor = require("./executor.js");
const pluralize = require("pluralize");

const precisionAmounts = [200, 100];

/**
 * Handles the loading and storing of all benchmarks we find
 */
class BenchManager {
  constructor({ isNode = true, logger }) {
    this.isNode = isNode;
    this.logger = logger;
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
  async _runBenchmark(fn, name, options) {
    let data = {};
    for (let i = 0; i < precisionAmounts.length; i++) {
      let runData;
      try {
        runData = await executor(fn, {
          ...options,
          arrayAmount: 1000,
          complexity: precisionAmounts[i],
          isNode: this.isNode,
          name,
        });
        data = { ...data, ...runData };
      } catch (e) {
        return { error: e };
      }
      // If we have run all the iterations we should return the values
      if (i === precisionAmounts.length - 1) {
        return { data };
      }
    }
  }
}

module.exports = BenchManager;
