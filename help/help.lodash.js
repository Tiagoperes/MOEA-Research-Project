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

}());
