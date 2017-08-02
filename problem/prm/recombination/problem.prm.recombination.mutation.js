(function () {
  'use strict';

  function getNonLeafVertices(tree) {
    return _.reduce(tree, function (result, edges, vertex) {
      if (edges && edges.length) result.push(vertex);
      return result;
    }, []);
  }

  function disconnect(tree, disconnectionRate) {
    var nonLeafVertices = getNonLeafVertices(tree),
        numberOfEdges = _.sumBy(tree, 'length'),
        numberOfEdgesToRemove = Math.ceil(numberOfEdges * disconnectionRate);

    while (numberOfEdgesToRemove) {
      let vertex = _.sample(nonLeafVertices);
      _.removeRandom(tree[vertex]);
      if (tree[vertex].length === 0) _.pull(nonLeafVertices, vertex);
      numberOfEdgesToRemove--;
    }
  }

  function mutate(tree, baseGraph, root, destinations, disconnectionRate) {
    var crossover =  moea.problem.prm.recombination.similarityCrossover,
        connectionHeuristic = moea.problem.prm.recombination.heuristic.random.connect,
        graph;

    disconnect(tree, disconnectionRate);
    graph = crossover.getDirectionLessGraph(tree);
    return crossover.reconnectGraphInTree(graph, baseGraph, root, destinations, connectionHeuristic);
  }

  window.test = function () {
    var t = [
      [1, 12],
      [],
      [],
      [],
      [],
      [13],
      [],
      [],
      [],
      [11],
      [9, 5],
      [],
      [10],
      [8]
    ];
    var g = [
      [1, 3, 6, 12],
      [0],
      [4, 11],
      [0, 7],
      [2, 8],
      [7, 10, 13],
      [0, 9],
      [3, 5],
      [4, 9, 13],
      [6, 8, 10, 11],
      [9, 5, 12],
      [2, 9],
      [0, 10],
      [5, 8]
    ];
    console.log(mutate(t, g, 0, [1, 8, 11], 0.1));
  };

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.mutation.mutate', mutate);

}());
