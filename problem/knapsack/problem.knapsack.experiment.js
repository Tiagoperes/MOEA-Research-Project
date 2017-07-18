(function () {
  'use strict';

  function createDatabase(method, numberOfObjectives, numberOfItems, shouldReset) {
    var name = 'kp-res-' + numberOfObjectives + '-' + numberOfItems + '-' + method,
        array;

    if (!localStorage[name] || shouldReset) {
      localStorage[name] = '[]';
    }

    array = JSON.parse(localStorage[name]);

    array.push = function(element) {
      array[array.length] = element;
      localStorage[name] = JSON.stringify(array);
    };

    return array;
  }

  function getMetricsForMethod(method, instance) {
    var solutions = moea.problem.knapsack.algorithm.run(method, instance),
        uniqueSolutions = _.uniqWith(solutions, _.isEqual),
        objectives = moea.problem.knapsack.main.getObjectives(instance),
        worst = _.fill(new Array(objectives.length), 0),
        uniqueInOS = _.map(uniqueSolutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives));

    return moea.help.report.getMetrics(uniqueInOS, instance.pareto, worst);
  }

  function updateMetricsWithOnMoreRun(metrics, method, instance, progress) {
    try {
      metrics.push(getMetricsForMethod(method, instance));
      progress.next();
      return metrics;
    } catch (error) {
      if (error instanceof moea.help.pareto.IncompleteParetoException) {
        console.log(error.solutions.length + ' new solutions found. Updating Pareto and restarting experiment.');
        moea.problem.knapsack.pareto.saveToParetoDB(instance, error.solutions);
        progress.reset();
        return createDatabase(method, instance.objectives, instance.items, true);
      }
      throw error;
    }
  }

  function verifyUnsavedPareto(instance, shouldRaiseException) {
    var unsavedPareto = moea.problem.knapsack.pareto.loadUnsavedPareto(instance),
        instanceId = instance.objectives + '-' + instance.items;

    if (!unsavedPareto) return;

    if (shouldRaiseException) {
      throw new moea.help.pareto.UnsavedParetoException(instanceId, unsavedPareto);
    }

    console.log('Attention: there are updated values to the Pareto available. Updated Pareto is as follows:');
    console.log(unsavedPareto);
  }

  function printReport(report) {
    document.body.innerHTML = '<pre>' + JSON.stringify(report).replace(/"er":(\d+\.?\d*),"gd":(\d+\.?\d*),"ps":(\d+\.?\d*),"pcr":\d+\.?\d*,"sp":\d+\.?\d*,"fsp":(\d+\.?\d*),"ms":(\d+\.?\d*),"hv":(\d+\.?\d*)/g, '$1\t$2\t$3\t$4\t$5\t$6').replace(/(\d+)\.(\d+)/g,'$1,$2').replace(/[\{\}]/g, '').replace(/,"sd":/g, '\n"sd":') + '</pre>';
  }

  function run(method, numberOfObjectives, numberOfItems, numberOfExecutions, shouldReset) {
    var metrics = createDatabase(method, numberOfObjectives, numberOfItems, shouldReset),
        instance = moea.problem.knapsack.main.getInstance(numberOfObjectives, numberOfItems),
        progress = moea.help.progress.create(numberOfExecutions),
        report;

    verifyUnsavedPareto(instance, true);
    if (numberOfExecutions > 1) moea.method.ga.deactivateLog();
    progress.next(metrics.length);

    while (!progress.isComplete()) {
      metrics = updateMetricsWithOnMoreRun(metrics, method, instance, progress);
    }

    report = moea.help.report.createReport(metrics);
    printReport(report);
    verifyUnsavedPareto(instance, false);
    return report;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.experiment.run', run);

}());
