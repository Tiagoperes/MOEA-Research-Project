(function () {
  'use strict';

  function getBranches(tree) {

  }

  function getRandomBranchesFromParents(p1, p2) {

  }

  function mergeBranches(branches) {

  }

  function removeCircles(branches) {

  }

  function makeTreeFromBranches(branches) {
    var graph = mergeBranches(branches);
    return removeCircles(graph);
  }

  function crossover(p1, p2, destinations) {
    var p1Branches = getBranches(p1),
        p2Branches = getBranches(p2),
        childBranches = getRandomBranchesFromParents(p1Branches, p2Branches),
        child = makeTreeFromBranches(childBranches);

    return prune(child, destinations);
  }

  window.moea = window.moea || {};
  _.set(moea, 'help.tree.pathCrossover', {
    crossover: crossover
  });
}());
