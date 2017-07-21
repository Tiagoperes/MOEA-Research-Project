(function () {
  'use strict';

  function createDatabase(name, shouldReset) {
    var array;

    if (!localStorage[name] || shouldReset) {
      localStorage[name] = '[]';
    }

    array = JSON.parse(localStorage[name]);

    array.push = function(element) {
      array[array.length] = element;
      localStorage[name] = JSON.stringify(array);
    };

    return array;
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.database.create', createDatabase);
}());
