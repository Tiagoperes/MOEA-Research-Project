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

  function randomizeIdenticalIndividuals(population, randomize, objectives) {
    var newPop = _.uniqWith(population, 'evaluation');
    for (let i = newPop.length; i < population.length; i++) {
      newPop.push(createIndividual(randomize()), objectives)
    }
    return newPop;
  }

  function nsgaGeneral(settings, select) {
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
      population = select(fronts, settings.populationSize);
    }

    return _.map(fronts[0], 'solution');
  }

  function nsga2(settings) {
    return nsgaGeneral(settings, moea.nsga.selection.crowding.select);
  }

  function nsga3(settings) {
    var select = _.partial(moea.nsga.selection.referencePoint.select, _, _, settings.numberOfMeanPoints);
    return nsgaGeneral(settings, select);
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.main.execute', nsga2);
  _.set(moea, 'nsga3.main.execute', nsga3);
}());
