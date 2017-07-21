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
    var solutions = problemSettings.runAlgorithm(method, instance),
        objectives = problemSettings.getObjectives(instance),
        worst = problemSettings.getWorst(),
        uniqueInOS = _.map(solutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives));

    return moea.help.report.getMetrics(uniqueInOS, instance.pareto, worst);
  }

  function updateMetricsWithOneMoreRun(metrics, method, instance, progress, dbName, problemSettings) {
    try {
      metrics.push(getMetricsForMethod(method, instance, problemSettings));
      progress.next();
      return metrics;
    } catch (error) {
      if (error instanceof moea.help.pareto.IncompleteParetoException) {
        console.log(error.solutions.length + ' new solutions found. Updating Pareto and restarting experiment.');
        problemSettings.saveToParetoDB(instance, error.solutions);
        progress.reset();
        return moea.help.database.create(dbName, true);
      }
      throw error;
    }
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

  function printReport(report) {
    document.body.innerHTML = '<pre>' + JSON.stringify(report).replace(/"er":(\d+\.?\d*),"gd":(\d+\.?\d*),"ps":(\d+\.?\d*),"pcr":\d+\.?\d*,"sp":\d+\.?\d*,"fsp":(\d+\.?\d*),"ms":(\d+\.?\d*),"hv":(\d+\.?\d*)/g, '$1\t$2\t$3\t$4\t$5\t$6').replace(/(\d+)\.(\d+)/g,'$1,$2').replace(/[\{\}]/g, '').replace(/,"sd":/g, '\n"sd":') + '</pre>';
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

  function run(method, instance, numberOfExecutions, shouldReset, dbName, problemSettings) {
    var metrics, progress, report;

    checkInputForRun(problemSettings);

    metrics = moea.help.database.create(dbName, shouldReset);
    progress = moea.help.progress.create(numberOfExecutions);

    verifyUnsavedPareto(instance, true, problemSettings);
    if (numberOfExecutions > 1) moea.method.ga.deactivateLog();
    progress.next(metrics.length);

    while (!progress.isComplete()) {
      metrics = updateMetricsWithOneMoreRun(metrics, method, instance, progress, dbName, problemSettings);
    }

    report = moea.help.report.createReport(metrics);
    printReport(report);
    verifyUnsavedPareto(instance, false, problemSettings);
    return report;
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
