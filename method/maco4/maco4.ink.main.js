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

  function buildTree(pheromones, settings, sampleSize) {
    var graph = settings.network.graph,
        root = settings.network.root,
        destinations = _.clone(settings.network.destinations),
        tree = new moea.help.Graph(),
        explore = graph.getEdges(root),
        parents = [],
        isVisited = [],
        maxExplore = 0;

    isVisited[settings.network.root] = true;
    _.forEach(explore, function (v) {
      parents[v] = root;
    });

    while(destinations.length && explore.length) {
      var sample = _.map(_.sampleSize(explore, sampleSize), function (v) { return {parent: parents[v], vertex: v}; });
      calculateProbabilities(sample, pheromones, settings);
      let chosen = randomizeAccordingToProbabilities(sample);
      _.pull(explore, chosen.vertex);
      if (!isVisited[chosen.vertex]) {
        isVisited[chosen.vertex] = true;
        _.pull(destinations, chosen.vertex);
        tree.createEdge(chosen.parent, chosen.vertex);
        window.visited++;
        _.forEach(graph.getEdges(chosen.vertex), function (v) {
          if (!parents[v]) {
            explore.push(v);
            parents[v] = chosen.vertex;
          } else {
            let options = [{parent: parents[v], vertex: v}, {parent: chosen.vertex, vertex: v}];
            calculateProbabilities(options, pheromones, settings);
            let node = randomizeAccordingToProbabilities(options);
            parents[v] = node.parent;
          }
        });
      }
      if (explore.length > maxExplore) maxExplore = explore.length;
    }

    window.exploration = window.exploration || [];
    window.exploration.push(maxExplore);
    tree.prune(settings.network.root, settings.network.destinations);
    return tree;
  }

  function buildSolutions(startingId, populationSize, pheromones, settings, sampleSize) {
    var solutions = [];
    var tables = _.sampleSize(pheromones, populationSize);
    for (let i = 0; i < populationSize; i++) {
      let tree = buildTree([tables[i%tables.length]], settings, sampleSize);

      _.forEach(tree.getVertices(), function (v) {
        _.forEach(tree.getEdges(v), function (e) {
          _.forEach(pheromones, function (p) {
            p.ink[v][e].push(startingId + i);
          });
        });
      });

      solutions.push({
        id: startingId + i,
        solution: tree,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives)
      });
    }
    return solutions;
  }

  function createPheromoneTable(weights, size, initialPheromoneValue) {
    var table = {weights: weights, values: [], ink: []};
    for (let i = 0; i < size; i++) {
      table.values[i] = _.fill(new Array(size), initialPheromoneValue);
      table.ink[i] = new Array(size);
      for (let j = 0; j < size; j++) table.ink[i][j] = [];
    }
    return table;
  }

  function createPheromoneTables(numberOfObjectives, numberOfVertices, initialPheromoneValue) {
    var tables = [],
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue);
      }));
    }

    return tables;
  }

  function evaporatePheromones(pheromones, trailPersistence, minPheromoneValue, weight) {
    weight = weight || 1;
    for (let i = 0; i < pheromones.length; i++) {
      for (let j = 0; j < pheromones[i].length; j++) {
        pheromones[i][j] *= Math.pow((1 - trailPersistence), weight);
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

  function updateBestsByTables(bests, population, tables) {
    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < tables.length; j++) {
        bests[j] = bests[j] || [];
        bests[j] = moea.help.pareto.updateNonDominatedSet(bests[j], population[i], _.partial(applyWeightMaskToIndividual, _, tables[j].weights));
      }
    }
  }

  function updatePheromoneTable(table, trail, max) {
    for (let i = 0; i < table.ink.length; i++) {
      for (let j = 0; j < table.ink[i].length; j++) {
        let newInks = [];
        for (let k = 0; k < table.ink[i][j].length; k++) {
          if (table.inkMap[table.ink[i][j][k]]) {
            newInks.push(table.ink[i][j][k]);
            table.values[i][j] += trail;
            if (table.values[i][j] > max) table.values[i][j] = max;
          }
        }
        table.ink[i][j] = newInks;
      }
    }
  }

  function run(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        buildSolutionTime = 0,
        updatePheromonesTime = 0,
        sampleSize = 4,
        bests = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let t = new Date().getTime();
      let population = buildSolutions(i * settings.populationSize, settings.populationSize, pheromoneTables, settings, sampleSize);
      buildSolutionTime += new Date().getTime() - t;

      t = new Date().getTime();
      updateBestsByTables(bests, population, pheromoneTables);
      _.forEach(pheromoneTables, function (p, index) {
        p.inkMap = {};
        _.forEach(bests[index], function (individual) {
          p.inkMap[individual.id] = true;
        });
      });
      _.forEach(pheromoneTables, function (table, index) {
        evaporatePheromones(table.values, settings.trailPersistence, settings.pheromoneBounds.min, bests[index].length);
        updatePheromoneTable(table, settings.trailPersistence, settings.pheromoneBounds.max);
      });
      updatePheromonesTime += new Date().getTime() - t;
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(_.last(bests), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.maco4.main.execute', run);
}());
