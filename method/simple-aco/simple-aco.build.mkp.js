(function () {
  'use strict';

  function chooseItemAccordingToProbabilities(itemIndexes, probabilities) {
    var ordered = _.orderBy(itemIndexes, function (itemIndex) { return probabilities[itemIndex]; }),
        rand = Math.random(),
        sum = 0,
        i = -1;

    do {
      i++;
      sum += probabilities[ordered[i]];
    } while (rand > sum);

    return ordered[i];
  }

  function getHeuristic(itemIndex, budget, heuristics) {
    var sum = 0;
    _.forEach(heuristics, function (heuristic) {
      sum += heuristic(itemIndex, budget);
    });
    return sum / heuristics.length;
  }

  function calculateProbabilities(numberOfItemsInBag, possibilities, pheromones, heuristics, alpha, beta, budget) {
    var probabilitySum = 0,
        probabilityTerms = [],
        probabilities = [];

    _.forEach(possibilities, function (possibility) {
      let pheromone = Math.pow(pheromones[possibility], alpha);
      let heuristic = Math.pow(getHeuristic(possibility, budget, heuristics), beta);
      probabilityTerms[possibility] = pheromone * heuristic;
      probabilitySum += probabilityTerms[possibility];
    });
    _.forEach(possibilities, function (possibility) {
      probabilities[possibility] = probabilityTerms[possibility] / probabilitySum;
    });

    return probabilities;
  }

  function getChildren(node, itemWeights, currentWeight, bagCapacity) {
    return _.reduce(itemWeights, function (achievable, weight, index) {
      if (!node[index] && currentWeight + weight <= bagCapacity) {
        achievable.push(index);
      }
      return achievable;
    }, []);
  }

  function buildSolution(pheromones, heuristics, itemWeights, bagCapacity, alpha, beta) {
    var itemBinArray = _.fill(new Array(itemWeights.length), false),
        path = [],
        isLeafFound = false,
        currentWeight = 0,
        numberOfItemsInBag = 0;

    while (!isLeafFound) {
      let children = getChildren(itemBinArray, itemWeights, currentWeight, bagCapacity);
      if (children.length) {
        let probabilities = calculateProbabilities(numberOfItemsInBag, children, pheromones, heuristics, alpha, beta, bagCapacity - currentWeight);
        let itemToAdd = chooseItemAccordingToProbabilities(children, probabilities);
        itemBinArray[itemToAdd] = true;
        path.push(itemToAdd);
        currentWeight += itemWeights[itemToAdd];
        numberOfItemsInBag++;
      } else {
        isLeafFound = true;
      }
    }

    return {items: itemBinArray, path: path};
  }

  function buildSolutions(populationSize, pheromoneArray, heuristics, itemWeights, bagCapacity, alpha, beta, objective) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      let solution = buildSolution(pheromoneArray, heuristics, itemWeights, bagCapacity, alpha, beta);
      population.push({
        solution: solution.items,
        path: solution.path,
        fitness: objective(solution.items)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.build.mkp.buildSolutions', buildSolutions);

}());
