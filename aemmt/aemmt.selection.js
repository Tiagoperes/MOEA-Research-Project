(function () {
  'use strict';

  function removeIndividualWithWorseMean(population, property) {
    var means = _.map(_.map(population, property), _.mean);
    var indexOfWorseMean = _.indexOf(means, _.max(means));
    population.splice(indexOfWorseMean, 1);
  }

  function updateDominationTable(table, individual, maxTableSize, property) {
    var newNdSet = moea.help.pareto.updateNonDominatedSet(table.population, individual, property);
    if (newNdSet === table.population) return false;
    if (newNdSet.length > maxTableSize) removeIndividualWithWorseMean(newNdSet, property);
    table.population = newNdSet;
    return true;
  }

  function tableContains(table, individual, property) {
    return !!_.find(table.population, function (ind) {
      return _.isEqual(ind[property], individual[property]);
    });
  }

  function getTableFitness(table) {
    return _.map(table.population, function (individual) {
      return individual.fitness[table.label];
    });
  }

  function insertOrdered(table, individual, property) {
    var index;

    individual.fitness[table.label] = _.weightedSum(individual[property], table.weights);
    index = _.sortedIndex(getTableFitness(table), individual.fitness[table.label]);
    table.population.splice(index, 0, individual);
  }

  function updateWeightingTable(table, individual, maxTableSize, property) {
    if (tableContains(table, individual, property)) return false;
    insertOrdered(table, individual, property);
    if (table.population.length > maxTableSize) table.population.pop();
    return true;
  }

  function updateTableWithNewIndividual(table, individual, elementsPerTable, dominationTableLimit, property) {
    if (table.weights) {
      return updateWeightingTable(table, individual, elementsPerTable, property);
    }
    return updateDominationTable(table, individual, dominationTableLimit, property);
  }

  function updateTables(tables, population, elementsPerTable, dominationTableLimit, property) {
    _.forEach(population, function (individual) {
      var updated = false;

      _.forEach(tables, function (table) {
        let isTableUpdated = updateTableWithNewIndividual(table, individual, elementsPerTable, dominationTableLimit, property);
        updated = updated || isTableUpdated;
      });

      if (updated) {
        _.forEach(individual.parentTables, function (t) {
          t.score++;
        });
      }
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'aemmt.selection.updateTables', updateTables);
}());
