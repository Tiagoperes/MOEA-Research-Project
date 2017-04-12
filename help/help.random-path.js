(function () {
  'use strict';

  function toNode(label, parent) {
    return {
      label: label,
      parent: parent
    };
  }

  function toNodes(labels, parent) {
    return _.map(labels, _.partial(toNode, _, parent));
  }

  function createDestinationArray(destinations) {
    var destination = [];
    _.forEach(destinations, function (dest) {
      destination[dest] = true;
    });
    return destination;
  }

  function initializeWithSourceNodes(visited, explore, sources, graph) {
    _.forEach(sources, function (src) {
      visited[src] = true;
      let newNodes = toNodes(graph[src], {label: src});
      _.pushAll(explore, newNodes);
    });
  }

  function findRandomPath(sources, destinations, graph) {
    var destination = createDestinationArray(destinations),
        visited = [],
        explore = [],
        node;

    initializeWithSourceNodes(visited, explore, sources, graph);

    while ((!node || !destination[node.label]) && explore.length) {
      node = _.removeRandom(explore);
      if (!visited[node.label]) {
        visited[node.label] = true;
        let newNodes = toNodes(graph[node.label], node);
        _.pushAll(explore, newNodes);
      }
    }

    return node;
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.findRandomPath', findRandomPath);
}());
