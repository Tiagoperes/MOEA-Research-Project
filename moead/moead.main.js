(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates,
      scalarize, best;

  function getRandomWeightVector(numberOfObjectives) {
    var rand = _.map(new Array(numberOfObjectives - 1), Math.random);
    var weights = [];
    rand.push(0);
    rand.push(1);
    rand = _.orderBy(rand);
    for (let i = 1; i < rand.length; i++) {
      weights.push(rand[i] - rand[i - 1]);
    }
    return weights;
  }

  function generateCells(populationSize, numberOfObjectives, randomize) {
    var cells = [];
    for (let i = 0; i < populationSize; i++) {
      let weights = getRandomWeightVector(numberOfObjectives);
      let solution = randomize();
      cells.push({weights: weights, solution: solution});
    }
    return cells;
  }

  function getEuclideanDistance(a, b) {
    return Math.sqrt(_.reduce(a, function (sum, value, index) {
      return Math.pow(value - b[index], 2);
    }, 0));
  }

  function createEmptyMatrix(size) {
    var matrix = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
    }
    return matrix;
  }

  function getDistanceMatrix(cells) {
    var distanceMatrix = createEmptyMatrix(cells.length);

    for (let i = 0; i < cells.length; i++) {
      distanceMatrix[i][i] = 0;
      for (let j = i + 1; j < cells.length; j++) {
        let dist = getEuclideanDistance(cells[i].weights, cells[j].weights);
        distanceMatrix[i][j] = {distance: dist, cell: cells[j]};
        distanceMatrix[j][i] = {distance: dist, cell: cells[i]};
      }
    }
    return distanceMatrix;
  }

  function createNeighborhoodMap(cells, neighborhoodSize) {
    var distanceMatrix = getDistanceMatrix(cells);
    return _.map(cells, function (cell, index) {
      return _.map(_.slice(_.orderBy(distanceMatrix[index], 'distance'), 0, neighborhoodSize), 'cell');
    });
  }

  function scalarizeWS(solution, weights, objectives) {
    return _.reduce(weights, function (sum, weight, index) {
      return sum + weight * objectives[index](solution);
    }, 0);
  }

  function scalarizeTE(solution, weights, objectives) {
    return _.reduce(weights, function (max, weight, index) {
      var solValue = objectives[index](solution),
          dif;

      if (best[index] === undefined || solValue < best[index]) {
        best[index] = solValue;
      }

      dif = weight * Math.abs(solValue - best[index]);
      return dif > max ? dif : max;
    }, 0);
  }

  function evaluate(cells, objectives) {
    _.forEach(cells, function (cell) {
      cell.fitness = scalarize(cell.solution, cell.weights, objectives);
    });
  }

  function updateNeighborhood(neighborhood, child, objectives) {
    _.forEach(neighborhood, function (cell) {
      var childFitness = scalarize(child, cell.weights, objectives);
      if (childFitness <= cell.fitness) {
        cell.solution = child;
        cell.fitness = childFitness;
        return false;
      }
    });
  }

  function getSolutionInObjectiveSpace(solution, objectives) {
    return _.map(objectives, function(objective) {
      return objective(solution);
    });
  }

  function isContainedInArchive(element, archive, objectives) {
    var fElement = getSolutionInObjectiveSpace(element, objectives);
    var contained = false;
    var i = 0;
    while (!contained && i < archive.length) {
      let fArchiveElement = getSolutionInObjectiveSpace(archive[i], objectives);
      contained = _.isEqual(fElement, fArchiveElement);
      i++;
    }
    return contained;
  }

  function updateArchive(archive, child, objectives) {
    var newArchive = [];

    if (isContainedInArchive(child, archive, objectives)) {
      return archive;
    }

    for (let i = 0; i < archive.length; i++) {
      if (dominates(archive[i], child, objectives)) {
        return archive;
      }
      if (!dominates(child, archive[i], objectives)) {
        newArchive.push(archive[i]);
      }
    }

    newArchive.push(child);
    return newArchive;
  }

  function mutate(child, mutation) {
    if (Math.random() < mutation.rate) {
      return mutation.method(child);
    }
    return child;
  }

  function moead(settings) {
    var cells = generateCells(settings.populationSize, settings.objectives.length, settings.randomize),
        neighborhoodMap = createNeighborhoodMap(cells, settings.neighborhoodSize),
        archive = [];

    best = [];
    scalarize = settings.useTchebycheff ? scalarizeTE : scalarizeWS;
    evaluate(cells, settings.objectives);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      _.forEach(cells, function (cell, index) {
        let neighborhood = neighborhoodMap[index];
        let parents = _.map(_.sampleSize(neighborhood, 2), 'solution');
        let child = mutate(_.sample(settings.crossover.method(parents[0], parents[1])), settings.mutation);
        updateNeighborhood(neighborhood, child, settings.objectives);
        archive = updateArchive(archive, child, settings.objectives);
      });
    }

    console.log(best);
    return archive;
  }

  window.moea = window.moea || {};
  _.set(moea, 'moead.main.execute', moead);
}());
