(function () {
  'use strict';

  const DATA_FLOW = 300;

  function getWeightSum(tree, property, instance) {
    var explore = [instance.network.root];
    var sum = 0;

    while (explore.length) {
      let node = explore.shift();
      _.forEach(tree[node], function (child) {
        explore.push(child);
        sum += instance.network.weights[node][child][property];
      });
    }

    return sum;
  }

  function getEndToEndDelay(tree, source, target, delay, weights) {
    var i = 0, result;

    if (source === target) {
      return delay;
    }

    while (!result && tree[source] && i < tree[source].length) {
      let child = tree[source][i];
      result = getEndToEndDelay(tree, child, target, delay + weights[source][child].delay, weights);
      i++;
    }

    return result;
  }

  function getTreeCost(tree, instance) {
    return getWeightSum(tree, 'cost', instance);
  }

  function getTreeE2EDelay(tree, instance) {
    return _.reduce(instance.network.destinations, function (sum, node) {
      var e2e = getEndToEndDelay(tree, instance.network.root, node, 0, instance.network.weights);
      return sum + (e2e <= instance.network.dmax ? 0 : 1);
    }, 0);
  }

  function getTotalDelay(tree, instance) {
    return getWeightSum(tree, 'delay', instance);
  }

  function getMedianDelay(tree, instance) {
    var total;

    total = _.sumBy(instance.network.destinations, function (node) {
      return getEndToEndDelay(tree, instance.network.root, node, 0, instance.network.weights);
    });

    return total / instance.network.destinations.length;
  }

  function getMaxDelay(tree, instance) {
   return _.reduce(instance.network.destinations, function (max, node) {
      var d = getEndToEndDelay(tree, instance.network.root, node, 0, instance.network.weights);
      return d > max ? d : max;
    }, 0);
  }

  function getHopsCount(tree) {
    return _.sumBy(tree, 'length');
  }

  function getLinkUsage(v1, v2, instance) {
    var w = instance.network.weights[v1][v2];
    return (w.traffic + DATA_FLOW) / w.capacity;
  }

  function getMaxLinkUsage(tree, instance) {
    var max = 0;

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

    for (let i = 0; i < tree.length; i++) {
      _.forEach(tree[i], function (edge) {
        sum += getLinkUsage(i, edge, instance);
        numberOfEdges++;
      });
    }

    return sum / numberOfEdges;
  }

  function getObjectives(instance) {
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

    return _.map(problems[instance.problem - 1], function (objective) {
      return _.partial(objective, _, instance);
    });
  }

  function getInstance(problem, network) {
    var instance = {
      network: moea.problem.prm.instances['rede' + network],
      problem: problem,
      pareto: moea.problem.prm.paretos[network][problem - 1]
    };
    if (!instance.pareto) {
      throw new Error('No Pareto found for problem ' + problem + ' and network ' + network);
    }
    instance.network.name = network;
    return instance;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.main', {
    getInstance: getInstance,
    getObjectives: getObjectives
  });
}());
