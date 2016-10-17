(function () {
  'use strict';

  function setSeed(seed) {
    seed = seed || new Date().getTime();
    Math.seedrandom(seed);
    console.log('Using seed: ' + seed);
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.random.setSeed', setSeed);
}());
