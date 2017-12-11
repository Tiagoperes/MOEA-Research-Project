(function () {
  'use strict';

  function getDBName(instance) {
    return 'prm-pareto-' + instance.problem + '-' + instance.network.name;
  }

  function updatePareto(problem, network, numberOfExecutions, methods, shouldReset) {
    var prm = moea.problem.prm,
        instance = prm.main.getInstance(problem, network),
        objectives = prm.main.getObjectives(instance),
        dbName = getDBName(instance),
        runner = prm.algorithm.run;

    methods = methods || _.keys(prm.algorithm.methods);

    return moea.problem.generic.pareto.update(instance, objectives, dbName, runner, numberOfExecutions, methods,
      shouldReset, moea.problem.prm.main.countInvalidSolutions);
  }

  function saveToParetoDB(solutions, instance) {
    return moea.problem.generic.pareto.saveToParetoDB(solutions, instance, getDBName(instance));
  }

  function loadUnsavedPareto(instance) {
    return moea.problem.generic.pareto.loadUnsavedPareto(instance, getDBName(instance));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.pareto', {
    update: updatePareto,
    saveToParetoDB: saveToParetoDB,
    loadUnsavedPareto: loadUnsavedPareto
  });

}());
