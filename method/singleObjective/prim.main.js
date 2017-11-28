(function () {
  'use strict';

  function prim(graph, root, destinations, weights) {
    var isVisited = [],
        explore = [],
        tree = new moea.help.Graph(),
        unreached = _.clone(destinations);

    isVisited[root] = true;
    _.pull(unreached, root);

    _.forEach(graph.getEdges(root), function (v) {
      explore.push({child: v, parent: root});
    });

    while (unreached.length && explore.length) {
      let minCost = _.minBy(explore, function (edge) {
        return weights[edge.parent][edge.child];
      });
      _.pull(explore, minCost);
      if (!isVisited[minCost.child]) {
        isVisited[minCost.child] = true;
        _.pull(unreached, minCost.child);
        tree.createEdge(minCost.parent, minCost.child);
        _.forEach(graph.getEdges(minCost.child), function (vertex) {
          if (!isVisited[vertex]) explore.push({parent: minCost.child, child: vertex});
        });
      }
    }

    tree.prune(root, destinations);
    return tree;
  }

  function run(settings) {
    var solution = prim(settings.network.graph, settings.network.root, settings.network.destinations, settings.weights);

    return {
      solution: solution,
      fitness: settings.objective(solution)
    }
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.prim.main.execute', run);
}());
