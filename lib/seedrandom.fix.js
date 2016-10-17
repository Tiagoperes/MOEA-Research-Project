/* The seedrandom library does the bad job of replacing the Math.random function everytime
 * Math.seedrandom is called, which makes it impossible to work with Lodash. Lodash stores
 * a reference to Math.random in a private variable, so, when the seed changes, it doesn't
 * affect any of the Lodash functions.
 *
 * To make both libraries compatible, we must redefine Math.random and Math.seedrandom after
 * seedrandom.js is loaded and before lodash.js is loaded. After this, Math.random must never
 * be redefined.*/

(function () {
  'use strict';

  var seedrandom = Math.seedrandom;
  var rng = seedrandom(new Date().getTime());

  Math.random = function () {
    return rng();
  };

  Math.seedrandom = function (seed) {
    rng = seedrandom(seed);
  };
}());
