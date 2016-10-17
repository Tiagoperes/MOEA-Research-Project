/* problem from the original nsga paper */

(function () {
  'use strict';

  const MIN = 0,
        MAX = 1,
        N = 30,
        PRECISION = 1000;

  var nsga = moea.nsga.main.execute,
      spea = moea.spea.main.execute;

  var test = 0;
  function randomize() {
    test++;
    if (test === 1) {
      var best = [0.5];
      for (let i = 1; i < N; i++) best.push(0);
      return best;
    }
    return moea.help.real.generateRandom(MIN, MAX, N, 1000);
  }

  function solveWithNsga(seed) {
    moea.help.random.setSeed(seed);

    var solutions = nsga({
      populationSize: 100,
      //randomize: _.partial(moea.help.real.generateRandom, MIN, MAX, N, PRECISION),
      randomize: randomize,
      objectives: [f1, f2],
      numberOfGenerations: 200,
      //crossover: {rate: 0.5, method: _.partial(moea.help.real.arithmeticCrossover, _, _, PRECISION)},
      crossover: {rate: 0.5, method: _.partial(moea.help.real.sbx, _, _, {min: MIN, max: MAX}, 1)},
      mutation: {rate: 0}
    });

    _.forEach(solutions, function (s) {
      console.log('%c(' + f1(s) + ', ' + f2(s) + ')%c: ' + s.join(', ') + '\n', 'color: red', 'color: auto');
    });
    //return solutions;
  }

  function solveWithSpea() {
    var solutions = spea({
      populationSize: 50,
      archiveSize: 50,
      randomize: _.partial(moea.help.real.generateRandom, MIN, MAX),
      objectives: [f1, f2],
      numberOfGenerations: 250,
      crossover: {rate: 0.5, method: moea.help.real.arithmeticCrossover},
      mutation: {rate: 0}
    });

    return solutions;
  }

  function f1(x) {
    return x[0];
  }

  function f2(x) {
    var gx = g(x);
    return gx * (1 - Math.sqrt(x[0] / gx));
  }

  function g(x) {
    return 1 + 9 * _.sum(_.tail(x)) / (N - 1);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.zdt1', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea
  });
}());
