(function () {
  'use strict';

  function getMostCrowdedRegions(regions) {
    var maxPopulation = _.maxBy(regions, 'population.length').population.length;
    return _.filter(regions, function (region) {
      return region.population.length === maxPopulation;
    });
  }

  function removeIndividual(individual, population, fronts) {
    var indexToRemoveRegion = individual.region.population.indexOf(individual),
        indexToRemoveFront = individual.front.indexOf(individual),
        indexToRemovePopulation = population.indexOf(individual);

    individual.region.population.splice(indexToRemoveRegion, 1);
    individual.front.splice(indexToRemoveFront, 1);
    if (individual.front.length === 0) {
      _.remove(fronts, _.isEmpty);
    }
    population.splice(indexToRemovePopulation, 1);
    return individual;
  }

  function removeFromMostCrowdedRegion(population, regions, fronts) {
    let crowded = getMostCrowdedRegions(regions);
    let worstRegion = _.maxBy(crowded, function (r) {return _.sum(_.map(r.population, 'scalarizedFitness'))});
    if (worstRegion.population.length > 1) {
      let worstIndividual = _.maxBy(worstRegion.population, 'scalarizedFitness');
      return removeIndividual(worstIndividual, population, fronts);
    }
  }

  function tryToRemoveIndividual(individual, population, regions, fronts) {
    if (individual.region.population.length > 1) {
      return removeIndividual(individual, population, fronts);
    }
    return removeFromMostCrowdedRegion(population, regions, fronts);
  }

  function tryToRemoveFromFront(front, population, regions, fronts) {
    if (front.length === 1) {
      return tryToRemoveIndividual(front[0], population, regions, fronts);
    }
    let lastFrontRegions = _.map(front, 'region');
    if (!removeFromMostCrowdedRegion(population, lastFrontRegions, fronts)) {
      removeFromMostCrowdedRegion(population, regions, fronts);
    }
  }

  function select(population, regions, fronts, numberOfElementsToRemove) {
    while (numberOfElementsToRemove > 0) {
      tryToRemoveFromFront(_.last(fronts), population, regions, fronts);
      numberOfElementsToRemove--;
    }
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moeadd.selection.select', select);
}());
