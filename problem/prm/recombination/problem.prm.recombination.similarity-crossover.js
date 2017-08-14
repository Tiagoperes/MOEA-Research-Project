(function () {
  'use strict';

  window.count = 0;

  function reconnectGraphInTree(graph, baseGraph, root, destinations, connectionHeuristic) {
    var g = graph.clone(),
        connectedGraph = g.removeComponentWithVertex(root),
        dests = _.shuffle(destinations),
        debug = window.debugRandomGeneration || (graph.size().vertices > 0 && window.debugCross);

    if (debug) moea.help.graphDesigner.draw(connectedGraph, root, destinations, window.debugWeightMatrix, window.debugWeights, null, 'Connection: component ' + root);
    while (dests.length) {
      let vertex = dests.pop();
      let comp = g.removeComponentWithVertex(vertex);
      if (connectedGraph.hasVertex(vertex)) connectedGraph.merge(comp);
      else {
        let path = connectionHeuristic(connectedGraph, comp, baseGraph);
        if (debug) {
          moea.help.graphDesigner.draw(connectedGraph, root, destinations, window.debugWeightMatrix, window.debugWeights, null, 'Connection: component ' + vertex);
          _.last(document.getElementsByTagName('h4')).innerHTML += '<span style="font-family: arial;font-size: 9px;background-color: #ccc;padding: 3px 5px;margin-left: 10px;border-radius: 3px;display: inline-block;cursor: help;vertical-align: middle;" title="' + path.join(', ') + '">PATH</span>';
        }
      }
    }

    connectedGraph.removeCycles(root);
    if (debug) moea.help.graphDesigner.draw(connectedGraph, root, destinations, window.debugWeightMatrix, window.debugWeights, null, 'Cycleless');
    connectedGraph.prune(root, destinations);
    if (debug) moea.help.graphDesigner.draw(connectedGraph, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'Pruned');
    return connectedGraph;
  }

  function crossover(p1, p2, baseGraph, root, destinations, connectionHeuristic) {
    if (window.debugCross) {
      moea.help.graphDesigner.draw(p1, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'P1');
      moea.help.graphDesigner.draw(p2, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'P2');
    }
    p1 = p1.clone().makeDirectionless();
    p2 = p2.clone().makeDirectionless();
    var inter = p1.intersection(p2);
    if (window.debugCross) moea.help.graphDesigner.draw(inter, root, destinations, window.debugWeightMatrix, window.debugWeights, null, 'Intersection');
    var res = [reconnectGraphInTree(inter, baseGraph, root, destinations, connectionHeuristic)];
    if (window.debugCross) document.body.innerHTML += '<hr>';
    var achievable = res[0].getAchievableVertices(root);
    var missing = _.filter(destinations, _.negate(_.partial(_.includes, achievable)));
    if (missing.length) {
      throw new Error('Invalid tree! Count: ' + count + ' Missing destinations: ' + missing.join(', '));
    }
    return res;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.similarityCrossover', {
    crossover: crossover,
    reconnectGraphInTree: reconnectGraphInTree,
  });
}());
