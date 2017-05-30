(function () {
  'use strict';

  function isNonDominated(individual) {
    return individual.fitness.value < 1;
  }

  function findDistancesToNeighbors(archive, distanceMatrix) {
    _.forEach(archive, function (individual) {
      individual.distances = moea.spea.distance.getNeighborsDistances(archive, individual, distanceMatrix);
    });
  }

  function getMostSimilar(archive, distanceMatrix) {
    var dist2Analyze = 0, distanceArraySize, min;

    findDistancesToNeighbors(archive, distanceMatrix);
    distanceArraySize = archive[0].distances.length;

    while (archive.length > 1 && dist2Analyze < distanceArraySize) {
      let distMin = archive[0].distances[dist2Analyze];
      min = [archive[0]];

      for (let i = 1; i < archive.length; i++) {
        let distI = archive[i].distances[dist2Analyze];
        if (distI < distMin) {
          min = [archive[i]];
          distMin = distI;
        } else if (distI === distMin) {
          min.push(archive[i]);
        }
      }

      dist2Analyze++;
      archive = min;
    }

    return min[0];
  }

  function truncateArchive(archive, archiveSize, distanceMatrix) {
    while (archive.length > archiveSize) {
      var mostSimilar = getMostSimilar(archive, distanceMatrix);
      var indexToRemove = _.findIndex(archive, _.partial(_.isEqual, mostSimilar));
      archive.splice(indexToRemove, 1);
    }
    return archive;
  }

  function selectArchive(individuals, archiveSize, distanceMatrix) {
    var nonDominatedSet = _.filter(individuals, isNonDominated);

    //let debug = _.uniq(_.map(nonDominatedSet, moea.help.binary.toInt));
    //let debug = _.uniq(_.map(nonDominatedSet, _.head));
    //if (debug.length) console.log('Non-dominated set: ' + debug.join(', '));

    if (nonDominatedSet.length === archiveSize) {
      return nonDominatedSet;
    }
    if (nonDominatedSet.length < archiveSize) {
      return _.slice(_.orderBy(individuals, 'fitness.value'), 0, archiveSize);
    }
    return truncateArchive(nonDominatedSet, archiveSize, distanceMatrix);
  }

  window.moea = window.moea || {};
  _.set(moea, 'spea.selection', {
    selectArchive: selectArchive,
    isNonDominated: isNonDominated
  });
}());
