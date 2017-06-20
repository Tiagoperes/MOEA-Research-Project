(function () {
  'use strict';

  function orderFrontByObjective(front, objectiveIndex) {
    return _.orderBy(front, function (individual) {
      return individual.evaluation[objectiveIndex];
    });
  }

  function addDistanceInObjective(front, objectiveIndex) {
    let ordered = orderFrontByObjective(front, objectiveIndex);
    let maxDistance = _.last(ordered).evaluation[objectiveIndex] - _.first(ordered).evaluation[objectiveIndex];

    if (maxDistance === 0) return false;

    _.first(ordered).fitness.distance = Infinity;
    _.last(ordered).fitness.distance = Infinity;

    for (let i = 1; i < ordered.length - 1; i++) {
      ordered[i].fitness.distance += (ordered[i + 1].evaluation[objectiveIndex] - ordered[i - 1].evaluation[objectiveIndex]) / maxDistance;
    }
  }

  function calculateDistances(front) {
    var numberOfObjectives = front[0].evaluation.length;

    _.forEach(front, _.partial(_.set, _, 'fitness.distance', 0));

    for (let i = 0; i < numberOfObjectives; i++) {
      addDistanceInObjective(front, i);
    }
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.crowding.calculateDistances', calculateDistances);
}());
