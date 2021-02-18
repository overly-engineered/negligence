/* global benchmark */
import { INT } from "./../src/utils/dataTypes.js";

benchmark(
  "Linear map O(n)",
  data => {
    data.map(d => {
      d.b.c;
    });
  },
  { schema: [INT] }
);
