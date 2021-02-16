/* eslint-disable */
const colors = require("colors/safe.js");
const Multiprogress = require("multi-progress");
const pluralize = require("pluralize");
// console.log(`Found ${pluralize("files", files.length, true)}!`);

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

const VERBOSE = 3;
const MINMIAL = 2;
const WARNONLY = 1;

const DEFAULT_CONFIG = {
  verbosity: VERBOSE
};

class _Display {
  constructor(params) {
    this.task;
    this.config;
    this.ProgressBar = new Multiprogress(process.stderr);
    this.padAmount = 0;
    this.globalErrors = [];

    this.setConfig = this.setConfig.bind(this);
  }

  setConfig(config) {
    this.config = { ...config, ...DEFAULT_CONFIG };
    return this;
  }

  startTask(string, total, hideTotal) {
    return this.ProgressBar.newBar(`${string} [:bar] ${!hideTotal ? ":current of :total" : ""}`, {
      complete: "#",
      incomplete: " ",
      width: 25,
      total
    });
  }

  printResults(results) {
    console.log("\n");
    const groups = groupByFile(results);

    Object.keys(groups).forEach(key => {
      const group = groups[key];
      this.printFileResult(key, group);
    });
    if (this.globalErrors.length) {
      this.print("\n======================= ERROR SUMMARY =======================\n");
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
    }
    this.print("\nRun with --bail flag to fail fast when a bench fails");
  }

  increaseIndent() {
    this.padAmount += 2;
  }

  decreaseIndent() {
    this.padAmount -= 2;
  }

  formatLog(string) {
    return string.padStart(this.padAmount + string.length);
  }

  print(string) {
    console.log(this.formatLog(string));
  }

  error(string) {
    console.error(this.formatLog(string));
  }

  printFailure(string, fn = colors.red) {
    console.log(fn(this.formatLog(`${CROSS} FAILURE ${string}`)));
  }

  printWarning(string, fn = colors.yellow) {
    console.log(fn(this.formatLog(`${QUESTION} ${string}`)));
  }

  printSuccess(string, fn = colors.green) {
    console.log(fn(this.formatLog(`${TICK} ${string}`)));
  }

  printFileResult(key, group) {
    const groupErrors = group.filter(fnResults => {
      return fnResults.error || fnResults.stats.percentageIncrease > 100;
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

  createHRTString(hrtArray) {
    const secondValue = `${hrtArray[0]}s`;
    const nanoSecondValue = `${hrtArray[1]}ns`;

    return hrtArray[0] ? secondValue + " " + nanoSecondValue : nanoSecondValue;
  }

  getResultColour(value) {
    if (value > 150) {
      return colors.red;
    } else if (value > 100) {
      return colors.yellow;
    } else {
      return colors.green;
    }
  }

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
