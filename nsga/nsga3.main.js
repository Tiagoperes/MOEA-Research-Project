(function () {
  'use strict';

  function nsga(settings) {
    var population = generateRandomPopulation(settings.populationSize, settings.randomize);
    var fronts = moea.nsga.ranking.rank(population, settings.objectives);
    for (let i = 0; i < settings.numberOfGenerations; i++) {
      console.log(i);

      if (settings.filter) {
        population = settings.filter(population);
        fronts = moea.nsga.ranking.rank(population, settings.objectives);
      }

      let parents = selectParents(population, settings.crossover.rate);
      let children = generateOffspring(parents, settings.crossover.method, settings.mutation);
      population = _.concat(population, children);
      fronts = moea.nsga.ranking.rank(population, settings.objectives);

      population = naturalSelection(fronts, settings.populationSize, settings.objectives, settings.numberOfMeanPoints);
    }
    return fronts[0];
  }

  function findBestFrontWithEnoughPoints(fronts, minPoints) {
    return _.find(fronts, function (f) {
      return f.length >= minPoints;
    });
  }

  function calculateNormalizedObjectivesInFronts(fronts, objectives) {
    var max = _.fill(new Array(objectives.length), -Infinity),
        min = _.fill(new Array(objectives.length), Infinity);

    _.forEach(fronts, function (f) {
      _.forEach(f, function (solution) {
        var values = objectives.map(function (objective, index) {
          var value = objective(solution);
          if (value > max[index]) max[index] = value;
          if (value < min[index]) min[index] = value;
          return value;
        });
        solution.nsga3 = {values: values};
      });
    });

    _.forEach(fronts, function (f) {
      _.forEach(f, function (solution) {
        solution.nsga3.values = _.map(solution.nsga3.values, function (v, index) {
          return (v - min[index]) / ((max[index] + 0.01) - min[index]);
        });
      });
    });
  }

  function getExtremePoints(front) {
    var numberOfObjectives = front[0].nsga3.values.length;
    var extremes = [];
    for (let i = 0; i < numberOfObjectives; i++) {
      extremes.push(_.minBy(front, function (s) {
        var sqSum = _.reduce(s.nsga3.values, function (sum, value, index) {
          return (index === i) ? sum : (sum + value * value);
        }, 0);
        return Math.sqrt(sqSum);
      }).nsga3.values);
    }
    return extremes;
  }

  function getMeanPoint(x, y) {
    return x.map(function (value, index) {
      return (value + y[index]) / 2;
    });
  }

  function getMeanPointsInLine(line, depth) {
    var mean = getMeanPoint(line.x, line.y);
    if (depth === 0) return [];
    return _.concat(
      getMeanPointsInLine({x: line.x, y: mean, equation: line.equation}, depth - 1),
      [{point: mean, lineEquation: line.equation, solutions: [], score: 0}],
      getMeanPointsInLine({x: mean, y: line.y, equation: line.equation}, depth - 1)
    );
  }

  function getLineEquation(x, y) {
    var v = _.map(x, function (value, index) {
      return value - y[index];
    });

    var parameters = _.map(_.dropRight(v), function (value) {
      return 1 / (value + 0.01);
    });

    parameters.push(-(v.length - 1) / (_.last(v) + 0.01));

    var constant = _.reduce(_.dropRight(v), function (sum, value, index) {
      return sum - x[index] / (value + 0.01);
    }, 0);

    constant += (v.length - 1) * _.last(x) / (_.last(v) + 0.01);

    return {parameters: parameters, constant: constant};
  }

  function createLines(extremes) {
    var lines = [];
    for (let i = 0; i < extremes.length; i++) {
      for (let j = i + 1; j < extremes.length; j++) {
        lines.push({
          x: extremes[i],
          y: extremes[j],
          equation: getLineEquation(extremes[i], extremes[j])
        });
      }
    }
    return lines;
  }

  function createNiches(extremes, numberOfMeanPoints) {
    var lines = createLines(extremes);
    var depth = Math.log2(numberOfMeanPoints + 1);
    var meanPoints = [];
    _.forEach(lines, function (line) {
      meanPoints = _.concat(meanPoints, getMeanPointsInLine(line, depth));
    });
    return meanPoints;
  }

  function getEuclideanDistance(a, b) {
    return Math.sqrt(_.reduce(a, function (sum, value, index) {
      return sum + Math.pow(value - b[index], 2);
    }, 0));
  }

  function distributeFrontToNiches(front, niches) {
    _.forEach(front, function (solution) {
      var niche = _.minBy(niches, function (n) {
        return getEuclideanDistance(solution.nsga3.values, n.point);
      });
      niche.solutions.push(solution);
      niche.score++;
    });
  }

  function getDistanceToLine(point, lineEquation) {
    var sum = _.reduce(point, function (sum, value, index) {
      return sum + value * lineEquation.parameters[index];
    }, 0);
    var divisor = Math.sqrt(_.sumBy(lineEquation.parameters, _.partial(Math.pow, _, 2)));
    return (sum + lineEquation.constant) / divisor;
  }

  function orderSolutionsAccordingToDistanceToLine(niche) {
    niche.solutions = _.orderBy(niche.solutions, function (s) {
      return getDistanceToLine(s.nsga3.values, niche.lineEquation);
    }, 'desc');
  }

  function extractSolutionFromNiches(niches) {
    var niche = _.minBy(niches, 'score');
    niche.score++;
    return niche.solutions.pop();
  }

  function isNicheNotEmpty(niche) {
    return niche.solutions.length;
  }

  function truncate(frontToTruncate, numberOfElementsToKeep, fronts, objectives, numberOfMeanPoints) {
    var bestFront = findBestFrontWithEnoughPoints(fronts, objectives.length - 1);
    calculateNormalizedObjectivesInFronts([bestFront, frontToTruncate], objectives);
    var extremes = getExtremePoints(bestFront, frontToTruncate);
    var niches = createNiches(extremes, numberOfMeanPoints);
    var result = [];
    distributeFrontToNiches(frontToTruncate, niches);
    _.forEach(niches, orderSolutionsAccordingToDistanceToLine);
    for (let i = 0; i < numberOfElementsToKeep; i++) {
      niches = _.filter(niches, isNicheNotEmpty);
      result.push(extractSolutionFromNiches(niches));
    }
    return result;
  }

  function generateRandomPopulation(populationSize, randomizationFunction) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(randomizationFunction());
    }
    return population;
  }

  function calculateDistances(fronts, objectives) {
    var calculate = moea.nsga.crowding.calculateDistances;
    _.forEach(fronts, _.partial(calculate, _, objectives));
  }

  function selectParents(population, crossoverRate) {
    var pairs = [],
        maxPairs = _.floor(crossoverRate * population.length);
    while (pairs.length < maxPairs) {
      pairs.push([tournament(population), tournament(population)]);
    }
    return pairs;
  }

  function tournament(population) {
    return _.minBy(_.sampleSize(population, 2), 'fitness.rank');
  }

  function generateOffspring(parents, crossoverMethod, mutation) {
    return _.flatten(_.map(parents, function (pair) {
      var children = crossoverMethod(pair[0], pair[1]);
      return _.map(children, _.partial(mutate, _, mutation));
    }));
  }

  function mutate(solution, mutation) {
    var rand = _.random(1, true);
    if (rand <= mutation.rate) {
      return mutation.method(solution);
    }
    return solution;
  }

  function naturalSelection(fronts, maxPopulationSize, objectives, numberOfMeanPoints) {
    var population = [];
    var frontsToCheck = fronts;
    while (population.length < maxPopulationSize) {
      let front = _.head(frontsToCheck);
      if (population.length + front.length <= maxPopulationSize) {
        population = _.concat(population, front);
        frontsToCheck = _.tail(frontsToCheck);
      } else {
        let truncatedFront = truncate(front, maxPopulationSize - population.length, fronts, objectives, numberOfMeanPoints);
        population = _.concat(population, truncatedFront);
      }
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga3.main.execute', nsga);
}());
