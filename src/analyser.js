// Looks at the results and does stuff with it
const NANO_SECONDS_IN_A_SECOND = 1000000000;

/**
 * From start and end times calculate how long a function run took.
 * @param {*} data
 * @param {*} isNode
 */
const getDurations = (data, isNode) => {
  const amountDurations = data;
  let results = {};
  if (!amountDurations) {
    return data;
  }
  Object.keys(amountDurations).forEach(key => {
    const durations = amountDurations[key];
    if (!Array.isArray(durations)) {
      throw new Error("Run failed to produce array of results");
    }
    if (durations.length === 0) {
      throw new Error("No results to analyse");
    }

    let val = [];
    results[key] = durations.forEach(dur => {
      if (isNode) {
        // Using hrtime we get the duration by default
        val.push(dur);
      } else {
        val.push(dur.end - dur.start);
      }
    });
    results[key] = val;
  });
  return results;
};

/**
 * From an arrray get the maximum or minimum HRT
 * @param {Array} array Array of HRT objects in form [seconds, nanoseconds]
 * @param {Boolean} findMax Boolean to find the max or min
 */
const processHRTMinMax = (array, findMax) => {
  return array.reduce(function (a, b) {
    if (findMax) {
      if (a[0] > b[0]) {
        return a;
      } else if (b[0] > a[0]) {
        return b;
      } else {
        if (Math.max(a[1], b[1])) {
          return a;
        } else {
          return b;
        }
      }
    } else {
      if (a[0] > b[0]) {
        return b;
      } else if (b[0] > a[0]) {
        return a;
      } else {
        if (Math.max(a[1], b[1])) {
          return b;
        } else {
          return a;
        }
      }
    }
  });
};

/**
 * Get the median HRT from an array of HRT objects.
 * @param {Array} array Array of HRT objects in form [seconds, nanoseconds]
 */
const processHRTMedian = array => {
  const average = array.sort((a, b) => {
    if (a[0] > b[0]) {
      return 1;
    } else if (a[0] < b[0]) {
      return -1;
    } else {
      return a[1] - b[1];
    }
  });
  return average[Math.round(Math.ceil(average.length - 1) / 2)];
};

/**
 * Function which will get the high low and average values from an array
 * @param {Object} runs An object with run iterations as keys {100: []}
 * @param {Boolean} isNode Whether we are running in node
 */
const getHighLowAverage = (runs, isNode) => {
  let stats = {};
  if (!runs) {
    return;
  }
  const iterations = Object.keys(runs);
  iterations.forEach(key => {
    if (isNode) {
      const max = processHRTMinMax(runs[key], true);
      const min = processHRTMinMax(runs[key]);
      const average = processHRTMedian(runs[key]);
      stats[key] = { max, min, average };
    } else {
      const max = Math.round(
        runs[key].reduce(function (a, b) {
          return Math.max(a, b);
        })
      );
      const min = Math.round(
        runs[key].reduce(function (a, b) {
          return Math.min(a, b);
        })
      );
      const average = runs[key].sort((a, b) => a - b)[Math.ceil((runs[key].length - 1) / 2)];
      stats[key] = { max, min, average };
    }
  });
  const percentageIncrease = getPercentageIncrease(
    stats[iterations[iterations.length - 1]].average,
    stats[iterations[0]].average,
    isNode
  );

  return { ...stats, percentageIncrease };
};

/**
 * Get the percentage increase between two hrt or numbers
 * @param {Array|Number} max
 * @param {Array|Number} min
 * @param {Boolean} isNode
 */
const getPercentageIncrease = (max, min, isNode) => {
  if (isNode) {
    const maxNanos = max[0] * NANO_SECONDS_IN_A_SECOND + max[1];
    const minNanos = min[0] * NANO_SECONDS_IN_A_SECOND + min[1];
    return Math.round(((maxNanos - minNanos) / minNanos) * 100);
  } else {
    return Math.round(((max - min) / min) * 100);
  }
};

/**
 * Takes the results from the executer for analysis
 * @param {Array} allResults
 * @param {Boolean} isNode
 */
const analyse = (allResults, isNode) => {
  const results = allResults.filter(r => r.data);
  const failures = allResults.filter(r => r.error);
  const resultsWithDurations = results.map(res => ({ ...res, results: getDurations(res.data, isNode) }));
  const resultsWithAverages = resultsWithDurations.map(res => ({
    ...res,
    stats: getHighLowAverage(res.results, isNode)
  }));

  return [...resultsWithAverages, ...failures];
};

/**
 * Checks that the params are in the right format. Then starts the analysis
 * @param {Array} Results
 * @param {Boolean} isNode
 */
const analyser = (results, isNode) => {
  if (!results) {
    throw new Error("Analyser missing param");
  }
  if (typeof results !== "object" || !Array.isArray(results)) {
    throw new Error("Analyser param1 should be an array with objects of shape {[key]: {}}");
  }
  return analyse(results, isNode);
};

module.exports = analyser;
