(function () {
  'use strict';

  function getEuclideanDistance(a, b) {
    return Math.sqrt(_.reduce(a, function (sum, value, index) {
      return sum + Math.pow(value - b[index], 2);
    }, 0));
  }

  function createEmptyMatrix(size) {
    var matrix = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
    }
    return matrix;
  }

  function getDistanceMatrix(population, property) {
    var distanceMatrix = createEmptyMatrix(population.length);

    for (let i = 0; i < population.length; i++) {
      distanceMatrix[i][i] = {distance: 0, individual: population[i]};
      for (let j = i + 1; j < population.length; j++) {
        let dist = getEuclideanDistance(population[i][property], population[j][property]);
        distanceMatrix[i][j] = {distance: dist, individual: population[j]};
        distanceMatrix[j][i] = {distance: dist, individual: population[i]};
      }
    }
    return distanceMatrix;
  }

  function getAngleBetweenVectors(v1, v2) {
    var dotProduct = _.sum(_.multiplyArrays(v1, v2)),
      v1Magnitude = Math.sqrt(_.sumBy(v1, _.partial(Math.pow, _, 2))),
      v2Magnitude = Math.sqrt(_.sumBy(v2, _.partial(Math.pow, _, 2))),
      cosine = dotProduct / (v1Magnitude * v2Magnitude);

    if (isNaN(cosine)) return Math.acos(1);
    return Math.acos(cosine);
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.distance', {
    getEuclideanDistance: getEuclideanDistance,
    getDistanceMatrix: getDistanceMatrix,
    getAngleBetweenVectors: getAngleBetweenVectors
  });
}());
