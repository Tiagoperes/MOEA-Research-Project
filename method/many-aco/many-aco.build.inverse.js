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

  function getProbabilities(parent, children, probabilityMatrix, pheromones, heuristics, hpower, alpha, beta) {
    var probabilitySum = 0;

    _.forEach(children, function (child) {
      if (!probabilityMatrix[parent][child]) {
        let pheromone = Math.pow(pheromones[parent][child], alpha);
        let heuristic = Math.pow(getHeuristic(parent, child, heuristics, hpower), beta);
        probabilityMatrix[parent][child] = pheromone * heuristic;
      }
      probabilitySum += probabilityMatrix[parent][child];
    });

    return _.map(children, function (child) {
      return probabilityMatrix[parent][child] / probabilitySum;
    });
  }

  function chooseVertexToExplore(parent, children, probabilityMatrix, pheromoneTable, heuristics, hpower, alpha, beta) {
    var probabilities = getProbabilities(parent, children, probabilityMatrix, pheromoneTable, heuristics, hpower, alpha, beta),
        map = _.map(children, function (child, index) {
          return {vertex: child, probability: probabilities[index]};
        });
    return randomizeAccordingToProbabilities(map).vertex;
  }

  function createAnts(positions) {
    return _.map(positions, function (p) {
      return {
        position: p,
        path: [],
        isVisited: []
      };
    });
  }

  function walk(ant, graph, tree, probabilityMatrix, pheromoneTable, heuristics, hpower, alpha, beta) {
    if (ant.isDead) return;
    var connections = _.filter(graph.getEdges(ant.position), function (v) {
      return !ant.isVisited[v];
    });
    while (!connections.length && ant.path.length) {
      ant.position = ant.path.pop();
      connections = _.filter(graph.getEdges(ant.position), function (v) {
        return !ant.isVisited[v];
      });
    }
    if (!connections.length && !ant.path.length) {
      ant.isDead = true;
    } else {
      let chosen = chooseVertexToExplore(ant.position, connections, probabilityMatrix, pheromoneTable, heuristics, hpower, alpha, beta);
      tree.createEdge(ant.position, chosen);
      tree.createEdge(chosen, ant.position);
      ant.path.push(ant.position);
      ant.position = chosen;
      ant.isVisited[chosen] = true;
    }
  }

  function mergeComponents(ants, antA, antB) {
    var length;
    if (antA.isVisited.length > antB.isVisited.length) length = antA.isVisited.length;
    else length = antB.isVisited.length;

    for (let i = 0; i < length; i++) {
      antA.isVisited[i] = antA.isVisited[i] || antB.isVisited[i];
    }

    var toBeUpdated = antB.isVisited;
    _.forEach(ants, function (ant) {
      if (ant.isVisited === toBeUpdated) {
        ant.isVisited = antA.isVisited;
      }
    });
  }

  function buildSolution(pheromoneTable, heuristics, hpower, graph, root, destinations, alpha, beta) {
    var ants = createAnts(_.concat(destinations, [root])),
        tree = new moea.help.Graph(),
        visitedBy = [],
        components = ants.length,
        probabilityMatrix = [];

    for (let i = 0; i < graph.size().vertices; i++) {
      probabilityMatrix[i] = [];
    }

    for (let i = 0; i < ants.length; i++) {
      visitedBy[ants[i].position] = ants[i];
      ants[i].isVisited[ants[i].position] = true;
    }

    while (components > 1) {
      for (let i = 0; i < ants.length; i++) {
        walk(ants[i], graph, tree, probabilityMatrix, pheromoneTable, heuristics, hpower, alpha, beta);
        if (!ants[i].isDead && visitedBy[ants[i].position]) {
          mergeComponents(ants, ants[i], visitedBy[ants[i].position]);
          components--;
        }
        visitedBy[ants[i].position] = ants[i];
        if (components === 1) break;
      }
    }

    var t = new moea.help.Graph();
    var explore = [root];
    var isVisited = [];
    while (explore.length) {
      let node = explore.pop();
      isVisited[node] = true;
      _.forEach(tree.getEdges(node), function (v) {
        if (!isVisited[v]) {
          t.createEdge(node, v);
          explore.push(v);
        }
      });
    }

    t.prune(root, destinations);
    return t;
  }

  function buildSolutions(populationSize, pheromoneTables, heuristics, graph, root, destinations, sampleSize, alpha, mutationRate, objectives) {
    const BASE = 3;
    var population = [];
    var maxNumber = Math.pow(BASE, heuristics.length) - 1;
    for (let i = 0; i < populationSize; i++) {
      let tables = _.sampleSize(pheromoneTables, populationSize);
      let table = i < tables.length ? tables[i] : _.sample(tables);
      let hpower = _.random(maxNumber).toString(BASE).split('');
      let solution = buildSolution(table.values, heuristics, hpower, graph, root, destinations, alpha, table.beta);
      population.push({
        solution: solution,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.build.inverse.buildSolutions', buildSolutions);

}());
