// The world: regions, locations (with map coordinates), factions and the organizations you can join.

export const REGIONS = {
  central: { name: 'the Central Plains', short: 'Central Plains' },
  guanzhong: { name: 'Guanzhong', short: 'Guanzhong' },
  jingchu: { name: 'Jingchu', short: 'Jingchu' },
  shu: { name: 'the Land of Shu', short: 'Shu' },
  jiangnan: { name: 'Jiangnan', short: 'Jiangnan' },
  hebei: { name: 'Hebei', short: 'Hebei' },
  liaodong: { name: 'Liaodong', short: 'Liaodong' },
  west: { name: 'the Western Frontier', short: 'Western Frontier' },
};

// type: village | city | sect | estate | wild | frontier. scene: backdrop style for the art system.
export const LOCATIONS = {
  willow: { name: 'Willow Creek Village', region: 'guanzhong', type: 'village', x: 182, y: 152, scene: 'village', desc: 'A farming village of forty roofs in the shadow of Mount Hua.' },
  mounthua: { name: 'Mount Hua', region: 'guanzhong', type: 'sect', x: 172, y: 138, scene: 'peaks', sect: 'mounthua', desc: 'Five sheer peaks of granite, and the plum trees of the Mount Hua Sect.' },
  changan: { name: 'Chang’an', region: 'guanzhong', type: 'city', x: 152, y: 146, scene: 'city', desc: 'The old western capital: markets, wine-houses, and old money.' },
  zhongnan: { name: 'Mount Zhongnan', region: 'guanzhong', type: 'sect', x: 146, y: 162, scene: 'forest', sect: 'zhongnan', desc: 'Pine forests and Daoist hermitages south of Chang’an.' },
  kongtong: { name: 'Mount Kongtong', region: 'guanzhong', type: 'sect', x: 122, y: 118, scene: 'peaks', sect: 'kongtong', desc: 'A harsh, wind-scoured mountain where the Kongtong Sect trains its fists.' },
  luoyang: { name: 'Luoyang', region: 'central', type: 'city', x: 202, y: 132, scene: 'city', sect: 'beggars', desc: 'Seat of the Murim Alliance, and of the Beggars’ Sect beneath its bridges.' },
  songshan: { name: 'Mount Song', region: 'central', type: 'sect', x: 214, y: 142, scene: 'temple', sect: 'shaolin', desc: 'Shaolin Temple, where bells have rung for a thousand years.' },
  kaifeng: { name: 'Kaifeng', region: 'central', type: 'city', x: 240, y: 132, scene: 'city', sect: 'bloodshadow', desc: 'A city of canals, gambling dens, and the Ghost Market that opens only at night.' },
  wudang: { name: 'Wudang Mountains', region: 'jingchu', type: 'sect', x: 194, y: 180, scene: 'temple', sect: 'wudang', desc: 'Seventy-two peaks bowing toward the Golden Summit of the Wudang Sect.' },
  wuchang: { name: 'Wuchang', region: 'jingchu', type: 'city', x: 234, y: 194, scene: 'river', desc: 'A river port where the Han meets the Great River.' },
  dongting: { name: 'Lake Dongting', region: 'jingchu', type: 'wild', x: 214, y: 214, scene: 'lake', sect: 'waterfortress', desc: 'Eight hundred li of reeds and the Water Fortress that rules them.' },
  chengdu: { name: 'Chengdu', region: 'shu', type: 'city', x: 122, y: 200, scene: 'city', desc: 'The city of brocade and hot pepper, ringed by mountains.' },
  emei: { name: 'Mount Emei', region: 'shu', type: 'sect', x: 108, y: 220, scene: 'temple', sect: 'emei', desc: 'Golden Summit, sea of clouds, and the swordswomen of Emei.' },
  qingcheng: { name: 'Mount Qingcheng', region: 'shu', type: 'sect', x: 110, y: 190, scene: 'forest', sect: 'qingcheng', desc: 'Green, secluded and proud; the Qingcheng Sect forgets no insult.' },
  dangclan: { name: 'Dang Clan Manor', region: 'shu', type: 'estate', x: 136, y: 212, scene: 'estate', sect: 'dang', desc: 'Walls within walls, gardens that are also poison farms.' },
  diancang: { name: 'Mount Diancang', region: 'shu', type: 'sect', x: 96, y: 262, scene: 'peaks', sect: 'diancang', desc: 'Far south among the clouds of the southern frontier, home to the fastest swords in the land.' },
  namgung: { name: 'Namgung Estate', region: 'jiangnan', type: 'estate', x: 286, y: 174, scene: 'estate', sect: 'namgung', desc: 'The greatest of the Five Families, and it never lets you forget it.' },
  hangzhou: { name: 'Hangzhou', region: 'jiangnan', type: 'city', x: 322, y: 202, scene: 'lake', sect: 'goldenabacus', desc: 'West Lake, silk, tea and the counting houses of the merchant guilds.' },
  capital: { name: 'the Imperial Capital', region: 'hebei', type: 'city', x: 286, y: 70, scene: 'palace', sect: 'easterndepot', desc: 'Red walls, yellow roofs, and the Eastern Depot watching from behind both.' },
  paeng: { name: 'Paeng Family Fortress', region: 'hebei', type: 'estate', x: 262, y: 92, scene: 'estate', sect: 'paeng', desc: 'A fortress of loud men and heavy sabers.' },
  jegal: { name: 'Jegal Estate', region: 'hebei', type: 'estate', x: 302, y: 110, scene: 'estate', sect: 'jegal', desc: 'Libraries, formations, and patient schemes.' },
  taihang: { name: 'Taihang Mountains', region: 'hebei', type: 'wild', x: 232, y: 100, scene: 'peaks', sect: 'greenforest', desc: 'Bandit country: the Green Forest’s seventy-two strongholds.' },
  moyong: { name: 'Moyong Clan Seat', region: 'liaodong', type: 'estate', x: 344, y: 54, scene: 'snow', sect: 'moyong', desc: 'Cold sea, cold wind, and the coldest courtesy in the murim.' },
  kunlun: { name: 'Kunlun Mountains', region: 'west', type: 'sect', x: 52, y: 130, scene: 'snow', sect: 'kunlun', desc: 'Snow that never melts, and the Kunlun Sect at the roof of the world.' },
  jadegate: { name: 'Jade Gate Pass', region: 'west', type: 'frontier', x: 96, y: 86, scene: 'desert', desc: 'The last gate of the empire. Beyond it, sand and caravans.' },
  tenthousand: { name: 'the Ten Thousand Mountains', region: 'west', type: 'frontier', x: 54, y: 60, scene: 'demonic', sect: 'cult', desc: 'Black peaks, red banners, and the Heavenly Demon Divine Cult.' },
};

