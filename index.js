#!/usr/bin/env node
"use strict";

const {
  bail: defaultBail,
  complexity: defaultComplexity,
  iterations: defaultIterations,
  verbosity: defaultVerbosity,
  threshold: defaultThreshold,
} = require("./src/utils/defaults");

const argv = require("yargs/yargs")(process.argv.slice(2))
  .scriptName("negligence")
  .usage("$0 [args]")
  .options({
    bail: {
      demandOption: false,
      boolean: true,
      default: defaultBail,
      describe: "Fail fast on bench error",
      type: "boolean",
    },
    complexity: {
      demandOption: false,
      default: defaultComplexity,
      array: true,
      describe: "Amount of data items to insert into the array. The more iterations the more accurate",
      type: "number",
    },
    iterations: {
      demandOption: false,
      default: defaultIterations,
      number: true,
      describe: "Times to run each function. The more iterations the more accurate",
      type: "number",
    },
    verbosity: {
      demandOption: false,
      default: defaultVerbosity,
      choices: [1, 2],
      number: true,
      describe: "How verbose the output should be. 1 for minimal, 2 for verbose",
      type: "number",
    },
    threshold: {
      demandOption: false,
      number: true,
      default: defaultThreshold,
      describe: "Threshold for what is conseridered a poor performance function",
      type: "number",
    },
  })
  .help().argv;

const { bail, iterations, verbosity, threshold, complexity } = argv;
const config = { bail, iterations, verbosity, threshold, complexity };
const Orchestrator = require("./src/orchestrator.js");

(async () => {
  const orchestrator = new Orchestrator(config);
  await orchestrator.run();
})();
