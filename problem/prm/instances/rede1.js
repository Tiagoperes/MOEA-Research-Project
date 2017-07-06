(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.prm.instances.rede1', {
    "graph": [[1, 2, 10], [0, 3, 4, 9], [0, 5, 6], [1, 7], [1, 7, 8], [2, 6, 7], [2, 5, 7], [3, 4, 5, 6, 15], [4, 12], [1, 11], [0, 11], [9, 10, 13], [8, 13], [11, 12, 14, 15], [13, 17], [7, 13, 16], [15, 17], [14, 16]],
    "weights": [[null, {"cost": 10, "delay": 2, "capacity": 1432, "traffic": 42}, {
      "cost": 20,
      "delay": 1,
      "capacity": 1449,
      "traffic": 323
    }, null, null, null, null, null, null, null, {
      "cost": 6,
      "delay": 4,
      "capacity": 1194,
      "traffic": 132
    }, null, null, null, null, null, null, null], [{
      "cost": 10,
      "delay": 2,
      "capacity": 1432,
      "traffic": 42
    }, null, null, {"cost": 4, "delay": 1, "capacity": 1417, "traffic": 410}, {
      "cost": 1,
      "delay": 3,
      "capacity": 1090,
      "traffic": 195
    }, null, null, null, null, {
      "cost": 12,
      "delay": 9,
      "capacity": 1295,
      "traffic": 236
    }, null, null, null, null, null, null, null, null], [{
      "cost": 20,
      "delay": 1,
      "capacity": 1449,
      "traffic": 323
    }, null, null, null, null, {"cost": 13, "delay": 4, "capacity": 1420, "traffic": 491}, {
      "cost": 20,
      "delay": 1,
      "capacity": 1427,
      "traffic": 319
    }, null, null, null, null, null, null, null, null, null, null, null], [null, {
      "cost": 4,
      "delay": 1,
      "capacity": 1417,
      "traffic": 410
    }, null, null, null, null, null, {
      "cost": 20,
      "delay": 1,
      "capacity": 1154,
      "traffic": 396
    }, null, null, null, null, null, null, null, null, null, null], [null, {
      "cost": 1,
      "delay": 3,
      "capacity": 1090,
      "traffic": 195
    }, null, null, null, null, null, {"cost": 2, "delay": 3, "capacity": 1180, "traffic": 388}, {
      "cost": 21,
      "delay": 2,
      "capacity": 1357,
      "traffic": 180
    }, null, null, null, null, null, null, null, null, null], [null, null, {
      "cost": 13,
      "delay": 4,
      "capacity": 1420,
      "traffic": 491
    }, null, null, null, {"cost": 9, "delay": 1, "capacity": 1016, "traffic": 243}, {
      "cost": 19,
      "delay": 1,
      "capacity": 1374,
      "traffic": 367
    }, null, null, null, null, null, null, null, null, null, null], [null, null, {
      "cost": 20,
      "delay": 1,
      "capacity": 1427,
      "traffic": 319
    }, null, null, {"cost": 9, "delay": 1, "capacity": 1016, "traffic": 243}, null, {
      "cost": 12,
      "delay": 4,
      "capacity": 1265,
      "traffic": 147
    }, null, null, null, null, null, null, null, null, null, null], [null, null, null, {
      "cost": 20,
      "delay": 1,
      "capacity": 1154,
      "traffic": 396
    }, {"cost": 2, "delay": 3, "capacity": 1180, "traffic": 388}, {
      "cost": 19,
      "delay": 1,
      "capacity": 1374,
      "traffic": 367
    }, {
      "cost": 12,
      "delay": 4,
      "capacity": 1265,
      "traffic": 147
    }, null, null, null, null, null, null, null, null, {
      "cost": 14,
      "delay": 2,
      "capacity": 1090,
      "traffic": 498
    }, null, null], [null, null, null, null, {
      "cost": 21,
      "delay": 2,
      "capacity": 1357,
      "traffic": 180
    }, null, null, null, null, null, null, null, {
      "cost": 10,
      "delay": 2,
      "capacity": 1335,
      "traffic": 499
    }, null, null, null, null, null], [null, {
      "cost": 12,
      "delay": 9,
      "capacity": 1295,
      "traffic": 236
    }, null, null, null, null, null, null, null, null, null, {
      "cost": 30,
      "delay": 1,
      "capacity": 1278,
      "traffic": 476
    }, null, null, null, null, null, null], [{
      "cost": 6,
      "delay": 4,
      "capacity": 1194,
      "traffic": 132
    }, null, null, null, null, null, null, null, null, null, null, {
      "cost": 23,
      "delay": 1,
      "capacity": 1340,
      "traffic": 147
    }, null, null, null, null, null, null], [null, null, null, null, null, null, null, null, null, {
      "cost": 30,
      "delay": 1,
      "capacity": 1278,
      "traffic": 476
    }, {"cost": 23, "delay": 1, "capacity": 1340, "traffic": 147}, null, null, {
      "cost": 6,
      "delay": 9,
      "capacity": 1104,
      "traffic": 227
    }, null, null, null, null], [null, null, null, null, null, null, null, null, {
      "cost": 10,
      "delay": 2,
      "capacity": 1335,
      "traffic": 499
    }, null, null, null, null, {
      "cost": 4,
      "delay": 1,
      "capacity": 1217,
      "traffic": 360
    }, null, null, null, null], [null, null, null, null, null, null, null, null, null, null, null, {
      "cost": 6,
      "delay": 9,
      "capacity": 1104,
      "traffic": 227
    }, {"cost": 4, "delay": 1, "capacity": 1217, "traffic": 360}, null, {
      "cost": 34,
      "delay": 2,
      "capacity": 1042,
      "traffic": 346
    }, {
      "cost": 21,
      "delay": 1,
      "capacity": 1099,
      "traffic": 91
    }, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, {
      "cost": 34,
      "delay": 2,
      "capacity": 1042,
      "traffic": 346
    }, null, null, null, {
      "cost": 5,
      "delay": 3,
      "capacity": 1318,
      "traffic": 220
    }], [null, null, null, null, null, null, null, {
      "cost": 14,
      "delay": 2,
      "capacity": 1090,
      "traffic": 498
    }, null, null, null, null, null, {"cost": 21, "delay": 1, "capacity": 1099, "traffic": 91}, null, null, {
      "cost": 1,
      "delay": 1,
      "capacity": 1376,
      "traffic": 412
    }, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, {
      "cost": 1,
      "delay": 1,
      "capacity": 1376,
      "traffic": 412
    }, null, {
      "cost": 4,
      "delay": 1,
      "capacity": 1497,
      "traffic": 27
    }], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, {
      "cost": 5,
      "delay": 3,
      "capacity": 1318,
      "traffic": 220
    }, null, {"cost": 4, "delay": 1, "capacity": 1497, "traffic": 27}, null]],
    "root": 0,
    "destinations": [6, 10, 13, 15, 17],
    "dmax": 8
  });

}());
