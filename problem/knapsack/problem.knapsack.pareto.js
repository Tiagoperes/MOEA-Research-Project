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

  function getDBName(instance) {
    return 'kp-pareto-' + instance.objectives + '-' + instance.items;
  }

  function loadPareto(instance, shouldReset) {
    var lsData;

    if (shouldReset) {
      delete localStorage[getDBName(instance)];
      return instance.pareto;
    }

    lsData = localStorage[getDBName(instance)];
    return lsData ? JSON.parse(LZString.decompress(lsData)) : instance.pareto;
  }

  function savePareto(pareto, instance) {
    try {
      localStorage[getDBName(instance)] = LZString.compress(JSON.stringify(pareto));
    } catch (err) {
      console.log(pareto);
      throw err;
    }
  }

  function erasePareto(instance) {
    delete localStorage[getDBName(instance)];
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
    if (instance.pareto === newPareto) {
      console.log('No new solution was found. Pareto has not changed.');
    } else {
      let differences = getDifferencesBetweenParetos(instance.pareto, newPareto);
      console.log('New solutions found. Pareto has changed.');
      logDifferences(instance.pareto, newPareto, differences);
      printPareto(newPareto);
    }
  }

  function updateParetoWithNewSolutions(pareto, newParetoSolutions, instance, progress) {
    var newPareto = getUpdatedPareto(pareto, newParetoSolutions);

    if (pareto !== newPareto) {
      console.log('The pareto set has been modified. Restarting...');
      progress.reset();
      savePareto(newPareto, instance);
    }

    return newPareto;
  }

  function updatePareto(numberOfObjectives, numberOfItems, numberOfExecutions, methods, shouldReset) {
    var mkp = moea.problem.knapsack.main,
        instance = mkp.getInstance(numberOfObjectives, numberOfItems),
        objectives = mkp.getObjectives(instance),
        pareto = loadPareto(instance, shouldReset),
        progress;

    methods = methods || _.keys(moea.problem.knapsack.algorithm.methods);
    progress = moea.help.progress.create(numberOfExecutions * methods.length);
    progress.log();
    moea.method.ga.deactivateLog();

    while (!progress.isComplete()) {
        let solutions = getCombinedSolutions(methods, instance, progress);
        let newParetoSolutions = _.map(solutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives));
        pareto = updateParetoWithNewSolutions(pareto, newParetoSolutions, instance, progress);
    }

    logResults(instance, pareto);
    return pareto;
  }

  function saveToParetoDB(solutions, instance) {
    var current = loadPareto(instance);
    savePareto(getUpdatedPareto(current, solutions), instance);
  }

  function loadUnsavedPareto(instance) {
    var dbPareto = loadPareto(instance),
        diffs;

    if (dbPareto === instance.pareto) return null;
    diffs = getDifferencesBetweenParetos(instance.pareto, dbPareto);
    if (diffs.added) return dbPareto;
    erasePareto(instance);
    return null;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.pareto', {
    update: updatePareto,
    saveToParetoDB: saveToParetoDB,
    loadUnsavedPareto: loadUnsavedPareto
  });

}());
