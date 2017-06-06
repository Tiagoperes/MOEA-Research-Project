(function () {
  'use stict';

  function dominates(p, q, objectives) {
    var better = false,
        worse = false,
        i = 0;

    while (!worse && i < objectives.length) {
      let pValue = objectives[i](p);
      let qValue = objectives[i](q);
      let dif = Math.abs(pValue - qValue);
      if (dif > 0.000000001 && pValue < qValue) better = true;
      if (dif > 0.000000001 && pValue > qValue) worse = true;
      i++;
    }

    return better && !worse;
  }

  function dominatesArray(p, q) {
    var better = false,
        worse = false,
        i = 0;

    while (!worse && i < p.length) {
      let dif = Math.abs(p[i] - q[i]);
      if (dif > 0.000000001 && p[i] < q[i]) better = true;
      if (dif > 0.000000001 && p[i] > q[i]) worse = true;
      i++;
    }

    return better && !worse;
  }

  function isDominatedBySet(solution, set, objectives) {
    return _.reduce(set, function (result, s) {
		var d =  dominates(s, solution, objectives);
		//if (!result && d) console.log(solution + ' dominated by ' + s);
		return result || d;
    }, false);
  }

  function getNonDominatedSet(solutions, objectives) {
    return _.filter(solutions, function (s) {
      for (let i = 0; i < solutions.length; i++) {
        if (dominates(solutions[i], s, objectives)) {
          return false;
        }
      }
      return true;
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.pareto', {
    dominates: dominates,
    dominatesArray: dominatesArray,
    isDominatedBySet: isDominatedBySet,
    getNonDominatedSet: getNonDominatedSet
  });
}());
