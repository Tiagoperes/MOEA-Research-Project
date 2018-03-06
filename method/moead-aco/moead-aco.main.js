(function () {
  'use strict';

  function createHeuristicFunction(w, heuristics) {
    return function (item, budget) {
      return _.reduce(heuristics, function (sum, h, index) {
        return sum + h(item, budget) * ((index < w.length) ? w[index] : 1);
      }, 0);
    }
  }

  function createAnts(numberOfObjectives, numberOfItems, numberOfDivisions, neighborhoodSize, heuristics) {
    const ZERO_SOLUTION = {
      structure: _.fill(new Array(numberOfItems), 0),
      evaluation: _.fill(new Array(numberOfObjectives), 0),
      fitness: 0
    };

    let weights = moea.method.moead.neighborhood.generateUniformWeightVectors(numberOfObjectives, numberOfDivisions);
    let ants = _.map(weights, function (w) {
      return {
        weights: w,
        heuristic: createHeuristicFunction(w, heuristics),
        currentSolution: ZERO_SOLUTION
      };
    });

    moea.method.moead.neighborhood.createNeighborhoods(ants, neighborhoodSize);
    return ants;
  }

  function createGroups(ants, numberOfGroupDivisions, maxPheromone) {
    let weights = moea.method.moead.neighborhood.generateUniformWeightVectors(ants[0].weights.length, numberOfGroupDivisions);
    let numberOfItems = ants[0].currentSolution.structure.length;

    let groups = _.map(weights, function (w) {
      return {
        weights: w,
        ants: [],
        pheromones: _.fill(new Array(numberOfItems), maxPheromone)
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

  // function updateArchiveAndGroupsNdSets(archive, groups) {
  //   _.forEach(groups, function (group) {
  //     group.ndSet = [];
  //     let newSolutions = _.map(group.ants, 'newSolution');
  //     _.forEach(newSolutions, function (solution) {
  //       let prev = archive;
  //       archive = moea.help.pareto.updateNonDominatedSet(archive, solution, 'evaluation');
  //       if (archive !== prev) group.ndSet.push(solution);
  //     });
  //   });
  //
  //   return archive;
  // }

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

  function getPheromoneIncrement(solutions, totalItemProfit, scalarizationFunction, weights) {
    return _.sumBy(solutions, function (solution) {
      return scalarizationFunction(solution.evaluation, weights) / totalItemProfit;
    }) / solutions.length;
  }

  function updatePheromones(groups, evaporationRate, pheromoneInterval, totalItemProfit, scalarizationFunction) {
    _.forEach(groups, function (group) {
      let pheromoneIncrement = getPheromoneIncrement(group.ndSet, totalItemProfit, scalarizationFunction, group.weights);
      _.forEach(group.ndSet, function (solution) {
        for (let i = 0; i < group.pheromones.length; i++) {
          group.pheromones[i] *= evaporationRate;
          if (solution.structure[i]) {
            group.pheromones[i] += pheromoneIncrement;
          }
          if (group.pheromones[i] > pheromoneInterval.max) group.pheromones[i] = pheromoneInterval.max;
          if (group.pheromones[i] < pheromoneInterval.min) group.pheromones[i] = pheromoneInterval.min;
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
        solution.fitness = scalarizationFunction(solution.evaluation, ant.weights);
      });

      let best = _.minBy(neighboringSolutions, 'fitness');
      if (best && best.fitness < ant.currentSolution.fitness) {
        ant.currentSolution = best;
        best.used = true;
      }
    });
  }

  function updatePheromoneBounds(groups, ants, pheromoneBounds, evaporationRate, totalItemProfit) {
    let numberOfNdSolutions = _.sumBy(_.map(groups, 'ndSet'), 'length');
    let minFitness = _.minBy(_.map(ants, 'currentSolution'), 'fitness').fitness;
    pheromoneBounds.max = (numberOfNdSolutions + 1) / ((1 - evaporationRate) * (minFitness / totalItemProfit));
    pheromoneBounds.min = (1/(2*ants.length)) * pheromoneBounds.max;
  }

  function run(settings) {
    let ants = createAnts(settings.objectives.length, settings.weights.length, settings.numberOfDivisions, settings.neighborhoodSize, settings.heuristicFunctions),
        groups = createGroups(ants, settings.numberOfGroupDivisions, settings.pheromoneBounds.max),
        scalarizationFunction = moea.method.moead.scalarization.scalarizeWS,
        totalItemProfit = -_.sumBy(settings.profitMatrix, _.sum),
        archive = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      moea.method.moeadAco.build.mkp.buildSolutions(groups, settings.weights, settings.capacity, settings.sampleSize, settings.alpha, settings.beta, settings.delta, settings.elitismRate, settings.objectives);
      archive = updateArchiveAndGroupsNdSets(ants, groups, archive);
      updatePheromones(groups, settings.evaporationRate, settings.pheromoneBounds, totalItemProfit, scalarizationFunction);
      updateSolutions(ants, scalarizationFunction);
      // the following makes no fucking sense
      // updatePheromoneBounds(groups, ants, settings.pheromoneBounds, settings.evaporationRate, totalItemProfit);
    }

    return _.map(archive, 'structure');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moeadAco.mkp.main.execute', run);
}());
