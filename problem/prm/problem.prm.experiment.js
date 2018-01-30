(function () {
  'use strict';

  function getDBName(problem, network, method) {
    return 'prm-exp-' + problem + '-' + network + '-' + method;
  }

  function run(method, problem, network, numberOfExecutions, shouldReset, shouldRememberPS) {
    var instance = moea.problem.prm.main.getInstance(problem, network),
        dbName = getDBName(problem, network, method),
        settings = {
          loadUnsavedPareto: moea.problem.prm.pareto.loadUnsavedPareto,
          saveToParetoDB: moea.problem.prm.pareto.saveToParetoDB,
          runAlgorithm: moea.problem.prm.algorithm.run,
          getObjectives: moea.problem.prm.main.getObjectives,
          getWorst: _.wrap(_.fill(new Array(6), 0)),
          countInvalidSolutions: moea.problem.prm.main.countInvalidSolutions
        };

    return moea.problem.generic.experiment.run(method, instance, numberOfExecutions, shouldReset, shouldRememberPS, dbName, settings);
  }

  function getFormattedResults(type, problem, network, methods, properties, shouldPrintNames) {
    var settings = {
      defaultProblems: [4,6,7,8],
      defaultScenarios: [2,4,5],
      getScenarioName: function (problem) { return 'p' + problem},
      getProblemName: function (network) { return 'rede' + network},
      getDBName: getDBName
    };

    return moea.problem.generic.experiment.getFormattedResults(type, problem, network, methods, properties, shouldPrintNames, settings);
  }

  function printSolutionSets(method, problem, network) {
    let dbName = getDBName(problem, network, method);
    moea.problem.generic.experiment.printSolutionSets(dbName);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.experiment', {
    run: run,
    getFormattedResults: getFormattedResults,
    printSolutionSets: printSolutionSets
  });

}());
