(function () {
  'use strict';

  function crossover(a, b, root, destinations) {
    var branchesA = a.getBranches(root, destinations),
        branchesB = b.getBranches(root, destinations),
        graph = new moea.help.Graph(a.length);

    _.forEach(destinations, function (dest) {
      var possibilities = [];
      possibilities.push(branchesA[dest]);
      possibilities.push(branchesB[dest]);
      graph.createPath(_.sample(possibilities));
    });


    graph.removeCycles(root);
    graph.prune(root, destinations);
    return [graph];
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.pathCrossover', {
    crossover: crossover
  });
}());
