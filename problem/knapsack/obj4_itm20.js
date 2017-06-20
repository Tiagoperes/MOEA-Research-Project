(function () {
  'use strict';

  window.moea = window.moea || {};
  _.set(moea, 'problem.knapsack.instances.obj4Itm20', {
    "objectives": 4,
    "items": 20,
    "capacity": 6953,
    "profitMatrix": [[168, 163, 72, 66, 856, 728, 834, 316, 522, 697, 367, 493, 173, 415, 167, 509, 262, 629, 69, 241], [366, 621, 593, 316, 980, 615, 841, 14, 246, 416, 623, 335, 722, 616, 199, 13, 847, 434, 468, 921], [356, 673, 260, 884, 914, 256, 907, 539, 329, 191, 572, 597, 877, 319, 764, 277, 984, 41, 169, 20], [81, 259, 616, 808, 263, 628, 166, 57, 327, 535, 459, 591, 256, 19, 247, 485, 383, 644, 343, 383]],
    "weights": [129, 729, 948, 543, 917, 213, 102, 30, 228, 895, 596, 635, 671, 980, 85, 680, 725, 859, 986, 638],
    "pareto": [[-5809,-5932,-5993,-6027],[-5865,-7659,-8949,-5393],[-6789,-6850,-6747,-5249],[-5498,-8022,-7492,-4769],[-5626,-5856,-7058,-5827],[-5705,-7946,-8107,-4119],[-4363,-7433,-7191,-5521],[-6528,-7254,-6025,-4536],[-4747,-7429,-7880,-5469],[-5876,-6733,-8575,-4770],[-5704,-6156,-6405,-5951],[-6298,-6289,-6335,-5831],[-4935,-7904,-8335,-4933],[-4590,-7979,-8064,-5140],[-5252,-7385,-8207,-5423],[-6263,-7305,-6623,-5253],[-6614,-6245,-7611,-5674],[-5081,-7272,-8295,-5746],[-6161,-7441,-8278,-4271],[-6026,-7540,-7634,-5237],[-6575,-7032,-7025,-4624],[-6488,-6543,-7059,-5598],[-6294,-6632,-7891,-5339],[-6230,-6090,-7192,-5704],[-5789,-7312,-7573,-5544],[-5025,-6839,-7334,-5804],[-5636,-5957,-7262,-5824],[-6507,-6833,-7882,-4497],[-6064,-7136,-8489,-4820],[-5721,-7330,-7423,-5653],[-5374,-6363,-6786,-5875],[-5830,-5858,-6957,-6027],[-6093,-7459,-8128,-4380],[-6332,-6445,-7739,-5158],[-6229,-7640,-7421,-4398],[-6090,-6551,-8297,-5395],[-5870,-7452,-7787,-4853],[-5362,-7923,-8048,-4716],[-6767,-6014,-6946,-5310],[-6721,-6651,-7604,-5122],[-5463,-7834,-8384,-5225],[-5562,-6766,-6700,-5925],[-5925,-7411,-7017,-5597],[-6711,-6550,-7400,-5125],[-6375,-7259,-8000,-4896],[-6507,-7050,-6875,-4733],[-5967,-7757,-7576,-4304],[-5531,-7816,-8534,-5116],[-5566,-8004,-7642,-4660],[-6439,-6851,-7732,-4606],[-6123,-7845,-7423,-4688],[-5706,-7095,-8226,-5665],[-6051,-7123,-7042,-5729],[-5877,-7208,-8138,-5342],[-6193,-6503,-7274,-5699],[-5638,-7113,-8076,-5774],[-6278,-6954,-8211,-5445],[-5624,-7734,-7517,-4901],[-6410,-6243,-7712,-5474],[-6249,-7557,-7448,-4820],[-6268,-6853,-8007,-5448],[-6497,-6732,-7678,-4500],[-5653,-7131,-8280,-5526],[-6429,-6750,-7528,-4609],[-6148,-6432,-8243,-5289],[-6420,-6344,-7916,-5471],[-5890,-7441,-8190,-5184],[-6424,-5991,-6887,-5907],[-6265,-7156,-7433,-4970],[-5501,-7700,-7818,-5414],[-6003,-7424,-7659,-4529],[-5560,-7727,-8266,-4852],[-5906,-7119,-7870,-5078],[-5469,-7699,-7853,-5209],[-5401,-7717,-7703,-5318],[-6459,-7136,-6823,-4917],[-5304,-7270,-7661,-5497],[-5886,-7617,-7362,-4995],[-6163,-7106,-7961,-5697],[-6177,-6825,-7594,-5805],[-5919,-7764,-7829,-4744],[-6595,-6949,-7052,-5046],[-5880,-7340,-7986,-5187],[-6391,-6937,-7680,-4790],[-5721,-7113,-8430,-5417],[-5867,-7107,-7934,-5345],[-6443,-7458,-7143,-5023],[-5517,-7328,-7524,-5453],[-6453,-7559,-7347,-5020],[-5989,-6422,-7680,-5755],[-5954,-6531,-8548,-5086],[-5928,-7333,-7733,-4747],[-6346,-7153,-7354,-5572],[-6593,-6319,-6647,-5674],[-6585,-6848,-6848,-5049],[-5896,-7718,-7566,-4992],[-5809,-7226,-7988,-5451],[-6152,-7252,-7659,-5369],[-5692,-7716,-7667,-4792],[-6156,-6899,-6630,-5805],[-6158,-6533,-8447,-5286],[-5987,-7746,-7979,-4635],[-6171,-7759,-7475,-4504],[-5828,-7736,-7416,-5101],[-6142,-7151,-7455,-5372],[-5829,-7263,-7546,-5420],[-4679,-7447,-7730,-5578],[-6499,-6922,-6689,-5208],[-5381,-6167,-6292,-6002],[-6004,-6542,-7238,-5969],[-6527,-7087,-6433,-4702],[-5530,-7341,-8971,-4544],[-5614,-7918,-7694,-4476],[-6054,-7035,-8285,-4823],[-4983,-7897,-8082,-4493],[-6795,-6179,-6690,-4804],[-5658,-7150,-7634,-5743],[-6520,-6848,-7653,-5208],[-5986,-7053,-8135,-4932],[-5996,-7154,-8339,-4929],[-6132,-7335,-7632,-4947],[-6064,-7353,-7482,-5056],[-5608,-7720,-8013,-4412],[-5278,-7927,-8394,-4336],[-6400,-6427,-7889,-5049],[-5938,-7434,-7937,-4744],[-5841,-8045,-7551,-4172],[-6161,-7658,-7271,-4507],[-6459,-6888,-7290,-4575],[-6239,-7741,-7625,-4395],[-5909,-8027,-7701,-4063],[-5711,-7012,-8226,-5420],[-6362,-6831,-7034,-5466],[-6016,-7439,-7430,-5240],[-5795,-6521,-7985,-5552],[-6517,-6649,-7705,-4922],[-5948,-7240,-8287,-5113],[-5857,-7212,-7874,-5470],[-6469,-7237,-7027,-4914],[-6255,-6838,-8236,-4737],[-5527,-7429,-7728,-5450],[-6074,-6952,-8312,-5245],[-5886,-6549,-8398,-5195],[-5379,-6719,-7307,-6050],[-6284,-6531,-7687,-5342],[-5015,-6738,-7130,-5807],[-6097,-6355,-7803,-5522],[-5244,-7713,-7727,-4795],[-5927,-7314,-7323,-5113],[-6333,-7138,-7583,-4861],[-5063,-6705,-6768,-5993],[-5688,-6528,-6699,-5912],[-5744,-7159,-8693,-5169],[-5799,-6908,-8791,-5218],[-5822,-7459,-8040,-5293],[-6051,-7338,-7711,-4345],[-5812,-7358,-7836,-5296],[-5860,-7134,-8590,-4620],[-5744,-7740,-7762,-4721],[-5356,-7646,-8672,-4908],[-5792,-7152,-8440,-4729],[-5624,-6738,-8929,-5010],[-5812,-7141,-8843,-5060],[-5404,-7639,-8419,-4468],[-5838,-7137,-7720,-5187],[-5608,-7641,-8318,-4668],[-6399,-6418,-6952,-5471],[-5082,-7817,-7898,-4353],[-5999,-6186,-6717,-5794],[-5187,-7899,-7981,-4693],[-5045,-6876,-6892,-5773],[-5493,-7212,-7449,-5394],[-5492,-7745,-8116,-4961],[-5828,-6819,-8523,-4954],[-5760,-6837,-8373,-5063],[-5686,-7439,-8291,-4984],[-5734,-7639,-7558,-4724],[-5822,-7538,-7735,-5037],[-6206,-6526,-8194,-4846],[-6129,-7136,-7684,-4661],[-5818,-7418,-8219,-4868],[-6323,-7037,-7379,-4864],[-5734,-7422,-8565,-4488],[-5598,-7540,-8114,-4671],[-5643,-7030,-8076,-5529],[-5595,-7411,-7878,-5341],[-5470,-6747,-7720,-5693],[-6057,-6404,-7830,-5646],[-5391,-7616,-7499,-5321],[-5265,-7618,-8259,-5265],[-5618,-7457,-8141,-5093],[-5830,-7430,-7138,-5254],[-5735,-7109,-6503,-5672],[-5187,-7318,-8912,-5141],[-6352,-6482,-7297,-5127],[-5799,-7343,-8065,-4585],[-6158,-6750,-7440,-5522],[-5197,-7715,-7804,-5118],[-5866,-6632,-8371,-4773],[-5372,-7324,-8352,-4802],[-5896,-7018,-7666,-5081],[-5257,-7465,-8457,-4924],[-5818,-7635,-7212,-5104],[-5702,-7038,-8276,-5134],[-5847,-7092,-7422,-5640],[-5785,-6420,-7781,-5555],[-5325,-7447,-8607,-4815],[-5389,-7932,-7568,-4062],[-5046,-7909,-7509,-4659],[-5973,-7038,-8364,-4221],[-6185,-7231,-5966,-5133],[-5848,-7259,-7014,-5474],[-4765,-7258,-7756,-5689],[-5342,-7136,-7095,-5686],[-4947,-6539,-7987,-5680],[-6257,-7028,-7247,-5445],[-6178,-6787,-6998,-5491],[-5497,-6631,-7410,-5612],[-6165,-6554,-6946,-5649],[-5962,-6998,-6935,-5602],[-5265,-7697,-7954,-5009],[-6700,-6725,-6640,-5122],[-5935,-7442,-7509,-4638],[-5364,-7617,-7770,-4869],[-5654,-7093,-7684,-5212],[-5666,-7440,-8415,-4597],[-5129,-7100,-7799,-5289],[-5038,-7072,-7386,-5646],[-6431,-6723,-7546,-5081],[-5578,-6444,-6380,-5819],[-5459,-7598,-7649,-5212],[-6226,-6732,-7590,-5413],[-6080,-6814,-8169,-4714],[-6187,-6856,-8086,-4846],[-5585,-6595,-7970,-5441],[-5390,-7081,-7687,-5608],[-5812,-7722,-7912,-4612],[-5540,-7738,-7863,-4521],[-5570,-7603,-6823,-4938],[-5115,-6725,-8652,-4525],[-5718,-7497,-7743,-5115],[-5255,-7517,-8055,-5268],[-5449,-7129,-8381,-5326],[-5727,-5985,-7675,-5467],[-6425,-5953,-6291,-5593],[-5650,-7515,-7593,-5224],[-5338,-6067,-6687,-5884],[-5799,-7125,-7784,-5454],[-5547,-7494,-8214,-5010],[-5517,-7111,-8531,-5217],[-5585,-7310,-7674,-5344],[-5853,-6402,-7931,-5446],[-5290,-6565,-7658,-5598],[-5061,-7616,-8360,-5065]]
  });

}());