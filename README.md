# Negligence

Negligence is a performant javascript benchmarking, used to measure the performance impact of your code dependent on array size and complexity.

Each bench will be run multiple times against two different data lengths, then calculate the percentage increase across the average durations.

See a demo (here)[https://pettman.io/negligence]. Although this will not be as effective as when running from node it is an effective demonstration

---

## Installation:

```bash
npm i negligence
```

Add the command to your package.json

```json
{
  "scripts": {
    "bench": "negligence"
  }
}
```

Run with

```bash
npm run bench
```

## Usage:

Setup a basic test:

All files should be suffixed with `.bench.js` or they won't be picked up.

```javascript
/* global benchmark */

benchmark(
  "Sorts the array",
  data => {
    data.sort();
  },
  { schema: [INT] }
);
```

```bash
npm run bench
```

## Configuration

Options can be passed in, either on a per bench basis or at a global level except for schemas which must be specified for each bench individually.

### Bench Functions

There is no restriction on what you can do inside of bench functions. If it runs in NodeJS it should run in negligence.

Each function will be passed an array of data in the form specified by the schema.

You can pass in functions as themselves or they can be passed in as strings.

```javascript
benchmark(
  "Linear map O(n)",
  data => {
    data.map(d => (d += m));
  },
  { schema: [INT], complexity: [10, 20], iterations: 100 }
);
```

As async functions

```javascript
(async () => {
  await benchmark(
    "Linear map O(n)",
    async data => {
      await data.map(d => (d += m));
    },
    { schema: [INT], complexity: [10, 20], iterations: 100 }
  );
})();
```

As a string:

```javascript
benchmark(
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
```

### Data generation

You can define a schema for the data which you want to pass to you benchmark function.

The following types are exported from negligence to help create your schema.

```javascript
import { STRING, INT, FLOAT, BOOLEAN, BIGINT } from "negligence";
```

A schema can be created using plain javascript object syntax to generate the structure and either the predefined types or a function for the data.

```javascript
// Will pass in an array filled with integers
const simpleSchema = [INT]
// Will pass in an object with some keys
const objectSchema = {
  "number": INT
  "numberArray": [INT],
  "object": {
    "String": STRING
  },
  "function": () => {/* Some other code can return whatever you like*/}
};
// Will pass in an array filled with objectSchema objects
const nestedSchema = [objectSchema];

const myTestData = [/* Some array filled with some stuff */]

const functionSchema = () => myTestData;
```

### Per bench options

#### Schema (The only required option for every bench)

You can pass any form of schema on a per bench basis in the options argument.

```javascript
benchmark(
  "FUNCTION NAME",
  data => {
    data.sort();
  },
  { schema: functionSchema }
);
```

#### Complexity and Iterations

```javascript
benchmark(
  "FUNCTION NAME",
  data => {
    data.sort();
  },
  {
    /* How much data should be passed into the bench function. The second value should be double the first for accurate percentage increases. You can pass more than two values into this array for more accurate analysis but only the first two will be used for creating the percentage increase. Increasing these values will increase the length of time benches take to run. */
    complexity: [100, 200],
    /* How many times should the bench function be run PER COMPLEXITY VALUE. Increasing this will mean more accurate results, but will increase the length of time benches take to run. */
    iterations: 1000,
  }
);
```

### CLI options

| Option       | Type    | Default   | Description                                                                                                  |
| ------------ | ------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| --bail       | boolean | false     | If there is an error in your test negligence will note it and continue unless the bail option is set to true |
| --complexity | array   | [100,200] | How many items of data should be passed into the bench function.                                             |
| --iteration  | number  | 1000      | How many times should the bench function be run.                                                             |
| --verbosity  | number  | 2         | Options: 1 or 2. The verbosity of the results displayed. 1 will only display errors or warnings              |
| --threshold  | number  | 125       | The percentage increase needed for a warning to be displayed.                                                |

### Help
For cli options use
```bash
negligence --help
```
## Other dependencies

Negligence will attempt to resolve any other dependencies included in your test file. If you are running into a persistent error please raise an issue.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://github.com/overly-engineered/negligence/blob/core/LICENSE)
