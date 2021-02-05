import test from "ava";
import generateMockData, { BIG, SMALL, STANDARD, counts } from "./../src/data.js";
import { STRING, INT, FLOAT, BOOLEAN, BIGINT } from "../src/utils/dataTypes.js";

const intSchema = [INT];

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

/** Complexity counts */
test(`Complexity variables -> BIG produces array of length ${counts[BIG]}`, t => {
  const data = generateMockData({ schema: intSchema, complexity: BIG });
  t.is(data.length, counts[BIG]);
});
test(`Complexity variables -> SMALL produces array of length ${counts[SMALL]}`, t => {
  const data = generateMockData({ schema: intSchema, complexity: SMALL });
  t.is(data.length, counts[SMALL]);
});
test(`Complexity variables -> STANDARD produces array of length ${counts[STANDARD]}`, t => {
  const data = generateMockData({ schema: intSchema, complexity: STANDARD });
  t.is(data.length, counts[STANDARD]);
});

/** Complex schemas */
test(`Complex schema -> assert array length ${counts[SMALL]}`, t => {
  const data = generateMockData({ schema: demoSchema, complexity: SMALL });
  t.is(data.length, counts[SMALL]);
});

test(`Complex schema -> assert nested Array Length`, t => {
  const data = generateMockData({ schema: demoSchema, complexity: SMALL });
  t.is(data[0]["an array"].length, counts[SMALL]);
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
  const data = generateMockData({ schema: INT });
  t.assert(Number.isInteger(data));
});
// Is float
test(`Data types -> Float`, t => {
  const data = generateMockData({ schema: FLOAT });
  t.assert(!Number.isInteger(data));
});
// Is string
test(`Data types -> String`, t => {
  const data = generateMockData({ schema: STRING });
  t.assert(typeof data === "string");
});
// Is Boolean
test(`Data types -> Boolean`, t => {
  const data = generateMockData({ schema: BOOLEAN });
  t.assert(typeof data === "boolean");
});
// Is BigInt
test(`Data types -> BigInt`, t => {
  const data = generateMockData({ schema: BIGINT });
  t.assert(typeof data === "bigint");
});
// Custom function
test(`Data types -> fn`, t => {
  const data = generateMockData({ schema: () => 1 });
  t.is(data, 1);
});
// Nested custom function
test(`Data types - nested fn`, t => {
  const data = generateMockData({ schema: { intArray: [INT], int: INT, fn: () => 1 } });
  t.is(data.fn, 1);
});
