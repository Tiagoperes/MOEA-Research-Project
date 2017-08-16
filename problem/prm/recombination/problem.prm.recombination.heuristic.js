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

  function getPath(node) {
    var path = [];
    while (node.parent) {
      path.push(node.vertex);
      node = node.parent;
    }
    return _.reverse(path);
  }

  function findRandomPath(graph, startingNode, endingNode) {
    var explore = [{vertex: startingNode}],
        isVisited = _.fill(new Array(graph.size().vertices), false);

    if (startingNode === endingNode) return [];

    while(explore.length) {
      let node = _.removeRandom(explore);
      if (!isVisited[node.vertex]) {
        isVisited[node.vertex] = true;
        let edges = graph.getEdges(node.vertex);
        for (let i = 0; i < edges.length; i++) {
          let newNode = {vertex: edges[i], parent: node};
          if (edges[i] === endingNode) return getPath(node);
          explore.push(newNode);
        }
      }
    }

    return null;
  }

  // function findRandomPath(graph, startingNode, endingNode, isVisited, path) {
  //   var children = _.clone(graph.getEdges(startingNode));
  //
  //   if (_.includes(children, endingNode)) return path;
  //   isVisited = isVisited || _.fill(new Array(graph.size().vertices), false);
  //   path = path || [];
  //
  //   while (children.length) {
  //     let child = _.removeRandom(children);
  //     if (!isVisited[child]) {
  //       isVisited[child] = true;
  //       let result = findRandomPath(graph, child, endingNode, isVisited, _.concat(path, [child]));
  //       if (result) return result;
  //     }
  //   }
  //
  //   return null;
  // }

  function findClosestPath(getWeights, graph, startingNode, endingNode) {
    var dijkstraResult = moea.help.dijkstra(graph, getWeights(), startingNode),
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
    dijkstra:  function (getWeights, graph, component, baseGraph) {
      return connect(_.partial(findClosestPath, getWeights), graph, component, baseGraph);
    }
  });
}());
