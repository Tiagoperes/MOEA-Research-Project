(function () {
  'use strict';

  const MAX_TABLE_CONVERGENCE = 10;

  function createPheromoneTable(weights, size, initialPheromoneValue, initialBetaValue, isAllDominationTable) {
    var table = {weights: weights, values: [], archive: [], convergence: 0, beta: initialBetaValue, multiplier: 1.1, isAllDominationTable: isAllDominationTable};
    for (let i = 0; i < size; i++) {
      table.values[i] = _.fill(new Array(size), initialPheromoneValue);
    }
    return table;
  }

  function createPheromoneTables(numberOfObjectives, numberOfVertices, initialPheromoneValue, initialBetaValue) {
    var tables = [],
        objectives = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      objectives[i] = i;
    }

    for (let i = 2; i <= numberOfObjectives; i++) {
      // tables = _.concat(tables, _.map(_.sampleSize(_.allCombinations(objectives, i), 2), function (objectiveIndexes) {
      tables = _.concat(tables, _.map(_.allCombinations(objectives, i), function (objectiveIndexes) {
        var weights = _.fill(new Array(numberOfObjectives), 0);
        for (let j = 0; j < objectiveIndexes.length; j++) weights[[objectiveIndexes[j]]] = 1;
        return createPheromoneTable(weights, numberOfVertices, initialPheromoneValue, initialBetaValue, i === numberOfObjectives);
      }));
    }

    return tables;
  }

  function getWeightsMean(weights, v, e) {
    return _.sumBy(weights, function (weightMatrix) {
      return weightMatrix[v][e];
    }) / weights.length;
  }

  // function depositPheromonesAccordingToSolutions(pheromones, population, evaporationRate, max, weights) {
  //   _.forEach(population, function (individual) {
  //     _.forEach(individual.solution.getVertices(), function (v) {
  //       _.forEach(individual.solution.getEdges(v), function (e) {
  //         pheromones[v][e] += (1 - getWeightsMean(weights, v, e)) * evaporationRate;
  //         if (pheromones[v][e] > max) pheromones[v][e] = max;
  //       });
  //     });
  //   });
  // }

  function depositPheromonesAccordingToSolutions(pheromones, population, evaporationRate, max, weights) {

    _.forEach(population, function (individual) {
      _.forEach(individual.solution.getVertices(), function (v) {
        _.forEach(individual.solution.getEdges(v), function (e) {
          pheromones[v][e] += (1 - getWeightsMean(weights, v, e)) * evaporationRate;
          if (pheromones[v][e] > max) pheromones[v][e] = max;
        });
      });
    });
  }

  function evaporatePheromonesAccordingToSolutions(pheromones, population, evaporationRate, min, weights) {
    _.forEach(population, function (individual) {
      _.forEach(individual.solution.getVertices(), function (v) {
        _.forEach(individual.solution.getEdges(v), function (e) {
          pheromones[v][e] -= (1 - getWeightsMean(weights, v, e)) * evaporationRate;
          if (pheromones[v][e] < min) pheromones[v][e] = min;
        });
      });
    });
  }

  function removePheromonesAccordingToSolution(pheromones, individual, min) {
    _.forEach(individual.solution.getVertices(), function (v) {
      _.forEach(individual.solution.getEdges(v), function (e) {
        pheromones[v][e] = min;
      });
    });
  }

  function applyWeightMaskToIndividual(individual, weights) {
    var result = [];
    for (let i = 0; i < weights.length; i++) {
      if (weights[i]) result.push(individual.evaluation[i]);
    }
    return result;
  }

  function updateArchives(archiveDiff, pheromoneTables) {
    var added = [];
    var removed = [];
    _.forEach(pheromoneTables, function (table, i) {
      if (table.isAllDominationTable) {
        added[i] = archiveDiff.added;
        removed[i] = archiveDiff.removed;
        return true;
      }
      let newArchive = table.archive;
      _.forEach(archiveDiff.added, function (individual) {
        newArchive = moea.help.pareto.updateNonDominatedSet(newArchive, individual, _.partial(applyWeightMaskToIndividual, _, table.weights));
      });
      if (newArchive !== table.archive) {
        added[i] = _.difference(newArchive, table.archive);
        removed[i] = _.difference(table.archive, newArchive);
        table.archive = newArchive;
      } else {
        added[i] = [];
        removed[i] = [];
      }
    });
    return {added: added, removed: removed};
  }

  function filter(population, randomizationFunction, objectives) {
    var uniq = _.uniqWith(population, function (a, b) {
      return _.isEqual(a.evaluation, b.evaluation);
    });
    return _.concat(uniq, moea.method.ga.generateRandomPopulation(population.length - uniq.length, randomizationFunction, objectives));
  }

  function getGuiders(population, rate) {
    var axis = _.random(population[0].evaluation.length - 1);
    var ordered = _.orderBy(population, function (individual) {
      return individual.evaluation[axis];
    });
    var numberOfGuiders = Math.ceil(rate * population.length);
    var step = Math.floor(population.length / numberOfGuiders);
    var guiders = [];
    for (let i = 0; i < ordered.length; i += step) {
      guiders.push(ordered[i]);
    }
    return guiders;
  }

  function getMostEqual(population) {
    var dimensions = population[0].evaluation.length;

    _.forEach(population, function (ind) {
      ind.difscore = 0;
    });

    for (let i = 0; i < dimensions; i++) {
      let ord = _.orderBy(population, function (ind) {
        return ind.evaluation[i];
      });
      let maxdif = _.last(ord).evaluation[i] - ord[0].evaluation[i];
      if (maxdif === 0) continue;
      for (let j = 1; j < ord.length; j++) {
        ord[j].difscore += (ord[j].evaluation[i] - ord[j-1].evaluation[i]) / maxdif;
      }
    }

    return _.minBy(_.filter(population, 'difscore'), 'difscore');
  }

  function findExtremePoints(archive) {
    let numberOfObjectives = archive[0].evaluation.length;
    let max = _.fill(new Array(numberOfObjectives), -Infinity);
    let min = _.fill(new Array(numberOfObjectives), Infinity);
    _.forEach(archive, function (individual) {
      _.forEach(individual.evaluation, function (value, index) {
        if (value > max[index]) max[index] = value;
        if (value < min[index]) min[index] = value;
      })
    });
    return {min: min, max: max};
  }

  function getIdealPoints(archive, numberOfPoints) {
    let numberOfObjectives = archive[0].evaluation.length;
    let extremes = findExtremePoints(archive);
    let points = [];
    for (let i = 0; i < numberOfPoints; i++) {
      let point = [];
      for (let j = 0; j < numberOfObjectives; j++) {
        point[j] = extremes.min[j] + i * (extremes.max[j] - extremes.min[j]) / (numberOfPoints - 1);
      }
      points.push(point);
    }
    return points;
  }

  function getSdePoint(compare, nonSdePoint) {
    let sde = _.clone(nonSdePoint);
    let maxDif = 0, maxDifIndex;
    for (let i = 0; i < compare.length; i++) {
      let dif = Math.abs(compare[i] - nonSdePoint[i]);
      if (dif > maxDif) {
        maxDif = dif;
        maxDifIndex = i;
      }
    }
    sde[maxDifIndex] = compare[maxDifIndex];
    return sde;
  }

  function findClosestPoint(archive, p) {
    let minDist = Infinity, minDistIndex = 0;
    _.forEach(archive, function (individual, index) {
      let sdeP = getSdePoint(individual.normalizedEvaluation, p);
      let dist = moea.help.distance.getEuclideanDistance(individual.normalizedEvaluation, sdeP);
      if (dist < minDist) {
        minDist = dist;
        minDistIndex = index;
      }
    });
    return archive[minDistIndex];
  }

  function truncate(archive, maxSize) {
    if (archive.length <= maxSize) return archive;

    /*moea.help.normalization.normalize([], archive, moea.help.normalization.initializeExtremes(archive[0].evaluation.length));
    moea.method.spea.distance.calculateDistances(archive, 'normalizedEvaluation', true);
    return moea.method.spea.selection.truncateArchive(archive, maxSize);*/

    // return moea.method.nsga.selection.referencePoint.select([archive], maxSize, 7);

    // let ideal = getIdealPoints(archive, maxSize);
    // return _.map(ideal, function (p) {
    //   let closest = findClosestPoint(archive, p);
    //   _.pull(archive, closest);
    //   return closest;
    // });

    // return _.sample(archive, maxSize);

    moea.help.normalization.normalize([], archive, moea.help.normalization.initializeExtremes(archive[0].evaluation.length));
    let axis = _.random(0, archive[0].evaluation.length - 1);
    let exceeding = archive.length - maxSize;
    let references;
    if (exceeding > 1) {
      let ordered = _.orderBy(archive, function (individual) {
        return individual.evaluation[axis];
      });
      references = [ordered[0]];
      for (let i = 1; i <= exceeding - 2; i++) {
        references.push(ordered[Math.floor(i * (ordered.length - 1) / (exceeding - 1))]);
      }
      references.push(_.last(ordered));
    } else {
      references = [_.sample(archive)];
    }

    _.forEach(references, function (r) {
      let toRemove = findClosestPoint(archive, r.normalizedEvaluation);
      _.pull(archive, toRemove);
    });

    return archive;
  }

  function run(settings) {
    var tableIndex = 5,
        allPheromoneTables = createPheromoneTables(settings.objectives.length, settings.network.graph.size().vertices, 0.1, settings.beta),
        pheromoneTables = _.slice(allPheromoneTables, 0, tableIndex),
        allDominationTable = _.last(allPheromoneTables),
        builder = moea.method.manyAco.build,
        sampleSize = 10,
        betaMultiplier = 1.1,
        archiveConvergence = 0,
        mutationRate = 0,
        archiveConverged = 0;

    for (let i = 0; i < settings.numberOfGenerations; i++) {
      moea.method.ga.logGeneration(i, settings.numberOfGenerations);

      let population = builder.buildSolutions(settings.populationSize, pheromoneTables, settings.heuristicFunctions,
        settings.network.graph, settings.network.root, settings.network.destinations, sampleSize, settings.alpha,
        mutationRate, settings.objectives);

      // population = filter(population, settings.randomize, settings.objectives);

      let prev = allDominationTable.archive;

      if (settings.archiveMaxSize) {
        moea.help.normalization.normalize(allDominationTable.archive, population, moea.help.normalization.initializeExtremes(population[0].evaluation.length));
      }

      _.forEach(population, function (individual) {
        allDominationTable.archive = moea.help.pareto.updateNonDominatedSet(allDominationTable.archive, individual, 'evaluation');
        if (settings.archiveMaxSize && allDominationTable.archive.length > settings.archiveMaxSize) {
          let indexMin, min = Infinity;
          for (let j = 0; j < allDominationTable.archive.length; j++) {
            if (allDominationTable.archive[j] !== individual) {
              // let sde = getSdePoint(allDominationTable.archive[j].normalizedEvaluation, individual.normalizedEvaluation);
              // let dist = moea.help.distance.getEuclideanDistance(allDominationTable.archive[j].normalizedEvaluation, sde);
              let dist = moea.help.distance.getEuclideanDistance(allDominationTable.archive[j].normalizedEvaluation, individual.normalizedEvaluation);
              if (dist < min) {
                min = dist;
                indexMin = j;
              }
            }
          }
          allDominationTable.archive.splice(indexMin, 1);
        }
      });
      // if (settings.archiveMaxSize) {
      //   allDominationTable.archive = truncate(allDominationTable.archive, settings.archiveMaxSize);
      // }
      let archiveDiff = {
        added: _.difference(allDominationTable.archive, prev),
        removed: _.difference(prev, allDominationTable.archive)
      };

      if (archiveDiff.added.length === 0) {
        archiveConverged++;
        // console.log('ARQUIVO CORVERGINDO... ' + tableIndex);
        // if (mutationRate < 0.2) mutationRate += 0.02;
        // archiveConvergence++;
        // mutationRate += 0.01;
        // if (mutationRate > 1) mutationRate = 0;
        // if (archiveConvergence === 5) {
          // mutationRate = 0;
          // archiveConvergence = 0;
          // _.forEach(allPheromoneTables, function (table) {
          //   for (let j = 0; j < table.values.length; j++) {
          //     for (let k = 0; k < table.values.length; k++) {
          //       table.values[j][k] = 0.1;
          //     }
          //   }
          // });
          // var me = getMostEqual(allDominationTable.archive);
          // _.forEach(allPheromoneTables, function (table) {
          //   removePheromonesAccordingToSolution(table.values, me, settings.pheromoneBounds.min);
          // });
          // _.forEach(pheromoneTables, function (table, index) {
          //   table.convergence = 0;
          //   pheromoneTables[index] = allPheromoneTables[tableIndex % allPheromoneTables.length];
          //   tableIndex++;
          // });
          // archive = _.uniqWith(moea.help.pareto.getNonDominatedSet(_.concat(archive, allDominationTable.archive), 'evaluation'), function (a,b) {return _.isEqual(a.evaluation, b.evaluation)});
          // allDominationTable.archive = getGuiders(allDominationTable.archive, 0.1);
          // allPheromoneTables = createPheromoneTables(settings.objectives.length, settings.network.graph.size().vertices, 0.1, 0);
          // tableIndex = 0;
          // pheromoneTables = _.slice(allPheromoneTables, tableIndex, tableIndex + MAX_TABLES);
          // diff = allDominationTable.archive;
          // diff = archive;
        // }
      }

      let diffs = updateArchives(archiveDiff, pheromoneTables);
      _.forEach(pheromoneTables, function (table, index) {
        if (_.isEmpty(diffs.added[index])) {
          table.convergence++;
          table.beta *= table.multiplier;
          table.multiplier += 0.1;
          if (table.convergence > MAX_TABLE_CONVERGENCE) {
            table.convergence = 0;
            // for (let i = 0; i < pheromoneTables[index].values.length; i++) {
            //   pheromoneTables[index].values[i] = _.fill(new Array(pheromoneTables[index].values.length), 0.1);
            // }
            pheromoneTables[index] = allPheromoneTables[tableIndex % allPheromoneTables.length];
            tableIndex++;
          }
        } else {
          table.beta = settings.beta;
          table.multiplier = 1.1;
          depositPheromonesAccordingToSolutions(table.values, diffs.added[index], settings.evaporationRate, settings.pheromoneBounds.max, settings.weights);
          evaporatePheromonesAccordingToSolutions(table.values, diffs.removed[index], settings.evaporationRate, settings.pheromoneBounds.min, settings.weights);
        }
      });
    }

    console.log('number of tables: ' + allPheromoneTables.length);
    console.log('last table analyzed: ' + tableIndex);
    console.log('archive converged ' + archiveConverged + ' times');
    console.log('max exploration array size: ' + window.maxExploreSize);
    return _.map(allDominationTable.archive, 'solution');
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.manyAco.main.execute', run);
}());
