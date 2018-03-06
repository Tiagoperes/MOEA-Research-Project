(function () {
  'use strict';

  function getNeighborhood(node, graph, isVisited) {
    return _.filter(graph.getEdges(node), function (e) {
      return !isVisited[e];
    });
  }

  function getHeuristic(sourceVertex, targetVertex, heuristics) {
    return _.sumBy(heuristics, function (heuristic) {
      return heuristic(sourceVertex, targetVertex);
    }) / heuristics.length;
  }

  function  getProbabilities(source, targets, pheromones, heuristics, alpha, beta) {
    let probabilities = [], sum = 0;

    _.forEach(targets, function (target) {
      let pheromone = Math.pow(pheromones[source][target], alpha),
        heuristic = Math.pow(getHeuristic(source, target, heuristics), beta);
      probabilities.push(pheromone * heuristic);
      sum += _.last(probabilities);
    });

    return _.map(probabilities, function (p) {
      return p / sum;
    });
  }

  function getByMaxProbability(neighborhood, probabilities) {
    let max = 0;
    for (let i = 1; i < neighborhood.length; i++) {
      if (probabilities[i] > probabilities[max]) max = i;
    }
    return neighborhood[max];
  }

  function getByRoulette(neighborhood, probabilities) {
    let wrapped = _.map(neighborhood, function (node, i) {
      return {node: node, probability: probabilities[i]};
    });

    let ordered = _.orderBy(wrapped, 'probability'),
      rand = Math.random(),
      sum = 0,
      i = -1;

    do {
      i++;
      sum += ordered[i].probability;
    } while (rand > sum);

    return ordered[i].node;
  }

  function selectNode(neighborhood, probabilities) {
    if (Math.random() < 0.5) return getByMaxProbability(neighborhood, probabilities);
    return getByRoulette(neighborhood, probabilities);
  }

  function buildSolution(pheromones, heuristics, graph, root, destinations, alpha, beta) {
    let tree = new moea.help.Graph(),
      unreached = _.clone(destinations),
      explore = [root],
      isVisited = _.fill(new Array(graph.size().vertices), false);

    isVisited[root] = true;

    while (explore.length && unreached.length) {
      let i = _.sample(explore);
      let neighborhood = getNeighborhood(i, graph, isVisited);
      if (!neighborhood.length) _.pull(explore, i);
      else {
        let probabilities = getProbabilities(i, neighborhood, pheromones, heuristics, alpha, beta);
        let j = selectNode(neighborhood, probabilities);
        explore.push(j);
        tree.createEdge(i, j);
        isVisited[j] = true;
        _.pull(unreached, j);
        // pheromones[i][j] *= 1 - evaporationRate;
        // pheromones[i][j] += evaporationRate * initialPheromoneValue;
      }
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
  _.set(moea, 'method.simpleAco.build.baran.buildSolutions', buildSolutions);

}());
