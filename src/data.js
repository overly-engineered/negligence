// Creates the batches data for execution

const { INT } = require("./utils/dataTypes.js");
const { typeMap: dataTypeGenerators } = require("./utils/dataTypeGenerators.js");
const DEFAULT_SCHEMA = INT;

/**
 * Generate a data object based of a schema
 * @param {Object} param0
 * @param {Object} param0.schema
 * @param {Number} param0.complexity
 */
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

/**
 * Start generating our data either as an array or an object.
 *
 * @param {Object} param0
 * @param {Object} param0.schema Data schema
 * @param {Number} param0.complexity How complex should the data be.
 */
const generateMockData = ({ schema = DEFAULT_SCHEMA, complexity } = {}) => {
  const arrayAmount = (() => {
    const e = `Invalid complexity provided(${complexity}). Value should be an integer`;
    if (typeof complexity === "object") {
      throw new Error(e);
    } else if (Number.isInteger(complexity)) {
      return complexity;
    }
    throw new Error(e);
  })();
  return Array.isArray(schema)
    ? [...Array(arrayAmount)].map(() => dataGenerator({ schema: schema[0], complexity: arrayAmount }))
    : dataGenerator({ schema, complexity: arrayAmount });
};

module.exports = {
  generateMockData
};
