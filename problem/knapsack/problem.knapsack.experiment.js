(function () {
  'use strict';

  function getDBName(objectives, items, method) {
    return 'mkp-exp-' + objectives + '-' + items + '-' + method;
  }

  function run(method, numberOfObjectives, numberOfItems, numberOfExecutions, shouldReset) {
    var instance = moea.problem.knapsack.main.getInstance(numberOfObjectives, numberOfItems),
        dbName = getDBName(numberOfObjectives, numberOfItems, method),
        settings = {
          loadUnsavedPareto: moea.problem.knapsack.pareto.loadUnsavedPareto,
          saveToParetoDB: moea.problem.knapsack.pareto.saveToParetoDB,
          runAlgorithm: moea.problem.knapsack.algorithm.run,
          getObjectives: moea.problem.knapsack.main.getObjectives,
          getWorst: _.wrap(_.fill(new Array(numberOfObjectives), 0)),
          countInvalidSolutions: moea.problem.knapsack.main.countInvalidSolutions
        };

    return moea.problem.generic.experiment.run(method, instance, numberOfExecutions, shouldReset, dbName, settings);
  }

  function getFormattedResults(type, objectives, items, methods, properties, shouldPrintNames) {
    var settings = {
      defaultProblems: [2, 3, 4, 5, 6],
      defaultScenarios: [30, 50, 100],
      getScenarioName: function (items) { return items + ' items'},
      getProblemName: function (objectives) { return objectives + ' objectives'},
      getDBName: getDBName
    };

    return moea.problem.generic.experiment.getFormattedResults(type, objectives, items, methods, properties, shouldPrintNames, settings);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.experiment', {
    run: run,
    getFormattedResults: getFormattedResults
  });

}());
