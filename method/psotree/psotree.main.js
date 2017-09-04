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
        localVelocity: createRandomVelocity(settings.maxVertices),
        globalVelocity: createRandomVelocity(settings.maxVertices),
        position: individual,
        localBest: {
          solution: individual.solution.clone(),
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

  function getDifference(graphA, graphB, maxVertices, maxEdges) {
    var differences = [];
    for (let i = 0; i < maxVertices; i++) {
      let dif = _.difference(graphA.getEdges(i), graphB.getEdges(i)).length + _.difference(graphB.getEdges(i), graphA.getEdges(i)).length;
      differences[i] = dif / maxEdges;
    }
    return differences;
  }

  function moveParticle(particle, globalSolution, w, c1, c2, objectives, mutation, scalarize, maxVertices, maxEdges, makeValid, settings) {
    var r1 = Math.random(),
        r2 = Math.random(),
        localInertiaTerm = _.map(particle.localVelocity, _.partial(_.multiply, w)),
        globalInertiaTerm = _.map(particle.globalVelocity, _.partial(_.multiply, w)),
        cognitiveComponent = _.map(getDifference(particle.localBest.solution, particle.position.solution, maxVertices, maxEdges), _.partial(_.multiply, r1 * c1)),
        socialComponent = _.map(getDifference(globalSolution, particle.position.solution, maxVertices, maxEdges), _.partial(_.multiply, r2 * c2)),
        mutate = moea.method.ga.mutate;

    particle.localVelocity = _.addArrays(localInertiaTerm, cognitiveComponent);
    particle.globalVelocity = _.addArrays(globalInertiaTerm, socialComponent);
    // if (window.count === 1) {
    //   moea.help.graphDesigner.draw(particle.position.solution, 0, [1, 8, 9, 12, 13, 21, 25, 28, 30, 32]);
    //   window.debugCross = true;
    // }

    // applyVelocityToSolution(particle.position.solution, particle.localBest.solution, particle.localVelocity);
    // applyVelocityToSolution(particle.position.solution, globalSolution, particle.globalVelocity);
    // particle.position.solution = mutate(makeValid(particle.position.solution.makeDirectionless()), mutation);

    if (_.sum(particle.localVelocity) > _.sum(particle.globalVelocity)) {
      particle.position = moea.method.ga.generateOffspring([[particle.position, particle.localBest]], settings)[0];
    } else {
      particle.position = moea.method.ga.generateOffspring([[particle.position, {solution: globalSolution}]], settings)[0];
    }

    // window.count++;
    // let dif = _.difference([1, 8, 9, 12, 13, 21, 25, 28, 30, 32], particle.position.solution.getAchievableVertices(0));
    // if (dif.length) {
    //   throw Error(dif);
    // }
    // particle.position.evaluation = moea.help.pareto.getSolutionInObjectiveSpace(particle.position.solution, objectives);
  }

  // function updateParticle(particle, globalBest, w, c1, c2, objectives, mutation, scalarize, maxVertices, maxEdges, makeValid) {
  //   var globalSolution = getBestWithWeights(globalBest, particle.weights, scalarize).solution;
  //   // var globalSolution = _.sample(globalBest).solution;
  //
  //   moveParticle(particle, globalSolution, w, c1, c2, objectives, mutation, scalarize, maxVertices, maxEdges, makeValid);
  //   if (particle.position.fitness < particle.localBest.fitness) {
  //     particle.localBest = {
  //       solution: particle.position.solution.clone(),
  //       evaluation: _.clone(particle.position.evaluation),
  //       fitness: particle.position.fitness
  //     };
  //   }
  // }

  // function updateParticle(particle, globalBest, objectives, combine, mutation, scalarize) {
  //   var globalSolution = getBestWithWeights(globalBest, particle.weights, scalarize).solution,
  //       mutate = moea.method.ga.mutate;
  //
  //   particle.position.solution = mutate(combine(particle.position.solution, particle.localBest.solution, globalSolution), mutation);
  //   particle.position.evaluation = moea.help.pareto.getSolutionInObjectiveSpace(particle.position.solution, objectives);
  //   particle.position.fitness = scalarize(particle.position.evaluation, particle.weights);
  //   if (particle.position.fitness < particle.localBest.fitness) {
  //     particle.localBest = {
  //       solution: particle.position.solution.clone(),
  //       evaluation: _.clone(particle.position.evaluation),
  //       fitness: particle.position.fitness
  //     };
  //   }
  // }

  function psotree(settings) {
    var ga = moea.method.ga,
        norm = moea.help.normalization,
        weightVectors = moea.method.moead.neighborhood.generateUniformWeightVectors(settings.objectives.length, settings.divisions),
        individuals = moea.method.ga.generateRandomPopulation(weightVectors.length, settings.randomize, settings.objectives),
        ngens = ga.getNumberOfGenerations(individuals.length, settings.comparisons),
        wDecrement = 1 / ngens,
        extremes = norm.initializeExtremes(settings.objectives.length),
        evaluationProperty = 'evaluation',
        scalarize, population, globalBest;

    if (settings.shouldNormalize) {
      norm.normalize([], individuals, extremes);
      evaluationProperty = 'normalizedEvaluation';
    }

    scalarize = _.partial(scalarizeFitness, _, _, evaluationProperty);
    population = createParticles(settings, individuals, weightVectors, scalarize);
    globalBest = moea.help.pareto.getNonDominatedSet(_.map(population, 'position'), evaluationProperty);

    for (let i = 0; i < ngens; i++) {
      ga.logGeneration(i, ngens);
      _.forEach(population, function (particle) {
        var globalSolution = getBestWithWeights(globalBest, particle.weights, scalarize).solution;
        // var globalSolution = _.sample(globalBest).solution;
        moveParticle(particle, globalSolution, settings.w, settings.c1, settings.c2, settings.objectives, settings.mutation, scalarize, settings.maxVertices, settings.maxEdges, settings.makeValid, settings);
      });
      if (settings.shouldNormalize) {
        norm.normalize(_.concat(globalBest, _.map(population, 'localBest')), _.map(population, 'position'), extremes);
      }
      _.forEach(population, function (particle) {
        particle.position.fitness = scalarize(particle.position, particle.weights);
        particle.localBest.fitness = scalarize(particle.localBest, particle.weights);
        if (particle.position.fitness < particle.localBest.fitness) {
          particle.localBest = {
            solution: particle.position.solution.clone(),
            evaluation: _.clone(particle.position.evaluation),
            normalizedEvaluation: _.clone(particle.position.normalizedEvaluation),
            fitness: particle.position.fitness
          };
        }
        globalBest = moea.help.pareto.updateNonDominatedSet(globalBest, particle.position, 'evaluation');
      });
      settings.w -= wDecrement;
    }

    console.log(globalBest.length);
    return _.map(globalBest, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.psotree.main.execute', psotree);
}());
