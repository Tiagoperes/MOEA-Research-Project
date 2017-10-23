(function () {
  'use strict';

  /*
   * To create a new set of pheromone tables:
   * new Pheromones(weights, tableSize, initialValue, trailPersistence, bounds)
   *
   * To create a pheromone tables structure over a given buffer:
   * new Pheromones(weights, tableSize, buffer)
   */
  function Pheromones(weights, tableSize, initialValue, trailPersistence, bounds) {
    var sharedBuffer, sharedArray;

    if (initialValue instanceof SharedArrayBuffer) {
      sharedBuffer = initialValue;
      sharedArray = new Int32Array(sharedBuffer);
    } else {
      sharedBuffer = new SharedArrayBuffer(weights.length * tableSize * tableSize * Int32Array.BYTES_PER_ELEMENT);
      sharedArray = new Int32Array(sharedBuffer);
      _.fill(sharedArray, initialValue * 100);
    }

    this.getWeights = function (tableIndex) {
      return weights[tableIndex];
    };

    this.deposit = function (tableIndex, v1, v2) {
      var tableOffset = tableIndex * tableSize * tableSize,
          lineOffset = v1 * tableSize,
          pos = tableOffset + lineOffset + v2,
          newVal = Atomics.load(sharedArray, pos) + trailPersistence * 100;

      if (newVal > bounds.max * 100) newVal = bounds.max * 100;
      Atomics.store(sharedArray, pos, newVal);
    };

    this.evaporate = function (weight) {
      var rate = Math.pow((1 - trailPersistence), weight);
      for (let i = 0; i < sharedArray.length; i++) {
        let newVal = Atomics.load(sharedArray, i) * rate;
        if (newVal < bounds.min * 100) newVal = bounds.min * 100;
        Atomics.store(sharedArray, i, newVal);
      }
    };

    this.getValue = function (tableIndex, v1, v2) {
      let tableOffset = tableIndex * tableSize * tableSize;
      let lineOffset = v1 * tableSize;
      return Atomics.load(sharedArray, tableOffset + lineOffset + v2) / 100;
    };

    this.getSharedBuffer = function () {
      return sharedBuffer;
    };

    this.getWeights = function () {
      return weights;
    };

    this.getNumberOfTables = function () {
      return weights.length;
    };

    this.getSizeOfTables = function () {
      return tableSize;
    };
  }

  self.moea = self.moea || {};
  _.set(moea, 'method.mdtAcoParallel.Pheromones', Pheromones);

}());
