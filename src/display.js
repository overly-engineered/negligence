/* eslint-disable */
const colors = require("colors/safe.js");
const Multiprogress = require("multi-progress");

const groupByFile = xs => {
  return xs.reduce(function (rv, x) {
    const arr = (rv[x.fileName] = rv[x.fileName] || []);
    delete x.fileName;
    arr.push(x);
    return rv;
  }, {});
};

const TICK = "✔";
const CROSS = "✖";
const QUESTION = "?";

const VERBOSE = 2;
const WARNONLY = 1;
const { verbosity, threshold } = require("./utils/defaults");
const DEFAULT_CONFIG = {
  verbosity,
  threshold,
};

/**
 * Display class
 */
class _Display {
  constructor() {
    this.task;
    this.config;
    this.ProgressBar = new Multiprogress(process.stderr);
    this.padAmount = 0;
    this.globalErrors = [];

    this.setConfig = this.setConfig.bind(this);
  }

  /**
   * Sets the config passed in
   * @param {*} config
   */
  setConfig(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    return this;
  }

  /**
   * Starts a progress bar and returns it to the requester for ticking
   * @param {String} string What the task is
   * @param {Number} total The total amount of tasks we are tracking
   * @param {Boolean} hideTotal
   */
  startTask(string, total, hideTotal) {
    return this.ProgressBar.newBar(`${string} [:bar] ${!hideTotal ? ":current of :total" : ""}`, {
      complete: "#",
      incomplete: " ",
      width: 25,
      total,
    });
  }

  /**
   * Print the results
   * @param {Array} results An array of unordered, ungrouped results.
   */
  printResults(results) {
    console.log("\n");
    const groups = groupByFile(results);

    Object.keys(groups).forEach(key => {
      const group = groups[key];
      this.printFileResult(key, group);
    });
    if (this.globalErrors.length) {
      this.print(colors.red.bold("\n======================= FAILURE SUMMARY =======================\n"));
      this.print(`Some of your benchs were over the specified increase threshold of ${this.config.threshold}, or contained errors.`);
      this.globalErrors
        .sort((a, b) => {
          if (a.error) {
            return -1;
          }
        })
        .forEach(({ key, error }) => {
          if (error.length) {
            if (error.message) {
            }
            this.printFailure(key);
            this.increaseIndent();
            error
              .sort((a, b) => {
                if (a.error) {
                  return -1;
                }
              })
              .forEach(({ schema, name, error, stats }) => {
                if (error && error.message) {
                  this.print("Bench " + name + " failed with error:\n");
                  this.increaseIndent();
                  this.error(error.message + "\n");
                  this.decreaseIndent();
                } else {
                  this.print("Bench " + name + " is showing signs of poor performance");
                  this.print(`A median increase of ${stats.percentageIncrease}% when doubling array length\n`);
                }
              });
            this.decreaseIndent();
          }
        });
      this.print("\nRun with --bail flag to fail fast when a bench throws an error");
    } else {
      this.print(colors.green.bold("\n======================= SUCCESS =======================\n"));
      this.print(`None of your benchs were over the specified increase threshold of ${this.config.threshold}.`);
    }
  }

  /**
   * Increase the log indent
   */
  increaseIndent() {
    this.padAmount += 2;
  }

  /**
   * Decrease the log indent
   */
  decreaseIndent() {
    this.padAmount -= 2;
  }

  /**
   * Add our padding to the string
   */
  formatLog(string) {
    return string.padStart(this.padAmount + string.length);
  }

  /**
   * Standard print statement
   */
  print(string) {
    console.log(this.formatLog(string));
  }

  /**
   * Error statment
   */
  error(string) {
    console.error(this.formatLog(string));
  }

  /**
   * Failure statment
   */
  printFailure(string, fn = colors.red) {
    console.log(fn(this.formatLog(`${CROSS} FAILURE ${string}`)));
  }

  /**
   * Warning statement
   */
  printWarning(string, fn = colors.yellow) {
    console.log(fn(this.formatLog(`${QUESTION} ${string}`)));
  }

  /**
   * Success statement
   */
  printSuccess(string, fn = colors.green) {
    console.log(fn(this.formatLog(`${TICK} ${string}`)));
  }

  /**
   * For a given file, print the results of the tests in it.
   * @param {String} key The filename
   * @param {Array} group The array of bench results
   */
  printFileResult(key, group) {
    const groupErrors = group.filter(fnResults => {
      return fnResults.error || fnResults.stats.percentageIncrease > this.config.threshold;
    });
    if (groupErrors.length) {
      this.globalErrors.push({ key, error: groupErrors });
    }
    if (this.config.verbosity > 1) {
      if (groupErrors.length === group.length) {
        this.printFailure(key);
      } else if (groupErrors.length > 0) {
        this.printWarning(key);
      } else {
        this.printSuccess(key);
      }
      this.increaseIndent();
      group.forEach(bench => {
        this.printBenchResult(bench);
      });
      this.decreaseIndent();
    }
  }

  /**
   * Format an HRT string to a nice thing
   */
  createHRTString(hrtArray) {
    const secondValue = `${hrtArray[0]}s`;
    const nanoSecondValue = `${hrtArray[1]}ns`;

    return hrtArray[0] ? secondValue + " " + nanoSecondValue : nanoSecondValue;
  }

  /**
   * Based on the bench result what colour should we display
   */
  getResultColour(value) {
    if (value > this.config.threshold) {
      return colors.red;
    } else if (value > this.config.threshold - 25) {
      return colors.yellow;
    } else {
      return colors.green;
    }
  }

  /**
   * Print the result of an individual bench
   */
  printBenchResult(bench) {
    this.increaseIndent();
    if (bench.error) {
      this.printFailure(bench.name);
      this.error(bench.error.message);
    } else {
      if (this.config.verbosity > WARNONLY) {
        const resultType = this.getResultColour(bench.stats.percentageIncrease);
        this.printSuccess(resultType(bench.name), resultType);
        this.increaseIndent();
        this.print(resultType("Increase: " + bench.stats.percentageIncrease + "%"));
      }
      if (this.config.verbosity >= VERBOSE) {
        Object.keys(bench.stats).forEach(val => {
          if (val !== "percentageIncrease") {
            const value = bench.stats[val];
            this.print(`${val} iteratons`);
            this.increaseIndent();
            this.print(`High: ${this.createHRTString(value.max)}`);
            this.print(`Low: ${this.createHRTString(value.min)}`);
            this.decreaseIndent();
          }
        });
      }
      this.decreaseIndent();
    }
    this.decreaseIndent();
  }
}

const Display = new _Display();
module.exports = Display;
