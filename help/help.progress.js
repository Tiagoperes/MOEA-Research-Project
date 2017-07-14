(function () {
  'use strict';

  function createProgress(numberOfSteps) {
    var percent, step;
    
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
      next: function () {
        percent += step;
        log();
      },
      reset: function () {
        percent = 0;
        log();
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
