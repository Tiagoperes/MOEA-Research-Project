(function () {
  'use strict';

  const SHOULD_IGNORE_NEW_SOLUTIONS = true;

  function createReport(executions) {
    var report = {
      mean: {
        er: _.sumBy(executions, 'er') / executions.length,
        gd: _.sumBy(executions, 'gd') / executions.length,
        ps: _.sumBy(executions, 'ps') / executions.length,
        pcr: _.sumBy(executions, 'pcr') / executions.length,
        sp: _.sumBy(executions, 'sp') / executions.length,
        fsp: _.sumBy(executions, 'fsp') / executions.length,
        ms: _.sumBy(executions, 'ms') / executions.length,
        hv: _.sumBy(executions, 'hv') / executions.length
      },
      sd: {}
    };
    
    _.forEach(report.mean, function (mean, metric) {
      report.sd[metric] = Math.sqrt(_.sumBy(executions, function (execution) {return Math.pow(execution[metric] - report.mean[metric], 2)}) / executions.length);
    });

    report.toString = function () {
      var str = '';
      str += '------------------------';
      str += '\nNo de execuções: ' + executions.length;
      str += '\nTaxa de erro: ' + report.er.toFixed(2);
      str += '\nGenerational distance: ' + report.gd.toFixed(2);
      str += '\nPareto subset: ' + report.ps.toFixed(2);
      str += '\nTaxa de cobertura do Pareto: ' + report.pcr.toFixed(2);
      str += '\nSpread: ' + report.sp.toFixed(2);
      str += '\nSpread (Fialho): ' + report.fsp.toFixed(2);
      str += '\nMáximo spread: ' + report.ms.toFixed(2);
      str += '\nHipervolume: ' + report.hv.toFixed(2);
      str += '\n------------------------';
      return str;
    };

    return report;
  }

  function isSolutionEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      let dif = Math.abs(a[i] - b[i]);
      if (dif > 0.00000001) return false;
    }
    return true;
  }

  function getErrorRate(solutions, pareto) {
    var newSolutions = [];
    var sum =  _.sumBy(solutions, function (s) {
      s[0] = parseFloat((s[0]).toFixed(9));
      s[1] = parseFloat((s[1]).toFixed(9));
      s[5] = parseFloat((s[5]).toFixed(3));
      var isDominated = moea.help.pareto.isDominatedBySet(s, pareto);
      if (isDominated) return 1;
      if (!SHOULD_IGNORE_NEW_SOLUTIONS && !_.find(pareto, _.partial(_.isEqual, s))) {
        newSolutions.push(s);
      }
      return 0;
    });
    if (newSolutions.length) throw new moea.help.pareto.IncompleteParetoException(newSolutions);
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
      return Math.pow(_.min(_.map(pareto, _.partial(getDistance, s))), 2);
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
    return getDistance(_.head(setA), _.head(setB)) + getDistance(_.last(setA), _.last(setB));
  }

  function getConsecutiveDistances(solutions) {
    return _.map(_.dropRight(solutions), function (s, i) {
      return getDistance(s, solutions[i + 1]);
    });
  }

  function getFialhosSpread(solutions, pareto) {
    var orderedSolutions = _.orderBy(solutions),
        orderedPareto = _.orderBy(pareto),
        de = getDistanceBetweenSetsExtremes(orderedSolutions, orderedPareto),
        cd = getConsecutiveDistances(orderedSolutions),
        medianDistance = _.sum(cd) / cd.length,
        globalDifferenceToMedian = _.sumBy(cd, function (dist) {
          return Math.abs(dist - medianDistance);
        });

    return (de + globalDifferenceToMedian) / (de + cd.length * medianDistance);
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
      return _.reduce(s, function (sum, value, index) {
        return sum + Math.abs(value - reference[index]);
      }, 0);
    });
  }

  function getMetrics(solutions, pareto, hvReference) {
    var er = getErrorRate(solutions, pareto),
        ps = (1 - er) * solutions.length;

    return {
      er: er,
      gd: getGenerationalDistance(solutions, pareto),
      ps: ps,
      pcr: ps / pareto.length,
      sp: getSpread(solutions),
      fsp: getFialhosSpread(solutions, pareto),
      ms: getMaximumSpread(solutions),
      hv: getHipervolume(solutions, hvReference)
    };
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.report', {
    getMetrics: getMetrics,
    createReport: createReport
  });
}());
