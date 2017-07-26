(function () {
  'use strict';

  function isLeaf(tree, node) {
    return tree[node].length === 0;
  }

  function breakTreeInBranches(tree, root, parents, branches) {
    var explore = tree[root];
    parents = parents ? _.concat(parents, [root]) : [root];
    branches = branches || {};

    _.forEach(explore, function (node) {
      if (isLeaf(tree, node)) branches[node] = _.concat(parents, [node]);
      breakTreeInBranches(tree, node, parents, branches)
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
      }
    }
  }

  function removeCycles(graph, root) {
    var isVisited = _.fill(new Array(graph.length), false),
        explore = [root];

    while (explore.length) {
      let node = explore.pop();
      isVisited[node] = true;
      _.forEach(graph[node], function (child) {
        if (isVisited[child]) _.remove(graph[node], _.partial(_.isEqual, child));
        else explore.push(child);
      });
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

  function pruneTree(tree, destinations) {
    var nonDestinationLeafs = getNonDestinationLeafs(tree, destinations);
    while (nonDestinationLeafs.length) {
      let leaf = nonDestinationLeafs.pop();
      let parent = findParent(tree, leaf);
      if (parent !== -1) {
        _.remove(tree[parent], _.partial(_.isEqual, leaf));
        if (isLeaf(tree, parent)) nonDestinationLeafs.push(parent);
      }
    }
  }

  function crossover(a, b, root, destinations) {
    var branchesA = breakTreeInBranches(a, root),
        branchesB = breakTreeInBranches(b, root),
        graph = createEmptyGraph(a.length);

    _.forEach(destinations, function (dest) {
      var possibilities = [];
      if (branchesA[dest]) possibilities.push(branchesA[dest]);
      if (branchesB[dest]) possibilities.push(branchesB[dest]);
      if (possibilities.length) addBranchToGraph(_.sample(possibilities), graph);
    });

    removeCycles(graph, root);
    pruneTree(graph, destinations);
    return [graph];
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.crossover.path', {
    crossover: crossover
  });
}());
