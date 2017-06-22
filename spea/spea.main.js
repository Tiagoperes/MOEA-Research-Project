(function () {
  'use strict';

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.value');
  }

  function initializeExtremes(numberOfObjectives) {
    return {
      min: _.fill(new Array(numberOfObjectives), Infinity),
      max: _.fill(new Array(numberOfObjectives), -Infinity)
    };
  }

  function calculateExtremesDif(extremes) {
    extremes.dif = _.map(_.subtractArrays(extremes.max, extremes.min), function (value) {
      if (value === 0) return value + 0.001;
      return value;
    });
  }

  function updateExtremes(population, extremes) {
    var updated = false;
    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value < extremes.min[index]) {
          extremes.min[index] = value;
          updated = true;
        }
        if (value > extremes.max[index]) {
          extremes.max[index] = value;
          updated = true;
        }
      });
    });

    if (updated) calculateExtremesDif(extremes);

    return updated;
  }

  function calculateNormalizedValues(population, extremes) {
    _.forEach(population, function (individual) {
      var difToMin = _.subtractArrays(individual.evaluation, extremes.min);
      individual.normalizedEvaluation = _.divideArrays(difToMin, extremes.dif);
    });
  }

  function normalize(oldPopulation, newPopulation, extremes) {
    var extremesUpdated = updateExtremes(newPopulation, extremes);
    if (extremesUpdated) {
      calculateNormalizedValues(oldPopulation, extremes);
    }
    calculateNormalizedValues(newPopulation, extremes);
  }

  function spea(settings) {
    var ga = moea.ga,
        population = ga.generateRandomPopulation(settings.populationSize, settings.randomize, settings.objectives),
        evaluationProperty = 'evaluation',
        extremes = initializeExtremes(settings.objectives.length),
        archive;

    if (settings.normalize) {
      normalize(archive, population, extremes);
      evaluationProperty = 'normalizedEvaluation';
    }

    moea.spea.distance.calculateDistances(population, evaluationProperty);
    moea.spea.fitness.calculate(population, evaluationProperty);
    archive = moea.spea.selection.selectArchive(population, settings.archiveSize);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      let parents = ga.selectParents(archive, settings.crossover.rate, tournament);
      population = ga.generateOffspring(parents, settings);
      if (settings.normalize) normalize(archive, population, extremes);
      let everybody = _.concat(population, archive);
      moea.spea.distance.calculateDistances(everybody, evaluationProperty);
      moea.spea.fitness.calculate(everybody, evaluationProperty);
      archive = moea.spea.selection.selectArchive(everybody, settings.archiveSize);
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.main.execute', spea);
}());
