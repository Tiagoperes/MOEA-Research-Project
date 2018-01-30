(function () {
  'use strict';

  const DISCONNECTION_RATE = 0.2;
  const LIM = 90;

  const MOEAD_DIVISIONS = {
    4: 90,
    9: 12,
    6: 6,
    7: 6,
    8: 6
  };

  // window.debugCross = true;
  // window.debugWeights = ['cost'];
  // window.debugMutation = true;
  // window.debugRandomGeneration = true;
  // window.debugEvaluation = true;
  // window.debugWeights = [];
  // window.debugResult = true;
  // window.crossCount = 0;
  // window.crossIdenticalCount = 0;

  window.testCross = function () {
    var p1rep = 0, p2rep = 0;
    var instance = moea.problem.prm.main.getInstance(1, 0);
    var net = instance.network;
    var objectives = moea.problem.prm.main.getObjectives(instance);
    var pop = moea.method.ga.generateRandomPopulation(200, _.partial(moea.problem.prm.recombination.similarityCrossover.reconnectGraphInTree, new moea.help.Graph(), net.graph, net.root, net.destinations, moea.problem.prm.recombination.heuristic.random), objectives);
    for (let i = 0; i < 100; i++) {
      var children = moea.method.ga.generateOffspring([[pop[i], pop[100+i]]], {
        useFilter: false,
        objectives: objectives,
        crossover: {rate: 1, method: _.partial(moea.problem.prm.recombination.pathCrossover.crossover, _, _, net.root, net.destinations)},
        // crossover: {rate: 1, method: _.partial(moea.problem.prm.recombination.similarityCrossover.crossover, _, _, net.graph, net.root, net.destinations, moea.problem.prm.recombination.heuristic.random)},
        mutation: {rate: 0, method: _.partial(moea.problem.prm.recombination.mutation.mutate, _, net.graph, net.root, net.destinations, DISCONNECTION_RATE)}
      });
      if (_.isEqual(children[0].evaluation, pop[i].evaluation)) p1rep++;
      if (_.isEqual(children[0].evaluation, pop[100+i].evaluation)) p2rep++;
    }
    return {p1: p1rep, p2: p2rep, sum: p1rep + p2rep};
  };

  var methods = {
    nsga: moea.method.nsga.main.execute,
    nsga3: moea.method.nsga3.main.execute,
    nsga3yuan: moea.method.nsga3yuan.main.execute,
    spea: moea.method.spea.main.execute,
    speaSde: moea.method.spea.main.execute,
    moead: moea.method.moead.main.execute,
    moeadd: moea.method.moeadd.main.execute,
    aemmt: moea.method.aemmt.main.execute,
    aemmtf: moea.method.aemmt.main.execute,
    aemmd: moea.method.aemmd.main.execute,
    psotree: moea.method.psotree.main.execute,
    mdtAco: moea.method.mdtAco.main.execute,
    mdtAcoParallel: moea.method.mdtAcoParallel.main.execute,
    prim: moea.method.prim.main.execute,
    simpleAco: moea.method.simpleAco.main.execute,
    multiAco: moea.method.multiAco.main.execute,
    manyAco: moea.method.manyAco.main.execute,
    manyAcoSde: moea.method.manyAco.main.execute,
    moacsBp: moea.method.moacsBp.main.execute
  };

  function getConfig(method, instance) {
    var prm = moea.problem.prm.main,
        net = instance.network,
        problemWeights = prm.getProblemWeights(instance.problem),
        dijkstra, dijkstraWeights;

    if (net.name === 5) {
      _.pull(problemWeights, 'delay');
    }

    dijkstraWeights = _.map(problemWeights, function (property) {
      return _.map(net.weights, function (weightList) {
        return _.map(weightList, function (weight) {
          if (weight) {
            if (property === 'capacity') return 1 / weight[property];
            return weight[property];
          }
        });
      })
    });
    dijkstra = _.partial(moea.problem.prm.recombination.heuristic.dijkstra, _.partial(_.sample, dijkstraWeights));

    function mixedCrossover() {
      var methods = [
        _.partial(moea.problem.prm.recombination.similarityCrossover.crossover, _, _, net.graph, net.root, net.destinations, moea.problem.prm.recombination.heuristic.random),
        _.partial(moea.problem.prm.recombination.similarityCrossover.crossover, _, _, net.graph, net.root, net.destinations, dijkstra),
        _.partial(moea.problem.prm.recombination.pathCrossover.crossover, _, _, net.root, net.destinations),
        _.partial(moea.problem.prm.recombination.pathCrossover.crossover, _, _, net.root, net.destinations)
      ];
      return _.sample(methods).apply(this, arguments);
    }

    if (window.debugWeights) window.debugWeightMatrix = instance.network.weights;
    if (window.debugEvaluation) {
      window.evalData = {
        instance: instance,
        functions: prm.getAllEvaluationFunctions(),
        dataFlow: prm.getDataFlow()
      }
    }

    function getMaxEdges(graph) {
      var max = 0;
      for (let i = 0; i < graph.size().vertices; i++) {
        let numberOfEdges = graph.getEdges(i).length;
        if (numberOfEdges > max) max = numberOfEdges;
      }
      return max;
    }

    var max = {cost: -Infinity, delay: -Infinity, traffic: -Infinity, capacity: -Infinity},
        min = {cost: Infinity, delay: Infinity, traffic: Infinity, capacity: Infinity};

    _.forEach(net.weights, function (weightList) {
      _.forEach(weightList, function (weight) {
        if (weight) {
          if (weight.cost > max.cost) max.cost = weight.cost;
          if (weight.delay > max.delay) max.delay = weight.delay;
          if (weight.traffic > max.traffic) max.traffic = weight.traffic;
          if (weight.capacity > max.capacity) max.capacity = weight.capacity;
          if (weight.cost < min.cost) min.cost = weight.cost;
          if (weight.delay < min.delay) min.delay = weight.delay;
          if (weight.traffic < min.traffic) min.traffic = weight.traffic;
          if (weight.capacity < min.capacity) min.capacity = weight.capacity;
        }
      });
    });

    var normalizedWeights = _.cloneDeep(net.weights);
    _.forEach(normalizedWeights, function (weightList) {
      _.forEach(weightList, function (weight) {
        if (weight) {
          weight.cost = (weight.cost - min.cost) / (max.cost - min.cost);
          weight.delay = (weight.delay - min.delay) / (max.delay - min.delay);
          weight.traffic = (weight.traffic - min.traffic) / (max.traffic - min.traffic);
          weight.capacity = (weight.capacity - min.capacity) / (max.capacity - min.capacity);
        }
      });
    });

    var singleObjectiveWeightMatrix = _.map(normalizedWeights, function (weightList) {
      return _.map(weightList, function (weights) {
        if (weights === null) return null;
        return weights.cost * weights.delay;
      });
    });

    function singleObjective(tree) {
      var cost = 0,
          treeArray = tree.asArray();

      for (let i = 0; i < treeArray.length; i++) {
        if (treeArray[i]) {
          for (let j = 0; j < treeArray[i].length; j++) {
            cost += singleObjectiveWeightMatrix[i][treeArray[i][j]];
          }
        }
      }

      return cost;
    }

    function buildHeuristicTables() {
      var tables = [];

      for (let i = 0; i < 4; i++) {
        tables[i] = [];
        for (let j = 0; j < normalizedWeights.length; j++) {
          tables[i][j] = [];
        }
      }

      for (let i = 0; i < normalizedWeights.length; i++) {
        for (let j = 0; j < normalizedWeights[i].length; j++) {
          if (normalizedWeights[i][j]) {
            tables[0][i][j] = (1 - normalizedWeights[i][j].cost) || 0.000001;
            tables[1][i][j] = (1 - normalizedWeights[i][j].delay) || 0.000001;
            tables[2][i][j] = (1 - normalizedWeights[i][j].traffic) || 0.000001;
            tables[3][i][j] = normalizedWeights[i][j].capacity || 0.000001;
          }
        }
      }

      return tables;
    }

    var config = {
      global: {
        populationSize: 90,
        archiveSize: LIM,
        numberOfGenerations: 100,
        numberOfThreads: 8,
        shouldNormalize: true,
        useFilter: true,
        elementsPerTable: 30,
        randomize: _.partial(moea.problem.prm.recombination.similarityCrossover.reconnectGraphInTree, new moea.help.Graph(), net.graph, net.root, net.destinations, moea.problem.prm.recombination.heuristic.random),
        // randomize: _.partial(moea.help.tree.randomize.generateRandom, net.graph, net.root, net.destinations),
        objectives: prm.getObjectives(instance),
        // crossover: {rate: 1, method: _.partial(moea.problem.prm.recombination.similarityCrossover.crossover, _, _, net.graph, net.root, net.destinations, moea.problem.prm.recombination.heuristic.random)},
        // crossover: {rate: 1, method: _.partial(moea.problem.prm.recombination.similarityCrossover.crossover, _, _, net.graph, net.root, net.destinations, dijkstra)},
        // crossover: {rate: 1, method: _.partial(moea.problem.prm.recombination.pathCrossover.crossover, _, _, net.root, net.destinations)},
        crossover: {rate: 1, method: mixedCrossover},
        mutation: {rate: 0.2, method: _.partial(moea.problem.prm.recombination.mutation.mutate, _, net.graph, net.root, net.destinations, DISCONNECTION_RATE)}
      },
      nsga: {},
      nsga3: {
        numberOfMeanPoints: 7 // must be (power of 2) - 1
      },
      spea: {
        shouldUseSDE: false
      },
      speaSde: {
        shouldUseSDE: true
      },
      moead: {
        isRandomWeights: true,
        neighborhoodSize: 10,
        useTchebycheff: false
      },
      moeadd: {
        comparisons: 9000,
        divisions: MOEAD_DIVISIONS[instance.problem],
        neighborhoodSize: 10,
        localReproductionRate: 0.9
      },
      aemmt: {
        dominationTableLimit: 90,
        numberOfGenerations: 9000
      },
      aemmtf: {
        dominationTableLimit: Infinity,
        numberOfGenerations: 9000
      },
      aemmd: {
        numberOfGenerations: 9000
      },
      psotree: {
        comparisons: 9000,
        divisions: MOEAD_DIVISIONS[instance.problem],
        w: 0.5,
        c1: 1,
        c2: 1.5,
        maxVertices: net.graph.size().vertices,
        maxEdges: getMaxEdges(net.graph),
        makeValid: function (graph) {
          return moea.problem.prm.recombination.similarityCrossover.reconnectGraphInTree(graph, net.graph, net.root, net.destinations, moea.problem.prm.recombination.heuristic.random);
        }
        // combine: function (a, b, c) {
        //   a.merge(b).merge(c);
        //   a.removeCycles(net.root);
        //   a.prune(net.root, net.destinations);
        //   return a;
        // }
        // combine: function (a, b, c) {
        //   return mixedCrossover(mixedCrossover(a, b)[0], c)[0];
        // }
        // combine: function (personalBest, localBest, globalBest) {
        //   return moea.problem.prm.recombination.pathCrossover.moveParticle(personalBest, localBest, globalBest, 0.333, 0.333, 0.333, net.root, net.destinations);
        // }
      },
      mdtAco: {
        // populationSize: 7,
        // numberOfGenerations: 1285,
        // populationSize: 18,
        // numberOfGenerations: 50,
        alpha: 1,
        beta: 1.9,
        initialPheromoneValue: 0.9,
        trailPersistence: 0.3,
        pheromoneBounds: {min: 0.1, max: 0.9},
        network: net,
        // heuristicFunctions: [
        //   function (v, e) {
        //     return (1 - normalizedWeights[v][e].cost) || 0.000001;
        //   },
        //   function (v, e) {
        //     return (1 - normalizedWeights[v][e].delay) || 0.000001;
        //   },
        //   function (v, e) {
        //     return (1 - normalizedWeights[v][e].traffic) || 0.000001;
        //   },
        //   function (v, e) {
        //     return (normalizedWeights[v][e].capacity) || 0.000001;
        //   }
        // ]
        heuristicFunctions: _.map(problemWeights, function (name) {
          if (name !== 'capacity') {
            return function (v, e) {
              return (1 - normalizedWeights[v][e][name]) || 0.000001;
            };
          } else {
            return function (v, e) {
              return (normalizedWeights[v][e].capacity) || 0.000001;
            };
          }
        })
      },
      mdtAcoParallel: {
        // populationSize: 22,
        // numberOfGenerations: 1,
        alpha: 1,
        beta: 1.9,
        initialPheromoneValue: 0.9,
        trailPersistence: 0.3,
        pheromoneBounds: {min: 0.1, max: 0.9},
        network: net,
        heuristicTables: buildHeuristicTables()
      },
      prim: {
        network: net,
        weights: singleObjectiveWeightMatrix,
        objective: singleObjective
      },
      simpleAco: {
        // numberOfGenerations: 1,
        // populationSize: 1,
        alpha: 1,
        beta: 1.9,
        initialPheromoneValue: 0.9,
        evaporationRate: 0.3,
        pheromoneBounds: {min: 0.1, max: 0.9},
        network: net,
        objective: singleObjective,
        weights: singleObjectiveWeightMatrix,
        heuristicFunctions: [
          function (v, e) {
            return (1 - singleObjectiveWeightMatrix[v][e]) || 0.000001;
          }
        ]
      },
      multiAco: {
        // numberOfGenerations: 200,
        // populationSize: 45,
        alpha: 1,
        beta: 2,
        initialPheromoneValue: 0.9,
        evaporationRate: 0.3,
        pheromoneBounds: {min: 0.1, max: 0.9},
        network: net,
        weights: _.map(problemWeights, function (name) {
          return _.map(normalizedWeights, function (line) {
            return _.map(line, function (weight) {
              if (weight === null) return null;
              return (name === 'capacity') ? (1 - weight[name]) : weight[name];
            });
          });
        }),
        heuristicFunctions: _.map(problemWeights, function (name) {
          if (name !== 'capacity') {
            return function (v, e) {
              return (1 - normalizedWeights[v][e][name]) || 0.000001;
            };
          } else {
            return function (v, e) {
              return (normalizedWeights[v][e].capacity) || 0.000001;
            };
          }
        })
      // }
      //   heuristicFunctions: [
      //     function (v, e) {
      //       return (1 - normalizedWeights[v][e].cost) || 0.000001;
      //     },
      //     function (v, e) {
      //       return (1 - normalizedWeights[v][e].delay) || 0.000001;
      //     },
      //     function (v, e) {
      //       return (1 - normalizedWeights[v][e].traffic) || 0.000001;
      //     },
      //     // function (v, e) {
      //     //   return normalizedWeights[v][e].capacity || 0.000001;
      //     // }
      //   ]
      },
      moacsBp: {
        alpha: 1,
        beta: 2,
        initialPheromoneValue: 0.1,
        evaporationRate: 0.3,
        network: net,
        heuristicFunctions: _.map(problemWeights, function (name) {
          if (name !== 'capacity') {
            return function (v, e) {
              return (1 - normalizedWeights[v][e][name]) || 0.000001;
            };
          } else {
            return function (v, e) {
              return (normalizedWeights[v][e].capacity) || 0.000001;
            };
          }
        })
      }
      //   heuristicFunctions: _.map(problemWeights, function (name) {
      //     if (name !== 'capacity') {
      //       return function (v, e) {
      //         return (1 / normalizedWeights[v][e][name]) || 0.000001;
      //       };
      //     } else {
      //       return function (v, e) {
      //         return (normalizedWeights[v][e].capacity) || 0.000001;
      //       };
      //     }
      //   })
      // }
    };

    config.manyAco = config.multiAco;
    config.manyAcoSde = _.clone(config.manyAco);
    config.manyAcoSde.archiveMaxSize = LIM;

    return _.merge(config.global, config[method]);
  }

  function run(method, instance) {
    var ans = methods[method](getConfig(method, instance));
    // moea.help.graphDesigner.draw(ans.solution, instance.network.root, instance.network.destinations);
    return ans;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.algorithm', {
    methods: methods,
    run: run
  });
}());
