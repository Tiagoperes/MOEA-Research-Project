(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates;

  function initializeFitness(population) {
    _.forEach(population, function (individual) {
      individual.fitness = {
        strength: 0,
        raw: 0,
        dominatedByArray: []
      };
    });
  }

  function calculateDomination(population, property) {
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        if (dominates(population[i], population[j], property)) {
          population[i].fitness.strength++;
          population[j].fitness.dominatedByArray.push(i);
        } else if (dominates(population[j], population[i], property)) {
          population[i].fitness.dominatedByArray.push(j);
          population[j].fitness.strength++;
        }
      }
    }
  }

  function calculateRawFitness(population) {
    _.forEach(population, function (individual) {
      _.forEach(individual.fitness.dominatedByArray, function (index) {
        individual.fitness.raw += population[index].fitness.strength;
      });
    });
  }

  function calculateDensity(individual) {
    var k = Math.round(Math.sqrt(individual.nearestNeighbors.length));
    return 1 / (individual.nearestNeighbors[k].distance + 2);
  }

  function calculateOverallFitnessValues(population) {
    _.forEach(population, function (individual) {
      var density = calculateDensity(individual);
      individual.fitness.value = individual.fitness.raw + density;
    });
  }

  function calculateFitness(population, property) {
    initializeFitness(population);
    calculateDomination(population, property);
    calculateRawFitness(population);
    calculateOverallFitnessValues(population);
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.fitness.calculate', calculateFitness);
}());
