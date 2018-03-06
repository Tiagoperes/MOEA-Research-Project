(function () {
  'use strict';

  const MOEAD_DIVISIONS = {
    2: 149,
    3: 16,
    4: 8,
    5: 6,
    6: 5
  };


  const LMT = 350;

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
    psobinary: moea.method.psobinary.main.execute,
    manyAco: moea.method.manyAco.mkp.main.execute,
    manyAcoSde: moea.method.manyAco.mkp.main.execute,
    dynamic: moea.method.dynamic.mkp.main.execute,
    simpleAco: moea.method.simpleAco.mkp.main.execute,
    moacsBp: moea.method.moacsBp.mkp.main.execute,
    moeadAco: moea.method.moeadAco.mkp.main.execute
  };

  function createHeuristics(profitMatrix, weights) {
    var heuristics = _.map(profitMatrix, function (values) {
      return function (itemIndex, budget) {
        var profit =  values[itemIndex];
        var weight = weights[itemIndex] / budget;
        return (profit / 1000) * (1 - weight);
      };
    });

    heuristics.push(function (itemIndex) {
      return (1 - weights[itemIndex] / 1000) || 0.000001;
    });

    return heuristics;
  }

  function getConfig(method, instance) {
    var mkp = moea.problem.knapsack.main;

    var config = {
      global: {
        populationSize: 150,
        archiveSize: LMT,
        numberOfGenerations: 100,
        shouldNormalize: false,
        elementsPerTable: 50,
        randomize: _.partial(mkp.generateRandom, instance),
        objectives: mkp.getObjectives(instance),
        crossover: {rate: 0.5, method: _.partial(mkp.crossover, _, _, instance)},
        mutation: {rate: 0.05, method: moea.help.binary.mutate}
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
        comparisons: 15000,
        neighborhoodSize: 10,
        useTchebycheff: false
      },
      moeadd: {
        divisions: MOEAD_DIVISIONS[instance.objectives],
        comparisons: 15000,
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
      },
      psobinary: {
        comparisons: 15000,
        divisions: MOEAD_DIVISIONS[instance.objectives],
        w: 0.5,
        c1: 1,
        c2: 1.5
      },
      manyAco: {
        alpha: 1,
        beta: 4.3,
        sampling: 0.25,
        isElitist: false,
        pheromoneGroupSize: 5,
        evaporationRate: 0.3,
        pheromoneBounds: {min: 0.1, max: 0.9},
        weights: instance.weights,
        capacity: instance.capacity,
        profitMatrix: instance.profitMatrix,
        heuristicFunctions: createHeuristics(instance.profitMatrix, instance.weights)
      },
      simpleAco: {
        numberOfGenerations: 50,
        alpha: 1,
        beta: 2,
        sampling: 0.25,
        initialPheromoneValue: 0.9,
        evaporationRate: 0.3,
        pheromoneBounds: {min: 0.1, max: 0.9},
        weights: instance.weights,
        capacity: instance.capacity,
        profitMatrix: instance.profitMatrix,
        heuristicFunctions: [
          function (itemIndex, budget) {
            var profit =  instance.profitMatrix[0][itemIndex];
            var weight = instance.weights[itemIndex] / budget;
            return (profit / 1000) * (1 - weight);
          }
        ],
        objective: function (solution) {
          return _.reduce(solution, function (sum, isPresent, itemIndex) {
            return sum - (isPresent ? instance.profitMatrix[0][itemIndex] : 0);
          }, 0);
        }
      },
      dynamic: {
        weights: instance.weights,
        capacity: instance.capacity,
        profitMatrix: instance.profitMatrix
      },
      moacsBp: {
        alpha: 1,
        beta: 4.3,
        initialPheromoneValue: 0.1,
        evaporationRate: 0.3,
        weights: instance.weights,
        capacity: instance.capacity,
        profitMatrix: instance.profitMatrix,
        heuristicFunctions: createHeuristics(instance.profitMatrix, instance.weights)
      },
      moeadAco: {
        // numberOfGenerations: 1,
        alpha: 1,
        beta: 4.3,
        delta: 0,
        elitismRate: 0,
        sampleSize: 10,
        numberOfDivisions: MOEAD_DIVISIONS[instance.objectives],
        numberOfGroupDivisions: instance.objectives === 2 ? 8 : 3,
        neighborhoodSize: 10,
        evaporationRate: 0.95,
        pheromoneBounds: {min: 0.1, max: 0.9},
        weights: instance.weights,
        capacity: instance.capacity,
        profitMatrix: instance.profitMatrix,
        heuristicFunctions: createHeuristics(instance.profitMatrix, instance.weights)
      }
    };

    config.manyAcoSde = _.clone(config.manyAco);
    config.manyAcoSde.archiveMaxSize = LMT;

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
