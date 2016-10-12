(function () {
  'use strict';

  function euclideanDistance(a, b, objectives) {
    return Math.sqrt(_.reduce(objectives, function (sum, objective) {
      return sum + Math.pow(objective(a) - objective(b), 2);
    }, 0));
  }

  function createDistanceKeys(population) {
    for (let i = 0; i < population.length; i++) {
      population[i].distanceMatrixKey = i;
    }
  }

  function initializeDistanceMatrix(population) {
    var distanceMatrix = [];
    for (let i = 0; i < population.length; i++) {
      distanceMatrix[i] = [];
      distanceMatrix[i][i] = 0;
    }
    return distanceMatrix;
  }

  function calculateDistances(population, objectives, distanceMatrix) {
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        let distance = euclideanDistance(population[i], population[j], objectives);
        distanceMatrix[i][j] = distance;
        distanceMatrix[j][i] = distance;
      }
    }
  }

  function calculateDistanceMatrix(population, objectives) {
    var distanceMatrix;
    createDistanceKeys(population);
    distanceMatrix = initializeDistanceMatrix(population);
    calculateDistances(population, objectives, distanceMatrix);
    return distanceMatrix;
  }

  function getNeighborsDistances(neighborhood, element, distanceMatrix) {
    var nearestNeighbors = [], eid = element.distanceMatrixKey;
    _.forEach(neighborhood, function (neighbor) {
      var nid = neighbor.distanceMatrixKey;
      if (eid !== nid) {
        nearestNeighbors.push(distanceMatrix[eid][nid]);
      }
    });
    return _.orderBy(nearestNeighbors);
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.distance', {
    calculateDistanceMatrix: calculateDistanceMatrix,
    getNeighborsDistances: getNeighborsDistances
  });
}());
