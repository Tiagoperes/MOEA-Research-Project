(function () {
  'use strict';

  function getDirectionlessGraph(g) {
    var dless = _.cloneDeep(g);

    _.forEach(g, function (edges, vertex) {
      _.forEach(edges, function (edge) {
        dless[edge].push(vertex);
      });
    });

    return dless;
  }

  function findIntersections(a, b) {
    var inter = [];
    a = getDirectionlessGraph(a);
    b = getDirectionlessGraph(b);
    for (let i = 0; i < a.length; i++) {
      inter[i] = _.intersection(a[i], b[i]);
    }
    return inter;
  }

  function getComponent(graph, vertex, analyzed, component) {
    component = component || _.fill(new Array(graph.length), []);
    analyzed[vertex] = true;
    component[vertex] = graph[vertex];

    if (_.isEmpty(component[vertex])) return vertex;

    _.forEach(graph[vertex], function (edge) {
      if (!analyzed[edge]) {
        getComponent(graph, edge, analyzed, component);
      }
    });
    return component;
  }

  function splitByComponent(g) {
    var analyzed = _.fill(new Array(g.length), false);
    var graphs = [];
    var v = analyzed.indexOf(false);
    while (v !== -1) {
      graphs.push(getComponent(g, v, analyzed));
      v = analyzed.indexOf(false);
    }
    return graphs;
  }

  function createVirtualNodes(graph, weights, firstVnodeEdges, lastVnodeEdges) {
    var vnode1 = graph.length,
        vnode2 = vnode1 + 1;

    graph.push(firstVnodeEdges);
    weights.push(new Array(graph.length));
    _.forEach(firstVnodeEdges, function (node) {
      weights[vnode1][node] = 0;
    });

    graph.push([]);
    weights.push(new Array(graph.length));
    _.forEach(lastVnodeEdges, function (node) {
      graph[node].push(vnode2);
      weights[node][vnode2] = 0;
    });

    return [vnode1, vnode2];
  }

  function removeVirtualNodes(graph, weights, lastVnodeEdges) {
    graph.length -= 2;
    weights.length -= 2;
    _.forEach(lastVnodeEdges, function (node) {
      graph[node].length--;
    });
  }

  function walkThrough(tree, node, vertices, visited) {
    vertices.push(node);
    visited[node] = true;
    _.forEach(tree[node], function (child) {
      if (!visited[child]) {
        walkThrough(tree, child, vertices, visited);
      }
    });
  }

  function getVerticesList(tree) {
    var vertices, visited, node;

    if (!(tree instanceof Array)) {
      return [tree];
    }

    vertices = [];
    visited = new Array(tree.length);
    node = 0;

    while (_.isEmpty(tree[node]) && node < tree.length) {
      visited[node] = true;
      node++;
    }

    walkThrough(tree, node, vertices, visited);
    return vertices;
  }

  function merge(t1, t2) {
    var result = [];
    for (let i = 0; i < t1.length; i++) {
      let inheritance = _.isEmpty(t1[i]) ? t2[i] : t1[i];
      result[i] = _.clone(inheritance);
    }
    return result;
  }

  function createReconnectedTreeStructure(t1, t2, graph) {
    if (t1 instanceof Array && t2 instanceof Array) {
      return merge(t1, t2);
    }
    if (t1 instanceof Array) {
      return t1;
    }
    if (t2 instanceof Array) {
      return t2;
    }
    return _.fill(new Array(graph.length), []);
  }

  function reconnect(t1, t2, graph, weights) {
    var v1 = getVerticesList(t1),
        v2 = getVerticesList(t2),
        reconnected = createReconnectedTreeStructure(t1, t2, graph),
        vnodes, path, node;

    vnodes = createVirtualNodes(graph, weights, v1, v2);
    path = dijkstra(graph, weights, vnodes[0]);

    node = path[_.last(vnodes)].parent;
    while (path[node].parent !== _.head(vnodes)) {
      reconnected[path[node].parent].push(node);
      node = path[node].parent;
    }

    removeVirtualNodes(graph, weights, v2);
    return reconnected;
  }

  function extractTreeWithRootNode(forest, root) {
    for (let i = 0; i < forest.length; i++) {
      if (forest[i] === root || forest[i][root].length > 0) {
        return forest.splice(i, 1)[0];
      }
    }
  }

  function reconnectForest(forest, root, graph, weights) {
    var s1 = extractTreeWithRootNode(forest, root);
    while (forest.length > 0) {
      //let r2 = _.random(forest.length - 1);
      let r2 = 0; // fixme
      let s2 = forest.splice(r2, 1)[0];
      s1 = reconnect(s1, s2, graph, weights);
    }
    return s1;
  }

  function isUsefulSubTree(tree, source, destinations) {
    return tree instanceof Array || tree === source || _.includes(destinations, tree);
  }

  function createEmptyGraph(numberOfVertices) {
    var g = [];
    for (let i = 0; i < numberOfVertices; i++) {
      g[i] = [];
    }
    return g;
  }

  function getTreeFromGraph(graph, root) {
    var tree = createEmptyGraph(graph.length);
    var queue = [root];
    var visited = new Array(graph.length);

    while (!_.isEmpty(queue)) {
      let node = queue.shift();
      visited[node] = true;
      _.forEach(graph[node], function (child) {
        if (!visited[child]) {
          tree[node].push(child);
          queue.push(child);
        }
      });
    }

    return tree;
  }

  function crossover(a, b, graph, weights, source, destinations) {
    var child;
    var intersection = findIntersections(a, b);
    var forest = splitByComponent(intersection);
    forest = _.filter(forest, _.partial(isUsefulSubTree, _, source, destinations));
    child = reconnectForest(forest, source, graph, weights);
    child = getTreeFromGraph(child, source);
    moea.help.tree.prune(child, destinations);
    return child;
  }

  window.crossover = crossover;
}());
