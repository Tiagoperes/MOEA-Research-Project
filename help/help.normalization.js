(function () {
  'use strict';

  function initializeExtremes(numberOfObjectives) {
    return {
      min: _.fill(new Array(numberOfObjectives), Infinity),
      max: _.fill(new Array(numberOfObjectives), -Infinity)
    };
  }

  function calculateExtremesDif(extremes) {
    extremes.dif = _.map(_.subtractArrays(extremes.max, extremes.min), function (value) {
      if (value === 0) return value + 0.001;
      return value;
    });
  }

  function updateExtremes(population, extremes) {
    var updated = false;
    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value < extremes.min[index]) {
          extremes.min[index] = value;
          updated = true;
        }
        if (value > extremes.max[index]) {
          extremes.max[index] = value;
          updated = true;
        }
      });
    });

    if (updated) calculateExtremesDif(extremes);

    return updated;
  }

  function calculateNormalizedValues(population, extremes) {
    _.forEach(population, function (individual) {
      var difToMin = _.subtractArrays(individual.evaluation, extremes.min);
      individual.normalizedEvaluation = _.divideArrays(difToMin, extremes.dif);
    });
  }

  function normalize(oldPopulation, newPopulation, extremes) {
    var extremesUpdated = updateExtremes(newPopulation, extremes);
    if (extremesUpdated) {
      calculateNormalizedValues(oldPopulation, extremes);
    }
    calculateNormalizedValues(newPopulation, extremes);
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.normalization', {
    initializeExtremes: initializeExtremes,
    normalize: normalize,
    updateExtremes: updateExtremes
  });
}());
