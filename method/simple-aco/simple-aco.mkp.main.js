(function () {
  'use strict';

  function createPheromoneArray(size, initialValue) {
    return _.fill(new Array(size), initialValue);
  }

  function evaporate(pheromoneTable, evaporationRate, minValue, power) {
    var evaporationValue = Math.pow(1 - evaporationRate, power);
    for (let i = 0; i < pheromoneTable.length; i++) {
      pheromoneTable[i] *= evaporationValue;
      if (pheromoneTable[i] < minValue) pheromoneTable[i] = minValue;
    }
  }

  function updatePheromonesAccordingToSolution(pheromoneTable, individual, evaporationRate, pheromoneBounds, profitMatrix, weights) {
    evaporate(pheromoneTable, evaporationRate, pheromoneBounds.min, 1);
    _.forEach(individual.path, function (itemAdded) {
      pheromoneTable[itemAdded] += profitMatrix[0][itemAdded]/weights[itemAdded] * evaporationRate;
      if (pheromoneTable[itemAdded] > pheromoneBounds.max) pheromoneTable[itemAdded] = pheromoneBounds.max;
    });
  }

  function run(settings) {
    var pheromoneArray = createPheromoneArray(settings.weights.length, settings.initialPheromoneValue),
        builder = moea.method.simpleAco.build.mkp,
        betaMultiplier = 1.1,
        best, worst, bounds = _.clone(settings.pheromoneBounds);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneArray, settings.heuristicFunctions,
        settings.weights, settings.capacity, settings.alpha, settings.beta, settings.objective);

      let repetitions =  population.length - _.uniqBy(population, 'fitness').length;
      console.log(repetitions + ' soluções repetidas');

      let localBest = _.minBy(population, 'fitness');
      let localWorst = _.maxBy(population, 'fitness');
      if (!best || localBest.fitness < best.fitness) {
        best = localBest;
        betaMultiplier = 1.1;
      }
      else {
        settings.beta *= betaMultiplier;
        betaMultiplier += 0.04;
      }
      if (!worst || localWorst.fitness > worst.fitness) worst = localWorst;
      updatePheromonesAccordingToSolution(pheromoneArray, best, settings.evaporationRate, bounds, settings.profitMatrix, settings.weights);
      // bounds.min = settings.pheromoneBounds.min + 0.5 * (repetitions / (population.length - 1));
      // if (repetitions === population.length - 1) settings.beta = 0;
    }

    return best;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.mkp.main.execute', run);
}());
