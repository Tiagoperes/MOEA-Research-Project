(function () {
  'use strict';

  function createHeuristicFunction(w, heuristics) {
    let rhwv;
    do {
      rhwv = _.map(heuristics, _.partial(_.random, 0, 2, false));
    } while (_.sum(rhwv) === 0)
    return function (source, target) {
      return _.reduce(heuristics, function (sum, h, index) {
        return sum + h(source, target) * rhwv[index];
      }, 0) / _.sum(rhwv);
    }
  }

  // function createHeuristicFunction(w, profits, weights) {
  //   return function (item) {
  //     return _.reduce(profits, function (sum, profitArray, index) {
  //       return sum + profitArray[item] * w[index] / weights[item];
  //     }, 0);
  //   }
  // }

  function createAnts(numberOfObjectives, numberOfDivisions, neighborhoodSize, heuristics) {
    const ZERO_SOLUTION = {
      tree: null,
      evaluation: _.fill(new Array(numberOfObjectives), 0),
      normalizedEvaluation: _.fill(new Array(numberOfObjectives), 0),
      fitness: Infinity
    };

    let weights = moea.method.moead.neighborhood.generateUniformWeightVectors(numberOfObjectives, numberOfDivisions);
    let ants = _.map(weights, function (w) {
      return {
        weights: w,
        heuristic: createHeuristicFunction(w, heuristics),
        // heuristic: createHeuristicFunction(w, profits, itemWeights),
        currentSolution: ZERO_SOLUTION
      };
    });

    moea.method.moead.neighborhood.createNeighborhoods(ants, neighborhoodSize);
    return ants;
  }

  function createPheromoneMatrix(vertices, maxPheromone) {
    let matrix = [];
    for (let i = 0; i < vertices; i++) {
      matrix[i] = _.fill(new Array(vertices), maxPheromone);
    }
    return matrix;
  }

  function createGroups(ants, numberOfVertices, numberOfGroupDivisions, maxPheromone) {
    let weights = moea.method.moead.neighborhood.generateUniformWeightVectors(ants[0].weights.length, numberOfGroupDivisions);

    let groups = _.map(weights, function (w) {
      return {
        weights: w,
        ants: [],
        pheromones: createPheromoneMatrix(numberOfVertices, maxPheromone)
      }
    });

    _.forEach(ants, function (ant) {
      let closestGroup = _.minBy(groups, function (g) {
        return moea.help.distance.getEuclideanDistance(ant.weights, g.weights);
      });
      closestGroup.ants.push(ant);
    });

    return groups;
  }

  function updateArchiveAndGroupsNdSets(ants, groups, archive) {
    let prev = archive;
    _.forEach(_.map(ants, 'newSolution'), function (solution) {
      archive = moea.help.pareto.updateNonDominatedSet(archive, solution, 'evaluation');
    });
    let newNdSolutions = _.difference(archive, prev);

    _.forEach(groups, function (group) {
      group.ndSet = _.filter(_.map(group.ants, 'newSolution'), function (solution) {
        return _.includes(newNdSolutions, solution);
      })
    });

    return archive;
  }

  function getPheromoneIncrement(solutions, scalarizationFunction, weights) {
    return _.sumBy(solutions, function (solution) {
      return 1 / scalarizationFunction(solution.normalizedEvaluation, weights);
    });
  }

  function updatePheromones(groups, evaporationRate, pheromoneInterval, scalarizationFunction) {
    _.forEach(groups, function (group) {
      let pheromoneIncrement = getPheromoneIncrement(group.ndSet, scalarizationFunction, group.weights);
      _.forEach(group.ndSet, function (solution) {
        for (let i = 0; i < group.pheromones.length; i++) {
          for (let j = 0; j < group.pheromones.length; j++) {
            group.pheromones[i][j] *= evaporationRate;
            if (solution.structure.hasEdge(i, j)) {
              group.pheromones[i][j] += pheromoneIncrement;
            }
            if (group.pheromones[i][j] > pheromoneInterval.max) group.pheromones[i][j] = pheromoneInterval.max;
            if (group.pheromones[i][j] < pheromoneInterval.min) group.pheromones[i][j] = pheromoneInterval.min;
          }
        }
      });
    });
  }

  function updateSolutions(ants, scalarizationFunction) {
    _.forEach(ants, function (ant) {
      let neighboringSolutions = _.filter(_.map(ant.neighborhood, 'newSolution'), function (s) {
        return !s.used;
      });

      _.forEach(neighboringSolutions, function (solution) {
        solution.fitness = scalarizationFunction(solution.normalizedEvaluation, ant.weights);
      });

      let best = _.minBy(neighboringSolutions, 'fitness');
      if (best && best.fitness < ant.currentSolution.fitness) {
        ant.currentSolution = best;
        best.used = true;
      }
    });
  }

  function updatePheromoneBounds(groups, ants, pheromoneBounds, evaporationRate) {
    let numberOfNdSolutions = _.sumBy(_.map(groups, 'ndSet'), 'length');
    let minFitness = _.minBy(_.map(ants, 'currentSolution'), 'fitness').fitness;
    pheromoneBounds.max = (numberOfNdSolutions + 1) / ((1 - evaporationRate) * minFitness);
    pheromoneBounds.min = (1/(2*ants.length)) * pheromoneBounds.max;
  }

  function normalizeSolutions(ants, extremes) {
    let oldSolutions = _.map(ants, 'currentSolution');
    let newSolutions = _.map(ants, 'newSolution');
    moea.help.normalization.normalize(oldSolutions, newSolutions, extremes);
  }

  function run(settings) {
    let ants = createAnts(settings.objectives.length, settings.numberOfDivisions, settings.neighborhoodSize, settings.heuristicFunctions),
        ngens = moea.method.ga.getNumberOfGenerations(ants.length, settings.comparisons),
        groups = createGroups(ants, settings.network.graph.size().vertices, settings.numberOfGroupDivisions, settings.pheromoneBounds.max),
        scalarizationFunction = moea.method.moead.scalarization.scalarizeWS,
        archive = [],
        extremes = moea.help.normalization.initializeExtremes(settings.objectives.length);

    for (let i = 0; i < ngens; i++) {
      moea.method.ga.logGeneration(i, ngens);
      moea.method.moeadAco.mrp.build.buildSolutions(groups, settings.network.graph, settings.network.root, settings.network.destinations, settings.sampleSize, settings.alpha, settings.beta, settings.delta, settings.elitismRate, settings.objectives);
      normalizeSolutions(ants, extremes);
      archive = updateArchiveAndGroupsNdSets(ants, groups, archive);
      updatePheromones(groups, settings.evaporationRate, settings.pheromoneBounds, scalarizationFunction);
      updateSolutions(ants, scalarizationFunction);
      // the following makes no fucking sense
      // updatePheromoneBounds(groups, ants, settings.pheromoneBounds, settings.evaporationRate);
    }

    return _.map(archive, 'structure');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moeadAco.mrp.main.execute', run);
}());
