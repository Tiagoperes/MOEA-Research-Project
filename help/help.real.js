(function () {
  'use strict';

  function generateRandom(min, max) {
    return [_.random(min, max, true)];
  }

  function arithmeticCrossover(p1, p2) {
    var y = _.random(0, 1, true),
        c1 = y * p1[0] + (1 - y) * p2[0],
        c2 = y * p2[0] + (1 - y) * p1[0];
    return [[c1], [c2]];
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.real', {
    generateRandom: generateRandom,
    arithmeticCrossover: arithmeticCrossover
  });

}());
