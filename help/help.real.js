(function () {
  'use strict';

  function asPreciseNumber(realNumber, precision) {
    return precision ? (Math.round(realNumber * precision) / precision) : realNumber;
  }

  function generateRandom(min, max, n, precision) {
    var individual = [];
    n = n || 1;
    for (let i = 0; i < n; i++) {
      individual[i] = asPreciseNumber(_.random(min, max, true), precision);
    }
    return individual;
  }

  function arithmeticCrossover(p1, p2, precision) {
    var c1 = [], c2 = [];
    for(let i = 0; i < p1.length; i++) {
      let childrenValues = crossTwoReals(p1[i], p2[i]);
      c1[i] = asPreciseNumber(childrenValues[0], precision);
      c2[i] = asPreciseNumber(childrenValues[1], precision);
    }
    return [c1, c2];
  }

  function crossTwoReals(r1, r2) {
    var y = _.random(0, 1, true),
        r3 = y * r1 + (1 - y) * r2,
        r4 = y * r2 + (1 - y) * r1;
    return [r3, r4];
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.real', {
    generateRandom: generateRandom,
    arithmeticCrossover: arithmeticCrossover
  });

}());
