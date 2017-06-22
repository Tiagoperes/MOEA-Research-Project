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

  function calculateDistanceArrays(population, property) {
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        let distance = moea.help.math.getEuclideanDistance(population[i][property], population[j][property]);
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

  function calculateDistances(population, property) {
    createIds(population);
    initializeDistanceArrays(population);
    calculateDistanceArrays(population, property);
    calculateNearestNeighbors(population);
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.distance', {
    calculateDistances: calculateDistances
  });
}());