export const FACTIONS = {
  orthodox: { name: 'Orthodox Sects', short: 'Orthodox', color: '#3d6a8a', desc: 'The Nine Great Sects and the Beggars’ Sect, bound together in the Murim Alliance.' },
  families: { name: 'Five Great Families', short: 'Families', color: '#a87a2a', desc: 'Namgung, Moyong, Paeng, Dang and Jegal: blood, money and inherited arts.' },
  unorthodox: { name: 'Unorthodox Factions', short: 'Unorthodox', color: '#3d6b4f', desc: 'The Black Path: bandit lords, river pirates and assassins.' },
  cult: { name: 'Heavenly Demon Divine Cult', short: 'Cult', color: '#8f2a1f', desc: 'Beyond the western mountains, a faith of strength. Cruel, but not without reasons.' },
  court: { name: 'Imperial Court', short: 'Court', color: '#6b4c7d', desc: 'The throne, its officials, and the Eastern Depot that watches the murim.' },
  merchants: { name: 'Merchant Guilds', short: 'Merchants', color: '#b86a2e', desc: 'Escort agencies, counting houses and information brokers.' },
};

const SECT_RANKS = ['Outer Disciple', 'Inner Disciple', 'Direct Disciple', 'Elder', 'Sect Leader'];
const FAMILY_RANKS = ['Retainer', 'Kinsman', 'Honored Kin', 'Family Elder', 'Patriarch'];
const BLACK_RANKS = ['Initiate', 'Sworn Brother', 'Captain', 'Lord', 'Overlord'];
const CULT_RANKS = ['Believer', 'Demon Warrior', 'Commander', 'Elder', 'Heavenly Demon'];
const COURT_RANKS = ['Constable', 'Officer', 'Commander', 'Director', 'Grand Director'];
const GUILD_RANKS = ['Apprentice', 'Clerk', 'Manager', 'Partner', 'Guild Master'];

