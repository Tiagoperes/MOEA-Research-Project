(function () {
  'use strict';

  const MAX_TABLE_CONVERGENCE = 5;

  function createPheromoneTable(weights, size, initialPheromoneValue, initialBetaValue, isAllDominationTable) {
    var table = {maxPopulation: 30, weights: weights, values: [], archive: [], convergence: 0, beta: initialBetaValue, multiplier: 1.1, isAllDominationTable: isAllDominationTable};
    for (let i = 0; i < size; i++) {
      table.values[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return table;
  }

  function createPheromoneTables(numberOfObjectives, numberOfVertices, initialPheromoneValue, initialBetaValue) {
    var tables = [],
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue, initialBetaValue, i === numberOfObjectives);
      }));
    }

    return tables;
  }

  function getValuesMean(profitMatrix, itemIndex) {
    return _.sumBy(profitMatrix, function (valueByItem) {
      return valueByItem[itemIndex];
    }) / (profitMatrix.length * 1000);
  }

  function depositPheromonesAccordingToSolutions(pheromones, population, evaporationRate, max, profitMatrix) {
    _.forEach(population, function (individual) {
      _.forEach(individual.path, function (itemAdded, numberOfItemsAdded) {
        pheromones[numberOfItemsAdded][itemAdded] += (1 - getValuesMean(profitMatrix, itemAdded)) * evaporationRate;
        if (pheromones[numberOfItemsAdded][itemAdded] > max) pheromones[numberOfItemsAdded][itemAdded] = max;
      });
    });
  }

  function evaporatePheromonesAccordingToSolutions(pheromones, population, evaporationRate, min, profitMatrix) {
    _.forEach(population, function (individual) {
      _.forEach(individual.path, function (itemAdded, numberOfItemsAdded) {
        pheromones[numberOfItemsAdded][itemAdded] -= (1 - getValuesMean(profitMatrix, itemAdded)) * evaporationRate;
        if (pheromones[numberOfItemsAdded][itemAdded] < min) pheromones[numberOfItemsAdded][itemAdded] = min;
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

  function updateArchives(archiveDiff, pheromoneTables) {
    var added = [];
    var removed = [];
    _.forEach(pheromoneTables, function (table, i) {
      if (table.isAllDominationTable) {
        added[i] = archiveDiff.added;
        removed[i] = archiveDiff.removed;
        return true;
      }

      added[i] = [];
      removed[i] = [];
      _.forEach(archiveDiff.added, function (individual) {
        let individualMean = _.mean(applyWeightMaskToIndividual(individual, table.weights));
        let worstInTableMean = table.archive.length ? _.mean(applyWeightMaskToIndividual(_.last(table.archive), table.weights)) : 0;
        if (table.archive.length < table.maxPopulation || individualMean < worstInTableMean) {
          let index = _.sortedIndexBy(table.archive, individual, function (ind) {
            return _.mean(applyWeightMaskToIndividual(ind, table.weights));
          });
          table.archive.splice(index, 0, individual);
          added[i].push(individual);
        }
        if (table.archive.length > table.maxPopulation){
          removed[i].push(table.archive.pop());
        }
      });
      _.forEach(_.intersection(added[i], removed[i]), function (ind) {
        _.pull(added[i], ind);
        _.pull(removed[i], ind);
      });
    });
    return {added: added, removed: removed};
  }

  function run(settings) {
    var MAX_TABLES = 5,
        tableIndex = 0,
        allPheromoneTables = createPheromoneTables(settings.objectives.length, settings.weights.length, 0.1, settings.beta),
        pheromoneTables = _.slice(allPheromoneTables, tableIndex, tableIndex + MAX_TABLES),
        allDominationTable = _.last(allPheromoneTables),
        builder = moea.method.manyAco.build.mkp,
        archiveConverged = 0;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneTables, settings.heuristicFunctions,
        settings.weights, settings.capacity, settings.alpha, settings.objectives);

      // console.log(_.uniqWith(population, function (a, b) {return _.isEqual(a.evaluation, b.evaluation); }).length + ' unique solutions.');

      let prev = allDominationTable.archive;
      _.forEach(population, function (individual) {
        allDominationTable.archive = moea.help.pareto.updateNonDominatedSet(allDominationTable.archive, individual, 'evaluation');
      });

      let archiveDiff = {
        added: _.difference(allDominationTable.archive, prev),
        removed: _.difference(prev, allDominationTable.archive)
      };

      if (archiveDiff.added.length) {
        let diffs = updateArchives(archiveDiff, pheromoneTables);
        _.forEach(pheromoneTables, function (table, index) {
          if (diffs.added[index].length) {
            table.beta = settings.beta;
            table.multiplier = 1.1;
            depositPheromonesAccordingToSolutions(table.values, diffs.added[index], settings.evaporationRate, settings.pheromoneBounds.max, settings.profitMatrix);
            evaporatePheromonesAccordingToSolutions(table.values, diffs.removed[index], settings.evaporationRate, settings.pheromoneBounds.min, settings.profitMatrix);
          } else {
            table.convergence++;
            table.beta *= table.multiplier;
            table.multiplier += 0.1;
            if (table.convergence > MAX_TABLE_CONVERGENCE) {
              table.convergence = 0;
              pheromoneTables[index] = allPheromoneTables[tableIndex % allPheromoneTables.length];
              tableIndex++;
            }
          }
        });
      } else {
        archiveConverged++;
      }
    }

    console.log('number of tables: ' + allPheromoneTables.length);
    console.log('last table analyzed: ' + tableIndex);
    console.log('archive converged ' + archiveConverged + ' times');

    return _.map(allDominationTable.archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.mkp.main.execute', run);
}());
