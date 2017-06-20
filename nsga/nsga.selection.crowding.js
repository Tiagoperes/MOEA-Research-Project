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

  function naturalSelection(fronts, maxPopulationSize) {
    var population = [];
    _.forEach(fronts, _.partial(calculateDistances));

    while (population.length < maxPopulationSize) {
      let front = _.head(fronts);
      if (population.length + front.length <= maxPopulationSize) {
        population = _.concat(population, front);
        fronts = _.tail(fronts);
      } else {
        let frontOrderedByDistance = _.orderBy(front, 'fitness.distance', 'desc');
        population = _.concat(population, _.take(frontOrderedByDistance, maxPopulationSize - population.length));
      }
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.selection.crowding.select', naturalSelection);
}());
