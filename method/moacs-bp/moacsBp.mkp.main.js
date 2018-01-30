(function () {
  'use strict';

  function createPheromoneStructure(size, beta, initialPheromoneValue) {
    let array = _.fill(new Array(size), initialPheromoneValue);
    return {values: array, beta: beta};
  }

  function updateArchive(archive, population) {
    _.forEach(population, function (individual) {
      archive = moea.help.pareto.updateNonDominatedSet(archive, individual, 'evaluation');
    });
    return archive;
  }

  function getPheromoneInc(evaluation, min) {
    return _.reduce(evaluation, function (sum, value, index) {
      return sum + value / min[index];
    }, 0);
  }

  function getMinCoordinates(population) {
    let min = _.fill(new Array(population[0].evaluation.length), Infinity);
    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value < min[index]) min[index] = value;
      });
    });
    return min;
  }

  function updatePheromones(pheromones, archive, evaporationRate) {
    let min = getMinCoordinates(archive);
    _.forEach(archive, function (individual) {
      _.forEach(individual.solution, function (isItemPresent, index) {
        if (isItemPresent) {
          pheromones.values[index] *= 1 - evaporationRate;
          pheromones.values[index] += evaporationRate * getPheromoneInc(individual.evaluation, min);
        }
      });
    });
  }

  function run(settings) {
    let pheromones = createPheromoneStructure(settings.weights.length, settings.beta, settings.initialPheromoneValue),
        builder = moea.method.manyAco.build.mkp,
        sampleSize = 10,
        archive = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, [pheromones], settings.heuristicFunctions,
        settings.weights, settings.capacity, sampleSize, settings.alpha, settings.isElitist, settings.objectives);

      let updatedArchive = updateArchive(archive, population);
      if (archive === updatedArchive) {
        updatePheromones(pheromones, archive, settings.evaporationRate);
      } else {
        pheromones = createPheromoneStructure(settings.weights.length, settings.beta, settings.initialPheromoneValue);
        archive = updatedArchive;
      }
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moacsBp.mkp.main.execute', run);
}());
