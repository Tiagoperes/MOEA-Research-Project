(function () {
  'use strict';

  function getDBName(problem, network, method) {
    return 'prm-exp-' + problem + '-' + network + '-' + method;
  }

  function containsAll(a, b) {
    for (let i = 0; i < b.length; i++) {
      if (!_.includes(a, b[i])) return false;
    }
    return true;
  }

  function checkSolutions(solutions, instance) {
    var invalid = 0;
    _.forEach(solutions, function (tree) {
      if (tree.hasCycle(instance.network.root)) {
        invalid++;
        console.log('cycle :(');
      }
      else {
        let vertices = tree.getAchievableVertices(instance.network.root);
        if (!containsAll(vertices, instance.network.destinations)) invalid++;
      }
    });
    console.log(invalid + ' invalid solutions of a total of ' + solutions.length);
    return invalid === 0;
  }

  function run(method, problem, network, numberOfExecutions, shouldReset) {
    var instance = moea.problem.prm.main.getInstance(problem, network),
        dbName = getDBName(problem, network, method),
        settings = {
          loadUnsavedPareto: moea.problem.prm.pareto.loadUnsavedPareto,
          saveToParetoDB: moea.problem.prm.pareto.saveToParetoDB,
          runAlgorithm: moea.problem.prm.algorithm.run,
          getObjectives: moea.problem.prm.main.getObjectives,
          getWorst: _.wrap(_.fill(new Array(6), 0)),
          checkSolutions: checkSolutions
        };

    return moea.problem.generic.experiment.run(method, instance, numberOfExecutions, shouldReset, dbName, settings);
  }

  function getFormattedResults(type, problem, network, methods, properties, shouldPrintNames) {
    var settings = {
      defaultProblems: [4,6,7,8],
      defaultScenarios: [2,4,5],
      getScenarioName: function (problem) { return 'p' + problem},
      getProblemName: function (network) { return 'rede' + network},
      getDBName: getDBName,
      checkSolutions: checkSolutions
    };

    return moea.problem.generic.experiment.getFormattedResults(type, problem, network, methods, properties, shouldPrintNames, settings);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.experiment', {
    run: run,
    getFormattedResults: getFormattedResults
  });

}());
