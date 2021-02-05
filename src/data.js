// Creates the batches data for execution

export const PRECISE = "precise";
export const QUICK = "quick";
export const STANDARD = "standard";

export const counts = {
  [PRECISE]: 10_000,
  [STANDARD]: 1_000,
  [QUICK]: 100
};

const DEFAULT_COUNT = STANDARD;

import { STRING, INT, FLOAT, BOOLEAN, BIGINT } from "./utils/dataTypes.js";
import dataTypeGenerators from "./utils/dataTypeGenerators.js";

const DEFAULT_SCHEMA = INT;

const schemaGenerator = (schema, amount) => {
  const getGenerator = type => {
    return dataTypeGenerators[type]();
  };

  if (typeof schema === "object") {
    const gen = schemaNest => {
      const s = {};
      Object.keys(schemaNest).forEach(key => {
        const val = schemaNest[key];
        if (Array.isArray(val)) {
          if (typeof val[0] === "object") {
            s[key] = gen(val[0]);
          } else {
            s[key] = [...Array(amount)].map(() => {
              if (typeof val === "function") {
                return val();
              } else {
                return getGenerator(val);
              }
            });
          }
        } else {
          if (typeof val === "function") {
            s[key] = val();
          } else {
            s[key] = getGenerator(val);
          }
        }
      });
      return s;
    };

    return gen(schema);
  } else {
    if (typeof schema === "function") {
      return schema();
    } else {
      return getGenerator(schema);
    }
  }
};

export default ({ schema = DEFAULT_SCHEMA, precision = DEFAULT_COUNT } = {}) => {
  return Array.isArray(schema)
    ? [...Array(counts[precision])].map(() => schemaGenerator(schema[0], counts[precision]))
    : schemaGenerator(schema, counts[precision]);
};

const demoSchema = [
  {
    "a string": STRING,
    "an integer": INT,
    "a float": FLOAT,
    "a boolean": BOOLEAN,
    "a bigint": BIGINT,
    "an array": [STRING],
    "a second Array": [{ abc: STRING, 123: INT }]
  }
];

// const a = generateMockData({ schema: STRING });
// const b = generateMockData({ schema: INT });
// const c = generateMockData({ schema: demoSchema });
// const d = generateMockData();
// console.log(a);
// console.log(b);
// console.log(c);
// console.log(d);
