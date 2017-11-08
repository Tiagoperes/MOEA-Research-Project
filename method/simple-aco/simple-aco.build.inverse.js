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

  function getHeuristic(sourceVertex, targetVertex, heuristics) {
    return _.sumBy(heuristics, function (heuristic) {
      return heuristic(sourceVertex, targetVertex);
    }) / heuristics.length;
  }

  function getProbabilities(parent, children, probabilityMatrix, pheromones, heuristics, alpha, beta) {
    var probabilitySum = 0;

    _.forEach(children, function (child) {
      if (!probabilityMatrix[parent][child]) {
        let pheromone = Math.pow(pheromones[parent][child], alpha);
        let heuristic = Math.pow(getHeuristic(parent, child, heuristics), beta);
        probabilityMatrix[parent][child] = pheromone * heuristic;
      }
      probabilitySum += probabilityMatrix[parent][child];
    });

    return _.map(children, function (child) {
      return probabilityMatrix[parent][child] / probabilitySum;
    });
  }

  function chooseVertexToExplore(parent, children, probabilityMatrix, pheromoneTable, heuristics, alpha, beta) {
    var probabilities = getProbabilities(parent, children, probabilityMatrix, pheromoneTable, heuristics, alpha, beta),
        map = _.map(children, function (child, index) {
          return {vertex: child, probability: probabilities[index]};
        });
    return randomizeAccordingToProbabilities(map).vertex;
  }

  function createAnts(positions) {
    return _.map(positions, function (p) {
      return {
        position: p,
        path: [],
        isVisited: []
      };
    });
  }

  // function buildSolution(pheromoneTable, heuristics, graph, root, destinations, alpha, beta) {
  //   var ants = createAnts(_.concat(destinations, [root])),
  //       visitedBy = [],
  //       components = ants.length,
  //       probabilityMatrix = [];
  //
  //   for (let i = 0; i < graph.size().vertices; i++) {
  //     probabilityMatrix[i] = [];
  //   }
  //
  //   while (components > 1) {
  //     for (let i = 0; i < ants.length; i++) {
  //       if (ants[i].position === undefined) continue;
  //       let pos = ants[i].position;
  //       if (visitedBy[pos] !== undefined) {
  //         let mergingAnt = ants[visitedBy[pos]];
  //         for (let j = 0; j < graph.size().vertices; j++) {
  //           mergingAnt.isVisited[j] = mergingAnt.isVisited[j] || ants[i].isVisited[j];
  //         }
  //         _.forEach(ants, function (ant) {
  //           if (ant.isVisited === ants[i].isVisited) {
  //             ants[i].isVisited = mergingAnt.isVisited;
  //           }
  //         });
  //         ants[i].path.push(ants[i].position);
  //         components--;
  //       }
  //
  //       visitedBy[pos] = i;
  //       ants[i].isVisited[pos] = true;
  //
  //       let connected = [];
  //       while (!connected.length && ants[i].position !== undefined) {
  //         connected = _.filter(graph.getEdges(ants[i].position), function (v) {
  //           return !ants[i].isVisited[v];
  //         });
  //         if (!connected.length) {
  //           ants[i].position = ants[i].path.pop();
  //         }
  //       }
  //       if (ants[i].position !== undefined) {
  //         let chosen = chooseVertexToExplore(ants[i].position, connected, probabilityMatrix, pheromoneTable, heuristics, alpha, beta);
  //         ants[i].path.push(ants[i].position);
  //         ants[i].position = chosen;
  //       }
  //     }
  //   }
  //
  //   var tree = new moea.help.Graph();
  //   _.forEach(ants, function (ant) {
  //     for (let i = 1; i < ant.path.length; i++) {
  //       tree.createEdge(ant.path[i - 1], ant.path[i]);
  //     }
  //   });
  //
  //   return tree;
  // }

  function walk(ant, graph, tree, probabilityMatrix, pheromoneTable, heuristics, alpha, beta) {
    if (ant.isDead) return;
    var connections = _.filter(graph.getEdges(ant.position), function (v) {
      return !ant.isVisited[v];
    });
    while (!connections.length && ant.path.length) {
      ant.position = ant.path.pop();
      connections = _.filter(graph.getEdges(ant.position), function (v) {
        return !ant.isVisited[v];
      });
    }
    if (!connections.length && !ant.path.length) {
      ant.isDead = true;
    } else {
      let chosen = chooseVertexToExplore(ant.position, connections, probabilityMatrix, pheromoneTable, heuristics, alpha, beta);
      tree.createEdge(ant.position, chosen);
      tree.createEdge(chosen, ant.position);
      ant.path.push(ant.position);
      ant.position = chosen;
      ant.isVisited[chosen] = true;
    }
  }

  function mergeComponents(ants, antA, antB) {
    var length;
    if (antA.isVisited.length > antB.isVisited.length) length = antA.isVisited.length;
    else length = antB.isVisited.length;

    for (let i = 0; i < length; i++) {
      antA.isVisited[i] = antA.isVisited[i] || antB.isVisited[i];
    }

    var toBeUpdated = antB.isVisited;
    _.forEach(ants, function (ant) {
      if (ant.isVisited === toBeUpdated) {
        ant.isVisited = antA.isVisited;
      }
    });
  }

  function buildSolution(pheromoneTable, heuristics, graph, root, destinations, alpha, beta) {
    var ants = createAnts(_.concat(destinations, [root])),
        tree = new moea.help.Graph(),
        visitedBy = [],
        components = ants.length,
        probabilityMatrix = [];

    for (let i = 0; i < graph.size().vertices; i++) {
      probabilityMatrix[i] = [];
    }

    for (let i = 0; i < ants.length; i++) {
      visitedBy[ants[i].position] = ants[i];
      ants[i].isVisited[ants[i].position] = true;
    }

    // console.log('---');
    while (components > 1) {
      for (let i = 0; i < ants.length; i++) {
        // var ppos = ants[i].position;
        walk(ants[i], graph, tree, probabilityMatrix, pheromoneTable, heuristics, alpha, beta);
        // console.log(ppos + ' -> ' + ants[i].position + (ants[i].isDead ? ' : dead' : ' : alive'));
        if (!ants[i].isDead && visitedBy[ants[i].position]) {
          // console.log(ants[i].isVisited === visitedBy[ants[i].position].isVisited);
          mergeComponents(ants, ants[i], visitedBy[ants[i].position]);
          // console.log(i + ', ' + _.indexOf(ants, visitedBy[ants[i].position]));
          components--;
        }
        visitedBy[ants[i].position] = ants[i];
        if (components === 1) break;
      }
      // console.log('-');
    }

    // console.log(_.uniqWith(ants, function (a, b) {return a.isVisited === b.isVisited}).length);

    var t = new moea.help.Graph();
    var explore = [root];
    var isVisited = [];
    while (explore.length) {
      let node = explore.pop();
      isVisited[node] = true;
      _.forEach(tree.getEdges(node), function (v) {
        if (!isVisited[v]) {
          t.createEdge(node, v);
          explore.push(v);
        }
      });
    }

    // moea.help.graphDesigner.draw(tree, root, destinations);

    t.prune(root, destinations);
    // moea.help.graphDesigner.draw(t, root, destinations);
    return t;
  }

  function buildSolutions(populationSize, pheromoneTable, heuristics, graph, root, destinations, sampleSize, alpha, beta, objective) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      let solution = buildSolution(pheromoneTable, heuristics, graph, root, destinations, alpha, beta);
      population.push({
        solution: solution,
        fitness: objective(solution)
      });
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.simpleAco.build.inverse.buildSolutions', buildSolutions);

}());
