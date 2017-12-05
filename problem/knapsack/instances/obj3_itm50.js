(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj3Itm50', {
    "objectives": 3,
    "items": 50,
    "capacity": 13527,
    "profitMatrix": [[895, 629, 105, 976, 672, 508, 16, 216, 235, 192, 431, 548, 16, 39, 25, 922, 521, 648, 92, 522, 541, 131, 57, 964, 385, 866, 379, 662, 508, 562, 665, 402, 191, 769, 378, 862, 277, 394, 77, 512, 585, 508, 60, 600, 546, 85, 522, 67, 732, 614], [588, 273, 744, 645, 237, 128, 511, 615, 789, 18, 176, 454, 420, 366, 223, 798, 228, 500, 191, 305, 11, 775, 813, 70, 375, 358, 155, 897, 425, 887, 510, 12, 159, 254, 657, 395, 381, 167, 10, 170, 184, 186, 624, 604, 552, 846, 401, 779, 345, 591], [83, 356, 366, 896, 426, 741, 254, 580, 637, 678, 466, 147, 690, 625, 400, 346, 19, 781, 512, 29, 950, 696, 214, 573, 300, 765, 419, 700, 543, 764, 291, 626, 120, 656, 521, 545, 397, 774, 125, 33, 452, 590, 179, 141, 215, 579, 486, 234, 359, 998]],
    "weights": [262, 308, 694, 475, 881, 993, 239, 300, 692, 782, 63, 982, 408, 182, 638, 928, 727, 34, 702, 851, 67, 153, 441, 246, 294, 655, 824, 779, 888, 182, 777, 149, 490, 470, 624, 370, 462, 862, 670, 154, 643, 733, 136, 50, 915, 773, 978, 641, 807, 680],
    "pareto": [[-14095,-12452,-18276],[-17637,-12419,-14540],[-15420,-12782,-17921],[-13527,-14160,-18077],[-17137,-14304,-15139],[-14410,-15904,-17512],[-15319,-16779,-16601],[-14917,-14786,-17812],[-14928,-15309,-17730],[-14612,-16657,-16642],[-15015,-16533,-16946],[-16400,-15039,-16506],[-15680,-15860,-17118],[-15837,-16184,-16819],[-15095,-16620,-16832],[-16346,-14881,-16735],[-14522,-16540,-17006],[-15757,-15663,-16853],[-15799,-16219,-16687],[-15040,-15945,-17224],[-15728,-15456,-17010],[-16181,-15722,-15667],[-16262,-15572,-15978],[-16331,-15558,-15607],[-16685,-14912,-15989],[-16772,-14965,-15963],[-17132,-13440,-16506],[-15295,-14087,-17920],[-15795,-13425,-17793],[-16811,-14597,-16200],[-15372,-14085,-17782],[-15575,-16060,-16918],[-16463,-13986,-17186],[-16036,-15766,-16554],[-16697,-14578,-16384],[-15419,-15485,-17268],[-16222,-15559,-16698],[-15486,-15320,-17336],[-16625,-14713,-16492],[-15688,-14253,-17694],[-15852,-14304,-17530],[-15884,-15381,-17113],[-15642,-15895,-16986],[-16546,-13987,-17058],[-15951,-15216,-17181],[-16033,-15098,-17111],[-16180,-15003,-16864],[-16606,-14095,-16991],[-16647,-14397,-16951],[-16229,-15286,-16833],[-16268,-13917,-17406],[-16110,-15096,-16973],[-15304,-15717,-17401],[-16000,-14898,-17171],[-16123,-14647,-17047],[-16731,-14572,-16439],[-16811,-14506,-16636],[-16026,-14431,-17279],[-16067,-14733,-17239],[-15912,-14470,-17312],[-16685,-14821,-16425],[-15845,-14577,-17395],[-15700,-15299,-17362],[-16770,-14204,-16676],[-16499,-13861,-17159],[-16492,-14076,-17175],[-16270,-14866,-16803],[-16187,-14730,-16999],[-16260,-15524,-16830],[-14621,-16816,-16424],[-15613,-16025,-17050],[-15575,-16299,-16871],[-14583,-16689,-16752],[-14597,-16665,-16695],[-14583,-16392,-16950],[-15172,-16618,-16694],[-15101,-16094,-16970],[-15633,-16324,-16330],[-17258,-13167,-16236],[-17144,-12909,-16467],[-17084,-14233,-16106],[-16811,-14836,-16153],[-16533,-14766,-16501],[-16811,-14539,-16351],[-16331,-15396,-16067],[-15824,-15631,-16965],[-15364,-15692,-17206],[-15239,-16453,-16762],[-15015,-16294,-16993],[-15468,-14685,-17511],[-16765,-13770,-16930],[-15498,-13800,-17707],[-16382,-14175,-17175],[-16072,-15616,-16640],[-16185,-13809,-17416],[-15342,-15682,-17533],[-15922,-15346,-17245],[-16115,-14184,-17291],[-15990,-15065,-17123],[-15120,-16032,-17110],[-16388,-15166,-16625],[-14731,-16974,-15831],[-15102,-16347,-16967],[-15179,-16345,-16829],[-14592,-15401,-17538],[-15457,-15113,-17493],[-15953,-14772,-17272],[-16262,-15481,-16414],[-14798,-16809,-15899],[-15461,-16041,-17102],[-15999,-14523,-17286],[-15620,-15752,-17185],[-15162,-16455,-16900],[-15152,-15229,-17546],[-14824,-16277,-17315],[-14901,-16275,-17177],[-15053,-16660,-16618],[-14733,-16876,-15763],[-17043,-13840,-16582],[-14973,-15977,-17112],[-16879,-13731,-16897],[-17043,-13543,-16780],[-15802,-14511,-17463],[-16578,-14669,-16858],[-15966,-14323,-17346],[-16613,-13822,-17126],[-16183,-14755,-16980],[-16106,-14757,-17118],[-16113,-14781,-17055],[-16770,-14146,-16827],[-16156,-14847,-16987],[-16434,-14755,-16762],[-14744,-15756,-17349],[-16767,-14393,-16711],[-16023,-14918,-17116],[-16941,-13624,-16643],[-15998,-15639,-16882],[-16656,-14185,-16860],[-15921,-13379,-17671],[-14890,-15344,-17598],[-15390,-15278,-17425],[-15418,-15975,-17170],[-16415,-14375,-17115],[-15172,-14668,-17790],[-15819,-14167,-17570],[-16587,-14586,-16820],[-16647,-14694,-16753],[-16693,-14445,-16767],[-15043,-14740,-17690],[-15768,-14876,-17335],[-16579,-14187,-16998],[-16000,-15195,-16973],[-15933,-14425,-17339],[-16309,-14516,-17168],[-15882,-14837,-17302],[-16414,-14857,-16975],[-15024,-16096,-17108],[-16268,-14156,-17359],[-16849,-14963,-15825],[-16526,-15317,-15387],[-16475,-15310,-15826],[-16513,-15275,-15958],[-17014,-14051,-16298],[-16888,-14366,-16087],[-16786,-13714,-16929],[-16438,-15166,-16178],[-16808,-14570,-16301],[-16300,-14599,-17206],[-16320,-14497,-16993],[-17122,-14360,-15778],[-15053,-16064,-16998],[-16676,-15008,-16483],[-17055,-14444,-15822],[-15712,-14995,-17471],[-16533,-14436,-16984],[-16311,-15259,-16327],[-15732,-14893,-17258],[-14487,-15902,-17374],[-16167,-15746,-15724],[-16424,-15190,-16235],[-14312,-16346,-17235],[-16625,-15043,-16009],[-16275,-13941,-17343],[-14341,-16314,-17125],[-14522,-16301,-17053],[-15262,-15161,-17567],[-14782,-15721,-17481],[-14408,-16282,-17237],[-14859,-15719,-17343],[-16347,-15192,-16373],[-16567,-14760,-16556],[-16088,-15664,-16245],[-16859,-14528,-16352],[-16216,-15620,-16158],[-16408,-15064,-16412],[-15768,-14579,-17533],[-16151,-15035,-16974],[-16037,-14777,-17205],[-16765,-13473,-17128],[-16733,-14843,-16141],[-16407,-13771,-17305],[-15667,-15307,-17264],[-16163,-14412,-17245],[-15600,-15472,-17196],[-15827,-14107,-17593],[-16247,-14971,-16976],[-15941,-14365,-17362],[-16685,-13841,-16957],[-16388,-15257,-16189],[-14693,-16847,-16159],[-16270,-15105,-16756],[-16311,-15498,-16280],[-14501,-15878,-17317],[-15082,-16067,-16978],[-15504,-15536,-17194],[-16781,-14040,-16659],[-16695,-14716,-16469],[-16861,-14399,-16071],[-17081,-13967,-16254],[-16540,-14163,-17119],[-15239,-14503,-17858],[-15436,-14301,-17778],[-16695,-14878,-16009],[-14679,-16625,-16754],[-14811,-15724,-17461],[-15329,-15129,-17679],[-15449,-14854,-17632],[-15909,-14793,-17391],[-15411,-14889,-17500],[-16394,-14870,-16736],[-14437,-15346,-17726],[-14094,-15497,-17647],[-15376,-15419,-17336],[-15295,-14384,-17722],[-13927,-15941,-17322],[-14612,-14902,-17865],[-14944,-15770,-17269],[-16158,-15603,-16265],[-16065,-15474,-16950],[-15187,-15867,-17178],[-14612,-15141,-17818],[-16335,-14049,-17276],[-16475,-15148,-16286],[-16437,-15183,-16154],[-16979,-14492,-15894],[-15571,-15371,-17262],[-16958,-14548,-15895],[-16941,-14365,-16222],[-15526,-16306,-16532],[-16236,-15678,-16137],[-15782,-14852,-17278],[-16827,-14107,-16453],[-16734,-14838,-16291],[-16685,-15151,-15942],[-16014,-15843,-16143],[-16779,-13746,-16873],[-16429,-14351,-17058],[-15942,-13883,-17502],[-15775,-14603,-17470],[-16456,-14768,-16639],[-15835,-14711,-17403],[-16900,-13972,-16698],[-14426,-16365,-17051],[-16067,-15030,-17041],[-16433,-14992,-16558],[-16307,-15307,-16347],[-16335,-13752,-17474],[-16473,-14328,-17051],[-16111,-13832,-17658],[-15924,-15852,-16362],[-15912,-14412,-17463],[-15614,-15437,-17194],[-15729,-14852,-17456],[-16164,-15007,-16856],[-16081,-15006,-16984],[-14926,-15687,-17455],[-15115,-16070,-16913],[-14910,-15838,-17339],[-15031,-15804,-17246],[-15872,-16032,-16109],[-16603,-14581,-16828],[-16376,-14351,-17236],[-16489,-14323,-17059],[-16273,-15566,-16259],[-14469,-16548,-16837],[-16825,-14812,-16096],[-14707,-16823,-16102],[-14496,-15465,-17536],[-16788,-14651,-16265],[-14759,-15063,-17772],[-16288,-15516,-15762],[-16850,-14239,-16415],[-14169,-16916,-15884],[-16661,-14670,-16696],[-16000,-13836,-17438],[-14830,-15751,-17453],[-16323,-15041,-16644],[-15534,-16403,-16057],[-16365,-15311,-16254],[-14915,-14756,-17876],[-14435,-15316,-17790],[-16893,-14004,-16642],[-16929,-13582,-16813],[-14554,-16848,-15835],[-16285,-15559,-15178],[-15139,-14676,-17692],[-16968,-13628,-16623],[-16052,-15808,-16275],[-16346,-15178,-16537],[-16654,-14421,-16888],[-16497,-14751,-16695],[-16473,-14877,-16584],[-16449,-14010,-17243],[-16389,-13902,-17310],[-14726,-14863,-17832],[-16398,-15223,-16209],[-16289,-13917,-17286],[-16275,-13644,-17541],[-16705,-13662,-16997],[-17275,-14012,-16005],[-16970,-13975,-16337],[-17284,-13825,-15947],[-17088,-13327,-16581],[-16052,-15970,-15815],[-14904,-15320,-17541],[-14890,-15047,-17796],[-15816,-14487,-17406],[-14487,-15605,-17572],[-16369,-15523,-15739],[-16785,-15007,-15392],[-17186,-12777,-16294],[-15688,-14492,-17647],[-14601,-15863,-17341],[-16997,-13942,-16353],[-14208,-15458,-17614],[-14416,-14842,-17895],[-14503,-14413,-18009],[-14999,-13775,-17986],[-15105,-13634,-17933],[-14786,-13836,-17995],[-14958,-13473,-18026],[-14976,-14608,-17820],[-14023,-14973,-17923],[-14503,-14116,-18207],[-14100,-14674,-17983],[-14881,-13714,-18117],[-13996,-15939,-17370],[-16042,-14238,-17334],[-17098,-14209,-16049],[-16945,-13852,-16542],[-17057,-13816,-16525],[-17246,-13698,-16275],[-16954,-14077,-16134],[-15605,-12972,-17806],[-15545,-12864,-17873],[-16821,-14563,-16220],[-16851,-14865,-15757],[-14455,-16572,-16894],[-16205,-15711,-15856],[-16535,-15208,-15884],[-16072,-15868,-15602],[-14512,-15314,-17652],[-13994,-15909,-17434],[-15421,-14041,-17798],[-14397,-15351,-17658],[-17120,-14013,-16064],[-17096,-13755,-16217],[-15347,-16357,-16124],[-14424,-14793,-17872],[-17297,-13867,-15376],[-15836,-14024,-17555],[-15575,-14808,-17510],[-16397,-15298,-16128],[-16006,-14304,-17311],[-16351,-13100,-17325],[-14403,-14289,-18041],[-14935,-14357,-17861],[-16269,-15180,-16675],[-15974,-15958,-16117],[-16353,-14905,-16672],[-15891,-14264,-17475],[-16823,-14272,-16399],[-16891,-14632,-15939],[-16075,-14835,-17020],[-16772,-13497,-17065],[-16971,-14590,-15324],[-17171,-13073,-16293],[-15438,-13692,-17774],[-16548,-12764,-17201],[-17532,-13137,-15657],[-17418,-12879,-15888],[-17570,-13264,-15329],[-15378,-16473,-15611],[-14399,-15381,-17594],[-15369,-14333,-17666],[-14599,-14349,-18011],[-15645,-13482,-17735],[-15302,-13432,-17853],[-16384,-15305,-16209],[-15904,-15865,-16123],[-16687,-14723,-16357],[-16725,-15180,-15546],[-16917,-14155,-16371],[-16308,-15232,-16428],[-16938,-14099,-16370],[-15861,-13271,-17738],[-14094,-15736,-17600],[-13189,-16984,-14011],[-13531,-13769,-18215],[-16515,-12912,-17208],[-17312,-13569,-15474],[-17345,-12452,-16233],[-15395,-13028,-17933],[-15502,-13614,-17851],[-16622,-13902,-17046],[-15231,-13109,-17932],[-15818,-12500,-17779],[-15545,-13103,-17826],[-14677,-13347,-18139],[-15381,-13052,-17990],[-15088,-13241,-18048],[-16992,-14534,-15323],[-14368,-15348,-17678],[-16986,-14245,-16066],[-17083,-13869,-16186],[-16488,-15352,-15255],[-16608,-15153,-16080],[-17135,-14402,-15207],[-16621,-15195,-15509],[-17133,-14055,-15493],[-17296,-13591,-15710],[-17406,-13452,-15446],[-16451,-15159,-16097],[-16456,-13090,-17200],[-14848,-14491,-17962],[-14713,-14310,-17978],[-17350,-13696,-15146],[-16461,-14901,-16609],[-17146,-14117,-15081],[-17124,-14262,-15710],[-15528,-13213,-17897],[-15975,-14106,-17464],[-15045,-13526,-18000],[-15982,-14130,-17401],[-14119,-14909,-17925],[-13627,-13705,-18217],[-16292,-12981,-17515],[-15479,-13994,-17734],[-13898,-15437,-17677],[-15735,-12740,-17828],[-16699,-15127,-15885],[-16857,-14047,-16438],[-17383,-12579,-15905],[-16410,-15340,-15557],[-15878,-12608,-17712],[-16570,-13051,-17167],[-16125,-14105,-17403],[-14955,-13663,-18061],[-16487,-14853,-16527],[-14010,-14420,-18069],[-15022,-13928,-17975],[-14599,-14588,-17964],[-13607,-14978,-17845],[-14773,-13283,-18141],[-13643,-12906,-18422],[-16532,-12769,-17193],[-15252,-13053,-17931],[-13656,-13459,-18276],[-17125,-14080,-15608],[-14087,-14121,-18129],[-15994,-15856,-15904],[-15129,-12894,-17993],[-14510,-13461,-18140],[-15533,-13812,-17698],[-13985,-14711,-17989],[-13576,-12938,-18310],[-17420,-13332,-14932],[-15562,-14255,-17656],[-16931,-14131,-16314],[-16207,-15775,-15328],[-17089,-12669,-16547],[-13923,-14849,-17955],[-15875,-13247,-17681],[-16074,-15770,-15534],[-16430,-12553,-17254],[-14886,-14313,-17918],[-13943,-14155,-18155],[-15899,-12552,-17711],[-16372,-13044,-17324],[-17298,-13493,-15642],[-13640,-14258,-18071],[-15628,-13568,-17729],[-16324,-15197,-16276],[-17309,-13303,-15622],[-16569,-12708,-17200],[-14506,-13782,-18046],[-17472,-12216,-15676],[-17285,-13152,-15893],[-13607,-14681,-18043],[-14695,-13743,-18011],[-13096,-13498,-18224]]
  });

}());
