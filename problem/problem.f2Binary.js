/* problem from the original nsga paper */

(function () {
  'use strict';

  const MIN = -1000,
        MAX = 1000,
        SOLUTION_LENGTH = 11;

  var nsga = moea.nsga.main.execute;

  function solveWithNsga() {
    var solutions = nsga({
      populationSize: 100,
      randomize: _.partial(moea.help.binary.generateRandom, MIN, MAX, SOLUTION_LENGTH),
      objectives: [f21, f22],
      numberOfGenerations: 250,
      crossover: {rate: 0.5, method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / SOLUTION_LENGTH, method: moea.help.binary.mutate}
    });

    return _.uniq(_.map(solutions, moea.help.binary.toInt));
  }

  function f21(binArray) {
    var x = moea.help.binary.toInt(binArray);
    if (x <= 1) return -x;
    if (x <= 3) return -2 + x;
    if (x <= 4) return 4 - x;
    return -4 + x;
  }

  function f22(binArray) {
    var x = moea.help.binary.toInt(binArray);
    return Math.pow(x - 5, 2);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.f2Binary.solveWithNsga', solveWithNsga);

  //moea.debug = {
  //  dominates: function (a, b) {
  //    var c = _.partial(moea.help.binary.toSignedBinaryArray, _, 11);
  //    return moea.dominates(c(a), c(b), [f21, f22]);
  //  }
  //};
}());
