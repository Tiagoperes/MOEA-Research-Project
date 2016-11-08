(function () {
  'use strict';

  function nsga(settings) {
    var population = generateRandomPopulation(settings.populationSize, settings.randomize);
    var fronts = moea.nsga.ranking.rank(population, settings.objectives);
    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      let parents = selectParents(population, settings.crossover.rate);
      let children = generateOffspring(parents, settings.crossover.method, settings.mutation);
      population = _.concat(population, children);
      fronts = moea.nsga.ranking.rank(population, settings.objectives);
      calculateDistances(fronts, settings.objectives);
      population = naturalSelection(fronts, settings.populationSize, settings.objectives);
    }
    return population;
  }

  function generateRandomPopulation(populationSize, randomizationFunction) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(randomizationFunction());
    }
    return population;
  }

  function calculateDistances(fronts, objectives) {
    var calculate = moea.nsga.crowding.calculateDistances;
    _.forEach(fronts, _.partial(calculate, _, objectives));
  }

  function selectParents(population, crossoverRate) {
    var pairs = [],
        maxPairs = _.floor(crossoverRate * population.length);
    while (pairs.length < maxPairs) {
      pairs.push([tournament(population), tournament(population)]);
    }
    return pairs;
  }

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.rank');
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

  function naturalSelection(fronts, maxPopulationSize, objectives) {
    var population = [];
    while (population.length < maxPopulationSize) {
      let front = _.head(fronts);
      if (population.length + front.length <= maxPopulationSize) {
        population = _.concat(population, front);
        fronts = _.tail(fronts);
      } else {
        let frontOrderedByDistance = _.orderBy(front, 'fitness.distance', 'desc');
        population = _.concat(population, _.take(frontOrderedByDistance, maxPopulationSize - population.length));
      }
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.main.execute', nsga);
}());
