(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj2Itm50', {
    "objectives": 2,
    "items": 50,
    "capacity": 17119,
    "profitMatrix": [[419, 12, 688, 349, 846, 499, 575, 656, 824, 44, 501, 125, 621, 954, 466, 920, 848, 802, 23, 196, 130, 570, 411, 822, 563, 89, 722, 501, 172, 686, 209, 282, 461, 749, 679, 64, 807, 919, 291, 202, 396, 203, 919, 645, 169, 21, 427, 974, 515, 763], [490, 589, 896, 374, 277, 214, 599, 839, 2, 186, 179, 230, 861, 480, 894, 495, 114, 518, 117, 429, 599, 282, 258, 878, 435, 697, 783, 964, 850, 893, 909, 532, 120, 86, 303, 65, 418, 301, 234, 989, 482, 317, 482, 373, 704, 918, 523, 218, 920, 247]],
    "weights": [853, 739, 195, 965, 791, 929, 422, 354, 711, 720, 897, 309, 702, 700, 488, 163, 582, 577, 800, 533, 934, 550, 611, 78, 473, 669, 986, 526, 724, 479, 217, 802, 632, 778, 719, 899, 190, 145, 809, 44, 71, 479, 529, 484, 947, 642, 418, 810, 430, 26],
    "pareto": [[-21446,-19325],[-18069,-21589],[-19795,-20935],[-19389,-21090],[-18763,-21173],[-21339,-19593],[-20872,-20039],[-21074,-19902],[-18197,-21530],[-18874,-21103],[-19439,-20952],[-20532,-20432],[-20607,-20348],[-20131,-20638],[-20262,-20489],[-20194,-20604],[-20822,-20177],[-19526,-21048],[-20991,-19951],[-21237,-19620],[-20744,-20306],[-21396,-19463],[-20331,-20562],[-21136,-19650],[-18206,-21547],[-21669,-18805],[-21567,-19130],[-20081,-20776],[-18761,-21275],[-19932,-20893],[-21894,-18503],[-20816,-20081],[-21066,-19867],[-21487,-19406],[-21555,-19185],[-19972,-20794],[-21679,-18674],[-18924,-21062],[-17839,-21582],[-21597,-19088],[-18803,-21351],[-19886,-20878],[-21289,-19731],[-20292,-20435],[-18365,-21368],[-19240,-21207],[-21350,-19448],[-20077,-20606],[-19320,-21109],[-20945,-19936],[-18358,-21480],[-20705,-20179],[-20285,-20547],[-20698,-20291],[-19893,-20766],[-20133,-20614],[-18636,-21312],[-18835,-21236],[-20827,-20017],[-20752,-20101],[-19441,-20928],[-19964,-20778],[-21165,-19845],[-21028,-19887],[-18934,-21027],[-21781,-18124],[-21757,-18545],[-21654,-19266],[-21722,-19045],[-20244,-20466],[-21657,-19077],[-20854,-19993],[-20929,-19909],[-20919,-19961],[-21564,-18993],[-20836,-19825],[-21727,-18683],[-20514,-20264],[-20151,-20382],[-20101,-20520],[-20761,-19909],[-21856,-18409],[-20439,-20348],[-21744,-18663],[-21355,-19260],[-20886,-19687],[-21677,-18821],[-22033,-17933],[-21966,-18091],[-21466,-19069],[-21416,-19207],[-21287,-19481],[-21174,-19653],[-20874,-19737],[-20627,-20092],[-20552,-20176],[-20694,-19934],[-17737,-21215],[-21836,-18665],[-18952,-21190],[-19358,-21079],[-21661,-19154],[-18103,-21202],[-19940,-20634],[-19934,-20791],[-21464,-19242],[-21184,-19508],[-21562,-19073],[-20353,-20432],[-19702,-20851],[-19487,-20943],[-19171,-20985],[-21927,-18608],[-21279,-19465],[-21934,-18496],[-21537,-19268],[-21761,-18744],[-18526,-21188],[-21944,-18365],[-21494,-19294],[-22183,-17773],[-19011,-21061],[-21975,-17832],[-18605,-21378],[-21451,-18528],[-21302,-18719],[-21116,-19729],[-19567,-21007],[-21202,-19251],[-21176,-19549],[-21284,-18940],[-20381,-20424],[-20524,-20397],[-21269,-19093],[-19297,-21064],[-19272,-21092],[-19414,-21062],[-21276,-19017],[-21134,-19646],[-18785,-20920],[-19448,-20715],[-21247,-19534],[-21619,-18957],[-22016,-18185],[-21605,-19047],[-19816,-20511],[-18854,-20882],[-20802,-19963],[-21569,-19095],[-22009,-18297],[-21637,-18874],[-21644,-18762],[-20877,-19879],[-21287,-19482],[-21719,-18667],[-20007,-20362],[-18328,-21101],[-18604,-21096],[-20256,-20194],[-21687,-18736],[-18988,-20824],[-22165,-17994],[-19671,-20747],[-20181,-20346],[-20109,-20477],[-20786,-19936],[-22083,-18305],[-21729,-18933],[-20914,-19912],[-21172,-19733],[-21544,-19156],[-21693,-18965],[-21574,-19018],[-21504,-19163],[-19532,-20891],[-19645,-20719],[-20077,-20592],[-20337,-20405],[-21799,-18391],[-21624,-18880],[-17830,-21565],[-21958,-18075],[-18664,-21253],[-21207,-19475],[-18237,-21466],[-19767,-20817],[-18834,-21108],[-19247,-21088],[-20544,-20160],[-18677,-21149],[-19636,-20911],[-19517,-21031],[-20661,-20158],[-20994,-19877],[-20452,-20407],[-19527,-20922],[-18860,-21208],[-21863,-18288],[-22038,-17799],[-22014,-18220],[-17858,-21502],[-21331,-19558],[-21743,-18571],[-21711,-18882],[-19338,-21031],[-21146,-19591],[-17712,-21657],[-21419,-19019],[-18296,-21463],[-21204,-19429],[-19132,-20988],[-18404,-21343],[-19130,-21151],[-18674,-21286],[-18693,-21234],[-18963,-21177],[-19664,-20848],[-20669,-20096],[-20377,-20306],[-21187,-19712],[-21070,-19714],[-21020,-19852],[-21199,-19440],[-19598,-20941],[-21393,-18673],[-20294,-20355],[-19010,-21165],[-19328,-20998],[-21286,-18941],[-19194,-21005],[-21281,-19129],[-21358,-18716],[-19057,-21054],[-20357,-20312],[-21184,-19584],[-19408,-20941],[-20711,-20020],[-21556,-19007],[-22048,-17780],[-18183,-20870],[-18364,-20745],[-19928,-20537],[-19073,-20728],[-19650,-20705],[-21809,-18372],[-21243,-19716],[-21790,-18650],[-20665,-20005],[-21369,-19170],[-21035,-19775],[-20615,-20143],[-21615,-19139],[-21683,-18918],[-19747,-20662],[-21293,-19578],[-20904,-19855],[-21813,-18315],[-21313,-19310],[-20979,-19771],[-20180,-20561],[-19368,-21148],[-18913,-21208],[-19557,-20877],[-19886,-20691],[-20559,-20065],[-21422,-19304],[-21514,-19104],[-20922,-19947],[-17849,-21615],[-19390,-20964],[-20577,-20231],[-19639,-20876],[-19119,-21147],[-21211,-18953],[-21421,-18898],[-21168,-19300],[-20179,-20607],[-20834,-19905],[-19668,-20796],[-20643,-20177],[-18276,-21402],[-21568,-18659],[-18796,-21131],[-21506,-19069],[-19122,-20980],[-19640,-20750],[-19996,-20656],[-19897,-20679],[-21369,-19111],[-21194,-19600],[-20062,-20415],[-20544,-19944],[-20393,-20152],[-20214,-20348],[-20241,-20219],[-19132,-20671],[-21128,-19457],[-21279,-19249],[-20942,-19516],[-20468,-20068],[-19810,-20629],[-18852,-21037],[-19039,-20863],[-19925,-20457],[-21484,-18986],[-17792,-21182],[-20935,-19622],[-20681,-19902],[-18859,-20884],[-21135,-19304],[-19289,-20649],[-21604,-18976],[-19827,-20820],[-20035,-20761],[-21506,-19145],[-21357,-19336],[-20042,-20649],[-21946,-18330],[-19597,-20800],[-20842,-19922],[-20477,-20318],[-20428,-20348],[-18574,-21180],[-20178,-20562],[-18930,-21086],[-19297,-20950],[-19464,-20924],[-17361,-21381],[-22046,-17992],[-18608,-21110],[-19210,-21090],[-21844,-18455],[-20065,-20466],[-21776,-18676],[-20015,-20604],[-21783,-18564],[-17868,-21122],[-19924,-20661],[-17444,-21648],[-18026,-21442],[-18972,-21162],[-20973,-19773],[-19815,-20679],[-17811,-21613],[-18092,-21272],[-18482,-21250],[-18607,-21240],[-18841,-21199],[-20545,-20346],[-19050,-21166],[-21859,-18194],[-21707,-18389],[-21591,-18718],[-20216,-20474],[-21681,-18639],[-19570,-20803],[-19458,-20849],[-19133,-20947],[-19602,-20688],[-19825,-20633],[-20095,-20576],[-18766,-21163],[-18090,-21319],[-22037,-18290],[-18694,-21214],[-19519,-20913],[-19361,-20928],[-21647,-18950],[-21779,-18487],[-19400,-21033],[-18323,-20990],[-19569,-20551],[-19659,-20472],[-18825,-20784],[-18451,-20931],[-21745,-18536],[-21506,-19128],[-21795,-18398],[-21355,-19137],[-21218,-19162],[-21201,-19378],[-21037,-19695],[-19385,-20842],[-21614,-18855],[-19040,-20943],[-19177,-20901],[-20302,-20390],[-20844,-19860],[-21614,-18572],[-19305,-21080],[-19565,-20893],[-19999,-20519],[-21437,-18949],[-21435,-18984],[-19489,-20920],[-20117,-20493],[-21534,-18848],[-21262,-19379],[-18555,-21402],[-20997,-19688],[-18968,-21146],[-21068,-19076],[-17843,-21389],[-20741,-19712],[-20954,-19456],[-20040,-20421],[-18914,-21039],[-19281,-21004],[-19559,-20836],[-19288,-20892],[-18614,-21290],[-18892,-21122],[-18080,-21351],[-18621,-21178],[-18247,-21325],[-18447,-21316],[-18725,-21148],[-21267,-19295],[-21404,-19253],[-18764,-21253],[-18475,-21362],[-19191,-21040],[-18646,-21345],[-21896,-18468],[-18771,-21141],[-21598,-18606],[-20335,-20409],[-20342,-20297],[-21752,-19097],[-21755,-18908],[-21282,-19415],[-22044,-18178]]
  });

}());
