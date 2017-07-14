(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj4Itm50', {
    "objectives": 4,
    "items": 50,
    "capacity": 14294,
    "profitMatrix": [[441, 725, 295, 442, 285, 157, 303, 428, 16, 949, 794, 529, 722, 137, 532, 669, 788, 598, 68, 845, 552, 7, 831, 5, 835, 972, 264, 177, 513, 249, 503, 268, 478, 771, 897, 968, 502, 323, 262, 999, 56, 264, 956, 486, 122, 907, 216, 435, 345, 793], [461, 459, 838, 676, 643, 748, 346, 740, 337, 37, 613, 38, 847, 614, 973, 134, 847, 964, 479, 833, 165, 585, 256, 969, 839, 681, 761, 717, 177, 107, 216, 915, 330, 483, 203, 603, 299, 532, 347, 141, 139, 967, 869, 162, 704, 388, 739, 738, 121, 988], [217, 260, 758, 837, 600, 390, 625, 402, 882, 648, 530, 437, 502, 268, 688, 173, 849, 551, 240, 294, 892, 204, 867, 951, 398, 773, 559, 792, 505, 783, 327, 855, 132, 874, 289, 787, 198, 733, 630, 962, 967, 63, 98, 333, 749, 774, 604, 631, 705, 209], [416, 525, 360, 97, 552, 82, 714, 679, 893, 731, 61, 381, 763, 595, 873, 530, 699, 843, 317, 893, 531, 31, 850, 195, 720, 397, 805, 156, 383, 920, 779, 468, 577, 670, 240, 46, 43, 515, 541, 327, 966, 135, 836, 137, 911, 109, 443, 774, 505, 368]],
    "weights": [265, 97, 847, 277, 495, 61, 305, 193, 643, 831, 252, 230, 353, 768, 329, 955, 135, 118, 370, 454, 918, 604, 454, 23, 171, 484, 759, 431, 457, 906, 948, 184, 787, 879, 455, 196, 785, 271, 913, 373, 339, 681, 467, 889, 225, 148, 765, 402, 2, 929],
    "pareto": [[-20261,-21540,-24235,-20409],[-20117,-20191,-23622,-20730],[-19938,-23570,-22353,-19352],[-19770,-21119,-23238,-21111],[-20205,-22861,-22613,-19162],[-19849,-21244,-23574,-20959],[-19020,-23244,-22866,-19782],[-20641,-22755,-22181,-19649],[-20890,-21931,-23198,-19758],[-20441,-22353,-22459,-20099],[-20314,-22000,-22664,-20559],[-19449,-22117,-23855,-20273],[-20073,-21177,-23347,-20722],[-20550,-22591,-23011,-19938],[-19817,-23293,-22967,-19650],[-19576,-22470,-23650,-19813],[-19708,-23055,-22415,-19811],[-19273,-22412,-23541,-20202],[-20094,-22619,-22792,-19715],[-20313,-21682,-23593,-19833],[-19973,-22342,-23406,-20013],[-19690,-22940,-23172,-20110],[-18972,-23016,-23407,-20090],[-20309,-21768,-23694,-20101],[-19146,-22059,-23746,-20662],[-19099,-23369,-23202,-19630],[-19957,-22231,-23432,-19920],[-20157,-22633,-23154,-19470],[-19846,-21989,-23611,-20473],[-20554,-22505,-22910,-19670],[-20152,-21302,-23683,-20570],[-20602,-22733,-22369,-19362],[-19879,-21357,-23790,-20950],[-20393,-22125,-23000,-20407],[-20890,-22137,-22702,-19088],[-19829,-23633,-22240,-19001],[-21030,-22280,-22054,-18610],[-20694,-22854,-21766,-18522],[-20157,-22839,-22658,-18800],[-18988,-23569,-22918,-19727],[-20587,-21873,-23089,-20147],[-19921,-23269,-22684,-19565],[-19660,-22999,-23035,-19310],[-20816,-22096,-22438,-19804],[-20010,-21624,-23484,-20222],[-20043,-22996,-22309,-19443],[-20190,-22001,-23333,-19947],[-19909,-22209,-23477,-19558],[-19131,-22772,-23385,-19747],[-20261,-21746,-23739,-19739],[-20554,-22711,-22414,-19000],[-19372,-23595,-22702,-19584],[-19775,-21375,-23389,-20866],[-20842,-21909,-23243,-19396],[-19116,-21912,-24105,-20532],[-19958,-21482,-24126,-20798],[-20305,-23295,-22468,-19422],[-20768,-22074,-22483,-19442],[-19357,-22735,-23422,-20369],[-19513,-21784,-23861,-20732],[-20057,-22871,-22791,-19510],[-20525,-22014,-23057,-19501],[-19816,-21842,-23970,-20343],[-21104,-21500,-22771,-19530],[-21196,-21621,-22168,-18690],[-19042,-22077,-23345,-20578],[-20187,-21705,-23475,-20455],[-20057,-22665,-23287,-20180],[-20502,-22569,-23056,-19576],[-19586,-22958,-22771,-20026],[-19742,-22007,-23210,-20389],[-20271,-22234,-22860,-19952],[-20048,-22913,-22609,-19318],[-19834,-23588,-21952,-19268],[-19805,-20425,-24242,-20108],[-20032,-20702,-23523,-21037],[-21264,-21433,-22117,-19258],[-20105,-22893,-22746,-19872],[-20811,-22038,-22548,-19171],[-20472,-19922,-23510,-20568],[-20859,-22060,-22503,-19533],[-19680,-22446,-23367,-19728],[-20184,-20518,-23177,-20842],[-21016,-20803,-22936,-20016],[-20747,-21229,-22703,-20204],[-20733,-22083,-22385,-20155],[-20770,-21365,-22463,-20364],[-20796,-21178,-23268,-19956],[-20319,-22256,-22815,-20314],[-20672,-20324,-23232,-20118],[-20728,-21399,-22603,-20290],[-20393,-22297,-23079,-19598],[-20059,-22162,-22771,-20432],[-20547,-20827,-22981,-20654],[-20026,-22794,-22592,-19955],[-20067,-20549,-23896,-20843],[-20189,-21202,-22959,-20707],[-19770,-21111,-23995,-20903],[-20349,-21306,-23668,-19556],[-20471,-22492,-22857,-20021],[-20263,-21037,-23719,-20661],[-20508,-21774,-22935,-20230],[-20477,-20606,-23292,-20433],[-19927,-21611,-23431,-20573],[-20642,-21507,-23521,-19846],[-19984,-20680,-23568,-20675],[-20556,-22002,-22394,-19922],[-20288,-22385,-22120,-20089],[-20504,-21860,-23036,-20498],[-20078,-21433,-23498,-20477],[-19816,-22048,-23474,-19673],[-20596,-20776,-23546,-20406],[-20308,-21372,-23213,-20680],[-20011,-21934,-23312,-20740],[-20362,-22220,-22880,-20043],[-20563,-21408,-23367,-19929],[-19864,-22070,-23429,-20035],[-20354,-22103,-23188,-20120],[-20611,-21430,-23322,-20291],[-20006,-21710,-23585,-20490],[-19742,-20884,-23261,-21047],[-19021,-22937,-23097,-20204],[-19418,-23203,-22728,-19682],[-19164,-22140,-23564,-20224],[-19324,-22995,-23206,-19815],[-20807,-21918,-23145,-20109],[-19627,-21908,-23528,-20883],[-19708,-23021,-22990,-19672],[-18973,-22709,-23638,-20512],[-20444,-21032,-23609,-20626],[-20529,-20542,-23146,-20527],[-19526,-22024,-23708,-20353],[-19930,-21966,-23637,-20494],[-18745,-22126,-24168,-20296],[-18780,-22114,-23780,-20367],[-20141,-20974,-23500,-21015],[-18732,-21886,-24321,-20675],[-20072,-22402,-22618,-20053],[-19129,-21758,-24077,-20875],[-21073,-21423,-22572,-19975],[-19673,-22639,-23503,-20323],[-20811,-21832,-23044,-19841],[-19721,-22867,-22962,-20015],[-20976,-22029,-21784,-19532],[-19480,-22044,-23645,-20178],[-19432,-21816,-24186,-20486],[-20844,-21200,-23223,-20318],[-20313,-20559,-23644,-20491],[-20346,-21050,-23772,-20310],[-19386,-21085,-24211,-21046],[-20267,-20951,-23618,-20393],[-20359,-21290,-23619,-19931],[-19312,-21250,-23451,-21092],[-21220,-21590,-22234,-18156],[-19691,-20986,-23659,-21055],[-21268,-21612,-22189,-18518],[-18620,-22393,-23806,-20350],[-19109,-23846,-22304,-19429],[-19493,-23872,-22088,-19286],[-19275,-23046,-22641,-20063],[-21128,-21469,-22837,-18996],[-18653,-21761,-23985,-20827],[-19293,-23470,-22366,-19736],[-18861,-23216,-23123,-20187],[-20591,-22855,-22062,-19022],[-20573,-22242,-22516,-19193],[-20982,-22052,-22595,-18918],[-19434,-21659,-23525,-20884],[-19401,-22291,-23346,-20407],[-19978,-22540,-22951,-20332],[-20840,-22065,-22504,-19270],[-20298,-21028,-23817,-19948],[-19377,-22065,-22706,-20665],[-19039,-22770,-22897,-20248],[-20064,-22472,-23151,-19585],[-19245,-23242,-22907,-20044],[-19737,-21717,-23634,-20495],[-19932,-21809,-22976,-20892],[-18909,-23444,-22582,-19879],[-19037,-21787,-23769,-20684],[-18747,-22746,-23601,-19890],[-19017,-22265,-23562,-20550],[-20933,-22485,-22107,-19705],[-20795,-21251,-22658,-20566],[-19202,-22932,-22987,-20169],[-19156,-22201,-23012,-20729],[-19044,-22708,-22497,-20404],[-19691,-21020,-23084,-21194],[-19358,-21981,-23426,-20532],[-19535,-21971,-22645,-20831],[-18317,-22335,-23697,-20739],[-20029,-21481,-22985,-20690],[-19763,-23045,-22194,-19800],[-19764,-22194,-21994,-20488],[-18658,-22051,-23561,-20721],[-20592,-22769,-22243,-19723],[-19385,-22430,-23414,-20409],[-19856,-22131,-22877,-20540],[-20032,-20736,-22948,-21176],[-19356,-23734,-22770,-19586],[-20018,-20600,-23331,-21091],[-19515,-22415,-23013,-20558],[-19450,-23562,-22168,-19411],[-19659,-23069,-22477,-19885],[-18942,-22838,-22943,-20287],[-20685,-21855,-22926,-20463],[-19771,-22562,-22992,-20210],[-19512,-22783,-23209,-19949],[-20214,-21088,-23154,-20909],[-18815,-22485,-23148,-20747],[-18971,-21534,-23587,-21110],[-20395,-21622,-22484,-20659],[-20362,-22254,-22305,-20182],[-20561,-21001,-22890,-20625],[-19198,-23510,-22280,-19821],[-18993,-22039,-22922,-20808],[-18830,-23345,-22428,-19962],[-18500,-21827,-23071,-20956],[-20824,-22247,-21555,-19866],[-20541,-20506,-22313,-20784],[-20829,-19910,-22646,-20510],[-19004,-22419,-23590,-20207],[-19327,-20419,-24402,-20450],[-20027,-20446,-23372,-21282],[-19115,-22911,-23453,-19749],[-19899,-22441,-22797,-20415],[-20106,-20571,-23708,-21130],[-19159,-22299,-23593,-20283],[-20235,-21901,-22510,-20642],[-19800,-21258,-23636,-21033],[-19373,-21150,-24377,-19890],[-20103,-21353,-23118,-20818],[-19070,-21092,-24268,-20279],[-19658,-21618,-23480,-20578],[-20576,-21617,-22374,-20624],[-19355,-21560,-23371,-20967],[-20335,-20794,-23057,-20787],[-20240,-22157,-22661,-20397],[-19129,-22152,-23952,-20153],[-20395,-21083,-23044,-20874],[-20078,-21467,-22923,-20616],[-20154,-21214,-23347,-20636],[-20103,-21316,-23745,-20644],[-19813,-21498,-23483,-20654],[-19994,-21078,-23193,-20805],[-20344,-22139,-23062,-20481],[-19769,-22110,-23343,-20120],[-20054,-21367,-23180,-20892],[-19326,-22864,-22727,-20144],[-19250,-23160,-22446,-19861],[-20019,-20527,-23941,-20481],[-19447,-23141,-22113,-19846],[-18912,-22160,-23105,-20580],[-21023,-21557,-21878,-19487],[-20273,-21525,-22840,-20874],[-19428,-22734,-22281,-20261],[-20306,-22081,-23233,-19758],[-20554,-19792,-22540,-20806],[-20074,-22620,-23101,-19821],[-20488,-22787,-21842,-19639],[-20419,-21052,-23110,-20340],[-19676,-23364,-21462,-19503],[-20314,-21992,-23421,-20351],[-20392,-22367,-22521,-20173],[-21025,-21401,-22617,-19613],[-19721,-21162,-23430,-21151],[-20971,-21415,-22520,-20063],[-21058,-20769,-22796,-20090],[-19566,-21359,-22995,-20951],[-21098,-21309,-22767,-20177],[-19199,-22511,-22932,-20604],[-19214,-23371,-22212,-19819],[-20698,-21680,-22593,-20270],[-19947,-22669,-22256,-20107],[-20090,-22239,-22970,-19987],[-20313,-22271,-22315,-20291],[-19247,-22739,-22391,-20296],[-19278,-22610,-23086,-20521],[-20713,-20745,-22827,-20405],[-20609,-21016,-23393,-20027],[-20850,-20885,-23090,-20265],[-20352,-21689,-23259,-19856],[-20235,-21867,-23085,-20503],[-20226,-23170,-22132,-19574],[-20790,-22156,-22507,-19424],[-19998,-20645,-23900,-20734],[-19530,-21739,-23675,-20373],[-18574,-21662,-23831,-20910],[-19403,-21386,-23880,-20833],[-20542,-21526,-23326,-20182],[-20182,-21415,-23899,-20561],[-20468,-21001,-23675,-20092],[-19594,-22514,-23167,-20475],[-18961,-22109,-23670,-20332],[-19888,-22327,-23436,-19811],[-19935,-22230,-23031,-20457],[-19540,-22227,-22796,-20586],[-19777,-22006,-22541,-20692],[-19738,-23168,-22631,-19802],[-19405,-22963,-22881,-20061],[-19707,-23235,-22157,-19728],[-20161,-22032,-22325,-20549],[-20361,-22434,-22047,-20099],[-20737,-21997,-22284,-19887],[-19842,-23144,-22348,-19717],[-21024,-21474,-22007,-20223],[-20409,-22662,-21506,-19791],[-19931,-22808,-22324,-20109],[-19501,-22848,-21935,-20155],[-20562,-21481,-22757,-20539],[-18354,-23700,-22312,-19652],[-20147,-23071,-21978,-19657],[-20606,-21730,-22590,-20615],[-20649,-21731,-22028,-20518],[-19929,-22245,-22531,-20434],[-20102,-21595,-22639,-20584],[-20957,-22454,-22173,-19171],[-21110,-21807,-21149,-19466],[-17644,-23403,-21894,-19893],[-21497,-20361,-21713,-20032],[-21447,-20495,-21019,-19544],[-20732,-20310,-22354,-20737],[-21190,-21598,-21357,-19304],[-21026,-21671,-21510,-19419],[-20480,-20593,-22581,-20775],[-21283,-20998,-21644,-19590],[-21221,-21469,-22052,-19529],[-20934,-19915,-22760,-20252],[-20487,-20576,-23286,-20453],[-20108,-22684,-22589,-19718],[-21190,-21392,-21853,-19974],[-20810,-22111,-21938,-19781],[-19441,-22964,-22487,-19814],[-20841,-22188,-22137,-19336],[-20815,-21649,-21874,-20269],[-19034,-23177,-22944,-19825],[-20339,-21449,-23412,-20235],[-19867,-22815,-22892,-19480],[-21007,-21900,-22479,-19757],[-20615,-20341,-23073,-20738],[-21098,-21515,-22271,-19507],[-19784,-22802,-22839,-19831],[-19675,-22136,-22987,-20575],[-20325,-21612,-23335,-19951],[-19978,-22194,-23096,-20186],[-18701,-22361,-23481,-20596],[-18579,-21926,-23225,-20873],[-20567,-22886,-21996,-19556],[-20900,-20527,-22816,-20152],[-19050,-21633,-23741,-21027],[-18924,-24032,-21566,-18832],[-19337,-21136,-23646,-21294],[-20306,-20004,-23664,-20817],[-20010,-22933,-22660,-19957],[-19364,-22971,-22034,-20022],[-20479,-22189,-22161,-20042],[-19307,-20960,-23875,-21198],[-19539,-23226,-22144,-19803],[-18863,-22713,-22607,-20439],[-19317,-23224,-21873,-19848],[-20928,-21801,-22325,-19840],[-20600,-22319,-22440,-19098],[-20533,-22829,-22373,-19253],[-20024,-22174,-23159,-20361],[-19597,-23519,-22653,-19638],[-21142,-21370,-21898,-19612],[-20230,-21669,-23540,-20184],[-19794,-22336,-22340,-20445],[-19664,-22030,-23579,-19630],[-18886,-23631,-22245,-19640],[-19634,-23186,-22230,-19718],[-19767,-21893,-23405,-20591],[-19580,-22973,-22271,-20003],[-20285,-22199,-23192,-20011],[-20869,-20450,-22617,-20597],[-20321,-20658,-23440,-20702],[-19659,-23072,-22425,-19920],[-20566,-20392,-22508,-20986],[-19548,-21783,-23192,-21035],[-19892,-21597,-23637,-20571],[-19370,-22975,-23269,-19990],[-19971,-21722,-23973,-20419],[-19688,-21768,-23069,-20743],[-19400,-22168,-23290,-20521],[-19862,-21484,-23421,-20580],[-20251,-19734,-22431,-21195],[-20065,-20135,-23967,-20579],[-18866,-21429,-23130,-21140],[-19196,-22947,-22487,-20146],[-18442,-22068,-24059,-20685],[-19142,-21998,-23924,-20496],[-19640,-22148,-23375,-20504],[-19383,-21867,-23621,-20734],[-20019,-21950,-23432,-20111],[-19096,-21267,-23949,-21056],[-19177,-21986,-23536,-20567],[-20111,-20835,-23102,-21093],[-21435,-20203,-22141,-19585],[-20351,-20597,-23648,-20478],[-20318,-21229,-23469,-20001],[-20646,-20418,-23272,-20293],[-21314,-21075,-21843,-19145],[-19848,-22315,-23441,-19272],[-21036,-21704,-22106,-18485],[-20061,-19825,-23766,-20889],[-20502,-21514,-23331,-19643],[-20493,-22817,-22378,-18714],[-20293,-22209,-23152,-19834],[-20493,-22611,-22874,-19384],[-20912,-19788,-22879,-20067],[-20541,-22839,-22333,-19076],[-20798,-22166,-22467,-19247],[-20788,-22129,-22650,-19176],[-20245,-22187,-23197,-19472],[-20600,-22113,-22936,-19768],[-21264,-21227,-22613,-19928],[-20849,-21676,-21989,-19992],[-20961,-21169,-22504,-20317],[-19215,-23275,-22661,-19663],[-18403,-23852,-22281,-19527],[-20550,-21536,-23286,-20005],[-18894,-22584,-23302,-20664],[-19871,-21260,-22443,-20960],[-20316,-20958,-22708,-21026],[-19461,-22102,-22460,-20738],[-20854,-22360,-21771,-19857],[-20841,-21982,-22633,-20006],[-19561,-22023,-23039,-20656],[-19945,-22049,-22823,-20513],[-20554,-21382,-22961,-20328],[-18761,-22775,-21934,-20352],[-19953,-20611,-22612,-21328],[-19581,-22702,-22620,-20271],[-20497,-21492,-22038,-20776],[-20256,-20669,-22721,-20939],[-20365,-20907,-23273,-20778],[-20062,-20849,-23164,-21167],[-20108,-21580,-23139,-20607],[-20211,-19414,-22846,-21182],[-18826,-22094,-23843,-20542],[-18759,-23278,-22450,-20100],[-20755,-20295,-22272,-20630],[-19100,-22994,-22314,-20082],[-19100,-21267,-24224,-20706],[-20211,-20287,-22863,-21116],[-18573,-21941,-22725,-20850],[-20183,-22860,-22212,-19699],[-19444,-23311,-22990,-19551],[-19816,-20753,-23446,-21140],[-19391,-21349,-23605,-21009],[-17613,-23865,-21719,-19612],[-19645,-21458,-23149,-20868],[-20128,-23464,-21400,-18764],[-17564,-24311,-20956,-18677],[-20655,-21716,-22528,-20541],[-20505,-22951,-22147,-18735],[-20414,-20893,-23211,-20704],[-20793,-21960,-22678,-19644],[-20365,-20944,-22646,-20952],[-19829,-23332,-21801,-19513],[-17811,-22743,-23396,-20387],[-18465,-21942,-23286,-20758],[-19277,-23609,-22434,-19738],[-18700,-23360,-22829,-19813],[-20097,-22295,-22260,-20241],[-19648,-20676,-23739,-21180],[-20562,-22630,-21845,-19801],[-19466,-22052,-23234,-20509],[-20492,-21260,-23068,-20318],[-20562,-22931,-22284,-19289],[-21216,-21205,-22658,-19566],[-20697,-22195,-22199,-19814],[-20597,-20469,-22707,-20541],[-20452,-20763,-22338,-20786],[-20469,-23180,-21264,-18746],[-21099,-22021,-21876,-18917],[-21568,-21279,-20348,-18064],[-21268,-21818,-21693,-17848],[-21020,-19714,-22687,-20463],[-21330,-21741,-20709,-18826],[-21521,-20536,-21283,-18828],[-21404,-21576,-21469,-18780],[-21273,-19906,-22102,-19586],[-20514,-22909,-22329,-18927],[-20483,-22832,-22130,-19372],[-20009,-22271,-23295,-19741],[-21073,-21629,-22076,-19305],[-19755,-23463,-21616,-19420],[-19507,-22833,-22435,-20178],[-18297,-23348,-22604,-20148],[-20764,-22160,-22584,-19710],[-21147,-22249,-21335,-18609],[-21244,-21643,-22123,-19052],[-21213,-21772,-21428,-18827],[-20982,-22258,-22099,-18248],[-20894,-20842,-22949,-20205],[-20645,-21958,-22804,-19160],[-20397,-21328,-23623,-19918],[-19583,-22199,-22104,-20523],[-19456,-22164,-22860,-20582],[-19256,-23996,-20752,-17952],[-19535,-22289,-23196,-20430],[-19797,-21562,-22173,-20965],[-18768,-23055,-23120,-20302],[-21050,-21287,-22812,-19815],[-20808,-21491,-22505,-20187],[-20976,-21452,-22052,-19861],[-20776,-22500,-21857,-19061],[-20501,-21059,-22745,-20705],[-21024,-21680,-21511,-19553],[-20029,-21484,-22933,-20725],[-20552,-22091,-22981,-19406],[-21083,-20019,-22190,-20369],[-20863,-21300,-21601,-20290],[-21055,-21551,-22206,-19778],[-19331,-22185,-22220,-20740],[-19069,-22594,-22692,-20606],[-18284,-21844,-23569,-20920],[-19021,-22869,-21978,-20234],[-19642,-21037,-23094,-21303],[-19077,-22076,-22676,-20881],[-18538,-21953,-23113,-20779],[-19410,-22310,-22556,-20588],[-21249,-19937,-22036,-20120],[-20531,-20862,-22492,-20703],[-20946,-19879,-21927,-20509],[-20373,-20638,-22002,-20938],[-20482,-20876,-22554,-20777],[-20961,-20533,-21703,-20394],[-21035,-20368,-22463,-20348],[-20025,-22671,-22536,-20069],[-21164,-21823,-20863,-19075],[-21195,-21694,-21558,-19300],[-21452,-21227,-21196,-18801],[-19697,-22747,-23036,-19515],[-19946,-22546,-22200,-20221],[-21116,-21595,-21404,-19383],[-19832,-22667,-23246,-19918],[-20517,-22100,-22883,-20119],[-19838,-22347,-23305,-20041],[-20239,-21468,-23217,-20571],[-19973,-21219,-23457,-20671],[-20857,-21440,-23070,-19939],[-19622,-22078,-23676,-19911],[-19454,-22321,-23521,-20184],[-20331,-22273,-23029,-19799],[-20276,-21277,-23566,-20282],[-20345,-21615,-23162,-20164],[-19304,-21742,-23285,-20886],[-20315,-22724,-22626,-19541],[-19341,-22090,-23541,-20543],[-19151,-22263,-23412,-20573],[-20028,-22215,-22920,-20188],[-19626,-22215,-23297,-20461],[-19784,-22645,-23291,-19556],[-20119,-20811,-23555,-20751],[-19473,-22007,-23634,-20374],[-20160,-21343,-22881,-20723],[-18812,-22853,-23344,-20138],[-20109,-22272,-22677,-20084],[-19518,-23394,-22317,-19790],[-19971,-21928,-23477,-19749],[-19203,-22488,-23673,-19714],[-20203,-22241,-23180,-19568],[-19453,-22620,-22476,-20463],[-19072,-22138,-23076,-20725],[-19614,-21973,-23694,-19727],[-20144,-22967,-22577,-18876],[-18324,-23753,-22127,-19610],[-18305,-24146,-21549,-18717],[-21077,-20334,-22323,-20422],[-20810,-22506,-21740,-18598],[-18074,-24216,-21566,-18696],[-19696,-22948,-22091,-19851],[-18271,-23301,-22941,-19668],[-18825,-23093,-23191,-19759],[-20604,-20491,-22572,-20656],[-20745,-22122,-21219,-20018],[-19443,-23096,-22370,-19870],[-17597,-24004,-21787,-19614],[-18890,-21398,-21706,-21121],[-17826,-23603,-22676,-19602],[-21028,-20385,-21758,-20670],[-20692,-22234,-22333,-18928],[-18936,-23245,-22524,-20101],[-18722,-23865,-22164,-19511],[-20854,-19796,-22841,-20712],[-20553,-23179,-21606,-18427],[-20795,-20615,-21857,-20643],[-19042,-23749,-22201,-19480],[-19701,-23250,-21657,-19705],[-18784,-20856,-22617,-21350],[-20236,-22625,-22472,-19624],[-20024,-21228,-22782,-20970],[-20687,-20669,-21894,-20688],[-18722,-20185,-24473,-19221],[-19820,-23881,-21562,-18139],[-20903,-21927,-22259,-19070],[-20844,-20564,-22422,-20395],[-20286,-20845,-22492,-21035],[-19041,-20601,-24415,-20110],[-19725,-22009,-23498,-19670],[-19741,-23756,-21226,-18291],[-18114,-22801,-23505,-19998],[-19347,-23982,-22092,-18724],[-19708,-19673,-23453,-21244],[-19853,-20447,-24197,-20470],[-20325,-19569,-23191,-21149],[-19338,-20039,-24316,-20050],[-18339,-22840,-23032,-20437],[-19121,-23874,-22537,-19328],[-18919,-22999,-22424,-20117],[-17561,-23592,-22153,-19808],[-17981,-24030,-21571,-19471],[-18784,-21256,-24316,-20022],[-18241,-23154,-23300,-19538],[-19017,-21142,-23613,-21208],[-19365,-23186,-22654,-19703],[-21165,-21750,-21473,-18465],[-18380,-24039,-21944,-19288],[-18482,-23977,-22617,-19375],[-20604,-23109,-21516,-19074],[-18528,-23666,-22509,-19624],[-20300,-19683,-22996,-20947],[-19573,-22198,-22314,-20488],[-18657,-20575,-24631,-20253],[-19336,-19625,-24387,-19786],[-19212,-22751,-22779,-20225],[-20783,-20651,-22690,-20386],[-19426,-21061,-23039,-21253],[-19007,-23908,-21631,-19342],[-19631,-22174,-22250,-20524],[-18083,-23968,-22244,-19558],[-18212,-20877,-24366,-20187],[-18548,-23924,-22039,-18765],[-20554,-20428,-23341,-20729],[-18747,-21969,-23507,-20694],[-18931,-22244,-22385,-20713],[-19659,-20195,-22139,-21357],[-20557,-22381,-22584,-19195],[-17598,-23005,-22439,-20397],[-18686,-21460,-24359,-19700],[-21165,-21544,-21969,-19135],[-18540,-24006,-21782,-18975],[-19220,-21313,-22568,-21040],[-19217,-22101,-23938,-19527],[-17725,-23358,-22234,-19937],[-18195,-23461,-22759,-19883],[-20352,-20735,-23639,-20257],[-19945,-21129,-22628,-21053],[-18673,-21220,-24512,-20079],[-19662,-23657,-21072,-18374],[-20252,-21788,-23557,-19547],[-20267,-22702,-22671,-19179],[-19123,-22807,-22651,-20321],[-18963,-21952,-23009,-20730],[-19599,-19435,-22901,-21405],[-21448,-20618,-20652,-19610],[-20736,-22671,-20980,-18644],[-21238,-21658,-21623,-19029],[-18851,-20774,-24286,-20140],[-21068,-22150,-21181,-18692],[-20491,-19487,-23037,-20900],[-19951,-19372,-22594,-21369],[-20060,-19610,-23146,-21208],[-20058,-20061,-23870,-20887],[-20311,-21268,-23664,-19569],[-20967,-20854,-22371,-20264],[-18868,-21992,-22923,-20815],[-19340,-20659,-24249,-20071],[-18298,-20892,-22160,-21406],[-21497,-20567,-21217,-19362],[-20260,-20236,-23428,-20868],[-21370,-20515,-21861,-19310],[-19117,-22822,-22151,-20298],[-21618,-21145,-21042,-18552],[-21244,-21849,-21627,-18382],[-18049,-22068,-23150,-20848],[-17308,-22233,-22557,-20808],[-20423,-19973,-22945,-20816],[-18525,-21713,-23266,-21158],[-17091,-23489,-21628,-19862],[-19171,-21330,-22578,-21149],[-20301,-20433,-22463,-21045],[-19715,-22211,-22004,-20597],[-19155,-20685,-22697,-21323],[-17775,-22972,-22513,-20398],[-20162,-19465,-22281,-21430],[-18686,-22852,-23565,-19604],[-19573,-23674,-21904,-18391],[-17848,-24108,-22011,-19300],[-18879,-19949,-23404,-21321],[-17588,-24252,-21109,-18752],[-18531,-24254,-21104,-18113],[-18709,-19945,-24626,-19600],[-20605,-20706,-23192,-20337],[-17362,-24144,-21554,-19356],[-19900,-19874,-22753,-21296],[-18689,-24172,-21333,-18574],[-21414,-20527,-21604,-19168],[-18768,-20611,-24435,-20196],[-20907,-21082,-22796,-19826],[-19186,-24012,-20956,-18064],[-18915,-24280,-20888,-17970],[-18713,-24113,-21486,-18649],[-20323,-19155,-23262,-20885],[-20791,-22717,-21245,-17665],[-21282,-21513,-21250,-19134],[-20086,-22977,-22486,-19283],[-21361,-21612,-21404,-19051],[-20421,-20418,-21260,-20863],[-21173,-21376,-22170,-18695],[-21081,-21255,-22773,-19535],[-20207,-20720,-22156,-21187],[-20452,-20237,-22163,-21019],[-21295,-20824,-22346,-19307],[-20959,-21878,-22524,-19395],[-17810,-23742,-22744,-19604],[-19401,-21168,-23397,-21065],[-17684,-23366,-21387,-19898],[-18363,-21943,-23723,-20837],[-19267,-23015,-23069,-19261],[-20593,-22245,-22343,-19406],[-21112,-20952,-21435,-20053],[-21007,-22106,-21983,-19087],[-18927,-22283,-23676,-19537],[-18304,-20544,-22140,-21485],[-18319,-23853,-21939,-19846],[-17798,-22462,-23707,-19085],[-19781,-20917,-22292,-21139],[-20154,-20799,-23167,-20822],[-21356,-21554,-21514,-18418],[-20133,-23402,-21000,-18920],[-20767,-22748,-21179,-18199],[-20505,-23157,-21651,-18065],[-20720,-20346,-23187,-20480],[-18545,-23961,-21494,-19242],[-21521,-20330,-21779,-19498],[-21413,-20404,-21971,-19102],[-20082,-23472,-21090,-18273],[-19794,-20582,-22617,-21276],[-20156,-23307,-21850,-18227],[-20980,-22414,-21360,-18122],[-21283,-20421,-21912,-19919],[-18367,-20757,-24369,-20263],[-19467,-19804,-23756,-21006],[-20755,-22202,-22402,-19518],[-18383,-22794,-23456,-19993],[-20076,-21872,-22515,-20590],[-17972,-24278,-20893,-18609],[-17340,-23639,-22219,-19658],[-18194,-23768,-22528,-19461],[-20990,-20727,-22003,-20299],[-19015,-22884,-21478,-20211],[-18787,-21304,-22794,-21292],[-19507,-20790,-22291,-21376],[-19821,-19749,-22417,-21448],[-17314,-21885,-22537,-20887],[-21207,-19589,-21831,-20443],[-19877,-19537,-21834,-21415],[-21194,-20303,-21604,-20421],[-20986,-20419,-21898,-20596],[-21186,-20821,-21620,-20146],[-19287,-22007,-22207,-20746],[-17158,-23439,-21437,-19949],[-17938,-23096,-23191,-19927],[-19975,-21116,-21947,-21026],[-20306,-22972,-21948,-18679],[-19326,-22247,-22620,-20584],[-19710,-22273,-22404,-20441],[-16996,-21926,-21837,-20905],[-18547,-22218,-22601,-20856],[-18436,-23246,-22642,-19935],[-21097,-21598,-22142,-18771],[-21082,-20738,-22862,-19556],[-21642,-21114,-21108,-18018],[-20862,-21177,-21968,-20224],[-21330,-20526,-21738,-19545],[-21428,-20930,-21492,-19212],[-20105,-20850,-22602,-21070],[-21443,-19443,-20197,-20085],[-21195,-21900,-21062,-18630],[-18705,-19959,-23147,-21336],[-21200,-19988,-21471,-20368],[-19425,-19445,-22644,-21420],[-20356,-19646,-23390,-20704],[-19460,-23101,-21808,-19955],[-17876,-19533,-21669,-21608],[-17797,-19408,-21333,-21760],[-21331,-20443,-21867,-20281],[-18703,-21267,-23040,-21219],[-18639,-20608,-22024,-21388],[-19046,-20447,-22145,-21484],[-19229,-20554,-22882,-21416],[-18560,-20483,-21688,-21540],[-20103,-19705,-22099,-21238],[-19570,-20270,-22746,-21398],[-19491,-20145,-22410,-21550],[-19875,-20171,-22194,-21407],[-20900,-20620,-21971,-20385],[-21482,-21181,-21762,-18290],[-19626,-21992,-23575,-19643],[-21410,-20317,-21946,-19383],[-21568,-21073,-20844,-18734],[-21163,-21906,-20734,-18339],[-19574,-22056,-23721,-19549],[-20768,-19997,-22914,-20501],[-19487,-21234,-22659,-21103],[-18344,-23515,-21827,-19783],[-18402,-19460,-21619,-21557],[-20953,-19480,-22287,-20584],[-20096,-22945,-22622,-18514],[-20671,-19761,-21821,-20805],[-20446,-19846,-22577,-20851],[-17332,-23429,-21694,-19934],[-19955,-21817,-23503,-19656],[-21156,-20645,-21849,-20050],[-19737,-20628,-23110,-21292],[-20779,-22171,-22468,-18984],[-20408,-21862,-22331,-20280],[-18782,-21366,-23194,-21136],[-19358,-20858,-23477,-21190],[-21194,-21983,-20933,-17894],[-20887,-22541,-21298,-18547],[-19293,-20122,-22829,-21308],[-21116,-21801,-20908,-18713],[-21403,-21082,-21608,-18373],[-21079,-21520,-22272,-19244],[-20916,-20892,-21243,-20345],[-17354,-21848,-22030,-20892],[-20904,-19531,-21722,-20832],[-21352,-20826,-20613,-19235],[-20442,-19538,-22472,-21148],[-20780,-19961,-22081,-20758],[-20192,-20195,-21911,-21206],[-20539,-19138,-22764,-20921],[-18478,-20534,-22397,-21470],[-18830,-20471,-22090,-21434],[-19847,-23584,-21013,-18580],[-18181,-19434,-21117,-21617],[-20787,-19562,-22441,-20833],[-18973,-23052,-21829,-20217],[-21331,-20649,-21371,-19611],[-17906,-19646,-21885,-21599],[-17695,-19470,-20660,-21673],[-18251,-22617,-22629,-20708],[-19442,-19979,-22784,-21346],[-19789,-22080,-22189,-20690],[-21451,-21104,-21563,-18735],[-19112,-19083,-22504,-21425],[-19101,-20263,-22920,-21364],[-21281,-20577,-21173,-19793],[-21569,-19981,-21506,-19519],[-21451,-21310,-21067,-18065],[-19525,-19600,-22141,-21451],[-21355,-20412,-21933,-19747],[-20981,-22331,-21489,-18858],[-17551,-23273,-21812,-20174],[-17962,-21432,-22447,-21179],[-19967,-21634,-21963,-20751],[-21361,-21818,-20908,-18381],[-18224,-21023,-21975,-21313],[-20155,-22219,-23225,-19206],[-21389,-20435,-21905,-19636],[-20726,-20031,-23054,-20427],[-18061,-19744,-21755,-21575],[-20671,-20397,-22622,-20728],[-20612,-20222,-21301,-20816],[-21033,-21233,-22818,-19173],[-19087,-21293,-22824,-21076],[-20702,-22551,-21070,-18543],[-21020,-21896,-21540,-19069],[-20018,-22170,-21924,-20393],[-19245,-21199,-22763,-21242],[-18965,-20858,-22568,-21353],[-21730,-18930,-20401,-19075],[-18587,-20772,-22949,-21309],[-21658,-20084,-19848,-17887],[-21282,-21719,-20754,-18464],[-18626,-19132,-21382,-21683],[-19017,-22834,-22101,-20232],[-20745,-19596,-22581,-20759],[-21215,-21484,-21552,-19506],[-21447,-20543,-21414,-18936],[-21434,-20286,-22012,-18849],[-17746,-24170,-21338,-19213],[-17002,-21911,-22337,-20928],[-21341,-20413,-21950,-19274],[-21099,-22227,-21380,-18247],[-18310,-24101,-21261,-18984],[-20656,-19107,-22045,-20920],[-21385,-21581,-21470,-18517],[-21361,-20603,-21937,-19100],[-21194,-21777,-21429,-18564],[-19009,-22823,-22712,-20206],[-16789,-24194,-21056,-18793],[-20853,-20587,-21740,-20439],[-18738,-18886,-21907,-21645],[-21355,-21627,-20904,-19028],[-21245,-21438,-22118,-18995],[-21658,-19878,-20344,-18557],[-17960,-23601,-22526,-19625],[-20911,-22510,-21364,-18013],[-19775,-23073,-22427,-19699],[-18633,-22808,-22317,-20375],[-16675,-22773,-22024,-20438],[-20867,-20036,-22688,-20333],[-19250,-20276,-22713,-21312],[-17656,-21110,-22227,-21299],[-21680,-19677,-20514,-19040],[-19685,-20344,-22065,-21437],[-21449,-20339,-21758,-19670],[-21473,-20308,-21824,-19136],[-19657,-23757,-20884,-18610],[-20229,-21225,-21491,-20885],[-18977,-22975,-22360,-20153],[-19247,-22148,-22466,-20667],[-18237,-22902,-22359,-20350],[-21311,-20961,-22211,-19213],[-19309,-19617,-22639,-21415],[-18880,-23051,-23220,-19491],[-21107,-20696,-21284,-20298],[-18771,-19367,-22640,-21443],[-21132,-20145,-22032,-19974],[-21147,-21672,-21603,-18938],[-20465,-19523,-22390,-21041],[-21062,-21785,-21194,-19104],[-21307,-20390,-21978,-19385],[-21476,-21196,-21262,-18267],[-21385,-21787,-20974,-17847],[-21340,-20486,-21340,-19884],[-19125,-20572,-22481,-21332],[-20328,-19383,-22127,-21181],[-21202,-21928,-20546,-18626],[-21340,-20692,-20844,-19214],[-18627,-22186,-23756,-19008],[-21012,-21735,-22040,-19019],[-17075,-23628,-21696,-19864],[-20525,-20877,-21992,-20680],[-21402,-21155,-20998,-18983],[-21219,-21663,-21624,-18766],[-17852,-23114,-21983,-20256],[-21041,-20625,-21605,-20291],[-17535,-19817,-21805,-21626],[-20707,-22180,-22447,-19156],[-18628,-21807,-22178,-20987],[-18396,-23034,-23303,-19614],[-21663,-19623,-20520,-18398],[-20959,-19165,-22154,-20531],[-18323,-19335,-21283,-21709],[-21688,-19509,-20715,-18600],[-21315,-19872,-21962,-19660],[-20177,-19579,-22427,-21207]]
  });

}());
