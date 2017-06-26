(function () {
  'use strict';

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.value');
  }

  function spea(settings) {
    var ga = moea.ga,
        norm = moea.help.normalization,
        population = ga.generateRandomPopulation(settings.populationSize, settings.randomize, settings.objectives),
        evaluationProperty = 'evaluation',
        extremes = norm.initializeExtremes(settings.objectives.length),
        archive;

    if (settings.shouldNormalize) {
      norm.normalize(archive, population, extremes);
      evaluationProperty = 'normalizedEvaluation';
    }

    moea.spea.distance.calculateDistances(population, evaluationProperty);
    moea.spea.fitness.calculate(population, evaluationProperty);
    archive = moea.spea.selection.selectArchive(population, settings.archiveSize);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      let parents = ga.selectParents(archive, settings.crossover.rate, tournament);
      population = ga.generateOffspring(parents, settings);
      if (settings.shouldNormalize) norm.normalize(archive, population, extremes);
      let everybody = _.concat(population, archive);
      moea.spea.distance.calculateDistances(everybody, evaluationProperty, settings.shouldUseSDE);
      moea.spea.fitness.calculate(everybody, evaluationProperty);
      archive = moea.spea.selection.selectArchive(everybody, settings.archiveSize);
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.main.execute', spea);
}());
