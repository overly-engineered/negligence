// Entry and Orchestrator

import executor from "./src/executor.js";
import analyser from "./src/analyser.js";
import { STRING, INT, FLOAT, BOOLEAN, BIGINT } from "./src/utils/dataTypes.js";

const benchmark = async (name, fn, options = {}) => {
  console.log(name);
  const run = await executor(fn, options);
  return run;
};

benchmark("some stuff", data => {
  return data.sort((a,b) => a-b);
}, {schema: [INT]});

(async () => {
  const data = await benchmark(
    "some stuff",
    `data => {
      return data.sort((a, b) => a - b).sort((a,b) => a + b)
    }`,
    { schema: [INT] }
  );
  console.log(analyser(data));
})();
