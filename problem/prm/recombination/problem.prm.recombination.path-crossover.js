(function () {
  'use strict';

  function isLeaf(tree, node) {
    return tree[node].length === 0;
  }

  function breakTreeInBranches(tree, root, destinations, parents, branches) {
    var explore = tree[root];
    parents = parents ? _.concat(parents, [root]) : [root];
    branches = branches || {};

    _.forEach(explore, function (node) {
      if (_.includes(destinations, node)) branches[node] = _.concat(parents, [node]);
      breakTreeInBranches(tree, node, destinations, parents, branches)
    });

    return branches;
  }

  function createEmptyGraph(size) {
    var g = [];
    for (let i = 0; i < size; i++) {
      g[i] = [];
    }
    return g;
  }

  function addBranchToGraph(branch, graph) {
    for (let i = 1; i < branch.length; i++) {
      if (!_.includes(graph[branch[i - 1]], branch[i])) {
        graph[branch[i - 1]].push(branch[i]);
        graph[branch[i]] = graph[branch[i]] || [];
      }
    }
  }

  function getNonDestinationLeafs(tree, destinations) {
    return _.reduce(tree, function (result, edges, node) {
      if (isLeaf(tree, node) && !_.includes(destinations, node)) result.push(node);
      return result;
    }, []);
  }

  function findParent(tree, node) {
    return _.findIndex(tree, function (edges) {
      return _.includes(edges, node);
    });
  }

  function crossover(a, b, root, destinations) {
    var branchesA = breakTreeInBranches(a, root, destinations),
        branchesB = breakTreeInBranches(b, root, destinations),
        graph = createEmptyGraph(a.length);

    _.forEach(destinations, function (dest) {
      var possibilities = [];
      possibilities.push(branchesA[dest]);
      possibilities.push(branchesB[dest]);
      addBranchToGraph(_.sample(possibilities), graph);
    });


    moea.help.graph.removeCycles(graph, root);
    return [moea.help.graph.pruneTree(graph, destinations)];
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.pathCrossover', {
    crossover: crossover
  });
}());
