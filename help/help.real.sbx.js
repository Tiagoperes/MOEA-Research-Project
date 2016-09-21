(function () {
  'use strict';

  const EPS = 1e-14;

  //function findBeta(u, nc) {
  //  var power = 1 / (nc + 1),
  //      base = u <= .5 ? 2 * u : 1 / (2 * (1 - u));
  //  return Math.pow(base, power);
  //}

  // SBX as described in one of the author's paper
  //function sbxCrossover(p1, p2) {
  //  var u = _.random(1, true);
  //  var beta = findBeta(u, nc);
  //  return [
  //    .5 * ((p1 + p2) - beta * Math.abs(p2 - p1)),
  //    .5 * ((p1 + p2) + beta * Math.abs(p2 - p1))
  //  ];
  //}

  // SBX as implemented by the author for NSGA-II
  // distributionIndex > 0
  function sbx(p1, p2, bounds, distributionIndex) {
    var i, rand, y1, y2, yl, yu, alpha, beta, betaq;
    var c1 = [], c2 = [];

    for (i = 0; i < p1.length; i++) {
      if (_.random(1, true) <= .5 ) {
        if (p1[i] < p2[i]) {
          y1 = p1[i];
          y2 = p2[i];
        } else {
          y1 = p2[i];
          y2 = p1[i];
        }
        if (Math.abs(p1[i] - p2[i]) > EPS) {
          yl = _.get(bounds[i], 'min') || Number.MIN_VALUE;
          yu = _.get(bounds[i], 'max') || Number.MAX_VALUE;
          rand = _.random(1, true);
          beta = 1 + (2 * (y1 - y2) / (y2 - y1));
          alpha = 2 - Math.pow(beta, -(distributionIndex + 1));
          if (rand <= (1 / alpha)) {
            betaq = Math.pow ((rand * alpha), (1 / (distributionIndex + 1)));
          } else {
            betaq = Math.pow((1 / (2 - rand * alpha)), (1 / (distributionIndex + 1)));
          }
          c1[i] = .5 * ((y1 + y2) - betaq * (y2 - y1));
          beta = 1 + (2 * (yu - y2) / (y2 - y1));
          alpha = 2 - Math.pow(beta, - (distributionIndex + 1));
          if (rand <= (1 / alpha)) {
            betaq = Math.pow((rand * alpha), (1 / (distributionIndex + 1)));
          }
          else {
            betaq = Math.pow((1 / (2 - rand * alpha)), (1 / (distributionIndex + 1)));
          }
          c2[i] = .5 * ((y1 + y2) + betaq * (y2 - y1));
          if (c1[i] < yl) {
            c1[i] = yl;
          }
          if (c1[i] > yu) {
            c1[i] = yu;
          }
          if (c2[i] < yl) {
            c2[i] = yl;
          }
          if (c2.xreal[i] > yu) {
            c2.xreal[i] = yu;
          }
        } else {
          c1[i] = p1[i];
          c2[i] = p2[i];
        }
      } else {
        c1[i] = p1[i];
        c2[i] = p2[i];
      }
    }
  }

}());
