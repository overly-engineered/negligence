const executor = require("./executor.js");
const pluralize = require("pluralize");
const precisionAmounts = [200, 100];

class BenchManager {
  constructor({ isNode, logger }) {
    this.isNode = isNode;
    this.logger = logger;
    this.runs = new Set();
  }

  /**
   *
   * Our exported function
   *
   * @param {*} name
   * @param {*} fn
   * @param {*} options
   */
  benchmark(name, fn, options = {}) {
    this.addBench({ name, fn, options });
  }

  async execute() {
    return await this._process();
  }

  clear() {
    this.runs.clear();
  }

  /**
   *
   * Our exported function
   *
   * @param {*} name
   * @param {*} fn
   * @param {*} options
   */
  addBench({ name, fn, options = {} }) {
    if (!this.runs.has({ name, fn, options })) {
      this.runs.add({ name, fn, options });
    }
  }

  async *_processGenerator() {
    for (const run of this.runs) {
      const { fn, name, options } = run;
      const runResult = await this._runBenchmark(fn, name, options);
      yield { ...options, name, ...runResult };
    }
  }

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
          name
        });
        data = { ...data, ...runData };
      } catch (e) {
        return { error: e };
      }
      if (i === precisionAmounts.length - 1) {
        return { data };
      }
    }
  }
}

module.exports = BenchManager;
