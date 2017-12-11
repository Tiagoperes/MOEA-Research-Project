(function () {
  'use strict';

  function checkInput(input, paramName, methodName, description) {
    _.forEach(description, function (value, key) {
      if (typeof input[key] !== value.type) {
        let expected = value.type === 'function' ? 'function(' + value.params + ')' : value.type;
        throw new Error('incorrect parameter "' + paramName + '" for "' + methodName + '". Expected type "' + expected + '", found "' + typeof input[key] + '".');
      }
      if (value.instanceOf && !input[key] instanceof value.instanceOf) {
        throw new Error('incorrect parameter "' + paramName + '" for "' + methodName + '". Expected object to be instance of "' + value.instanceOf + '".');
      }
    });
  }

  function getMetricsForMethod(method, instance, problemSettings) {
    var runAlgorithm =  Promise.resolve(problemSettings.runAlgorithm(method, instance)),
        objectives = problemSettings.getObjectives(instance),
        worst = problemSettings.getWorst();

    return runAlgorithm.then(function (solutions) {
      var evaluations = _.map(solutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives, true)),
          uniqueInOS = _.uniqWith(evaluations, _.isEqual),
          invalid = problemSettings.countInvalidSolutions(solutions, instance);

      if (invalid > 0) throw Error(invalid + ' invalid solutions!');

      try {
        return moea.help.report.getMetrics(uniqueInOS, instance.pareto, worst);
      } catch (e) {
        if (e instanceof moea.help.pareto.IncompleteParetoException) {
          e.solutions = _.map(e.evaluations, function (evaluation) {
            return solutions[_.indexOf(evaluations, evaluation)];
          });
        }
        throw e;
      }
    });
  }

  function updateMetricsWithOneMoreRun(metrics, method, instance, progress, dbName, problemSettings) {
    return getMetricsForMethod(method, instance, problemSettings).then(function (result) {
      metrics.push(result);
      progress.next();
    });
  }

  function verifyUnsavedPareto(instance, shouldRaiseException, problemSettings) {
    var unsavedPareto = problemSettings.loadUnsavedPareto(instance);

    if (!unsavedPareto) return;

    if (shouldRaiseException) {
      throw new moea.help.pareto.UnsavedParetoException(unsavedPareto);
    }

    console.log('Attention: there are updated values to the Pareto available. Updated Pareto is as follows:');
    console.log(unsavedPareto);
  }

  function printReport(report, method, instance) {
    document.body.innerHTML += '<p> ' + method + ' ' + instance.toString() + '</p>';
    document.body.innerHTML += '<pre>' + report.toString() + '</pre>';
  }

  function checkInputForRun(input) {
    checkInput(input, 'problemSettings', 'run',{
      loadUnsavedPareto: {type: 'function', params: 'instance'},
      saveToParetoDB: {type: 'function', params: 'instance, solutions'},
      runAlgorithm: {type: 'function', params: 'method, instance'},
      getObjectives: {type: 'function', params: 'instance'},
      getWorst: {type: 'function', params: ''}
    });
  }

  function metricsLoop(method, progress, metrics, instance, dbName, problemSettings) {
    if (!progress.isComplete()) {
      return updateMetricsWithOneMoreRun(metrics, method, instance, progress, dbName, problemSettings).then(function () {
        return metricsLoop(method, progress, metrics, instance, dbName, problemSettings);
      });
    }
    return Promise.resolve();
  }

  function run(method, instance, numberOfExecutions, shouldReset, dbName, problemSettings) {
    var metrics, progress, report, time = new Date().getTime();

    console.log('%cseedrandom: using seed "' + Math.getRandomizationSeed() + '". To change, call Math.seedrandom(yourSeed).', 'color: blue');
    checkInputForRun(problemSettings);

    metrics = moea.help.database.create(dbName, shouldReset);
    progress = moea.help.progress.create(numberOfExecutions);

    verifyUnsavedPareto(instance, true, problemSettings);
    if (numberOfExecutions > 1) moea.method.ga.deactivateLog();
    progress.next(metrics.length);

    metricsLoop(method, progress, metrics, instance, dbName, problemSettings).then(function () {
      report = moea.help.report.createReport(metrics);
      printReport(report, method, instance);
      verifyUnsavedPareto(instance, false, problemSettings);
      console.log('Average time taken: ' + ((new Date().getTime() - time) / (numberOfExecutions * 1000)) + 's');
    });
  }

  function checkInputForGetFormattedResults(input) {
    checkInput(input, 'problemSettings', 'getFormattedResults',{
      defaultProblems: {type: 'object', instanceOf: Array},
      defaultScenarios: {type: 'object', instanceOf: Array},
      getScenarioName: {type: 'function', params: 'scenario'},
      getProblemName: {type: 'function', params: 'problem'},
      getDBName: {type: 'function', params: 'problem, scenario, method'}
    });
  }

  function getFormattedResults(type, problems, scenarios, methods, properties, shouldPrintNames, problemSettings) {
    var str = '';

    checkInputForGetFormattedResults(problemSettings);

    type = type || 'mean';
    problems = problems || problemSettings.defaultProblems;
    scenarios = scenarios || problemSettings.defaultScenarios;
    methods = methods || ['nsga', 'nsga3', 'spea', 'moead', 'aemmt', 'aemmtf'];
    properties = properties || ['er', 'gd', 'ps', 'fsp', 'ms', 'hv'];

    _.forEach(scenarios, function (scenario) {
      if (shouldPrintNames) str += '------------------------------------\n' + problemSettings.getScenarioName(scenario) + '\n';
      _.forEach(problems, function (problem) {
        if (shouldPrintNames) str += '------------------------------------\n' + problemSettings.getProblemName(problem) + ' \n';
        _.forEach(methods, function (method) {
          if (shouldPrintNames) str += method + '\n';
          let methodDBName = problemSettings.getDBName(problem, scenario, method);
          if (localStorage[methodDBName]) {
            let report = moea.help.report.createReport(JSON.parse(localStorage[methodDBName]));
            _.forEach(properties, function (property) {
              if (shouldPrintNames) str += property + ': ';
              str += (report[type][property] + '\t').replace('.', ',');
            });
          }
          str+='\n';
        });
      });
    });

    return str;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.generic.experiment', {
    run: run,
    getFormattedResults: getFormattedResults
  });

}());
