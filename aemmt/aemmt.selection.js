(function () {
  'use strict';

  function removeIndividualWithWorseMean(population) {
    var means = _.map(_.map(population, 'evaluation'), _.mean);
    var indexOfWorseMean = _.indexOf(means, _.max(means));
    population.splice(indexOfWorseMean, 1);
  }

  function updateDominationTable(table, individual, maxTableSize) {
    var newNdSet = moea.help.pareto.updateNonDominatedSet(table.population, individual, 'evaluation');
    if (newNdSet === table.population) return false;
    if (newNdSet.length > maxTableSize) removeIndividualWithWorseMean(newNdSet);
    table.population = newNdSet;
    return true;
  }

  function tableContains(table, individual) {
    return !!_.find(table.population, function (ind) {
      return _.isEqual(ind.evaluation, individual.evaluation);
    });
  }

  function getTableFitness(table) {
    return _.map(table.population, function (individual) {
      return individual.fitness[table.label];
    });
  }

  function insertOrdered(table, individual) {
    var index;

    individual.fitness[table.label] = _.weightedSum(individual.evaluation, table.weights);
    index = _.sortedIndex(getTableFitness(table), individual.fitness[table.label]);
    table.population.splice(index, 0, individual);
  }

  function updateWeightingTable(table, individual, maxTableSize) {
    if (tableContains(table, individual)) return false;
    insertOrdered(table, individual);
    if (table.population.length > maxTableSize) table.population.pop();
    return true;
  }

  function updateTableWithNewIndividual(table, individual, elementsPerTable, dominationTableLimit) {
    if (table.weights) {
      return updateWeightingTable(table, individual, elementsPerTable);
    }
    return updateDominationTable(table, individual, dominationTableLimit);
  }

  function updateTables(tables, population, elementsPerTable, dominationTableLimit) {
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

  window.moea = window.moea || {};
  _.set(moea, 'aemmt.selection.updateTables', updateTables);
}());
