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

  function calculateProbabilities(possibilities, pheromones, heuristics, hpower, alpha, beta, mutationRate) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(pheromones[possibility.parent][possibility.vertex], alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, heuristics, hpower), beta);
        possibility.probabilityTerm = pheromone * heuristic;
      }
      probabilitySum += possibility.probabilityTerm;
    });
    if (Math.random() < mutationRate) {
      _.forEach(possibilities, function (possibility) {
        possibility.probability = 1 / possibilities.length;
      });
    } else {
      _.forEach(possibilities, function (possibility) {
        possibility.probability = possibility.probabilityTerm / probabilitySum;
      });
    }
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

  function chooseVertexToExplore(explore, pheromoneTable, heuristics, hpower, sampleSize, alpha, beta, mutationRate) {
    let sample = _.sampleSize(explore, sampleSize);
    calculateProbabilities(sample, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate);
    let chosen = randomizeAccordingToProbabilities(sample);
    _.pull(explore, chosen);
    return chosen;
  }

  function addVertexToExplorationArray(vertex, parent, explore) {
    explore.push(vertex);
    vertex.parent = parent;
  }

  function replaceParent(vertexObject, newParent, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate) {
    let options = [vertexObject, {parent: newParent, vertex: vertexObject.vertex}];
    calculateProbabilities(options, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate);
    let node = randomizeAccordingToProbabilities(options);
    vertexObject.parent = node.parent;
    vertexObject.probabilityTerm = node.probabilityTerm;
  }

  function viewChildren(graph, chosen, explore, vertices, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate) {
    _.forEach(graph.getEdges(chosen.vertex), function (v) {
      if (!vertices[v].parent) addVertexToExplorationArray(vertices[v], chosen.vertex, explore);
      else if (!vertices[v].isVisited) replaceParent(vertices[v], chosen.vertex, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate);
    });
  }

  function visitVertex(graph, tree, chosen, explore, vertices, unreached, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate) {
    chosen.isVisited = true;
    _.pull(unreached, chosen.vertex);
    tree.createEdge(chosen.parent, chosen.vertex);
    viewChildren(graph, chosen, explore, vertices, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate);
  }

  function buildSolution(pheromoneTable, heuristics, hpower, graph, root, destinations, sampleSize, alpha, beta, mutationRate) {
    var unreached = _.clone(destinations),
        tree = new moea.help.Graph(),
        vertices = initializeVertices(graph),
        explore = initializeExploration(graph, root, vertices);

    while (unreached.length && explore.length) {
      window.maxExploreSize = window.maxExploreSize || 0;
      if (explore.length > window.maxExploreSize) window.maxExploreSize = explore.length;
      let chosen = chooseVertexToExplore(explore, pheromoneTable, heuristics, hpower, sampleSize, alpha, beta, mutationRate);
      if (!chosen.isVisited) {
        visitVertex(graph, tree, chosen, explore, vertices, unreached, pheromoneTable, heuristics, hpower, alpha, beta, mutationRate);
      }
    }

    tree.prune(root, destinations);
    return tree;
  }

  function buildSolutions(populationSize, pheromoneTables, heuristics, graph, root, destinations, sampleSize, alpha, mutationRate, objectives) {
    const BASE = 3;
    var population = [];
    var maxNumber = Math.pow(BASE, heuristics.length) - 1;
    var inc = maxNumber / (populationSize - 1);
    for (let i = 0; i < populationSize; i++) {
      let tables = _.sampleSize(pheromoneTables, populationSize);
      let table = i < tables.length ? tables[i] : _.sample(tables);
      // let hpower = Math.floor(i * inc).toString(BASE).split('');
      let hpower = _.random(maxNumber).toString(BASE).split('');
      // let hpower = _.fill(new Array(heuristics.length), 1);
      // let hpower = [0, 0, 0, 0];
      // if (table.weights[0]) {hpower[2] = 1; hpower[3] = 1;}
      // if (table.weights[1]) {hpower[0] = 1;}
      // if (table.weights[2]) {hpower[1] = 1;}
      while (hpower.length < heuristics.length) hpower.unshift(0);
      let solution = buildSolution(table.values, heuristics, hpower, graph, root, destinations, sampleSize, alpha, table.beta, mutationRate);
      population.push({
        solution: solution,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.build.buildSolutions', buildSolutions);

}());
