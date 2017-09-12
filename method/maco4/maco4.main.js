(function () {
  'use strict';

  function randomizeAccordingToProbabilities(set) {
    var ordered = _.orderBy(set, 'probability'),
        rand = Math.random(),
        sum = 0,
        i = -1;

    do {
      i++;
      sum += ordered[i].probability;
    } while (rand > sum);

    return ordered[i];
  }

  function getHeuristic(sourceVertex, targetVertex, settings) {
    return _.sumBy(settings.heuristicFunctions, function (heuristic) {
      return heuristic(sourceVertex, targetVertex);
    });
  }

  function calculateProbabilities(possibilities, pheromones, settings) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(_.sample(pheromones)[possibility.parent][possibility.vertex], settings.alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, settings), settings.beta);
        possibility.probabilityTerm = pheromone * heuristic;
      }
      probabilitySum += possibility.probabilityTerm;
    });
    _.forEach(possibilities, function (possibility) {
      possibility.probability = possibility.probabilityTerm / probabilitySum;
    });
  }

  function buildTree(pheromones, settings) {
    var graph = settings.network.graph,
        root = settings.network.root,
        destinations = _.clone(settings.network.destinations),
        tree = new moea.help.Graph(),
        explore = _.map(graph.getEdges(root), function (v) {return {parent: root, vertex: v}}),
        isVisible = [];

    isVisible[settings.network.root] = true;
    _.forEach(explore, function (node) {
      isVisible[node.vertex] = true;
    });

    while(destinations.length && explore.length) {
      calculateProbabilities(explore, pheromones, settings);
      let chosen = randomizeAccordingToProbabilities(explore);
      tree.createEdge(chosen.parent, chosen.vertex);
      _.pull(destinations, chosen.vertex);
      _.pull(explore, chosen);
      // pheromones[chosen.parent][chosen.vertex] *= 1 - settings.trailPersistence;
      // pheromones[chosen.parent][chosen.vertex] += settings.trailPersistence * settings.initialPheromoneValue;
      _.forEach(graph.getEdges(chosen.vertex), function (v) {
        if (!isVisible[v]) {
          explore.push({parent: chosen.vertex, vertex: v});
          isVisible[v] = true;
        }
      });
    }


    tree.prune(settings.network.root, settings.network.destinations);
    // moea.help.graphDesigner.draw(tree, settings.network.root, settings.network.destinations);
    // if (Math.random() < settings.mutation.rate) {
    //   tree = settings.mutation.method(tree);
    // }
    return tree;
  }

  function buildSolutions(populationSize, pheromones, settings) {
    var solutions = [];
    for (let i = 0; i < populationSize; i++) {
      let tree = buildTree(pheromones, settings);
      solutions.push({
        solution: tree,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives)
      });
    }
    return solutions;
  }

  function createPheromoneMatrix(size, initialPheromoneValue) {
    var matrix = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return matrix;
  }

  function createPheromoneMatrixes(numberOfMatrixes, numberOfVertices, initialPheromoneValue) {
    var matrixes = [];
    for (let i = 0; i < numberOfMatrixes; i++) {
      matrixes[i] = createPheromoneMatrix(numberOfVertices, initialPheromoneValue);
    }
    return matrixes;
  }

  function updateArchive(archive, solutions) {
    var newArchive = archive;
    _.forEach(solutions, function (sol) {
      newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, sol, 'evaluation');
    });
    return newArchive;
  }

  function updatePheromones(pheromoneMatrixes, iterationMinMax, globalMinMax, maxPheromoneValue) {
    _.forEach(pheromoneMatrixes, function (pheromones, index) {
      var normDivider = globalMinMax.max[index].evaluation[index] - globalMinMax.min[index].evaluation[index];
      var itBest = (iterationMinMax.min[index].evaluation[index] - globalMinMax.min[index].evaluation[index]) / normDivider;
      var gbBest = 0;
      var pheromoneDeposit = 1 / (1 + itBest - gbBest);
      // if (pheromoneDeposit > 0.1) pheromoneDeposit = 0.1;
      // var pheromoneDeposit = 1 / (1 + iterationMinMax.min[index].evaluation[index] - globalMinMax.min[index].evaluation[index]);
      var vertices = iterationMinMax.min[index].solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = iterationMinMax.min[index].solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] += pheromoneDeposit;
          if (pheromones[v][e] > maxPheromoneValue) pheromones[v][e] = maxPheromoneValue;
        });
      });
    });
  }

  function evaporatePheromones(pheromoneMatrixes, trailPersistence, minPheromoneValue) {
    for (let i = 0; i < pheromoneMatrixes.length; i++) {
      for (let j = 0; j < pheromoneMatrixes[i].length; j++) {
        for (let k = 0; k < pheromoneMatrixes[i][j].length; k++) {
          pheromoneMatrixes[i][j][k] *= 1 - trailPersistence;
          if (pheromoneMatrixes[i][j][k] < minPheromoneValue) pheromoneMatrixes[i][j][k] = minPheromoneValue;
        }
      }
    }
  }

  function getMinMaxByObjectives(population) {
    var numberOfObjectives = population[0].evaluation.length,
        min = [], max = [];

    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < numberOfObjectives; j++) {
        if (!min[j] || population[i].evaluation[j] < min[j].evaluation[j]) {
          min[j] = population[i];
        }
        if (!max[j] || population[i].evaluation[j] > max[j].evaluation[j]) {
          max[j] = population[i];
        }
      }
    }

    return {min: min, max: max};
  }

  function updateMinMaxByObjectives(currentMinMax, newMinMax) {
    for (let i = 0; i < newMinMax.min.length; i++) {
      if (!currentMinMax.min[i] || newMinMax.min[i].evaluation[i] < currentMinMax.min[i].evaluation[i]) {
        currentMinMax.min[i] = newMinMax.min[i];
      }
      if (!currentMinMax.max[i] || newMinMax.max[i].evaluation[i] < currentMinMax.max[i].evaluation[i]) {
        currentMinMax.max[i] = newMinMax.max[i];
      }
    }
  }

  function maco4(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromones = createPheromoneMatrixes(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        archive = [],
        globalMinMax = {min: [], max: []};

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      let solutions = buildSolutions(settings.populationSize, pheromones, settings);
      let uniq = _.uniqWith(solutions, function (a, b) {
        return _.isEqual(a.evaluation, b.evaluation);
      });
      let min1st = _.minBy(solutions, function (s) {return s.evaluation[0]}).evaluation[0];
      let min2nd = _.minBy(solutions, function (s) {return s.evaluation[1]}).evaluation[1];
      let min3rd = _.minBy(solutions, function (s) {return s.evaluation[2]}).evaluation[2];
      console.log(solutions.length + ' solutions');
      console.log(uniq.length + ' unique solutions');
      console.log('min 1st objective: ' + min1st);
      console.log('min 2nd objective: ' + min2nd);
      console.log('min 3rd objective: ' + min3rd + '\n------------------');
      let iterationMinMax = getMinMaxByObjectives(solutions);
      updateMinMaxByObjectives(globalMinMax, iterationMinMax);
      archive = updateArchive(archive, solutions);
      evaporatePheromones(pheromones, settings.trailPersistence, settings.pheromoneBounds.min);
      updatePheromones(pheromones, iterationMinMax, globalMinMax, settings.pheromoneBounds.max);
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.maco4.main.execute', maco4);
}());
