(function () {
  'use strict';

  function Graph(input) {
    var self = this,
        data;

    function createEmptyGraph(numberOfVertices) {
      var g = [];
      numberOfVertices = numberOfVertices || 0;
      for (let i = 0; i < numberOfVertices; i++) {
        g[i] = [];
      }
      return g;
    }

    function initialize () {
      data = typeof input === 'object' ? input : createEmptyGraph(input);
    }

    function isLeaf(node) {
      return data[node] && data[node].length === 0;
    }

    function getNonDestinationLeafs(destinations) {
      return _.reduce(data, function (result, edges, node) {
        if (isLeaf(node) && !_.includes(destinations, node)) result.push(node);
        return result;
      }, []);
    }

    function findParent(node) {
      return _.findIndex(data, function (edges) {
        return _.includes(edges, node);
      });
    }

    function findVertexRoot(vertex) {
      var isRoot = false,
          isVisited = _.fill(new Array(data.length), false);

      while (!isRoot) {
        isVisited[vertex] = true;
        let i = 0;
        while (i < data.length && !_.includes(data[i], vertex)) i++;
        if (i === data.length || isVisited[i]) isRoot = true;
        else vertex = i;
      }

      return vertex;
    }

    this.asArray = function () {
      return data;
    };

    this.clone = function () {
      return new Graph(_.cloneDeep(data));
    };

    this.getVertices = function () {
      return _.reduce(data, function (result, edges, vertex) {
        if (edges) result.push(vertex);
        return result;
      }, []);
    };

    this.getVerticesWithChildren = function () {
      return _.reduce(data, function (result, edges, vertex) {
        if (edges && edges.length) result.push(vertex);
        return result;
      }, []);
    };

    this.getEdges = function (vertex) {
      return data[vertex];
    };

    this.size = function () {
      return {
        vertices: data.length,
        edges: _.sumBy(data, 'length')
      };
    };

    this.createVertex = function (vertex) {
      vertex = vertex === undefined ? data.length : vertex;
      data[vertex] = data[vertex] || [];
      return vertex;
    };

    this.removeVertex = function (vertexToRemove) {
      _.forEach(data, function (edges) {
        var index = _.indexOf(edges, vertexToRemove);
        if (index !== -1) edges.splice(index, 1);
      });
      delete data[vertexToRemove];
    };

    this.hasEdge = function (vertexA, vertexB) {
      return _.includes(data[vertexA], vertexB);
    };

    this.hasVertex = function (vertex) {
      return !!data[vertex];
    };

    this.setEdges = function (vertex, edges) {
      data[vertex] = edges;
    };

    this.createEdge = function (vertexA, vertexB) {
      if (!self.hasEdge(vertexA, vertexB)) {
        self.createVertex(vertexA);
        self.createVertex(vertexB);
        data[vertexA].push(vertexB);
      }
    };

    this.createPath = function (path) {
      for (let i = 1; i < path.length; i++) {
        self.createEdge(path[i - 1], path[i]);
      }
    };

    this.removeEdge = function (vertexA, vertexB) {
      _.pull(data[vertexA], vertexB);
    };

    this.removeCycles = function (root) {
      var isVisible = _.fill(new Array(data.length), false),
          explore = [root];

      isVisible[root] = true;

      while (explore.length) {
        let node = explore.pop();
        let edges = [];
        _.forEach(data[node], function (child) {
          if (!isVisible[child]) {
            explore.push(child);
            edges.push(child);
            isVisible[child] = true;
          }
        });
        data[node] = edges;
      }
    };

    this.makeDirectionless = function () {
      _.forEach(data, function (edges, vertex) {
        _.forEach(edges, _.partial(self.createEdge, _, vertex));
      });
      return self;
    };

    this.intersection = function (graph) {
      return new Graph(_.reduce(data, function(result, edges, vertex) {
        result[vertex] = _.intersection(edges, graph.getEdges(vertex));
        return result;
      }, []));
    };
    
    this.merge = function (graphToMerge) {
      var dataToMerge = graphToMerge.asArray();
      _.forEach(dataToMerge, function (edges, vertex) {
        _.forEach(edges, _.partial(self.createEdge, vertex));
      });
    };

    this.removeComponentWithVertex = function (vertex) {
      var component = new Graph(),
          compArray = component.asArray(),
          root = findVertexRoot(vertex),
          explore = [root];

      while (explore.length) {
        let node = explore.pop();
        compArray[node] = compArray[node] || data[node] || [];
        explore = _.concat(explore, data[node] || []);
        data[node] = [];
      }

      return component;
    };
    
    this.getAchievableVertices = function (root) {
      var explore = [root],
          visited = _.fill(new Array(data.length), false),
          vertices = [];

      while(explore.length) {
        let node = explore.pop();
        visited[node] = true;
        vertices.push(node);
        explore = _.concat(explore, _.filter(data[node], _.negate(_.partial(_.get, visited))));
      }

      return vertices;
    };
    
    this.hasCycle = function (root) {
      var explore = [root],
          visited = _.fill(new Array(data.length), false);

      if (root === undefined) {
        throw Error('A root must be provided for cycle verification.');
      }

      while(explore.length) {
        let node = explore.pop();
        if (visited[node]) return true;
        visited[node] = true;
        explore = _.concat(explore, data[node]);
      }
    };
    
    this.prune = function (root, destinations) {
      var nonDestinationLeafs;

      if (self.hasCycle(root)) {
        throw new Error('Can\'t prune something that is not a tree. Please, remove the cycles.');
      }

      nonDestinationLeafs = getNonDestinationLeafs(destinations);
      while (nonDestinationLeafs.length) {
        let leaf = nonDestinationLeafs.pop();
        let parent = findParent(leaf);
        if (parent !== -1) {
          self.removeVertex(leaf);
          if (isLeaf(parent) && !_.includes(destinations, parent)) nonDestinationLeafs.push(parent);
        }
      }
    };

    this.getBranches = function (root, destinations, parents, branches) {
      var explore;

      if (self.hasCycle(root)) {
        throw new Error('Can\'t get branches of something that is not a tree. Please, remove the cycles.');
      }

      explore = data[root];
      parents = parents ? _.concat(parents, [root]) : [root];
      branches = branches || {};

      _.forEach(explore, function (node) {
        if (_.includes(destinations, node)) branches[node] = _.concat(parents, [node]);
        self.getBranches(node, destinations, parents, branches);
      });

      return branches;
    };

    initialize();
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.Graph', Graph);

}());
