(function () {
  'use strict';

  const DATA_FLOW = 300;

  function isValidTree(tree, root) {
    var visited = _.fill(new Array(tree.length), false),
        explore = [root];

    while (explore.length) {
      let node = explore.shift();
      if (visited[node]) {
        return false;
      }
      visited[node] = true;
      _.pushAll(explore, tree[node]);
    }

    return true;
  }

  function getWeightSum(tree, property, instance) {
    var explore = [instance.network.root];
    var sum = 0;

    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

    while (explore.length) {
      let node = explore.shift();
      _.forEach(tree[node], function (child) {
        explore.push(child);
        sum += instance.network.weights[node][child][property];
      });
    }

    return sum;
  }

  function getEndToEndDelay(tree, source, target, delay, instance) {
    var i = 0, result;

    if (source === target) {
      return delay;
    }

    while (!result && i < tree[source].length) {
      let child = tree[source][i];
      result = getEndToEndDelay(tree, child, target, delay + instance.network.weights[source][child].delay, instance);
      i++;
    }

    return result;
  }

  function getTreeCost(tree, instance) {
    return getWeightSum(tree, 'cost', instance);
  }

  function getTreeE2EDelay(tree, instance) {
    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

    return -_.reduce(instance.network.destinations, function (sum, node) {
      var e2e = getEndToEndDelay(tree, instance.network.root, node, 0, instance);
      return sum + (e2e <= instance.network.dmax ? 1 : 0);
    }, 0);
  }

  function getTotalDelay(tree, instance) {
    return getWeightSum(tree, 'delay', instance);
  }

  function getMedianDelay(tree, instance) {
    var total;

    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

    total = _.sumBy(instance.network.destinations, function (node) {
      return getEndToEndDelay(tree, instance.network.root, node, 0, instance);
    });

    return total / instance.network.destinations.length;
  }

  function getMaxDelay(tree, instance) {
    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

   return _.reduce(instance.network.destinations, function (max, node) {
      var d = getEndToEndDelay(tree, instance.network.root, node, 0, instance);
      return d > max ? d : max;
    }, 0);
  }

  function getHopsCount(tree, instance) {
    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

    return _.sumBy(tree, 'length');
  }

  function getLinkUsage(v1, v2, instance) {
    var w = instance.network.weights[v1][v2];
    return (w.traffic + DATA_FLOW) / w.capacity;
  }

  function getMaxLinkUsage(tree, instance) {
    var max = 0;

    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        var usage = getLinkUsage(i, edge, instance);
        if (usage > max) {
          max = usage;
        }
      });
    }

    return max;
  }

  function getMedianLinkUsage(tree, instance) {
    var sum = 0,
        numberOfEdges = 0;

    if (!isValidTree(tree, instance.network.root)) {
      return Infinity;
    }

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        sum += getLinkUsage(i, edge, instance);
        numberOfEdges++;
      });
    }

    return sum / numberOfEdges;
  }

  function getObjectives(problem) {
    var problems = [
      [getTreeCost, getTreeE2EDelay],
      [getTreeCost, getTotalDelay],
      [getTreeCost, getMedianDelay],
      [getTreeCost, getMaxDelay],
      [getTreeCost, getHopsCount],
      [getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount],
      [getMedianLinkUsage, getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount],
      [getMedianLinkUsage, getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount, getMedianDelay]
    ];

    return problems[problem - 1];
  }

  function getInstance(network, problem) {
    var instance = {
      network: moea.problem.prm.instances['rede' + network],
      problem: problem,
      pareto: moea.problem.prm.paretos[network][problem]
    };
    instance.network.name = network;
    return instance;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.main', {
    getInstance: getInstance,
    getObjectives: getObjectives
  });
}());
