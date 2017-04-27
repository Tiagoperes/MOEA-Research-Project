(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates;

  function determineDomination(p, q, objectives) {
    if (dominates(p, q, objectives)) {
      p.fitness.dominatedSet.push(q);
    } else if (dominates(q, p, objectives)) {
      p.fitness.dominationCount++;
    }
  }

  function initializeFitness(individual) {
    individual.fitness = {
      dominatedSet: [],
      dominationCount: 0
    };
  }

  function determineFront(individual, front, rank) {
    if (individual.fitness.dominationCount === 0) {
      individual.fitness.rank = rank;
      front.push(individual);
    }
  }

  function initializeFirstFront(population, fronts, objectives) {
    fronts.push([]);
    _.forEach(population, function (p) {
      initializeFitness(p);
      _.forEach(population, _.partial(determineDomination, p, _, objectives));
      determineFront(p, fronts[0], 0);
    });
  }

  function calculateNextFront(currentFront, rank) {
    var nextFront = [];
    _.forEach(currentFront, function (p) {
      _.forEach(p.fitness.dominatedSet, function (q) {
        q.fitness.dominationCount--;
        determineFront(q, nextFront, rank);
      });
    });
    return nextFront;
  }

  function calculateOtherFronts(fronts) {
    var i = 0;
    while (!_.isEmpty(fronts[i])) {
      fronts[i + 1] = calculateNextFront(fronts[i], i + 1);
      i++;
    }
    fronts.pop();
  }

  function rank(population, objectives) {
    var fronts = [];
    initializeFirstFront(population, fronts, objectives);
    calculateOtherFronts(fronts);
    return fronts;
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.ranking.rank', rank);
}());
