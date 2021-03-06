(function () {
  'use strict';

  var params, pheromoneTables;

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

  function getHeuristic(sourceVertex, targetVertex, heuristics) {
    return _.sumBy(heuristics, function (heuristic) {
      return heuristic[sourceVertex][targetVertex];
    }) / heuristics.length;
  }

  function calculateProbabilities(possibilities, tableIndex, pheromones, alpha, beta, heuristics) {
    var probabilitySum = 0;

    _.forEach(possibilities, function (possibility) {
      if (!possibility.probabilityTerm) {
        let pheromone = Math.pow(pheromones.getValue(tableIndex, possibility.parent, possibility.vertex), alpha);
        let heuristic = Math.pow(getHeuristic(possibility.parent, possibility.vertex, heuristics), beta);
        possibility.probabilityTerm = pheromone * heuristic;
      }
      probabilitySum += possibility.probabilityTerm;
    });
    _.forEach(possibilities, function (possibility) {
      possibility.probability = possibility.probabilityTerm / probabilitySum;
    });
  }

  function buildTree(tableIndex, pheromones, sampleSize, graph, root, destinations, alpha, beta, heuristics) {
    var tree = new moea.help.Graph(),
        vertices = [],
        explore = [],
        destinationsToReach = _.clone(destinations);

    for (let i = 0; i < graph.size().vertices; i++) {
      vertices.push({vertex: i, isVisited: false, parent: null});
    }

    _.forEach(graph.getEdges(root), function (v) {
      vertices[v].parent = root;
      explore.push(vertices[v]);
    });

    vertices[root].isVisited = true;

    while(destinationsToReach.length && explore.length) {
      let sample = _.sampleSize(explore, sampleSize);
      if (!pheromones.getValue) {
        debugger;
      }
      calculateProbabilities(sample, tableIndex, pheromones, alpha, beta, heuristics);
      let chosen = randomizeAccordingToProbabilities(sample);
      _.pull(explore, chosen);
      if (!chosen.isVisited) {
        chosen.isVisited = true;
        _.pull(destinationsToReach, chosen.vertex);
        tree.createEdge(chosen.parent, chosen.vertex);
        _.forEach(graph.getEdges(chosen.vertex), function (v) {
          if (!vertices[v].parent) {
            explore.push(vertices[v]);
            vertices[v].parent = chosen.vertex;
          } else if (!vertices[v].isVisited) {
            let options = [vertices[v], {parent: chosen.vertex, vertex: v}];
            calculateProbabilities(options, tableIndex, pheromones, alpha, beta, heuristics);
            let node = randomizeAccordingToProbabilities(options);
            vertices[v].parent = node.parent;
            vertices[v].probabilityTerm = node.probabilityTerm;
          }
        });
      }
    }

    tree.prune(root, destinations);
    // if (Math.random() < mutation.rate) {
    //   tree = mutation.method(tree);
    // }
    return tree.asArray();
  }

  function buildSolutions(offset, populationSize, pheromones, sampleSize, graph, root, destinations, alpha, beta, heuristics) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(buildTree((i + offset) % pheromones.getNumberOfTables(), pheromones, sampleSize, graph, root, destinations,
        alpha, beta, heuristics));
    }
    return population;
  }

  importScripts(
    '../../../lib/lodash.js',
    '../../../lib/seedrandom.js',
    '../../../lib/seedrandom.fix.js',
    '../../../help/help.pareto.js',
    '../../../help/help.Graph2.js',
    'mdt-aco.parallel.Pheromones.js'
  );

  onmessage = function (e) {
    if (e.data === 'run') {
      postMessage(JSON.stringify(buildSolutions(params.offset, params.populationSize, pheromoneTables,
        params.sampleSize, params.graph, params.root, params.destinations, params.alpha, params.beta,
        params.heuristics)));
    } else if (e.data instanceof SharedArrayBuffer) {
      pheromoneTables = new moea.method.mdtAcoParallel.Pheromones(params.weights, params.graph.size().vertices, e.data);
    } else {
      params = JSON.parse(e.data);
      Math.seedrandom(params.seed);
      params.graph = new moea.help.Graph(params.graph);
    }
  };

}());
