// Looks at the results and does stuff with it

const calculateDurations = results => {
  const durations = [];
  Object.keys(results).forEach(key => {
    durations.push(results[key].end - results[key].start);
  });
  return durations;
};

const getHighLowAverage = durations => {
  if (durations.length) {
    const max = durations.reduce(function (a, b) {
      return Math.max(a, b);
    });
    const min = durations.reduce(function (a, b) {
      return Math.min(a, b);
    });
    const average =
      durations.reduce(function (sum, value) {
        return sum + value;
      }, 0) / durations.length;

    return { max, min, average };
  } else {
    throw new Error("No results to analyse");
  }
};

const analyser = ({ results } = {}) => {
  if (!results) {
    throw new Error("Analyser missing param");
  }
  if (typeof results !== "object" || Array.isArray(results)) {
    throw new Error("Analyser param1 should be an object of shape {results: {}}");
  }
  const durations = calculateDurations(results);
  const stats = getHighLowAverage(durations);
  return stats;
};

export default analyser;
