(function () {
  'use stict';

  function dominates(p, q, objectives) {
    var better = false,
        worse = false,
        i = 0;

    while (!worse && i < objectives.length) {
      let pValue = objectives[i](p);
      let qValue = objectives[i](q);
      if (pValue < qValue) better = true;
      if (pValue > qValue) worse = true;
      i++;
    }

    return better && !worse;
  }

  function isDominatedBySet(solution, set, objectives) {
    return _.reduce(set, function (result, s) {
      return result || dominates(s, solution, objectives);
    }, false);
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.pareto', {
    dominates: dominates,
    isDominatedBySet: isDominatedBySet
  });
}());
