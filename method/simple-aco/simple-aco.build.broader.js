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

  function getProbabilities(parent, children, probabilityMatrix, pheromones, heuristics, alpha, beta) {
    var probabilitySum = 0;

    _.forEach(children, function (child) {
      if (!probabilityMatrix[parent][child]) {
        let pheromone = Math.pow(pheromones[parent][child], alpha);
        let heuristic = Math.pow(getHeuristic(parent, child, heuristics), beta);
        probabilityMatrix[parent][child] = pheromone * heuristic;
      } else {
        probabilityMatrix[parent][child] *= 0.7;
      }
      probabilitySum += probabilityMatrix[parent][child];
    });

    return _.map(children, function (child) {
      return probabilityMatrix[parent][child] / probabilitySum;
    });
  }

  function chooseVertexToExplore(parent, children, probabilityMatrix, pheromoneTable, heuristics, alpha, beta) {
    var probabilities = getProbabilities(parent, children, probabilityMatrix, pheromoneTable, heuristics, alpha, beta),
        map = _.map(children, function (child, index) {
          return {vertex: child, probability: probabilities[index]};
        });
    return randomizeAccordingToProbabilities(map).vertex;
  }

  function buildSolution(pheromoneTable, heuristics, graph, root, destinations, alpha, beta) {
    var unreached = destinations.length,
        tree = new moea.help.Graph(),
        isVisited = [],
        isDestination = [],
        current = root,
        probabilityMatrix = [];

    isVisited[root] = true;
    for (let i = 0; i < graph.size().vertices; i++) {
      probabilityMatrix[i] = [];
    }
    for (let i = 0; i < destinations.length; i++) {
      isDestination[destinations[i]] = true;
    }

    while (unreached) {
      let chosen = chooseVertexToExplore(current, graph.getEdges(current), probabilityMatrix, pheromoneTable, heuristics, alpha, beta);
      if (!isVisited[chosen]) {
        isVisited[chosen] = true;
        if (isDestination[chosen]) unreached--;
        tree.createEdge(current, chosen);
      }
      current = chosen;
    }

    tree.prune(root, destinations);
    return tree;
  }

  function buildSolutions(populationSize, pheromoneTable, heuristics, graph, root, destinations, sampleSize, alpha, beta, objective) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      let solution = buildSolution(pheromoneTable, heuristics, graph, root, destinations, alpha, beta);
      population.push({
        solution: solution,
        fitness: objective(solution)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.build.broader.buildSolutions', buildSolutions);

}());