// Joinable organizations. `manuals` lists what each rank grants (index = rank).
// `admit`: who can enter by the front door; events open other doors.
export const SECTS = {
  mounthua: { name: 'Mount Hua Sect', faction: 'orthodox', loc: 'mounthua', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['hua_mind', 'sword_basic'], ['hua_plum_sword'], ['hua_fragrance_step'], ['hua_purple_mist'], []],
    admit: { age: [6, 16] }, desc: 'Plum blossoms and sword flowers. Once great, now proud and poor.' },
  shaolin: { name: 'Shaolin Temple', faction: 'orthodox', loc: 'songshan', ranks: ['Lay Disciple', 'Monk', 'Warrior Monk', 'Elder', 'Abbot'], path: 'orthodox',
    manuals: [['shao_breath', 'shao_arhat'], ['shao_bell'], ['shao_staff'], ['shao_tathagata'], ['shao_tendon']],
    admit: { age: [6, 20] }, desc: 'The ancestor of all martial arts. Patient, vast, and slow to anger.' },
  wudang: { name: 'Wudang Sect', faction: 'orthodox', loc: 'wudang', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['wu_mind', 'wu_taiji_fist'], ['wu_taiji_sword'], ['wu_ladder'], ['wu_pure_yang'], []],
    admit: { age: [6, 16] }, desc: 'Softness that overcomes hardness; the Taiji turns.' },
  emei: { name: 'Emei Sect', faction: 'orthodox', loc: 'emei', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['emei_mind', 'sword_basic'], ['emei_sword'], ['emei_needles'], ['emei_buddha_light'], []],
    admit: { age: [6, 16], gender: 'f' }, desc: 'Swordswomen and nuns; they take no male disciples.' },
  kunlun: { name: 'Kunlun Sect', faction: 'orthodox', loc: 'kunlun', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['kun_mind', 'sword_basic'], ['kun_cloud_sword'], ['kun_cloud_step'], ['kun_snow_palm'], []],
    admit: { age: [6, 16] }, desc: 'Remote and aloof. Their lightness arts are the best in the world.' },
  kongtong: { name: 'Kongtong Sect', faction: 'orthodox', loc: 'kongtong', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['kong_mind', 'fist_basic'], ['kong_seven_injuries'], ['kong_iron_wall'], [], []],
    admit: { age: [6, 18] }, desc: 'Fists like falling rocks. Their Seven Injuries Fist wounds the user too.' },
  qingcheng: { name: 'Qingcheng Sect', faction: 'orthodox', loc: 'qingcheng', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['qing_mind', 'sword_basic'], ['qing_pine_sword'], ['qing_rain_needles'], [], []],
    admit: { age: [6, 16] }, desc: 'Elegant swords and long grudges.' },
  diancang: { name: 'Diancang Sect', faction: 'orthodox', loc: 'diancang', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['dian_mind', 'sword_basic'], ['dian_swift_sword'], ['dian_cloud_step'], [], []],
    admit: { age: [6, 16] }, desc: 'The fastest swords under Heaven, if the south remembers them at all.' },
  zhongnan: { name: 'Zhongnan Sect', faction: 'orthodox', loc: 'zhongnan', ranks: SECT_RANKS, path: 'orthodox',
    manuals: [['zhong_mind', 'sword_basic'], ['zhong_heaven_gate'], ['zhong_formation'], [], []],
    admit: { age: [6, 16] }, desc: 'Daoist swordsmen who fight in formations of seven.' },
  beggars: { name: 'Beggars’ Sect', faction: 'orthodox', loc: 'luoyang', ranks: ['One-Pouch', 'Three-Pouch', 'Six-Pouch', 'Nine-Pouch Elder', 'Clan Chief'], path: 'orthodox',
    manuals: [['beg_mind', 'fist_basic'], ['beg_staff'], ['beg_drunk_step'], ['beg_dragon_palms'], []],
    admit: { age: [8, 40] }, desc: 'The largest sect under Heaven, and the best informed.' },

  namgung: { name: 'Namgung Family', faction: 'families', loc: 'namgung', ranks: FAMILY_RANKS, path: 'orthodox',
    manuals: [['nam_mind', 'sword_basic'], ['nam_emperor_sword'], [], ['nam_heaven_thunder'], []],
    admit: { origin: ['branch'] }, desc: 'The Heavenly Emperor Sword and a thousand years of pride.' },
  moyong: { name: 'Moyong Family', faction: 'families', loc: 'moyong', ranks: FAMILY_RANKS, path: 'orthodox',
    manuals: [['moy_mind', 'sword_basic'], ['moy_return_art'], [], ['moy_star_shift'], []],
    admit: {}, desc: 'They return your own technique to you, with interest.' },
  paeng: { name: 'Paeng Family', faction: 'families', loc: 'paeng', ranks: FAMILY_RANKS, path: 'external',
    manuals: [['paeng_mind', 'fist_basic'], ['paeng_tiger_saber'], ['ext_iron_shirt'], [], []],
    admit: {}, desc: 'Five Tigers Severing Saber. Subtlety is for other families.' },
  dang: { name: 'Dang Family', faction: 'families', loc: 'dangclan', ranks: FAMILY_RANKS, path: 'poison',
    manuals: [['dang_mind', 'dang_needles'], ['dang_poison_canon'], [], ['dang_rain_of_flowers'], []],
    admit: {}, desc: 'Hidden weapons and poisons. Their secrets do not leave the manor alive.' },
  jegal: { name: 'Jegal Family', faction: 'families', loc: 'jegal', ranks: FAMILY_RANKS, path: 'orthodox',
    manuals: [['jegal_mind', 'fist_basic'], ['jegal_formations'], [], ['jegal_sleeping_dragon'], []],
    admit: {}, desc: 'Strategists and formation masters. They win before the battle starts.' },

  greenforest: { name: 'Green Forest Alliance', faction: 'unorthodox', loc: 'taihang', ranks: BLACK_RANKS, path: 'unorthodox',
    manuals: [['uno_mind', 'fist_basic'], ['uno_mountain_axe'], ['uno_ghost_step'], ['uno_blood_saber'], []],
    admit: { age: [12, 60] }, desc: 'Seventy-two strongholds of bandits who call themselves brothers.' },
  waterfortress: { name: 'Water Fortress of Dongting', faction: 'unorthodox', loc: 'dongting', ranks: BLACK_RANKS, path: 'unorthodox',
    manuals: [['uno_mind', 'fist_basic'], ['uno_water_palm'], ['uno_ghost_step'], [], []],
    admit: { age: [12, 60] }, desc: 'River pirates, toll-takers, and the best swimmers alive.' },
  bloodshadow: { name: 'Blood Shadow Pavilion', faction: 'unorthodox', loc: 'kaifeng', ranks: ['Blade', 'Shadow', 'Silent Shadow', 'Pavilion Elder', 'Pavilion Master'], path: 'unorthodox',
    manuals: [['uno_mind', 'uno_silent_needle'], ['uno_ghost_step'], ['uno_blood_saber'], [], []],
    admit: { age: [12, 40] }, desc: 'Assassins for hire. Their contracts are never broken.' },
  cult: { name: 'Heavenly Demon Divine Cult', faction: 'cult', loc: 'tenthousand', ranks: CULT_RANKS, path: 'demonic',
    manuals: [['cult_mind', 'fist_basic'], ['cult_demon_palm'], ['cult_shadow_step'], ['cult_blood_art'], ['cult_heavenly_demon']],
    admit: { origin: ['cultborn'] }, desc: 'Strength is the only scripture. The Heavenly Demon is its prophet.' },
  easterndepot: { name: 'Eastern Depot', faction: 'court', loc: 'capital', ranks: COURT_RANKS, path: 'unorthodox',
    manuals: [['court_mind', 'court_guard_saber'], [], ['court_withered_flower'], [], []],
    admit: { age: [16, 50] }, desc: 'The emperor’s secret police, and the murim’s nightmare.' },
  goldenabacus: { name: 'Golden Abacus Guild', faction: 'merchants', loc: 'hangzhou', ranks: GUILD_RANKS, path: 'orthodox',
    manuals: [['breath_basic'], ['escort_spear'], [], [], []],
    admit: { age: [12, 60] }, desc: 'Silk, tea, salt, and the escort agencies that guard them.' },
};

// Minimum realm for each rank (index = rank). Rank 0 needs nothing.
export const RANK_REALM = [0, 1, 3, 4, 6];
// Merit needed to be promoted into each rank.
export const RANK_MERIT = [0, 30, 90, 200, 400];

// Straight-line distance → seasons of travel.
export function travelSeasons(a, b) {
  const A = LOCATIONS[a];
  const B = LOCATIONS[b];
  if (!A || !B || a === b) return 0;
  const d = Math.hypot(A.x - B.x, A.y - B.y);
  return Math.max(1, Math.round(d / 85));
}

export function nearby(locId, radius = 70) {
  const A = LOCATIONS[locId];
  return Object.entries(LOCATIONS)
    .filter(([id, L]) => id !== locId && Math.hypot(A.x - L.x, A.y - L.y) <= radius)
    .map(([id]) => id);
}

export const sectOf = (id) => SECTS[id];
export const factionOfLoc = (locId) => {
  const s = LOCATIONS[locId]?.sect;
  return s ? SECTS[s].faction : null;
};
