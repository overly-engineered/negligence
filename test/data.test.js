const test = require("ava");
const { generateMockData } = require("../src/data.js");
const { STRING, INT, FLOAT, BOOLEAN, BIGINT } = require("../src/utils/dataTypes.js");
const { uniqueNamesGenerator, adjectives, colors, animals } = require("unique-names-generator");

const intSchema = [INT];

const BIG = 100;
const SMALL = 1;
const STANDARD = 50;

const demoSchema = [
  {
    "a string": STRING,
    "an integer": INT,
    "a float": FLOAT,
    "a boolean": BOOLEAN,
    "a bigint": BIGINT,
    "an array": [STRING],
    "a second Array": [{ abc: STRING, 123: INT }],
  },
];

/** Complexity complexityCounts */
test(`Complexity variables -> BIG produces array of length ${BIG}`, t => {
  const data = generateMockData({ schema: intSchema, complexity: BIG });
  t.is(data.length, BIG);
});
test(`Complexity variables -> SMALL produces array of length ${SMALL}`, t => {
  const data = generateMockData({ schema: intSchema, complexity: SMALL });
  t.is(data.length, SMALL);
});
test(`Complexity variables -> STANDARD produces array of length ${STANDARD}`, t => {
  const data = generateMockData({ schema: intSchema, complexity: STANDARD });
  t.is(data.length, STANDARD);
});

/** Complex schemas */
test(`Complex schema -> assert array length ${SMALL}`, t => {
  const data = generateMockData({ schema: demoSchema, complexity: SMALL });
  t.is(data.length, SMALL);
});

test(`Complex schema -> assert nested Array Length`, t => {
  const data = generateMockData({ schema: demoSchema, complexity: SMALL });
  t.is(data[0]["an array"].length, SMALL);
});

test(`Complex schema -> object keys match`, t => {
  const data = generateMockData({ schema: demoSchema, complexity: SMALL });
  t.deepEqual(Object.keys(data[0]), Object.keys(demoSchema[0]));
});

test(`Complex schema -> nested object keys match`, t => {
  const data = generateMockData({ schema: demoSchema, complexity: SMALL });
  const nestedSchemaKeys = Object.keys(demoSchema[0]["a second Array"][0]);
  const nestedDataKeys = Object.keys(data[0]["a second Array"]);
  t.deepEqual(nestedDataKeys, nestedSchemaKeys);
});

// Is integer
test(`Data types -> Integer`, t => {
  const data = generateMockData({ schema: INT, complexity: SMALL });
  t.assert(Number.isInteger(data));
});
// Is float
test(`Data types -> Float`, t => {
  const data = generateMockData({ schema: FLOAT, complexity: SMALL });
  t.assert(!Number.isInteger(data));
});
// Is string
test(`Data types -> String`, t => {
  const data = generateMockData({ schema: STRING, complexity: SMALL });
  t.assert(typeof data === "string");
});
// Is Boolean
test(`Data types -> Boolean`, t => {
  const data = generateMockData({ schema: BOOLEAN, complexity: SMALL });
  t.assert(typeof data === "boolean");
});
// Is BigInt
test(`Data types -> BigInt`, t => {
  const data = generateMockData({ schema: BIGINT, complexity: SMALL });
  t.assert(typeof data === "bigint");
});
// Custom function
test(`Data types -> fn`, t => {
  const data = generateMockData({ schema: () => 1, complexity: SMALL });
  t.is(data, 1);
});
// Complex function
test(`Data types -> complex fn`, t => {
  const data = generateMockData({
    schema: [() => uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] })],
    complexity: SMALL,
  });
  t.is(data.length, SMALL);
  t.is(typeof data[0], "string");
});
// Nested custom function
test(`Data types - nested fn`, t => {
  const data = generateMockData({ schema: { intArray: [INT], int: INT, fn: () => 1 }, complexity: SMALL });
  t.is(data.fn, 1);
});

test(`Error -> Provide an invalid string complexity`, t => {
  const invalidComplexity = "ABC";
  const error = t.throws(
    () => {
      generateMockData({ schema: demoSchema, complexity: invalidComplexity });
    },
    { instanceOf: Error }
  );

  t.is(error.message, `Invalid complexity provided(${invalidComplexity}). Value should be an integer`);
});

test(`Error -> Provide an invalid array complexity`, t => {
  const invalidComplexity = [];
  const error = t.throws(
    () => {
      generateMockData({ schema: demoSchema, complexity: invalidComplexity });
    },
    { instanceOf: Error }
  );

  t.is(error.message, `Invalid complexity provided(${invalidComplexity}). Value should be an integer`);
});
