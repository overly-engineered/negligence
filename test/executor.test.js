import test from "ava";

import executor from "../src/executor.js";

const sortFn = arr => arr.sort((a, b) => a - b);

const options = { schema: () => [3, 1, 2] };

test("Function -> OutputData is correct", async t => {
  const res = await executor(sortFn, options);
  const outputData = res.data[0];
  t.deepEqual(outputData, [1, 2, 3]);
});

test("Function -> Same amount of timings as data", async t => {
  const res = await executor(sortFn, options);
  const outputDataLength = res.data.length;
  const outputTimingsAmount = Object.keys(res.results).length;
  t.deepEqual(outputDataLength, outputTimingsAmount);
});

test("Function -> Assert data passed into provided function", async t => {
  const res = await executor(arr => {
    t.deepEqual(arr, options.schema());
    return sortFn(arr);
  }, options);
});

test("Function -> Provide a function that throws error", async t => {
  const error = await t.throwsAsync(
    async () => {
      await executor(arr => arr[0].a.b.c.d.e, options);
    },
    { instanceOf: Error }
  );
  t.is(error.message, "Error running provided function");
});

test("String -> OutputData is correct", async t => {
  const res = await executor("arr => arr.sort((a, b) => a - b)", options);
  const outputData = res.data[0];
  t.deepEqual(outputData, [1, 2, 3]);
});

test("String -> Same amount of timings as data", async t => {
  const res = await executor("arr => arr.sort((a, b) => a - b)", options);
  const outputDataLength = res.data.length;
  const outputTimingsAmount = Object.keys(res.results).length;
  t.deepEqual(outputDataLength, outputTimingsAmount);
});

test("String -> Provide a function that throws error", async t => {
  const error = await t.throwsAsync(
    async () => {
      await executor("arr => arr[0].a.b.c.d.e", options);
    },
    { instanceOf: Error }
  );
  t.is(error.message, "Error running provided function");
});

test("Error -> Provide an invalid string for precision", async t => {
  const invalidPrecision = "ABC";
  const error = await t.throwsAsync(
    async () => {
      await executor(sortFn, { ...options, precision: invalidPrecision });
    },
    { instanceOf: Error }
  );

  t.is(
    error.message,
    `Invalid precision provided(${invalidPrecision}). Allowed values are 'precise', 'standard', 'quick', or an integer`
  );
});

test("Error -> Provide an invalid array for precision", async t => {
  const invalidPrecision = [];
  const error = await t.throwsAsync(
    async () => {
      await executor(sortFn, { ...options, precision: invalidPrecision });
    },
    { instanceOf: Error }
  );

  t.is(
    error.message,
    `Invalid precision provided(${invalidPrecision}). Allowed values are 'precise', 'standard', 'quick', or an integer`
  );
});
