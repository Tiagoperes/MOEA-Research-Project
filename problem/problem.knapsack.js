(function () {
  'use strict';

  var nsga = moea.nsga.main.execute,
      spea = moea.spea.main.execute,
      moead = moea.moead.main.execute,
      ammd = moea.ammd.main.execute;

  var instance;

  function setInstance(numberOfObjectives, numberOfItems) {
    var name = 'obj' + numberOfObjectives + 'Itm' + numberOfItems;
    instance = moea.problem.knapsack.instances[name];
  }

  function generateRandom() {
    var individual = [];
    for (let i = 0; i < instance.items; i++) {
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

  function getWeight(individual) {
    return _.reduce(individual, function (sum, isObjectPresent, index) {
      var objectWeight = isObjectPresent ? instance.weights[index] : 0;
      return sum + objectWeight;
    }, 0);
  }

  function getFitness(objective, individual) {
    //fixme: arrume um jeito menos feio de fazer isso
    if (_.get(individual.knapsackFitness, objective)) return _.get(individual.knapsackFitness, objective);
    individual.knapsackFitness = individual.knapsackFitness || [];

    var profit = getProfit(objective, individual),
        weight = getWeight(individual);

    if (profit === 0 || weight > instance.capacity) {
      individual.knapsackFitness[objective] = 2;
      return 2;
    }
    individual.knapsackFitness[objective] = 1 / profit;
    return 1 / profit;
  }

  function getObjectiveArray() {
    var objectives = [];
    for (let i = 0; i < instance.objectives; i++) {
      objectives[i] = _.partial(getFitness, i);
    }
    return objectives;
  }

  function getSolutionsInObjectiveSpace(solutions, objectives) {
    return _.map(solutions, function (s) {
      return _.map(objectives, function(objective) {
        return objective(s);
      });
    })
  }

  function solveWithNsga(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return nsga({
      populationSize: 100,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: 100,
      crossover: {rate: 0.5, method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function solveWithSpea(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return spea({
      populationSize: 100,
      archiveSize: 100,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: 100,
      crossover: {rate: 0.5, method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function solveWithMoead(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return moead({
      populationSize: 100,
      neighborhoodSize: 8,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: 100,
      crossover: {method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function solveWithAmmd(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return ammd({
      populationSize: 100,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: 1000,
      crossover: {method: moea.help.binary.singlePointCrossover},
      mutation: {rate: 1 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function test(algorithm, numberOfObjectives, numberOfItems, numberOfExecutions) {
    var executions = [];

    numberOfObjectives = numberOfObjectives || 3;
    numberOfItems = numberOfItems || 10;
    numberOfExecutions = numberOfExecutions || 1;

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('\nEXECUTION ' + (i + 1));
      console.log('---------------------');
      var solutions = algorithm(numberOfObjectives, numberOfItems);
      var uniqS = getSolutionsInObjectiveSpace(_.uniqWith(solutions, _.isEqual), getObjectiveArray());
      var worst = _.fill(new Array(numberOfObjectives), 1);
      var metrics = moea.help.report.getMetrics(uniqS, instance.pareto, worst);
      executions.push(metrics);
    }

    return moea.help.report.createReport(executions);
  }

  function getParetoFront(numberOfObjectives, numberOfItems, numberOfExecutions) {
    var result = [];

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('------ execucao ' + i + ' ------');
      result = _.uniqWith(_.concat(result, solveWithNsga(numberOfObjectives, numberOfItems)), _.isEqual);
      result = _.uniqWith(_.concat(result, solveWithSpea(numberOfObjectives, numberOfItems)), _.isEqual);
      result = _.uniqWith(_.concat(result, solveWithMoead(numberOfObjectives, numberOfItems)), _.isEqual);
      result = _.uniqWith(_.concat(result, solveWithAmmd(numberOfObjectives, numberOfItems)), _.isEqual);
    }

    var solValues = getSolutionsInObjectiveSpace(result, getObjectiveArray());
    return JSON.stringify(moea.help.pareto.getNonDominatedSet(solValues, getObjectiveArray(solValues[0])));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea,
    solveWithMoead: solveWithMoead,
    solveWithAmmd: solveWithAmmd,
    testWithNsga: _.partial(test, solveWithNsga),
    testWithSpea: _.partial(test, solveWithSpea),
    testWithMoead: _.partial(test, solveWithMoead),
    testWithAmmd: _.partial(test, solveWithAmmd),
    getParetoFront: getParetoFront,
    instances: []
  });
}());
