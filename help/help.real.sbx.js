(function () {
  'use strict';

  const EPS = 1e-14;

  function equals(a, b) {
    return Math.abs(a - b) <= EPS;
  }

  function betaq(minParent, maxParent, betaTerm, nc) {
    var beta = 1 + 2 * betaTerm / (maxParent - minParent),
        alpha = 2 - Math.pow(beta, -(nc + 1)),
        rand = Math.random();

    return rand <= 1 / alpha ?
      (Math.pow(rand * alpha, 1 / (nc + 1))) :
      (Math.pow(1 / (2 - rand * alpha), 1 / (nc + 1)));
  }

  function makeChild(minParent, maxParent, betaq) {
    return 0.5 * (minParent + maxParent) + betaq * (maxParent - minParent);
  }

  function ensureBounds(number, bounds) {
    if (number < bounds.min) return bounds.min;
    if (number > bounds.max) return bounds.max;
    return number;
  }

  function cross(p1, p2, bounds, nc) {
    var minParent, maxParent, betaq1, betaq2;

    if (equals(p1, p2)) {
      return [p1, p2];
    }

    minParent = _.min([p1, p2]);
    maxParent = _.max([p1, p2]);
    betaq1 = -betaq(minParent, maxParent, minParent - bounds.min, nc);
    betaq2 = betaq(minParent, maxParent, bounds.max - maxParent, nc);

    return [
      ensureBounds(makeChild(minParent, maxParent, betaq1), bounds),
      ensureBounds(makeChild(minParent, maxParent, betaq2), bounds)
    ];
  }

  function sbx(p1, p2, bounds, nc) {
    var c1 = [],
        c2 = [],
        crossProbability = p1.length > 1 ? 0.5 : 1;

    for (let i = 0; i < p1.length; i++) {
      if (Math.random() < crossProbability) {
        let childrenValues = cross(p1[i], p2[i], bounds, nc);
        c1[i] = childrenValues[0];
        c2[i] = childrenValues[1];
      } else {
        c1[i] = p1[i];
        c2[i] = p2[i];
      }
    }

    return [c1, c2];
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.real.sbx', sbx);

}());
