(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates;

  function generateRandomPopulation(populationSize, randomizationFunction) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(randomizationFunction());
    }
    return population;
  }

  function getSubsetFromIndexes(list, indexes) {
    let subset = [];
    for (let i = 0; i < indexes.length; i++) {
      subset.push(list[indexes[i]]);
    }
    return subset;
  }

  function updateCombinationIndexes(indexes, maxValue) {
    var i = indexes.length - 1;
    indexes[i]++;

    while (i > 0 && _.last(indexes) >= maxValue) {
      i--;
      indexes[i]++;
      for (let j = i + 1; j < indexes.length; j++) {
        indexes[j] = indexes[j-1] + 1;
      }
    }
  }

  function getCombinations(list, size) {
    var combinations = [];
    var indexes = Array.from(Array(size).keys());
    while (_.last(indexes) < list.length) {
      combinations.push(getSubsetFromIndexes(list, indexes));
      updateCombinationIndexes(indexes, list.length);
    }
    return combinations;
  }

  function createDominationTable(objectives) {
    return {
      objectives: objectives,
      solutions: [],
      score: 0
    };
  }

  function createDominationTables(objectives) {
    var tables = [];
    for (let i = 2; i <= objectives.length; i++) {
      tables = _.concat(tables, _.map(getCombinations(objectives, i), createDominationTable));
    }
    return tables;
  }

  function selectParents(tables) {
    var p1 = _.sample(_.maxBy(_.sampleSize(tables, 3), 'score').solutions);
    var p2 = _.sample(_.maxBy(_.sampleSize(tables, 3), 'score').solutions);
    return [p1, p2];
  }

  function mutate(solution, mutation) {
    if (Math.random() < mutation.rate) {
      return mutation.method(solution);
    }
    return solution;
  }

  function crossover(parents, crossoverSettings, mutationSettings) {
    var children =  crossoverSettings.method(parents[0], parents[1]);
    return _.map(children, _.partial(mutate, _, mutationSettings));
  }

  function getSolutionInObjectiveSpace(solution, objectives) {
    return _.map(objectives, function(objective) {
      return objective(solution);
    });
  }

  function isEqualInObjectiveSpace(a, b, objectives) {
    a = getSolutionInObjectiveSpace(a, objectives);
    b = getSolutionInObjectiveSpace(b, objectives);
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > 0.000000001) return false;
    }
    return true;
  }

  function updateTableWithSolution(table, solution, shouldUpdateScore) {
    var newSolutions = [solution];

    for (let i = 0; i < table.solutions.length; i++) {
      let isEqual = isEqualInObjectiveSpace(table.solutions[i], solution, table.objectives);
      if (isEqual || dominates(table.solutions[i], solution, table.objectives)) {
        return;
      }
      if (!dominates(solution, table.solutions[i], table.objectives)) {
        newSolutions.push(table.solutions[i]);
      }
    }

    table.solutions = newSolutions;
    table.score += shouldUpdateScore ? 1 : 0;
  }

  function updateTablesWithSolutions(tables, solutions, shouldUpdateScore) {
    _.forEach(solutions, function (s, index) {
      if (!shouldUpdateScore) console.log('evaluating population member ' + index);
      _.forEach(tables, _.partial(updateTableWithSolution, _, s, shouldUpdateScore));
    });
  }

  function aemmd(settings) {
    var tables = createDominationTables(settings.objectives),
        population = generateRandomPopulation(settings.populationSize, settings.randomize),
        tableInvolvingAllObjectives = _.last(tables);

    updateTablesWithSolutions(tables, population);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      if (i % 100 === 0) console.log('it ' + i +'; biggest table: ' + _.maxBy(tables, 'solutions.length').solutions.length);
      let parents = selectParents(tables);
      let children = crossover(parents, settings.crossover, settings.mutation);
      updateTablesWithSolutions(tables, children, true);
    }

    return tableInvolvingAllObjectives.solutions;
  }

  window.moea = window.moea || {};
  _.set(moea, 'aemmd.main.execute', aemmd);
}());
