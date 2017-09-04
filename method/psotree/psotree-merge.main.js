(function () {
  'use strict';

  function createParticles(settings, scalarize) {
    var neighborhood = moea.method.moead.neighborhood,
        weightVectors, population;

    weightVectors = neighborhood.generateUniformWeightVectors(settings.objectives.length, settings.divisions);
    population = moea.method.ga.generateRandomPopulation(weightVectors.length, settings.randomize, settings.objectives);

    return _.map(population, function (individual, index) {
      individual.fitness = scalarize(individual.evaluation, weightVectors[index]);
      return {
        weights: weightVectors[index],
        position: individual,
        localBest: {
          solution: individual.solution.clone(),
          evaluation: _.clone(individual.evaluation),
          fitness: individual.fitness
        }
      };
    });
  }

  function getBestWithWeights(population, weights, scalarize) {
    return _.minBy(population, function (individual) {
      return scalarize(individual.evaluation, weights);
    });
  }

  function updateParticle(particle, globalBest, objectives, combine, mutation, scalarize) {
    var globalSolution = getBestWithWeights(globalBest, particle.weights, scalarize).solution,
        mutate = moea.method.ga.mutate;

    particle.position.solution = mutate(combine(particle.position.solution, particle.localBest.solution, globalSolution), mutation);
    particle.position.evaluation = moea.help.pareto.getSolutionInObjectiveSpace(particle.position.solution, objectives);
    particle.position.fitness = scalarize(particle.position.evaluation, particle.weights);
    if (particle.position.fitness < particle.localBest.fitness) {
      particle.localBest = {
        solution: particle.position.solution.clone(),
        evaluation: _.clone(particle.position.evaluation),
        fitness: particle.position.fitness
      };
    }
  }

  function psotree(settings) {
    var ga = moea.method.ga,
        scalarize = moea.method.moead.scalarization.scalarizeWS,
        population = createParticles(settings, scalarize),
        ngens = ga.getNumberOfGenerations(population.length, settings.comparisons),
        globalBest = moea.help.pareto.getNonDominatedSet(_.map(population, 'position'), 'evaluation');

    for (let i = 0; i < ngens; i++) {
      ga.logGeneration(i, ngens);
      _.forEach(population, function (particle) {
        updateParticle(particle, globalBest, settings.objectives, settings.combine, settings.mutation, scalarize);
        globalBest = moea.help.pareto.updateNonDominatedSet(globalBest, particle.position, 'evaluation');
      });
    }

    return _.map(globalBest, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.psotree.main.execute', psotree);
}());
