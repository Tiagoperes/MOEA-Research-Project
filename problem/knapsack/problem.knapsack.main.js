(function () {
  'use strict';

  const USE_SOLUTION_VALIDATION = true;

  function getProfit(objective, individual, instance) {
    return _.reduce(individual, function (sum, isItemPresent, index) {
      var itemValue = isItemPresent ? instance.profitMatrix[objective][index] : 0;
      return sum + itemValue;
    }, 0);
  }

  function getWeight(individual, instance) {
    return _.reduce(individual, function (sum, isItemPresent, index) {
      var itemWeight = isItemPresent ? instance.weights[index] : 0;
      return sum + itemWeight;
    }, 0);
  }

  function getFitness(objective, individual, instance) {
    var profit = getProfit(objective, individual, instance),
        weight = getWeight(individual, instance);

    if (weight > instance.capacity) return 0;
    return -profit;
  }

  function getObjectives(instance) {
    var objectives = [];
    for (let i = 0; i < instance.objectives; i++) {
      objectives[i] = _.partial(getFitness, i, _, instance);
    }
    return objectives;
  }

  function getIndexesWithTrue(solution) {
    return _.reduce(solution, function(result, value, index) {
      if (value) result.push(index);
      return result;
    }, []);
  }

  function makeValid(solution, instance) {
    var weight = getWeight(solution, instance);
    var indexesWithTrue = getIndexesWithTrue(solution);
    while (USE_SOLUTION_VALIDATION && weight > instance.capacity) {
      let rand = _.random(indexesWithTrue.length - 1);
      let itemToRemove = indexesWithTrue[rand];
      solution[itemToRemove] = false;
      indexesWithTrue.splice(rand, 1);
      weight -= instance.weights[itemToRemove];
    }
  }

  function generateRandom(instance) {
    var individual = [];
    for (let i = 0; i < instance.items; i++) {
      individual[i] = !!_.random(0, 1);
    }
    makeValid(individual, instance);
    return individual;
  }

  function crossover(p1, p2, instance) {
    var children = moea.help.binary.uniformCrossover(p1, p2);
    _.forEach(children, _.partial(makeValid, _, instance));
    return children;
  }

  function getInstance(numberOfObjectives, numberOfItems) {
    var name = 'obj' + numberOfObjectives + 'Itm' + numberOfItems;
    return moea.problem.knapsack.instances[name];
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.main', {
    getInstance: getInstance,
    crossover: crossover,
    generateRandom: generateRandom,
    getObjectives: getObjectives,
    makeValid: makeValid
  });

}());
