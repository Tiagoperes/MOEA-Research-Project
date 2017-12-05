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

    for (let i = 2; i <= numberOfObjectives; i++) {
      // tables = _.concat(tables, _.map(_.sampleSize(_.allCombinations(objectives, i), 2), function (objectiveIndexes) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
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

  function updatePheromonesAccordingToSolutions(pheromones, population, evaporationRate, pheromoneBounds, weights) {
    evaporate(pheromones, evaporationRate, pheromoneBounds.min, 1);
    _.forEach(population, function (individual) {
      _.forEach(individual.solution.getVertices(), function (v) {
        _.forEach(individual.solution.getEdges(v), function (e) {
          pheromones[v][e] *= 1 - evaporationRate;
          if (pheromones[v][e] < pheromoneBounds.min) pheromones[v][e] = pheromoneBounds.min;
          pheromones[v][e] += (1 - getWeightsMean(weights, v, e)) * evaporationRate;
          if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
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
    _.forEach(population, function (individual) {
      _.forEach(pheromoneTables, function (table, i) {
        archives[i] = archives[i] || [];
        var newArchive = moea.help.pareto.updateNonDominatedSet(archives[i], individual, _.partial(applyWeightMaskToIndividual, _, table.weights));
        if (newArchive !== archives[i]) {
          archives[i] = newArchive;
          updated = true;
        }
      });
    });
    return updated;
  }

  function run(settings) {
    var pheromoneTables = createPheromoneTables(settings.objectives.length, settings.network.graph.size().vertices, settings.initialPheromoneValue),
        builder = moea.method.multiAco.build,
        sampleSize = 200,
        betaMultiplier = 1.1,
        archives = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneTables, settings.heuristicFunctions,
        settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
        settings.beta, settings.objectives);

      let hasUpdated = updateArchives(archives, population, pheromoneTables);
      // if (hasUpdated) {
      //   betaMultiplier = 1.01;
      //   // settings.beta = 1.9;
      // }
      // else {
      //   // console.log('not updated');
      //   settings.beta *= betaMultiplier;
      //   betaMultiplier += 0.1;
      // }
      _.forEach(pheromoneTables, function (table, index) {
        updatePheromonesAccordingToSolutions(table.values, archives[index], settings.evaporationRate, settings.pheromoneBounds, settings.weights);
      });
    }

    return _.map(_.last(archives), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.multiAco.main.execute', run);
}());
