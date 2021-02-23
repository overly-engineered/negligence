const test = require("ava");

const executor = require("../src/executor.js");

const sortFn = arr => arr.sort((a, b) => a - b);

const options = { schema: () => [3, 1, 2], iterations: 100, complexity: 100, isNode: true };

test("Function -> Provide a valid function", async t => {
  await t.notThrowsAsync(
    async () =>
      await executor(arr => {
        return sortFn(arr);
      }, options)
  );
});

test("Function -> Assert data passed into provided function", async t => {
  await executor(arr => {
    t.deepEqual(arr, options.schema());
    return sortFn(arr);
  }, options);
});

test("Function -> Provide a function that throws error", async t => {
  const error = await t.throwsAsync(
    async () => {
      await executor(arr => arr[0].a.b.c.d.e, options);
    },
    { instanceOf: Error }
  );
  t.is(error.message, "Cannot read property 'b' of undefined");
});

test("String -> Provide a valid string function ", async t => {
  await t.notThrowsAsync(
    async () =>
      await executor(arr => {
        return sortFn(arr);
      }, options)
  );
});

test("String -> Provide a valid string function", async t => {
  await t.notThrowsAsync(async () => await executor("arr => arr.sort((a,b) => a-b);", options));
});

test("String -> Provide garbage", async t => {
  const error = await t.throwsAsync(
    async () => {
      await executor("abcdefg this is garbage(); i=0", options);
    },
    { instanceOf: Error }
  );
  t.is(error.message, "Unexpected token 'this'");
});
