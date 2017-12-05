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
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(pheromones.values[possibility.parent][possibility.vertex], settings.alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, settings), settings.beta);
        possibility.probabilityTerm = pheromone * heuristic;
      }
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
        vertices = [],
        explore = [];

    for (let i = 0; i < graph.size().vertices; i++) {
      vertices.push({vertex: i, isVisited: false, parent: null});
    }

    _.forEach(graph.getEdges(root), function (v) {
      vertices[v].parent = root;
      explore.push(vertices[v]);
    });

    vertices[root].isVisited = true;

    while(destinations.length && explore.length) {
      let sample = _.sampleSize(explore, sampleSize);
      calculateProbabilities(sample, _.sample(pheromones), settings);
      let chosen = randomizeAccordingToProbabilities(sample);
      // let chosen = _.maxBy(sample, 'probabilityTerm');
      _.pull(explore, chosen);
      if (!chosen.isVisited) {
        chosen.isVisited = true;
        _.pull(destinations, chosen.vertex);
        tree.createEdge(chosen.parent, chosen.vertex);
        _.forEach(graph.getEdges(chosen.vertex), function (v) {
          if (!vertices[v].parent) {
            explore.push(vertices[v]);
            vertices[v].parent = chosen.vertex;
          } else if (!vertices[v].isVisited) {
            let options = [vertices[v], {parent: chosen.vertex, vertex: v}];
            calculateProbabilities(options, _.sample(pheromones), settings);
            let node = randomizeAccordingToProbabilities(options);
            vertices[v].parent = node.parent;
            vertices[v].probabilityTerm = node.probabilityTerm;
          }
        });
      }
    }

    tree.prune(settings.network.root, settings.network.destinations);
    // if (Math.random() < settings.mutation.rate) {
    //   tree = settings.mutation.method(tree);
    // }
    return tree;
  }

  function buildSolutions(populationSize, pheromones, settings, sampleSize) {
    var solutions = [];
    var tables = _.sampleSize(pheromones, populationSize);
    for (let i = 0; i < populationSize; i++) {
      let table = i < tables.length ? tables[i] : _.sample(tables);
      let tree = buildTree([table], settings, sampleSize);
      let evaluation = moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives);
      solutions.push({
        solution: tree,
        evaluation: evaluation
      });
    }
    return solutions;
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
      // tables = _.concat(tables, _.map(_.sampleSize(_.allCombinations(objectives, i), 2), function (objectiveIndexes) {
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
    evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min, 1);
    _.forEach(population, function (individual) {
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] = (1 - trailPersistence) * pheromones[v][e] + trailPersistence;
          if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
        });
      });
    });
  }

  function createSolutions(pheromoneTables, sampleSize, settings) {
    return buildSolutions(settings.populationSize, pheromoneTables, settings, sampleSize);
    // var solutions = buildSolutions(settings.populationSize, pheromoneTables, settings, sampleSize);
    // let unique = _.uniqWith(solutions, function (a, b) {return _.isEqual(a.evaluation, b.evaluation)});
    // return _.concat(unique, moea.method.ga.generateRandomPopulation(solutions.length - unique.length, settings.randomize, settings.objectives));
  }

  function normalizeIndividuals(archive) {
    var numberOfObjectives = archive[0].evaluation.length,
        min = _.fill(new Array(numberOfObjectives), Infinity),
        max = _.fill(new Array(numberOfObjectives), -Infinity);

    _.forEach(archive, function (individual) {
      for (let i = 0; i < numberOfObjectives; i++) {
        if (individual.evaluation[i] < min[i]) min[i] = individual.evaluation[i];
        if (individual.evaluation[i] > max[i]) max[i] = individual.evaluation[i];
      }
    });

    let dif = _.subtractArrays(max, min);

    _.forEach(archive, function (individual) {
      var difToMin = _.subtractArrays(individual.evaluation, min);
      individual.normalizedEvaluation = _.divideArrays(difToMin, dif);
      individual.avg = _.mean(individual.normalizedEvaluation);
    });
  }

  function truncateArchive(archive, max) {
    normalizeIndividuals(archive);
    let ordered = _.orderBy(archive, 'avg');

    while (ordered.length > max) {
      let minDist = moea.help.distance.getEuclideanDistance(ordered[0], ordered[1]);
      let minIndex = 0;
      for (let i = 1; i < ordered.length - 1; i++) {
        let dist = moea.help.distance.getEuclideanDistance(ordered[i], ordered[i+1]);
        if (dist < minDist) {
          minDist = dist;
          minIndex = i;
        }
      }
      ordered.splice(minIndex, 1);
    }

    return ordered;
  }

  function truncateBestsByTables(bests, max) {
    for (let i = 0; i < bests.length - 1; i++) {
      if (bests[i].length > max) bests[i] = truncateArchive(bests[i], max);
    }
  }

  function run(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        iterationBests = [],
        buildSolutionTime = 0,
        updatePheromonesTime = 0,
        sampleSize = 200;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let t = new Date().getTime();
      // let population = createSolutions(pheromoneTables, sampleSize, settings);
      let population = moea.method.multiAco.build.buildSolutions(settings.populationSize, pheromoneTables, settings.heuristicFunctions,
        settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
        settings.beta, settings.objectives);
      buildSolutionTime += new Date().getTime() - t;

      t = new Date().getTime();
      updateBestsByTables(iterationBests, population, pheromoneTables);
      // truncateBestsByTables(iterationBests, 10);
      _.forEach(pheromoneTables, function (table, index) {
        updatePheromones(table.values, iterationBests[index], settings.trailPersistence, settings.pheromoneBounds);
      });
      updatePheromonesTime += new Date().getTime() - t;

      // console.log('max archive size: ' + _.maxBy(_.dropRight(iterationBests), 'length').length);
      // console.log('min archive size: ' + _.minBy(iterationBests, 'length').length);
      // console.log('avg archive size: ' + _.mean(_.map(_.dropRight(iterationBests), 'length')));
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(_.last(iterationBests), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.mdtAco.main.execute', run);
}());
