(function () {
  'use strict';

  const DISCONNECTION_RATE = 0.1;

  var methods = {
    nsga: moea.method.nsga.main.execute,
    nsga3: moea.method.nsga3.main.execute,
    spea: moea.method.spea.main.execute,
    speaSde: moea.method.spea.main.execute,
    moead: moea.method.moead.main.execute,
    moeadd: moea.method.moeadd.main.execute,
    aemmt: moea.method.aemmt.main.execute,
    aemmtf: moea.method.aemmt.main.execute,
    aemmd: moea.method.aemmd.main.execute
  };

  function getConfig(method, instance) {
    var prm = moea.problem.prm.main,
        net = instance.network,
        costs = _.map(net.weights, function (weightList) {
          return _.map(weightList, 'cost');
        });

    var config = {
      global: {
        populationSize: 90,
        archiveSize: 90,
        numberOfGenerations: 100,
        shouldNormalize: false,
        elementsPerTable: 30,
        randomize: _.partial(moea.help.tree.randomize.generateRandom, net.graph, net.root, net.destinations),
        objectives: prm.getObjectives(instance),
        crossover: {rate: 1, method: _.partial(moea.problem.prm.crossover.path.crossover, _, _, net.root, net.destinations)},
        mutation: {rate: 0.2, method: _.partial(moea.problem.prm.crossover.similarity.mutate, _, net.graph, net.root, net.destinations, DISCONNECTION_RATE)}
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
