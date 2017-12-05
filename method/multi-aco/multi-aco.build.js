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

  function getHeuristic(sourceVertex, targetVertex, heuristics, hpower) {
    var elements = 0, sum = 0;
    _.forEach(heuristics, function (heuristic, index) {
      elements += parseInt(hpower[index]);
      sum += heuristic(sourceVertex, targetVertex) * hpower[index];
    });
    return elements ? sum / elements : 1;
  }

  function calculateProbabilities(possibilities, pheromones, heuristics, hpower, alpha, beta) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(pheromones[possibility.parent][possibility.vertex], alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, heuristics, hpower), beta);
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

  function chooseVertexToExplore(explore, pheromoneTable, heuristics, hpower, sampleSize, alpha, beta) {
    let sample = _.sampleSize(explore, sampleSize);
    calculateProbabilities(sample, pheromoneTable, heuristics, hpower, alpha, beta);
    let chosen = randomizeAccordingToProbabilities(sample);
    _.pull(explore, chosen);
    return chosen;
  }

  function addVertexToExplorationArray(vertex, parent, explore) {
    explore.push(vertex);
    vertex.parent = parent;
  }

  function replaceParent(vertexObject, newParent, pheromoneTable, heuristics, hpower, alpha, beta) {
    let options = [vertexObject, {parent: newParent, vertex: vertexObject.vertex}];
    calculateProbabilities(options, pheromoneTable, heuristics, hpower, alpha, beta);
    let node = randomizeAccordingToProbabilities(options);
    vertexObject.parent = node.parent;
    vertexObject.probabilityTerm = node.probabilityTerm;
  }

  function viewChildren(graph, chosen, explore, vertices, pheromoneTable, heuristics, hpower, alpha, beta) {
    _.forEach(graph.getEdges(chosen.vertex), function (v) {
      if (!vertices[v].parent) addVertexToExplorationArray(vertices[v], chosen.vertex, explore);
      else if (!vertices[v].isVisited) replaceParent(vertices[v], chosen.vertex, pheromoneTable, heuristics, hpower, alpha, beta);
    });
  }

  function visitVertex(graph, tree, chosen, explore, vertices, unreached, pheromoneTable, heuristics, hpower, alpha, beta) {
    chosen.isVisited = true;
    _.pull(unreached, chosen.vertex);
    tree.createEdge(chosen.parent, chosen.vertex);
    viewChildren(graph, chosen, explore, vertices, pheromoneTable, heuristics, hpower, alpha, beta);
  }

  function buildSolution(pheromoneTable, heuristics, hpower, graph, root, destinations, sampleSize, alpha, beta) {
    var unreached = _.clone(destinations),
        tree = new moea.help.Graph(),
        vertices = initializeVertices(graph),
        explore = initializeExploration(graph, root, vertices);

    while (unreached.length && explore.length) {
      let chosen = chooseVertexToExplore(explore, pheromoneTable, heuristics, hpower, sampleSize, alpha, beta);
      if (!chosen.isVisited) {
        visitVertex(graph, tree, chosen, explore, vertices, unreached, pheromoneTable, heuristics, hpower, alpha, beta);
      }
    }

    tree.prune(root, destinations);
    return tree;
  }

  function buildSolutions(populationSize, pheromoneTables, heuristics, graph, root, destinations, sampleSize, alpha, beta, objectives) {
    const BASE = 3;
    var population = [];
    var maxNumber = Math.pow(BASE, heuristics.length) - 1;
    var inc = maxNumber / (populationSize - 1);
    for (let i = 0; i < populationSize; i++) {
      let tables = _.sampleSize(pheromoneTables, populationSize);
      let table = i < tables.length ? tables[i] : _.sample(tables);
      let hpower = Math.floor(i * inc).toString(BASE).split('');
      while (hpower.length < heuristics.length) hpower.unshift(0);
      let solution = buildSolution(table.values, heuristics, hpower, graph, root, destinations, sampleSize, alpha, beta);
      population.push({
        solution: solution,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.multiAco.build.buildSolutions', buildSolutions);

}());
