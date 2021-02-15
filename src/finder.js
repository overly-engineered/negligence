// Entry and Orchestrator
var fs = require("fs");
const path = require("path");
const vm = require("vm");
const babel = require("@babel/core");
const _regenerator = require("@babel/runtime/regenerator");
var glob = require("glob");

const readFile = async (string, benchManager) => {
  const folder = path.resolve(string.replace(/\/\w*\.bench.js$/, ""));
  let data;
  try {
    data = await fs.readFileSync(string, "utf8");
  } catch (e) {
    console.log("Error:", e.stack);
  }

  const babelify = babel.transform(data, {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          corejs: "2.6.12"
        }
      ]
    ],
    plugins: [
      "@babel/plugin-transform-async-to-generator",
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          resolvePath(sourcePath) {
            const res = path.relative(process.cwd(), path.resolve(`${folder}/` + sourcePath));
            return path.resolve(res);
          }
        }
      ]
    ],
    moduleRoot: __dirname
  });
  let script = new vm.Script(babelify.code);
  const context = vm.createContext({
    benchmark: (name, fn, options) => benchManager.benchmark(name, fn, { ...options, fileName: string }),
    require,
    regeneratorRuntime: _regenerator,
    console: {
      log: (...args) => {
        console.log(...args);
      }
    }
  });
  try {
    script.runInNewContext(context, { displayErrors: true });
  } catch (e) {
    throw new Error(e);
  }
};

const scanForFiles = async (benchManager, logger, { exclude } = {}) => {
  const exclude_string = Array.isArray(exclude) ? `!(${exclude.join("|")})` : `!(${exclude})`;
  return new Promise((resolve, reject) => {
    glob(`**/${exclude_string}/*.bench.js`, {}, async function (err, files) {
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
