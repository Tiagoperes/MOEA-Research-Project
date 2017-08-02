(function () {
  'use strict';

  function createEmptyGraph(numberOfVertices) {
    var g = [];
    for (let i = 0; i < numberOfVertices; i++) {
      g[i] = [];
    }
    return g;
  }

  function removeCycles(graph, root) {
    var isVisible = _.fill(new Array(graph.length), false),
        explore = [root];

    isVisible[root] = true;

    while (explore.length) {
      let node = explore.pop();
      let edges = [];
      _.forEach(graph[node], function (child) {
        if (!isVisible[child]) {
          explore.push(child);
          edges.push(child);
          isVisible[child] = true;
        }
      });
      graph[node] = edges;
    }
  }

  function isLeaf(tree, node) {
    return tree[node].length === 0;
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
        if (isLeaf(tree, parent) && !_.includes(destinations, parent)) nonDestinationLeafs.push(parent);
      }
    }
    return tree;
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.graph', {
    createEmptyGraph: createEmptyGraph,
    removeCycles: removeCycles,
    pruneTree: pruneTree
  });
}());
