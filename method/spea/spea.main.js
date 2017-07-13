(function () {
  'use strict';

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.value');
  }

  function spea(settings) {
    var ga = moea.method.ga,
        norm = moea.help.normalization,
        population = ga.generateRandomPopulation(settings.populationSize, settings.randomize, settings.objectives),
        evaluationProperty = 'evaluation',
        extremes = norm.initializeExtremes(settings.objectives.length),
        archive;

    if (settings.shouldNormalize) {
      norm.normalize(archive, population, extremes);
      evaluationProperty = 'normalizedEvaluation';
    }

    moea.method.spea.distance.calculateDistances(population, evaluationProperty);
    moea.method.spea.fitness.calculate(population, evaluationProperty);
    archive = moea.method.spea.selection.selectArchive(population, settings.archiveSize);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      ga.logGeneration(i, settings.numberOfGenerations);
      let parents = ga.selectParents(archive, settings.crossover.rate, tournament);
      population = ga.generateOffspring(parents, settings);
      if (settings.shouldNormalize) norm.normalize(archive, population, extremes);
      let everybody = _.concat(population, archive);
      moea.method.spea.distance.calculateDistances(everybody, evaluationProperty, settings.shouldUseSDE);
      moea.method.spea.fitness.calculate(everybody, evaluationProperty);
      archive = moea.method.spea.selection.selectArchive(everybody, settings.archiveSize);
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.spea.main.execute', spea);
}());
