import test from "ava";

import executor from "../src/executor.js";

const options = { schema: () => [3, 1, 2] };

test("Executor function -> OutputData is correct", async t => {
  const res = await executor(arr => arr.sort((a, b) => a - b), options);
  const outputData = res.data[0];
  t.deepEqual(outputData, [1, 2, 3]);
});

test("Executor function -> Same amount of timings as data", async t => {
  const res = await executor(arr => arr.sort((a, b) => a - b), options);
  const outputDataLength = res.data.length;
  const outputTimingsAmount = Object.keys(res.results).length;
  t.deepEqual(outputDataLength, outputTimingsAmount);
});

test("Execute function -> Assert data passed into callback", async t => {
  const res = await executor(arr => {
    t.deepEqual(arr, options.schema());
    return arr.sort((a, b) => a - b);
  }, options);
});

test("Executor string -> OutputData is correct", async t => {
  const res = await executor("arr => arr.sort((a, b) => a - b)", options);
  const outputData = res.data[0];
  t.deepEqual(outputData, [1, 2, 3]);
});

test("Executor string -> Same amount of timings as data", async t => {
  const res = await executor("arr => arr.sort((a, b) => a - b)", options);
  const outputDataLength = res.data.length;
  const outputTimingsAmount = Object.keys(res.results).length;
  t.deepEqual(outputDataLength, outputTimingsAmount);
});
