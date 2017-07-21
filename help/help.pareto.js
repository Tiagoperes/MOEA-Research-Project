(function () {
  'use strict';

  function dominates(p, q, objectives) {
    if (objectives && objectives instanceof Array) return dominatesObjectives(p, q, objectives);
    if (typeof objectives === 'string') return dominatesProperty(p, q, objectives);
    return dominatesArray(p, q);
  }

  function dominatesObjectives(p, q, objectives) {
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

  function dominatesProperty(p, q, property) {
    return dominatesArray(_.get(p, property), _.get(q, property));
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
    for (let i = 0; i < set.length; i++) {
      if (dominates(set[i], solution, objectives)) return true;
    }
  }

  function getNonDominatedSet(solutions, objectives) {
    return _.filter(solutions, function (s) {
      return !isDominatedBySet(s, solutions, objectives);
    });
  }

  function getSolutionInObjectiveSpace(s, objectiveArray) {
    return _.map(objectiveArray, function (o) {
      return o(s);
    });
  }

  function isEqualInObjectiveSpace(p, q, objectives) {
    if (objectives && objectives instanceof Array) {
      return _.isEqual(getSolutionInObjectiveSpace(p, objectives), getSolutionInObjectiveSpace(q, objectives));
    }

    if (typeof objectives === 'string') {
      return _.isEqual(_.get(p, objectives), _.get(q, objectives));
    }

    return _.isEqual(p, q);
  }

  function updateNonDominatedSet(ndSet, newElement, objectives) {
    var newSolutions = [newElement];

    for (let i = 0; i < ndSet.length; i++) {
      let isEqual = isEqualInObjectiveSpace(ndSet[i], newElement, objectives);
      if (isEqual || dominates(ndSet[i], newElement, objectives)) {
        return ndSet;
      }
      if (!dominates(newElement, ndSet[i], objectives)) {
        newSolutions.push(ndSet[i]);
      }
    }

    return newSolutions;
  }

  function ParetoException(message) {
    this.name = 'ParetoException';
    this.message = message;
  }

  function IncompleteParetoException(solutions) {
    this.solutions = solutions;
    this.name = 'IncompleteParetoException';
    this.message = 'IncompleteParetoException: ' + solutions.length + ' solutions found. It is advised to update the Pareto and restart the experiments.';
  }

  function UnsavedParetoException(instanceId, paretoToSave) {
    this.name = 'UnsavedParetoException';
    this.instance = instanceId;
    this.pareto = paretoToSave;
    this.message = 'There are unsaved changes to the Pareto corresponding to this problem instance. Please, save the Pareto and try again.';
  }

  ParetoException.prototype = Object.create(Error.prototype);
  ParetoException.prototype.name = 'ParetoException';
  ParetoException.prototype.constructor = ParetoException;
  IncompleteParetoException.prototype = Object.create(ParetoException.prototype);
  IncompleteParetoException.prototype.name = 'IncompleteParetoException';
  IncompleteParetoException.prototype.constructor = IncompleteParetoException;
  UnsavedParetoException.prototype = Object.create(ParetoException.prototype);
  UnsavedParetoException.prototype.name = 'UnsavedParetoException';
  UnsavedParetoException.prototype.constructor = UnsavedParetoException;

  function getNonDominatedSetMTAux(solutions, ndSet, objectives) {
    return _.filter(solutions, function (s) {
      return !isDominatedBySet(s, ndSet, objectives);
    });
  }

  function getNonDominatedSetMT(solutions, objectives) {
    var startTime = new Date().getTime();

    var numberOfThreads = 4;
    var chunkSize = Math.floor(solutions.length / numberOfThreads);
    var ndSet = [];
    var threads = [];
    return new Promise(function (resolve) {
      for (let i = 0; i < numberOfThreads; i++) {
        let start = i * chunkSize;
        let end = (i === numberOfThreads - 1) ? solutions.length : start + chunkSize;
        let chunk = _.slice(solutions, start, end);
        threads[i] = moea.help.thread(['lib/lodash.js', 'help/help.pareto.js'], 'moea.help.pareto.getNonDominatedSetMTAux', chunk, solutions, objectives);
        threads[i].then(function (result) {
          _.pushAll(ndSet, result);
        });
      }
      Promise.all(threads).then(function () {
        resolve(ndSet);
        console.log('time: ' + (new Date().getTime() - startTime) / 1000 + 's');
      });
    });
  }



  self.moea = self.moea || {};
  _.set(moea, 'help.pareto', {
    dominates: dominates,
    isDominatedBySet: isDominatedBySet,
    getNonDominatedSet: getNonDominatedSet,
    updateNonDominatedSet: updateNonDominatedSet,
    getSolutionInObjectiveSpace: getSolutionInObjectiveSpace,
    ParetoException: ParetoException,
    IncompleteParetoException: IncompleteParetoException,
    UnsavedParetoException: UnsavedParetoException,
    getNonDominatedSetMT: getNonDominatedSetMT,
    getNonDominatedSetMTAux: getNonDominatedSetMTAux
  });
}());
