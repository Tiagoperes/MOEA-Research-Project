(function () {
  'use strict';

  function createReport(executions) {
    var report = {
      er: _.sumBy(executions, 'er') / executions.length,
      gd: _.sumBy(executions, 'gd') / executions.length,
      ps: _.sumBy(executions, 'ps') / executions.length,
      sp: _.sumBy(executions, 'sp') / executions.length,
      fsp: _.sumBy(executions, 'fsp') / executions.length,
      ms: _.sumBy(executions, 'ms') / executions.length,
      hv: _.sumBy(executions, 'hv') / executions.length
    };

    report.toString = function () {
      var str = '';
      str += '------------------------';
      str += '\nNo de execuções: ' + executions.length;
      str += '\nTaxa de erro: ' + report.er.toFixed(2);
      str += '\nGenerational distance: ' + report.gd.toFixed(2);
      str += '\nPareto subset: ' + report.ps.toFixed(2);
      str += '\nSpread: ' + report.sp.toFixed(2);
      str += '\nSpread (Fialho): ' + report.fsp.toFixed(2);
      str += '\nMáximo spread: ' + report.ms.toFixed(2);
      str += '\nHipervolume: ' + report.hv.toFixed(2);
      str += '\n------------------------';
      return str;
    };

    report.toExcel = function () {
      var str = '';

      _.forEach(executions[0], function (value, key) {
        str += '\t' + key;
      });

      _.forEach(executions, function (e, index) {
        str += '\nexec ' + (index + 1);
        _.forEach(e, function (value) {
          str += '\t' + value.toFixed(2);
        });
      });

      return str;
    };

    return report;
  }

  function getParetoSet(network, problem) {
    return moea.problem.prm.paretos[network][problem];
  }

  function getObjectiveArray(solution) {
    return _.map(solution, function (value, index) {
      return _.partial(_.get, _, index);
    });
  }

  function getErrorRate(solutions, pareto, objectives) {
    var sum =  _.sumBy(solutions, function (s) {
      return moea.help.pareto.isDominatedBySet(s, pareto, objectives) ? 1 : 0;
    });
    return sum / solutions.length;
  }

  function getDistance(s1, s2) {
    var sum = 0;
    for (let i = 0; i < s1.length; i++) {
      sum += Math.pow(s1[i] - s2[i], 2);
    }
    return Math.sqrt(sum);
  }

  function getGenerationalDistance(solutions, pareto) {
    var sum = _.sumBy(solutions, function (s) {
      return _.min(_.map(pareto, _.partial(getDistance, s)));
    });
    return Math.sqrt(sum) / solutions.length;
  }

  function getDistanceToClosest(solution, solutions) {
    var min = Infinity;
    _.forEach(solutions, function (s) {
      var dist = getDistance(solution, s);
      if (dist > 0 && dist < min) min = dist;
    });
    return min;
  }

  function findExtremes(solutions) {
    var numberOfObjectives = solutions[0].length;
    var extremes = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      extremes.push({lower: solutions[0], upper: solutions[0]});
    }

    _.forEach(_.drop(solutions), function (s) {
      _.forEach(s, function (value, i) {
        if (value < extremes[i].lower[i]) extremes[i].lower = s;
        if (value > extremes[i].upper[i]) extremes[i].upper = s;
      });
    });

    return extremes;
  }

  function getClosestDistanceToExtremes(solutions) {
    var extremes = findExtremes(solutions);
    return _.sumBy(extremes, function (e) {
      var min = Infinity;
      _.forEach(solutions, function (s) {
        var distanceToLowerExtreme = getDistance(e.lower, s);
        var distanceToUpperExtreme = getDistance(e.upper, s);
        var distance = distanceToLowerExtreme + distanceToUpperExtreme;
        if (distance < min) min = distance;
      });
      return min;
    });
  }

  function getSpread(solutions) {
    var de = getClosestDistanceToExtremes(solutions);
    var cd = _.map(solutions, _.partial(getDistanceToClosest, _, solutions));
    var medianDistance = _.sum(cd) / solutions.length;
    var globalDifferenceToMedian = _.sumBy(cd, function (dist) {
      return Math.abs(dist - medianDistance);
    });
    return (de + globalDifferenceToMedian) / (de + solutions.length * medianDistance);
  }

  function getDistanceBetweenSetsExtremes(setA, setB) {
    var numberOfObjectives = setA[0].length;
    var sum = 0;
    for (let i = 0; i < numberOfObjectives; i++) {
      let minA = _.minBy(setA, i);
      let minB = _.minBy(setB, i);
      let maxA = _.maxBy(setA, i);
      let maxB = _.maxBy(setB, i);
      sum += getDistance(minA, minB) + getDistance(maxA, maxB);
    }
    return sum;
  }

  function getConsecutiveDistances(solutions) {
    var ordered = _.orderBy(solutions);
    return _.map(_.dropRight(ordered), function (s, i) {
      return getDistance(s, ordered[i + 1]);
    });
  }

  function getFialhosSpread(solutions, pareto) {
    var de = getDistanceBetweenSetsExtremes(solutions, pareto);
    var cd = getConsecutiveDistances(solutions);
    var medianDistance = _.sum(cd) / solutions.length;
    var globalDifferenceToMedian = _.sumBy(cd, function (dist) {
      return Math.abs(dist - medianDistance);
    });
    return (de + globalDifferenceToMedian) / (de + solutions.length * medianDistance);
  }

  function getMaximumSpread(solutions) {
    var numberOfObjectives = solutions[0].length;
    var sum = 0;
    for (let i = 0; i < numberOfObjectives; i++) {
      let min = solutions[0][i];
      let max = solutions[0][i];
      for (let j = 1; j < solutions.length; j++) {
        if (solutions[j][i] < min) min = solutions[j][i];
        if (solutions[j][i] > max) max = solutions[j][i];
      }
      sum += Math.pow(max - min, 2);
    }
    return Math.sqrt(sum);
  }

  function getHipervolume(solutions, reference) {
    return _.sumBy(solutions, function (s) {
      var sum = 0;
      for (let i = 0; i < s.length; i++) {
        sum += Math.abs(s[i] - reference[i]);
      }
      return sum;
    });
  }

  function getMetrics(network, problem, solutions, hvReference) {
    var pareto = getParetoSet(network, problem),
        objectives = getObjectiveArray(solutions[0]),
        er = getErrorRate(solutions, pareto, objectives);

    return {
      er: er,
      gd: getGenerationalDistance(solutions, pareto),
      ps: (1 - er) * solutions.length,
      sp: getSpread(solutions),
      fsp: getFialhosSpread(solutions, pareto),
      ms: getMaximumSpread(solutions),
      hv: getHipervolume(solutions, hvReference)
    };
  }

  _.set(moea, 'problem.prm.report', {
    getMetrics: getMetrics,
    createReport: createReport
  });
}());
