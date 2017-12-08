/* Adapted from yyxhdy-ManyEAs github project: https://github.com/yyxhdy/ManyEAs */
(function () {
  'use strict';

  function createVectors(div1, div2, m) {
    let n1 = 0,
        n2 = 0,
        mid = 1 / m,
        lambda = [],
        z1, z2;

    if (div1 !== 0) n1 = getCombin(m + div1 - 1, div1);
    if (div2 !== 0) n2 = getCombin(m + div2 - 1, div2);

    if (n1 !== 0) z1 = generateWeightVector(n1, div1, m);
    if (n2 !== 0) z2 = generateWeightVector(n2, div2, m);

    for (let i = 0; i < n2; i++){
      for (let j = 0; j < m; j++){
        z2[i][j] = (z2[i][j] + mid) / 2;
      }
    }

    for (let i = 0; i < n1; i++){
      lambda[i] = [];
      for (let j = 0; j < m; j++)
      lambda[i][j] = z1[i][j];
    }

    for (let i = 0; i < n2; i++){
      for (let j = 0; j < m; j++)
      lambda[i + n1][j] = z2[i][j];
    }

    return lambda;
  }


  function getCombin(n, m) {
    if (m === 0) return 1;
    if (m > n / 2) m = n - m;
    let res = 1;
    for (let k = 1; k <= m; k++) res = (n - k + 1) * res / k;
    return res;
  }


  function generateWeightVector(n, divisions, m) {
    let tr = [];
    let z = [];

    for (let i = 0; i < n; i++) {
      z[i] = _.fill(new Array(m), 0);
    }

    traverse(z, tr, m, 0, divisions);

    for (let i = 0; i < z.length; i++) {
      for (let j = 0; j < z[i].length; j++) {
        z[i][j] = z[i][j] / divisions;
      }
    }

    return z;
  }

  function traverse(z, tr, m, i, divisions, gn) {
    gn = gn || 0;

    if (i === (m - 1)) {
      tr[i] = divisions;
      for (let k = 0; k < m; k++) {
        z[gn][k] = tr[k];
      }
      return gn + 1;
    }

    for (let k = 0; k <= divisions; k++) {
      tr[i] = k;
      gn = traverse(z, tr, m, i + 1, divisions - k, gn);
    }

    return gn;
  }

  window.moea = window.moea || {};
  _.set(moea, 'method.nsga.vectorGenerator.createVectors', createVectors);
}());
