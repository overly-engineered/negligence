const test = require("ava");
const BenchManager = require("../src/benchmanager");
const Display = require("./../src/display.js");
const logger = Display.setConfig({});
const benchManager = new BenchManager({ logger });

test.beforeEach("Clear BenchManager", () => {
  benchManager.clear();
});

const name = "abc";
const fn = function () {};
const options = {complexity: [100, 200], iterations: 100};

test("Ensure added test is part of set", t => {
  benchManager.benchmark(name, fn, options);
  t.is(benchManager.runs.size, 1);
});

test("Ensure the benchmanager runs all benches when configured correctly", async t => {
  await t.notThrowsAsync(async () => {
    benchManager.benchmark(name, fn, options);
    await benchManager.execute();
  });
});

test("Assert results are correct length", async t => {
  benchManager.benchmark(name, fn, options);
  const val = await benchManager.execute();
  t.is(val.length, 1);
});

test("Assert error is caught from executor.", async t => {
  await t.throwsAsync(async () => {
    benchManager.benchmark(name, {}, options);
    const e = await benchManager.execute();
    throw e[0].error;
  });
});
