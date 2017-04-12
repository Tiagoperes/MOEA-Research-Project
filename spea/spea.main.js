(function () {
  'use strict';

  function spea(settings) {
    var population = generateRandomPopulation(settings.populationSize, settings.randomize),
        distanceMatrix = moea.spea.distance.calculateDistanceMatrix(population, settings.objectives),
        archive;

    moea.spea.fitness.calculate(population, settings.objectives, distanceMatrix);
    archive = moea.spea.selection.selectArchive(population, settings.archiveSize);
    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      let parents = selectParents(archive, settings.crossover.rate, settings.populationSize);
      population = generateOffspring(parents, settings.crossover.method, settings.mutation);
      let everybody = _.concat(population, archive);
      distanceMatrix = moea.spea.distance.calculateDistanceMatrix(everybody, settings.objectives);
      moea.spea.fitness.calculate(everybody, settings.objectives, distanceMatrix);
      archive = moea.spea.selection.selectArchive(everybody, settings.archiveSize, distanceMatrix);
    }

    return archive;
  }

  function generateRandomPopulation(populationSize, randomizationFunction) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(randomizationFunction());
    }
    return population;
  }

  function selectParents(population, crossoverRate, maximumPopulationSize) {
    var pairs = [],
        maxPairs = _.floor(crossoverRate * maximumPopulationSize);
    while (pairs.length < maxPairs) {
      pairs.push([tournament(population), tournament(population)]);
    }
    return pairs;
  }

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.value');
  }

  function generateOffspring(parents, crossoverMethod, mutation) {
    return _.flatten(_.map(parents, function (pair) {
      var children = crossoverMethod(pair[0], pair[1]);
      return _.map(children, _.partial(mutate, _, mutation));
    }));
  }

  function mutate(solution, mutation) {
    var rand = _.random(1, true);
    if (rand <= mutation.rate) {
      return mutation.method(solution);
    }
    return solution;
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.main.execute', spea);
}());
