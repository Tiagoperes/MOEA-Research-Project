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

  function calculateProbabilities(currentSolution, possibilities, pheromones, heuristic, alpha, beta, delta) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let currentSolutionTerm = (currentSolution && currentSolution.hasEdge(possibility.parent, possibility.vertex)) ? delta : 0;
        let pheromone = Math.pow(currentSolutionTerm + pheromones[possibility.parent][possibility.vertex], alpha);
        let heuristicValue = Math.pow(heuristic(possibility.parent, possibility.vertex), beta);
        possibility.probabilityTerm = pheromone * heuristicValue;
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

  function chooseVertexToExplore(currentSolution, explore, pheromones, heuristic, sampleSize, alpha, beta, delta, elitismRate) {
    let sample = _.sampleSize(explore, sampleSize);
    if (!sample) {
      debugger;
    }
    let chosen;
    calculateProbabilities(currentSolution, sample, pheromones, heuristic, alpha, beta, delta);
    if (Math.random() < elitismRate) {
      chosen = _.maxBy(sample, 'probability');
    } else {
      chosen = randomizeAccordingToProbabilities(sample);
    }
    _.pull(explore, chosen);
    return chosen;
  }

  function addVertexToExplorationArray(vertex, parent, explore) {
    explore.push(vertex);
    vertex.parent = parent;
  }

  function replaceParent(currentSolution, vertexObject, newParent, pheromones, heuristic, alpha, beta, delta) {
    let options = [vertexObject, {parent: newParent, vertex: vertexObject.vertex}];
    calculateProbabilities(currentSolution, options, pheromones, heuristic, alpha, beta, delta);
    let node = randomizeAccordingToProbabilities(options);
    vertexObject.parent = node.parent;
    vertexObject.probabilityTerm = node.probabilityTerm;
  }

  function viewChildren(currentSolution, graph, chosen, explore, vertices, pheromones, heuristic, alpha, beta, delta) {
    _.forEach(graph.getEdges(chosen.vertex), function (v) {
      if (!vertices[v].parent) addVertexToExplorationArray(vertices[v], chosen.vertex, explore);
      else if (!vertices[v].isVisited) replaceParent(currentSolution, vertices[v], chosen.vertex, pheromones, heuristic, alpha, beta, delta);
    });
  }

  function visitVertex(currentSolution, graph, tree, chosen, explore, vertices, unreached, pheromones, heuristic, alpha, beta, delta) {
    chosen.isVisited = true;
    _.pull(unreached, chosen.vertex);
    tree.createEdge(chosen.parent, chosen.vertex);
    viewChildren(currentSolution, graph, chosen, explore, vertices, pheromones, heuristic, alpha, beta, delta);
  }

  function buildSolution(currentSolution, pheromones, heuristic, graph, root, destinations, sampleSize, alpha, beta, delta, elitismRate) {
    let unreached = _.clone(destinations),
        tree = new moea.help.Graph(),
        vertices = initializeVertices(graph),
        explore = initializeExploration(graph, root, vertices);

    while (unreached.length && explore.length) {
      let chosen = chooseVertexToExplore(currentSolution, explore, pheromones, heuristic, sampleSize, alpha, beta, delta, elitismRate);
      if (!chosen.isVisited) {
        visitVertex(currentSolution, graph, tree, chosen, explore, vertices, unreached, pheromones, heuristic, alpha, beta, delta);
      }
    }

    tree.prune(root, destinations);
    return tree;
  }

  function buildSolutions(groups, graph, root, destinations, sampleSize, alpha, beta, delta, elitismRate, objectives) {
    _.forEach(groups, function (group) {
      _.forEach(group.ants, function (ant) {
        let solution = buildSolution(_.get(ant, 'currentSolution.structure'), group.pheromones, ant.heuristic, graph, root, destinations, sampleSize, alpha, beta, delta, elitismRate);
        ant.newSolution = {
          structure: solution,
          evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
        };
      });
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moeadAco.mrp.build.buildSolutions', buildSolutions);

}());
