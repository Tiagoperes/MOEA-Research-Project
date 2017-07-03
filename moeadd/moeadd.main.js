(function () {
  'use strict';

  function generateRegions(numberOfObjectives, divisions) {
    var wVectors = moea.moead.neighborhood.generateWeightVectors(numberOfObjectives, divisions);
    return _.map(wVectors, function (wVector) {
      return {weights: wVector, population: []};
    });
  }

  function distributePopulationRandomly(population, regions) {
    _.forEach(population, function (individual) {
      var region = _.sample(regions);
      individual.scalarizedFitness = moea.moead.scalarization.scalarizeWS(individual.evaluation, region.weights);
      individual.region = region;
      region.population.push(individual);
    });
  }

  function distributePopulation(population, regions) {
    _.forEach(population, function (individual) {
      var angleByRegion = _.map(regions, function (region) {
        return moea.help.distance.getAngleBetweenVectors(individual.normalizedEvaluation, region.weights);
      });
      var angle = _.min(angleByRegion);
      var belongingRegionIndex = _.indexOf(angleByRegion, angle);
      individual.region = regions[belongingRegionIndex];
      individual.scalarizedFitness = moea.moead.scalarization.scalarizeWS(individual.evaluation, individual.region.weights);
      individual.region.population.push(individual);
    });
  }

  function updatePopulation(population, regions, fronts, children) {
    distributePopulation(children, regions);
    _.pushAll(population, children);
    moea.moeadd.selection.select(population, regions, fronts, children.length);
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

  function updateArchive(archive, children) {
    _.forEach(children, function (c) {
      archive = moea.help.pareto.updateNonDominatedSet(archive, c, 'evaluation');
    });
    return archive;
  }

  function moeadd(settings) {
    var ga = moea.ga,
        norm = moea.help.normalization,
        ranking = moea.moeadd.ranking,
        neighborhood = moea.moead.neighborhood,
        regions = generateRegions(settings.objectives.length, settings.divisions),
        ngens = settings.numberOfGenerations || ga.getNumberOfGenerations(regions.length, settings.comparisons),
        population = ga.generateRandomPopulation(regions.length, settings.randomize, settings.objectives),
        fronts = moea.nsga.ranking.rank(population, 'evaluation'),
        archive = [],
        extremes = norm.initializeExtremes(settings.objectives.length);

    ranking.createPointersToFronts(fronts);
    norm.normalize([], population, extremes);
    neighborhood.createNeighborhoods(regions, settings.neighborhoodSize);
    distributePopulation(population, regions);

    for (let i = 0; i < ngens; i++) {
      ga.logGeneration(i, ngens);
      //console.log(_.map(regions, 'population.length').join(', '));
      _.forEach(regions, function (region) {
        let parents = selectParents(region.neighborhood, population, settings.localReproductionRate);
        let children = [_.sample(ga.generateOffspring([parents], settings))];
        norm.normalize([], children, extremes);
        _.forEach(children, _.partial(ranking.updateFronts, fronts));
        updatePopulation(population, regions, fronts, children);
        archive = updateArchive(archive, children);
      });
    }

    return _.map(archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'moeadd.main.execute', moeadd);
}());
