(function () {
  'use strict';

  const DATA_FLOW = 300;

  function getWeightSum(tree, property, instance) {
    var tArray = tree.asArray(),
        explore = [instance.network.root],
        sum = 0;

    while (explore.length) {
      let node = explore.shift();
      _.forEach(tArray[node], function (child) {
        explore.push(child);
        sum += instance.network.weights[node][child][property];
      });
    }

    return sum;
  }

  function getEndToEndDelay(tree, source, target, delay, weights) {
    var tArray = tree.asArray(),
        i = 0,
        result;

    if (source === target) {
      return delay;
    }

    while (!result && tArray[source] && i < tArray[source].length) {
      let child = tArray[source][i];
      result = getEndToEndDelay(tree, child, target, delay + weights[source][child].delay, weights);
      i++;
    }

    return result;
  }

  function getTreeCost(tree, instance) {
    return getWeightSum(tree, 'cost', instance);
  }

  function getTreeE2EDelay(tree, instance) {
    return -_.reduce(instance.network.destinations, function (sum, node) {
      var e2e = getEndToEndDelay(tree, instance.network.root, node, 0, instance.network.weights);
      return sum + (e2e <= instance.network.dmax ? 1 : 0);
    }, 0);
  }

  function getTotalDelay(tree, instance) {
    return getWeightSum(tree, 'delay', instance);
  }

  function getMedianDelay(tree, instance, isFinal) {
    var total, result;

    total = _.sumBy(instance.network.destinations, function (node) {
      return getEndToEndDelay(tree, instance.network.root, node, 0, instance.network.weights);
    });

    result = total / instance.network.destinations.length;
    return isFinal ? parseFloat(result.toFixed(3)) : result;
  }

  function getMaxDelay(tree, instance) {
   return _.reduce(instance.network.destinations, function (max, node) {
      var d = getEndToEndDelay(tree, instance.network.root, node, 0, instance.network.weights);
      return d > max ? d : max;
    }, 0);
  }

  function getHopsCount(tree) {
    return tree.size().edges;
  }

  function getLinkUsage(v1, v2, instance) {
    var w = instance.network.weights[v1][v2];
    return (w.traffic + DATA_FLOW) / w.capacity;
  }

  function getMaxLinkUsage(tree, instance, isFinal) {
    var tArray = tree.asArray(),
        max = 0;

    for (let i = 0; i < tArray.length; i++) {
      _.forEach(tArray[i], function (edge) {
        var usage = getLinkUsage(i, edge, instance);
        if (usage > max) {
          max = usage;
        }
      });
    }

    return isFinal ? parseFloat(max.toFixed(9)) : max;
  }

  function getMedianLinkUsage(tree, instance, isFinal) {
    var tArray = tree.asArray(),
        sum = 0,
        numberOfEdges = 0,
        result;

    for (let i = 0; i < tArray.length; i++) {
      _.forEach(tArray[i], function (edge) {
        sum += getLinkUsage(i, edge, instance);
        numberOfEdges++;
      });
    }

    result = sum / numberOfEdges;
    return isFinal ? parseFloat(result.toFixed(9)) : result;
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
      [getMedianLinkUsage, getMaxLinkUsage, getTreeCost, getMaxDelay, getHopsCount, getMedianDelay],
      [getTreeCost, getMaxDelay, getHopsCount],
    ];

    return _.map(problems[instance.problem - 1], function (objective) {
      return _.partial(objective, _, instance);
    });
  }

  function getProblemWeights(problem) {
    var problemWeights = [
      ['cost', 'delay'],
      ['cost', 'delay'],
      ['cost', 'delay'],
      ['cost', 'delay'],
      ['cost'],
      ['cost', 'delay', 'capacity', 'traffic'],
      ['cost', 'delay', 'capacity', 'traffic'],
      ['cost', 'delay', 'capacity', 'traffic'],
      ['cost', 'delay'],
    ];

    return problemWeights[problem - 1];
  }

  function getAllEvaluationFunctions() {
    return {
      'custo total': getTreeCost,
      'delay faf atendido': getTreeE2EDelay,
      'delay total': getTotalDelay,
      'delay faf medio': getMedianDelay,
      'delay faf max': getMaxDelay,
      'hops count': getHopsCount,
      'utl. max enlaces': getMaxLinkUsage,
      'utl. med enlaces': getMedianLinkUsage
    };
  }

  function getDataFlow() {
    return DATA_FLOW;
  }

  function getInstance(problem, network) {
    var instance = {
      network: _.cloneDeep(moea.problem.prm.instances['rede' + network]),
      problem: problem,
      pareto: moea.problem.prm.paretos[network][problem - 1],
      toString: function () {
        return 'net' + network + 'p' + problem;
      }
    };
    if (!(instance.network.graph instanceof moea.help.Graph)) {
      instance.network.graph = new moea.help.Graph(instance.network.graph);
      if (network === 8) instance.network.graph.removeDoubleEdges();
    }
    if (!instance.pareto) {
      throw new Error('No Pareto found for problem ' + problem + ' and network ' + network);
    }
    instance.network.name = network;
    return instance;
  }

  function containsAll(a, b) {
    for (let i = 0; i < b.length; i++) {
      if (!_.includes(a, b[i])) return false;
    }
    return true;
  }

  function checkEdges(tree, graph) {
    var treeData = tree.asArray(),
        graphData = graph.asArray();

    for (let i = 0; i < treeData.length; i++) {
      for (let j = 0; j < (treeData[i] ? treeData[i].length : 0); j++) {
        if (!_.includes(graphData[i], treeData[i][j])) return false;
      }
    }

    return true;
  }

  function countInvalidSolutions(solutions, instance) {
    var invalid = 0;
    _.forEach(solutions, function (tree) {
      if (tree.hasCycle(instance.network.root)) {
        invalid++;
        console.log('cycle :(');
      }
      else {
        let vertices = tree.getAchievableVertices(instance.network.root);
        if (!containsAll(vertices, instance.network.destinations)) invalid++;
        else if (!checkEdges(tree, instance.network.graph)) invalid++;
      }
    });
    return invalid;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.main', {
    getInstance: getInstance,
    getObjectives: getObjectives,
    getProblemWeights: getProblemWeights,
    getAllEvaluationFunctions: getAllEvaluationFunctions,
    getDataFlow: getDataFlow,
    countInvalidSolutions: countInvalidSolutions
  });
}());
