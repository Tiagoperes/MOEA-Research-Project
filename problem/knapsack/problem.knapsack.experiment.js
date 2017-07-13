(function () {
  'use strict';

  function createDatabase(method, numberOfObjectives, numberOfItems, reset) {
    var name = 'kp-res-' + numberOfObjectives + '-' + numberOfItems + '-' + method,
        array;

    if (!localStorage[name] || reset) {
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

  function printReport(report) {
    document.body.innerHTML = '<pre>' + JSON.stringify(report).replace(/"er":(\d+\.?\d*),"gd":(\d+\.?\d*),"ps":(\d+\.?\d*),"pcr":\d+\.?\d*,"sp":\d+\.?\d*,"fsp":(\d+\.?\d*),"ms":(\d+\.?\d*),"hv":(\d+\.?\d*)/g, '$1\t$2\t$3\t$4\t$5\t$6').replace(/(\d+)\.(\d+)/g,'$1,$2').replace(/[\{\}]/g, '').replace(/,"sd":/g, '\n"sd":') + '</pre>';
  }

  function run(method, numberOfObjectives, numberOfItems, numberOfExecutions, reset) {
    var metrics = createDatabase(method, numberOfObjectives, numberOfItems, reset),
        instance = moea.problem.knapsack.main.getInstance(numberOfObjectives, numberOfItems),
        numberOfRuns = numberOfExecutions - metrics.length,
        report;

    for (let i = 0; i < numberOfRuns; i++) {
      console.log('\nEXECUTION ' + (i + 1) + '\n---------------------');
      let result = getMetricsForMethod(method, instance);
      metrics.push(result);
    }

    report = moea.help.report.createReport(metrics);
    printReport(report);
    return report;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.experiment.run', run);

}());
