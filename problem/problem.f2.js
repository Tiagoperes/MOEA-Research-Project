/* problem from the original nsga paper */

(function () {
  'use strict';

  const MIN = -1000,
        MAX = 1000;

  var nsga = moea.method.nsga.main.execute,
      spea = moea.method.spea.main.execute;

  function solveWithNsga() {
    var solutions = nsga({
      populationSize: 100,
      randomize: _.partial(moea.help.real.generateRandom, MIN, MAX),
      objectives: [f21, f22],
      numberOfGenerations: 250,
      crossover: {rate: 0.5, method: moea.help.real.arithmeticCrossover},
      mutation: {rate: 0}
    });

    return _.orderBy(_.flatten(solutions));
  }

  function solveWithSpea() {
    var solutions = spea({
      populationSize: 100,
      archiveSize: 10,
      randomize: _.partial(moea.help.real.generateRandom, MIN, MAX),
      objectives: [f21, f22],
      numberOfGenerations: 250,
      crossover: {rate: 0.5, method: moea.help.real.arithmeticCrossover},
      mutation: {rate: 0}
    });

    return _.orderBy(_.flatten(solutions));
  }

  function f21(real) {
    var x = real[0];
    if (x <= 1) return -x;
    if (x <= 3) return -2 + x;
    if (x <= 4) return 4 - x;
    return -4 + x;
  }

  function f22(real) {
    var x = real[0];
    return Math.pow(x - 5, 2);
  }

  function test(testCase) {
    var population = _.map(testCase, function (e) {return [e];});
    var objectives = [f21, f22];
    var distanceMatrix = moea.method.spea.distance.calculateDistanceMatrix(population, objectives);
    moea.method.spea.fitness.calculate(population, objectives, distanceMatrix);
    return _.map(population, _.partial(_.get, _, 'fitness.value'));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.f2', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea,
    test: test,
    objs: function (x) {return [f21(x), f22(x)]}
  });

  //moea.debug = {
  //  dominates: function (a, b) {
  //    var c = _.partial(moea.help.binary.toSignedBinaryArray, _, 11);
  //    return moea.dominates(c(a), c(b), [f21, f22]);
  //  }
  //};
}());
