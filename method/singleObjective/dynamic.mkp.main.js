(function () {
  'use strict';

  function knapsack(matrix, index, size, weights, values) {
    var take = 0,
        dontTake = 0;

    if (matrix[index][size] !== 0) return matrix[index][size];

    if (index === 0){
      if (weights[0] <= size){
        matrix[index][size] = values[0];
        return values[0];
      }
      else{
        matrix[index][size] = 0;
        return 0;
      }
    }

    if (weights[index] <= size) {
      take = values[index] + knapsack(matrix, index - 1, size - weights[index], weights, values);
    }
    dontTake = knapsack(matrix, index - 1, size, weights, values);
    matrix[index][size] = _.max([take, dontTake]);

    return matrix[index][size];
  }

  function run(settings) {
    var matrix = [], fitness, values;

    for (let i = 0; i < settings.weights.length; i++) {
      matrix[i] = [];
      for (let j = 0; j <= settings.capacity; j++) {
        matrix[i][j] = 0;
      }
    }

    values = settings.profitMatrix[0];
    fitness = knapsack(matrix, settings.weights.length - 1, settings.capacity, settings.weights, values);

    return {
      solution: [],
      fitness: fitness
    }
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.dynamic.mkp.main.execute', run);
}());
