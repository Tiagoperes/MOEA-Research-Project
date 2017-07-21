(function () {
  'use strict';

  function createDatabase(method, network, problem, shouldReset) {
    var name = 'prm-exp-rede' + network + '-p' + problem + '-' + method;
    return moea.help.database.create(name, shouldReset);
  }

  function getMetricsForMethod(method, instance) {
    var solutions = moea.problem.prm.algorithm.run(method, instance),
        objectives = moea.problem.prm.main.getObjectives(instance.problem),
        worst = _.fill(new Array(objectives.length), 0),
        uniqueInOS = _.map(solutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives));

    return moea.help.report.getMetrics(uniqueInOS, instance.pareto, worst);
  }

  function updateMetricsWithOneMoreRun(metrics, method, instance, progress) {
    try {
      metrics.push(getMetricsForMethod(method, instance));
      progress.next();
      return metrics;
    } catch (error) {
      if (error instanceof moea.help.pareto.IncompleteParetoException) {
        console.log(error.solutions.length + ' new solutions found. Updating Pareto and restarting experiment.');
        moea.problem.prm.pareto.saveToParetoDB(instance, error.solutions);
        progress.reset();
        return createDatabase(method, instance.network.name, instance.problem, true);
      }
      throw error;
    }
  }

  function verifyUnsavedPareto(instance, shouldRaiseException) {
    var unsavedPareto = moea.problem.prm.pareto.loadUnsavedPareto(instance);

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

  function run(method, numberOfObjectives, numberOfItems, numberOfExecutions, shouldReset) {
    var metrics = createDatabase(method, numberOfObjectives, numberOfItems, shouldReset),
        instance = moea.problem.prm.main.getInstance(numberOfObjectives, numberOfItems),
        progress = moea.help.progress.create(numberOfExecutions),
        report;

    verifyUnsavedPareto(instance, true);
    if (numberOfExecutions > 1) moea.method.ga.deactivateLog();
    progress.next(metrics.length);

    while (!progress.isComplete()) {
      metrics = updateMetricsWithOneMoreRun(metrics, method, instance, progress);
    }

    report = moea.help.report.createReport(metrics);
    printReport(report);
    verifyUnsavedPareto(instance, false);
    return report;
  }

  function getFormattedResults(type, objectives, items, methods, properties, shouldPrintNames) {
    var str = '';

    type = type || 'mean';
    objectives = objectives || [2, 3, 4, 5, 6];
    items = items || [30, 50, 100];
    methods = methods || ['nsga', 'nsga3', 'spea', 'moead', 'aemmt', 'aemmtf'];
    properties = properties || ['er', 'gd', 'ps', 'fsp', 'ms', 'hv'];

    _.forEach(items, function (item) {
      if (shouldPrintNames) str += '------------------------------------\n' + item + ' items\n';
      _.forEach(objectives, function (objective) {
        if (shouldPrintNames) str += '------------------------------------\n' + objective + ' objectives\n';
        _.forEach(methods, function (method) {
          if (shouldPrintNames) str += method + '\n';
          let methodDBName = 'kp-res-' + objective + '-' + item + '-' + method;
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
  _.set(moea, 'problem.knapsack.experiment', {
    run: run,
    getFormattedResults: getFormattedResults
  });

}());
