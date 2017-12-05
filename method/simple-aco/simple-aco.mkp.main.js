(function () {
  'use strict';

  function createPheromoneArray(size, initialValue) {
    return _.fill(new Array(size), initialValue);
  }

  function evaporate(pheromoneTable, evaporationRate, minValue, power) {
    var evaporationValue = (1 - evaporationRate) * power;
    for (let i = 0; i < pheromoneTable.length; i++) {
      pheromoneTable[i] *= evaporationValue;
      if (pheromoneTable[i] < minValue) pheromoneTable[i] = minValue;
    }
  }

  function updatePheromonesAccordingToSolution(pheromoneTable, individual, evaporationRate, pheromoneBounds, profitMatrix, weights, w) {
    evaporate(pheromoneTable, evaporationRate, pheromoneBounds.min, w);
    _.forEach(individual.path, function (itemAdded) {
      pheromoneTable[itemAdded] += profitMatrix[0][itemAdded]/weights[itemAdded] * evaporationRate * w;
      if (pheromoneTable[itemAdded] > pheromoneBounds.max) pheromoneTable[itemAdded] = pheromoneBounds.max;
    });
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
        mutated.fitness = settings.objective(mutated.solution);
        if (mutated.fitness < ind.fitness) {
          ind.solution = mutated.solution;
          ind.path = mutated.path;
          ind.fitness = mutated.fitness;
        }
      }
    });
  }

  function run(settings) {
    var pheromoneArray = createPheromoneArray(settings.weights.length, settings.initialPheromoneValue),
        builder = moea.method.simpleAco.build.mkp,
        betaMultiplier = 1.1,
        bests = [],
        numberOfBests = Math.floor(settings.populationSize * 0.1),
        best, bounds = _.clone(settings.pheromoneBounds),
        sampleSize = Math.ceil((settings.sampling || 1) * settings.weights.length);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneArray, settings.heuristicFunctions,
        settings.weights, settings.capacity, sampleSize, settings.alpha, settings.beta, settings.objective);

      mutate(population, 0.1, settings);

      let repetitions =  population.length - _.uniqBy(population, 'fitness').length;
      console.log(repetitions + ' soluções repetidas');

      let localBest = _.minBy(population, 'fitness');
      if (!best || localBest.fitness < best.fitness) {
        best = localBest;
        betaMultiplier = 1.1;
      }
      // let newBests = _.slice(_.orderBy(_.uniqBy(_.concat(bests, population), 'fitness'), 'fitness'), 0, numberOfBests);
      // if (_.differenceBy(newBests, bests, 'fitness').length) {
      //   bests = newBests;
      //   betaMultiplier = 1.1;
      // }
      // else {
      //   settings.beta *= betaMultiplier;
      //   betaMultiplier += 0.04;
      // }
      // _.forEach(bests, function (best, index) {
      //   updatePheromonesAccordingToSolution(pheromoneArray, best, settings.evaporationRate, bounds, settings.profitMatrix, settings.weights, index/numberOfBests);
      // });
      updatePheromonesAccordingToSolution(pheromoneArray, best, settings.evaporationRate, bounds, settings.profitMatrix, settings.weights, 1);
      // bounds.min = settings.pheromoneBounds.min + 0.5 * (repetitions / (population.length - 1));
    }

    return best;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.mkp.main.execute', run);
}());
