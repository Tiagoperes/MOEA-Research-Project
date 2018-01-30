(function () {
  'use strict';

  function getNeighborhood(node, graph, isVisited) {
    return _.filter(graph.getEdges(node), function (e) {
      return !isVisited[e];
    });
  }

  function getHeuristic(source, target, heuristics, hpower) {
    let elements = 0, sum = 0;
    _.forEach(heuristics, function (heuristic, index) {
      elements += parseInt(hpower[index]);
      sum += heuristic(source, target) * hpower[index];
    });
    return elements ? sum / elements : 1;
  }

  function getProbabilities(source, targets, pheromones, heuristics, hpower, alpha, beta) {
    let probabilities = [], sum = 0;

    _.forEach(targets, function (target) {
      let pheromone = Math.pow(pheromones[source][target], alpha),
          heuristic = Math.pow(getHeuristic(source, target, heuristics, hpower), beta);
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

  function buildSolution(pheromones, evaporationRate, initialPheromoneValue, heuristics, hpower, graph, root, destinations, alpha, beta) {
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
        let probabilities = getProbabilities(i, neighborhood, pheromones, heuristics, hpower, alpha, beta);
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

  function buildSolutions(populationSize, pheromoneStructure, evaporationRate, initialPheromoneValue, heuristics, graph, root, destinations, alpha, objectives) {
    const BASE = 3;
    let population = [],
        maxNumber = Math.pow(BASE, heuristics.length) - 1;

    for (let i = 0; i < populationSize; i++) {
      let hpower = _.random(maxNumber).toString(BASE).split('');
      while (hpower.length < heuristics.length) hpower.unshift(0);
      let solution = buildSolution(pheromoneStructure.values, evaporationRate, initialPheromoneValue, heuristics, hpower, graph, root, destinations, alpha, pheromoneStructure.beta);
      population.push({
        solution: solution,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
      });
    }

    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moacsBp.build.buildSolutions', buildSolutions);

}());
