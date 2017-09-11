(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj4Itm30', {
    "objectives": 4,
    "items": 30,
    "capacity": 8851,
    "profitMatrix": [[240, 136, 121, 751, 866, 123, 766, 979, 707, 396, 81, 45, 646, 410, 277, 343, 532, 666, 169, 458, 995, 839, 698, 680, 859, 175, 117, 374, 890, 638], [845, 439, 206, 16, 42, 183, 787, 113, 445, 595, 15, 212, 862, 2, 437, 885, 988, 964, 545, 889, 742, 596, 16, 2, 801, 522, 775, 885, 638, 349], [493, 292, 738, 482, 577, 848, 467, 953, 62, 945, 978, 554, 37, 937, 348, 224, 129, 983, 740, 181, 468, 163, 13, 340, 272, 691, 770, 299, 252, 7], [530, 615, 855, 487, 90, 250, 513, 116, 770, 821, 3, 304, 708, 614, 736, 800, 897, 439, 24, 453, 271, 76, 840, 219, 806, 759, 400, 9, 166, 294]],
    "weights": [250, 216, 773, 687, 917, 521, 32, 794, 755, 440, 614, 812, 577, 185, 840, 156, 5, 604, 908, 110, 936, 981, 38, 26, 879, 20, 729, 11, 825, 110],
    "pareto": [[-8737,-10070,-12338,-9220],[-9421,-9390,-12417,-9532],[-11003,-12531,-9810,-12981],[-11734,-13572,-8765,-11024],[-13337,-11978,-9205,-10523],[-9351,-10910,-12123,-11186],[-12476,-12705,-8085,-11823],[-11475,-10259,-11173,-10936],[-12180,-12058,-10304,-9978],[-12836,-11402,-9415,-11245],[-9776,-11320,-11895,-11382],[-13178,-12381,-8690,-11203],[-11846,-12895,-8341,-12191],[-12770,-11728,-9596,-10348],[-11092,-12006,-10511,-12931],[-10194,-11908,-10536,-12818],[-10422,-12005,-11007,-12447],[-10072,-11953,-11406,-11654],[-11491,-10984,-9694,-12688],[-12050,-11310,-10753,-10142],[-12054,-10741,-10721,-10597],[-12616,-12222,-8875,-11863],[-9884,-12105,-11685,-11701],[-11124,-13074,-8948,-12515],[-13205,-11827,-9104,-11217],[-10432,-12920,-10126,-11283],[-12034,-12751,-9133,-11400],[-9995,-11898,-11778,-10302],[-11645,-10851,-10948,-11888],[-9964,-12061,-11798,-10942],[-11191,-11122,-11852,-10983],[-11842,-13464,-8373,-11736],[-10741,-12139,-11393,-11308],[-12021,-12461,-9789,-10658],[-11172,-13413,-8950,-11684],[-11986,-12412,-9131,-12231],[-10358,-11684,-11819,-11452],[-11288,-12850,-10231,-11149],[-12566,-11141,-10576,-10085],[-11056,-11246,-10719,-12534],[-12579,-11397,-10020,-10450],[-11758,-12315,-8660,-12602],[-10242,-12247,-10538,-11987],[-11444,-13081,-9841,-11030],[-11051,-12835,-10426,-12032],[-12682,-11148,-9915,-10759],[-12748,-12373,-8976,-11169],[-11598,-12653,-9082,-12266],[-11886,-13035,-8793,-11453],[-10494,-11625,-12015,-10917],[-10593,-12279,-10274,-12316],[-11292,-11218,-11470,-10542],[-10403,-12981,-9436,-12373],[-10581,-11602,-11522,-11767],[-11211,-11412,-11266,-11399],[-12244,-10691,-10687,-10247],[-10602,-11517,-11623,-11629],[-10365,-10925,-12124,-10736],[-11050,-11838,-10641,-12684],[-11964,-10985,-11334,-10749],[-11215,-10843,-11234,-11854],[-10527,-11159,-11452,-12226],[-12414,-11283,-10462,-11199],[-12456,-12560,-9297,-11527],[-11539,-12931,-9464,-11531],[-12640,-10980,-10045,-10512],[-12667,-11927,-9782,-10471],[-12092,-11478,-10623,-10389],[-11960,-12878,-9764,-10596],[-12114,-13132,-9264,-11082],[-12704,-12802,-8556,-11452],[-11055,-11181,-11656,-11518],[-12181,-12171,-9090,-11561],[-9656,-12008,-11214,-12072],[-10157,-13253,-8519,-11932],[-11663,-12039,-10545,-12114],[-10497,-12306,-11589,-11131],[-12814,-11299,-10016,-10065],[-10790,-11308,-11755,-10863],[-10877,-12560,-9570,-12124],[-11718,-11090,-9470,-12371],[-10482,-12205,-10942,-12319],[-12145,-12009,-9646,-11551],[-12064,-11231,-10861,-10406],[-11139,-12472,-10006,-12446],[-11686,-13233,-8763,-11855],[-10225,-12638,-10698,-11785],[-10314,-12113,-11399,-11735],[-11874,-13089,-9555,-11064],[-11770,-12120,-10871,-11614],[-11340,-12112,-11157,-11580],[-10470,-12286,-10019,-12792],[-10361,-12579,-10894,-11250],[-12508,-12330,-9267,-11151],[-10445,-12729,-10835,-10078],[-12320,-12474,-8475,-11942],[-11962,-11816,-9456,-12155],[-12118,-12563,-9232,-11537],[-11870,-12321,-9973,-11612],[-11102,-12971,-9549,-11335],[-11960,-11554,-11366,-10294],[-12543,-11983,-10353,-11380],[-12316,-13043,-8507,-11487],[-10896,-11584,-11141,-12198],[-11290,-12827,-10341,-10544],[-10650,-11856,-11625,-10798],[-11232,-12220,-11549,-10868],[-11148,-13333,-9441,-11109],[-10912,-12213,-10656,-12353],[-11824,-11613,-11170,-10829],[-11909,-12742,-10641,-11293],[-12460,-11991,-9265,-11982],[-10466,-11576,-11427,-12164],[-11396,-12742,-9839,-11861],[-11778,-13143,-9185,-10741],[-11878,-12520,-9523,-11519],[-11215,-11718,-11527,-11059],[-12020,-11537,-10444,-10412],[-11375,-11380,-11105,-11395],[-11730,-11128,-9716,-12272],[-12125,-11285,-9932,-11779],[-11961,-11619,-10429,-11310],[-10250,-11980,-11148,-11887],[-12816,-11300,-8469,-11514],[-11228,-11947,-10707,-12396],[-12423,-11139,-10146,-11541],[-12401,-12136,-9983,-10915],[-11828,-11044,-11138,-11284],[-12603,-11966,-9431,-11498],[-11052,-11815,-10751,-12079],[-11355,-12155,-10814,-11568],[-10742,-11954,-10910,-12138],[-12432,-11964,-9622,-11451],[-11945,-11825,-10106,-11938],[-12013,-12296,-10139,-11128],[-11327,-12378,-10717,-11223],[-11861,-12438,-10025,-12242],[-12017,-11727,-10107,-11583],[-12550,-11224,-10658,-10664],[-11168,-12645,-9368,-12232],[-12006,-11387,-9876,-11872],[-12443,-12304,-9853,-11162],[-12096,-10909,-10591,-10844],[-12436,-11395,-9590,-11906],[-12621,-11565,-9890,-10697],[-11841,-12148,-10611,-11826],[-12447,-11735,-9821,-11617],[-12775,-11819,-9390,-11183],[-11371,-11949,-11137,-10940],[-11239,-12718,-9533,-12103],[-11774,-11551,-10839,-12069],[-11780,-12042,-10750,-11112],[-12615,-12157,-9812,-10847],[-12240,-11289,-9889,-11432],[-11754,-12884,-8692,-12147],[-11777,-11361,-11176,-10898],[-11705,-12207,-10415,-12361],[-12030,-11983,-9551,-11948],[-11953,-12313,-11061,-11010],[-12087,-12135,-9608,-11555],[-11930,-11782,-10449,-11950],[-12063,-11539,-9933,-11479],[-11251,-12637,-10456,-11630],[-11957,-11744,-11029,-11465],[-10469,-12471,-10502,-11962],[-11068,-12444,-10266,-12234],[-12592,-11626,-9200,-11787],[-12173,-12172,-9176,-11618],[-11847,-11790,-9361,-12552],[-11111,-12818,-9504,-12150],[-12026,-12552,-9583,-11493],[-12002,-11956,-9908,-11417],[-12090,-11501,-10513,-10994],[-11184,-11881,-11547,-11699],[-12619,-11588,-9780,-11302],[-12169,-12741,-9208,-11163],[-11200,-12293,-10205,-12100],[-11969,-12725,-9719,-11411],[-12067,-10970,-9901,-11934],[-12091,-11566,-9576,-12010],[-12071,-11464,-8630,-12279],[-11344,-11543,-11125,-12035],[-11931,-11904,-9998,-11674],[-11229,-12228,-9393,-12294],[-11681,-12645,-10170,-11664],[-12343,-11329,-9620,-11702],[-11095,-12406,-10846,-11749],[-12680,-11171,-9805,-11364],[-12676,-11740,-9837,-10909],[-12731,-12248,-8970,-11466],[-11296,-12541,-10737,-11863],[-11987,-12324,-10178,-10610],[-11126,-13051,-9058,-11910],[-12577,-11994,-9470,-10980],[-10926,-12730,-9560,-12101],[-12575,-12017,-9360,-11585],[-11988,-12389,-9241,-11626],[-11813,-12494,-10109,-11530],[-11140,-12310,-11127,-11982],[-10438,-12634,-10522,-12602],[-11084,-12883,-9188,-11663],[-11982,-12981,-9163,-11776],[-11213,-12549,-9649,-12465],[-12571,-12586,-9392,-11130],[-11826,-12750,-9553,-11895],[-12141,-12578,-9678,-11096],[-11985,-12347,-10068,-11215],[-11958,-12385,-9488,-11700],[-11323,-12503,-11317,-11378],[-12703,-12737,-9493,-10436],[-12667,-11977,-9701,-10039],[-12660,-11069,-8859,-11633],[-12653,-11725,-9391,-11350],[-12649,-12294,-9423,-10895],[-12633,-11623,-8445,-11619],[-12592,-12142,-9366,-11288],[-12588,-12711,-9398,-10833],[-12548,-12571,-8946,-11571],[-12544,-13140,-8978,-11116],[-11150,-13310,-9551,-10504],[-12006,-13240,-9656,-10370],[-11256,-13225,-9049,-11821],[-11688,-13210,-8873,-11250],[-11258,-13202,-9159,-11216],[-11016,-13182,-9340,-11803],[-10689,-13172,-9491,-10587],[-11018,-13159,-9450,-11198],[-10588,-13151,-9736,-11164],[-11048,-13080,-8764,-11964],[-10509,-13050,-10023,-11073],[-11738,-13003,-8733,-11479],[-11646,-12992,-9084,-11435],[-10546,-12983,-9866,-10917],[-11958,-12901,-9654,-11201],[-10381,-12869,-10308,-11666],[-10892,-12849,-9154,-12083],[-11176,-12844,-8918,-12139],[-10961,-12840,-10382,-9933],[-11311,-12834,-8993,-11902],[-11730,-12804,-9183,-11572],[-11750,-12756,-9369,-11344],[-11320,-12748,-9655,-11310],[-9837,-10903,-11920,-11444],[-9652,-11880,-11891,-11269],[-10370,-11292,-11829,-11197],[-11268,-10622,-11795,-10466],[-9935,-12231,-11772,-9756],[-10534,-10400,-11757,-11510],[-9713,-10570,-11734,-11724],[-9915,-11942,-11665,-11061],[-11103,-11520,-11658,-10687],[-11134,-11357,-11638,-10047],[-10661,-11558,-11635,-11008],[-10234,-11351,-11633,-11732],[-10509,-11914,-11599,-10876],[-11276,-11301,-11552,-11121],[-11263,-12057,-11529,-10228],[-11267,-11488,-11497,-10683],[-11347,-11353,-11462,-10864],[-10514,-11915,-11429,-11333],[-10158,-12105,-10112,-13119],[-10279,-12648,-9250,-12653],[-10771,-12306,-10016,-12549],[-10860,-11781,-10717,-12499],[-10698,-12633,-9089,-12472],[-11436,-11426,-10332,-12457],[-11016,-12012,-10327,-12380],[-9612,-12437,-10794,-12355],[-11275,-12199,-10701,-12327],[-11681,-11611,-10740,-12285],[-11918,-12710,-9894,-10349],[-12078,-12322,-9553,-11117],[-11941,-12394,-10138,-11483],[-11295,-10799,-11347,-11095],[-11194,-11803,-11426,-11197],[-11108,-11887,-11363,-11148],[-11964,-11552,-10361,-10188],[-12065,-12032,-10209,-10375],[-11011,-11610,-11236,-11801],[-11895,-12129,-9363,-11721],[-10374,-12313,-11334,-11607],[-11083,-12545,-10913,-11046],[-10605,-12198,-11197,-11843],[-10470,-12344,-11009,-11616],[-10282,-11690,-11635,-10901],[-9692,-12393,-10907,-11596],[-11064,-12316,-10943,-11431],[-10206,-12409,-10728,-12170],[-10462,-12841,-9440,-12049],[-9488,-12104,-10608,-12635],[-10447,-12552,-9856,-12090],[-11130,-12309,-10291,-12247],[-9760,-11772,-11499,-11981],[-10430,-11773,-11003,-12465],[-9532,-11675,-11028,-12352],[-10190,-11780,-11213,-12015],[-10518,-11346,-11397,-11788],[-10984,-12114,-10903,-12219],[-10558,-11946,-11203,-11912],[-10818,-11613,-10847,-12252],[-9671,-12297,-10798,-12031],[-12033,-12686,-10070,-10384],[-11918,-12660,-9975,-10781],[-11629,-12213,-10231,-11810],[-11331,-11809,-10685,-11678],[-11105,-12657,-10041,-11753],[-11890,-12466,-8761,-11908],[-10586,-13174,-9626,-11769],[-12039,-12094,-10148,-10234],[-10259,-13164,-9777,-10553],[-10103,-12933,-10167,-10672],[-9097,-12614,-10971,-10911],[-9119,-10685,-12329,-10754],[-12883,-12405,-7848,-10192],[-10241,-10592,-11938,-11016],[-10606,-13548,-9038,-10150],[-10048,-10407,-11960,-11252],[-9659,-11121,-12196,-10553],[-9896,-11713,-11695,-11446],[-9964,-11111,-12027,-10616],[-12772,-11131,-10146,-9818],[-11781,-10792,-11144,-11353],[-9195,-12584,-10757,-10773],[-12102,-11080,-10723,-9766],[-11083,-12487,-9923,-12222],[-9544,-11095,-12101,-10950],[-10478,-12077,-11619,-11516],[-10473,-10817,-11732,-11448],[-9070,-11516,-11967,-11199],[-10011,-13058,-9131,-11904],[-11359,-13173,-8995,-11071],[-11060,-12753,-9760,-11520],[-10525,-10587,-11702,-11072],[-9652,-10987,-11709,-11662],[-13088,-11165,-9459,-10937],[-11291,-11368,-11379,-10640],[-12319,-10733,-9945,-11626],[-11261,-12888,-9651,-11634],[-11216,-12984,-9370,-11401],[-12640,-12481,-9368,-10457],[-11610,-13239,-8579,-11304],[-11180,-13231,-8865,-11270],[-10940,-13188,-9156,-11252],[-10510,-13180,-9442,-11218],[-10327,-12987,-9252,-11822],[-10975,-12841,-10242,-11481],[-10602,-10962,-11938,-9760],[-10431,-10875,-11854,-11259],[-10418,-11631,-11831,-10366],[-10295,-10934,-11658,-11794],[-9602,-12436,-9958,-12620],[-11227,-11520,-9986,-12403],[-9691,-12586,-10905,-10726],[-10215,-12637,-9862,-12050],[-12623,-12356,-9362,-10754],[-10960,-12552,-10658,-11522],[-11108,-13142,-9681,-10257],[-9653,-9615,-12211,-9964],[-10473,-10262,-12047,-9579],[-9860,-10061,-12143,-10149],[-12144,-11298,-10512,-9581],[-11996,-10585,-10041,-11598],[-10571,-11125,-11958,-10400],[-11455,-10690,-11385,-9707],[-11185,-11867,-9653,-12478],[-11115,-11128,-11668,-10432],[-11359,-13223,-8914,-10639],[-11212,-12856,-10047,-10598],[-9945,-10882,-12057,-11001],[-10478,-11127,-11848,-11190],[-9781,-10918,-11837,-11220],[-12063,-12055,-10099,-10980],[-10686,-10258,-11871,-10396],[-11299,-10459,-11775,-9826],[-9593,-11258,-11053,-12414],[-12144,-11248,-10593,-10013],[-12047,-10868,-8955,-12203],[-10781,-12885,-9862,-10532],[-12709,-12145,-9571,-10286],[-12037,-12117,-10038,-10839],[-9816,-10182,-12166,-10820],[-9227,-10577,-11937,-11466],[-10614,-10356,-11870,-10751],[-10661,-10608,-11864,-10682],[-10478,-10415,-11674,-11286],[-9940,-10017,-12256,-9390],[-12734,-10682,-9479,-10399],[-11099,-11247,-10816,-12215],[-11024,-13000,-9255,-11389],[-10354,-12949,-9832,-11337],[-9363,-10518,-12133,-10931],[-9605,-10678,-12126,-11012],[-8660,-10135,-12415,-9630],[-9896,-10763,-11924,-11120],[-9748,-11853,-10576,-12454],[-11072,-13339,-9257,-10558],[-10474,-9960,-12062,-9769],[-10302,-10175,-11963,-11078],[-9683,-11717,-11871,-10629],[-9126,-9926,-12634,-10038],[-8537,-10321,-12405,-10684],[-9150,-10522,-12309,-10114],[-9177,-12570,-11084,-10152],[-10541,-11445,-11841,-9312],[-11882,-12907,-9470,-10650],[-9757,-10536,-12240,-9898],[-9733,-9571,-12324,-9205],[-8557,-10610,-12512,-9379],[-9628,-9836,-12349,-9717],[-9402,-11036,-12210,-9241],[-9847,-10019,-12146,-10180],[-9090,-11805,-12074,-9894],[-10247,-9587,-12145,-9779],[-10454,-10033,-12077,-9964],[-9150,-11472,-12080,-10440],[-10442,-10425,-12067,-10219],[-9090,-10855,-12303,-9568],[-9234,-9818,-12242,-10750],[-9550,-10090,-12308,-9713],[-9306,-9386,-12460,-9879],[-8477,-10654,-12399,-10138],[-9787,-10352,-12140,-9634],[-9880,-10350,-12250,-8844],[-9273,-11286,-12090,-9386],[-9273,-10336,-12319,-9060]]
  });

}());
