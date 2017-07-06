(function () {
  'use strict';

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.rank');
  }

  function nsgaGeneral(settings, select) {
    var ga = moea.method.ga,
        population = ga.generateRandomPopulation(settings.populationSize, settings.randomize, settings.objectives),
        fronts = moea.method.nsga.ranking.rank(population, 'evaluation');

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      ga.logGeneration(i, settings.numberOfGenerations);
      let parents = ga.selectParents(population, settings.crossover.rate, tournament);
      let children = ga.generateOffspring(parents, settings);
      population = _.concat(population, children);
      fronts = moea.method.nsga.ranking.rank(population, 'evaluation');
      population = select(fronts, settings.populationSize);
    }

    return _.map(fronts[0], 'solution');
  }

  function nsga2(settings) {
    return nsgaGeneral(settings, moea.method.nsga.selection.crowding.select);
  }

  function nsga3(settings) {
    var select = _.partial(moea.method.nsga.selection.referencePoint.select, _, _, settings.numberOfMeanPoints);
    return nsgaGeneral(settings, select);
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.nsga.main.execute', nsga2);
  _.set(moea, 'method.nsga3.main.execute', nsga3);
}());
