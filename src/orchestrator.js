const BenchManager = require("./benchmanager.js");
const analyser = require("./analyser.js");
const scanForFiles = require("./finder.js");
const Display = require("./display.js");

/**
 * Orchestrator class.
 *
 * Responsible for running the process from finding files to printing results.
 */
class Orchestrator {
  constructor(config = {}) {
    this.config = config;
    this.results = {};
    this.runningInNode = typeof process === "object";

    this.logger = Display.setConfig({ ...this.config });

    this.BenchManager = new BenchManager({ isNode: this.runningInNode, logger: this.logger, ...this.config });
  }

  /**
   * Start the whole process
   */
  async run() {
    await scanForFiles(this.BenchManager, this.logger, { globals: this.config.globals });
    try {
      const results = await this.BenchManager.execute();
      const analysedResults = analyser(results, this.runningInNode, this.logger);
      if (this.runningInNode) {
        this.logger.printResults(analysedResults);
      } else {
        console.log(analysedResults);
      }
    } catch (e) {
      if (e.benchName) {
        console.log("\n\nAborted due to error, bench execution error");
        console.log(e.benchName);
        console.error(e.error);
      } else {
        console.log("\n\n Unknown error");
        console.error(e);
      }
    }
  }
}

module.exports = Orchestrator;
