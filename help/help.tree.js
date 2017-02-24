(function () {
  'use strict';

  function createProperties(numberOfVertices, destinations) {
    var props = [];
    for (let i = 0; i < numberOfVertices; i++) {
      props[i] = {
        isVisited: false,
        isDestination: _.includes(destinations, i)
      };
    }
    return props;
  }

  function addChildren(list, parent, graph) {
    var children = graph[parent];
    _.forEach(children, function (child) {
      list.push({value: child, parent: parent});
    });
  }

  function exploreVertex(vertex, properties, explore, tree, graph) {
    if (!properties[vertex.value].isVisited) {
      properties[vertex.value].isVisited = true;
      addChildren(explore, vertex.value, graph);
      if (vertex.parent !== null) {
        tree[vertex.parent].push(vertex.value);
      }
      if (properties[vertex.value].isDestination) {
        return 1;
      }
    }
    return 0;
  }

  function extractRandomVertex(vertices) {
    var rand = _.random(vertices.length - 1);
    return vertices.splice(rand, 1)[0];
  }

  function createEmptyGraph(numberOfVertices) {
    var g = [];
    for (let i = 0; i < numberOfVertices; i++) {
      g[i] = [];
    }
    return g;
  }

  function findLeafs(tree, properties) {
    _.forEach(tree, function (edges, vertex) {
      if (_.isEmpty(edges)) {
        properties[vertex].isLeaf = true;
      }
    });
  }

  //fixme: tentar melhorar o custo disso
  function prune(tree, properties) {
    var checkLeafs;
    findLeafs(tree, properties);
    do {
      checkLeafs = false;
      _.forEach(tree, function (edges, vertex) {
        tree[vertex] = _.filter(edges, function (child) {
          return !properties[child].isLeaf || properties[child].isDestination;
        });
        if (_.isEmpty(tree[vertex]) && properties[vertex].isLeaf !== true) {
          properties[vertex].isLeaf = true;
          checkLeafs = true;
        }
      });
    } while (checkLeafs);
  }

  function randomize(graph, root, destinations) {
    var explore = [{value: root, parent: null}];
    var tree = createEmptyGraph(graph.length);
    var properties = createProperties(graph.length, destinations);
    var destinationsToGo = destinations.length;
    while (!_.isEmpty(explore) && destinationsToGo) {
      let vertex = extractRandomVertex(explore);
      destinationsToGo -= exploreVertex(vertex, properties, explore, tree, graph);
    }
    prune(tree, properties);
    return tree;
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.tree', {
    generateRandom: randomize,
    prune: function (tree, destinations) {
      var properties = createProperties(tree.length, destinations);
      return prune(tree, properties);
    }
  });
}());
