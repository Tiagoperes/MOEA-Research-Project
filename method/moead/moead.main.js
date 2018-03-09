(function () {
  'use strict';

  function generateCells(settings) {
    var neighborhood = moea.method.moead.neighborhood,
        weightVectors, population;

    if (settings.isRandomWeights) {
      weightVectors = neighborhood.generateRandomWeightVectors(settings.objectives.length, settings.populationSize);
    } else {
      weightVectors = neighborhood.generateUniformWeightVectors(settings.objectives.length, settings.divisions);
    }

    population = moea.method.ga.generateRandomPopulation(weightVectors.length, settings.randomize, settings.objectives);

    _.forEach(population, function (individual, index) {
      individual.weights = weightVectors[index];
    });

    return population;
  }

  function calculateFitness(cells, scalarize, property) {
    _.forEach(cells, function (cell) {
      cell.fitness = scalarize(cell[property], cell.weights);
    });
  }

  function updateNeighborhood(neighborhood, child, scalarize, property) {
    _.forEach(neighborhood, function (cell) {
      var childFitness = scalarize(child[property], cell.weights);
      if (childFitness <= cell.fitness) {
        cell.solution = child.solution;
        cell.evaluation = child.evaluation;
        if (cell.normalizedEvaluation) cell.normalizedEvaluation = child.normalizedEvaluation;
        cell.fitness = childFitness;
        return false;
      }
    });
  }



  // function moead(settings) {
  //   var ga = moea.method.ga,
  //       cells = generateCells(settings),
  //       ngens = settings.isRandomWeights ? settings.numberOfGenerations : ga.getNumberOfGenerations(cells.length, settings.comparisons),
  //       scalarize = moea.method.moead.scalarization.scalarizeWS,
  //       archive = [],
  //       extremes = moea.help.normalization.initializeExtremes(settings.objectives.length),
  //       evaluationProperty = 'evaluation';
  //
  //   if (settings.shouldNormalize) {
  //     moea.help.normalization.normalize([], cells, extremes);
  //     evaluationProperty = 'normalizedEvaluation';
  //   }
  //
  //   moea.method.moead.neighborhood.createNeighborhoods(cells, settings.neighborhoodSize);
  //   calculateFitness(cells, scalarize, evaluationProperty);
  //
  //   for (let i = 0; i < ngens; i++) {
  //     ga.logGeneration(i, ngens);
  //     _.forEach(cells, function (cell) {
  //       let parents = _.sampleSize(cell.neighborhood, 2);
  //       let child = _.sample(ga.generateOffspring([parents], settings));
  //       if (settings.shouldNormalize) {
  //         moea.help.normalization.normalize([], [child], extremes);
  //       }
  //       updateNeighborhood(cell.neighborhood, child, scalarize, evaluationProperty);
  //       archive = moea.help.pareto.updateNonDominatedSet(archive, child, 'evaluation');
  //     });
  //   }
  //
  //   return _.map(archive, 'solution');
  // }

  function moead(settings) {
    var ga = moea.method.ga,
      cells = generateCells(settings),
      ngens = settings.isRandomWeights ? settings.numberOfGenerations : ga.getNumberOfGenerations(cells.length, settings.comparisons),
      scalarize = moea.method.moead.scalarization.scalarizeWS,
      archive = [],
      extremes = moea.help.normalization.initializeExtremes(settings.objectives.length),
      evaluationProperty = 'evaluation';

    if (settings.shouldNormalize) {
      moea.help.normalization.normalize([], cells, extremes);
      evaluationProperty = 'normalizedEvaluation';
    }

    moea.method.moead.neighborhood.createNeighborhoods(cells, settings.neighborhoodSize);
    calculateFitness(cells, scalarize, evaluationProperty);

    for (let i = 0; i < ngens; i++) {
      ga.logGeneration(i, ngens);

      let children = _.map(cells, function (cell) {
        let parents = _.sampleSize(cell.neighborhood, 2);
        return _.sample(ga.generateOffspring([parents], settings));
      });

      if (settings.shouldNormalize) {
        moea.help.normalization.normalize(cells, children, extremes);
      }

      _.forEach(children, function (child, index) {
        archive = moea.help.pareto.updateNonDominatedSet(archive, child, 'evaluation');
        updateNeighborhood(cells[index].neighborhood, child, scalarize, evaluationProperty);
      });
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moead.main.execute', moead);
}());
