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

  function getHeuristic(itemIndex, budget, heuristics, hpower) {
    var elements = 0, sum = 0;
    _.forEach(heuristics, function (heuristic, index) {
      elements += parseInt(hpower[index]);
      sum += heuristic(itemIndex, budget) * hpower[index];
    });
    return elements ? sum / elements : 1;
  }

  function calculateProbabilities(numberOfItemsInBag, possibilities, pheromones, heuristics, hpower, alpha, beta, budget) {
    var probabilitySum = 0,
        probabilityTerms = [],
        probabilities = [];

    _.forEach(possibilities, function (possibility) {
      let pheromone = Math.pow(pheromones[possibility], alpha);
      let heuristic = Math.pow(getHeuristic(possibility, budget, heuristics, hpower), beta);
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

  function buildSolution(pheromones, heuristics, hpower, itemWeights, bagCapacity, sampleSize, alpha, beta, isElitist) {
    var itemBinArray = _.fill(new Array(itemWeights.length), false),
        path = [],
        isLeafFound = false,
        currentWeight = 0,
        numberOfItemsInBag = 0;

    while (!isLeafFound) {
      let children = _.sampleSize(getChildren(itemBinArray, itemWeights, currentWeight, bagCapacity), sampleSize, isElitist);
      if (children.length) {
        let probabilities = calculateProbabilities(numberOfItemsInBag, children, pheromones, heuristics, hpower, alpha, beta, bagCapacity - currentWeight);
        let itemToAdd;
        if (isElitist) {
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

    return {items: itemBinArray, path: path};
  }

  function buildSolutions(populationSize, pheromoneTables, heuristics, itemWeights, bagCapacity, sampleSize, alpha, isElitist, objectives) {
    const BASE = 3;
    var population = [];
    var maxNumber = Math.pow(BASE, heuristics.length) - 1;
    for (let i = 0; i < populationSize; i++) {
      let tables = _.sampleSize(pheromoneTables, populationSize);
      let table = i < tables.length ? tables[i] : _.sample(tables);
      let hpower = _.random(maxNumber).toString(BASE).split('');
      while (hpower.length < heuristics.length) hpower.unshift(0);
      let solution = buildSolution(table.values, heuristics, hpower, itemWeights, bagCapacity, sampleSize, alpha, table.beta, isElitist);
      population.push({
        solution: solution.items,
        path: solution.path,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution.items, objectives)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.build.mkp.buildSolutions', buildSolutions);

}());
