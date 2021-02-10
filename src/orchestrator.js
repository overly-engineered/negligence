const BenchManager = require("./benchManager.js");
const analyser = require("./analyser.js");
const scanForFiles = require("./finder.js");
// const Display = require("./display.js");

const groupByFile = xs => {
  return xs.reduce(function (rv, x) {
    const arr = (rv[x.fileName] = rv[x.fileName] || []);
    delete x.fileName;
    arr.push(x);
    return rv;
  }, {});
};

class _Orchestrator {
  constructor() {
    this.results = {};
    this.iterator;
    this.startTime;
    this.runningInNode = typeof process === "object";
    this.totalRuns = 0;
    this.logging = true;

    this.BenchManager = new BenchManager({ isNode: this.runningInNode });
  }

  async run() {
    await scanForFiles(this.BenchManager, { exclude: [] });
    await this.BenchManager.execute();
  }

  async display() {}

  progressTick(params) {
    this.progress.tick(params);
  }

  _formatResults(results) {
    const groups = groupByFile(results);
    Object.keys(groups).forEach(group => {
      groups[group] = groups[group].map(res => {
        if (res.error) {
          return res;
        }
        return { ...res, ...analyser(res.data, this.isNode) };
      });
    });
    return groups;
  }

  clear() {
    this.startTime = null;
    console.clear();
  }
}

const orchestrator = new _Orchestrator();
module.exports = orchestrator;
