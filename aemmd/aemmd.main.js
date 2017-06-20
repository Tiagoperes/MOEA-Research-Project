(function () {
  'use strict';

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
    var p1 = _.maxBy(_.sampleSize(tables, 4), 'score'),
        tablesWithoutP1 = _.filter(tables, _.partial(_.negate(_.isEqual), p1)),
        p2 = _.maxBy(_.sampleSize(tablesWithoutP1, 4), 'score') || p1;

    return [p1, p2];
  }

  function mutate(solution, mutation) {
    if (Math.random() < mutation.rate) {
      return mutation.method(solution);
    }
    return solution;
  }

  function crossover(parentTables, crossoverSettings, mutationSettings, objectives) {
    var rp1 = _.sample(parentTables[0].population),
        p1 = rp1.solution,
        rp2 = _.sample(parentTables[1].population),
        p2 = rp2.solution,
        children =  crossoverSettings.method(p1, p2);

    window.debugParentSolutions = [rp1, rp2];

    children = _.map(children, function (c) {
      var mutated = mutate(c, mutationSettings);
      return {
        solution: mutated,
        fitness: [],
        objectiveValues: _.map(objectives, function (objective) {return objective(mutated)})
      };
    });

    return children;
  }

  function updateTablesWithPopulation(tables, population) {
    window.debugCTables = [];
    _.forEach(population, function (individual) {
      _.forEach(tables, function (table) {
        var previousPopulation = table.population;
        table.population = moea.help.pareto.updateNonDominatedSet(table.population, individual, table.objectives);
        if (table.population !== previousPopulation) {
          window.debugCTables.push(table.label + 1);
          table.score++;
        }
      });
    });
  }

  function aemmd(settings) {
    var tables = createTables(settings.objectives),
        population = generateRandomPopulation(settings.elementsPerTable * tables.length, settings.randomize, settings.objectives),
        tableInvolvingAllObjectives = _.last(tables);

    updateTablesWithPopulation(tables, population);

    var debugParentTables = _.fill(new Array(tables.length), 0);
    var strGeneral = '';
    //var strTables = [];
    var strTConv = '0\t';
    var strTSize = '0\t';
    var strTParent = '0\t';
    var strInitialPop = '';
    var strFinalPop = '';
    _.forEach(tables, function (t) {
      //strTables[t.label] = 'Inicialização\t' + t.score + '\t' + t.population.length + '\t' + debugParentTables[t.label] + '\n';
      strTConv += t.score + '\t';
      strTSize += t.population.length + '\t';
      strTParent += debugParentTables[t.label] + '\t';
      strInitialPop += (t.label + 1) + '\t' + t.population.length + '\t' + _.map(t.population, function (p) {return JSON.stringify(p.objectiveValues)}) + '\n';
    });
    strTConv += '\n'; strTSize += '\n'; strTParent += '\n';

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      if (i % 100 === 0)  {
        console.log(i);
        //console.log('tables scores: ' + _.map(tables, 'score').join(' | '));
      }
      let parents = selectParents(tables);
      debugParentTables[parents[0].label]++;
      debugParentTables[parents[1].label]++;
      let children = crossover(parents, settings.crossover, settings.mutation, settings.objectives);
      updateTablesWithPopulation(tables, [children[0]]);

      // DEBUG
      var ptables = (parents[0].label + 1) + ' e ' + (parents[1].label + 1);
      var p1 = JSON.stringify(debugParentSolutions[0].objectiveValues);
      var p2 = JSON.stringify(debugParentSolutions[1].objectiveValues);
      var c = JSON.stringify(children[0].objectiveValues);
      var ctables = debugCTables.join(', ');
      strGeneral += (i+1) + '\t' + ptables + '\t' + p1 + '\t' + p2 + '\t' + c + '\t' + ctables + '\n';
      strTConv += (i+1) + '\t'; strTSize += (i+1) + '\t'; strTParent += (i+1) + '\t';
      _.forEach(tables, function (t) {
        //strTables[t.label] += (i+1) + '\t' + t.score + '\t' + t.population.length + '\t' + debugParentTables[t.label] + '\n';
        strTConv += t.score + '\t';
        strTSize += t.population.length + '\t';
        strTParent += debugParentTables[t.label] + '\t';
      });
      strTConv += '\n'; strTSize += '\n'; strTParent += '\n';
    }

    //console.log(debugParentTables.join(', '));
    _.forEach(tables, function (t) {
      strFinalPop += (t.label + 1) + '\t' + t.population.length + '\t' + _.map(t.population, function (p) {return JSON.stringify(p.objectiveValues)}) + '\n';
    });
    window.debugData = {general: strGeneral, tables: {score: strTConv, size: strTSize, parent: strTParent}, initial: strInitialPop, final: strFinalPop};
    return _.map(tableInvolvingAllObjectives.population, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'aemmd.main.execute', aemmd);
}());
