// Entry and Orchestrator
import orchestrator from "./src/orchestrator.js";
import { INT } from "./src/utils/dataTypes.js";

const quickSort = list => {
  if (list.length < 2) return list;
  let pivot = list[0];
  let left = [];
  let right = [];
  for (let i = 1, total = list.length; i < total; i++) {
    if (list[i] < pivot) left.push(list[i]);
    else right.push(list[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
};

const benchmark = async (name, fn, options = {}) => {
  orchestrator.addRun({name, fn, options});
};

benchmark("Constant O(1)", data => data[data.length - 1], { schema: [INT] });

benchmark(
  `Linear O(n)`,
  data => {
    for(let i =0; i < data.length; i++){
      data[i] = data[i] += 1;
    }
  },
  { schema: [INT] }
);

(async () => {
  await benchmark(
    "Quadratic O(N2)",
    `async data => {
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data.length; j++) {
          data[i] = data[i] += 1
        }
      }
      return data;
    }`,
    { schema: [INT] }
  );
})();

benchmark("Logarithmic O(nlogn)", data => quickSort(data));

orchestrator.begin();
