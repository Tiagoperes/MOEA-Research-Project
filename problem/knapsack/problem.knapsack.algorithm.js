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
    moead: moea.method.moead.main.execute,
    moeadd: moea.method.moeadd.main.execute,
    aemmt: moea.method.aemmt.main.execute,
    aemmd: moea.method.aemmd.main.execute
  };

  function getConfig(method, instance) {
    var mkp = moea.problem.knapsack.main;

    var config = {
      global: {
        populationSize: 150,
        numberOfGenerations: 200,
        shouldNormalize: false,
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
        archiveSize: 150,
        shouldNormalize: false,
        shouldUseSDE: true
      },
      moead: {
        divisions: MOEAD_DIVISIONS[instance.objectives],
        comparisons: 30000,
        neighborhoodSize: 10,
        useTchebycheff: false
      },
      moeadd: {
        divisions: MOEAD_DIVISIONS[instance.objectives],
        comparisons: 30000,
        neighborhoodSize: 10,
        localReproductionRate: 0.9
      },
      aemmt: {
        elementsPerTable: 50,
        dominationTableLimit: 150,
        numberOfGenerations: 15000
      },
      aemmd: {
        elementsPerTable: 50,
        numberOfGenerations: 15000
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