(function () {
  'use strict';

  function createPheromoneTable(size, initialValue) {
    var table = new Array(size);
    for (let i = 0; i < size; i++) {
      table[i] = _.fill(new Array(size), initialValue);
    }
    return table;
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

  function updatePheromones(pheromoneTable, population, min, max, evaporationRate, pheromoneBounds) {
    var dif = max - min;
    evaporate(pheromoneTable, evaporationRate, pheromoneBounds.min, 1);
    _.forEach(population, function (individual) {
      var normalizedFitness = (individual.fitness - min) / dif;
      var deposit = (1 - normalizedFitness) * evaporationRate;
      _.forEach(individual.solution.getVertices(), function (v) {
        _.forEach(individual.solution.getEdges(v), function (e) {
          pheromoneTable[v][e] *= 1 - evaporationRate;
          pheromoneTable[v][e] += deposit;
          if (pheromoneTable[v][e] > pheromoneBounds.max) pheromoneTable[v][e] = pheromoneBounds.max;
        });
      });
    });
  }

  function updatePheromonesAccordingToSolution(pheromoneTable, individual, evaporationRate, pheromoneBounds, weights) {
    evaporate(pheromoneTable, evaporationRate, pheromoneBounds.min, 1);
    _.forEach(individual.solution.getVertices(), function (v) {
      _.forEach(individual.solution.getEdges(v), function (e) {
        pheromoneTable[v][e] += (1 - weights[v][e]) * evaporationRate;
        if (pheromoneTable[v][e] > pheromoneBounds.max) pheromoneTable[v][e] = pheromoneBounds.max;
      });
    });
  }

  function run(settings) {
    var pheromoneTable = createPheromoneTable(settings.network.graph.size().vertices, settings.initialPheromoneValue),
        builder = moea.method.simpleAco.build,
        // builder = moea.method.simpleAco.build.mparents,
        // builder = moea.method.simpleAco.build.broader,
        // builder = moea.method.simpleAco.build.inverse,
        // builder = moea.method.simpleAco.build.mants,
        // builder = moea.method.simpleAco.build.sant,
        sampleSize = 2000,
        // test = 10,
        betaMultiplier = 1.1,
        best, worst;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      // if (!test) {
      //   console.log('reset');
      //   // pheromoneTable = createPheromoneTable(settings.network.graph.size().vertices, settings.initialPheromoneValue);
      //   test = 10;
      //   settings.beta *= reset;
      //   reset += 0.1;
      // }
      let population = builder.buildSolutions(settings.populationSize, pheromoneTable, settings.heuristicFunctions,
        settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
        settings.beta, settings.objective);
      let localBest = _.minBy(population, 'fitness');
      let localWorst = _.maxBy(population, 'fitness');
      if (!best || localBest.fitness < best.fitness) {
        best = localBest;
        betaMultiplier = 1.1;
      }
      else {
        // test--;
        settings.beta *= betaMultiplier;
        betaMultiplier += 0.04;
      }
      if (!worst || localWorst.fitness > worst.fitness) worst = localWorst;
      // updatePheromones(pheromoneTable, population, best.fitness, worst.fitness, settings.evaporationRate, settings.pheromoneBounds);
      updatePheromonesAccordingToSolution(pheromoneTable, best, settings.evaporationRate, settings.pheromoneBounds, settings.weights);
    }

    return best;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.main.execute', run);
}());
