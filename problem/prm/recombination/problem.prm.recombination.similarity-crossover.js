(function () {
  'use strict';

  function reconnectGraphInTree(graph, baseGraph, root, destinations, connectionHeuristic) {
    var g = graph.clone(),
        connectedGraph = g.removeComponentWithVertex(root),
        dests = _.shuffle(destinations);

    while (dests.length) {
      let vertex = dests.pop();
      if (!connectedGraph.hasVertex(vertex)) {
        let comp = g.removeComponentWithVertex(vertex);
        connectionHeuristic(connectedGraph, comp, baseGraph);
      }
    }

    connectedGraph.removeCycles(root);
    connectedGraph.prune(root, destinations);
    return connectedGraph;
  }

  function crossover(p1, p2, baseGraph, root, destinations, connectionHeuristic) {
    p1 = p1.clone().makeDirectionless();
    p2 = p2.clone().makeDirectionless();
    return [reconnectGraphInTree(p1.intersection(p2), baseGraph, root, destinations, connectionHeuristic)];
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.similarityCrossover', {
    crossover: crossover,
    reconnectGraphInTree: reconnectGraphInTree,
  });
}());
