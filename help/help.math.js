(function () {
  'use strict';

  function getEuclideanDistance(a, b) {
    return Math.sqrt(_.reduce(a, function (sum, value, index) {
      return sum + Math.pow(value - b[index], 2);
    }, 0));
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.math', {
    getEuclideanDistance: getEuclideanDistance
  });
}());
