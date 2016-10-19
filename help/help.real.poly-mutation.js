(function () {
  'use strict';

  function ensureBounds(number, bounds) {
    if (number < bounds.min) return bounds.min;
    if (number > bounds.max) return bounds.max;
    return number;
  }

  function findDeltaq(delta1, delta2, nm) {
    var rand = Math.random(),
        exponentialFactor = 1 / (1 + nm),
        xy, val;

    if (rand <= 0.5) {
      xy = 1 - delta1;
      val = 2 * rand + (1 - 2 * rand) * (Math.pow(xy, nm + 1));
      return  Math.pow(val, exponentialFactor) - 1;
    }

    xy = 1 - delta2;
    val = 2 * (1 - rand) + 2 * (rand - 0.5) * (Math.pow(xy, nm + 1));
    return  1 - Math.pow(val, exponentialFactor);
  }

  function mutateReal(number, bounds, nm) {
    var boundaryLength = bounds.max - bounds.min,
        delta1 = (number - bounds.min) / boundaryLength,
        delta2 = (bounds.max - number) / boundaryLength,
        deltaq = findDeltaq(delta1, delta2, nm);

    return ensureBounds(number + deltaq * boundaryLength, bounds);
  }

  function mutate(individual, bounds, nm) {
    var mutationProbability = individual.length > 1 ? 0.5 : 1;
    return  _.map(individual, function (variable) {
      return Math.random() > mutationProbability ? variable : mutateReal(variable, bounds, nm);
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.real.polyMutation.mutate', mutate);

}());
