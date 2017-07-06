(function () {
  'use strict';

  function createTableObjectiveFunctions(objectiveIndexes) {
    return _.map(objectiveIndexes, function (index) {
      return function(individual) {
        return individual.evaluation[index];
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
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes, count) {
        return createTable(tables.length + count, objectiveIndexes);
      }));
    }
    return tables;
  }

  function selectParents(tables) {
    var p1 = _.maxBy(_.sampleSize(tables, 4), 'score'),
        tablesWithoutP1 = _.filter(tables, _.partial(_.negate(_.isEqual), p1)),
        p2 = _.maxBy(_.sampleSize(tablesWithoutP1, 4), 'score') || p1;

    return [p1, p2];
  }

  function crossover(parentTables, settings) {
    var p1 = _.sample(parentTables[0].population),
        p2 = _.sample(parentTables[1].population),
        children = moea.method.ga.generateOffspring([[p1, p2]], settings);

    _.forEach(children, function (c) {
      c.fitness = [];
    });

    return children;
  }

  function updateTablesWithPopulation(tables, population) {
    _.forEach(population, function (individual) {
      _.forEach(tables, function (table) {
        var previousPopulation = table.population;
        table.population = moea.help.pareto.updateNonDominatedSet(table.population, individual, table.objectives);
        if (table.population !== previousPopulation) {
          table.score++;
        }
      });
    });
  }

  function aemmd(settings) {
    var ga = moea.method.ga,
        tables = createTables(settings.objectives),
        population = ga.generateRandomPopulation(settings.elementsPerTable * tables.length, settings.randomize, settings.objectives),
        tableInvolvingAllObjectives = _.last(tables);

    updateTablesWithPopulation(tables, population);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      if (i % 100 === 0) {
        ga.logGeneration(i, settings.numberOfGenerations);
      }
      let parents = selectParents(tables);
      let children = crossover(parents, settings);
      updateTablesWithPopulation(tables, children);
    }

    return _.map(tableInvolvingAllObjectives.population, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.aemmd.main.execute', aemmd);
}());
