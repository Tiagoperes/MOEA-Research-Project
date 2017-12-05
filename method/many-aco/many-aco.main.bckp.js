(function () {
  'use strict';

  function createPheromoneTable(weights, size, initialPheromoneValue) {
    var table = {weights: weights, values: []};
    for (let i = 0; i < size; i++) {
      table.values[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return table;
  }

  function createPheromoneTables(numberOfObjectives, numberOfVertices, initialPheromoneValue) {
    var tables = [],
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= 2; i++) {
      // tables = _.concat(tables, _.map(_.sampleSize(_.allCombinations(objectives, i), 2), function (objectiveIndexes) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue);
      }));
    }

    return tables;
  }

  function createPheromoneTables2(numberOfObjectives, numberOfVertices, initialPheromoneValue) {
    var tables = [],
      objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      // tables = _.concat(tables, _.map(_.sampleSize(_.allCombinations(objectives, i), 2), function (objectiveIndexes) {
      tables.push(_.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue);
      }));
    }

    return tables;
  }

  function evaporate(pheromoneTable, evaporationRate, minValue, power) {
    var evaporationValue = Math.pow(1 - evaporationRate, power);
    for (let i = 0; i < pheromoneTable.length; i++) {
      for (let j = 0; j < pheromoneTable.length; j++) {
        pheromoneTable[i][j] *= evaporationValue;
        if (pheromoneTable[i][j] < minValue) pheromoneTable[i][j] = minValue;
      }
    }
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

  function applyWeightMaskToIndividual(individual, weights) {
    var result = [];
    for (let i = 0; i < weights.length; i++) {
      if (weights[i]) result.push(individual.evaluation[i]);
    }
    return result;
  }

  function updateArchives(archives, population, pheromoneTables) {
    var updated = false;
    var added = [];
    var removed = [];
    _.forEach(pheromoneTables, function (table, i) {
      archives[i] = archives[i] || [];
      var newArchive = archives[i];
      _.forEach(population, function (individual) {
        newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, individual, _.partial(applyWeightMaskToIndividual, _, table.weights));
      });
      if (newArchive !== archives[i]) {
        added[i] = _.difference(newArchive, archives[i]);
        removed[i] = _.difference(archives[i], newArchive);
        archives[i] = newArchive;
        updated = true;
      }
    });
    if (updated) return {added: added, removed: removed};
  }

  function filter(population, randomizationFunction, objectives) {
    var uniq = _.uniqWith(population, function (a, b) {
      return _.isEqual(a.evaluation, b.evaluation);
    });
    return _.concat(uniq, moea.method.ga.generateRandomPopulation(population.length - uniq.length, randomizationFunction, objectives));
  }

  function run(settings) {
    var allPheromoneTables = createPheromoneTables2(settings.objectives.length, settings.network.graph.size().vertices, 0.1),
        pheromoneTables = allPheromoneTables.shift(),
        builder = moea.method.manyAco.build,
        sampleSize = 200,
        betaMultiplier = 1.1,
        archives = [],
        archive = [],
        archiveConvergence = 0,
        mutationRate = 0;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      // moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneTables, settings.heuristicFunctions,
        settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
        settings.beta, mutationRate, settings.objectives);

      // population = filter(population, settings.randomize, settings.objectives);

      let prev = archive;
      _.forEach(population, function (individual) {
        archive = moea.help.pareto.updateNonDominatedSet(archive, individual, 'evaluation');
      });
      let diff = _.difference(archive, prev);
      if (diff.length === 0) {
        console.log('ARQUIVO CORVERGINDO... ' + allPheromoneTables.length);
        // if (mutationRate < 0.2) mutationRate += 0.02;
        archiveConvergence++;
        if (archiveConvergence === 5 && allPheromoneTables.length) {
          // mutationRate = 0;
          archiveConvergence = 0;
          pheromoneTables = allPheromoneTables.shift();
          archives = [];
          // diff = archive;
          betaMultiplier = 1.1;
          settings.beta = 1.9;
        }
      }
      // console.log(archive.length + ' : ' + diff.length);

      let diffs = updateArchives(archives, diff, pheromoneTables);
      if (diffs) {
        betaMultiplier = 1.1;
        settings.beta = 1.9;
        _.forEach(pheromoneTables, function (table, index) {
          depositPheromonesAccordingToSolutions(table.values, diffs.added[index], settings.evaporationRate, settings.pheromoneBounds.max, settings.weights);
          evaporatePheromonesAccordingToSolutions(table.values, diffs.removed[index], settings.evaporationRate, settings.pheromoneBounds.min, settings.weights);
        });
      }
      else {
        console.log('TABELAS DE FEROMONIOS CORVERGINDO...');
        // if (allPheromoneTables.length) {
        //   pheromoneTables = allPheromoneTables.shift();
        //   archives = [];
        //   updateArchives(archives, archive, pheromoneTables);
        // }
        settings.beta *= betaMultiplier;
        betaMultiplier += 0.1;
      }
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.main.execute', run);
}());
