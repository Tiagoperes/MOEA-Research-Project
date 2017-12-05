(function () {
  'use strict';

  function branchAsStr(branch, choices) {
    return _.reduce(branch, function (str, path, destination) {
      var attrs = choices[destination] === path ? ' style = "color: blue"' : '';
      return str + '<span' + attrs + '><b>' + destination + ':</b> ' + path.join(', ') + '</span><br>';
    }, '');
  }

  function crossover(a, b, root, destinations) {
    var branchesA = a.getBranches(root, destinations),
      branchesB = b.getBranches(root, destinations),
      graph = new moea.help.Graph();

    if (window.debugCross) {
      moea.help.graphDesigner.draw(a, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'P1');
      moea.help.graphDesigner.draw(b, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'P2');
    }

    var choices = {};

    _.forEach(destinations, function (dest) {
      var possibilities = [];
      possibilities.push(branchesA[dest]);
      possibilities.push(branchesB[dest]);
      choices[dest] = _.sample(possibilities);
      graph.createPath(choices[dest]);
    });

    if (window.debugCross) {
      document.body.innerHTML += '<p><b>BRANCHES P1:</b><br>' + branchAsStr(branchesA, choices) + '</p>';
      document.body.innerHTML += '<p><b>BRANCHES P2:</b><br>' + branchAsStr(branchesB, choices) + '</p>';
      moea.help.graphDesigner.draw(graph, root, destinations, window.debugWeightMatrix, window.debugWeights, null, 'Full child');
    }

    graph.removeCycles(root);
    if (window.debugCross) moea.help.graphDesigner.draw(graph, root, destinations, window.debugWeightMatrix, window.debugWeights, null, 'Cycleless child');
    graph.prune(root, destinations);
    if (window.debugCross) {
      moea.help.graphDesigner.draw(graph, root, destinations, window.debugWeightMatrix, window.debugWeights, window.evalData, 'Pruned child');
      document.body.innerHTML += '<hr>';
    }
    return [graph];
  }

  function moveParticle(personalBest, localBest, globalBest, w, c1, c2, root, destinations) {
    var branchesPersonal = personalBest.getBranches(root, destinations),
        branchesLocal = localBest.getBranches(root, destinations),
        branchesGlobal = globalBest.getBranches(root, destinations),
        branches = [branchesPersonal, branchesLocal, branchesGlobal],
        quantities = _.map([w * destinations.length, c1 * destinations.length, c2 * destinations.length], Math.round),
        graph = new moea.help.Graph(),
        overflow = destinations.length - _.sum(quantities);

    quantities[_.random(0, 2)] += overflow;

    _.forEach(destinations, function (dest) {
      var options = [], branch;
      for (let i = 0; i < quantities.length; i++) {if (quantities[i]) options.push(i)}
      branch = _.sample(options);
      graph.createPath(branches[branch][dest]);
      quantities[branch]--;
    });

    graph.removeCycles(root);
    graph.prune(root, destinations);
    return graph;
  }

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.recombination.pathCrossover', {
    crossover: crossover,
    moveParticle: moveParticle
  });
}());
