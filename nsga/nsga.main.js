(function () {
  'use strict';

  function createIndividual(solution, objectives) {
    return {
      solution: solution,
      evaluation: moea.help.pareto.getSolutionInObjectiveSpace(solution, objectives)
    }
  }

  function generateRandomPopulation(populationSize, randomizationFunction, objectives) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(createIndividual(randomizationFunction(), objectives));
    }
    return population;
  }

  function calculateDistances(fronts) {
    _.forEach(fronts, _.partial(moea.nsga.crowding.calculateDistances));
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

  function generateOffspring(parents, crossoverMethod, mutation, objectives) {
    return _.flatten(_.map(parents, function (pair) {
      var children = crossoverMethod(pair[0].solution, pair[1].solution);
      var mutated = _.map(children, _.partial(mutate, _, mutation));
      return _.map(mutated, _.partial(createIndividual, _, objectives));
    }));
  }

  function mutate(solution, mutation) {
    var rand = _.random(1, true);
    if (rand <= mutation.rate) {
      return mutation.method(solution);
    }
    return solution;
  }

  function naturalSelection(fronts, maxPopulationSize) {
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

  function randomizeIdenticalIndividuals(population, randomize, objectives) {
    var newPop = _.uniqWith(population, 'evaluation');
    for (let i = newPop.length; i < population.length; i++) {
      newPop.push(createIndividual(randomize()), objectives)
    }
    return newPop;
  }

  function nsga(settings) {
    var population = generateRandomPopulation(settings.populationSize, settings.randomize, settings.objectives);
    var fronts = moea.nsga.ranking.rank(population, 'evaluation');

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      let parents = selectParents(population, settings.crossover.rate);
      let children = generateOffspring(parents, settings.crossover.method, settings.mutation, settings.objectives);
      population = _.concat(population, children);
      if (settings.useFilter) {
        population = randomizeIdenticalIndividuals(population, settings.randomize, settings.objectives);
      }
      fronts = moea.nsga.ranking.rank(population, 'evaluation');
      calculateDistances(fronts);
      population = naturalSelection(fronts, settings.populationSize);
    }

    return _.map(fronts[0], 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.main.execute', nsga);
}());
