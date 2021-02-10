/* global benchmark */
import { INT } from "./../src/utils/dataTypes.js";

benchmark("Constant O(1)", data => data[0], { schema: [INT] });

benchmark(
  "Linear map O(n)",
  data => {
    data.map(d => {
      d.b.c;
    });
  },
  { schema: [INT] }
);

const m = Number.MAX_SAFE_INTEGER / 2;
benchmark(
  "Linear filter O(n)",
  data => {
    data.filter(d => {
      d < m;
    });
  },
  { schema: [INT] }
);

(async () => {
  await benchmark(
    "Quadratic O(N2)",
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
  "Linear Loop with array copy O(n)",
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
  "Logarithmic O(nlogn)",
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
