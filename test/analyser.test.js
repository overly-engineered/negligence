const test = require("ava");
const analyser = require("../src/analyser.js");

const mockResults = [
  {
    schema: ["INT"],
    fileName: "test.bench.js",
    name: "Test bench",
    data: { 100: [[1, 0]], 200: [[2, 0]] }
  }
];

const badResultsString = [
  {
    schema: ["INT"],
    fileName: "test.bench.js",
    name: "Test bench",
    data: { 100: "string", 200: "string" }
  }
];

const emptyResultsString = [
  {
    schema: ["INT"],
    fileName: "test.bench.js",
    name: "Test bench",
    data: { 100: [], 200: [] }
  }
];

test("Returns correct high, low, average", t => {
  const results = analyser(mockResults, true);
  const stats = results[0].stats;
  t.like(stats["100"], { max: [1, 0], min: [1, 0], average: [1, 0] });
  t.like(stats["200"], { max: [2, 0], min: [2, 0], average: [2, 0] });
  t.is(stats.percentageIncrease, 100);
});

test("throws if not provided any params", t => {
  const error = t.throws(
    () => {
      analyser();
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Analyser missing param");
});

test("throws if not provided a non object", t => {
  const error = t.throws(
    () => {
      analyser("ABC");
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Analyser param1 should be an array with objects of shape {[key]: {}}");
});

test("throws providing a string results property", t => {
  const error = t.throws(
    () => {
      analyser(badResultsString);
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Run failed to produce array of results");
});

test("No results to analyse", t => {
  const error = t.throws(
    () => {
      analyser(emptyResultsString);
    },
    { instanceOf: Error }
  );

  t.is(error.message, "No results to analyse");
});
