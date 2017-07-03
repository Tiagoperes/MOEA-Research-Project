(function () {
  'use strict';

  function createWeights(objectiveIndexes, numberOfObjectives) {
    var weights;

    if (objectiveIndexes) {
      weights = _.fill(new Array(numberOfObjectives), 0);
      _.forEach(objectiveIndexes, function (i) {
        weights[i] = 1;
      });
    }

    return weights;
  }

  function createTable(label, objectiveIndexes, numberOfObjectives) {
    return {
      label: label,
      weights: createWeights(objectiveIndexes, numberOfObjectives),
      population: [],
      score: 0
    };
  }

  function createTables(objectives) {
    var tables = [];
    for (let i = 1; i <= objectives.length; i++) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes, count) {
        return createTable(tables.length + count, objectiveIndexes, objectives.length);
      }));
    }
    tables.push(createTable(tables.length));
    return tables;
  }

  function selectParents(tables) {
    var p1 = _.maxBy(_.sampleSize(tables, 3), 'score'),
        tablesWithoutP1 = _.filter(tables, _.negate(_.partial(_.isEqual, p1))),
        p2 = _.maxBy(_.sampleSize(tablesWithoutP1, 3), 'score');

    return [p1, p2];
  }

  function crossover(parentTables, settings) {
    var p1 = _.sample(parentTables[0].population),
        p2 = _.sample(parentTables[1].population),
        children =  moea.ga.generateOffspring([[p1, p2]], settings);

    _.forEach(children, function (c) {
      c.parentTables = parentTables;
      c.fitness = [];
    });

    return children;
  }

  function getNonDominatedSetFromTables(tables, property) {
    var population = _.reduce(tables, function (pop, table) {
      return _.concat(pop, table.population);
    }, []);
    population = _.uniqBy(population, property);
    return moea.help.pareto.getNonDominatedSet(population, property);
  }

  function resetTablesScores(tables) {
    _.forEach(tables, function (table) {
      table.score = 0;
    });
  }

  function initializeFitness(population) {
    _.forEach(population, function (individual) {
      individual.fitness = [];
    });
  }

  function aemmt(settings) {
    var norm = moea.help.normalization,
        extremes = norm.initializeExtremes(settings.objectives.length),
        evaluationProperty = 'evaluation',
        tables = createTables(settings.objectives),
        populationSize = settings.elementsPerTable * tables.length,
        population = moea.ga.generateRandomPopulation(populationSize, settings.randomize, settings.objectives);

    if (settings.shouldNormalize) {
      norm.normalize([], population, extremes);
      evaluationProperty = 'normalizedEvaluation';
    }

    initializeFitness(population);
    moea.aemmt.selection.updateTables(tables, population, settings.elementsPerTable, settings.dominationTableLimit, evaluationProperty);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      if (i % 100 === 0) {
        resetTablesScores(tables);
        moea.ga.logGeneration(i, settings.numberOfGenerations);
      }
      let parents = selectParents(tables);
      let children = crossover(parents, settings);

      if (settings.shouldNormalize) {
        norm.normalize(_.flatten(_.map(tables, 'population')), children, extremes);
      }

      moea.aemmt.selection.updateTables(tables, children, settings.elementsPerTable, settings.dominationTableLimit, evaluationProperty);
    }

    return _.map(getNonDominatedSetFromTables(tables, evaluationProperty), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'aemmt.main.execute', aemmt);
}());
