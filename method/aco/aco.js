(function () {
  'use strict';

  function buildSolution(pheromones, settings) {
    var solution = [],
        candidates = settings.graph.getVertices();

    while (candidates.length) {
      let probabilities = _.orderBy(calculateProbabilities(currentNode, candidates, pheromones, settings), 'probability');
      let rand = Math.random();
      let chosen = _.find(probabilities, function (p) {return p.probability >= rand});
      solution.push(chosen);
    }

    return solution;
  }

  function aco(settings, createColonies, createPheromoneTables) {
    var colonies = createColonies(settings),
        pheromones = createPheromoneTables(settings);

    _.forEach(colonies, function (colony) {
      for (let i = 0; i < colony.size; i++) {
        buildSolution(pheromones, settings);
      }
    });

    _.forEach(pheromones, updatePheromoneTable);
  }
}());
