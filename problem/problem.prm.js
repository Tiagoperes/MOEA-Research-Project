(function () {
  'use strict';

  const DISCONNECTION_RATE = 0.1,
        DATA_FLOW = 1;

  var nsga = moea.nsga.main.execute,
      spea = moea.spea.main.execute;

  var graph, weights, costs, root, destinations, dmax, problems;

  function setPrmInstance(instance) {
    graph = instance.graph;
    weights = instance.weights;
    root = instance.root;
    destinations = instance.destinations;
    dmax = instance.dmax;

    costs = _.map(weights, function (weightList) {
      return _.map(weightList, 'cost');
    });
  }

  function solveWithNsga(problem) {
    if (!graph) {
      setPrmInstance(moea.problem.prm.instances.mista);
    }

    problem = problem || 1;

    var solutions = nsga({
      populationSize: 60,
      randomize: _.partial(moea.help.tree.randomize.generateRandom, graph, root, destinations),
      objectives: problems[problem - 1],
      numberOfGenerations: 100,
      crossover: {rate: 1, method: _.partial(moea.help.tree.dijkstraGa.crossover, _, _, graph, costs, root, destinations)},
      mutation: {rate: 0.2, method: _.partial(moea.help.tree.dijkstraGa.mutate, _, graph, root, destinations, DISCONNECTION_RATE)}
    });

    var ans = _.uniqWith(solutions, isGraphEqual);
    _.forEach(ans, function(a) {
      console.log(_.reduce(problems[problem - 1], function (fres, p) {
        fres.push(p(a));
        return fres;
      }, []));
    });
    return ans;
  }

  function solveWithSpea(problem) {
    if (!graph) {
      setPrmInstance(moea.problem.prm.instances.mista);
    }

    problem = problem || 1;

    var solutions = spea({
      populationSize: 60,
      archiveSize: 60,
      randomize: _.partial(moea.help.tree.randomize.generateRandom, graph, root, destinations),
      objectives: problems[problem - 1],
      numberOfGenerations: 100,
      crossover: {rate: 1, method: _.partial(moea.help.tree.dijkstraGa.crossover, _, _, graph, costs, root, destinations)},
      mutation: {rate: 0.2, method: _.partial(moea.help.tree.dijkstraGa.mutate, _, graph, root, destinations, DISCONNECTION_RATE)}
    });

    var ans = _.uniqWith(solutions, isGraphEqual);
    _.forEach(ans, function(a) {
      console.log(_.reduce(problems[problem - 1], function (fres, p) {
        fres.push(p(a));
        return fres;
      }, []));
    });
    return ans;
  }

  function isGraphEqual(a, b) {
    var i = 0, different = false;
    while (i < a.length && !different) {
      different = a[i].length !== b[i].length || _.difference(a[i], b[i]).length > 0;
      i++;
    }
    return !different;
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

  function getTreeE2EDelay(tree) {
    if (!isValidTree(tree)) {
      return Infinity;
    }

    return - _.reduce(destinations, function (sum, node) {
      var e2e = getEndToEndDelay(tree, root, node, 0);
      return sum + (e2e <= dmax ? 1 : 0);
    }, 0);
  }

  function getTreeCost(tree) {
    return getWeightSum(tree, 'cost');
  }

  function getTotalDelay(tree) {
    return getWeightSum(tree, 'delay');
  }

  function getMedianDelay(tree) {
    var total;

    if (!isValidTree(tree)) {
      return Infinity;
    }

    total = _.sumBy(destinations, function (node) {
      return getEndToEndDelay(tree, root, node, 0);
    });

    return total / destinations.length;
  }

  function getMaxDelay(tree) {
    if (!isValidTree(tree)) {
      return Infinity;
    }

    return _.reduce(destinations, function (max, node) {
      var d = getEndToEndDelay(tree, root, node, 0);
      return d > max ? d : max;
    }, 0);
  }

  function getHopsCount(tree) {
    return _.sumBy(tree, 'length');
  }

  function getLinkUsage(v1, v2) {
    var w = weights[v1][v2];
    return (w.traffic + DATA_FLOW) / w.capacity;
  }

  function getMaxLinkUsage(tree) {
    var max = 0;

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        var usage = getLinkUsage(i, edge);
        if (usage > max) {
          max = usage;
        }
      });
    }

    return max;
  }

  function getMedianLinkUsage(tree) {
    var sum = 0,
        numberOfEdges = 0;

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        sum += getLinkUsage(i, edge);
        numberOfEdges++;
      });
    }

    return sum / numberOfEdges;
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
    setPrmInstance: setPrmInstance,
    instances: []
  });
}());
