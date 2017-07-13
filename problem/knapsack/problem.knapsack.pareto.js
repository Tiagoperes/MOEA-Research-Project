(function () {
  'use strict';

  function getUpdatedPareto(pareto, newSolutions, objectives) {
    var resultOS = _.map(newSolutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives)),
        best = _.concat(pareto, resultOS);

    return moea.help.pareto.getNonDominatedSet(best);
  }

  function getDifferencesBetweenParetos(currentPareto, newPareto) {
    var removed = _.filter(currentPareto, function (solution) {
      return !_.find(newPareto, _.partial(_.isEqual, solution));
    });

    var added = _.filter(newPareto, function (solution) {
      return !_.find(currentPareto, _.partial(_.isEqual, solution));
    });

    return {added: added.length, removed: removed.length};
  }

  function logDifferences(currentPareto, newPareto) {
    var differences = getDifferencesBetweenParetos(currentPareto, newPareto);
    console.log('current Pareto: ' + currentPareto.length);
    console.log('new Pareto: ' + newPareto.length);
    console.log('removed: ' + differences.removed);
    console.log('added: ' + differences.added);
  }

  function printPareto(pareto) {
    document.body.innerHTML = '<pre>' + JSON.stringify(pareto) + '</pre>';
  }

  function updatePareto(numberOfObjectives, numberOfItems, numberOfExecutions, methods) {
    var mkp = moea.problem.knapsack.main,
        alg = moea.problem.knapsack.algorithm,
        result = [],
        instance = mkp.getInstance(numberOfObjectives, numberOfItems),
        objectives = mkp.getObjectives(instance),
        newPareto;

    methods = methods || _.keys(alg.methods);

    for (let i = 0; i < numberOfExecutions; i++) {
      console.log('------ execucao ' + i + ' ------');
      _.forEach(methods, function (method) {
        result = _.uniqWith(alg.run(method, instance), _.isEqual);
      });
    }

    newPareto = getUpdatedPareto(instance.pareto, result, objectives);
    logDifferences(instance.pareto, newPareto);
    printPareto(newPareto);
    return newPareto;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.pareto.update', updatePareto);

}());
