(function () {
  'use strict';

  function createProgress(numberOfSteps, shouldLog) {
    var percent, step;

    if (shouldLog === undefined) shouldLog = true;
    
    if (numberOfSteps === 0) {
      percent = 100;
      step = 0;
    } else {
      percent = 0;
      step = 100 / numberOfSteps;
    }

    function log() {
      console.log(Math.floor(percent) + '%');
    }

    return {
      next: function (numberOfSteps) {
        if (numberOfSteps === undefined) numberOfSteps = 1;
        percent += numberOfSteps * step;
        if (shouldLog) log();
      },
      reset: function () {
        percent = 0;
        if (shouldLog) log();
      },
      get: function () {
        return percent;
      },
      isComplete: function () {
        return 100 - percent <= 0.00001;
      },
      log: log
    };
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.progress.create', createProgress);
}());
