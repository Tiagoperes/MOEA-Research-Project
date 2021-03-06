(function () {
  'use strict';

  var isLogActive = true;

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

  function selectParents(population, crossoverRate, selection) {
    var pairs = [],
        maxPairs = _.floor(crossoverRate * population.length);

    while (pairs.length < maxPairs) {
      let p1 = selection(population);
      let p2 = selection(population);
      if (p1 === p2) {
        p2 = selection(_.filter(population, function (ind) {return ind !== p1}));
      }
      pairs.push([p1, p2]);
    }

    return pairs;
  }

  function generateOffspring(parents, settings) {
    return _.flatten(_.map(parents, function (pair) {
      var children = settings.crossover.method(pair[0].solution, pair[1].solution);
      var mutated = _.map(children, _.partial(mutate, _, settings.mutation));
      var individuals = _.map(mutated, _.partial(createIndividual, _, settings.objectives));
      if (settings.useFilter) {
        individuals = randomizeIdenticalIndividuals(individuals, settings.randomize, settings.objectives);
      }
      return individuals;
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

  function getNumberOfGenerations(childrenPerGeneration, desiredNumberOfComparisons) {
    return Math.ceil(desiredNumberOfComparisons / childrenPerGeneration);
  }

  function logGeneration(generationIndex, numberOfGenerations) {
    var percent;
    if (isLogActive) {
      percent = Math.floor(generationIndex * 100 / numberOfGenerations);
      console.log((generationIndex + 1) + ' of ' + numberOfGenerations + ' generations (' + percent + '%)');
    }
  }

  function activateLog() {
    isLogActive = true;
  }

  function deactivateLog() {
    isLogActive = false;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.ga', {
    generateRandomPopulation: generateRandomPopulation,
    selectParents: selectParents,
    generateOffspring: generateOffspring,
    mutate: mutate,
    randomizeIdenticalIndividuals: randomizeIdenticalIndividuals,
    getNumberOfGenerations: getNumberOfGenerations,
    logGeneration: logGeneration,
    activateLog: activateLog,
    deactivateLog: deactivateLog
  });

}());
