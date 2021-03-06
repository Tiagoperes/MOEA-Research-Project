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

  function loadParetoSet(dbName) {
    if (window.__pareto_cache && window.__pareto_cache[dbName]) {
      return window.__pareto_cache[dbName];
    }
    let db = localStorage.getItem(dbName + '-ps');
    if (db) {
      db = JSON.parse(LZString.decompress(db));
    } else {
      db = [];
    }
    return db;
  }

  function saveParetoSet(dbName, solutions) {
    let db = loadParetoSet(dbName);
    db.push(solutions);
    window.__pareto_cache = window.__pareto_cache || {};
    window.__pareto_cache[dbName] = db;
    localStorage.setItem(dbName + '-ps', LZString.compress(JSON.stringify(db)));
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

  function updateMetricsWithOneMoreRun(metrics, method, instance, progress, problemSettings) {
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

  function metricsLoop(method, progress, metrics, instance, problemSettings) {
    if (!progress.isComplete()) {
      return updateMetricsWithOneMoreRun(metrics, method, instance, progress, problemSettings).then(function () {
        return metricsLoop(method, progress, metrics, instance, problemSettings);
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

  function printSolutionSets(dbName) {
    let psSet = loadParetoSet(dbName);
    let str = '';
    _.forEach(psSet, function (ps, index) {
      _.forEach(ps, function (solution) {
        str += solution.join(' ') + '\n';
      });
      if (index < psSet.length - 1) str += '#\n';
    });
    document.body.innerHTML += '<pre>' + str + '</pre>';
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

  function createDownloadButton(dbName, str) {
    window.__download = window.__download || {};
    window.__download[dbName] = str;
    document.body.innerHTML += '<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(str) + '" download="' + dbName + '.txt"><button>' + dbName + '</button></a>';
  }

  function computeSolutions(method, instance, numberOfExecutions, shouldReset, dbName, problemSettings) {
    let str = '',
        objectives = problemSettings.getObjectives(instance),
        progress = moea.help.progress.create(numberOfExecutions);

    if (shouldReset) {
      localStorage.removeItem(dbName + '-ps');
    } else {
      str = localStorage[dbName + '-ps'];
      progress.next(_.filter(str, _.partial(_.isEqual, _, '#')).length);
    }

    if (numberOfExecutions > 1) moea.method.ga.deactivateLog();

    while (!progress.isComplete()) {
      let solutions = problemSettings.runAlgorithm(method, instance),
          invalid = problemSettings.countInvalidSolutions(solutions, instance),
          evaluations = _.map(solutions, _.partial(moea.help.pareto.getSolutionInObjectiveSpace, _, objectives, true)),
          uniqueInOS = _.uniqWith(evaluations, _.isEqual);

      if (invalid > 0) throw Error(invalid + ' invalid solutions!');
      str += '#\r\n';
      _.forEach(uniqueInOS, function (s) {
        str += s.join(' ') + '\r\n';
      });
      try {
        localStorage[dbName + '-ps'] = str;
      } catch(e) {
        console.log('Attention: localstorage is full!');
      }

      progress.next();
    }

    str += '#';
    createDownloadButton(dbName, str);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.generic.experiment', {
    run: run,
    getFormattedResults: getFormattedResults,
    printSolutionSets: printSolutionSets,
    computeSolutions: computeSolutions
  });

}());
