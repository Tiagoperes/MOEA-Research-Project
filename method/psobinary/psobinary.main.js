(function () {
  'use strict';

  function createRandomVelocity(numberOfDimensions) {
    var velocity = [];
    for (let i = 0; i < numberOfDimensions; i++) {
      velocity[i] = Math.random();
    }
    return velocity;
  }

  function scalarizeFitness(individual, weights, property) {
    return moea.method.moead.scalarization.scalarizeWS(individual[property], weights);
  }

  function createParticles(settings, individuals, weightVectors, scalarize) {
    return _.map(individuals, function (individual, index) {
      individual.fitness = scalarize(individual, weightVectors[index]);
      return {
        weights: weightVectors[index],
        localVelocity: createRandomVelocity(individual.solution.length),
        globalVelocity: createRandomVelocity(individual.solution.length),
        position: individual,
        localBest: {
          solution: _.clone(individual.solution),
          evaluation: _.clone(individual.evaluation),
          fitness: individual.fitness
        }
      };
    });
  }

  function getBestWithWeights(population, weights, scalarize) {
    return _.minBy(population, function (individual) {
      return scalarize(individual, weights);
    });
  }

  function applyVelocityToSolution(solution, otherGraph, velocity) {
    for (let i = 0; i < velocity.length; i++) {
      let newEdges = [];
      _.forEach(solution.getEdges(i), function (edge) {
        if (_.includes(otherGraph.getEdges(i), edge) || Math.random() >= velocity[i]) {
          newEdges.push(edge);
        }
      });
      _.forEach(otherGraph.getEdges(i), function (edge) {
        if (Math.random() < velocity[i]) newEdges.push(edge);
      });
      solution.setEdges(i, _.uniq(newEdges));
    }
  }

  function getDifference(binArrayA, binArrayB) {
    var differences = [];
    for (let i = 0; i < binArrayA.length; i++) {

      differences[i] = binArrayA[i] === binArrayB[i] ? 0 : 1;
    }
    return differences;
  }

  function moveParticle(particle, globalSolution, w, c1, c2, settings) {
    var r1 = Math.random(),
        r2 = Math.random(),
        localInertiaTerm = _.map(particle.localVelocity, _.partial(_.multiply, w)),
        globalInertiaTerm = _.map(particle.globalVelocity, _.partial(_.multiply, w)),
        cognitiveComponent = _.map(getDifference(particle.localBest.solution, particle.position.solution), _.partial(_.multiply, r1 * c1)),
        socialComponent = _.map(getDifference(globalSolution, particle.position.solution), _.partial(_.multiply, r2 * c2));

    particle.localVelocity = _.addArrays(localInertiaTerm, cognitiveComponent);
    particle.globalVelocity = _.addArrays(globalInertiaTerm, socialComponent);

    // if (_.sum(particle.localVelocity) > _.sum(particle.globalVelocity)) {
    //   particle.position = moea.method.ga.generateOffspring([[particle.position, particle.localBest]], settings)[0];
    // } else {
    //   particle.position = moea.method.ga.generateOffspring([[particle.position, {solution: globalSolution}]], settings)[0];
    // }

    let bestCross = [];
    for (let i = 0; i < globalSolution.length; i++) {
      let localChance = particle.localVelocity[i] / (particle.localVelocity[i] + particle.globalVelocity[i]);
      if (Math.random() < localChance) bestCross[i] = particle.localBest.solution[i];
      else bestCross[i] = globalSolution[i];
    }

    return moea.method.ga.generateOffspring([[particle.position, {solution: bestCross}]], settings);
  }

  function psobinary(settings) {
    var ga = moea.method.ga,
        weightVectors = moea.method.moead.neighborhood.generateUniformWeightVectors(settings.objectives.length, settings.divisions),
        individuals = moea.method.ga.generateRandomPopulation(weightVectors.length, settings.randomize, settings.objectives),
        ngens = ga.getNumberOfGenerations(individuals.length, settings.comparisons),
        wDecrement = 1 / ngens,
        scalarize, population, globalBest;


    scalarize = _.partial(scalarizeFitness, _, _, 'evaluation');
    population = createParticles(settings, individuals, weightVectors, scalarize);
    globalBest = moea.help.pareto.getNonDominatedSet(_.map(population, 'position'), 'evaluation');

    for (let i = 0; i < ngens; i++) {
      ga.logGeneration(i, ngens);
      _.forEach(population, function (particle) {
        var globalSolution = getBestWithWeights(globalBest, particle.weights, scalarize).solution;
        // var globalSolution = _.sample(globalBest).solution;
        var newIndividuals = moveParticle(particle, globalSolution, settings.w, settings.c1, settings.c2, settings);
        _.forEach(newIndividuals, function (individual) {
          individual.fitness = scalarize(particle.position, particle.weights);
          globalBest = moea.help.pareto.updateNonDominatedSet(globalBest, individual, 'evaluation');
        });
        particle.position = _.minBy(newIndividuals, 'fitness');
        if (particle.position.fitness < particle.localBest.fitness) {
          particle.localBest = {
            solution: _.clone(particle.position.solution),
            evaluation: _.clone(particle.position.evaluation),
            fitness: particle.position.fitness
          };
        }
      });
      settings.w -= wDecrement;
    }

    console.log(globalBest.length);
    return _.map(globalBest, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.psobinary.main.execute', psobinary);
}());
