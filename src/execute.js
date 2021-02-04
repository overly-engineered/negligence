const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const string = "(arr) => {return arr.sort((a, b) => a - b);}";
const asyncString = "(arr) => {return new Promise(res => setTimeout(() => res(arr.sort((a, b) => a - b)), 1000))}";

const array = [...Array(100000)].map(() => Math.random());

const execute = async fn => {
  let value;
  try {
    const execution = new AsyncFunction(
      "arr",
      '"use strict"; return new Promise(async (resolve,reject) => {const fn = ' +
        fn +
        "; const returnValue = await fn(arr); resolve(returnValue)})"
    );
    const start_time = Date.now();
    value = await execution(array);
    const end_time = Date.now();
    console.log(`Run took ${end_time - start_time}ms`);
  } catch (e) {
    console.error(e);
    value = e;
  }
  return value;
};

execute(string).then(res => console.log("result", res));
execute(asyncString).then(res => console.log("async result", res));
