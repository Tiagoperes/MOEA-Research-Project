(function () {

  function getVertices(graph) {
    return _.reduce(graph, function (result, edges, vertex) {
      if (edges) result.push(vertex);
      return result;
    }, []);
  }

  function createVirtualNodes(graph, start, end) {
    var vgraph = _.cloneDeep(graph);

    vgraph.push(start);
    vgraph.push([]);

    _.forEach(end, function (vertex) {
      vgraph[vertex].push(vgraph.length - 1);
    });

    return {
      graph: vgraph,
      start: vgraph.length - 2,
      end: vgraph.length - 1
    };
  }

  function findRandomPath(graph, startingNode, endingNode, isVisited, path) {
    var children = _.clone(graph[startingNode]);

    if (_.includes(children, endingNode)) return path;
    isVisited = isVisited || _.fill(new Array(graph.length), false);
    path = path || [];

    while (children.length) {
      let child = _.removeRandom(children);
      if (!isVisited[child]) {
        isVisited[child] = true;
        let result = findRandomPath(graph, child, endingNode, isVisited, _.concat(path, [child]));
        if (result) return result;
      }
    }

    return null;
  }

  function findClosestPath(weights, graph, startingNode, endingNode) {
    var dijkstraResult = moea.help.dijkstra(graph, weights, startingNode),
        path = [],
        vertex = dijkstraResult[endingNode].parent;

    while (vertex !== startingNode) {
      path.unshift(vertex);
      vertex = dijkstraResult[vertex].parent;
    }

    return path;
  }

  function merge(g1, g2) {
    _.forEach(g2, function (edges, vertex) {
      if (edges) {
        g1[vertex] = g1[vertex] || [];
        _.pushAll(g1[vertex], edges);
      }
    });
  }

  function addPathToGraph(graph, path) {
    for (let i = 0; i < path.length - 1; i++) {
      graph[path[i]] = graph[path[i]] || [];
      if (!_.includes(graph[path[i]], path[i + 1])) {
        graph[path[i]].push(path[i + 1]);
      }
    }
  }

  function connect(findPath, graph, component, baseGraph) {
    var startingVertices = getVertices(graph),
        endingVertices = getVertices(component),
        virtual = createVirtualNodes(baseGraph, startingVertices, endingVertices),
        path = findPath(virtual.graph, virtual.start, virtual.end);

    merge(graph, component);
    addPathToGraph(graph, path);
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.heuristic', {
    random: _.partial(connect, findRandomPath),
    dijkstra:  function (weights, graph, component, baseGraph) {
      return connect(_.partial(findClosestPath, weights), graph, component, baseGraph);
    }
  });
}());
