(function () {
  'use strict';

  function disconnect(tree, disconnectionRate) {
    var nonLeafVertices = tree.getVerticesWithChildren(),
        numberOfEdges = tree.size().edges,
        numberOfEdgesToRemove = Math.ceil(numberOfEdges * disconnectionRate);

    while (numberOfEdgesToRemove) {
      let vertex = _.sample(nonLeafVertices);
      let edges = tree.getEdges(vertex);
      _.removeRandom(edges);
      if (edges.length === 0) _.pull(nonLeafVertices, vertex);
      numberOfEdgesToRemove--;
    }
  }

  function mutate(tree, baseGraph, root, destinations, disconnectionRate) {
    var crossover =  moea.problem.prm.recombination.similarityCrossover,
        connectionHeuristic = moea.problem.prm.recombination.heuristic.random;

    if (window.debugMutation) moea.help.graphDesigner.draw(tree, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'Mutation: original');
    disconnect(tree, disconnectionRate);
    if (window.debugMutation) {
      moea.help.graphDesigner.draw(tree, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'Mutation: disconnected');
      var prevDebug = window.debugCross;
      window.debugCross = true;
    }
    tree.makeDirectionless();
    var res = crossover.reconnectGraphInTree(tree, baseGraph, root, destinations, connectionHeuristic);
    if (window.debugMutation) {
      document.body.innerHTML += '<hr>';
      window.debugCross = prevDebug;
    }
    return res;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.mutation.mutate', mutate);

}());
