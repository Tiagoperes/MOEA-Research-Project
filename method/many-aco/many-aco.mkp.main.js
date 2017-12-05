(function () {
  'use strict';

  const MAX_TABLE_CONVERGENCE = 10;

  function createPheromoneArray(weights, size, initialPheromoneValue, initialBetaValue, isAllDominationTable) {
    return {
      weights: weights,
      values: _.fill(new Array(size), initialPheromoneValue),
      archive: [],
      convergence: 0,
      beta: initialBetaValue,
      multiplier: 1.1,
      isAllDominationTable: isAllDominationTable
    };
  }

  function createPheromoneArrays(numberOfObjectives, numberOfItems, initialPheromoneValue, initialBetaValue) {
    var arrays = [],
      objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      arrays = _.concat(arrays, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneArray(weights, numberOfItems, initialPheromoneValue, initialBetaValue, i === numberOfObjectives);
      }));
    }

    return arrays;
  }

  function getValuesMean(profitMatrix, itemIndex) {
    return _.sumBy(profitMatrix, function (valueByItem) {
      return valueByItem[itemIndex];
    }) / profitMatrix.length;
  }

  function depositPheromonesAccordingToSolutions(pheromones, population, evaporationRate, max, profitMatrix, weights) {
    _.forEach(population, function (individual) {
      _.forEach(individual.path, function (itemAdded) {
        pheromones[itemAdded] += getValuesMean(profitMatrix, itemAdded)/1000 * (1 - weights[itemAdded]/1000) * evaporationRate;
        if (pheromones[itemAdded] > max) pheromones[itemAdded] = max;
      });
    });
  }

  function evaporatePheromonesAccordingToSolutions(pheromones, population, evaporationRate, min, profitMatrix, weights) {
    _.forEach(population, function (individual) {
      _.forEach(individual.path, function (itemAdded) {
        pheromones[itemAdded] -= getValuesMean(profitMatrix, itemAdded)/1000 * (1 - weights[itemAdded]/1000) * evaporationRate;
        if (pheromones[itemAdded] < min) pheromones[itemAdded] = min;
      });
    });
  }

  function applyWeightMaskToIndividual(individual, weights) {
    var result = [];
    for (let i = 0; i < weights.length; i++) {
      if (weights[i]) result.push(individual.evaluation[i]);
    }
    return result;
  }

  function updatePartialArchives(archiveDiff, pheromoneArrays) {
    var added = [];
    var removed = [];
    _.forEach(pheromoneArrays, function (array, i) {
      if (array.isAllDominationTable) {
        added[i] = archiveDiff.added;
        removed[i] = archiveDiff.removed;
        return true;
      }
      let newArchive = array.archive;
      _.forEach(archiveDiff.added, function (individual) {
        newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, individual, _.partial(applyWeightMaskToIndividual, _, array.weights));
      });
      if (newArchive !== array.archive) {
        added[i] = _.difference(newArchive, array.archive);
        removed[i] = _.difference(array.archive, newArchive);
        array.archive = newArchive;
      } else {
        added[i] = [];
        removed[i] = [];
      }
    });
    return {added: added, removed: removed};
  }

  function mutate(population, rate, settings) {
    _.forEach(population, function (ind) {
      if (Math.random() < rate) {
        let mutated = {solution: _.clone(ind.solution)};
        let trues = [];
        let falses = [];
        _.forEach(mutated.solution, function (isPresent, index) {
          if (isPresent) trues.push(index);
          else falses.push(index);
        });
        mutated.solution[_.sample(trues)] = false;
        mutated.solution[_.sample(falses)] = true;
        window.moea.problem.knapsack.main.makeValid(mutated, settings);
        mutated.path = [];
        _.forEach(mutated.solution, function (isPresent, index) {
          if (isPresent) mutated.path.push(index);
        });
        mutated.evaluation = moea.help.pareto.getSolutionInObjectiveSpace(mutated.solution, settings.objectives);
        if (!moea.help.pareto.dominates(ind, mutated, 'evaluation')) {
          ind.solution = mutated.solution;
          ind.path = mutated.path;
          ind.fitness = mutated.fitness;
        }
      }
    });
  }

  function createPopulation(pheromoneArrays, builder, sampleSize, settings) {
    let population = builder.buildSolutions(settings.populationSize, pheromoneArrays, settings.heuristicFunctions,
      settings.weights, settings.capacity, sampleSize, settings.alpha, settings.isElitist, settings.objectives);
    // mutate(population, 0.1, settings);
    return population;
  }

  function updateArchive(pheromoneArray, population) {
    let prev = pheromoneArray.archive;
    _.forEach(population, function (individual) {
      pheromoneArray.archive = moea.help.pareto.updateNonDominatedSet(pheromoneArray.archive, individual, 'evaluation');
    });

    return {
      added: _.difference(pheromoneArray.archive, prev),
      removed: _.difference(prev, pheromoneArray.archive)
    };
  }

  function updateConvergence(pheromoneGroup, allPheromoneArrays, index, nextIndex) {
    var pheromones = pheromoneGroup[index];
    pheromones.convergence++;
    pheromones.beta *= pheromones.multiplier;
    pheromones.multiplier += 0.1;
    if (pheromones.convergence > MAX_TABLE_CONVERGENCE) {
      pheromones.convergence = 0;
      pheromoneGroup[index] = allPheromoneArrays[nextIndex % allPheromoneArrays.length];
      nextIndex++;
    }
    return nextIndex;
  }

  function updatePheromoneValues(pheromoneArray, positivePopulation, negativePopulation, settings) {
    pheromoneArray.beta = settings.beta;
    pheromoneArray.multiplier = 1.1;
    depositPheromonesAccordingToSolutions(pheromoneArray.values, positivePopulation, settings.evaporationRate, settings.pheromoneBounds.max, settings.profitMatrix, settings.weights);
    evaporatePheromonesAccordingToSolutions(pheromoneArray.values, negativePopulation, settings.evaporationRate, settings.pheromoneBounds.min, settings.profitMatrix, settings.weights);
  }

  function updatePheromoneGroup(group, archiveDifference, allPheromoneArrays, nextPheromoneIndex, settings) {
    let diffs = updatePartialArchives(archiveDifference, group);
    _.forEach(group, function (pheromones, index) {
      if (_.isEmpty(diffs.added[index])) {
        nextPheromoneIndex = updateConvergence(group, allPheromoneArrays, index, nextPheromoneIndex);
      } else {
        updatePheromoneValues(pheromones, diffs.added[index], diffs.removed[index], settings);
      }
    });
    return nextPheromoneIndex;
  }

  function run(settings) {
    var arrayIndex = settings.pheromoneGroupSize,
        allPheromoneArrays = createPheromoneArrays(settings.objectives.length, settings.weights.length, settings.pheromoneBounds.min, settings.beta),
        pheromoneArrays = _.slice(allPheromoneArrays, 0, arrayIndex),
        allDominationArray = _.last(allPheromoneArrays),
        builder = moea.method.manyAco.build.mkp,
        sampleSize = Math.ceil((settings.sampling || 1) * settings.weights.length);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      let population = createPopulation(pheromoneArrays, builder, sampleSize, settings);
      let archiveDifference = updateArchive(allDominationArray, population);
      arrayIndex = updatePheromoneGroup(pheromoneArrays, archiveDifference, allPheromoneArrays, arrayIndex, settings);
    }

    return _.map(allDominationArray.archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.mkp.main.execute', run);
}());
