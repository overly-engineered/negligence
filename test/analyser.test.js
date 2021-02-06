import test from "ava";
import analyser from "./../src/analyser.js";

const mockResults = {
  1: {start: 0, end: 1}, // 1 milli duration
  2: {start: 0, end: 5} // 5 milli duration
}

test("Returns correct high, low, average", t => {
  const results = analyser({results: mockResults});
  t.like(results, {max: 5, min: 1, average: 3})
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

  t.is(error.message, "Analyser missing param");
});

test("throws if not provided a string results property", t => {
  const error = t.throws(
    () => {
      analyser({ results: "ABC" });
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Analyser param1 should be an object of shape {results: {}}");
});

test("throws if not provided an array results property", t => {
  const error = t.throws(
    () => {
      analyser({ results: [] });
    },
    { instanceOf: Error }
  );

  t.is(error.message, "Analyser param1 should be an object of shape {results: {}}");
});

test("stuff", t => {
  const error = t.throws(
    () => {
      analyser({ results: {} });
    },
    { instanceOf: Error }
  );

  t.is(error.message, "No results to analyse");
});
