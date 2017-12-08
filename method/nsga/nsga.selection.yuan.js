(function () {
  'use strict';

  // SolutionSet population;
  // SolutionSet lastFront;
  // SolutionSet mgPopulation;
  //
  // SolutionSet union;
  //
  // int obj;
  // int remain;
  //
  // boolean normalization;
  //
  // double[][] lambda;
  //
  // double[] zideal;
  //
  // double[] zmax;
  //
  // double[][] extremePoints;
  //
  // double[] intercepts;


  function computeIdealPoint(mgPopulation, numberOfObjectives) {
    let zideal = [];
    for (let j = 0; j < numberOfObjectives; j++) {
      zideal[j] = Infinity;
      for (let i = 0; i < mgPopulation.length; i++) {
        if (mgPopulation[i].evaluation[j] < zideal[j]) {
          zideal[j] = mgPopulation[i].evaluation[j];
        }
      }
    }
    return zideal;
  }

  function computeMaxPoint(mgPopulation, numberOfObjectives) {
    let zmax = [];
    for (let j = 0; j < numberOfObjectives; j++) {
      zmax[j] = -Infinity;
      for (let i = 0; i < mgPopulation.length; i++) {
        if (mgPopulation[i].evaluation[j] > zmax[j]) {
          zmax[j] = mgPopulation[i].evaluation[j];
        }
      }
    }
    return zmax;
  }

  function asfFunction(sol, j, zideal) {
    let max = -Infinity;
    const EPSILON = 1.0E-6;

    for (let i = 0; i < sol.evaluation.length; i++) {
      let val = Math.abs(sol.evaluation[i] - zideal[i]);

      if (j !== i) val = val / EPSILON;
      if (val > max) max = val;
    }

    return max;
  }

  function computeExtremePoints(mgPopulation, zideal, numberOfObjectives) {
    let extremePoints = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      extremePoints[i] = [];
    }

    for (let j = 0; j < numberOfObjectives; j++) {
      let index = -1;
      let min = Infinity;

      for (let i = 0; i < mgPopulation.length; i++) {
        let asfValue = asfFunction(mgPopulation[i], j, zideal);
        if (asfValue < min) {
          min = asfValue;
          index = i;
        }
      }

      for (let k = 0; k < numberOfObjectives; k++) {
        extremePoints[j][k] = mgPopulation[index].evaluation[k];
      }
    }

    return extremePoints;
  }

  function computeIntercepts(extremePoints, zideal, zmax, numberOfObjectives) {
    let intercepts = [];
    let temp = [];

    for (let i = 0; i < numberOfObjectives; i++) {
      temp[i] = [];
      for (let j = 0; j < numberOfObjectives; j++) {
        temp[i][j] = extremePoints[i][j] - zideal[j];
      }
    }

    let EX = new Matrix(temp);

    if (EX.rank() === EX.getRowDimension()) {
      let u = [];
      for (let j = 0; j < numberOfObjectives; j++) u[j] = 1;
      let UM = new Matrix(u, numberOfObjectives);
      let AL = EX.inverse().times(UM);

      let j;
      for (j = 0; j < numberOfObjectives; j++) {
        let aj = 1.0 / AL.get(j, 0) + zideal[j];
        if ((aj > zideal[j]) && (isFinite(aj)) && (!isNaN(aj))) intercepts[j] = aj;
        else break;
      }
      if (j !== numberOfObjectives) {
        for (let k = 0; k < numberOfObjectives; k++) intercepts[k] = zmax[k];
      }
    } else {
      for (let k = 0; k < numberOfObjectives; k++) intercepts[k] = zmax[k];
    }

    return intercepts;
  }

  function normalizePopulation(mgPopulation, zideal, intercepts, numberOfObjectives) {
    for (let i = 0; i < mgPopulation.length; i++) {
      let sol = mgPopulation[i];
      sol.normalized = [];

      for (let j = 0; j < numberOfObjectives; j++) {
        sol.normalized[j] = (sol.evaluation[j] - zideal[j]) / (intercepts[j] - zideal[j]);
      }
    }
  }

  function calNormlizedVDistance(sol, ref) {
    let ip = 0;
    let refLenSQ = 0;

    for (let j = 0; j < sol.evaluation.length; j++) {
      ip += sol.normalized[j] * ref[j];
      refLenSQ += (ref[j] * ref[j]);
    }
    refLenSQ = Math.sqrt(refLenSQ);

    let d1 = Math.abs(ip) / refLenSQ;

    let d2 = 0;
    for (let i = 0; i < sol.evaluation.length; i++) {
      d2 += (sol.normalized[i] - d1 * (ref[i] / refLenSQ)) * (sol.normalized[i] - d1 * (ref[i] / refLenSQ));
    }
    d2 = Math.sqrt(d2);

    return d2;
  }


  function calUnNormalizedVDistance(sol, ref, zideal) {
    let d1 = 0, d2 = 0, nl = 0;

    for (let i = 0; i < sol.evaluation.length; i++) {
      d1 += (sol.evaluation[i] - zideal[i]) * ref[i];
      nl += (ref[i] * ref[i]);
    }
    nl = Math.sqrt(nl);
    d1 = Math.abs(d1) / nl;

    for (let i = 0; i < sol.evaluation.length; i++) {
      d2 += ((sol.evaluation[i] - zideal[i]) - d1
        * (ref[i] / nl)) * ((sol.evaluation[i] - zideal[i]) - d1
        * (ref[i] / nl));
    }
    d2 = Math.sqrt(d2);

    return d2;
  }

  function calVDistance(sol, ref, normalization, zideal){
    if (normalization) return calNormlizedVDistance(sol, ref);
    else return calUnNormalizedVDistance(sol, ref, zideal);
  }

  function associate(mgPopulation, lambda, normalization, zideal) {
    for (let k = 0; k < mgPopulation.length; k++) {
      let sol = mgPopulation[k];

      let min = calVDistance(sol, lambda[0], normalization, zideal);
      let index = 0;

      for (let j = 1; j < lambda.length; j++) {
        let dist = calVDistance(sol, lambda[j], normalization, zideal);
        if (dist < min) {
          min = dist;
          index = j;
        }
      }
      sol.clusterId = index;
      sol.vDistance = min;
    }
  }

  function createPermutation(length) {
    let aux = _.fill(new Array(length), 0);
    let result = _.fill(new Array(length), 0);

    // First, create an array from 0 to length - 1. We call them result
    // Also is needed to create an random array of size length
    for (let i = 0; i < length; i++) {
      result[i] = i;
      aux[i] = _.random(length - 1);
    }

    // Sort the random array with effect in result, and then we obtain a
    // permutation array between 0 and length - 1
    for (let i = 0; i < length; i++) {
      for (let j = i + 1; j < length; j++) {
        if (aux[i] > aux[j]) {
          let tmp = aux[i];
          aux[i] = aux[j];
          aux[j] = tmp;
          tmp = result[i];
          result[i] = result[j];
          result[j] = tmp;
        }
      }
    }

    return result;
  }

  function assignment(population, lambda, remain, lastFront) {
    let ro = _.fill(new Array(lambda.length), 0);
    let flag = [];

    for (let k = 0; k < population.length; k++) {
      ro[population[k].clusterId]++;
    }

    let num = 0;

    while (num < remain) {
      let perm = createPermutation(ro.length);
      let min = Infinity;
      let id = -1;

      for (let i = 0; i < perm.length; i++) {
        if ((!flag[perm[i]]) && (ro[perm[i]] < min)) {
          min = ro[perm[i]];
          id = perm[i];
        }
      }

      let list = [];

      for (let k = 0; k < lastFront.length; k++) {
        if (lastFront[k].clusterId === id) list.push(k);
      }

      if (list.length !== 0) {
        let index = 0;
        if (ro[id] === 0) {
          let minDist = Infinity;

          for (let j = 0; j < list.length; j++) {
            if (lastFront[list[j]].vDistance < minDist) {
              minDist = lastFront[list[j]].vDistance;
              index = j;
            }
          }
        } else {
          index = _.random(list.length - 1);
        }

        population.push(lastFront[list[index]]);
        ro[id]++;

        lastFront.splice(list[index], 1);
        num++;
      } else {
        flag[id] = true;
      }
    }
  }

  function niching (population, lastFront, lambda, remain, numberOfObjectives, normalization) {
    let mgPopulation = _.concat(population, lastFront);
    let zideal = computeIdealPoint(mgPopulation, numberOfObjectives);
    if (normalization){
      let zmax = computeMaxPoint(mgPopulation, numberOfObjectives);
      let extremePoints = computeExtremePoints(mgPopulation, zideal, numberOfObjectives);
      let intercepts = computeIntercepts(extremePoints, zideal, zmax, numberOfObjectives);
      normalizePopulation(mgPopulation, zideal, intercepts, numberOfObjectives);
    }
    associate(mgPopulation, lambda, normalization, zideal);
    assignment(population, lambda, remain, lastFront);
  }

  function naturalSelection(fronts, maxPopulationSize, lambda, normalization) {
    let population = [];
    let frontsToCheck = fronts;
    while (population.length < maxPopulationSize) {
      let front = _.head(frontsToCheck);
      if (population.length + front.length <= maxPopulationSize) {
        population = _.concat(population, front);
        frontsToCheck = _.tail(frontsToCheck);
      } else {
        niching(population, front, lambda, maxPopulationSize - population.length, front[0].evaluation.length, normalization);
      }
    }
    return population;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.nsga.selection.yuan.select', naturalSelection);
}());
