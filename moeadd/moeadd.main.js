(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates,
      getNonDominatedSet = moea.help.pareto.getNonDominatedSet;

  function generateAllPossibleWeightVectors(numberOfObjectives, divisions) {
    var weights = [];
    var w = _.fill(new Array(numberOfObjectives), 0);
    var i = numberOfObjectives - 1;
    while (i >= 0) {
      weights.push(_.clone(w));
      while (w[i] === divisions) {
        i--;
      }
      if (i >= 0) {
        w[i]++;
        i++;
        while (i < numberOfObjectives) {
          w[i] = 0;
          i++;
        }
        i--;
      }
    }
    return weights;
  }

  function generateUniformWeightVectors(numberOfObjectives, divisions) {
    var weights = _.filter(generateAllPossibleWeightVectors(numberOfObjectives, divisions), function (w) {
      return _.sum(w) === divisions;
    });
    return _.map(weights, _.partial(_.map, _, _.partial(_.divide, _, divisions)));
  }

  function generateRegions(numberOfObjectives, divisions) {
    var regions = [];
    var wVectors = generateUniformWeightVectors(numberOfObjectives, divisions);
    for (let i = 0; i < wVectors.length; i++) {
      regions.push({weights: wVectors[i], population: []});
    }
    return regions;
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

  function getDistanceMatrix(regions) {
    var distanceMatrix = createEmptyMatrix(regions.length);

    for (let i = 0; i < regions.length; i++) {
      distanceMatrix[i][i] = {distance: 0, region: regions[i]};
      for (let j = i + 1; j < regions.length; j++) {
        let dist = getEuclideanDistance(regions[i].weights, regions[j].weights);
        distanceMatrix[i][j] = {distance: dist, region: regions[j]};
        distanceMatrix[j][i] = {distance: dist, region: regions[i]};
      }
    }
    return distanceMatrix;
  }

  function createNeighborhoods(regions, neighborhoodSize) {
    var distanceMatrix = getDistanceMatrix(regions);
    _.forEach(regions, function (region, index) {
      region.neighborhood = _.map(_.slice(_.orderBy(distanceMatrix[index], 'distance'), 0, neighborhoodSize), 'region');
    });
  }

  function createIndividual(solution, objectives) {
    return {
      solution: solution,
      evaluation: getSolutionInObjectiveSpace(solution, objectives)
    };
  }

  function generatePopulation(randomize, size, objectives) {
    var pop = [];
    for (let i = 0; i < size; i++) {
      pop.push(createIndividual(randomize(), objectives));
    }
    return pop;
  }

  function scalarize(objectiveValues, weights) {
    return _.reduce(weights, function (sum, weight, index) {
      return sum + weight * objectiveValues[index];
    }, 0);
  }

  function distributePopulationRandomly(population, regions) {
    _.forEach(population, function (individual) {
      var region = _.sample(regions);
      individual.scalarizedFitness = scalarize(individual.evaluation, region.weights);
      individual.region = region;
      region.population.push(individual);
    });
  }

  function getAngleBetweenVectors(v1, v2) {
    var dotProduct = _.sum(_.multiplyArrays(v1, v2)),
        v1Magnitude = Math.sqrt(_.sumBy(v1, _.partial(Math.pow, _, 2))),
        v2Magnitude = Math.sqrt(_.sumBy(v2, _.partial(Math.pow, _, 2))),
        cosine = dotProduct / (v1Magnitude * v2Magnitude);

    if (isNaN(cosine)) return Math.acos(1);
    return Math.acos(cosine);
  }

  function distributePopulation(population, regions) {
    _.forEach(population, function (individual) {
      var angleByRegion = _.map(regions, function (region) {
        return getAngleBetweenVectors(individual.normalizedEvaluation, region.weights);
      });
      var angle = _.min(angleByRegion);
      var belongingRegionIndex = _.indexOf(angleByRegion, angle);
      individual.region = regions[belongingRegionIndex];
      if (!individual.region) {
        debugger;
      }
      individual.scalarizedFitness = scalarize(individual.evaluation, individual.region.weights);
      individual.region.population.push(individual);
    });
  }

  function getMostCrowdedRegions(regions) {
    var maxPopulation = _.maxBy(regions, 'population.length').population.length;
    return _.filter(regions, function (region) {
      return region.population.length === maxPopulation;
    });
  }

  function removeIndividual(individual, population, fronts) {
    var indexToRemoveRegion = individual.region.population.indexOf(individual),
        indexToRemoveFront = individual.front.indexOf(individual),
        indexToRemovePopulation = population.indexOf(individual);

    individual.region.population.splice(indexToRemoveRegion, 1);
    individual.front.splice(indexToRemoveFront, 1);
    if (individual.front.length === 0) {
      _.remove(fronts, _.isEmpty);
    }
    population.splice(indexToRemovePopulation, 1);
    return individual;
  }

  function removeFromMostCrowdedRegion(population, regions, fronts) {
    let crowded = getMostCrowdedRegions(regions);
    let worstRegion = _.maxBy(crowded, function (r) {return _.sum(_.map(r.population, 'scalarizedFitness'))});
    if (worstRegion.population.length > 1) {
      let worstIndividual = _.maxBy(worstRegion.population, 'scalarizedFitness');
      return removeIndividual(worstIndividual, population, fronts);
    }
  }

  function tryToRemoveIndividual(individual, population, regions, fronts) {
    if (individual.region.population.length > 1) {
      return removeIndividual(individual, population, fronts);
    }
    return removeFromMostCrowdedRegion(population, regions, fronts);
  }

  function tryToRemoveFromFront(front, population, regions, fronts) {
    if (front.length === 1) {
      return tryToRemoveIndividual(front[0], population, regions, fronts);
    }
    let lastFrontRegions = _.map(front, 'region');
    if (!removeFromMostCrowdedRegion(population, lastFrontRegions, fronts)) {
      removeFromMostCrowdedRegion(population, regions, fronts);
    }
  }

  function truncatePopulation(population, regions, fronts, numberOfElementsToRemove) {
    while (numberOfElementsToRemove > 0) {
      tryToRemoveFromFront(_.last(fronts), population, regions, fronts);
      numberOfElementsToRemove--;
    }
  }

  function updatePopulation(population, regions, fronts, children) {
    distributePopulation(children, regions);
    _.pushAll(population, children);
    truncatePopulation(population, regions, fronts, children.length);
  }

  function getSolutionInObjectiveSpace(solution, objectives) {
    return _.map(objectives, function(objective) {
      return objective(solution);
    });
  }

  function mutate(child, mutation) {
    if (Math.random() < mutation.rate) {
      return mutation.method(child);
    }
    return child;
  }

  function selectParents(neighborhood, population, localReproductionRate) {
    var neighborhoodPopulation = _.flatten(_.map(neighborhood, 'population'));
    if (Math.random() >= localReproductionRate || neighborhoodPopulation.length === 0) {
      return _.sampleSize(population, 2);
    }
    if (neighborhoodPopulation.length === 1) {
      let popExcludingNeighbor = _.filter(population, _.partial(_.negate(_.isEqual), neighborhoodPopulation[0]));
      return [neighborhoodPopulation[0], _.sample(popExcludingNeighbor)];
    }
    return _.sampleSize(neighborhoodPopulation, 2);
  }

  function generateOffspring(parents, crossover, mutation, objectives) {
    var children = crossover.method(parents[0].solution, parents[1].solution),
        mutated = _.map(children, _.partial(mutate, _, mutation));
    return _.map(mutated, _.partial(createIndividual, _, objectives));
  }

  function updateExtremes(population, extremes) {
    var updated = false;

    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value < extremes.min[index]) {
          extremes.min[index] = value;
          updated = true;
        }
        if (value > extremes.max[index] && value !== 0) {
          extremes.max[index] = value;
          updated = true;
        }
      });
    });

    if (updated) {
      extremes.dif = _.subtractArrays(extremes.max, extremes.min);
    }

    return updated;
  }

  function normalize(population, extremes) {
    _.forEach(population, function (individual) {
      var dif = _.subtractArrays(extremes.max, individual.evaluation);
      individual.normalizedEvaluation = _.divideArrays(dif, extremes.dif);
      _.forEach(individual, function (i) {
        if (i.normalizedEvaluation < 0) i.normalizedEvaluation = 0;
      });
    });
  }

  function normalizeChildren(children, population, extremes, regions) {
    var hasExtremesChanged = updateExtremes(extremes, children);
    //if (hasExtremesChanged) {
    //  normalize(population, extremes);
    //  _.forEach(regions, function (r) {r.population = []});
    //  distributePopulation(population, regions);
    //}

    normalize(children, extremes);
  }

  //function initializeExtremes(numberOfObjectives) {
  //  return {
  //    min: _.fill(new Array(numberOfObjectives), Infinity),
  //    max: _.fill(new Array(numberOfObjectives), -Infinity)
  //  }
  //}

  function initializeExtremes(numberOfObjectives) {
    return {
      min: [-17570, -16974, -18207],
      max: [-13927, -12764, -15178],
      dif: [-3643, -4210, -3029]
    }
  }

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
    _.forEach(fronts, function (front) {
      _.forEach(front, _.partial(_.set, _, 'front', front));
    });
  }

  function updateArchive(archive, children) {
    _.forEach(children, function (c) {
      archive = moea.help.pareto.updateNonDominatedSet(archive, c, 'evaluation');
    });
    return archive;
  }

  function moeadd(settings) {
    var regions = generateRegions(settings.objectives.length, settings.divisions),
        population = generatePopulation(settings.randomize, regions.length, settings.objectives),
        fronts = moea.nsga.ranking.rank(population, 'evaluation'),
        archive = [],
        extremes = initializeExtremes(settings.objectives.length);

    createPointersToFronts(fronts);
    //updateExtremes(population, extremes);
    normalize(population, extremes);
    createNeighborhoods(regions, settings.neighborhoodSize);
    distributePopulation(population, regions);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);
      //console.log(_.map(regions, 'population.length').join(', '));
      _.forEach(regions, function (region) {
        let parents = selectParents(region.neighborhood, population, settings.localReproductionRate);
        let children = generateOffspring(parents, settings.crossover, settings.mutation, settings.objectives);
        normalizeChildren(children, population, extremes, regions);
        _.forEach(children, _.partial(updateFronts, fronts));
        updatePopulation(population, regions, fronts, children);
        archive = updateArchive(archive, children);
      });
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'moeadd.main.execute', moeadd);
}());
