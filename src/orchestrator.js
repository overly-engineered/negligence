import ProgressBar from "progress";
import Table from "cli-table";
import colors from "colors/safe.js";
import executor from "./executor.js";
import analyser from "./analyser.js";
// each time the we call run, append it to an array of tests to run.

const precisionAmounts = [200, 100];

const tableStyle = {
  top: "═",
  "top-mid": "╤",
  "top-left": "╔",
  "top-right": "╗",
  bottom: "═",
  "bottom-mid": "╧",
  "bottom-left": "╚",
  "bottom-right": "╝",
  left: "║",
  "left-mid": "╟",
  mid: "─",
  "mid-mid": "┼",
  right: "║",
  "right-mid": "╢",
  middle: "│"
};

class _Orchestrator {
  constructor() {
    this.results = [];
    this.runs = new Set();
    this.iterator;
    this.startTime;
    this.runningInNode = typeof process === "object";
    this.progress;
    this.logging = false;
  }

  begin() {
    if (this.runningInNode) {
      this.progress = new ProgressBar("Benchmarking functions: :current out of :total. :percent", {
        total: this.runs.size,
        complete: "#"
      });
    }
    this.startTime = Date.now();
    this.iterator = this.runs[Symbol.iterator]();
    this._completeRun();
  }

  clear() {
    this.startTime = null;
    this.runs.clear();
    console.clear();
  }

  addRun(params) {
    if (!this.runs.has(params)) {
      this.runs.add(params);
    }
  }

  async _batchRuns(fn, options) {
    let data = {};
    for (let i = 0; i < precisionAmounts.length; i++) {
      const runData = await executor(fn, {
        ...options,
        arrayAmount: 10000,
        complexity: precisionAmounts[i],
        isNode: this.runningInNode
      });
      data = { ...data, ...runData };
      if (i === precisionAmounts.length - 1) {
        return data;
      }
    }
  }

  async _completeRun() {
    const { value, done } = this.iterator.next();
    if (!done) {
      const { name, fn, options } = value;
      const results = await this._batchRuns(fn, options);
      if (this.runningInNode) {
        this.progress.tick({ token1: `Current testing ${name}` });
      }
      const analysis = analyser(results, this.runningInNode);
      this.results.push({ name, ...analysis });
      this._completeRun();
    } else {
      this._finish();
    }
  }

  _formatResultsTable(results) {
    return results.map(row => {
      const color = (() => {
        if (row.percentageIncrease < 100) {
          return colors.blue;
        } else if (row.percentageIncrease < 150) {
          return colors.green;
        } else if (row.percentageIncrease < 200) {
          return colors.yellow;
        } else {
          return colors.red;
        }
      })();
      const array = [color(row.name)];
      const { max: max1, min: min1, average: a1 } = row[precisionAmounts[0]];
      const { max: max2, min: min2, average: a2 } = row[precisionAmounts[1]];
      array.push(`Average: ${a2},\nMax: ${max2},\nMin: ${min2}`);
      array.push(`Average: ${a1},\nMax: ${max1},\nMin: ${min1}`);
      array.push(color(`${row.percentageIncrease}%`));
      return array;
    });
  }

  _finish() {
    const endTime = Date.now();
    if (this.runningInNode && this.logging) {
      const formattedResults = this._formatResultsTable(this.results);
      const table = new Table({
        head: [
          colors.white.bold("Benchname"),
          colors.white.bold("10,000 items"),
          colors.white.bold("20,000 items"),
          colors.white.bold("Percentage increase")
        ],
        chars: tableStyle
      });
      formattedResults.forEach(row => table.push(row));
      console.log(table.toString());
    }
    console.log(`Completed in ${(endTime - this.startTime) / 1000}s`);
  }
}

const orchestrator = new _Orchestrator();
export default orchestrator;
