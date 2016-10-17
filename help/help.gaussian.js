(function () {
  'use strict';

  /* returns a gaussian random function with the given mean and standard deviation (theta).
   * taken from: http://stackoverflow.com/a/35599181/1147777
   */
  function gaussian(mean, stdev) {
    var y2, useLast = false;

    return function() {
      var y1;

      if (useLast) {
        y1 = y2;
        useLast = false;
      }
      else {
        let x1, x2, w;
        do {
          x1 = 2.0 * Math.random() - 1.0;
          x2 = 2.0 * Math.random() - 1.0;
          w  = x1 * x1 + x2 * x2;
        } while( w >= 1.0);

        w = Math.sqrt((-2.0 * Math.log(w)) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        useLast = true;
      }

      return Math.abs(mean + stdev * y1);
    }
  }

  Math.gaussian = gaussian;

}());
