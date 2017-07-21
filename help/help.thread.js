(function () {
  'use strict';

  function stringify(object) {
    if (object === undefined) return 'undefined';
    return JSON.stringify(object);
  }

  /* arguments: scripts, functionName [, parameters] */
  function thread() {
    var call =  arguments[1] + '(' + _.map(_.slice(arguments, 2), stringify).join(',') + ')',
        location = document.location.href.replace(/\/([^\/]*$)/, '/'),
        imports = _.map(arguments[0], function (path) {return '"' + location + path + '"'}).join(','),
        script = 'importScripts(' + imports + '); onmessage = function(e) { postMessage(' + call + '); }',
        blobURL = window.URL.createObjectURL(new Blob([script])),
        worker = new Worker(blobURL);

    return new Promise(function (resolve) {
      worker.onmessage = function(response) {
        resolve(response.data);
      };
      worker.postMessage('');
    });
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.thread', thread);

}());
