/* global benchmark */
import { INT } from "./../../../src/utils/dataTypes.js";

benchmark("demo4 Constant O(1)", data => data[0], { schema: () => [2, 3, 1] });

benchmark(
  "demo4 Linear map O(n)",
  data => {
    data.map(d => {
      d;
    });
  },
  {
    schema: [() => 1],
    iterations: 10_000,
    complexity: [100, 200],
  }
);

const m = Number.MAX_SAFE_INTEGER / 2;
benchmark(
  "demo4 Linear filter O(n)",
  data => {
    data.filter(d => {
      d < m;
    });
  },
  { schema: [INT] }
);

(async () => {
  await benchmark(
    "demo4 Quadratic O(N2)",
    `async data => {
      const p = []
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data.length; j++) {
          p.push({j: data[i]})
        }
      }
      return data;
    }`,
    { schema: [INT] }
  );
})();

benchmark(
  "demo4 Linear Loop O(n)",
  data => {
    let res = [];
    for (let i = 0; i < data.length; i++) {
      res.push({ data: data[i] });
    }
    return data;
  },
  { schema: [INT] }
);

benchmark(
  "demo4 Logarithmic O(nlogn)",
  data => {
    const binarySearch = (arr, target) => {
      let left = 0;
      let right = arr.length - 1;
      while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (arr[mid] === target) {
          return mid;
        }
        if (arr[mid] < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return -1;
    };
    return binarySearch(data);
  },
  { schema: [INT] }
);
