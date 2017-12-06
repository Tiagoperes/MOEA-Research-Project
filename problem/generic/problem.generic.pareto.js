(function () {
  'use strict';

  function getUpdatedPareto(currentPareto, newParetoSolutions) {
    return _.reduce(newParetoSolutions, function (pareto, s) {
      return moea.help.pareto.updateNonDominatedSet(pareto, s);
    }, currentPareto);
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

  function loadPareto(instance, dbName, shouldReset) {
    var lsData;

    if (shouldReset) {
      delete localStorage[dbName];
      return instance.pareto;
    }

    lsData = localStorage[dbName];
    return lsData ? JSON.parse(LZString.decompress(lsData)) : instance.pareto;
  }

  function savePareto(pareto, dbName) {
    try {
      localStorage[dbName] = LZString.compress(JSON.stringify(pareto));
    } catch (err) {
      console.log(pareto);
      throw err;
    }
  }

  function getCombinedSolutions(methods, instance, progress, objectives, runner) {
    var result = [];

    _.forEach(methods, function (method) {
      var solutions = runner(method, instance),
          pareto = _.map(solutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives));

      result = _.uniqWith(_.concat(result, pareto), _.isEqual);
      progress.next();
    });

    return result;
  }

  function logResults(instance, newPareto) {
    if (instance.pareto === newPareto) {
      console.log('No new solution was found. Pareto has not changed.');
    } else {
      let differences = getDifferencesBetweenParetos(instance.pareto, newPareto);
      console.log('New solutions found. Pareto has changed.');
      logDifferences(instance.pareto, newPareto, differences);
      printPareto(newPareto);
    }
  }

  function updateParetoWithNewSolutions(pareto, newParetoSolutions, progress, dbName) {
    var newPareto = getUpdatedPareto(pareto, newParetoSolutions);

    if (pareto !== newPareto) {
      console.log('The pareto set has been modified. Restarting...');
      progress.reset();
      savePareto(newPareto, dbName);
    }

    return newPareto;
  }

  function updatePareto(instance, objectives, dbName, runner, numberOfExecutions, methods, shouldReset) {
    var pareto = loadPareto(instance, dbName, shouldReset),
        progress;

    progress = moea.help.progress.create(numberOfExecutions * methods.length);
    progress.log();
    moea.method.ga.deactivateLog();

    while (!progress.isComplete()) {
        let solutions = getCombinedSolutions(methods, instance, progress, objectives, runner);
        pareto = updateParetoWithNewSolutions(pareto, solutions, progress, dbName);
    }

    logResults(instance, pareto);
    return pareto;
  }

  function saveToParetoDB(solutions, instance, dbName) {
    var current = loadPareto(instance, dbName);
    savePareto(getUpdatedPareto(current, solutions), dbName);
  }

  function loadUnsavedPareto(instance, dbName) {
    var dbPareto = loadPareto(instance, dbName);
    return (dbPareto.length === instance.pareto.length) ? null : dbPareto;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.generic.pareto', {
    update: updatePareto,
    saveToParetoDB: saveToParetoDB,
    loadUnsavedPareto: loadUnsavedPareto
  });

}());
