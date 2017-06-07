(function () {
  'use strict';

  const GA_NUMBER_OF_GENERATIONS = 10;

  var dominates = moea.help.pareto.dominates,
      getNonDominatedSet = moea.help.pareto.getNonDominatedSet;

  function getSolutionInObjectiveSpace(solution, objectives) {
    return _.map(objectives, function (o) {
      return o(solution);
    });
  }

  function randomizeVelocity(numberOfObjectives) {
    //fixme: make it generic, for now, it's implemented considering the knapsack problem
    var velocity = [];
    for (let i = 0; i < numberOfObjectives; i++) {
      velocity[i] = _.random(-100, 100, true);
    }
    return velocity;
  }

  function createParticle(solution, objectives) {
    var particle = {
      solution: solution,
      position: getSolutionInObjectiveSpace(solution, objectives),
      velocity: randomizeVelocity(objectives.length)
    };
    particle.localBest = particle;
    return particle;
  }

  function generateRandomParticles(populationSize, randomize, objectives) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(createParticle(randomize(), objectives));
    }
    return population;
  }

  function generateObjectiveArray(numberOfObjectives) {
    var objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives.push(function (particle) {
        return particle.position[i];
      });
    }

    return objectives;
  }

  function getIndexOfLessSignificantDimension(particles) {
    var positions = _.map(particles, 'position'),
        diffs = _.fill(new Array(positions[0].length), 0);

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        let diff = _.map(_.subtractArrays(positions[i], positions[j]), Math.abs);
        diffs = _.addArrays(diffs, diff);
      }
    }

    return _.indexOf(diffs, _.min(diffs));
  }

  function getBest(population) {
    var numberOfObjectives = population[0].position.length,
        objectiveArray = generateObjectiveArray(numberOfObjectives),
        nd;

    do {
      nd = getNonDominatedSet(population, objectiveArray);
      let index = getIndexOfLessSignificantDimension(nd);
      objectiveArray.splice(index, 1);
    } while (nd.length > 1 && objectiveArray.length > 0);

    return _.sample(nd);
  }

  function updateVelocity(particle, globalBest, constants) {
    var inertiaTerm = _.map(particle.velocity, _.partial(_.multiply, constants.w)),
        localDif = _.subtractArrays(particle.localBest.position, particle.position),
        globalDif = _.subtractArrays(globalBest.position, particle.position),
        cognitiveComponent = _.map(localDif, _.partial(_.multiply, Math.random() * constants.c1)),
        socialComponent = _.map(globalDif, _.partial(_.multiply, Math.random() * constants.c2));

    particle.velocity = _.addArrays(inertiaTerm, cognitiveComponent, socialComponent);
  }

  function updatePosition(particleToUpdate, population, settings) {
    var referencePoint;

    function selectArchive(particles) {
      var ordered = _.orderBy(particles, 'fitness.raw'),
          lastFitness = ordered[settings.populationSize - 1].fitness.raw,
          startOfLastFitness = settings.populationSize - 2,
          endOfLastFitness, best, overflow;

      while (startOfLastFitness > 0 && ordered[startOfLastFitness].fitness.raw === lastFitness) startOfLastFitness--;
      startOfLastFitness++;
      best = _.slice(ordered, 0, startOfLastFitness);
      endOfLastFitness = startOfLastFitness + 1;
      while (endOfLastFitness < ordered.length && ordered[endOfLastFitness].fitness.raw === lastFitness) endOfLastFitness++;
      overflow = _.slice(ordered, startOfLastFitness, endOfLastFitness);
      overflow = _.orderBy(overflow, getDistanceToReferencePoint);
      return _.concat(best, _.slice(overflow, 0, settings.populationSize - best.length));
    }

    function getDistanceToReferencePoint(particle) {
      return Math.sqrt(_.reduce(particle.position, function (sum, coordinate, index) {
        return sum + Math.pow(coordinate - referencePoint[index], 2);
      }, 0));
    }

    function tournament(archive) {
      var samples = _.sampleSize(archive, 2);
      if (samples[0].fitness.raw < samples[1].fitness.raw) return samples[0];
      if (samples[1].fitness.raw < samples[0].fitness.raw) return samples[1];
      return _.minBy(samples, getDistanceToReferencePoint);
    }

    function selectParents(archive) {
      var pairs = [],
          maxPairs = _.floor(settings.crossover.rate * settings.populationSize);

      while (pairs.length < maxPairs) {
        pairs.push([tournament(archive), tournament(archive)]);
      }

      return pairs;
    }

    function mutate(solution, mutation) {
      var rand = _.random(1, true);
      if (rand <= mutation.rate) {
        return mutation.method(solution);
      }
      return solution;
    }

    function generateOffspring(parents) {
      return _.flatten(_.map(parents, function (pair) {
        var children = settings.crossover.method(pair[0].solution, pair[1].solution);
        var mutatedChildren = _.map(children, _.partial(mutate, _, settings.mutation));
        return _.map(mutatedChildren, _.partial(createParticle, _, settings.objectives));
      }));
    }

    function setPosition(archive) {
      var closest = _.minBy(archive, getDistanceToReferencePoint);
      particleToUpdate.solution = closest.solution;
      particleToUpdate.position = closest.position;
    }

    function main() {
      var objectives = generateObjectiveArray(settings.objectives.length),
          archive;

      referencePoint = _.addArrays(particleToUpdate.position, particleToUpdate.velocity);
      moea.spea.fitness.calculateRaw(population, objectives);
      archive = population;

      for (let i = 0; i < GA_NUMBER_OF_GENERATIONS; i++) {
        let parents = selectParents(archive);
        population = generateOffspring(parents);
        let everybody = _.concat(population, archive);
        moea.spea.fitness.calculateRaw(everybody, objectives);
        archive = selectArchive(everybody);
      }

      setPosition(archive);
    }

    main();
  }

  function removeLessSignificantDimension(a, b) {
    var dif = _.subtractArrays(a, b),
        min = _.minBy(dif, Math.abs),
        index = _.indexOf(dif, min);

    a.splice(index, 1);
    b.splice(index, 1);
  }

  function isBetter(particleA, particleB) {
    var a = _.clone(particleA.position),
        b = _.clone(particleB.position),
        aDominatesB, bDominatesA;

    if (_.isEqual(a, b)) return false;

    do {
      aDominatesB = dominates(a, b);
      bDominatesA = dominates(b, a);
      removeLessSignificantDimension(a, b);
    } while (!aDominatesB && !bDominatesA);

    return aDominatesB;
  }

  function psoga(settings) {
    var population = generateRandomParticles(settings.populationSize, settings.randomize, settings.objectives);
    var globalBest = getBest(population);
    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log('\ngeneration ' + i);
      _.forEach(population, function (particle, index) {
        console.log('---particle ' + index);
        updateVelocity(particle, globalBest, settings.constants);
        updatePosition(particle, population, settings);
        if (isBetter(particle, particle.localBest)) {
          particle.localBest = particle;
          console.log('------better than local!');
        }
        if (isBetter(particle, globalBest)) {
          globalBest = particle;
          console.log('------better than GLOBAL!');
        }
      });
    }
    return _.map(population, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'psoga1.main.execute', psoga);

}());
