(function () {
  'use strict';

  function getUpdatedPareto(pareto, newSolutions, objectives) {
    var resultOS = _.map(newSolutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives)),
        best = _.uniqWith(_.concat(pareto, resultOS), _.isEqual);

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

  function logDifferences(currentPareto, newPareto, differences) {
    console.log('current Pareto: ' + currentPareto.length);
    console.log('new Pareto: ' + newPareto.length);
    console.log('removed: ' + differences.removed);
    console.log('added: ' + differences.added);
  }

  function printPareto(pareto) {
    document.body.innerHTML = '<pre>' + JSON.stringify(pareto) + '</pre>';
  }

  function getDBName(instance) {
    return 'kp-pareto-' + instance.objectives + '-' + instance.items;
  }

  function loadPareto(instance, reset) {
    var lsData;

    if (reset) {
      delete localStorage[getDBName(instance)];
      return instance.pareto;
    }

    lsData = localStorage[getDBName(instance)];
    return lsData ? JSON.parse(lsData) : instance.pareto;
  }

  function savePareto(pareto, instance) {
    localStorage[getDBName(instance)] = JSON.stringify(pareto);
  }

  function getCombinedSolutions(methods, instance, progress) {
    var result = [];

    _.forEach(methods, function (method) {
      result = _.uniqWith(_.concat(result, moea.problem.knapsack.algorithm.run(method, instance)), _.isEqual);
      progress.next();
    });

    return result;
  }

  function logResults(instance, newPareto) {
    var differences = getDifferencesBetweenParetos(instance.pareto, newPareto);

    if (differences.added || differences.removed) {
      console.log('New solutions found. Pareto has changed.');
      logDifferences(instance.pareto, newPareto, differences);
      printPareto(newPareto);
    } else {
      console.log('No new solution was found. Pareto has not changed.');
    }
  }

  function updateParetoWithSolutions(pareto, solutions, instance, objectives, progress) {
    var newPareto = getUpdatedPareto(pareto, solutions, objectives),
        differences = getDifferencesBetweenParetos(pareto, newPareto);

    if (differences.added || differences.removed) {
      console.log('The pareto set has been modified. Restarting...');
      progress.reset();
      savePareto(newPareto, instance);
    }

    return newPareto;
  }

  function updatePareto(numberOfObjectives, numberOfItems, numberOfExecutions, methods, reset) {
    var mkp = moea.problem.knapsack.main,
        instance = mkp.getInstance(numberOfObjectives, numberOfItems),
        objectives = mkp.getObjectives(instance),
        pareto = loadPareto(instance, reset),
        progress;

    methods = methods || _.keys(moea.problem.knapsack.algorithm.methods);
    progress = moea.help.progress.create(numberOfExecutions * methods.length);
    progress.log();
    moea.method.ga.deactivateLog();

    while (!progress.isComplete()) {
        let solutions = getCombinedSolutions(methods, instance, progress);
        pareto = updateParetoWithSolutions(pareto, solutions, instance, objectives, progress);
    }

    logResults(instance, pareto);
    return pareto;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.pareto.update', updatePareto);

}());
