(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates,
      getNonDominatedSet = moea.help.pareto.getNonDominatedSet;

  function findIndexOfFirstFrontNotDominatingIndividual(fronts, individual) {
    var dominated = true,
        i = 0;

    while (i < fronts.length && dominated) {
      dominated = false;
      let j = 0;
      while (j < fronts[i].length && !dominated) {
        dominated = dominates(fronts[i][j], individual, 'evaluation');
        j++;
      }
      i++;
    }
    return i;
  }

  function moveDominatedToNextFront(dominatedIndividuals, frontIndex, fronts) {
    var ndSet,
        front = fronts[frontIndex],
        nextFront = fronts[frontIndex + 1];

    if (_.isEmpty(dominatedIndividuals)) return;

    _.remove(front, function (individual) {
      return _.includes(dominatedIndividuals, individual);
    });

    if (!nextFront) {
      _.forEach(dominatedIndividuals, _.partial(_.set, _, 'front', dominatedIndividuals));
      fronts.push(dominatedIndividuals);
      return;
    }

    _.forEach(dominatedIndividuals, _.partial(_.set, _, 'front', nextFront));
    _.pushAll(nextFront, dominatedIndividuals);

    ndSet = getNonDominatedSet(nextFront, 'evaluation');
    moveDominatedToNextFront(_.difference(nextFront, ndSet), frontIndex + 1, fronts);
  }

  function updateFronts(fronts, child) {
    var frontIndex = findIndexOfFirstFrontNotDominatingIndividual(fronts, child),
        dominatedByChild;

    if (frontIndex === fronts.length) {
      child.front = [child];
      fronts.push(child.front);
      return;
    }

    dominatedByChild = _.filter(fronts[frontIndex], function (individual) {
      return dominates(child, individual, 'evaluation');
    });

    if (dominatedByChild.length === fronts[frontIndex].length) {
      child.front = [child];
      fronts.splice(frontIndex, 0, child.front);
    }
    else  {
      child.front = fronts[frontIndex];
      child.front.push(child);
      moveDominatedToNextFront(dominatedByChild, frontIndex, fronts);
    }
  }

  function createPointersToFronts(fronts) {
    _.forEach(fronts, function (individual) {
      _.forEach(individual, _.partial(_.set, _, 'front', individual));
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.moeadd.ranking', {
    updateFronts: updateFronts,
    createPointersToFronts: createPointersToFronts
  });
}());
