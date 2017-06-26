(function () {
  'use strict';

  function generateCells(divisions, randomize, objectives) {
    var weightVectors = moea.moead.neighborhood.generateVectors(numberOfObjectives, divisions),
        population = moea.ga.generateRandomPopulation(weightVectors.length, randomize, objectives);

    return _.map(population, function (individual, index) {
      individual.weights = weightVectors[index];
    });
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
    var cells = generateCells(settings.objectives.length, settings.divisions, settings.randomize),
        scalarize = moea.moead.scalarization.scalarizeWS,
        archive = [];

    moea.moead.neighborhood.createNeighborhoods(cells, settings.neighborhoodSize);
    calculateFitness(cells, scalarize);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      _.forEach(cells, function (cell) {
        let parents = _.map(_.sampleSize(cell.neighborhood, 2), 'solution');
        let child = _.sample(ga.generateOffspring([parents], settings));
        updateNeighborhood(cell.neighborhood, child, scalarize);
        archive = moea.help.pareto.updateNonDominatedSet(archive, child, 'evaluation');
      });
    }

    return archive;
  }

  window.moea = window.moea || {};
  _.set(moea, 'moead.main.execute', moead);
}());
