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

  function calculateFitness(cells, scalarize) {
    _.forEach(cells, function (cell) {
      cell.fitness = scalarize(cell.evaluation, cell.weights);
    });
  }

  function updateNeighborhood(neighborhood, child, scalarize) {
    _.forEach(neighborhood, function (cell) {
      var childFitness = scalarize(child.evaluation, cell.weights);
      if (childFitness <= cell.fitness) {
        cell.solution = child.solution;
        cell.evaluation = child.evaluation;
        cell.fitness = childFitness;
        return false;
      }
    });
  }



  function moead(settings) {
    var ga = moea.method.ga,
        cells = generateCells(settings),
        ngens = settings.isRandomWeights ? settings.numberOfGenerations : ga.getNumberOfGenerations(cells.length, settings.comparisons),
        scalarize = moea.method.moead.scalarization.scalarizeWS,
        archive = [];

    moea.method.moead.neighborhood.createNeighborhoods(cells, settings.neighborhoodSize);
    calculateFitness(cells, scalarize);

    for (let i = 0; i < ngens; i++) {
      ga.logGeneration(i, ngens);
      _.forEach(cells, function (cell) {
        let parents = _.sampleSize(cell.neighborhood, 2);
        let child = _.sample(ga.generateOffspring([parents], settings));
        updateNeighborhood(cell.neighborhood, child, scalarize);
        archive = moea.help.pareto.updateNonDominatedSet(archive, child, 'evaluation');
      });
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moead.main.execute', moead);
}());
