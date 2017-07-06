(function () {
  'use strict';

  function createIds(population) {
    for (let i = 0; i < population.length; i++) {
      population[i].id = i;
    }
  }

  function initializeDistanceArrays(population) {
    _.forEach(population, function (individual) {
      individual.distances = [];
      individual.distances[individual.id] = 0;
    });
  }

  function translateSDE(positionToTranslate, reference) {
    return _.map(positionToTranslate, function (value, index) {
      return value < reference[index] ? reference[index] : value;
    });
  }

  function calculateSDEDistanceArrays(population, property) {
    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < population.length; j++) {
        if (i === j) continue;
        let a = population[i][property];
        let b = translateSDE(population[j][property], a);
        population[i].distances[j] = moea.help.distance.getEuclideanDistance(a, b);
      }
    }
  }

  function calculateDistanceArrays(population, property) {
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        let a = population[i][property];
        let b = population[j][property];
        let distance = moea.help.distance.getEuclideanDistance(a, b);
        population[i].distances[j] = distance;
        population[j].distances[i] = distance;
      }
    }
  }

  function calculateNearestNeighbors(population) {
    _.forEach(population, function (individual) {
      var distancesWithIndividuals = _.map(individual.distances, function (distance, index) {
        return {distance: distance, individual: population[index]};
      });
      individual.nearestNeighbors = _.orderBy(distancesWithIndividuals, 'distance')
    });
  }

  function calculateDistances(population, property, shouldUseSDE) {
    var calculateDistances = shouldUseSDE ? calculateSDEDistanceArrays : calculateDistanceArrays;
    createIds(population);
    initializeDistanceArrays(population);
    calculateDistances(population, property);
    calculateNearestNeighbors(population);
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.spea.distance', {
    calculateDistances: calculateDistances
  });
}());
