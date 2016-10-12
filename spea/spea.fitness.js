(function () {
  'use strict';

  function dominates(p, q, objectives) {
    var better = false,
        worse = false,
        i = 0;

    while (!worse && i < objectives.length) {
      let pValue = objectives[i](p);
      let qValue = objectives[i](q);
      if (pValue < qValue) better = true;
      if (pValue > qValue) worse = true;
      i++;
    }

    return better && !worse;
  }

  function initializeFitness(population) {
    _.forEach(population, function (individual) {
      individual.fitness = {
        strength: 0,
        raw: 0,
        dominatedByArray: []
      };
    });
  }

  function calculateDomination(population, objectives) {
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        if (dominates(population[i], population[j], objectives)) {
          population[i].fitness.strength++;
          population[j].fitness.dominatedByArray.push(i);
        } else if (dominates(population[j], population[i], objectives)) {
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

  function calculateDensity(distancesToNeighbors) {
    var k = Math.round(Math.sqrt(distancesToNeighbors.length));
    return 1 / (distancesToNeighbors[k] + 2);
  }

  function calculateOverallFitnessValues(population, distanceMatrix) {
    _.forEach(population, function (individual) {
      var distanceToNeighbors = distanceMatrix[individual.distanceMatrixKey],
          density = calculateDensity(distanceToNeighbors);
      individual.fitness.value = individual.fitness.raw + density;
    });
  }

  function calculateFitness(population, objectives, distanceMatrix) {
    initializeFitness(population);
    calculateDomination(population, objectives);
    calculateRawFitness(population);
    calculateOverallFitnessValues(population, distanceMatrix);
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.fitness.calculate', calculateFitness);
}());
