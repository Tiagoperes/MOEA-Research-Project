(function () {
  'use strict';

  function randomizeAccordingToInverseProbabilities(set) {
    for (let i = 0; i < set.length; i++) {
      set[i].probability = 1 - set[i].probability;
    }
    return randomizeAccordingToProbabilities(set);
  }

  function randomizeAccordingToProbabilities(set) {
    var ordered = _.orderBy(set, 'probability'),
        rand = Math.random(),
        sum = 0,
        i = -1;

    // var total = 1;
    // for (let i = 2; i <= ordered.length; i++) {
    //   total += i;
    // }
    // for (let i = 0; i < ordered.length; i++) {
    //   ordered[i].probability = (i + 1) / total;
    // }

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

  function buildTree1(pheromones, settings) {
    var graph = settings.network.graph,
        root = settings.network.root,
        destinations = _.clone(settings.network.destinations),
        tree = new moea.help.Graph(),
        explore = _.map(graph.getEdges(root), function (v) {return {parent: root, vertex: v}}),
        isVisible = [],
        maxExplore = 0;

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
      if (explore.length > maxExplore) maxExplore = explore.length;
    }


    tree.prune(settings.network.root, settings.network.destinations);
    // moea.help.graphDesigner.draw(tree, settings.network.root, settings.network.destinations);
    // if (Math.random() < settings.mutation.rate) {
    //   tree = settings.mutation.method(tree);
    // }
    window.exploration = window.exploration || [];
    window.exploration.push(maxExplore);
    return tree;
  }

  function buildTree2(pheromones, settings) {
    var graph = settings.network.graph,
      root = settings.network.root,
      destinations = _.clone(settings.network.destinations),
      tree = new moea.help.Graph(),
      explore = _.map(graph.getEdges(root), function (v) {return {parent: root, vertex: v}}),
      isVisited = [],
      maxExplore = 0;

    isVisited[settings.network.root] = true;

    while(destinations.length && explore.length) {
      var sample = explore;
      calculateProbabilities(sample, pheromones, settings);
      let chosen = randomizeAccordingToProbabilities(sample);
      // let chosen = _.maxBy(sample, 'probability');
      _.pull(explore, chosen);
      if (!isVisited[chosen.vertex]) {
        isVisited[chosen.vertex] = true;
        _.pull(destinations, chosen.vertex);
        tree.createEdge(chosen.parent, chosen.vertex);
        window.visited++;
        _.forEach(graph.getEdges(chosen.vertex), function (v) {
          explore.push({parent: chosen.vertex, vertex: v});
        });
      }
      if (explore.length > maxExplore) maxExplore = explore.length;
    }

    window.exploration = window.exploration || [];
    window.exploration.push(maxExplore);
    tree.prune(settings.network.root, settings.network.destinations);
    // if (Math.random() < settings.mutation.rate) {
    //   tree = settings.mutation.method(tree);
    // }
    return tree;
  }

  function buildTree3(pheromones, settings, sampleSize) {
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

    // var cp = randomizeAccordingToProbabilities;
    // if (Math.random() < settings.mutation.rate) {
    //   cp = randomizeAccordingToInverseProbabilities;
    // }

    while(destinations.length && explore.length) {
      var sample = _.map(_.sampleSize(explore, sampleSize), function (v) { return {parent: parents[v], vertex: v}; });
      // if (Math.random() < settings.mutation.rate) {
      //   cp(sample, pheromones, settings);
      // } else {
        calculateProbabilities(sample, pheromones, settings);
      // }
      let chosen = randomizeAccordingToProbabilities(sample);
      // let chosen = _.maxBy(sample, 'probability');
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
    // if (Math.random() < settings.mutation.rate) {
    //   tree = settings.mutation.method(tree);
    // }
    return tree;
  }

  var buildTree = buildTree3;

  function buildSolutions(populationSize, pheromones, settings, sampleSize) {
    var solutions = [];
    var tables = _.sampleSize(pheromones, populationSize);
    for (let i = 0; i < populationSize; i++) {
      let tree = buildTree([tables[i%tables.length]], settings, sampleSize);
      solutions.push({
        solution: tree,
        evaluation: moea.help.pareto.getSolutionInObjectiveSpace(tree, settings.objectives)
      });
    }
    return solutions;
  }

  function createPheromoneTable(weights, size, initialPheromoneValue) {
    var table = {weights: weights, values: [], score: 0, pathTable: createPathTable(size)};
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

  function updateBestsByTables(bests, population, tables) {
    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < tables.length; j++) {
        bests[j] = bests[j] || [];
        bests[j] = moea.help.pareto.updateNonDominatedSet(bests[j], population[i], _.partial(applyWeightMaskToIndividual, _, tables[j].weights));
      }
    }
  }

  // function updateBestsByTablesMEAN(bests, population, tables) {
  //   var nobjectives = population[0].evaluation.length,
  //       max = _.fill(new Array(nobjectives), -Infinity),
  //       min = _.fill(new Array(nobjectives), Infinity),
  //       everybody = _.concat(population, _.flatten(bests));
  //
  //   for (let i = 0; i < everybody.length; i++) {
  //     for (let j = 0; j < nobjectives; i++) {
  //       if (everybody[i].evaluation[j] > max[j]) max[j] = everybody[i].evaluation[j];
  //       if (everybody[i].evaluation[j] < min[j]) min[j] = everybody[i].evaluation[j];
  //     }
  //   }
  //
  //   for (let i = 0; i < bests.length; i++) {
  //     for (let j = 0; j < bests[i].length; j++) {
  //       bests[i][j].norm = _.sum(_.map)
  //     }
  //   }
  // }

  // function dividePopulationInGroups(population, groupSize) {
  //   var groups = [];
  //   if (population.length <= groupSize) {
  //     return _.map(population, function (s) { return [s]; });
  //   }
  //   let numberOfObjectives = population[0].evaluation.length;
  //   let min = _.fill(new Array(numberOfObjectives), Infinity);
  //   let max = _.fill(new Array(numberOfObjectives), -Infinity);
  //   for (let i = 0; i < population.length; i++) {
  //     for (let j = 0; j < numberOfObjectives; j++) {
  //       if (population[i].evaluation[j] < min[j]) min[j] = population[i].evaluation[j];
  //       if (population[i].evaluation[j] > max[j]) max[j] = population[i].evaluation[j];
  //     }
  //   }
  //
  //   for (let i = 0; i < population.length; i++) {
  //     population[i].norm = [];
  //     for (let j = 0; j < numberOfObjectives; j++) {
  //       population[i].norm[j] = (population[i].evaluation[j] - min[j]) / (max[j] - min[j]);
  //     }
  //   }
  //
  //   for (let i = 0; i < population.length; i++) {
  //     var minDist = Infinity, closestPoint;
  //     for (let j = 0; j < groupSize; j++) {
  //       let point = _.fill(new Array(numberOfObjectives), j / groupSize);
  //       let dist = moea.help.distance.getEuclideanDistance(population[i].norm, point);
  //       if (dist < minDist) {
  //         minDist = dist;
  //         closestPoint = j;
  //       }
  //     }
  //     groups[closestPoint] = groups[closestPoint] || [];
  //     groups[closestPoint].push(population[i]);
  //   }
  //
  //   return _.filter(groups);
  // }

  function dividePopulationInGroups(population, numberOfGroups) {
    if (population.length <= numberOfGroups) {
      return _.map(population, function (s) { return [s]; });
    }
    let numberOfObjectives = population[0].evaluation.length;
    let obj = _.random(numberOfObjectives - 1);
    let ordered = _.orderBy(population, function (individual) {
      return individual.evaluation[obj];
    });
    return _.chunk(ordered, Math.ceil(population.length / numberOfGroups));
  }

  function updatePheromones2(pheromones, population, trailPersistence, pheromoneBounds) {
    evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min, population.length);
    // var groups = dividePopulationInGroups(population, 5);
    _.forEach(population, function (individual) {
      // var individual = _.sample(group);
      var pheromoneDeposit = trailPersistence;
      var vertices = individual.solution.getVertices();
      // evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min);
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          pheromones[v][e] += pheromoneDeposit;
          if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
        });
      });
    });
  }

  function updatePheromones3(pheromones, population, trailPersistence, pheromoneBounds) {
    // evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min);
    resetPheromones(pheromones, pheromoneBounds.max * (1 - trailPersistence));
    var counted = [];
    for (let i = 0; i < pheromones[0].length; i++) {
      counted[i] = [];
    }
    _.forEach(population, function (individual) {
      var pheromoneDeposit = trailPersistence;
      var vertices = individual.solution.getVertices();
      _.forEach(vertices, function (v) {
        var edges = individual.solution.getEdges(v);
        _.forEach(edges, function (e) {
          if (!counted[v][e]) {
            pheromones[v][e] += pheromoneDeposit;
            if (pheromones[v][e] > pheromoneBounds.max) pheromones[v][e] = pheromoneBounds.max;
            counted[v][e] = true;
          }
        });
      });
    });
  }

  function updatePheromones4(pheromones, population, trailPersistence, pheromoneBounds) {
    evaporatePheromones(pheromones, trailPersistence, pheromoneBounds.min, population.length);
    _.forEach(population, function (individual) {
      var pheromoneDeposit = trailPersistence;
      _.forEach(individual.solution.asEdgeList(), function (e) {
          pheromones[e[0]][e[1]] += pheromoneDeposit;
          if (pheromones[e[0]][e[1]] > pheromoneBounds.max) pheromones[e[0]][e[1]] = pheromoneBounds.max;
      });
    });
  }

  function updatePheromones(pheromones, population, trailPersistence, pheromoneBounds) {
    // console.log(population.length);
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

  function resetPheromones(pheromones, value) {
    for (let i = 0; i < pheromones.length; i++) {
      for (let j = 0; j < pheromones[i].length; j++) {
        pheromones[i][j] = value;
      }
    }
  }

  function setPheromones(pheromones, population, trailPersistence, pheromoneBounds) {
    resetPheromones(pheromones, pheromoneBounds.max * (1 - trailPersistence));
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

  function maco4(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        archive = [], iterationBests = [];


    // var tableMap = [];
    // var tables = [];
    // _.forEach(pheromoneTables, function (t) {
    //   var no = _.filter(t.weights).length - 2;
    //   tableMap[no] = tableMap[no] || [];
    //   tableMap[no].push(t);
    // });
    // _.forEach(tableMap, function (ts) {
    //   tables.push(_.sample(ts));
    // });
    // pheromoneTables = tables;

    // var all = _.last(pheromoneTables);
    // pheromoneTables = _.sampleSize(_.dropRight(pheromoneTables), 10);
    // pheromoneTables.push(all);

    var buildSolutionTime = 0, updatePheromonesTime = 0;
    var sampleSize = 2;

    // settings.beta = 0.8;
    // var betaInc = 2 / settings.numberOfGenerations;
    for (let i = 0; i < settings.numberOfGenerations; i++) {
      window.visited = 0;

      if (settings.numberOfGenerations <= 1000 || i % 100 === 0)
        moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let t = new Date().getTime();
      // if (i > 0 && i % 10 === 0) {
      //   // enter blocking mode
      //   // settings.beta *= 100;
      //   var blocked = 0;
      //   _.forEach(pheromoneTables, function (pt) {
      //     var t = pt.values;
      //     for (let j = 0; j < t.length; j++) {
      //       for (let k = 0; k < t[j].length; k++) {
      //         if (t[j][k] >= 0.5) {
      //           t[j][k] = 0;
      //           blocked++;
      //         }
      //       }
      //     }
      //   });
      //   // settings.beta /= 100;
      //   console.log('table size: ' + pheromoneTables.length + '; mean of blocks: ' + (blocked / pheromoneTables.length));
      // }
      let solutions = buildSolutions(settings.populationSize, pheromoneTables, settings, sampleSize);
      buildSolutionTime += new Date().getTime() - t;

      // if (i % 20 === 0) {
      //   _.forEach(pheromoneTables, function (t) {
      //     for (let j = 0; j < t.length; j++) {
      //       for (let k = 0; k < t[j].length; k++) {
      //         t[j][k] = settings.pheromoneBounds.max;
      //       }
      //     }
      //   });
      // }

      let uniq = _.uniqWith(solutions, function (a, b) {return _.isEqual(a.evaluation, b.evaluation)});
      solutions = _.concat(uniq, moea.method.ga.generateRandomPopulation(solutions.length - uniq.length, settings.randomize, settings.objectives));

      t = new Date().getTime();

      // console.log(solutions.length + ' solutions. ' + _.uniqWith(solutions, function (a, b) {return _.isEqual(a.evaluation, b.evaluation)}).length);
      // _.forEach(solutions, function (s) {
      //   archive = moea.help.pareto.updateNonDominatedSet(archive, s, 'evaluation');
      // });
      // let iterationBests = getBestsByTables(archive, pheromoneTables);

      // _.forEach(pheromoneTables, function (table, index) {
        // var g = iterationBests[index][0].solution.clone();
        // for (let i = 1; i < iterationBests[index].length; i++) {
        //   g.merge(iterationBests[index][i].solution);
        // }
        // updatePheromones2(table.values, [{solution: g}], settings.trailPersistence, settings.pheromoneBounds);
        // updatePheromones2(table.values, iterationBests[index], settings.trailPersistence, settings.pheromoneBounds);
      // });

      let iterationBests = getBestsByTables(solutions, pheromoneTables);
      // updateBestsByTables(iterationBests, solutions, pheromoneTables);

      _.forEach(_.last(iterationBests), function (s) {
        archive = moea.help.pareto.updateNonDominatedSet(archive, s, 'evaluation');
      });

      _.forEach(pheromoneTables, function (table, index) {
        var g = iterationBests[index][0].solution.clone();
        for (let i = 1; i < iterationBests[index].length; i++) {
          g.merge(iterationBests[index][i].solution);
        }
        updatePheromones2(table.values, [{solution: g}], settings.trailPersistence, settings.pheromoneBounds);
      });

      // _.forEach(pheromoneTables, function (table, index) {
      //   updatePheromones2(table.values, iterationBests[index], settings.pheromoneBounds.max, settings.pheromoneBounds);
      // });

      updatePheromonesTime += new Date().getTime() - t;

      sampleSize += 0.5;
      // if (i < settings.numberOfGenerations / 2) settings.beta += betaInc;
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(archive, 'solution');
    // return _.map(_.last(iterationBests), 'solution');
  }

  function createSolutions(pheromoneTables, sampleSize, settings) {
    return buildSolutions(settings.populationSize, pheromoneTables, settings, sampleSize);
    // let unique = _.uniqWith(solutions, function (a, b) {return _.isEqual(a.evaluation, b.evaluation)});
    // return _.concat(unique, moea.method.ga.generateRandomPopulation(solutions.length - unique.length, settings.randomize, settings.objectives));
  }

  function calculateDiffs(prevBests, bests) {
    for (let i = 0; i < bests.length; i++) {
      if (prevBests[i] !== bests[i]) {
        let added = _.difference(bests[i], prevBests[i]);
        let removed = _.difference(prevBests[i], bests[i]);
        _.forEach(added, function (individual) {
          individual.addedTo.push(i);
        });
        _.forEach(removed, function (individual) {
          individual.removedFrom.push(i);
        });
      }
    }
  }

  function resetTableInfo(population) {
    _.forEach(population, function (individual) {
      individual.addedTo = [];
      individual.removedFrom = [];
    });
  }

  function updatePathTable(pheromoneTables, index, v1, v2, value) {
    pheromoneTables[index].pathTable[v1][v2] += value;
  }

  function updatePathTables(pheromoneTables, population) {
    var count = 0;
    _.forEach(population, function (individual) {
      if (individual.addedTo.length || individual.removedFrom.length) {
        count++;
        var vertices = individual.solution.getVertices();
        _.forEach(vertices, function (v) {
          var edges = individual.solution.getEdges(v);
          _.forEach(edges, function (e) {
            _.forEach(individual.addedTo, _.partial(updatePathTable, pheromoneTables, _, v, e, 1));
            _.forEach(individual.removedFrom, _.partial(updatePathTable, pheromoneTables, _, v, e, -1));
          });
        });
      }
    });
    console.log(count / population.length);
  }

  function updatePheromoneAccordingToPathTable(pheromoneTable, trailPersistence, pheromoneBounds) {
    for (let i = 0; i < pheromoneTable.pathTable.length; i++) {
      for (let j = 0; j < pheromoneTable.pathTable[i].length; j++) {
        pheromoneTable.values[i][j] += pheromoneTable.pathTable[i][j] * trailPersistence;
        if (pheromoneTable.values[i][j] > pheromoneBounds.max) pheromoneTable.values[i][j] = pheromoneBounds.max;
      }
    }
  }

  function updatePheromoneTables(bests, population, pheromoneTables, settings) {
    var prevBests = _.clone(bests);
    var everyone = _.concat(_.uniq(_.flatten(bests)), population);
    resetTableInfo(everyone);
    updateBestsByTables(bests, population, pheromoneTables);
    calculateDiffs(prevBests, bests);
    updatePathTables(pheromoneTables, everyone);
    _.forEach(pheromoneTables, function (table, index) {
      evaporatePheromones(table.values, settings.trailPersistence, settings.pheromoneBounds.min, bests[index].length);
      updatePheromoneAccordingToPathTable(table, settings.trailPersistence, settings.pheromoneBounds);
    });
  }

  function createPathTable(size) {
    var table = new Array(size);
    for (let i = 0; i < size; i++) {
      table[i] = _.fill(new Array(size), 0);
    }
    return table;
  }

  function run(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        bests = [],
        buildSolutionTime = 0,
        updatePheromonesTime = 0,
        sampleSize = 2;


    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let t = new Date().getTime();
      let population = createSolutions(pheromoneTables, sampleSize, settings);
      buildSolutionTime += new Date().getTime() - t;

      t = new Date().getTime();
      updatePheromoneTables(bests, population, pheromoneTables, settings);
      updatePheromonesTime += new Date().getTime() - t;

      sampleSize += 0.5;
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(_.last(bests), 'solution');
  }

  function run2(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        iterationBests = [],
        buildSolutionTime = 0,
        updatePheromonesTime = 0,
        sampleSize = 4;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let t = new Date().getTime();
      let population = createSolutions(pheromoneTables, sampleSize, settings);
      buildSolutionTime += new Date().getTime() - t;

      t = new Date().getTime();
      updateBestsByTables(iterationBests, population, pheromoneTables);
      _.forEach(pheromoneTables, function (table, index) {
        updatePheromones2(table.values, iterationBests[index], settings.trailPersistence, settings.pheromoneBounds);
      });
      updatePheromonesTime += new Date().getTime() - t;

      // sampleSize += 0.5;
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(_.last(iterationBests), 'solution');
  }

  function run3(settings) {
    var graphSize = settings.network.graph.size().vertices,
        pheromoneTables = createPheromoneTables(settings.objectives.length, graphSize, settings.initialPheromoneValue),
        archive = [],
        buildSolutionTime = 0,
        updatePheromonesTime = 0,
        sampleSize = 4;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let t = new Date().getTime();
      let population = buildSolutions(settings.populationSize, pheromoneTables, settings, sampleSize);
      buildSolutionTime += new Date().getTime() - t;

      t = new Date().getTime();
      let iterationBests = getBestsByTables(population, pheromoneTables);
      _.forEach(_.last(iterationBests), function (s) {
        archive = moea.help.pareto.updateNonDominatedSet(archive, s, 'evaluation');
      });
      _.forEach(pheromoneTables, function (table, index) {
        updatePheromones2(table.values, iterationBests[index], settings.trailPersistence, settings.pheromoneBounds);
      });
      updatePheromonesTime += new Date().getTime() - t;

      // sampleSize += 0.5;
    }

    console.log('build solution time: ' + (buildSolutionTime / 1000) + 's');
    console.log('update pheromones time: ' + (updatePheromonesTime / 1000) + 's');
    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.maco4.main.execute', run2);
}());
