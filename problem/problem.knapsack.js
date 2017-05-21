(function () {
  'use strict';
  
  const USE_SOLUTION_VALIDATION = true;

  var nsga = moea.nsga.main.execute,
      spea = moea.spea.main.execute,
      moead = moea.moead.main.execute,
      aemmt = moea.aemmt.main.execute,
      aemmd = moea.aemmd.main.execute,
      nsga3 = moea.nsga3.main.execute;

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
    makeValid(individual);
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

    if (weight > instance.capacity) {
      individual.knapsackFitness[objective] = 0;
      return 0;
    }
    individual.knapsackFitness[objective] = -profit;
    return -profit;
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
  
  function getIndexesWithTrue(solution) {
    return _.reduce(solution, function(result, value, index) {
      if (value) result.push(index); 
      return result;
    }, []);
  }
  
  function makeValid(solution) {
	  var weight = getWeight(solution);
    var indexesWithTrue = getIndexesWithTrue(solution);
	  while (USE_SOLUTION_VALIDATION && weight > instance.capacity) {
      let objectToRemove = _.sample(indexesWithTrue);
      solution[objectToRemove] = false;
      indexesWithTrue.splice(objectToRemove, 1);
      weight -= instance.weights[objectToRemove];
	  }
  }
  
  /*function getOrderedIndexesByWeights(solution) {
    return _.orderBy(getIndexesWithTrue(solution), function (index) {
      return instance.weights[index];
    });
  }
  
  function makeValid(solution) {
	  var weight = getWeight(solution);
    if (USE_SOLUTION_VALIDATION) {
      let indexesOrderedByWeight = getOrderedIndexesByWeights(solution);
      while (weight > instance.capacity) {
        let objectToRemove = _.last(indexesOrderedByWeight);
        solution[objectToRemove] = false;
        indexesOrderedByWeight.pop();
        weight -= instance.weights[objectToRemove];
      }
    }
  }*/
  
  function crossover(p1, p2) {
	  var children = moea.help.binary.uniformCrossover(p1, p2);
	  _.forEach(children, makeValid);
	  return children;
  }

  function solveWithNsga(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return nsga({
      populationSize: 150,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: numberOfItems * 2,
      crossover: {rate: 0.5, method: crossover},
      mutation: {rate: 2 / numberOfItems, method: moea.help.binary.mutate}
    });
  }

  function solveWithNsga3(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return nsga3({
      populationSize: 150,
      numberOfMeanPoints: 7, // must be (power of 2) - 1
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: numberOfItems * 2,
      crossover: {rate: 0.5, method: crossover},
      mutation: {rate: 2 / numberOfItems, method: moea.help.binary.mutate}
    });
  }

  function solveWithSpea(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return spea({
      populationSize: 150,
      archiveSize: 150,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: numberOfItems * 2,
      crossover: {rate: 0.5, method: crossover},
      mutation: {rate: 2 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function solveWithMoead(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return moead({
      populationSize: 150,
      neighborhoodSize: 10,
      useTchebycheff: false,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: numberOfItems * 2,
      crossover: {method: crossover},
      mutation: {rate: 2 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function solveWithAemmt(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return aemmt({
      elementsPerTable: 50,
      dominationTableLimit: 150,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: numberOfItems * 150,
      crossover: {method: crossover},
      mutation: {rate: 2 / instance.items, method: moea.help.binary.mutate}
    });
  }

  function solveWithAemmd(numberOfObjectives, numberOfItems) {
    setInstance(numberOfObjectives, numberOfItems);

    return aemmd({
      populationSize: 100,
      randomize: generateRandom,
      objectives: getObjectiveArray(),
      numberOfGenerations: numberOfItems * 10,
      crossover: {method: crossover},
      mutation: {rate: 2 / instance.items, method: moea.help.binary.mutate}
    });
  }

  //function test(algorithm, numberOfObjectives, numberOfItems, numberOfExecutions) {
  //  var dbName = 'kp-' + numberOfObjectives + '-' + numberOfItems + '-' + algorithm.name.replace('solveWith', '').toLowerCase();
  //  var worst = _.fill(new Array(numberOfObjectives), 0);
  //  var numberOfRuns, db, metrics;
  //
  //  numberOfObjectives = numberOfObjectives || 3;
  //  numberOfItems = numberOfItems || 10;
  //  numberOfExecutions = numberOfExecutions || 1;
  //  setInstance(numberOfObjectives, numberOfItems);
  //
  //  if (!localStorage[dbName]) localStorage[dbName] = '[]';
  //  numberOfRuns = numberOfExecutions - JSON.parse(localStorage[dbName]).length;
  //
  //  for (let i = 0; i < numberOfRuns; i++) {
  //    console.log('\nEXECUTION ' + (i + 1));
  //    console.log('---------------------');
  //    var solutions = algorithm(numberOfObjectives, numberOfItems);
  //    var uniqS = getSolutionsInObjectiveSpace(_.uniqWith(solutions, _.isEqual), getObjectiveArray());
  //    db = JSON.parse(localStorage[dbName]);
  //    db.push(uniqS);
  //    localStorage[dbName] = JSON.stringify(db);
  //  }
  //
  //  db = JSON.parse(localStorage[dbName]);
  //  metrics = _.map(db, function (ndSet) {
  //    return moea.help.report.getMetrics(ndSet, instance.pareto, worst);
  //  });
  //
  //  var ans = moea.help.report.createReport(metrics);
  //  document.body.innerHTML = '<pre>' + JSON.stringify(ans).replace(/"er":(\d+\.?\d*),"gd":(\d+\.?\d*),"ps":(\d+\.?\d*),"pcr":\d+\.?\d*,"sp":\d+\.?\d*,"fsp":(\d+\.?\d*),"ms":(\d+\.?\d*),"hv":(\d+\.?\d*)/g, '$1\t$2\t$3\t$4\t$5\t$6').replace(/(\d+)\.(\d+)/g,'$1,$2').replace(/[\{\}]/g, '').replace(/,"sd":/g, '\n"sd":') + '</pre>';
  //  return ans;
  //}

  function test(algorithm, numberOfObjectives, numberOfItems, numberOfExecutions, reset) {
    var dbName = 'kp-res-' + numberOfObjectives + '-' + numberOfItems + '-' + algorithm.name.replace('solveWith', '').toLowerCase();
    var worst = _.fill(new Array(numberOfObjectives), 0);
    var numberOfRuns, db;

    numberOfObjectives = numberOfObjectives || 3;
    numberOfItems = numberOfItems || 10;
    numberOfExecutions = numberOfExecutions || 1;
    setInstance(numberOfObjectives, numberOfItems);

    if (!localStorage[dbName] || reset) localStorage[dbName] = '[]';
    numberOfRuns = numberOfExecutions - JSON.parse(localStorage[dbName]).length;

    for (let i = 0; i < numberOfRuns; i++) {
      console.log('\nEXECUTION ' + (i + 1));
      console.log('---------------------');
      var solutions = algorithm(numberOfObjectives, numberOfItems);
      var uniqS = getSolutionsInObjectiveSpace(_.uniqWith(solutions, _.isEqual), getObjectiveArray());
      var metrics = moea.help.report.getMetrics(uniqS, instance.pareto, worst);
      db = JSON.parse(localStorage[dbName]);
      db.push(metrics);
      localStorage[dbName] = JSON.stringify(db);
    }

    db = JSON.parse(localStorage[dbName]);

    var ans = moea.help.report.createReport(db);
    document.body.innerHTML = '<pre>' + JSON.stringify(ans).replace(/"er":(\d+\.?\d*),"gd":(\d+\.?\d*),"ps":(\d+\.?\d*),"pcr":\d+\.?\d*,"sp":\d+\.?\d*,"fsp":(\d+\.?\d*),"ms":(\d+\.?\d*),"hv":(\d+\.?\d*)/g, '$1\t$2\t$3\t$4\t$5\t$6').replace(/(\d+)\.(\d+)/g,'$1,$2').replace(/[\{\}]/g, '').replace(/,"sd":/g, '\n"sd":') + '</pre>';
    return ans;
  }

  function getParetoFront(numberOfObjectives, numberOfItems, numberOfExecutions) {
    var result = [];

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('------ execucao ' + i + ' ------');
      result = _.uniqWith(_.concat(result, solveWithNsga(numberOfObjectives, numberOfItems)), _.isEqual);
      result = _.uniqWith(_.concat(result, solveWithSpea(numberOfObjectives, numberOfItems)), _.isEqual);
      //result = _.uniqWith(_.concat(result, solveWithMoead(numberOfObjectives, numberOfItems)), _.isEqual);
      //result = _.uniqWith(_.concat(result, solveWithAmmd(numberOfObjectives, numberOfItems)), _.isEqual);
    }

    var solValues = getSolutionsInObjectiveSpace(result, getObjectiveArray());
    var ans = JSON.stringify(moea.help.pareto.getNonDominatedSet(solValues, getObjectiveArray(solValues[0])));
    document.body.innerText = ans;
    return ans;
  }
  
  function objectivesFixed(numberOfObjectives) {
    var objs = [];
    for (let i = 0; i < numberOfObjectives; i++) {
      objs.push(_.partial(_.get, _, i));
    }
    return objs;
  }

  function addToParetoFront(numberOfObjectives, numberOfItems, numberOfExecutions) {
    var result = [];

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('------ execucao ' + i + ' ------');
      //result = _.uniqWith(_.concat(result, solveWithNsga(numberOfObjectives, numberOfItems)), _.isEqual);
      //result = _.uniqWith(_.concat(result, solveWithSpea(numberOfObjectives, numberOfItems)), _.isEqual);
      //result = _.uniqWith(_.concat(result, solveWithMoead(numberOfObjectives, numberOfItems)), _.isEqual);
      //result = _.uniqWith(_.concat(result, solveWithAmmd(numberOfObjectives, numberOfItems)), _.isEqual);
      result = _.uniqWith(_.concat(result, solveWithAemmt(numberOfObjectives, numberOfItems)), _.isEqual);
    }

    var solValues = getSolutionsInObjectiveSpace(result, getObjectiveArray());
    var best = _.concat(instance.pareto, solValues);
    var ndBest = moea.help.pareto.getNonDominatedSet(best, objectivesFixed(numberOfObjectives));
    var removed = _.filter(instance.pareto, function (x) {return !_.find(ndBest, _.partial(_.isEqual, x))}).length;
    var added = _.filter(ndBest, function (x) {return !_.find(instance.pareto, _.partial(_.isEqual, x))}).length;
    var ans = JSON.stringify(ndBest);
    console.log('current Pareto: ' + instance.pareto.length);
    console.log('new Pareto: ' + ndBest.length);
    console.log('removed: ' + removed);
    console.log('added: ' + added);
    document.body.innerText = ans;
    return ans;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea,
    solveWithMoead: solveWithMoead,
    solveWithAemmt: solveWithAemmt,
    solveWithAemmd: solveWithAemmd,
    solveWithNsga3: solveWithNsga3,
    testWithNsga: _.partial(test, solveWithNsga),
    testWithSpea: _.partial(test, solveWithSpea),
    testWithMoead: _.partial(test, solveWithMoead),
    testWithAemmt: _.partial(test, solveWithAemmt),
    testWithAemmd: _.partial(test, solveWithAemmd),
    testWithNsga3: _.partial(test, solveWithNsga3),
    getParetoFront: getParetoFront,
    addToParetoFront: addToParetoFront,
    instances: {}
  });
}());
