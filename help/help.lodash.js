(function () {
  'use strict';

  _.removeRandom = function (array) {
    return array.splice(_.random(array.length - 1), 1)[0];
  };

  _.pushAll = function (targetArray, sourceArray) {
    Array.prototype.push.apply(targetArray, sourceArray);
  }

}());
