const BenchManager = require("./benchManager.js");
const analyser = require("./analyser.js");
const scanForFiles = require("./finder.js");
const Display = require("./display.js");

/**
 * Orchestrator class.
 *
 * Responsible for running the process from finding files to printing results.
 */
class _Orchestrator {
  constructor(config = {}) {
    this.results = {};
    this.iterator;
    this.startTime;
    this.runningInNode = typeof process === "object";
    this.totalRuns = 0;
    this.logging = true;
    this.logger = Display.setConfig({ ...config });

    this.BenchManager = new BenchManager({ isNode: this.runningInNode, logger: this.logger });
  }

  /**
   * Start the whole process
   */
  async run() {
    await scanForFiles(this.BenchManager, this.logger, { exclude: ["a", "b"] });
    const results = await this.BenchManager.execute();
    const analysedResults = analyser(results, this.runningInNode, this.logger);
    if (this.runningInNode) {
      this.logger.printResults(analysedResults);
    } else {
      console.log(analysedResults);
    }
  }
}

const orchestrator = new _Orchestrator();
module.exports = orchestrator;
