(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj2Itm100', {
    "objectives": 2,
    "items": 100,
    "capacity": 28706,
    "profitMatrix": [[441, 88, 499, 240, 238, 803, 426, 111, 408, 185, 830, 281, 901, 919, 971, 226, 910, 583, 793, 178, 739, 744, 375, 371, 852, 209, 344, 32, 805, 48, 345, 483, 136, 378, 642, 553, 768, 501, 717, 217, 826, 183, 264, 461, 760, 260, 163, 556, 503, 547, 835, 48, 630, 151, 545, 854, 220, 291, 629, 639, 965, 272, 578, 511, 623, 448, 887, 924, 356, 96, 510, 22, 816, 108, 130, 759, 221, 995, 797, 759, 963, 175, 937, 467, 101, 442, 423, 777, 495, 38, 702, 763, 681, 262, 286, 691, 180, 253, 216, 496], [552, 146, 226, 147, 780, 481, 855, 493, 701, 816, 205, 620, 578, 491, 274, 407, 64, 538, 623, 471, 89, 523, 814, 180, 102, 591, 492, 829, 909, 794, 377, 871, 917, 345, 515, 44, 923, 120, 944, 757, 834, 888, 625, 782, 501, 500, 898, 198, 853, 705, 174, 817, 235, 549, 859, 526, 559, 305, 53, 912, 573, 451, 233, 610, 431, 854, 660, 642, 717, 152, 766, 774, 976, 71, 112, 605, 27, 700, 161, 490, 437, 66, 685, 496, 838, 106, 688, 424, 146, 415, 195, 417, 678, 239, 668, 671, 45, 224, 172, 216]],
    "weights": [769, 546, 766, 741, 412, 576, 821, 63, 11, 323, 314, 493, 637, 520, 197, 901, 487, 386, 408, 706, 695, 873, 949, 374, 807, 402, 93, 217, 148, 677, 137, 131, 191, 407, 425, 526, 557, 690, 496, 918, 24, 605, 43, 974, 388, 663, 103, 680, 322, 449, 788, 163, 247, 376, 575, 202, 24, 533, 600, 338, 441, 130, 61, 787, 423, 209, 975, 717, 424, 649, 245, 216, 281, 307, 843, 992, 645, 815, 859, 686, 643, 313, 396, 490, 869, 823, 476, 72, 597, 368, 715, 325, 427, 377, 94, 957, 100, 518, 259, 432],
    "pareto": [[-38202,-42829],[-38596,-42451],[-36668,-43808],[-40717,-39277],[-37746,-43224],[-36439,-43900],[-37106,-43642],[-37584,-43364],[-39690,-41241],[-38996,-42046],[-38426,-42653],[-40856,-38912],[-41363,-36928],[-40153,-40382],[-40526,-39692],[-38640,-42420],[-39362,-41577],[-39773,-41127],[-39810,-41021],[-40390,-40034],[-40488,-39856],[-39509,-41472],[-40031,-40733],[-39969,-40783],[-40105,-40544],[-40296,-40129],[-40702,-39292],[-39659,-41379],[-39435,-41555],[-39358,-41582],[-36513,-43899],[-36080,-44091],[-35236,-44422],[-38509,-42566],[-37855,-43165],[-39850,-40964],[-40394,-39951],[-41362,-36934],[-39728,-41155],[-41489,-36287],[-41518,-35835],[-41528,-35643],[-41571,-35483],[-41592,-35198],[-41616,-34657],[-38107,-43025],[-40939,-38859],[-38117,-42877],[-40693,-39424],[-39082,-42014],[-40804,-39114],[-38574,-42462],[-39349,-41608],[-38858,-42190],[-39288,-41700],[-40068,-40627],[-40550,-39623],[-40116,-40488],[-39476,-41488],[-40037,-40717],[-39908,-40856],[-39707,-41169],[-40142,-40423],[-40545,-39626],[-40778,-39179],[-40439,-39933],[-40604,-39493],[-40319,-40092],[-39552,-41427],[-40765,-39257],[-38557,-42534],[-41309,-37286],[-39211,-41935],[-40667,-39435],[-39248,-41829],[-37426,-43432],[-38688,-42392],[-38754,-42350],[-41346,-37050],[-38771,-42278],[-39265,-41757],[-39228,-41863],[-39025,-42044],[-39326,-41616],[-37251,-43564],[-36425,-43945],[-36731,-43805],[-37522,-43400],[-36608,-43879],[-40493,-39694],[-36752,-43797],[-37395,-43482],[-38264,-42740],[-37693,-43305],[-36643,-43856],[-37917,-43129],[-37619,-43306],[-39795,-41023],[-37462,-43409],[-38431,-42589],[-40253,-40319],[-40181,-40327],[-38820,-42275],[-38333,-42710],[-38987,-42111],[-38878,-42170],[-38246,-42798],[-36888,-43731],[-38129,-42835],[-37192,-43610],[-37301,-43551],[-39324,-41662],[-37525,-43375],[-38913,-42112],[-39939,-40841],[-39964,-40787],[-39815,-40974],[-36927,-43702],[-35454,-44333],[-36284,-44017],[-36263,-44025],[-40889,-38869],[-40569,-39555],[-40148,-40407],[-38464,-42568],[-40340,-40089],[-41301,-37462],[-36876,-43753],[-38340,-42685],[-37215,-43583],[-36985,-43694],[-37443,-43431],[-40625,-39490],[-38602,-42424],[-38312,-42723],[-37932,-43032],[-40283,-40152],[-36372,-43966],[-38891,-42137],[-39914,-40842],[-41150,-37992],[-41261,-37682],[-41125,-38109],[-40862,-38881],[-35957,-44165],[-41093,-38246],[-40979,-38639],[-41090,-38329],[-37769,-43170],[-36215,-44076],[-35563,-44274],[-40837,-39011],[-40967,-38656],[-41188,-37763],[-41415,-36780],[-41214,-37702],[-41389,-36890],[-40985,-38544],[-40161,-40345],[-35687,-44230],[-40556,-39583],[-35699,-44208],[-36066,-44106],[-35790,-44191],[-35796,-44171],[-41041,-38388]]
  });

}());
