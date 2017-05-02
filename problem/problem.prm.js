(function () {
  'use strict';

  const DISCONNECTION_RATE = 0.1,
        DATA_FLOW = 1,
        NUMBER_OF_OBJECTIVES = 8;

  var nsga = moea.nsga.main.execute,
      spea = moea.spea.main.execute;

  var graph, weights, costs, root, destinations, dmax, problems, worst;

  function setPrmInstance(instance) {
    graph = instance.graph;
    weights = instance.weights;
    root = instance.root;
    destinations = instance.destinations;
    dmax = instance.dmax;
    worst = _.fill(new Array(NUMBER_OF_OBJECTIVES), -Infinity);

    costs = _.map(weights, function (weightList) {
      return _.map(weightList, 'cost');
    });
  }


  function getTreesInObjectiveSpace(trees, objectives) {
    return _.map(trees, function (tree) {
      return _.map(objectives, function(objective) {
        return objective(tree);
      });
    })
  }

  function filter(population, objectives) {
    var size = population.length;
    var filtered = _.uniqWith(population, function (a, b) {
      var values = getTreesInObjectiveSpace([a, b], objectives);
      return _.isEqual(values[0], values[1]);
    });
    while (filtered.length < size) {
      filtered.push(moea.help.tree.randomize.generateRandom(graph, root, destinations));
    }
    return filtered;
  }

  function solveWithNsga(network, problem) {
    var objectives = problems[problem - 1];
    setPrmInstance(moea.problem.prm.instances['rede' + network]);

    return nsga({
      populationSize: 60,
      randomize: _.partial(moea.help.tree.randomize.generateRandom, graph, root, destinations),
      objectives: objectives,
      //filter: _.partial(filter, _, objectives),
      numberOfGenerations: 10,
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
      objectives: problems[problem - 1],
      numberOfGenerations: 100,
      crossover: {rate: 1, method: _.partial(moea.help.tree.dijkstraGa.crossover, _, _, graph, costs, root, destinations)},
      mutation: {rate: 0.2, method: _.partial(moea.help.tree.dijkstraGa.mutate, _, graph, root, destinations, DISCONNECTION_RATE)}
    });
  }

  function test(algorithm, network, problem, numberOfExecutions) {
    var executions = [];

    network = network || 0;
    problem = problem || 1;
    numberOfExecutions = numberOfExecutions || 1;

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('\nEXECUTION ' + (i + 1));
      console.log('---------------------');
      var solutions = algorithm(network, problem);
      var solutionsValues = getTreesInObjectiveSpace(solutions, problems[problem - 1]);
      var uniqS = _.uniqWith(solutionsValues, _.isEqual);
      var worstOnObjectives = _.filter(worst, _.partial(_.gt, _, -Infinity));
      var metrics = moea.problem.prm.report.getMetrics(network, problem - 1, uniqS, worstOnObjectives);
      executions.push(metrics);
    }

    return moea.problem.prm.report.createReport(executions);
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

  function getTreeCost(tree) {
    var cost = getWeightSum(tree, 'cost');
    if (cost !== Infinity && cost > worst[0]) worst[0] = cost;
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

    if (delay > worst[1]) worst[1] = delay;
    return delay;
  }

  function getTotalDelay(tree) {
    var delay = getWeightSum(tree, 'delay');
    if (delay > worst[2]) worst[2] = delay;
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
    if (delay > worst[3]) worst[3] = delay;
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

    if (delay > worst[4]) worst[4] = delay;
    return delay;
  }

  function getHopsCount(tree) {
    var hops;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    hops = _.sumBy(tree, 'length');
    if (hops > worst[5]) worst[5] = hops;
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

    if (max > worst[6]) worst[6] = max;
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
    if (median > worst[7]) worst[7] = median;
    return median;
  }

  problems = [
    [getTreeCost, getTreeE2EDelay],
    [getTreeCost, getTotalDelay],
    [getTreeCost, getMedianDelay],
    [getTreeCost, getMaxDelay],
    [getTreeCost, getHopsCount],
    [getTreeCost, getMaxDelay, getHopsCount, getMaxLinkUsage],
    [getTreeCost, getMaxDelay, getHopsCount, getMaxLinkUsage, getMedianLinkUsage],
    [getTreeCost, getMedianDelay, getMaxDelay, getHopsCount, getMaxLinkUsage, getMedianLinkUsage]
  ];

  window.invalid = 0;
  window.total = 0;

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm', {
    solveWithNsga: solveWithNsga,
    solveWithSpea: solveWithSpea,
    testWithNsga: _.partial(test, solveWithNsga),
    testWithSpea: _.partial(test, solveWithSpea),
    instances: []
  });
}());
