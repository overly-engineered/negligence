// Entry and Orchestrator
var fs = require("fs");
const path = require("path");
const vm = require("vm");
const babel = require("@babel/core");
const _regenerator = require("@babel/runtime/regenerator");
var glob = require("glob");

/**
 * Reads a file from a string passed in.
 * @param {String} fileLocation location of the file found
 * @param {Objbect} benchManager Benchmanager class
 */
const readFile = async (fileLocation, benchManager) => {
  const folder = path.resolve(fileLocation.replace(/\/\w*\.bench.js$/, ""));
  let data;
  try {
    data = await fs.readFileSync(fileLocation, "utf8");
  } catch (e) {
    console.log("Error:", e.stack);
  }

  const babelify = babel.transform(data, {
    presets: [
      [
        require.resolve("@babel/preset-env"),
        {
          useBuiltIns: "entry",
          corejs: "2.6.12"
        }
      ]
    ],
    plugins: [
      require.resolve("@babel/plugin-transform-async-to-generator"),
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          resolvePath(sourcePath) {
            /**
             * Module resolution. Seems a bit brittle for flag of what is relative and what is a dependency
             */
            const hasSlashes = sourcePath.match(/^(\/|\.)/); // check for strings starting with slashes or dots
            if (hasSlashes) {
              const res = path.relative(process.cwd(), path.resolve(`${folder}/${sourcePath}`));
              return path.resolve(res);
            } else {
              const res = path.relative(process.cwd(), path.resolve(`node_modules/${sourcePath}`))
              return path.resolve(res);
            }
          }
        }
      ]
    ],
    moduleRoot: __dirname
  });
  let script = new vm.Script(babelify.code);
  const context = vm.createContext({
    benchmark: (name, fn, options) => benchManager.benchmark(name, fn, { ...options, fileName: fileLocation }),
    require,
    regeneratorRuntime: _regenerator,
    console: {
      log: (...args) => {
        console.log(...args);
      },
    },
  });
  try {
    script.runInNewContext(context, { displayErrors: true });
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * Seearches over files in directories.
 * @param {Object} benchManager benchmaanger class
 * @param {Obbject} logger Logging class
 * @param {Object} options overrides passed in
 */
const scanForFiles = async (benchManager, logger, { exclude } = {}) => {
  const exclude_string = Array.isArray(exclude) ? `!(${exclude.join("|")}|node_modules)` : `!(${exclude}|node_modules)`;
  return new Promise((resolve, reject) => {
    const currentLocation = process.cwd();
    glob(`${currentLocation}/{**${exclude_string}/,*}*.bench.js`, {}, async function (err, files) {
      const progress = logger.startTask(`Compiling files`, files.length);
      if (err) reject(err);
      const arr = [];
      for (const file of files) {
        progress.tick();
        await readFile(file, benchManager);
        arr.push(file);
      }
      resolve(arr);
    });
  });
};

module.exports = scanForFiles;
