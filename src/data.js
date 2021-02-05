// Creates the batches data for execution

export const BIG = "big";
export const SMALL = "small";
export const STANDARD = "standard";

export const counts = {
  [BIG]: 10_000,
  [STANDARD]: 1_000,
  [SMALL]: 100
};

const DEFAULT_COUNT = STANDARD;

import { STRING, INT, FLOAT, BOOLEAN, BIGINT } from "./utils/dataTypes.js";
import dataTypeGenerators from "./utils/dataTypeGenerators.js";

const DEFAULT_SCHEMA = INT;

const dataGenerator = ({ schema, complexity }) => {

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
            s[key] = [...Array(complexity)].map(() => {
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

export default ({ schema = DEFAULT_SCHEMA, complexity = DEFAULT_COUNT } = {}) => {
  const arrayAmount = Number.isInteger(complexity) ? complexity : counts[complexity];
  return Array.isArray(schema)
    ? [...Array(arrayAmount)].map(() => dataGenerator({ schema: schema[0], complexity: arrayAmount }))
    : dataGenerator({ schema, complexity: arrayAmount });
};
