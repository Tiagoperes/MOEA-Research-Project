(function () {
  'use strict';

  function MinHeap(vertices) {
    var heap;

    function swap(i, j) {
      var mem = heap[i];
      heap[i] = heap[j];
      heap[j] = mem;
    }

    function verifyHeap(i) {
      var left, right, min;

      i = i || 0;

      left = 2 * i + 1;
      right = 2 * i + 2;
      min = i;

      if (left < heap.length && heap[left].distance < heap[min].distance) {
        min = left;
      }
      if (right < heap.length && heap[right].distance < heap[min].distance) {
        min = right;
      }
      if (min !== i) {
        swap(i, min);
        verifyHeap(min);
      }
    }

    function build() {
      heap = _.clone(vertices);
      for (let i = heap.length - 1; i >= 0; i--) {
        verifyHeap(i);
      }
    }

    function parent(i) {
      return Math.floor((i - 1) / 2);
    }

    this.extract = function () {
      var min = heap[0];
      swap(0, heap.length - 1);
      heap.length--;
      verifyHeap();
      return min;
    };

    this.isEmpty = function () {
      return heap.length === 0;
    };

    this.update = function (vertexLabel) {
      var i = _.findIndex(heap, {label: vertexLabel});
      while (i >= 0) {
        verifyHeap(i);
        i = parent(i);
      }
    };

    build();
  }

  function createVertices(numberOfVertices) {
    var vertices = [];
    for (let i = 0; i < numberOfVertices; i++) {
      vertices[i] = {label: i, distance: Infinity, parent: null};
    }
    return vertices;
  }

  function findMinimumDistances(graph, weights, queue, vertices) {
    while (!queue.isEmpty()) {
      let vertex = queue.extract();
      _.forEach(graph[vertex.label], function (child) {
        var edgeWeight = weights[vertex.label] && weights[vertex.label][child] ? weights[vertex.label][child] : 0,
            cost = vertex.distance + edgeWeight;
        if (vertices[child].distance > cost) {
          vertices[child].distance = cost;
          vertices[child].parent = vertex.label;
          queue.update(child);
        }
      });
    }
  }

  function dijkstra(graph, weights, startingNode) {
    var vertices, queue;

    vertices = createVertices(graph.length);
    vertices[startingNode].distance = 0;
    queue = new MinHeap(vertices);

    findMinimumDistances(graph, weights, queue, vertices);
    return vertices;
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.dijkstra', dijkstra);
}());
