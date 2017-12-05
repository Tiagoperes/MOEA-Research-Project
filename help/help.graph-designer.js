(function () {
  'use strict';

  const DEFAULT_WEIGHTS_TO_SHOW = ['cost', 'delay', 'traffic', 'capacity'];

  function render (paper, vertex) {
    var frame = paper.circle(vertex.point[0], vertex.point[1], 12),
        label = paper.text(vertex.point[0], vertex.point[1], `${vertex.label || vertex.id}`),
        color = '#feb';

    if (vertex.isDestination) color = '#99B3FF';
    if (vertex.isRoot) color = '#99FF99';

    frame.attr({fill: color});
    return paper.set().push(frame, label);
  }

  function getLabel(vertex, edge, weights, weightsToShow) {
    if (!weights) return undefined;
    if (!weightsToShow || weightsToShow.length === 0) {
      weightsToShow = DEFAULT_WEIGHTS_TO_SHOW;
    }
    return _.map(weightsToShow, function (property) {
      return weights[vertex][edge][property];
    }).join(', ');
  }

  function createVertices(draculaGraph, graph, root, destinations) {
    _.forEach(graph.getVertices(), function (vertex) {
      draculaGraph.addNode('' + vertex, {
        isRoot: vertex === root,
        isDestination: _.includes(destinations, vertex),
        render: render
      });
    });
  }

  function createEdges(draculaGraph, graph, weights, weightsToShow) {
    _.forEach(graph.asArray(), function (edges, vertex) {
      _.forEach(edges, function (edge) {
        draculaGraph.addEdge('' + vertex, '' + edge, {
          style: {
            label: getLabel(vertex, edge, weights, weightsToShow),
            directed: true
          }
        });
      });
    });
  }

  function createDraculaGraph(graph, root, destinations, weights, weightsToShow) {
    var draculaGraph = new Dracula.Graph();
    createVertices(draculaGraph, graph, root, destinations);
    createEdges(draculaGraph, graph, weights, weightsToShow);
    return draculaGraph;
  }

  function fillTitle(header, title) {
    title = title || 'Graph ' + (document.getElementsByClassName('graph').length);
    header.innerHTML = title;
  }

  function fillEvaluation(panel, graph, evalData) {
    if (!evalData || graph.hasCycle(evalData.instance.network.root)) {
      panel.style = 'display: none';
      return;
    }
    let items = '<li style="padding: 2px 0"><b>delay max permitido:</b> ' + evalData.instance.network.dmax + '</li><li><b>fluxo:</b> ' + evalData.dataFlow + '</li>';
    _.forEach(evalData.functions, function (f, name) {
      items += '<li style="padding: 2px 0"><b>' + name + ':</b> ' + f(graph, evalData.instance) + '</li>';
    });
    panel.innerHTML += items;
  }

  function createPanel(clear) {
    var panel, header, canvas, evaluation;

    if (clear) document.body.innerHTML = '';

    panel = '<div class="graph-panel" style="display: inline-block; vertical-align: top; border: #ccc 1px solid; margin: 5px">';
    header = '<h4 style="margin: 0; padding: 3px 8px; border-bottom: #ccc 1px solid; font-family: arial"><span style="display:inline-block; vertical-align: middle"></span></h4>';
    canvas = '<div class="graph"></div>';
    evaluation = '<ul style="border-top: 1px solid #ccc;margin: 0;padding: 10px 30px;font-family: arial;font-size: 12px;"></ul>';

    document.body.innerHTML += panel + header + canvas + evaluation + '</div>';

    return {
      panel: _.last(document.getElementsByClassName('graph-panel')),
      header: _.last(document.getElementsByTagName('h4')),
      canvas: _.last(document.getElementsByClassName('graph')),
      evaluation: _.last(document.getElementsByTagName('ul'))
    };
  }

  function draw(graph, root, destinations, weights, weightsToShow, evalData, title, clear) {
    var g = createDraculaGraph(graph, root, destinations, weights, weightsToShow),
        panel = createPanel(clear),
        layouter = new Dracula.Layout.Spring(g),
        renderer = new Dracula.Renderer.Raphael(panel.canvas, g, 400, 400);

    fillTitle(panel.header, title);
    fillEvaluation(panel.evaluation, graph, evalData);

    layouter.layout();
    renderer.draw();
  }

  function drawWithInstance(graph, problem, network, showWeights, weightsToShow, evalData, title, clear) {
    var instance = moea.problem.prm.main.getInstance(problem, network),
        weights = showWeights ? instance.network.weights : undefined;

    draw(graph, instance.network.root, instance.network.destinations, weights, weightsToShow, evalData, title, clear);
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.graphDesigner', {
    draw: draw,
    drawWithInstance: drawWithInstance
  });

}());
