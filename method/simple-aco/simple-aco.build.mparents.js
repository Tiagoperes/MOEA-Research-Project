(function () {
  'use strict';

  function randomizeAccordingToProbabilities(set) {
    var ordered = _.orderBy(set, 'probability'),
      rand = Math.random(),
      sum = 0,
      i = -1;

    do {
      i++;
      sum += ordered[i].probability;
    } while (rand > sum);

    return ordered[i];
  }

  function getHeuristic(sourceVertex, targetVertex, heuristics) {
    return _.sumBy(heuristics, function (heuristic) {
      return heuristic(sourceVertex, targetVertex);
    }) / heuristics.length;
  }

  function calculateProbabilities(edges, pheromones, heuristics, alpha, beta) {
    var probabilitySum = 0;

    _.forEach(edges, function (edge) {
      if (!edge.probabilityTerm) {
        let pheromone = Math.pow(pheromones[edge.parent][edge.child], alpha);
        let heuristic = Math.pow(getHeuristic(edge.parent, edge.child, heuristics), beta);
        edge.probabilityTerm = pheromone * heuristic;
      }
      probabilitySum += edge.probabilityTerm;
    });
    _.forEach(edges, function (possibility) {
      possibility.probability = possibility.probabilityTerm / probabilitySum;
    });
  }

  function initializeExploration(graph, root, isVisited) {
    var explore = [];

    _.forEach(graph.getEdges(root), function (v) {
      explore.push({parent: root, child: v});
    });

    isVisited[root] = true;
    return explore;
  }

  function chooseVertexToExplore(explore, pheromoneTable, heuristics, sampleSize, alpha, beta) {
    let sample = _.sampleSize(explore, sampleSize);
    calculateProbabilities(sample, pheromoneTable, heuristics, alpha, beta);
    let chosen = randomizeAccordingToProbabilities(sample);
    _.pull(explore, chosen);
    return chosen;
  }

  function viewChildren(graph, vertex, explore, isVisited) {
    _.forEach(graph.getEdges(vertex), function (child) {
      if (!isVisited[child]) explore.push({parent: vertex, child: child});
    });
  }

  function visitVertex(graph, tree, edge, explore, isVisited, unreached) {
    isVisited[edge.child] = true;
    _.pull(unreached, edge.child);
    tree.createEdge(edge.parent, edge.child);
    viewChildren(graph, edge.child, explore, isVisited);
  }

  function buildSolution(pheromoneTable, heuristics, graph, root, destinations, sampleSize, alpha, beta) {
    var unreached = _.clone(destinations),
        tree = new moea.help.Graph(),
        isVisited = [],
        explore = initializeExploration(graph, root, isVisited);

    while (unreached.length && explore.length) {
      let chosen = chooseVertexToExplore(explore, pheromoneTable, heuristics, sampleSize, alpha, beta);
      if (!isVisited[chosen.child]) {
        visitVertex(graph, tree, chosen, explore, isVisited, unreached);
      }
    }

    tree.prune(root, destinations);
    return tree;
  }

  function buildSolutions(populationSize, pheromoneTable, heuristics, graph, root, destinations, sampleSize, alpha, beta, objective) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      let solution = buildSolution(pheromoneTable, heuristics, graph, root, destinations, sampleSize, alpha, beta);
      population.push({
        solution: solution,
        fitness: objective(solution)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.build.mparents.buildSolutions', buildSolutions);

}());
