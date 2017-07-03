(function () {
  'use strict';

  _.removeRandom = function (array) {
    return array.splice(_.random(array.length - 1), 1)[0];
  };

  _.pushAll = function (targetArray, sourceArray) {
    Array.prototype.push.apply(targetArray, sourceArray);
  };

  _.applyOperationBetweenArrays = function () {
    var operation = _.head(arguments),
        arrays = _.tail(arguments),
        result = _.clone(_.head(arrays));

    for (let i = 1; i < arrays.length; i++) {
      for (let j = 0; j < arrays[i].length; j++) {
        result[j] = operation(result[j], arrays[i][j]);
      }
    }

    return result;
  };

  _.subtractArrays = function () {
    return _.applyOperationBetweenArrays.apply(this, _.concat([_.subtract], arguments));
  };

  _.addArrays = function () {
    return _.applyOperationBetweenArrays.apply(this, _.concat([_.add], arguments));
  };

  _.multiplyArrays = function () {
    return _.applyOperationBetweenArrays.apply(this, _.concat([_.multiply], arguments));
  };

  _.divideArrays = function () {
    return _.applyOperationBetweenArrays.apply(this, _.concat([_.divide], arguments));
  };

  _.factorial = function (n) {
    if (n === 1) return n;
    return n * _.factorial(n - 1);
  };

  _.weightedSum = function (array, weights) {
    return _.reduce(array, function (sum, value, index) {
      return sum + value * weights[index];
    }, 0);
  };

  _.allCombinations = function (array, combinationSize) {
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

    return getCombinations(array, combinationSize);
  };

}());
