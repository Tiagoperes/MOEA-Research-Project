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

  function createTable(label, objectiveIndexes, isDomination) {
    return {
      label: label,
      objectives: createTableObjectiveFunctions(objectiveIndexes),
      isDomination: isDomination,
      population: [],
      score: 0
    };
  }

  function createTables(objectives) {
    var tables = [];
    for (let i = 1; i <= objectives.length - 1; i++) {
      tables = _.concat(tables, _.map(getCombinations(objectives, i), function (objectiveIndexes, count) {
        return createTable(tables.length + count, objectiveIndexes, false);
      }));
    }
    tables.push(createTable(tables.length, Array.from(Array(objectives.length).keys()), true));
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
        parentTables: parentTables,
        objectiveValues: _.map(objectives, function (objective) {return objective(c)})
      };
    });

    return children;
  }

  function updateDominationTable(table, individual, maxTableSize) {
    var newSolutions = [];

    for (let i = 0; i < table.population.length; i++) {
      let isEqual = _.isEqual(table.population[i].objectiveValues, individual.objectiveValues);
      if (isEqual || dominates(table.population[i], individual, table.objectives)) {
        return false;
      }
      if (!dominates(individual, table.population[i], table.objectives)) {
        newSolutions.push(table.population[i]);
      }
    }

    individual.fitness[table.label] = getWeightingFitness(individual, table.objectives);
    var allFitness = _.map(newSolutions, function (individual) {return individual.fitness[table.label]});
    var orderedIndex = getOrderedIndex(allFitness, individual.fitness[table.label], 0, allFitness.length);
    newSolutions.splice(orderedIndex, 0, individual);
    if (newSolutions.length > maxTableSize) {
      newSolutions.pop();
    }

    table.population = newSolutions;
    return true;
  }

  function getWeightingFitness(solution, objectives) {
    var sum = _.sumBy(objectives, function (objective) {
      return objective(solution);
    });
    return sum / objectives.length;
  }

  function getOrderedIndex(list, element, begin, end) {
    var half = begin + Math.floor((end - begin) / 2);
    if (begin === end) return begin;
    if (element > list[half]) return getOrderedIndex(list, element, half+1, end);
    if (element === list[half]) return -1;
    return getOrderedIndex(list, element, begin, half);
  }

  function updateWeightingTable(table, individual, maxTableSize) {
    individual.fitness[table.label] = getWeightingFitness(individual, table.objectives);
    var allFitness = _.map(table.population, function (individual) {return individual.fitness[table.label]});
    var orderedIndex = getOrderedIndex(allFitness, individual.fitness[table.label], 0, allFitness.length);
    if (orderedIndex !== -1) {
      table.population.splice(orderedIndex, 0, individual);
      if (table.population.length > maxTableSize) table.population.pop();
      return true;
    }
  }

  function updateTableWithNewIndividual(table, individual, elementsPerTable, dominationTableLimit) {
    if (table.isDomination) {
      return updateDominationTable(table, individual, dominationTableLimit);
    }
    return updateWeightingTable(table, individual, elementsPerTable);
  }

  function updateTablesWithPopulation(tables, population, elementsPerTable, dominationTableLimit) {
    _.forEach(population, function (individual) {
      var updated = false;

      _.forEach(tables, function (table) {
        let isTableUpdated = updateTableWithNewIndividual(table, individual, elementsPerTable, dominationTableLimit);
        updated = updated || isTableUpdated;
      });

      if (updated) {
        _.forEach(individual.parentTables, function (t) {
          t.score++;
        });
      }
    });
  }

  function resetTablesScores(tables) {
    _.forEach(tables, function (table) {
      table.score = 0;
    });
  }

  function getNonDominatedSetFromTables(tables) {
    var solutions = [],
        numberOfObjectives = _.last(tables).population[0].objectiveValues.length,
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives.push(function (ind) {
        return ind.objectiveValues[i];
      });
    }

    _.forEach(tables, function (table) {
      solutions = _.concat(solutions, table.population);
    });

    console.log(solutions.length);
    var res = _.uniqWith(moea.help.pareto.getNonDominatedSet(solutions, objectives), function (a,b) {return _.isEqual(a.objectiveValues,b.objectiveValues)});
    console.log(res.length);
    return res;
  }

  function aemmt(settings) {
    var tables = createTables(settings.objectives),
        population = generateRandomPopulation(settings.elementsPerTable * tables.length, settings.randomize, settings.objectives),
        tableInvolvingAllObjectives = _.last(tables);

    updateTablesWithPopulation(tables, population, settings.elementsPerTable, settings.dominationTableLimit);

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      if (i % 100 === 0) {
        resetTablesScores(tables);
        console.log('it ' + i +'; domination table size: ' + tableInvolvingAllObjectives.population.length);
      }
      let parents = selectParents(tables);
      let children = crossover(parents, settings.crossover, settings.mutation, settings.objectives);
      updateTablesWithPopulation(tables, children, settings.elementsPerTable, settings.dominationTableLimit);
    }

    return _.map(getNonDominatedSetFromTables(tables), 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'aemmt.main.execute', aemmt);
}());
