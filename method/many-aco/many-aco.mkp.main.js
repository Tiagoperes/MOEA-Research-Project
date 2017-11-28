(function () {
  'use strict';

  const MAX_TABLE_CONVERGENCE = 5;

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

  function updateArchives(archiveDiff, pheromoneArrays) {
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

  function run(settings) {
    var MAX_ARRAYS = 5,
        arrayIndex = 0,
        allPheromoneArrays = createPheromoneArrays(settings.objectives.length, settings.weights.length, 0.1, settings.beta),
        pheromoneArrays = _.slice(allPheromoneArrays, arrayIndex, arrayIndex + MAX_ARRAYS),
        allDominationArray = _.last(allPheromoneArrays),
        builder = moea.method.manyAco.build.mkp,
        archiveConverged = 0;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneArrays, settings.heuristicFunctions,
        settings.weights, settings.capacity, settings.alpha, settings.objectives);

      // console.log(_.uniqWith(population, function (a, b) {return _.isEqual(a.evaluation, b.evaluation); }).length + ' unique solutions.');

      let prev = allDominationArray.archive;
      _.forEach(population, function (individual) {
        allDominationArray.archive = moea.help.pareto.updateNonDominatedSet(allDominationArray.archive, individual, 'evaluation');
      });

      let archiveDiff = {
        added: _.difference(allDominationArray.archive, prev),
        removed: _.difference(prev, allDominationArray.archive)
      };

      if (archiveDiff.added.length) {
        let diffs = updateArchives(archiveDiff, pheromoneArrays);
        _.forEach(pheromoneArrays, function (table, index) {
          if (diffs.added[index].length) {
            table.beta = settings.beta;
            table.multiplier = 1.1;
            depositPheromonesAccordingToSolutions(table.values, diffs.added[index], settings.evaporationRate, settings.pheromoneBounds.max, settings.profitMatrix, settings.weights);
            evaporatePheromonesAccordingToSolutions(table.values, diffs.removed[index], settings.evaporationRate, settings.pheromoneBounds.min, settings.profitMatrix, settings.weights);
          } else {
            table.convergence++;
            table.beta *= table.multiplier;
            table.multiplier += 0.1;
            if (table.convergence > MAX_TABLE_CONVERGENCE) {
              table.convergence = 0;
              pheromoneArrays[index] = allPheromoneArrays[arrayIndex % allPheromoneArrays.length];
              arrayIndex++;
            }
          }
        });
      } else {
        archiveConverged++;
      }
    }

    console.log('number of tables: ' + allPheromoneArrays.length);
    console.log('last table analyzed: ' + arrayIndex);
    console.log('archive converged ' + archiveConverged + ' times');

    return _.map(allDominationArray.archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.mkp.main.execute', run);
}());
