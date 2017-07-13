(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.instances.rede0', {
    "graph": [[1, 2, 3], [0, 4], [0, 4, 5, 6], [0, 7, 8], [1, 2, 9], [2, 9, 10], [2, 10], [3, 8, 10], [3, 7, 10], [4, 5, 11, 12], [5, 6, 7, 8, 12], [9, 13], [9, 10, 14], [11, 14], [12, 13]],
    "weights": [[null, {"cost": 7, "delay": 6, "capacity": 1432, "traffic": 42}, {
      "cost": 11,
      "delay": 4,
      "capacity": 1449,
      "traffic": 323
    }, {
      "cost": 21,
      "delay": 3,
      "capacity": 1194,
      "traffic": 132
    }, null, null, null, null, null, null, null, null, null, null, null], [{
      "cost": 7,
      "delay": 6,
      "capacity": 1432,
      "traffic": 42
    }, null, null, null, {
      "cost": 24,
      "delay": 3,
      "capacity": 1417,
      "traffic": 410
    }, null, null, null, null, null, null, null, null, null, null], [{
      "cost": 11,
      "delay": 4,
      "capacity": 1449,
      "traffic": 323
    }, null, null, null, {"cost": 4, "delay": 4, "capacity": 1295, "traffic": 236}, {
      "cost": 2,
      "delay": 5,
      "capacity": 1492,
      "traffic": 443
    }, {
      "cost": 5,
      "delay": 3,
      "capacity": 1420,
      "traffic": 491
    }, null, null, null, null, null, null, null, null], [{
      "cost": 21,
      "delay": 3,
      "capacity": 1194,
      "traffic": 132
    }, null, null, null, null, null, null, {"cost": 14, "delay": 6, "capacity": 1076, "traffic": 328}, {
      "cost": 21,
      "delay": 3,
      "capacity": 1154,
      "traffic": 396
    }, null, null, null, null, null, null], [null, {
      "cost": 24,
      "delay": 3,
      "capacity": 1417,
      "traffic": 410
    }, {"cost": 4, "delay": 4, "capacity": 1295, "traffic": 236}, null, null, null, null, null, null, {
      "cost": 7,
      "delay": 11,
      "capacity": 1357,
      "traffic": 180
    }, null, null, null, null, null], [null, null, {
      "cost": 2,
      "delay": 5,
      "capacity": 1492,
      "traffic": 443
    }, null, null, null, null, null, null, {"cost": 38, "delay": 1, "capacity": 1016, "traffic": 243}, {
      "cost": 3,
      "delay": 5,
      "capacity": 1374,
      "traffic": 367
    }, null, null, null, null], [null, null, {
      "cost": 5,
      "delay": 3,
      "capacity": 1420,
      "traffic": 491
    }, null, null, null, null, null, null, null, {
      "cost": 21,
      "delay": 3,
      "capacity": 1376,
      "traffic": 2
    }, null, null, null, null], [null, null, null, {
      "cost": 14,
      "delay": 6,
      "capacity": 1076,
      "traffic": 328
    }, null, null, null, null, {"cost": 10, "delay": 2, "capacity": 1274, "traffic": 261}, null, {
      "cost": 20,
      "delay": 3,
      "capacity": 1156,
      "traffic": 139
    }, null, null, null, null], [null, null, null, {
      "cost": 21,
      "delay": 3,
      "capacity": 1154,
      "traffic": 396
    }, null, null, null, {"cost": 10, "delay": 2, "capacity": 1274, "traffic": 261}, null, null, {
      "cost": 13,
      "delay": 1,
      "capacity": 1090,
      "traffic": 498
    }, null, null, null, null], [null, null, null, null, {
      "cost": 7,
      "delay": 11,
      "capacity": 1357,
      "traffic": 180
    }, {"cost": 38, "delay": 1, "capacity": 1016, "traffic": 243}, null, null, null, null, null, {
      "cost": 35,
      "delay": 4,
      "capacity": 1223,
      "traffic": 207
    }, {
      "cost": 22,
      "delay": 3,
      "capacity": 1278,
      "traffic": 476
    }, null, null], [null, null, null, null, null, {
      "cost": 3,
      "delay": 5,
      "capacity": 1374,
      "traffic": 367
    }, {"cost": 21, "delay": 3, "capacity": 1376, "traffic": 2}, {
      "cost": 20,
      "delay": 3,
      "capacity": 1156,
      "traffic": 139
    }, {"cost": 13, "delay": 1, "capacity": 1090, "traffic": 498}, null, null, null, {
      "cost": 15,
      "delay": 4,
      "capacity": 1104,
      "traffic": 227
    }, null, null], [null, null, null, null, null, null, null, null, null, {
      "cost": 35,
      "delay": 4,
      "capacity": 1223,
      "traffic": 207
    }, null, null, null, {
      "cost": 6,
      "delay": 4,
      "capacity": 1217,
      "traffic": 360
    }, null], [null, null, null, null, null, null, null, null, null, {
      "cost": 22,
      "delay": 3,
      "capacity": 1278,
      "traffic": 476
    }, {"cost": 15, "delay": 4, "capacity": 1104, "traffic": 227}, null, null, null, {
      "cost": 2,
      "delay": 3,
      "capacity": 1042,
      "traffic": 346
    }], [null, null, null, null, null, null, null, null, null, null, null, {
      "cost": 6,
      "delay": 4,
      "capacity": 1217,
      "traffic": 360
    }, null, null, {
      "cost": 5,
      "delay": 3,
      "capacity": 1416,
      "traffic": 37
    }], [null, null, null, null, null, null, null, null, null, null, null, null, {
      "cost": 2,
      "delay": 3,
      "capacity": 1042,
      "traffic": 346
    }, {"cost": 5, "delay": 3, "capacity": 1416, "traffic": 37}, null]],
    "root": 0,
    "destinations": [1, 8, 9, 12, 13],
    "dmax": 18
  });

}());
