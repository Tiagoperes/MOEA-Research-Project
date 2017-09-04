(function () {
  'use strict';

  const DISCONNECTION_RATE = 0.2;

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
    spea: moea.method.spea.main.execute,
    speaSde: moea.method.spea.main.execute,
    moead: moea.method.moead.main.execute,
    moeadd: moea.method.moeadd.main.execute,
    aemmt: moea.method.aemmt.main.execute,
    aemmtf: moea.method.aemmt.main.execute,
    aemmd: moea.method.aemmd.main.execute,
    psotree: moea.method.psotree.main.execute
  };

  function getConfig(method, instance) {
    var prm = moea.problem.prm.main,
        net = instance.network,
        problemWeights = prm.getProblemWeights(instance.problem),
        dijkstra, dijkstraWeights;

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

    var config = {
      global: {
        populationSize: 90,
        archiveSize: 90,
        numberOfGenerations: 100,
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
      }
    };

    return _.merge(config.global, config[method]);
  }

  function run(method, instance) {
    return methods[method](getConfig(method, instance));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.algorithm', {
    methods: methods,
    run: run
  });
}());
