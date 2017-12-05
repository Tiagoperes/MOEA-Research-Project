(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj3Itm40', {
    "objectives": 3,
    "items": 40,
    "capacity": 11233,
    "profitMatrix": [[117, 978, 324, 757, 209, 424, 679, 671, 860, 340, 446, 238, 601, 320, 761, 304, 216, 965, 750, 452, 447, 926, 559, 282, 851, 652, 775, 948, 663, 427, 620, 272, 725, 988, 407, 672, 533, 306, 696, 887], [911, 540, 891, 342, 852, 404, 516, 110, 440, 885, 554, 408, 760, 839, 967, 986, 461, 102, 804, 274, 175, 967, 724, 455, 897, 537, 274, 302, 308, 133, 176, 680, 971, 699, 482, 884, 531, 546, 670, 930], [772, 215, 615, 551, 624, 151, 195, 788, 302, 928, 611, 367, 488, 539, 575, 66, 440, 323, 168, 513, 525, 117, 53, 953, 772, 821, 963, 106, 563, 748, 557, 478, 158, 736, 263, 431, 575, 473, 529, 508]],
    "weights": [571, 875, 150, 66, 432, 485, 554, 642, 567, 685, 40, 930, 179, 148, 140, 947, 279, 142, 790, 845, 495, 115, 543, 74, 292, 507, 236, 511, 6, 508, 236, 569, 734, 904, 765, 210, 602, 782, 276, 889],
    "pareto": [[-15481,-19213,-15091],[-16389,-19344,-14953],[-16176,-16810,-17516],[-16526,-18641,-16134],[-17381,-17350,-17178],[-16993,-19191,-14977],[-19552,-16826,-14177],[-19130,-17625,-13493],[-16760,-18542,-16211],[-19035,-16149,-15642],[-19529,-17055,-13803],[-19147,-16698,-15170],[-19397,-16464,-14498],[-19300,-16443,-14730],[-19202,-16954,-14748],[-17747,-18008,-16615],[-16892,-19133,-15516],[-17381,-18201,-16936],[-17246,-17881,-17034],[-19420,-16235,-14872],[-17174,-18993,-15413],[-17839,-18317,-16361],[-17193,-18849,-15765],[-17100,-19036,-14997],[-17774,-19153,-14894],[-18722,-18427,-14319],[-17446,-19027,-15345],[-17959,-18109,-16503],[-18955,-17159,-15290],[-17539,-18354,-16669],[-17595,-18364,-16460],[-19179,-17183,-14374],[-18760,-18304,-14260],[-19314,-17503,-14276],[-18316,-18447,-15224],[-19010,-16316,-15632],[-18037,-17839,-16438],[-17969,-17961,-16760],[-19066,-17239,-14638],[-17567,-18802,-15853],[-19015,-16904,-15621],[-18280,-18614,-15038],[-18134,-18629,-15418],[-18929,-17417,-15046],[-18057,-17823,-16564],[-18017,-17797,-16661],[-19003,-16707,-15816],[-18848,-17958,-14514],[-18467,-18359,-15744],[-17936,-18338,-16129],[-18490,-17537,-16145],[-18877,-17880,-14589],[-18384,-17732,-16291],[-18907,-17562,-15074],[-18812,-17643,-15184],[-18370,-17745,-16003],[-18622,-18128,-15450],[-19122,-16865,-15160],[-17658,-18393,-16254],[-17650,-17987,-16847],[-18604,-16918,-16226],[-18825,-17185,-16104],[-18074,-17917,-16342],[-18097,-17688,-16716],[-18863,-17323,-15481],[-18510,-17579,-15922],[-18887,-17520,-15297],[-18421,-18673,-14993],[-18567,-18658,-14613],[-18418,-17349,-16387],[-18983,-18278,-14416],[-18206,-18508,-15647],[-19532,-16784,-14400],[-18541,-18465,-15135],[-17770,-17779,-16989],[-17905,-17248,-17133],[-18808,-18112,-14427],[-19009,-17308,-15101],[-18645,-17899,-15824],[-18800,-17352,-16094],[-19027,-17459,-14701],[-19102,-17072,-14824],[-18409,-17565,-16301],[-19062,-17120,-14829],[-18178,-18868,-15011],[-18358,-17539,-16813],[-19142,-16907,-14937],[-17891,-19036,-14985],[-18797,-17623,-15497],[-18851,-17687,-15111],[-17984,-17942,-16513],[-18209,-18237,-16244],[-18240,-18749,-14886],[-18246,-18153,-16078],[-18238,-17747,-16671],[-18096,-18491,-16041],[-18777,-17581,-15720],[-19121,-17857,-14629],[-18731,-17895,-14969],[-18665,-17032,-16192],[-17951,-17703,-17096],[-18091,-18700,-15808],[-18116,-18533,-15818],[-18068,-18929,-15434],[-17679,-18188,-16588],[-18696,-18234,-14841],[-18513,-17308,-16519],[-18576,-18442,-14699],[-19075,-16951,-15432],[-17705,-18381,-16066],[-19089,-17010,-15012],[-18822,-17456,-15507],[-18093,-18762,-15444],[-18751,-17937,-14746],[-17427,-17805,-17141],[-18883,-16915,-15674],[-19122,-17114,-14601],[-18223,-18382,-15704],[-18229,-18279,-16021],[-18226,-18465,-15227],[-17708,-18110,-16663],[-18215,-17976,-16297],[-18401,-17922,-15784],[-17902,-18370,-16294],[-18539,-17501,-15997],[-18393,-17516,-16377],[-17701,-18322,-14934],[-17021,-18437,-15630],[-18103,-17551,-16136],[-17001,-18395,-15853],[-17793,-17862,-16398],[-17109,-18299,-15434],[-17089,-18257,-15657],[-16866,-18075,-15951],[-18364,-17402,-16233],[-16840,-18513,-15523],[-18499,-17722,-16135],[-18519,-17171,-15939],[-18631,-17720,-15467],[-18496,-17993,-15538],[-17167,-18422,-15250],[-17642,-18356,-15353],[-18806,-17215,-15514],[-18654,-17491,-15841],[-17908,-18233,-15714],[-17929,-18400,-14928],[-17668,-18549,-14831],[-18084,-18169,-14634],[-18235,-18142,-15441],[-18651,-17762,-15244],[-17975,-17824,-16180],[-17714,-17973,-16083],[-17341,-18640,-15104],[-18238,-17871,-16038],[-17888,-18191,-15937],[-17522,-18564,-15211],[-18215,-18100,-15664],[-18476,-17951,-15761],[-16817,-18742,-15149],[-17144,-18651,-14876],[-17387,-18064,-16356],[-17118,-18458,-15398],[-17957,-17566,-16516],[-16998,-18666,-15256],[-17568,-17988,-16463],[-18089,-18157,-15821],[-19101,-17144,-14910],[-19092,-17432,-14116],[-18975,-17856,-13787],[-18963,-17565,-14697],[-18940,-17708,-14443],[-18937,-17979,-13846],[-18904,-17584,-15036],[-18872,-17690,-14995],[-18827,-17218,-15398],[-18811,-17841,-15024],[-18788,-18070,-14650],[-18728,-18166,-14372],[-18690,-16865,-16202],[-18676,-17848,-14989],[-18633,-18301,-14944],[-16208,-19420,-14846],[-17305,-19344,-14640],[-16762,-19314,-14675],[-17250,-19255,-14939],[-17384,-19216,-14764],[-17000,-19209,-15243],[-17088,-19071,-15047],[-16993,-19069,-15306],[-17073,-19057,-15623],[-17830,-19034,-14866],[-17485,-18985,-14992],[-17654,-18970,-15056],[-16653,-18946,-15726],[-17309,-18865,-15508],[-17553,-18842,-15548],[-16748,-18826,-15796],[-17547,-18760,-16076],[-16337,-16525,-17383],[-16827,-17456,-17349],[-17096,-17242,-17260],[-17231,-17562,-17162],[-17470,-16592,-17138],[-18113,-17191,-16844],[-18874,-18151,-13992],[-18330,-18592,-14684],[-18200,-18597,-13843],[-18071,-18658,-16031],[-18229,-18464,-15176],[-18243,-18424,-15481],[-18490,-18130,-16118],[-17833,-18763,-15463],[-18558,-17969,-15451],[-18449,-17149,-16520],[-18543,-16903,-16420],[-18830,-16947,-15995],[-18335,-17768,-16439],[-18355,-17810,-16216],[-17977,-17896,-16574],[-18577,-17378,-15938],[-18046,-17918,-16426],[-18581,-17740,-15825],[-17358,-18430,-16562],[-17570,-18531,-16450],[-17657,-18340,-16373],[-17572,-18593,-16086],[-16811,-18879,-15729],[-17946,-18190,-16386],[-17627,-18216,-16473],[-17677,-18382,-16150],[-17253,-18984,-15536],[-18891,-16962,-15801],[-18891,-17321,-15081],[-18265,-17726,-16045],[-19106,-16514,-15328],[-18301,-17104,-15923],[-18600,-17476,-15722],[-18668,-17115,-15715],[-18676,-17521,-15122],[-17559,-18396,-16446],[-18884,-16871,-15317],[-18732,-17147,-15644],[-19298,-17511,-13724],[-18782,-16580,-15585],[-19153,-17396,-13867],[-19437,-16098,-14468],[-19462,-15931,-14478],[-18485,-18361,-14390],[-19090,-17568,-14013],[-18416,-18191,-14912],[-18337,-18201,-14500],[-18277,-18418,-14679],[-18998,-17627,-14161],[-18185,-18477,-14827],[-18656,-18072,-15318],[-18871,-17729,-14888],[-19193,-16682,-14531],[-18239,-18077,-15080],[-19305,-17120,-13540],[-17008,-17380,-17456],[-19247,-16379,-14951],[-19137,-16440,-15374],[-18944,-16794,-15727],[-16535,-19329,-14573],[-16449,-17507,-17161],[-19191,-17301,-14744],[-18926,-17649,-14863],[-19182,-16912,-14971],[-17556,-18571,-16145],[-17893,-19104,-14464],[-18989,-17266,-15324],[-17387,-18945,-15361],[-19208,-17105,-14449],[-18791,-17922,-14934],[-18602,-17211,-15948],[-18840,-17552,-15107],[-18240,-17809,-16307],[-18535,-17412,-15932],[-18771,-17880,-15157],[-17219,-19042,-15243],[-18802,-17414,-15730],[-19209,-16362,-14421],[-18914,-17171,-14890],[-18884,-17791,-14700],[-16781,-19446,-14685],[-17338,-19117,-14743],[-16472,-19022,-15619],[-18077,-18740,-15503],[-16707,-17664,-17207],[-17247,-17261,-17190],[-17415,-17216,-17173],[-17126,-17366,-17160],[-17101,-17533,-17150],[-18001,-17446,-16829],[-18392,-18492,-14624],[-18372,-18450,-14847],[-18393,-18420,-14538],[-18353,-18363,-15058],[-18178,-18509,-15731],[-18392,-16335,-16547],[-17985,-18302,-15981],[-19029,-16900,-15294],[-18879,-16283,-15328],[-17626,-18652,-15082],[-18739,-17676,-14843],[-17861,-18798,-14876],[-19229,-17075,-14140],[-18122,-18649,-14973],[-17933,-18319,-15459],[-16567,-18902,-15689],[-16587,-18944,-15466],[-17415,-18980,-14774],[-17785,-17456,-16991],[-18260,-18228,-15186],[-18550,-17971,-14862],[-17644,-18525,-15283],[-17845,-18457,-15655],[-19222,-16546,-14941],[-19265,-16782,-14602],[-18699,-17636,-15541],[-18985,-16716,-15701],[-17767,-18050,-16392],[-19000,-16978,-15219],[-18860,-17144,-15300],[-17592,-18635,-15863],[-18892,-17282,-15188],[-18159,-18539,-15141],[-18060,-18523,-16027],[-19144,-16969,-14573],[-18713,-18097,-14437],[-18970,-17179,-14977],[-17435,-18211,-16548],[-19177,-17341,-14439],[-19219,-16817,-14344],[-17816,-18546,-15987],[-18114,-18367,-14933],[-17986,-17477,-16184],[-18494,-16197,-16098],[-17968,-18382,-15313],[-18487,-17604,-15765],[-16847,-17310,-16893],[-18768,-17310,-14637],[-18817,-16868,-15518],[-18289,-17862,-14980],[-18261,-17414,-15796],[-17987,-18364,-15617],[-17779,-18052,-15799],[-18367,-17812,-15623],[-18843,-17061,-14996],[-18823,-17019,-15219],[-17323,-18693,-14724],[-18513,-17797,-15243],[-17665,-17661,-16336],[-17506,-17511,-16559],[-18269,-17820,-15203],[-17177,-18708,-15104],[-17606,-17901,-16061],[-17180,-18437,-15701],[-17007,-18477,-15325],[-17300,-18229,-15843],[-18253,-17421,-16160],[-16999,-18513,-15594],[-17775,-17297,-16470],[-17278,-17775,-16512],[-18072,-17497,-16053],[-16467,-18718,-14825],[-17404,-18461,-14785],[-18592,-17052,-15427],[-16582,-18576,-15178],[-17103,-18745,-14536],[-17430,-18654,-14263],[-17854,-17991,-15850],[-18528,-16982,-16008],[-18261,-17827,-15567],[-18224,-17911,-15733],[-18112,-17362,-16205],[-17691,-18505,-14360],[-17895,-17089,-16612],[-18399,-17406,-15780],[-18373,-17213,-16302],[-18815,-17026,-15583],[-17673,-18067,-15743],[-16826,-18553,-15218],[-18554,-17175,-15486],[-17799,-17944,-15870],[-17723,-17784,-16152],[-17974,-17783,-15992],[-18244,-17953,-15510],[-18106,-18374,-15297],[-18408,-17190,-15866],[-17585,-18205,-15939],[-17015,-18883,-14732],[-18086,-18332,-15520],[-18027,-17680,-15917],[-18007,-17638,-16140],[-17594,-17373,-16363],[-19067,-17093,-14671],[-18980,-16936,-15442],[-18967,-17412,-14890],[-18898,-17883,-14473],[-18850,-16396,-15799],[-18785,-17939,-14737],[-18752,-17898,-14853],[-18653,-18343,-14721],[-17610,-18731,-15463],[-18468,-18689,-14153],[-17109,-17316,-17246],[-17126,-18089,-16892],[-18558,-18328,-14731],[-17613,-18460,-16060],[-17151,-18106,-16765],[-18894,-17129,-15113],[-18124,-17730,-16466],[-19123,-16677,-14313],[-18505,-18154,-14726],[-17834,-17641,-16858],[-18350,-18385,-15020],[-17095,-19157,-14533],[-18947,-16699,-15171],[-16051,-18535,-16298],[-16495,-18793,-15993],[-18554,-17607,-15564],[-18719,-17678,-15318],[-18696,-17907,-14944],[-18946,-17691,-14640],[-18516,-17730,-15623],[-18880,-16696,-15372],[-17393,-17791,-15416],[-18218,-18148,-14641],[-18162,-17225,-15635],[-17717,-18021,-15060],[-17964,-17727,-15697],[-18772,-17347,-14657],[-17941,-17956,-15323],[-18465,-17854,-15278],[-18241,-17919,-15015],[-18640,-17349,-15325],[-18795,-17118,-15031],[-18947,-16842,-14704],[-18116,-17451,-15370],[-18187,-17058,-15645],[-18617,-17578,-14951],[-18855,-16901,-14852],[-19010,-16670,-14558],[-18052,-17589,-15501],[-19271,-16933,-14303],[-19244,-16452,-14821],[-18916,-16795,-15811],[-17494,-19155,-14341],[-18187,-18801,-14270],[-17332,-18786,-15588],[-16640,-18750,-16069],[-17312,-18744,-15811],[-17257,-18697,-15831],[-16584,-16976,-17305],[-16702,-17076,-17218],[-16595,-17235,-17201],[-17996,-16858,-16840],[-17425,-17999,-16703],[-18569,-18458,-14381],[-18770,-17919,-15050],[-18474,-16982,-16530],[-18629,-16751,-16236],[-18657,-16750,-16152],[-18561,-17698,-16048],[-18271,-17986,-16088],[-17324,-18230,-16475],[-17444,-18022,-16617],[-16660,-18792,-15846],[-17864,-18150,-16371],[-17825,-18357,-16056],[-17926,-18126,-16284],[-18333,-17962,-16001],[-18232,-18193,-15773],[-18402,-17883,-15891],[-18353,-18004,-15778],[-18662,-17357,-15597],[-18460,-17929,-15820],[-17573,-17790,-16761],[-18488,-17964,-15233],[-18465,-17749,-15793],[-16886,-18818,-15780],[-18309,-17981,-15932],[-18682,-17399,-15374],[-16564,-19173,-15092],[-16745,-19097,-15199],[-16883,-19089,-15183],[-19446,-16428,-14350],[-18987,-16545,-15258],[-19113,-17435,-14000],[-19285,-17078,-13763],[-19122,-17219,-14086],[-18426,-17378,-16146],[-16863,-19047,-15406],[-18716,-17467,-15754],[-19067,-17797,-13639],[-18868,-17191,-15427],[-19136,-17206,-14374],[-19228,-17147,-14226],[-19070,-17526,-14236],[-19119,-17136,-14563],[-17378,-18472,-16339],[-17948,-17974,-16499],[-18398,-18193,-15187],[-18547,-17945,-14894],[-19254,-15988,-14767],[-18986,-17537,-14727],[-18915,-18073,-13966],[-18907,-17667,-14559],[-18897,-17922,-14366],[-18893,-17024,-15437],[-15925,-19471,-14786],[-16513,-19231,-14610],[-16048,-18806,-15701],[-17097,-16622,-17416],[-17985,-16499,-16830],[-18782,-18210,-14140],[-19229,-16155,-14757],[-18652,-17201,-15589],[-18680,-17052,-15879],[-18916,-17154,-15091],[-18890,-16524,-15490],[-18680,-17649,-14773],[-19130,-16605,-15089],[-17926,-18877,-14567],[-18868,-17550,-14707],[-19199,-16775,-14567],[-16270,-19397,-14552],[-16992,-18803,-15836],[-18599,-17284,-15818],[-18937,-17157,-14975],[-19072,-16884,-14904],[-18917,-17115,-15198],[-18998,-17172,-14781],[-17785,-17685,-15487],[-19423,-16657,-13976],[-19417,-16506,-14275],[-19277,-16672,-14356],[-19031,-16962,-14930],[-16566,-19542,-14269],[-16962,-19370,-14792],[-17050,-19232,-14596],[-17242,-19164,-13897],[-17024,-19039,-15118],[-16523,-18912,-15537],[-18160,-18822,-14896],[-17928,-17932,-16722],[-17954,-18125,-16200],[-18854,-17405,-15247],[-18473,-16544,-16219],[-17966,-18232,-16163],[-19112,-16059,-15049],[-18395,-18518,-14592],[-18393,-17605,-15198],[-18451,-17293,-15356],[-18769,-17264,-15134],[-18610,-17878,-14791],[-18655,-16909,-15168],[-18643,-17733,-14939],[-18626,-16788,-15403],[-18370,-17834,-14824],[-18790,-17193,-15573],[-18564,-17334,-16007],[-18545,-17240,-16050],[-18992,-17245,-14900],[-18837,-17476,-15194],[-18888,-17233,-15204],[-18326,-17987,-15061],[-18580,-17302,-15514],[-18250,-18042,-14682],[-17836,-18588,-15764],[-18118,-18044,-15350],[-18095,-18273,-14976],[-18629,-17696,-15321],[-19030,-16262,-14751],[-17991,-18041,-16034],[-18448,-16711,-16209],[-18636,-16850,-15757],[-18461,-17355,-15710],[-18441,-17102,-16393],[-18418,-17331,-16019],[-18329,-17357,-16378],[-18405,-17807,-15467],[-18438,-17373,-15796],[-18453,-17299,-16198],[-18103,-17427,-16769],[-18560,-17260,-15737],[-18235,-18018,-16074],[-18573,-17100,-15725],[-18484,-17126,-16084],[-18660,-16941,-15518],[-18342,-17979,-15613],[-18596,-16871,-16099],[-18748,-16595,-15772],[-18258,-17196,-16475],[-18484,-17485,-15364],[-18603,-16480,-15915],[-18715,-17029,-15443],[-18608,-17068,-15904],[-18481,-17756,-14767],[-18712,-17300,-14846],[-18649,-17472,-14992],[-18481,-17397,-15487],[-18390,-17787,-15780],[-18497,-17748,-15319],[-18672,-17243,-15366],[-18880,-17186,-15077],[-19301,-17240,-14321],[-19159,-16384,-14775],[-19145,-16990,-14460],[-18962,-16945,-15327],[-16673,-18988,-15503],[-18333,-18321,-15281],[-18441,-18122,-14797],[-19110,-17013,-14896],[-17369,-19206,-14509],[-17879,-18599,-15920],[-17979,-16977,-15044],[-19054,-16733,-15304],[-18869,-17474,-15182],[-18835,-16821,-15585],[-16850,-19176,-14479],[-17833,-18913,-15169],[-17979,-18898,-14789],[-17480,-18893,-15340],[-17715,-18813,-15256],[-17853,-18805,-15240],[-17897,-18775,-15038],[-17013,-18720,-15791],[-16730,-16704,-17345],[-16474,-17340,-17171],[-18030,-16724,-16835],[-18581,-18099,-15105],[-18561,-18057,-15328],[-18315,-18275,-15166],[-18268,-18257,-15491],[-18300,-18206,-15231],[-18252,-18235,-15550],[-17219,-18785,-15663],[-17294,-18785,-15555],[-17281,-18711,-15569],[-17534,-18889,-15149],[-18086,-18750,-14111],[-18034,-18052,-16190],[-17714,-17849,-16716],[-19216,-16453,-14905],[-17033,-18762,-15568],[-17522,-18770,-15447],[-18915,-16357,-15500],[-18736,-17509,-15531],[-19311,-16108,-14448],[-18913,-17066,-15214],[-18805,-17981,-14514],[-18668,-17908,-15028],[-18713,-17738,-15157],[-18212,-17592,-16270],[-17674,-18763,-15392],[-17677,-18741,-15430],[-18499,-18453,-14163],[-18182,-18310,-15515],[-18747,-17682,-15025],[-18792,-17035,-15508],[-18473,-18260,-14685],[-18691,-17225,-15670],[-16804,-19217,-15059],[-17685,-18339,-16289],[-18889,-17516,-14959],[-17276,-17797,-15860],[-17023,-18228,-15803],[-17524,-18355,-15384],[-17800,-17695,-15815],[-17547,-18126,-15758],[-17412,-17806,-15856],[-17300,-18420,-15121],[-17665,-17375,-15913],[-18434,-17672,-15027],[-18371,-17844,-15173],[-17418,-18520,-15034],[-18084,-17800,-15598],[-17211,-18609,-14254],[-16866,-18683,-14488],[-17972,-18414,-14863],[-18196,-18349,-15126],[-18219,-18120,-15500],[-17695,-18222,-15545],[-18526,-17613,-14879],[-18904,-17257,-15169],[-18888,-17592,-14484],[-16571,-19113,-14801],[-17619,-19055,-14488],[-18483,-18112,-14942],[-17558,-18413,-16080],[-18482,-18151,-14835],[-16492,-19064,-15396],[-19057,-16638,-14748],[-17016,-18962,-15351],[-18246,-18507,-15004],[-19011,-16874,-14633],[-18982,-16987,-15104],[-16768,-18868,-15573],[-18553,-17646,-15457],[-18407,-16844,-16235],[-18837,-16460,-15711],[-17410,-19128,-14483],[-17320,-19100,-14704],[-17025,-19042,-15253],[-17581,-18951,-14801],[-18040,-17050,-16918],[-18930,-17450,-14647],[-18172,-18544,-14436],[-18084,-18682,-14632],[-18353,-18468,-14543],[-18625,-17984,-14358],[-17513,-18746,-14351],[-18780,-17753,-14064],[-19285,-16374,-14795],[-19047,-17051,-14894],[-19244,-16650,-14354],[-17545,-17791,-16845],[-19040,-17030,-14944],[-17695,-18404,-14838],[-18568,-17666,-15144],[-17037,-17267,-16985],[-17147,-18256,-16106],[-17722,-18255,-16123],[-16966,-18332,-15999],[-17668,-18425,-15464],[-17399,-18639,-15553],[-17444,-18490,-15201],[-17678,-18391,-15278],[-17167,-18298,-15883],[-17449,-18846,-14769],[-17570,-18433,-15044],[-16986,-18374,-15776],[-16948,-18719,-15188],[-16870,-18554,-15595],[-16928,-18677,-15411],[-18645,-16752,-15317],[-17175,-18704,-15290],[-17476,-18288,-15717],[-16990,-18346,-15737],[-17171,-18270,-15844],[-17275,-18322,-15833],[-17676,-18831,-14871],[-16489,-18219,-16156],[-17155,-18662,-15513],[-16639,-18295,-16122],[-16742,-18397,-15736],[-17424,-18448,-15424],[-16817,-18948,-15385],[-18069,-18741,-14587],[-18874,-17447,-15024],[-17194,-18644,-15898],[-16784,-19175,-15282],[-18068,-18312,-15494],[-18442,-17978,-15419],[-18752,-17200,-15395],[-18198,-18001,-15379],[-18218,-18043,-15156],[-18230,-16739,-16237],[-16979,-16893,-16954],[-16723,-18445,-15471],[-18046,-18277,-15706],[-17633,-18012,-15929],[-17067,-16755,-16758],[-17877,-17989,-15969],[-17248,-16679,-16865],[-17967,-17583,-16326],[-18775,-16971,-15769],[-18620,-17518,-15499],[-17857,-17947,-16192],[-18297,-16847,-16079],[-18322,-16680,-16089],[-18368,-17135,-16052],[-18445,-17707,-16016],[-17992,-17416,-16336],[-17760,-17075,-16666],[-18066,-18319,-15483],[-18221,-17772,-15753],[-17689,-16787,-16693],[-17554,-17318,-16549],[-18167,-16911,-16383],[-17466,-17456,-16745],[-17683,-17729,-16338],[-17735,-17242,-16656],[-18038,-17871,-16299],[-18142,-17078,-16373],[-17545,-18150,-16125],[-18184,-17856,-15919],[-17625,-17606,-16522],[-18058,-17913,-16076],[-17356,-17820,-16611],[-17944,-17580,-16435],[-18204,-17898,-15696],[-18213,-17366,-16346],[-16542,-18521,-15364],[-17537,-17744,-16718],[-17491,-17289,-16755],[-19298,-17152,-14444],[-18978,-17130,-15004],[-18468,-18171,-14897],[-18724,-17911,-14651],[-18685,-17821,-14478],[-17235,-17742,-16660],[-18891,-17400,-14516],[-18101,-17959,-16092],[-18121,-18001,-15869],[-16451,-19321,-14659],[-19206,-16384,-14383],[-17042,-19297,-14782],[-18508,-18132,-14764],[-18361,-17961,-15917],[-18428,-18333,-13890],[-19224,-16860,-14628],[-19115,-17203,-14490],[-19086,-17281,-14415],[-19044,-17322,-14297],[-19013,-16399,-15155],[-19006,-17129,-14920],[-18990,-16523,-15296],[-18584,-17907,-15137],[-19082,-17162,-14606],[-18990,-17221,-14754],[-18919,-16933,-14781],[-18111,-17833,-16176],[-18300,-17847,-15951],[-17598,-17623,-16771],[-18423,-18026,-15197],[-18187,-18101,-15748],[-18128,-17260,-16779],[-18937,-16564,-15002],[-17540,-17500,-16955],[-18745,-17539,-14263],[-19063,-16501,-14168],[-18900,-16288,-15565],[-19175,-15887,-14903],[-18059,-17885,-16200],[-18136,-17666,-16186],[-16752,-16039,-17334],[-18108,-17407,-16368],[-18562,-16613,-15941],[-18709,-15749,-15625],[-17683,-18226,-16264],[-18255,-17120,-16562],[-18082,-17656,-16574],[-18550,-16416,-16136],[-17961,-18171,-16139],[-18248,-18215,-15714],[-18702,-16140,-15809],[-17271,-17714,-17044],[-17460,-18044,-16558],[-17739,-17682,-16726],[-18014,-18068,-16064],[-17859,-17474,-16868],[-16946,-16694,-17183],[-18426,-17755,-15794],[-16549,-16780,-17238],[-17493,-17899,-16706],[-17604,-17532,-16884],[-18400,-17235,-16419],[-17882,-17477,-16759],[-17042,-17722,-16761],[-17516,-17670,-17080],[-18192,-17292,-16708],[-18169,-17521,-16334],[-18395,-16647,-16430],[-19053,-17652,-14179],[-18154,-18613,-14614],[-18290,-17334,-16363],[-18286,-18210,-15558],[-18823,-18132,-14114],[-18422,-17925,-15668],[-18289,-18082,-15688],[-18488,-17731,-15707],[-18378,-18151,-15410],[-18346,-18257,-15369],[-18170,-17542,-16221],[-18462,-17771,-15755],[-18274,-18013,-15753],[-17705,-17818,-14716],[-16503,-18870,-15760],[-18716,-17826,-15034],[-18761,-17701,-14821],[-18099,-17750,-16352],[-16840,-18719,-15759],[-19036,-16509,-15110],[-17796,-17972,-16467],[-17143,-18306,-16368],[-18571,-17974,-14746],[-18128,-18200,-15358],[-18611,-17839,-14898],[-17663,-16806,-16764],[-18503,-17847,-14957],[-16521,-18841,-15694],[-18509,-16959,-16094],[-17591,-18210,-15786],[-18204,-16801,-16551],[-17334,-18060,-16245],[-17314,-18018,-16468],[-17200,-16926,-16953],[-17724,-16824,-16908],[-18131,-16660,-16625],[-18128,-17449,-16145],[-17750,-17756,-16518],[-18047,-17990,-15613],[-18174,-17904,-16108],[-18337,-17763,-15785],[-18068,-17506,-16281],[-17661,-18141,-16157],[-17518,-17415,-16848],[-17472,-16960,-16885],[-17471,-17255,-16851],[-17038,-18236,-15003],[-18060,-17571,-16467],[-18581,-17147,-15852],[-18076,-17912,-15688],[-17082,-17677,-16798],[-17202,-17469,-16940],[-17653,-17735,-16750],[-18188,-17298,-16423],[-18042,-17313,-16803],[-18050,-17719,-16210],[-17449,-18040,-16269],[-18756,-16642,-15899],[-17855,-17838,-16311],[-17838,-17618,-16322],[-17973,-17938,-16224],[-17749,-18003,-15961],[-16901,-17753,-16691],[-17861,-17389,-16696],[-17741,-17597,-16554],[-17472,-17811,-16643],[-17993,-17980,-16001],[-18148,-17433,-16271],[-18866,-16581,-15476],[-18254,-17627,-15901],[-18737,-17829,-14918],[-18615,-17698,-15526],[-19291,-16975,-14080],[-19268,-17204,-13706],[-19051,-17004,-14707],[-16252,-19380,-14513],[-18736,-17868,-14811],[-19443,-16699,-13753],[-18536,-17772,-15400],[-19205,-17376,-13852],[-19197,-17383,-14216],[-18570,-17073,-16060],[-18423,-17111,-16278],[-18569,-17096,-15898],[-18617,-16885,-16000],[-17790,-18133,-15801],[-18807,-17176,-15621],[-17513,-17941,-16483],[-18502,-16981,-16446],[-17269,-17964,-16443],[-18695,-16627,-16093],[-18520,-17132,-16046],[-18555,-17004,-16125],[-18507,-17196,-15958],[-18659,-17236,-15067],[-18352,-17743,-15688],[-18662,-16965,-15664],[-19327,-16422,-14104],[-19133,-17354,-14090],[-15670,-19359,-14742],[-16028,-18764,-15924],[-18162,-18268,-15738],[-18508,-17773,-15484],[-17367,-18333,-15965],[-18590,-17836,-15014],[-18395,-18221,-15221],[-17017,-16982,-17156],[-19166,-16561,-15139],[-18962,-16373,-14660],[-17845,-18399,-15833],[-17966,-17377,-16585],[-19112,-16955,-14080],[-18230,-17650,-15786],[-18392,-17724,-15370],[-18899,-16545,-14806],[-17552,-17966,-16522],[-18061,-18499,-15510],[-18228,-17588,-16150],[-17421,-18251,-16243],[-18505,-17211,-15634],[-17829,-18158,-15840],[-18388,-18034,-14666],[-18455,-17590,-15272],[-17941,-17544,-16575],[-17760,-17620,-16468],[-18083,-18603,-14923],[-18503,-17149,-15998],[-17945,-18149,-16198],[-17959,-17802,-16239],[-18655,-16873,-15671],[-17949,-17950,-15982],[-17649,-17987,-16290],[-18350,-17442,-15928],[-18812,-17297,-14986],[-18370,-17484,-15705],[-16462,-18863,-15098],[-18568,-17320,-14946],[-18792,-17255,-15209],[-18193,-17927,-16022],[-18417,-17557,-15380],[-18666,-17689,-14468],[-18562,-17457,-15526],[-18680,-16706,-15681],[-18407,-18004,-15256],[-17371,-18042,-16415],[-18120,-17644,-16245],[-18275,-17413,-15951],[-18348,-17380,-16292],[-18413,-17867,-14676],[-18416,-17596,-15273],[-17672,-17758,-16664],[-17560,-18372,-15929],[-17576,-18613,-15922],[-17436,-18868,-14824],[-17085,-18998,-14012],[-19026,-17171,-14697],[-16654,-19404,-14073],[-17311,-19083,-14693],[-18491,-18460,-14527],[-18912,-17324,-14965],[-18574,-17649,-15341],[-18144,-17991,-15767],[-17061,-18848,-14787],[-16682,-17403,-16404],[-16236,-17585,-16302],[-17880,-18411,-15073],[-16261,-17418,-16312],[-16649,-18336,-15567],[-16537,-18950,-14832],[-17610,-18241,-15555],[-16905,-16734,-16352],[-17359,-18242,-15715],[-16422,-18729,-15222],[-17745,-18561,-15457],[-17221,-18663,-15502],[-16666,-18706,-15262],[-17213,-18257,-16095],[-18141,-18262,-15170],[-17897,-18285,-15130],[-17058,-19119,-14190],[-17737,-18155,-16050],[-16943,-18898,-14580],[-18228,-17510,-14990],[-16674,-19112,-14669],[-17742,-18832,-14860],[-17465,-18640,-15542],[-18009,-17671,-15865],[-17854,-18218,-15595],[-17333,-18049,-16237],[-16636,-16948,-16441],[-19116,-17164,-14597],[-16106,-19395,-14893],[-17161,-18919,-15427],[-17138,-18788,-15456],[-16764,-16570,-17340],[-16589,-17075,-17293],[-16298,-17390,-17177],[-16981,-17741,-17008],[-18048,-18873,-14170],[-16862,-17772,-16938],[-17488,-18714,-15589],[-18617,-17540,-15461],[-19054,-17175,-14404],[-17005,-18314,-16384],[-17821,-17810,-16255],[-19084,-17026,-14709],[-18164,-16933,-16345],[-18772,-16993,-15731],[-18544,-17257,-15684],[-18210,-17388,-16308],[-19262,-16603,-14421],[-17134,-18495,-16299],[-16616,-18546,-14877],[-16837,-17154,-16885],[-16849,-18406,-16167],[-18851,-17676,-14650],[-18459,-18380,-14461],[-18384,-18233,-14882],[-18722,-17908,-14506],[-18294,-18055,-15530],[-18646,-17913,-14797],[-18567,-18139,-14800],[-18057,-16972,-16806],[-18599,-17482,-15351],[-18429,-17014,-16105],[-18561,-17605,-15410],[-18122,-17521,-16726],[-18212,-16741,-16512],[-18579,-17440,-15574],[-18406,-17836,-15704],[-18909,-16704,-15327],[-18541,-17563,-15633],[-18403,-17984,-15420],[-18347,-17061,-16414],[-18274,-17245,-16399],[-18578,-17479,-15467],[-18386,-17794,-15927],[-18380,-17643,-16226],[-17151,-17922,-16902],[-18283,-17029,-16485],[-17478,-17831,-16629],[-17261,-17558,-17036],[-17650,-17136,-17089],[-18395,-17578,-16013],[-17652,-18049,-16483],[-17979,-17958,-16210],[-16981,-19313,-13800],[-17662,-18604,-15366],[-17621,-18522,-15392],[-17943,-18549,-15303],[-19112,-17474,-13893],[-19308,-16849,-14137],[-19278,-17469,-13947],[-19125,-16948,-14683],[-17644,-18433,-15949],[-18141,-18222,-14940],[-18114,-18243,-15566],[-18663,-17585,-15034],[-18066,-17960,-16203],[-17583,-18222,-15951],[-17835,-18605,-15398],[-17965,-18191,-15975],[-17306,-18030,-16633],[-17827,-18199,-15991],[-16573,-16724,-17461],[-16780,-18949,-15042],[-18094,-17959,-16119],[-17157,-18164,-16098],[-17132,-18355,-16227],[-17530,-18134,-15820],[-17640,-17828,-16326],[-18087,-17529,-16195],[-17926,-18179,-15608],[-18053,-18093,-16103],[-18383,-17357,-15856],[-16880,-17972,-16780],[-17373,-18154,-15936],[-16977,-17993,-16548],[-18480,-17378,-15624],[-17088,-17626,-16726],[-18170,-18156,-15648],[-17269,-17550,-16833],[-18480,-17971,-15597],[-17498,-18162,-15906],[-17223,-17095,-16870],[-17112,-18313,-16450],[-17000,-17764,-16922],[-18563,-16932,-15819],[-18767,-17422,-15199],[-17674,-17826,-16143],[-18325,-17609,-15918],[-18213,-18223,-15183],[-18236,-17994,-15557],[-18787,-17464,-14976],[-19005,-16745,-15100],[-18233,-18265,-14960],[-17772,-17584,-16246],[-18744,-17953,-14428],[-16835,-19328,-14180],[-18681,-17610,-14880],[-17198,-16558,-17206],[-19167,-16740,-14947],[-16859,-17001,-14761],[-15673,-19088,-15339],[-18378,-18328,-15099],[-18249,-18236,-15601],[-18969,-17218,-14870],[-17584,-17110,-15802],[-19192,-17113,-13897],[-16568,-19102,-14676],[-18775,-17681,-14941],[-16597,-19306,-14279],[-17038,-18861,-15556],[-16741,-18808,-15530],[-19304,-16499,-14632],[-16985,-19141,-15166],[-17341,-18846,-15340],[-17953,-18705,-15311],[-18950,-16571,-15301],[-18844,-16069,-15527],[-19224,-16608,-14577],[-18913,-17425,-14494],[-17665,-19026,-14470],[-17010,-18991,-15194],[-16998,-18872,-15492],[-17819,-17322,-16986],[-16964,-18816,-15634],[-16770,-18930,-15209],[-16717,-17815,-16862],[-18855,-16863,-15362]]
  });

}());
