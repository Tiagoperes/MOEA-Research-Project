(function () {
  'use strict';

  function orderByCrowdingDistance(front, objectives) {
    _.forEach(front, _.partial(_.set, _, 'fitness.distance', 0));

    _.forEach(objectives, function (objective) {
      var ordered = _.orderBy(front, objective),
        maxDistance = objective(_.last(ordered)) - objective(_.head(ordered));
      if (maxDistance === 0) return false;
      _.head(ordered).fitness.distance = Infinity;
      _.last(ordered).fitness.distance = Infinity;
      for (let i = 1; i < ordered.length - 1; i++) {
        ordered[i].fitness.distance += (objective(ordered[i - 1]) - objective(ordered[i + 1])) / maxDistance;
      }
    });

    return _.orderBy(front, 'fitness.distance', 'desc');
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.crowding.orderByCrowdingDistance', orderByCrowdingDistance);
}());
