(function () {
  'use strict';

  function startThread(antsPerThread, pheromones, settings, sampleSize) {
    var worker = new Worker('method/mdt-aco/parallel/mdt-aco.parallel.build.js');

    worker.postMessage(JSON.stringify({
      populationSize: antsPerThread,
      pheromones: pheromones,
      sampleSize: sampleSize,
      graph: settings.network.graph.asArray(),
      root: settings.network.root,
      destinations: settings.network.destinations,
      alpha: settings.alpha,
      beta: settings.beta,
      heuristics: settings.heuristicTables
    }));

    return new Promise(function (resolve) {
      worker.onmessage = function (e) {
        resolve(JSON.parse(e.data));
      };
    });
  }

  function buildSolutions(populationSize, pheromones, settings, sampleSize) {
    var numberOfThreads = settings.numberOfThreads || 2,
        antsPerThread = Math.ceil(populationSize / numberOfThreads),
        population = [],
        threads = [];

    for (let i = 0; i < numberOfThreads - 1; i++) {
      threads.push(startThread(antsPerThread, pheromones, settings, sampleSize));
    }
    threads.push(startThread(populationSize - population.length, pheromones, settings, sampleSize));

    return new Promise(function (resolve) {
      Promise.all(threads).then(function (threadResults) {
        _.forEach(threadResults, function (solutions) {
          population = _.concat(population, _.map(solutions, function (s) {
            var tree = new moea.help.Graph(s);
            return {
              solution: tree,
              evaluation: moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives)
            };
          }));
        });
        resolve(population);
      });
    });
  }

  function createPheromoneTable(weights, size, initialPheromoneValue) {
    var table = {weights: weights, values: []};
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

  function updatePheromones(pheromones, population, trailPersistence, pheromoneBounds) {
    evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min, population.length);
    _.forEach(population, function (individual) {
      var pheromoneDeposit = trailPersistence;
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] += pheromoneDeposit;
          if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
        });
      });
    });
  }

  function createSolutions(pheromoneTables, sampleSize, settings) {
    return buildSolutions(settings.populationSize, pheromoneTables, settings, sampleSize).then(function (population) {
      let unique = _.uniqWith(population, function (a, b) {return _.isEqual(a.evaluation, b.evaluation)});
      return _.concat(unique, moea.method.ga.generateRandomPopulation(unique.length - population.length, settings.randomize, settings.objectives));
    });
  }

  function mainLoop(generation, bests, pheromoneTables, sampleSize, times, settings) {
    if (generation < settings.numberOfGenerations) {
      moea.method.ga.logGeneration(generation, settings.numberOfGenerations);
      let t = new Date().getTime();
      return createSolutions(pheromoneTables, sampleSize, settings).then(function (population) {
        times.build += new Date().getTime() - t;
        t = new Date().getTime();
        updateBestsByTables(bests, population, pheromoneTables);
        _.forEach(pheromoneTables, function (table, index) {
          updatePheromones(table.values, bests[index], settings.trailPersistence, settings.pheromoneBounds);
        });
        times.update += new Date().getTime() - t;
        return mainLoop(generation + 1, bests, pheromoneTables, sampleSize, times, settings);
      });
    }
  }

  function run(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        bests = [],
        times = {build: 0, update: 0},
        sampleSize = 200;

    return mainLoop(0, bests, pheromoneTables, sampleSize, times, settings).then(function () {
      console.log('build solution time: ' + (times.build / 1000) + 's');
      console.log('update pheromones time: ' + (times.update / 1000) + 's');
      return _.map(_.last(bests), 'solution');
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.mdtAcoParallel.main.execute', run);
}());
