(function () {
  'use strict';

  function createPheromoneStructure(size, beta, initialPheromoneValue) {
    let matrix = [];
    for (let i = 0; i < size; i++) {
      matrix.push(_.fill(new Array(size), initialPheromoneValue));
    }
    return {values: matrix, beta: beta};
  }

  function updateArchive(archive, population) {
    _.forEach(population, function (individual) {
      archive = moea.help.pareto.updateNonDominatedSet(archive, individual, 'evaluation');
    });
    return archive;
  }

  function getPheromoneInc(evaluation, max) {
    return 1 / _.reduce(evaluation, function (sum, value, index) {
      return sum + value / max[index];
    }, 0);
  }

  function getMaxCoordinates(population) {
    let max = _.fill(new Array(population[0].evaluation.length), -Infinity);
    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value > max[index]) max[index] = value;
      });
    });
    return max;
  }

  function updatePheromones(pheromones, archive, evaporationRate) {
    let max = getMaxCoordinates(archive);
    _.forEach(archive, function (individual) {
      let vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        let edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones.values[v][e] *= 1 - evaporationRate;
          pheromones.values[v][e] += evaporationRate * getPheromoneInc(individual.evaluation, max);
        });
      });
    });
  }

  function run(settings) {
    let pheromones = createPheromoneStructure(settings.network.graph.size().vertices, settings.beta, settings.initialPheromoneValue),
      // builder = moea.method.manyAco.build,
      builder = moea.method.moacsBp.build,
      sampleSize = 10,
      archive = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      // let population = builder.buildSolutions(settings.populationSize, [pheromones], settings.heuristicFunctions,
      //   settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
      //   0, settings.objectives);

      let population = builder.buildSolutions(settings.populationSize, pheromones, settings.evaporationRate,
        settings.initialPheromoneValue, settings.heuristicFunctions, settings.network.graph, settings.network.root,
        settings.network.destinations, settings.alpha, settings.objectives);

      let updatedArchive = updateArchive(archive, population);
      if (archive === updatedArchive) {
        updatePheromones(pheromones, archive, settings.evaporationRate);
      } else {
        pheromones = createPheromoneStructure(settings.network.graph.size().vertices, settings.beta, settings.initialPheromoneValue);
        archive = updatedArchive;
      }
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moacsBp.main.execute', run);
}());
