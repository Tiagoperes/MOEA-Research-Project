(function () {
  'use strict';

  function fillLeftZeros(binaryArray, numberOfBits) {
    while(binaryArray.length < numberOfBits) {
      binaryArray.unshift(false);
    }
  }

  function writeSignalToBinaryArray(integer, binaryArray) {
    binaryArray.unshift(integer < 0);
  }

  function charToBool(char) {
    return char === '1';
  }

  function toSignedBinaryArray(integer, numberOfBits) {
    var unsigned, binaryString, binaryArray;

    if (Math.abs(integer) > Math.pow(2, numberOfBits - 1)) {
      throw 'the number of bits is no enough to represent the integer.';
    }

    unsigned = Math.abs(integer);
    binaryString = unsigned.toString(2);
    binaryArray = _.map(binaryString.split(''), charToBool);
    fillLeftZeros(binaryArray, numberOfBits - 1);
    writeSignalToBinaryArray(integer, binaryArray);
    return binaryArray;
  }

  function generateRandom(min, max, numberOfBits) {
    var rand = _.random(min, max),
        convert = min < 0 ? toSignedBinaryArray : toBinaryArray;
    return convert(rand, numberOfBits);
  }

  function singlePointCrossover(binArray1, binArray2) {
    var rand;

    if (binArray1.length !== binArray2.length) {
      throw 'Arrays have different lengths. Single point crossover is not possible.';
    }

    rand = _.random(binArray1.length - 1);
    return [
      _.concat(binArray1.slice(0, rand), binArray2.slice(rand)),
      _.concat(binArray2.slice(0, rand), binArray1.slice(rand))
    ];
  }

  function mutate(binArray) {
    var rand = _.random(binArray.length - 1);
    binArray[rand] = !binArray[rand];
    return binArray;
  }

  function boolToChar(boolean) {
    return boolean ? '1': '0';
  }

  function toInt(binArray) {
    var charArray = _.map(_.tail(binArray), boolToChar),
        binStr = charArray.join(''),
        unsignedInt = parseInt(binStr, 2);

    return _.head(binArray) ? -unsignedInt : unsignedInt;
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.binary', {
    generateRandom: generateRandom,
    singlePointCrossover: singlePointCrossover,
    mutate: mutate,
    toSignedBinaryArray: toSignedBinaryArray,
    toInt: toInt
  });
}());
