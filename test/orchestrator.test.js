import test from "ava";

import orchestrator from "../src/orchestrator.js";

import orchestrator_2 from "../src/orchestrator.js";

test.beforeEach("Clear orchestrator", () => {
  orchestrator.clear();
});

test("Ensure that orchestrator import is always same instance", t => {
  t.is(orchestrator, orchestrator_2);
});

const name = "abc";
const fn = () => {};
const options = {};
const params = { name, fn, options };

test("Ensure added test is part of set", t => {
  orchestrator.addRun(params);
  const has = orchestrator.runs.has(params);
  t.assert(has);
});

test("Ensure test with same name is only added once", t => {
  const params2 = params;
  orchestrator.addRun(params);
  orchestrator.addRun(params2);
  const size = orchestrator.runs.size;
  const has = orchestrator.runs.has(params);
  t.is(size, 1);
  t.assert(has);
});

test("E2E", t => {
  t.notThrows(() => {
    orchestrator.addRun(params);
    orchestrator.begin();
  });
});
