(function () {
  'use strict';

  function generateAllPossibleWeightVectors(numberOfObjectives, divisions) {
    var weights = [];
    var w = _.fill(new Array(numberOfObjectives), 0);
    var i = numberOfObjectives - 1;
    while (i >= 0) {
      weights.push(_.clone(w));
      while (w[i] === divisions) {
        i--;
      }
      if (i >= 0) {
        w[i]++;
        i++;
        while (i < numberOfObjectives) {
          w[i] = 0;
          i++;
        }
        i--;
      }
    }
    return weights;
  }

  function generateWeightVectors(numberOfObjectives, divisions) {
    var weights = _.filter(generateAllPossibleWeightVectors(numberOfObjectives, divisions), function (w) {
      return _.sum(w) === divisions;
    });
    return _.map(weights, _.partial(_.map, _, _.partial(_.divide, _, divisions)));
  }

  function createNeighborhoods(population, neighborhoodSize) {
    var distanceMatrix = moea.help.distance.getDistanceMatrix(population, 'weights');
    _.forEach(population, function (individual, index) {
      individual.neighborhood = _.map(_.slice(_.orderBy(distanceMatrix[index], 'distance'), 0, neighborhoodSize), 'individual');
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'moead.neighborhood', {
    generateWeightVectors: generateWeightVectors,
    createNeighborhoods: createNeighborhoods
  });
}());
