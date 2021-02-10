const test = require("ava");

test("foo", t => {
  t.pass();
});
// These are now part of BenchManager

// const orchestrator = require("../src/orchestrator.js");

// const orchestrator_2 = require("../src/orchestrator.js");

// test.beforeEach("Clear orchestrator", () => {
//   orchestrator.clear();
// });

// test("Ensure that orchestrator import is always same instance", t => {
//   t.is(orchestrator, orchestrator_2);
// });

// const name = "abc";
// const fn = () => {};
// const options = {};
// const params = { name, fn, options };

// test("Ensure added test is part of set", t => {
//   orchestrator.benchmark(params);
//   const has = orchestrator.runs.has(params);
//   t.assert(has);
// });

// test("Ensure test with same name is only added once", t => {
//   const params2 = params;
//   orchestrator.benchmark(params);
//   orchestrator.benchmark(params2);
//   const size = orchestrator.runs.size;
//   const has = orchestrator.runs.has(params);
//   t.is(size, 1);
//   t.assert(has);
// });

// test("E2E", t => {
//   t.notThrows(() => {
//     orchestrator.benchmark(params);
//     orchestrator.begin();
//   });
// });
