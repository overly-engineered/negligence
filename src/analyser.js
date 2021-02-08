// Looks at the results and does stuff with it

const getDurations = (results, isNode) => {
  const durations = {};
  Object.keys(results).forEach(key => {
    const amountDurations = results[key];
    if (!Array.isArray(amountDurations)) {
      throw new Error("Run failed to produce array of results");
    }
    if (amountDurations.length === 0) {
      throw new Error("No results to analyse");
    }
    amountDurations.forEach(dur => {
      if (!durations[key]) durations[key] = [];
      if (isNode) {
        durations[key].push(Math.round(dur.end[1] / 1000));
      } else {
        durations[key].push(dur.end - dur.start);
      }
    });
  });
  return durations;
};

const getHighLowAverage = durations => {
  let durationsWithStats = {};
  Object.keys(durations).forEach(key => {
    const complexityDurations = durations[key];
    if (complexityDurations.length) {
      const max = Math.round(
        complexityDurations.reduce(function (a, b) {
          return Math.max(a, b);
        })
      );
      const min = Math.round(
        complexityDurations.reduce(function (a, b) {
          return Math.min(a, b);
        })
      );
      const average = Math.round(
        complexityDurations.reduce(function (sum, duration) {
          return sum + duration;
        }, 0) / complexityDurations.length
      );

      return (durationsWithStats[key] = { max, min, average: Math.round(average) });
    } else {
      throw new Error("No results to analyse");
    }
  });
  return durationsWithStats;
};

const getPercentageIncrease = durations => {
  const sortedValues = Object.keys(durations)
    .sort((a, b) => {
      const one = durations[a].average;
      const two = durations[b].average;
      return one - two;
    })
    .map(key => durations[key].average);
  const lowValue = sortedValues[0];
  const highVlaue = sortedValues[sortedValues.length - 1];
  return { ...durations, percentageIncrease: Math.round(((highVlaue - lowValue) / lowValue) * 100) };
};

const analyse = (results, isNode) => {
  const resultsWithDurations = getDurations(results, isNode);
  return getPercentageIncrease(getHighLowAverage(resultsWithDurations));
};

const analyser = (results, isNode) => {
  if (!results) {
    throw new Error("Analyser missing param");
  }
  if (typeof results !== "object" || Array.isArray(results)) {
    throw new Error("Analyser param1 should be an array with objects of shape {[key]: {}}");
  }
  return analyse(results, isNode);
};

export default analyser;
