/* problem from nsga-II paper */

(function () {
  'use strict';

  const MIN = -1000,
        MAX = 1000,
        SOLUTION_LENGTH = 11;

  var nsga = moea.method.nsga.main.execute,
      spea = moea.method.spea.main.execute,
      moead = moea.method.moead.main.execute;

  function solveWithNsga() {
    var solutions = nsga({
      populationSize: 100,
      randomize: _.partial(moea.help.binary.generateRandom, MIN, MAX, SOLUTION_LENGTH),
      objectives: [f1, f2],
      numberOfGenerations: 25,
      crossover: {rate: 0.5, method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / SOLUTION_LENGTH, method: moea.help.binary.mutate}
    });

    return _.uniq(_.map(solutions, moea.help.binary.toInt));
  }

  function solveWithSpea() {
    var solutions = spea({
      populationSize: 100,
      archiveSize: 100,
      randomize: _.partial(moea.help.binary.generateRandom, MIN, MAX, SOLUTION_LENGTH),
      objectives: [f1, f2],
      numberOfGenerations: 25,
      crossover: {rate: 0.5, method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / SOLUTION_LENGTH, method: moea.help.binary.mutate}
    });

    return _.uniq(_.map(solutions, moea.help.binary.toInt));
  }

  function solveWithMoead() {
    var solutions = moead({
      populationSize: 100,
      neighborhoodSize: 8,
      randomize: _.partial(moea.help.binary.generateRandom, MIN, MAX, SOLUTION_LENGTH),
      objectives: [f1, f2],
      numberOfGenerations: 25,
      crossover: {method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / SOLUTION_LENGTH, method: moea.help.binary.mutate}
    });

    return _.uniq(_.map(solutions, moea.help.binary.toInt));
  }

  function f1(binArray) {
    var x = moea.help.binary.toInt(binArray);
    return Math.pow(x, 2);
  }

  function f2(binArray) {
    var x = moea.help.binary.toInt(binArray);
    return Math.pow(x - 2, 2);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.sch', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea,
    solveWithMoead: solveWithMoead
  });
}());
