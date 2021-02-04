const string = "(arr) => {return arr.sort((a, b) => a - b);}";

const array = [...Array(1000)].map(() => Math.random());

const execute = fn => {
  const start_time = Date.now();
  const res = Function('"use strict"; return (' + fn + ')')()(array);
  const end_time = Date.now()
  console.log(`Run took ${end_time - start_time}ms`);
  return res;
};

console.log(execute(string));
