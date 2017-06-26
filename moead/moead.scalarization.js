(function () {
  'use strict';

  function scalarizeWS(values, weights) {
    return _.reduce(weights, function (sum, weight, index) {
      return sum + weight * values[index];
    }, 0);
  }

  function scalarizeTE(values, best, weights) {
    return _.reduce(weights, function (max, weight, index) {
      var solValue = values[index],
          dif;

      if (best[index] === undefined || solValue < best[index]) {
        best[index] = solValue;
      }

      dif = weight * Math.abs(solValue - best[index]);
      return dif > max ? dif : max;
    }, 0);
  }

  window.moea = window.moea || {};
  _.set(moea, 'moead.scalarization', {
    scalarizeWS: scalarizeWS,
    scalarizeTE: scalarizeTE
  });
}());
