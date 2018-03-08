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

  function calculateProbabilities(currentSolution, possibilities, pheromones, heuristic, alpha, beta, delta, budget) {
    var probabilitySum = 0,
      probabilityTerms = [],
      probabilities = [];

    _.forEach(possibilities, function (possibility) {
      let pheromone = Math.pow(currentSolution[possibility] * delta + pheromones[possibility], alpha);
      let heuristicValue = Math.pow(heuristic(possibility, budget), beta);
      probabilityTerms[possibility] = pheromone * heuristicValue;
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

  function buildSolution(currentSolution, pheromones, heuristic, itemWeights, bagCapacity, sampleSize, alpha, beta, delta, elitismRate) {
    var itemBinArray = _.fill(new Array(itemWeights.length), false),
      path = [],
      isLeafFound = false,
      currentWeight = 0,
      numberOfItemsInBag = 0;

    while (!isLeafFound) {
      let children = _.sampleSize(getChildren(itemBinArray, itemWeights, currentWeight, bagCapacity), sampleSize);
      if (children.length) {
        let probabilities = calculateProbabilities(currentSolution, children, pheromones, heuristic, alpha, beta, delta, bagCapacity - currentWeight);
        let itemToAdd;
        if (Math.random() < elitismRate) {
          itemToAdd = _.maxBy(children, function (child) {
            return probabilities[child];
          });
        } else {
          itemToAdd = chooseItemAccordingToProbabilities(children, probabilities);
        }
        itemBinArray[itemToAdd] = true;
        path.push(itemToAdd);
        currentWeight += itemWeights[itemToAdd];
        numberOfItemsInBag++;
      } else {
        isLeafFound = true;
      }
    }

    return itemBinArray;
  }

  function buildSolutions(groups, itemWeights, bagCapacity, sampleSize, alpha, beta, delta, elitismRate, objectives) {
    _.forEach(groups, function (group) {
      _.forEach(group.ants, function (ant) {
        let solution = buildSolution(ant.currentSolution.structure, group.pheromones, ant.heuristic, itemWeights, bagCapacity, sampleSize, alpha, beta, delta, elitismRate);
        ant.newSolution = {
          structure: solution,
          evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
        };
      });
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moeadAco.build.mkp.buildSolutions', buildSolutions);

}());
