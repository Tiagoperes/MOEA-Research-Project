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
        let pheromone = Math.pow(_.sample(pheromones).values[possibility.parent][possibility.vertex], settings.alpha);
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
    if (Math.random() < settings.mutation.rate) {
      tree = settings.mutation.method(tree);
    }
    return tree;
  }

  function buildSolutions(populationSize, pheromones, dominationPheromones, settings) {
    var solutions = [];
    for (let i = 0; i < populationSize; i++) {
      var candidates = _.clone(pheromones);
      var table1 = _.maxBy(_.sampleSize(candidates, 4), 'score');
      _.pull(candidates, table1);
      var table2 = _.maxBy(_.sampleSize(candidates, 4), 'score');
      let tree = buildTree([table1, table2, dominationPheromones], settings);
      solutions.push({
        solution: tree,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives)
      });
    }
    return solutions;
  }

  function createPheromoneTable(weights, size, initialPheromoneValue) {
    var table = {weights: weights, values: [], score: 0};
    for (let i = 0; i < size; i++) {
      table.values[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return table;
  }

  function createPheromoneTables(numberOfObjectives, numberOfVertices, initialPheromoneValue) {
    var tables = [],
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 1; i <= numberOfObjectives; i++) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue);
      }));
    }

    return tables;
  }

  function updateArchive(archive, solutions) {
    var newArchive = archive;
    _.forEach(solutions, function (sol) {
      newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, sol, 'evaluation');
    });
    return newArchive;
  }

  function evaporatePheromones(pheromones, trailPersistence, minPheromoneValue) {
    for (let i = 0; i < pheromones.length; i++) {
      for (let j = 0; j < pheromones[i].length; j++) {
        pheromones[i][j] *= (1 - trailPersistence);
        if (pheromones[i][j] < minPheromoneValue) pheromones[i][j] = minPheromoneValue;
      }
    }
  }

  function updatePheromones(pheromoneTables, iterationBests, globalBests, trailPersistence, pheromoneBounds) {
    _.forEach(pheromoneTables, function (pheromones, index) {
      var pheromoneDeposit = trailPersistence / (1 + iterationBests[index].fitness - globalBests[index].fitness);
      var vertices = iterationBests[index].solution.getVertices();
      evaporatePheromones(pheromones.values, trailPersistence, pheromoneBounds.min);
      _.forEach(vertices, function (v) {
        var edges = iterationBests[index].solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones.values[v][e] += pheromoneDeposit;
          if (pheromones.values[v][e] > pheromoneBounds.max) pheromones.values[v][e] = pheromoneBounds.max;
        });
      });
    });
  }

  function getBestsByTables(population, tables) {
    var bests = [];

    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < tables.length; j++) {
        var fitness = _.weightedSum(population[i].normalizedEvaluation, tables[j].weights);
        if (!bests[j] || fitness < bests[j].fitness) {
          bests[j] = _.clone(population[i]);
          bests[j].fitness = fitness;
        }
      }
    }

    return bests;
  }

  function updateBestsByTables(currentBests, newBests, tables) {
    for (let i = 0; i < tables.length; i++) {
      if (!currentBests[i] || newBests[i].fitness < currentBests[i].fitness) {
        currentBests[i] = newBests[i];
      }
    }
  }

  function updateDominationPheromones(pheromones, archive, trailPersistence, pheromoneBounds) {
    _.forEach(archive, function (individual) {
      var pheromoneDeposit = trailPersistence;
      var vertices = individual.solution.getVertices();
      evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min);
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] += pheromoneDeposit;
          if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
        });
      });
    });
  }

  function maco4(settings) {
    var norm = moea.help.normalization,
        graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        dominationPheromones = createPheromoneTable(null, settings.network.graph.size().vertices, settings.initialPheromoneValue),
        archive = [],
        globalBests = [],
        extremes = norm.initializeExtremes(settings.objectives.length);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      let solutions = buildSolutions(settings.populationSize, pheromoneTables, dominationPheromones, settings);
      if (i % 20 === 0) {
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue);
        dominationPheromones = createPheromoneTable(null, settings.network.graph.size().vertices, settings.initialPheromoneValue);
      }
      // let uniq = _.uniqWith(solutions, function (a, b) {
      //   return _.isEqual(a.evaluation, b.evaluation);
      // });
      // let min1st = _.minBy(solutions, function (s) {return s.evaluation[0]}).evaluation[0];
      // let min2nd = _.minBy(solutions, function (s) {return s.evaluation[1]}).evaluation[1];
      // let min3rd = _.minBy(solutions, function (s) {return s.evaluation[2]}).evaluation[2];
      // console.log(solutions.length + ' solutions');
      // console.log(uniq.length + ' unique solutions');
      // console.log('min 1st objective: ' + min1st);
      // console.log('min 2nd objective: ' + min2nd);
      // console.log('min 3rd objective: ' + min3rd + '\n------------------');

      norm.normalize([], _.concat(solutions, globalBests), extremes);
      let iterationBests = getBestsByTables(solutions, pheromoneTables);
      updateBestsByTables(globalBests, iterationBests, pheromoneTables);
      var newArchive = updateArchive(archive, solutions);
      var newNDSolutions = _.difference(newArchive, archive);
      archive = newArchive;
      _.forEach(globalBests, function (individual, index) {
        var isNewNDSol = !!_.find(newNDSolutions, function (ndSol) {
          return _.isEqual(ndSol.evaluation, individual.evaluation);
        });
        if (isNewNDSol) pheromoneTables[index].score++;
      });
      updatePheromones(pheromoneTables, iterationBests, globalBests, settings.trailPersistence, settings.pheromoneBounds);
      updateDominationPheromones(dominationPheromones.values, archive, settings.trailPersistence, settings.pheromoneBounds);
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.maco4.main.execute', maco4);
}());
