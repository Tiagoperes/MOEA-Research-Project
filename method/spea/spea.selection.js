(function () {
  'use strict';

  function isNonDominated(individual) {
    return individual.fitness.value < 1;
  }

  function updateNearestNeighbors(archive) {
    _.forEach(archive, function (individual) {
      individual.nearestNeighbors = _.filter(individual.nearestNeighbors, function (neighbor) {
        return neighbor.individual !== individual && _.includes(archive, neighbor.individual);
      });
    });
  }

  function getIndividualsWithMinimumDistance(archive, dist2Analyze) {
    let distMin = archive[0].nearestNeighbors[dist2Analyze].distance;
    let min = [archive[0]];

    for (let i = 1; i < archive.length; i++) {
      let distI = archive[i].nearestNeighbors[dist2Analyze].distance;
      if (distI < distMin) {
        min = [archive[i]];
        distMin = distI;
      } else if (distI === distMin) {
        min.push(archive[i]);
      }
    }

    return min;
  }

  function getMostSimilar(archive) {
    var dist2Analyze = 0,
        distanceArraySize = archive.length - 1;

    while (archive.length > 1 && dist2Analyze < distanceArraySize) {
      archive = getIndividualsWithMinimumDistance(archive, dist2Analyze);
      dist2Analyze++;
    }

    return archive[0];
  }

  function removeFromArchive(archive, individualToRemove) {
    var index = _.indexOf(archive, individualToRemove);
    archive.splice(index, 1);
  }

  function removeFromNearestNeighbors(archive, individualToRemove) {
    _.forEach(archive, function (individual) {
      individual.nearestNeighbors = _.filter(individual.nearestNeighbors, function (neighbor) {
        return neighbor.individual !== individualToRemove;
      });
    });
  }

  function truncateArchive(archive, archiveSize) {
    updateNearestNeighbors(archive);
    while (archive.length > archiveSize) {
      let mostSimilar = getMostSimilar(archive);
      removeFromArchive(archive, mostSimilar);
      removeFromNearestNeighbors(archive, mostSimilar);
    }
    return archive;
  }

  function selectArchive(individuals, archiveSize) {
    var nonDominatedSet = _.filter(individuals, isNonDominated);

    if (nonDominatedSet.length === archiveSize) {
      return nonDominatedSet;
    }
    if (nonDominatedSet.length < archiveSize) {
      return _.slice(_.orderBy(individuals, 'fitness.value'), 0, archiveSize);
    }
    return truncateArchive(nonDominatedSet, archiveSize);
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.spea.selection', {
    selectArchive: selectArchive,
    isNonDominated: isNonDominated
  });
}());
