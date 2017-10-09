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
    }) / settings.heuristicFunctions.length;

    // return _.sample(settings.heuristicFunctions)(sourceVertex, targetVertex);
  }

  function calculateProbabilities(possibilities, pheromones, settings) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      // if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(_.sample(pheromones).values[possibility.parent][possibility.vertex], settings.alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, settings), settings.beta);
        possibility.probabilityTerm = pheromone * heuristic;
      // }
      probabilitySum += possibility.probabilityTerm;
    });
    _.forEach(possibilities, function (possibility) {
      possibility.probability = possibility.probabilityTerm / probabilitySum;
    });
  }

  // function buildTree(pheromones, settings) {
  //   var graph = settings.network.graph,
  //       root = settings.network.root,
  //       destinations = _.clone(settings.network.destinations),
  //       tree = new moea.help.Graph(),
  //       explore = _.map(graph.getEdges(root), function (v) {return {parent: root, vertex: v}}),
  //       isVisited = [];
  //
  //   isVisited[settings.network.root] = true;
  //
  //   while(destinations.length && explore.length) {
  //     var sample = explore;
  //     calculateProbabilities(sample, pheromones, settings);
  //     let chosen = randomizeAccordingToProbabilities(sample);
  //     _.pull(explore, chosen);
  //     if (!isVisited[chosen.vertex]) {
  //       isVisited[chosen.vertex] = true;
  //       _.pull(destinations, chosen.vertex);
  //       tree.createEdge(chosen.parent, chosen.vertex);
  //       window.visited++;
  //       _.forEach(graph.getEdges(chosen.vertex), function (v) {
  //         explore.push({parent: chosen.vertex, vertex: v});
  //       });
  //     }
  //   }
  //
  //   tree.prune(settings.network.root, settings.network.destinations);
  //   if (Math.random() < settings.mutation.rate) {
  //     tree = settings.mutation.method(tree);
  //   }
  //   return tree;
  // }

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
      var sample = _.sampleSize(explore, 4);
      calculateProbabilities(sample, pheromones, settings);
      let chosen = _.maxBy(sample, 'probability');
      tree.createEdge(chosen.parent, chosen.vertex);
      window.visited++;
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
      let tree = buildTree([_.maxBy(_.sampleSize(pheromones,3), 'score'), _.maxBy(_.sampleSize(pheromones,3), 'score')], settings);
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

  function evaporatePheromones(pheromones, trailPersistence, minPheromoneValue) {
    for (let i = 0; i < pheromones.length; i++) {
      for (let j = 0; j < pheromones[i].length; j++) {
        pheromones[i][j] *= (1 - trailPersistence);
        if (pheromones[i][j] < minPheromoneValue) pheromones[i][j] = minPheromoneValue;
      }
    }
  }

  function applyWeightMaskToIndividual(individual, weights) {
    var result = [];
    for (let i = 0; i < weights.length; i++) {
      if (weights[i]) result.push(individual.evaluation[i]);
    }
    return result;
  }

  function getBestsByTables(population, tables) {
    var bests = [];

    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < tables.length; j++) {
        bests[j] = bests[j] || [];
        bests[j] = moea.help.pareto.updateNonDominatedSet(bests[j], population[i], _.partial(applyWeightMaskToIndividual, _, tables[j].weights));
      }
    }

    return bests;
  }

  function updateBestsByTables(currentBests, newBests, tables) {
    for (let i = 0; i < tables.length; i++) {
      currentBests[i] = currentBests[i] || [];
      for (let j = 0; j < newBests[i].length; j++) {
        let prevBest = currentBests[i];
        currentBests[i] = moea.help.pareto.updateNonDominatedSet(currentBests[i], newBests[i][j], _.partial(applyWeightMaskToIndividual, _, tables[i].weights));
        if (currentBests[i] !== prevBest) {
          tables[i].score++;
        }
      }
    }
  }

  function updatePheromones(pheromones, population, trailPersistence, pheromoneBounds) {
    _.forEach(population, function (individual) {
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
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        globalBests = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      window.visited = 0;
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      let solutions = buildSolutions(settings.populationSize, pheromoneTables, settings);
      // if (i % 20 === 0) {
      //   pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue);
      // }

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

      let iterationBests = getBestsByTables(solutions, pheromoneTables);
      updateBestsByTables(globalBests, iterationBests, pheromoneTables);
      // evaporatePheromones(pheromoneTables, settings.trailPersistence, settings.pheromoneBounds.min);
      _.forEach(pheromoneTables, function (table, index) {
        updatePheromones(table.values, iterationBests[index], settings.trailPersistence, settings.pheromoneBounds);
      });

      // console.log(window.visited);
    }

    return _.map(_.last(globalBests), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.maco4.main.execute', maco4);
}());
