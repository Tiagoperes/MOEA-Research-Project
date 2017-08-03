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
    var newExtremes = initializeExtremes(extremes.min.length);

    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value < newExtremes.min[index]) {
          newExtremes.min[index] = value;
        }
        if (value > newExtremes.max[index]) {
          newExtremes.max[index] = value;
        }
      });
    });

    if (!_.isEqual(extremes.min, newExtremes.min) || !_.isEqual(extremes.max, newExtremes.max)) {
      extremes.min = newExtremes.min;
      extremes.max = newExtremes.max;
      calculateExtremesDif(extremes);
      return true;
    }
  }

  function calculateNormalizedValues(population, extremes) {
    _.forEach(population, function (individual) {
      var difToMin = _.subtractArrays(individual.evaluation, extremes.min);
      individual.normalizedEvaluation = _.divideArrays(difToMin, extremes.dif);
    });
  }

  function normalize(oldPopulation, newPopulation, extremes) {
    var extremesUpdated = updateExtremes(_.concat(oldPopulation, newPopulation), extremes);
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
