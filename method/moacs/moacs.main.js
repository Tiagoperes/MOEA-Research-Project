(function () {
  'use strict';

  const LAMBDA_BASE = 3;

  function createLambdaCombinations(m, numberOfWeights) {
    var numberOfCombinations = Math.pow(m, numberOfWeights),
        combinations = [];

    for (let i = 0; i < numberOfCombinations; i++) {
      let baseM = i.toString(m);
      let digits = _.map(baseM.split(''), function (d) { return parseInt(d); });
      while(digits.length < numberOfWeights) digits.unshift(0);
      combinations.push(digits);
    }

    return combinations;
  }

  function createBasepLambdas(populationSize, numberOfWeights) {
    var combinations = [], upperLimit = Math.pow(LAMBDA_BASE, numberOfWeights);
    for (let i = 0; i < populationSize; i++) {
      let baseLambda = _.random(0, upperLimit).toString(LAMBDA_BASE);
      let digits = _.map(baseLambda.split(''), function (d) { return parseInt(d); });
      while(digits.length < numberOfWeights) digits.unshift(0);
      combinations.push(digits);
    }
    return combinations;
  }

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

  function getHeuristic(sourceVertex, targetVertex, lambdas, settings) {
    return _.reduce(settings.heuristicFunctions, function (result, heuristic, index) {
      return result * Math.pow(heuristic(sourceVertex, targetVertex), lambdas[index]);
    }, 1);
  }

  function calculateProbabilities(possibilities, pheromones, lambdas, settings) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(pheromones[possibility.parent][possibility.vertex], settings.alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, lambdas, settings), settings.beta);
        possibility.probabilityTerm = pheromone * heuristic;
      }
      probabilitySum += possibility.probabilityTerm;
    });
    _.forEach(possibilities, function (possibility) {
      possibility.probability = possibility.probabilityTerm / probabilitySum;
    });
  }

  function buildTree(pheromones, lambdas, settings) {
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
      calculateProbabilities(explore, pheromones, lambdas, settings);
      let chosen;

      if (Math.random() < settings.randomChoiceRate) {
        chosen = randomizeAccordingToProbabilities(explore);
      } else {
        chosen = _.maxBy(explore, 'probability');
      }

      if (!chosen) { debugger; }

      tree.createEdge(chosen.parent, chosen.vertex);
      _.pull(destinations, chosen.vertex);
      _.pull(explore, chosen);
      pheromones[chosen.parent][chosen.vertex] *= 1 - settings.trailPersistence;
      pheromones[chosen.parent][chosen.vertex] += settings.trailPersistence * settings.initialPheromoneValue;
      _.forEach(graph.getEdges(chosen.vertex), function (v) {
        if (!isVisible[v]) {
          explore.push({parent: chosen.vertex, vertex: v});
          isVisible[v] = true;
        }
      });
    }


    tree.prune(settings.network.root, settings.network.destinations);
    // moea.help.graphDesigner.draw(tree, settings.network.root, settings.network.destinations);
    return tree;
  }

  function buildSolutions(lambdaCombinations, pheromones, settings) {
    return _.map(lambdaCombinations, function (lambdas) {
      var tree = buildTree(pheromones, lambdas, settings);
      return {
        solution: tree,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives)
      };
    });
  }

  function createPheromoneMatrix(size, initialPheromoneValue) {
    var matrix = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return matrix;
  }

  function updateArchive(archive, solutions) {
    var newArchive = archive;
    _.forEach(solutions, function (sol) {
      newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, sol, 'evaluation');
    });
    return newArchive;
  }

  function updatePheromones(pheromones, trailPersistence, archive, evaluationProperty, pheromoneBounds) {
    _.forEach(archive, function (individual) {
      var pheromoneDeposit = 1 / _.sum(individual[evaluationProperty]);
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] *= 1 - trailPersistence;
          pheromones[v][e] += trailPersistence * pheromoneDeposit;
          if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
          if (pheromones[v][e] < pheromoneBounds.min) pheromones[v][e] = pheromoneBounds.min;
        });
      });
    });
  }

  function updatePheromonesMmmas(pheromones, trailPersistence, archive, evaluationProperty) {
    _.forEach(archive, function (individual) {
      var pheromoneDeposit = 1 / _.sum(individual[evaluationProperty]);
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] *= 1 - trailPersistence;
          pheromones[v][e] += trailPersistence * pheromoneDeposit;
          let maxPheromoneLevel = pheromoneDeposit / (1 - trailPersistence);
          if (pheromones[v][e] > maxPheromoneLevel) pheromones[v][e] = maxPheromoneLevel;
        });
      });
    });
  }

  function moacs(settings) {
    var norm = moea.help.normalization,
        graphSize = settings.network.graph.size().vertices,
        pheromones = createPheromoneMatrix(graphSize, settings.initialPheromoneValue),
        evaluationProperty = settings.shouldNormalize ? 'normalizedEvaluation' : 'evaluation',
        extremes = norm.initializeExtremes(settings.objectives.length),
        archive = [];

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      // let lambdaCombinations = createLambdaCombinations(settings.m, settings.heuristicFunctions.length);
      let lambdaCombinations = createBasepLambdas(settings.populationSize, settings.heuristicFunctions.length);
      let solutions = buildSolutions(lambdaCombinations, pheromones, settings);
      let newArchive = updateArchive(archive, solutions);
      if (newArchive !== archive) {
        pheromones = createPheromoneMatrix(graphSize, settings.initialPheromoneValue);
        archive = newArchive;
      } else {
        norm.normalize([], archive, extremes);
        updatePheromones(pheromones, settings.trailPersistence, archive, evaluationProperty, settings.pheromoneBounds);
      }
    }

    return _.map(archive, 'solution');
  }

  function evaporatePheromones(pheromones, trailPersistence, minPheromoneValue) {
    for (let i = 0; i < pheromones.length; i++) {
      for (let j = 0; j < pheromones[i].length; j++) {
        pheromones[i][j] *= 1 - trailPersistence;
        if (pheromones[i][j] < minPheromoneValue) pheromones[i][j] = minPheromoneValue;
      }
    }
  }

  function mmmas(settings) {
    var norm = moea.help.normalization,
        graphSize = settings.network.graph.size().vertices,
        pheromones = createPheromoneMatrix(graphSize, settings.initialPheromoneValue),
        evaluationProperty = settings.shouldNormalize ? 'normalizedEvaluation' : 'evaluation',
        extremes = norm.initializeExtremes(settings.objectives.length),
        minPheromoneValue = 0.001,
        archive = [];

    settings.randomChoiceRate = 1;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);
      let solutions = buildSolutions(pheromones, settings);
      archive = updateArchive(archive, solutions);
      norm.normalize([], archive, extremes);
      evaporatePheromones(pheromones, settings.trailPersistence, minPheromoneValue);
      updatePheromonesMmmas(pheromones, settings.trailPersistence, archive, evaluationProperty);
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moacs.main.execute', moacs);
  _.set(moea, 'method.mmmas.main.execute', moacs);
}());
