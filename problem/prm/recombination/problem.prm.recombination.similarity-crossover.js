(function () {
  'use strict';

  function getDirectionLessGraph(graph) {
    var result = moea.help.graph.createEmptyGraph(_.keys(graph).length);
    _.forEach(graph, function (edges, vertex) {
      result[vertex] = _.concat(result[vertex], edges);
      _.forEach(edges, function (edge) {
        result[edge].push(vertex);
      });
    });
    return result;
  }

  function getGraphsIntersection(a, b) {
    return _.reduce(a, function(result, edges, vertex) {
      result[vertex] = _.intersection(edges, b[vertex]);
      return result;
    }, []);
  }

  function isVertexAchievable(graph, vertex) {
    return !!_.find(graph, _.partial(_.includes, _, vertex));
  }

  function extractComponentWithRoot(graph, root) {
    var component = [],
        explore = [root];

    while (explore.length) {
      let node = explore.pop();
      component[node] = component[node] || graph[node] || [];
      explore = _.concat(explore, graph[node] || []);
      graph[node] = [];
    }

    return component;
  }

  function findRoot(graph, vertex) {
    var isRoot = false,
        isVisited = _.fill(new Array(graph.length), false);

    while (!isRoot) {
      isVisited[vertex] = true;
      let i = 0;
      while (i < graph.length && !_.includes(graph[i], vertex)) i++;
      if (i === graph.length || isVisited[i]) isRoot = true;
      else vertex = i;
    }

    return vertex;
  }

  function makeTreeFromGraph(graph, root) {
    var tree = moea.help.graph.createEmptyGraph(graph.length),
        explore = [root],
        isVisited = _.fill(new Array(graph.length), false);

    while (explore.length) {
      let exploring = explore.pop();
      isVisited[exploring] = true;
      let children = _.filter(graph[exploring], _.negate(_.partial(_.get, isVisited)));
      explore = _.concat(explore, children);
      tree[exploring] = children;
    }

    return tree;
  }

  function reconnectGraphInTree(graph, baseGraph, root, destinations, connectionHeuristic) {
    var g = _.cloneDeep(graph),
        connectedGraph = extractComponentWithRoot(g, root),
        dests = _.shuffle(destinations);

    while (dests.length) {
      let vertex = dests.pop();
      if (!isVertexAchievable(connectedGraph, vertex)) {
        let comp = extractComponentWithRoot(g, findRoot(g, vertex));
        connectionHeuristic(connectedGraph, comp, baseGraph);
      }
    }

    window.last = _.cloneDeep(connectedGraph);
    moea.help.graph.removeCycles(connectedGraph, root);
    return moea.help.graph.pruneTree(makeTreeFromGraph(connectedGraph, root), destinations);
  }

  function crossover(p1, p2, baseGraph, root, destinations, connectionHeuristic) {
    var intersection = getGraphsIntersection(getDirectionLessGraph(p1), getDirectionLessGraph(p2));
    return [reconnectGraphInTree(intersection, baseGraph, root, destinations, connectionHeuristic)];
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.similarityCrossover', {
    crossover: crossover,
    reconnectGraphInTree: reconnectGraphInTree,
    getDirectionLessGraph: getDirectionLessGraph
  });
}());
