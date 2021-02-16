#!/usr/bin/env node

"use strict";
const orchestrator = require("./src/orchestrator.js");

(async () => {
  try {
    await orchestrator.run();
  } catch (e) {
    console.error(e)
  }
})();
