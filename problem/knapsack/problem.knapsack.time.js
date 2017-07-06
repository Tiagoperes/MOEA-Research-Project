(function () {
  'use strict';

  function getTime(method, numberOfObjectives, numberOfItems, numberOfExecutions, progress) {
    var times = [],
        instance = moea.problem.knapsack.main.getInstance(numberOfObjectives, numberOfItems),
        mean, sd;

    for (let i = 0; i < numberOfExecutions; i++) {
      let start = new Date().getTime();
      moea.problem.knapsack.algorithm.run(method, instance);
      let end = new Date().getTime();
      times.push(end - start);
      progress.next();
    }

    mean = _.sum(times) / numberOfExecutions;
    sd = Math.sqrt(_.sumBy(times, function (time) {return Math.pow(time - mean, 2)}) / numberOfExecutions);

    return {mean: mean, sd: sd};
  }

  function getTimesForAlgorithm(method, objectives, numberOfExecutions, progress) {
    var times = {},
        items = 100;

    for (let i = 0; i < objectives.length; i++) {
      times[objectives[i] + '-' + items] = getTime(method, objectives[i], items, numberOfExecutions, progress);
    }

    return times;
  }

  function createProgress(numberOfExecutions, numberOfAlgorithms, numberOfObjectiveFormulations) {
    var percent = 0,
        step = 100 / (numberOfExecutions * numberOfAlgorithms * numberOfObjectiveFormulations);

    return {
      next: function () {
        percent += step;
        console.log(Math.floor(percent) + '%');
      }
    };
  }

  function printTimes(times) {
    document.body.innerHTML = '<pre>' + JSON.stringify(times).replace(/[\{},]/g, '\n') + '</pre>';
  }

  function getTimes(numberOfExecutions, algorithms, objectives) {
    var times = {},
        progress;

    moea.method.ga.deactivateLog();
    algorithms = algorithms || _.keys(moea.problem.knapsack.algorithm.methods);
    objectives = objectives || [2, 3, 4, 5, 6];
    progress = createProgress(numberOfExecutions, algorithms.length, objectives.length);

    _.forEach(algorithms, function (alg) {
      times[alg] = getTimesForAlgorithm(alg, objectives, numberOfExecutions, progress);
    });
    printTimes(times);
    return times;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.time.getTimes', getTimes);

}());
