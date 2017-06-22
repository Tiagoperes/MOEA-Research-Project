(function () {
  'use strict';

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.rank');
  }

  function nsgaGeneral(settings, select) {
    var ga = moea.ga,
        population = ga.generateRandomPopulation(settings.populationSize, settings.randomize, settings.objectives),
        fronts = moea.nsga.ranking.rank(population, 'evaluation');

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      let parents = ga.selectParents(population, settings.crossover.rate, tournament);
      let children = ga.generateOffspring(parents, settings);
      population = _.concat(population, children);
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
