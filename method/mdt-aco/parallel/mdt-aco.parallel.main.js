(function () {
  'use strict';

  function createWorkers(numberOfWorkers, antsPerThread, sampleSize, pheromones, settings) {
    var workers = [],
        msg = JSON.stringify({
          populationSize: antsPerThread,
          sampleSize: sampleSize,
          graph: settings.network.graph.asArray(),
          root: settings.network.root,
          destinations: settings.network.destinations,
          alpha: settings.alpha,
          beta: settings.beta,
          heuristics: settings.heuristicTables,
          weights: pheromones.getWeights()
        });

    msg = msg.slice(0, msg.length - 1);

    for (let i = 0; i < numberOfWorkers; i++) {
      let worker = new Worker('method/mdt-aco/parallel/mdt-aco.parallel.build.js');
      worker.postMessage(msg + ', "seed": ' + Math.random() + ', "offset": ' + (i * antsPerThread) + '}');
      worker.postMessage(pheromones.getSharedBuffer());
      workers.push(worker);
    }

    return workers;
  }

  function terminateWorkers(workers) {
    _.forEach(workers, function (worker) {
      worker.terminate();
    });
  }

  function runBuildJob(worker) {
    worker.postMessage('run');

    return new Promise(function (resolve) {
      worker.onmessage = function (e) {
        resolve(JSON.parse(e.data));
      };
    });
  }

  function buildSolutions(workers, pheromones, settings) {
    var population = [],
        tasks = [];

    for (let i = 0; i < workers.length; i++) {
      tasks.push(runBuildJob(workers[i], pheromones));
    }

    return new Promise(function (resolve) {
      Promise.all(tasks).then(function (tasksResults) {
        _.forEach(tasksResults, function (solutions) {
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

  function createPheromoneTables(numberOfObjectives, numberOfVertices, initialPheromoneValue, trailPersistence, bounds) {
    var objectives = [],
        weights = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      weights = _.concat(weights, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return weights;
      }));
    }

    return new moea.method.mdtAcoParallel.Pheromones(weights, numberOfVertices, initialPheromoneValue, trailPersistence, bounds);
  }

  function applyWeightMaskToIndividual(individual, weights) {
    var result = [];
    for (let i = 0; i < weights.length; i++) {
      if (weights[i]) result.push(individual.evaluation[i]);
    }
    return result;
  }

  function updateBestsByTables(bests, population, pheromones) {
    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < pheromones.getNumberOfTables(); j++) {
        bests[j] = bests[j] || [];
        bests[j] = moea.help.pareto.updateNonDominatedSet(bests[j], population[i], _.partial(applyWeightMaskToIndividual, _, pheromones.getWeights(j)));
      }
    }
  }

  function updatePheromones(tableIndex, pheromones, population) {
    _.forEach(population, function (individual) {
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones.deposit(tableIndex, v, e);
        });
      });
    });
  }

  function createSolutions(workers, pheromones, settings) {
    return buildSolutions(workers, pheromones, settings).then(function (population) {
      let unique = _.uniqWith(population, function (a, b) {return _.isEqual(a.evaluation, b.evaluation)});
      return _.concat(unique, moea.method.ga.generateRandomPopulation(unique.length - population.length, settings.randomize, settings.objectives));
    });
  }

  function mainLoop(workers, generation, pheromones, bests, times, settings) {
    if (generation < settings.numberOfGenerations) {
      moea.method.ga.logGeneration(generation, settings.numberOfGenerations);
      let t = new Date().getTime();
      return createSolutions(workers, pheromones, settings).then(function (population) {
        times.build += new Date().getTime() - t;
        t = new Date().getTime();
        updateBestsByTables(bests, population, pheromones);
        pheromones.evaporate(population.length, settings.network.graph);
        for (let i = 0; i < pheromones.getNumberOfTables(); i++) {
          updatePheromones(i, pheromones, bests[i], settings.trailPersistence, settings.pheromoneBounds);
        }
        times.update += new Date().getTime() - t;
        return mainLoop(workers, generation + 1, pheromones, bests, times, settings);
      });
    }
  }

  function run(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromones = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue, settings.trailPersistence, settings.pheromoneBounds),
        bests = [],
        times = {build: 0, update: 0},
        sampleSize = 200,
        antsPerThread = Math.ceil(settings.populationSize / settings.numberOfThreads),
        workers = createWorkers(settings.numberOfThreads, antsPerThread, sampleSize, pheromones, settings);

    return mainLoop(workers, 0, pheromones, bests, times, settings).then(function () {
      console.log('build solution time: ' + (times.build / 1000) + 's');
      console.log('update pheromones time: ' + (times.update / 1000) + 's');
      terminateWorkers(workers);
      return _.map(_.last(bests), 'solution');
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.mdtAcoParallel.main.execute', run);
}());
