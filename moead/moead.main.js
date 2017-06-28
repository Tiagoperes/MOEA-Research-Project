(function () {
  'use strict';

  function generateCells(divisions, randomize, objectives) {
    var weightVectors = moea.moead.neighborhood.generateWeightVectors(objectives.length, divisions),
        population = moea.ga.generateRandomPopulation(weightVectors.length, randomize, objectives);

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
    var ga = moea.ga,
        cells = generateCells(settings.divisions, settings.randomize, settings.objectives),
        ngens = settings.numberOfGenerations || ga.getNumberOfGenerations(cells.length, settings.comparisons),
        scalarize = moea.moead.scalarization.scalarizeWS,
        archive = [];

    moea.moead.neighborhood.createNeighborhoods(cells, settings.neighborhoodSize);
    calculateFitness(cells, scalarize);
    console.log('population size: ' + cells.length);

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
  _.set(moea, 'moead.main.execute', moead);
}());
