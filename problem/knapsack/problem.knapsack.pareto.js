(function () {
  'use strict';

  function getDBName(instance) {
    return 'mkp-pareto-' + instance.objectives + '-' + instance.items;
  }

  function updatePareto(numberOfObjectives, numberOfItems, numberOfExecutions, methods, shouldReset) {
    var mkp = moea.problem.knapsack,
        instance = mkp.main.getInstance(numberOfObjectives, numberOfItems),
        objectives = mkp.main.getObjectives(instance),
        dbName = getDBName(instance),
        runner = mkp.algorithm.run;

    methods = methods || _.keys(mkp.algorithm.methods);

    return moea.problem.generic.pareto.update(instance, objectives, dbName, runner, numberOfExecutions, methods, shouldReset);
  }

  function saveToParetoDB(solutions, instance) {
    return moea.problem.generic.pareto.saveToParetoDB(solutions, instance, getDBName(instance));
  }

  function loadUnsavedPareto(instance) {
    return moea.problem.generic.pareto.loadUnsavedPareto(instance, getDBName(instance));
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.pareto', {
    update: updatePareto,
    saveToParetoDB: saveToParetoDB,
    loadUnsavedPareto: loadUnsavedPareto
  });

}());
