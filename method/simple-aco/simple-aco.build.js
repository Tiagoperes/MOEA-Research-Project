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

  function calculateProbabilities(possibilities, pheromones, heuristics, alpha, beta) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(pheromones[possibility.parent][possibility.vertex], alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, heuristics), beta);
        possibility.probabilityTerm = pheromone * heuristic;
      }
      probabilitySum += possibility.probabilityTerm;
    });
    _.forEach(possibilities, function (possibility) {
      possibility.probability = possibility.probabilityTerm / probabilitySum;
    });
  }

  function initializeVertices(graph) {
    var vertices = [];

    for (let i = 0; i < graph.size().vertices; i++) {
      vertices.push({vertex: i, isVisited: false, parent: null});
    }

    return vertices;
  }

  function initializeExploration(graph, root, vertices) {
    var explore = [];

    _.forEach(graph.getEdges(root), function (v) {
      vertices[v].parent = root;
      explore.push(vertices[v]);
    });

    vertices[root].isVisited = true;
    return explore;
  }

  function chooseVertexToExplore(explore, pheromoneTable, heuristics, sampleSize, alpha, beta) {
    let sample = _.sampleSize(explore, sampleSize);
    calculateProbabilities(sample, pheromoneTable, heuristics, alpha, beta);
    let chosen = randomizeAccordingToProbabilities(sample);
    _.pull(explore, chosen);
    return chosen;
  }

  function addVertexToExplorationArray(vertex, parent, explore) {
    explore.push(vertex);
    vertex.parent = parent;
  }

  function replaceParent(vertexObject, newParent, pheromoneTable, heuristics, alpha, beta) {
    let options = [vertexObject, {parent: newParent, vertex: vertexObject.vertex}];
    calculateProbabilities(options, pheromoneTable, heuristics, alpha, beta);
    let node = randomizeAccordingToProbabilities(options);
    vertexObject.parent = node.parent;
    vertexObject.probabilityTerm = node.probabilityTerm;
  }

  function viewChildren(graph, chosen, explore, vertices, pheromoneTable, heuristics, alpha, beta) {
    _.forEach(graph.getEdges(chosen.vertex), function (v) {
      if (!vertices[v].parent) addVertexToExplorationArray(vertices[v], chosen.vertex, explore);
      else if (!vertices[v].isVisited) replaceParent(vertices[v], chosen.vertex, pheromoneTable, heuristics, alpha, beta);
    });
  }

  function visitVertex(graph, tree, chosen, explore, vertices, unreached, pheromoneTable, heuristics, alpha, beta) {
    chosen.isVisited = true;
    _.pull(unreached, chosen.vertex);
    tree.createEdge(chosen.parent, chosen.vertex);
    viewChildren(graph, chosen, explore, vertices, pheromoneTable, heuristics, alpha, beta);
  }

  function buildSolution(pheromoneTable, heuristics, graph, root, destinations, sampleSize, alpha, beta) {
    var unreached = _.clone(destinations),
        tree = new moea.help.Graph(),
        vertices = initializeVertices(graph),
        explore = initializeExploration(graph, root, vertices);

    while (unreached.length && explore.length) {
      let chosen = chooseVertexToExplore(explore, pheromoneTable, heuristics, sampleSize, alpha, beta);
      if (!chosen.isVisited) {
        visitVertex(graph, tree, chosen, explore, vertices, unreached, pheromoneTable, heuristics, alpha, beta);
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
  _.set(moea, 'method.simpleAco.build.buildSolutions', buildSolutions);

}());
