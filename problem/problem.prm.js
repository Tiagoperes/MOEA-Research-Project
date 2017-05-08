(function () {
  'use strict';

  const DISCONNECTION_RATE = 0.1,
        DATA_FLOW = 300;

  var nsga = moea.nsga.main.execute,
      spea = moea.spea.main.execute,
      moead = moea.moead.main.execute;

  var graph, weights, costs, root, destinations, dmax, problems, worst, objectives;

  function setPrmInstance(instance, problem) {
    graph = instance.graph;
    weights = instance.weights;
    root = instance.root;
    destinations = instance.destinations;
    dmax = instance.dmax;
    objectives = problems[problem - 1];
    worst = _.fill(new Array(objectives.length), -Infinity);

    costs = _.map(weights, function (weightList) {
      return _.map(weightList, 'cost');
    });
  }


  function getTreesInObjectiveSpace(trees) {
    return _.map(trees, function (tree) {
      return _.map(objectives, function(objective) {
        return objective(tree);
      });
    })
  }

  function filter(population) {
    var size = population.length;
    var filtered = _.uniqWith(population, function (a, b) {
      var values = getTreesInObjectiveSpace([a, b]);
      return _.isEqual(values[0], values[1]);
    });
    while (filtered.length < size) {
      filtered.push(moea.help.tree.randomize.generateRandom(graph, root, destinations));
    }
    return filtered;
  }

  function solveWithNsga(network, problem) {
    setPrmInstance(moea.problem.prm.instances['rede' + network], problem);

    return nsga({
      populationSize: 60,
      randomize: _.partial(moea.help.tree.randomize.generateRandom, graph, root, destinations),
      objectives: objectives,
      //filter: _.partial(filter),
      numberOfGenerations: 100,
      crossover: {rate: 1, method: _.partial(moea.help.tree.dijkstraGa.crossover, _, _, graph, costs, root, destinations)},
      mutation: {rate: 0.2, method: _.partial(moea.help.tree.dijkstraGa.mutate, _, graph, root, destinations, DISCONNECTION_RATE)}
    });
  }

  function solveWithSpea(network, problem) {
    setPrmInstance(moea.problem.prm.instances['rede' + network]);

    return spea({
      populationSize: 60,
      archiveSize: 60,
      randomize: _.partial(moea.help.tree.randomize.generateRandom, graph, root, destinations),
      objectives: objectives,
      numberOfGenerations: 100,
      crossover: {rate: 1, method: _.partial(moea.help.tree.dijkstraGa.crossover, _, _, graph, costs, root, destinations)},
      mutation: {rate: 0.2, method: _.partial(moea.help.tree.dijkstraGa.mutate, _, graph, root, destinations, DISCONNECTION_RATE)}
    });
  }

  function solveWithMoead(network, problem) {
    setPrmInstance(moea.problem.prm.instances['rede' + network], problem);

    return moead({
      populationSize: 60,
      neighborhoodSize: 8,
      randomize: _.partial(moea.help.tree.randomize.generateRandom, graph, root, destinations),
      objectives: objectives,
      numberOfGenerations: 100,
      crossover: {method: _.partial(moea.help.tree.dijkstraGa.crossover, _, _, graph, costs, root, destinations)},
      mutation: {rate: 0.2, method: _.partial(moea.help.tree.dijkstraGa.mutate, _, graph, root, destinations, DISCONNECTION_RATE)}
    });
  }

  function getParetoSet(network, problem) {
    return moea.problem.prm.paretos[network][problem];
  }

  function test(algorithm, network, problem, numberOfExecutions) {
    var executions = [];
    var pareto;

    network = network || 0;
    problem = problem || 1;
    numberOfExecutions = numberOfExecutions || 1;

    pareto = getParetoSet(network, problem - 1);

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('\nEXECUTION ' + (i + 1));
      console.log('---------------------');
      var solutions = algorithm(network, problem);
      var solutionsValues = getTreesInObjectiveSpace(solutions);
      var uniqS = _.uniqWith(solutionsValues, _.isEqual);
      console.log('Pareto:');
      console.log(JSON.stringify(pareto));
      console.log('Solutions:');
      console.log(JSON.stringify(uniqS));
      console.log('Worst:');
      console.log(worst);
      var metrics = moea.help.report.getMetrics(uniqS, pareto, worst);
      executions.push(metrics);
    }

    return moea.help.report.createReport(executions);
  }

  function isValidTree(tree) {
    var visited = _.fill(new Array(tree.length), false),
        explore = [root];

    while (explore.length) {
      let node = explore.shift();
      if (visited[node]) {
        invalid++;
        return false;
      }
      visited[node] = true;
      _.pushAll(explore, tree[node]);
    }

    total++;
    return true;
  }

  function getWeightSum(tree, property) {
    var explore = [root];
    var sum = 0;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    while (explore.length) {
      let node = explore.shift();
      _.forEach(tree[node], function (child) {
        explore.push(child);
        sum += weights[node][child][property];
      });
    }

    return sum;
  }

  function getEndToEndDelay(tree, source, target, delay) {
    var i = 0, result;

    if (source === target) {
      return delay;
    }

    while (!result && i < tree[source].length) {
      let child = tree[source][i];
      result = getEndToEndDelay(tree, child, target, delay + weights[source][child].delay);
      i++;
    }

    return result;
  }

  function updateWorst(objective, value) {
    var index = _.indexOf(objectives, objective);
    if (value !== Infinity && value > worst[index]) {
      worst[index] = value;
    }
  }

  function getTreeCost(tree) {
    var cost = getWeightSum(tree, 'cost');
    updateWorst(getTreeCost, cost);
    return cost;
  }

  function getTreeE2EDelay(tree) {
    var delay;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    delay = - _.reduce(destinations, function (sum, node) {
      var e2e = getEndToEndDelay(tree, root, node, 0);
      return sum + (e2e <= dmax ? 1 : 0);
    }, 0);

    updateWorst(getTreeE2EDelay, delay);
    return delay;
  }

  function getTotalDelay(tree) {
    var delay = getWeightSum(tree, 'delay');
    updateWorst(getTotalDelay, delay);
    return delay;
  }

  function getMedianDelay(tree) {
    var total, delay;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    total = _.sumBy(destinations, function (node) {
      return getEndToEndDelay(tree, root, node, 0);
    });

    delay = total / destinations.length;
    updateWorst(getMedianDelay, delay);
    return delay;
  }

  function getMaxDelay(tree) {
    var delay;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    delay = _.reduce(destinations, function (max, node) {
      var d = getEndToEndDelay(tree, root, node, 0);
      return d > max ? d : max;
    }, 0);

    updateWorst(getMaxDelay, delay);
    return delay;
  }

  function getHopsCount(tree) {
    var hops;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    hops = _.sumBy(tree, 'length');
    updateWorst(getHopsCount, hops);
    return hops;
  }

  function getLinkUsage(v1, v2) {
    var w;

    w = weights[v1][v2];
    return (w.traffic + DATA_FLOW) / w.capacity;
  }

  function getMaxLinkUsage(tree) {
    var max = 0;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        var usage = getLinkUsage(i, edge);
        if (usage > max) {
          max = usage;
        }
      });
    }

    updateWorst(getMaxLinkUsage, max);
    return max;
  }

  function getMedianLinkUsage(tree) {
    var sum = 0,
        numberOfEdges = 0,
        median;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        sum += getLinkUsage(i, edge);
        numberOfEdges++;
      });
    }

    median = sum / numberOfEdges;
    updateWorst(getMedianLinkUsage, median);
    return median;
  }

  problems = [
    [getTreeCost, getTreeE2EDelay],
    [getTreeCost, getTotalDelay],
    [getTreeCost, getMedianDelay],
    [getTreeCost, getMaxDelay],
    [getTreeCost, getHopsCount],
    [getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount],
    [getMedianLinkUsage, getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount],
    [getMedianLinkUsage, getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount, getMedianDelay]
  ];

  window.invalid = 0;
  window.total = 0;

  function testObjectives() {
    var t = [
      [1, 2],
      [3],
      [4],
      [5,6],
      [],
      [],
      [7],
      []
    ];

    var w = [
      [null, {cost: 2, delay: 1, capacity: 40, traffic: 10}, {cost: 3, delay: 2, capacity: 25, traffic: 15}, null, null, null, null, null],
      [null, null, null, {cost: 5, delay: 3, capacity: 23, traffic: 17}, null, null, null, null],
      [null, null, null, null, {cost: 2, delay: 2, capacity: 31, traffic: 13}, null, null, null],
      [null, null, null, null, null, {cost: 7, delay: 5, capacity: 71, traffic: 26}, {cost: 3, delay: 3, capacity: 49, traffic: 29}, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, {cost: 2, delay: 1, capacity: 50, traffic: 15}],
      [null, null, null, null, null, null, null, null]
    ];

    setPrmInstance({
      weights: w,
      root: 0,
      destinations: [4,5,7],
      dmax: 8
    });

    console.log('cost: ' + getTreeCost(t));
    console.log('delay faf atendido: ' + getTreeE2EDelay(t));
    console.log('delay total: ' + getTotalDelay(t));
    console.log('delay faf médio: ' + getMedianDelay(t));
    console.log('delay faf max: ' + getMaxDelay(t));
    console.log('hops count: ' + getHopsCount(t));
    console.log('max enlaces: ' + getMaxLinkUsage(t));
    console.log('média enlaces: ' + getMedianLinkUsage(t));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea,
    solveWithMoead:solveWithMoead,
    testWithNsga: _.partial(test, solveWithNsga),
    testWithSpea: _.partial(test, solveWithSpea),
    testWithMoead: _.partial(test, solveWithMoead),
    testObjectives: testObjectives,
    instances: []
  });
}());
