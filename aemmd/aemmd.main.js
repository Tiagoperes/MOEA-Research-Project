(function () {
  'use strict';

  var dominates = moea.help.pareto.dominates;

  function generateRandomPopulation(populationSize, randomizationFunction, objectives) {
    var population = [];
    for (let i = 0; i < populationSize; i++) {
      let randomSolution = randomizationFunction();
      population.push({
        solution: randomSolution,
        fitness: [],
        objectiveValues: _.map(objectives, function (objective) {return objective(randomSolution)})
      });
    }
    return population;
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
      combinations.push(_.clone(indexes));
      updateCombinationIndexes(indexes, list.length);
    }
    return combinations;
  }

  function createTableObjectiveFunctions(objectiveIndexes) {
    return _.map(objectiveIndexes, function (index) {
      return function(individual) {
        return individual.objectiveValues[index];
      }
    });
  }

  function createTable(label, objectiveIndexes) {
    return {
      label: label,
      objectives: createTableObjectiveFunctions(objectiveIndexes),
      population: [],
      score: 0
    };
  }

  function createTables(objectives) {
    var tables = [];
    for (let i = 2; i <= objectives.length; i++) {
      tables = _.concat(tables, _.map(getCombinations(objectives, i), function (objectiveIndexes, count) {
        return createTable(tables.length + count, objectiveIndexes);
      }));
    }
    return tables;
  }

  function selectParents(tables) {
    var p1 = _.maxBy(_.sampleSize(tables, 3), 'score');
    var p2 = _.maxBy(_.sampleSize(tables, 3), 'score');
    return [p1, p2];
  }

  function mutate(solution, mutation) {
    if (Math.random() < mutation.rate) {
      return mutation.method(solution);
    }
    return solution;
  }

  function crossover(parentTables, crossoverSettings, mutationSettings, objectives) {
    var p1 = _.sample(parentTables[0].population).solution,
        p2 = _.sample(parentTables[1].population).solution,
        children =  crossoverSettings.method(p1, p2);

    children = _.map(children, function (c) {
      return {
        solution: mutate(c, mutationSettings),
        fitness: [],
        objectiveValues: _.map(objectives, function (objective) {return objective(c)})
      };
    });

    return children;
  }

  function updateTable(table, individual) {
    var newSolutions = [individual];

    for (let i = 0; i < table.population.length; i++) {
      let isEqual = _.isEqual(table.population[i].objectiveValues, individual.objectiveValues);
      if (isEqual || dominates(table.population[i], individual, table.objectives)) {
        return false;
      }
      if (!dominates(individual, table.population[i], table.objectives)) {
        newSolutions.push(table.population[i]);
      }
    }

    table.population = newSolutions;
    table.score++;
  }

  function updateTablesWithPopulation(tables, population) {
    _.forEach(population, function (individual) {
      _.forEach(tables, function (table) {
        updateTable(table, individual);
      });
    });
  }

  function aemmd(settings) {
    var tables = createTables(settings.objectives, settings.elementsPerTable),
        population = generateRandomPopulation(settings.elementsPerTable * tables.length, settings.randomize, settings.objectives),
        tableInvolvingAllObjectives = _.last(tables);

    updateTablesWithPopulation(tables, population);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      if (i % 100 === 0) {
        console.log('it ' + i +'; domination table size: ' + tableInvolvingAllObjectives.population.length);
      }
      let parents = selectParents(tables);
      let children = crossover(parents, settings.crossover, settings.mutation, settings.objectives);
      updateTablesWithPopulation(tables, children);
    }

    return _.map(tableInvolvingAllObjectives.population, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'aemmd.main.execute', aemmd);
}());
