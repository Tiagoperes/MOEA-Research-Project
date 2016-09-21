(function () {
  'use strict';

  var nsga = moea.nsga.main.execute;

  var instance = {
    objectives: 3,
    objects: 10,
    capacity: 2137,
    profitMatrix: [
      [566, 611, 506, 180, 817, 184, 585, 423, 26, 317],
      [62, 84, 977, 979, 874, 54, 269, 93, 881, 563],
      [664, 982, 962, 140, 224, 215, 12, 869, 332, 537]
    ],
    weights: [557, 898, 148, 63, 78, 964, 246, 662, 386, 272]
  };

  function generateRandom() {
    var individual = [];
    for (let i = 0; i < instance.objects; i++) {
      individual[i] = !!_.random(0, 1);
    }
    return individual;
  }

  function getProfit(objective, individual) {
    return _.reduce(individual, function (sum, isObjectPresent, index) {
      var objectValue = isObjectPresent ? instance.profitMatrix[objective][index] : 0;
      return sum + objectValue;
    }, 0);
  }

  function getTotalProfit(individual) {
    var profits = [];
    for (let i = 0; i < instance.objectives; i++) {
      profits[i] = getProfit(i, individual);
    }
    return profits;
  }

  function getWeight(individual) {
    return _.reduce(individual, function (sum, isObjectPresent, index) {
      var objectWeight = isObjectPresent ? instance.weights[index] : 0;
      return sum + objectWeight;
    }, 0);
  }

  function getFitness(objective, individual) {
    var profit = getProfit(objective, individual),
        weight = getWeight(individual);

    if (profit === 0 || weight > instance.capacity) {
      return 2;
    }
    return 1 / profit;
  }

  function getObjectiveArray() {
    var objectives = [];
    for (let i = 0; i < instance.objectives; i++) {
      objectives[i] = _.partial(getFitness, i);
    }
    return objectives;
  }

  function solutionToObject(solution) {
    return {
      numberOfObjects: _.filter(solution).length,
      weight: getWeight(solution),
      profits: getTotalProfit(solution)
    }
  }

  function solveWithNsga() {
    var solutions = nsga({
      populationSize: 100,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: 50,
      crossover: {rate: 0.5, method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / instance.objects, method: moea.help.binary.mutate}
    });

    return _.map(_.uniqWith(solutions, _.isEqual), solutionToObject);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.solveWithNsga', solveWithNsga);
}());
