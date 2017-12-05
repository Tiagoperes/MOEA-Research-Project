(function () {
  'use strict';

  const MAX_TABLE_CONVERGENCE = 5;

  function createPheromoneTable(weights, size, initialPheromoneValue, initialBetaValue, isAllDominationTable) {
    var table = {weights: weights, values: [], archive: [], convergence: 0, beta: initialBetaValue, multiplier: 1.1, isAllDominationTable: isAllDominationTable};
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
      // tables = _.concat(tables, _.map(_.sampleSize(_.allCombinations(objectives, i), 2), function (objectiveIndexes) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue, initialBetaValue, i === numberOfObjectives);
      }));
    }

    return tables;
  }

  function getWeightsMean(weights, v, e) {
    // return 0;
    return _.sumBy(weights, function (weightMatrix) {
      return weightMatrix[v][e];
    }) / weights.length;
  }

  function depositPheromonesAccordingToSolutions(pheromones, population, evaporationRate, max, weights) {
    _.forEach(population, function (individual) {
      _.forEach(individual.solution.getVertices(), function (v) {
        _.forEach(individual.solution.getEdges(v), function (e) {
          pheromones[v][e] += (1 - getWeightsMean(weights, v, e)) * evaporationRate;
          if (pheromones[v][e] > max) pheromones[v][e] = max;
        });
      });
    });
  }

  function evaporatePheromonesAccordingToSolutions(pheromones, population, evaporationRate, min, weights) {
    _.forEach(population, function (individual) {
      _.forEach(individual.solution.getVertices(), function (v) {
        _.forEach(individual.solution.getEdges(v), function (e) {
          pheromones[v][e] -= (1 - getWeightsMean(weights, v, e)) * evaporationRate;
          if (pheromones[v][e] < min) pheromones[v][e] = min;
        });
      });
    });
  }

  function removePheromonesAccordingToSolution(pheromones, individual, min) {
    _.forEach(individual.solution.getVertices(), function (v) {
      _.forEach(individual.solution.getEdges(v), function (e) {
        pheromones[v][e] = min;
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
      let newArchive = table.archive;
      _.forEach(archiveDiff.added, function (individual) {
        newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, individual, _.partial(applyWeightMaskToIndividual, _, table.weights));
      });
      if (newArchive !== table.archive) {
        added[i] = _.difference(newArchive, table.archive);
        removed[i] = _.difference(table.archive, newArchive);
        table.archive = newArchive;
      } else {
        added[i] = [];
        removed[i] = [];
      }
    });
    return {added: added, removed: removed};
  }

  function filter(population, randomizationFunction, objectives) {
    var uniq = _.uniqWith(population, function (a, b) {
      return _.isEqual(a.evaluation, b.evaluation);
    });
    return _.concat(uniq, moea.method.ga.generateRandomPopulation(population.length - uniq.length, randomizationFunction, objectives));
  }

  function getGuiders(population, rate) {
    var axis = _.random(population[0].evaluation.length - 1);
    var ordered = _.orderBy(population, function (individual) {
      return individual.evaluation[axis];
    });
    var numberOfGuiders = Math.ceil(rate * population.length);
    var step = Math.floor(population.length / numberOfGuiders);
    var guiders = [];
    for (let i = 0; i < ordered.length; i += step) {
      guiders.push(ordered[i]);
    }
    return guiders;
  }

  function getMostEqual(population) {
    var dimensions = population[0].evaluation.length;

    _.forEach(population, function (ind) {
      ind.difscore = 0;
    });

    for (let i = 0; i < dimensions; i++) {
      let ord = _.orderBy(population, function (ind) {
        return ind.evaluation[i];
      });
      let maxdif = _.last(ord).evaluation[i] - ord[0].evaluation[i];
      if (maxdif === 0) continue;
      for (let j = 1; j < ord.length; j++) {
        ord[j].difscore += (ord[j].evaluation[i] - ord[j-1].evaluation[i]) / maxdif;
      }
    }

    return _.minBy(_.filter(population, 'difscore'), 'difscore');
  }

  function run(settings) {
    var MAX_TABLES = 5,
        tableIndex = 0,
        allPheromoneTables = createPheromoneTables(settings.objectives.length, settings.network.graph.size().vertices, 0.1, settings.beta),
        pheromoneTables = _.slice(allPheromoneTables, tableIndex, tableIndex + MAX_TABLES),
        allDominationTable = _.last(allPheromoneTables),
        builder = moea.method.manyAco.build,
        sampleSize = 10,
        betaMultiplier = 1.1,
        archiveConvergence = 0,
        mutationRate = 0,
        archiveConverged = 0;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneTables, settings.heuristicFunctions,
        settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
        mutationRate, settings.objectives);

      // population = filter(population, settings.randomize, settings.objectives);

      let prev = allDominationTable.archive;
      _.forEach(population, function (individual) {
        allDominationTable.archive = moea.help.pareto.updateNonDominatedSet(allDominationTable.archive, individual, 'evaluation');
      });
      let archiveDiff = {
        added: _.difference(allDominationTable.archive, prev),
        removed: _.difference(prev, allDominationTable.archive)
      };

      if (archiveDiff.added.length === 0) {
        archiveConverged++;
        // console.log('ARQUIVO CORVERGINDO... ' + tableIndex);
        // if (mutationRate < 0.2) mutationRate += 0.02;
        // archiveConvergence++;
        // mutationRate += 0.01;
        // if (mutationRate > 1) mutationRate = 0;
        // if (archiveConvergence === 5) {
          // mutationRate = 0;
          // archiveConvergence = 0;
          // _.forEach(allPheromoneTables, function (table) {
          //   for (let j = 0; j < table.values.length; j++) {
          //     for (let k = 0; k < table.values.length; k++) {
          //       table.values[j][k] = 0.1;
          //     }
          //   }
          // });
          // var me = getMostEqual(allDominationTable.archive);
          // _.forEach(allPheromoneTables, function (table) {
          //   removePheromonesAccordingToSolution(table.values, me, settings.pheromoneBounds.min);
          // });
          // _.forEach(pheromoneTables, function (table, index) {
          //   table.convergence = 0;
          //   pheromoneTables[index] = allPheromoneTables[tableIndex % allPheromoneTables.length];
          //   tableIndex++;
          // });
          // archive = _.uniqWith(moea.help.pareto.getNonDominatedSet(_.concat(archive, allDominationTable.archive), 'evaluation'), function (a,b) {return _.isEqual(a.evaluation, b.evaluation)});
          // allDominationTable.archive = getGuiders(allDominationTable.archive, 0.1);
          // allPheromoneTables = createPheromoneTables(settings.objectives.length, settings.network.graph.size().vertices, 0.1, 0);
          // tableIndex = 0;
          // pheromoneTables = _.slice(allPheromoneTables, tableIndex, tableIndex + MAX_TABLES);
          // diff = allDominationTable.archive;
          // diff = archive;
        // }
      }

      if (archiveDiff.added.length) {
        let diffs = updateArchives(archiveDiff, pheromoneTables);
        _.forEach(pheromoneTables, function (table, index) {
          if (diffs.added[index].length) {
            table.beta = settings.beta;
            table.multiplier = 1.1;
            depositPheromonesAccordingToSolutions(table.values, diffs.added[index], settings.evaporationRate, settings.pheromoneBounds.max, settings.weights);
            evaporatePheromonesAccordingToSolutions(table.values, diffs.removed[index], settings.evaporationRate, settings.pheromoneBounds.min, settings.weights);
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
      }
    }

    console.log('number of tables: ' + allPheromoneTables.length);
    console.log('last table analyzed: ' + tableIndex);
    console.log('archive converged ' + archiveConverged + ' times');
    console.log('max exploration array size: ' + window.maxExploreSize);
    return _.map(allDominationTable.archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.main.execute', run);
}());
