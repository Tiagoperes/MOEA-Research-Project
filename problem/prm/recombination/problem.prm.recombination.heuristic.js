(function () {

  function createVirtualNodes(graph, start, end) {
    var vgraph = graph.clone(),
        startNode = vgraph.createVertex(),
        endNode = vgraph.createVertex();

    vgraph.setEdges(startNode, start);

    _.forEach(end, function (vertex) {
      vgraph.createEdge(vertex, endNode);
    });

    return {
      graph: vgraph,
      start: startNode,
      end: endNode
    };
  }

  function findRandomPath(graph, startingNode, endingNode, isVisited, path) {
    var children = _.clone(graph.getEdges(startingNode));

    if (_.includes(children, endingNode)) return path;
    isVisited = isVisited || _.fill(new Array(graph.size().vertices), false);
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

  function connect(findPath, graph, component, baseGraph) {
    var startingVertices = graph.getVertices(),
        endingVertices = component.getVertices(),
        virtual = createVirtualNodes(baseGraph, startingVertices, endingVertices),
        path = findPath(virtual.graph, virtual.start, virtual.end);

    graph.merge(component);
    graph.createPath(path);
    return path;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.heuristic', {
    random: _.partial(connect, findRandomPath),
    dijkstra:  function (weights, graph, component, baseGraph) {
      return connect(_.partial(findClosestPath, weights), graph, component, baseGraph);
    }
  });
}());
