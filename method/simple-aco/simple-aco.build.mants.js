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

  function findPath(pheromoneTable, heuristics, probabilityMatrix, graph, root, destination, alpha, beta) {
    var path = [],
        isVisited = [],
        node = root;

    while (node !== destination) {
      isVisited[node] = true;
      let explore = [];
      while (!explore.length) {
        explore = _.filter(graph.getEdges(node), function (v) {
          return !isVisited[v];
        });
        if (!explore.length) node = path.pop();
      }
      path.push(node);
      node = chooseVertexToExplore(node, explore, probabilityMatrix, pheromoneTable, heuristics, alpha, beta);
    }

    path.push(node);
    return path;
  }

  function mergePathIntoTree(tree, path, accessible) {
    accessible[path[0]] = true;
    for (let i = 1; i < path.length; i++) {
      if (!accessible[path[i]]) {
        tree.createEdge(path[i - 1], path[i]);
        accessible[path[i]] = true;
      }
    }
  }

  function buildSolution(pheromoneTable, heuristics, graph, root, destinations, alpha, beta) {
    var tree = new moea.help.Graph(),
        probabilityMatrix = [],
        accessible = [];

    for (let i = 0; i < graph.size().vertices; i++) {
      probabilityMatrix[i] = [];
    }

    for (let i = 0; i < destinations.length; i++) {
      let path = findPath(pheromoneTable, heuristics, probabilityMatrix, graph, root, destinations[i], alpha, beta);
      mergePathIntoTree(tree, path, accessible);
    }

    tree.prune(root, destinations);
    // moea.help.graphDesigner.draw(tree, root, destinations);
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
  _.set(moea, 'method.simpleAco.build.mants.buildSolutions', buildSolutions);

}());
