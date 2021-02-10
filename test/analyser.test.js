const test = require("ava");
const analyser = require("../src/analyser.js");

const mockResults = {
  1: [
    { start: 0, end: 1 },
    { start: 0, end: 1 }
  ], // 1 milli duration
  2: [
    { start: 0, end: 5 },
    { start: 0, end: 5 }
  ], // 5 milli duration
  3: [
    { start: 0, end: 3 },
    { start: 0, end: 4 },
    { start: 0, end: 5 },
  ]
};

test("Returns correct high, low, average", t => {
  const results = analyser(mockResults);
  t.like(results["1"], { max: 1, min: 1, average: 1 });
  t.like(results["2"], { max: 5, min: 5, average: 5 });
  t.like(results["3"], { max: 5, min: 3, average: 4 });
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
      analyser({ results: "ABC" });
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Run failed to produce array of results");
});

test("throws Analyser missing param an array results property", t => {
  const error = t.throws(
    () => {
      analyser([]);
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Analyser param1 should be an array with objects of shape {[key]: {}}");
});

test("No results to analyse", t => {
  const error = t.throws(
    () => {
      analyser({ s: [] });
    },
    { instanceOf: Error }
  );

  t.is(error.message, "No results to analyse");
});
