(function () {
  'use strict';

  var dominates = moea.help.pareto.dominatesArray;

  function getSolutionInObjectiveSpace(solution, objectives) {
    return _.map(objectives, function (o) {
      return o(solution);
    });
  }

  function randomizeVelocity() {
    //todo
  }

  function createParticle(solution, objectives) {
    return {
      solution: solution,
      position: getSolutionInObjectiveSpace(solution, objectives),
      localBest: solution,
      velocity: randomizeVelocity()
    };
  }

  function generateRandomParticles(populationSize, randomize, objectives) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(createParticle(randomize(), objectives));
    }
    return population;
  }

  function getBest(population) {
    //todo
  }

  function updateVelocity(particle, globalBest, constants) {
    var inertiaTerm = _.map(particle.velocity, _.partial(_.multiply, constants.w)),
        localDif = _.subtractArrays(particle.localBest.position, particle.position),
        globalDif = _.subtractArrays(globalBest.position, particle.position),
        cognitiveComponent = _.map(localDif, _.partial(_.multiply, Math.random() * constants.c1)),
        socialComponent = _.map(globalDif, _.partial(_.multiply, Math.random() * constants.c2));

    particle.velocity = _.addArrays(inertiaTerm, cognitiveComponent, socialComponent);
  }

  function updatePosition(particle) {
    //todo
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

  function main(settings) {
    var population = generateRandomParticles(settings.populationSize, settings.randomize, settings.objectives);
    var globalBest = getBest(population);
    for (let i = 0; i < settings.numberOfGenerations; i++) {
      _.forEach(population, function (particle) {
        updateVelocity(particle, globalBest, settings.constants);
        updatePosition(particle);
        if (isBetter(particle, particle.localBest)) particle.localBest = particle;
        if (isBetter(particle, globalBest)) globalBest = particle;
      });
    }
    return _.map(population, 'solution');
  }

}());
