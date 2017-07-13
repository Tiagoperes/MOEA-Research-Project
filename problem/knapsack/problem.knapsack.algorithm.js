(function () {
  'use strict';

  const MOEAD_DIVISIONS = {
    2: 149,
    3: 16,
    4: 8,
    5: 6,
    6: 5
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
    aemmd: moea.method.aemmd.main.execute
  };

  function getConfig(method, instance) {
    var mkp = moea.problem.knapsack.main;

    var config = {
      global: {
        populationSize: 150,
        archiveSize: 150,
        numberOfGenerations: (instance.items < 100) ? 100 : 200,
        shouldNormalize: false,
        elementsPerTable: 50,
        randomize: _.partial(mkp.generateRandom, instance),
        objectives: mkp.getObjectives(instance),
        crossover: {rate: 0.5, method: _.partial(mkp.crossover, _, _, instance)},
        mutation: {rate: 2 / instance.items, method: moea.help.binary.mutate}
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
        divisions: MOEAD_DIVISIONS[instance.objectives],
        isRandomWeights: true,
        comparisons: (instance.items < 100) ? 15000 : 30000,
        neighborhoodSize: 10,
        useTchebycheff: false
      },
      moeadd: {
        divisions: MOEAD_DIVISIONS[instance.objectives],
        comparisons: (instance.items < 100) ? 15000 : 30000,
        neighborhoodSize: 10,
        localReproductionRate: 0.9
      },
      aemmt: {
        dominationTableLimit: 150,
        numberOfGenerations: (instance.items < 100) ? 7500 : 15000
      },
      aemmtf: {
        dominationTableLimit: Infinity,
        numberOfGenerations: (instance.items < 100) ? 7500 : 15000
      },
      aemmd: {
        numberOfGenerations: (instance.items < 100) ? 7500 : 15000
      }
    };

    return _.merge(config.global, config[method]);
  }

  function run(method, instance) {
    return methods[method](getConfig(method, instance));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.algorithm', {
    methods: methods,
    run: run
  });

}());
