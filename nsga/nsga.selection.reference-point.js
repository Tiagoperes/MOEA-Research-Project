(function () {
  'use strict';

  function findBestFrontWithEnoughPoints(fronts) {
    var numberOfObjectives = fronts[0][0].evaluation.length;
    return _.find(fronts, function (f) {
      return f.length >= numberOfObjectives;
    });
  }

  function findExtremeValuesInPopulation(population) {
    var numberOfObjectives = population[0].evaluation.length,
      max = _.fill(new Array(numberOfObjectives), -Infinity),
      min = _.fill(new Array(numberOfObjectives), Infinity);

    _.forEach(population, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value > max[index]) max[index] = value;
        if (value < min[index]) min[index] = value;
      });
    });

    return {min: min, max: max, dif: _.subtractArrays(max, min)};
  }

  function calculateNormalizedObjectives(population) {
    var extremes = findExtremeValuesInPopulation(population);

    _.forEach(population, function (individual) {
      individual.normalizedEvaluation = _.map(individual.evaluation, function (value, index) {
        return (value - extremes.min[index]) / (extremes.dif[index] + 0.01);
      });
    });
  }

  function getDistanceToObjectiveAxis(objectiveIndex, individual) {
    var sqSum = _.reduce(individual.normalizedEvaluation, function (sum, value, index) {
      return (index === objectiveIndex) ? sum : (sum + value * value);
    }, 0);
    return Math.sqrt(sqSum);
  }

  function getExtremePoints(front) {
    var numberOfObjectives = front[0].evaluation.length;
    var extremes = [];
    for (let i = 0; i < numberOfObjectives; i++) {
      extremes.push(_.minBy(front, _.partial(getDistanceToObjectiveAxis, i)).normalizedEvaluation);
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
      [{point: mean, lineEquation: line.equation, population: [], score: 0}],
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

  function distributeFrontToNiches(front, niches) {
    _.forEach(front, function (individual) {
      var niche = _.minBy(niches, function (n) {
        return moea.help.math.getEuclideanDistance(individual.normalizedEvaluation, n.point);
      });
      niche.population.push(individual);
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

  function orderPopulationAccordingToDistanceToLine(niche) {
    niche.population = _.orderBy(niche.population, function (individual) {
      return getDistanceToLine(individual.normalizedEvaluation, niche.lineEquation);
    }, 'desc');
  }

  function extractSolutionFromNiches(niches) {
    var niche = _.minBy(niches, 'score');
    niche.score++;
    return niche.population.pop();
  }

  function isNicheNotEmpty(niche) {
    return niche.population.length;
  }

  function truncate(frontToTruncate, numberOfElementsToKeep, fronts, numberOfMeanPoints) {
    var bestFront = findBestFrontWithEnoughPoints(fronts),
        toNormalize = bestFront === frontToTruncate ? bestFront : _.concat(bestFront, frontToTruncate),
        result = [],
        extremes, niches;

    calculateNormalizedObjectives(toNormalize);
    extremes = getExtremePoints(bestFront);
    niches = createNiches(extremes, numberOfMeanPoints);
    distributeFrontToNiches(frontToTruncate, niches);
    _.forEach(niches, orderPopulationAccordingToDistanceToLine);

    for (let i = 0; i < numberOfElementsToKeep; i++) {
      niches = _.filter(niches, isNicheNotEmpty);
      result.push(extractSolutionFromNiches(niches));
    }

    return result;
  }

  function naturalSelection(fronts, maxPopulationSize, numberOfMeanPoints) {
    var population = [];
    var frontsToCheck = fronts;
    while (population.length < maxPopulationSize) {
      let front = _.head(frontsToCheck);
      if (population.length + front.length <= maxPopulationSize) {
        population = _.concat(population, front);
        frontsToCheck = _.tail(frontsToCheck);
      } else {
        let truncatedFront = truncate(front, maxPopulationSize - population.length, fronts, numberOfMeanPoints);
        population = _.concat(population, truncatedFront);
      }
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'nsga.selection.referencePoint.select', naturalSelection);
}());
