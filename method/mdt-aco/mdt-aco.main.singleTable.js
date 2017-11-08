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

  function createPheromoneTable(size, initialPheromoneValue) {
    var table = {values: []};
    for (let i = 0; i < size; i++) {
      table.values[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return table;
  }

  function createWeights(numberOfObjectives) {
    var result = [],
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      _.forEach(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        result.push(weights);
      });
    }

    return result;
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

  function updateBestsByTables(bests, population, weights) {
    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        bests[j] = bests[j] || [];
        bests[j] = moea.help.pareto.updateNonDominatedSet(bests[j], population[i], _.partial(applyWeightMaskToIndividual, _, weights[j]));
      }
    }
  }

  function updatePheromones(pheromones, population, trailPersistence, pheromoneBounds) {
    evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min, population.length);
    _.forEach(population, function (individual) {
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] += trailPersistence;
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
        weights = createWeights(settings.objectives.length),
        pheromoneTables = [createPheromoneTable(graphSize, settings.initialPheromoneValue)],
        iterationBests = [],
        buildSolutionTime = 0,
        updatePheromonesTime = 0,
        sampleSize = 4,
        obj = 2,
        removalPoint = Math.floor(settings.numberOfGenerations / (settings.objectives.length - 1));

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      if (i > 0 && i % removalPoint === 0) {
        while(_.sum(weights[0]) === obj) {
          weights.shift();
          iterationBests.shift();
        }
        obj++;
      }

      let t = new Date().getTime();
      let population = createSolutions(pheromoneTables, sampleSize, settings);
      buildSolutionTime += new Date().getTime() - t;

      t = new Date().getTime();
      updateBestsByTables(iterationBests, population, weights);
      // truncateBestsByTables(iterationBests, 10);
      _.forEach(pheromoneTables, function (table) {
        var trees = _.flatten(iterationBests);
        var g = trees[0].solution.clone();
        for (let i = 1; i < trees.length; i++) {
          g.merge(trees[i].solution);
        }
        updatePheromones(table.values, [{solution: g}], settings.trailPersistence, settings.pheromoneBounds);
      });
      updatePheromonesTime += new Date().getTime() - t;
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(_.last(iterationBests), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.mdtAco.main.execute', run);
}());
