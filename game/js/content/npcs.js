// Named characters. They exist in every loop, are born in the same year, and (unless you change
// something) rise, fall and die on the same schedule. Years are world years: you are born in year 1.
//
// realms: [[year, realm], …]  locs: [[year, loc], …]  dies: { year, cause, text, unless: condition }
// romance: can be courted. traits drive interaction flavour. warn: codex entry that lets you warn them.

const R = (...pairs) => pairs;

export const ROSTER = {
  // ── The other regressor ─────────────────────────────────────────────
  seol: {
    name: 'Yu Seol-hwa', g: 'f', born: 1, romance: true, traits: ['cold', 'driven', 'secretive'], loc: 'changan',
    locs: [[12, 'mounthua'], [20, 'luoyang'], [30, 'mounthua']],
    realms: R([5, 1], [10, 2], [15, 3], [21, 4], [29, 5], [44, 6]),
    dies: { year: 34, cause: 'She died at the Blood Night of Mount Hua, shielding her brother.', unless: { or: [{ averted: 'blood_night' }, { flag: 'seol.saved' }] } },
    desc: 'A girl from a ruined Chang’an family who always seems to know what happens next.',
  },
  yujin: {
    name: 'Yu Jin', g: 'm', born: 4, traits: ['earnest', 'kind'], loc: 'changan', sect: 'mounthua', locs: [[12, 'mounthua']],
    realms: R([12, 1], [20, 2], [28, 3]), warn: 'people.yujin',
    dies: { year: 34, cause: 'He fell on the main hall steps at the Blood Night of Mount Hua.', unless: { averted: 'blood_night' } },
    desc: 'Seol-hwa’s younger brother. A Mount Hua disciple with more heart than talent.',
  },

  // ── Mount Hua ───────────────────────────────────────────────────────
  hua_leader: {
    name: 'Hyeon Mu-gyeong', g: 'm', born: -52, sect: 'mounthua', loc: 'mounthua', nick: 'the Plum Sword', traits: ['gentle', 'tired', 'honest'],
    realms: R([1, 5]), warn: 'timeline.blood_night',
    dies: { year: 34, cause: 'He died holding the main gate at the Blood Night.', unless: { averted: 'blood_night' } },
    desc: 'Sect Leader of Mount Hua. Holding a poor, proud sect together with both hands.',
  },
  hua_traitor: {
    name: 'Gu Dal-pyeong', g: 'm', born: -44, sect: 'mounthua', loc: 'mounthua', traits: ['smiling', 'treacherous', 'greedy'],
    realms: R([1, 4]),
    dies: { year: 34, cause: 'The Cult killed him the night after he opened the gate for them.', unless: { flag: 'traitor.exposed' } },
    desc: 'A Mount Hua elder with a warm smile and enormous debts.',
  },
  hua_un: {
    name: 'Seo Un-pyeong', g: 'm', born: -58, sect: 'mounthua', loc: 'mounthua', traits: ['stern', 'kind', 'drunk'],
    realms: R([1, 4], [20, 5]), master: true,
    dies: { year: 34, cause: 'He died at the Blood Night with a wine gourd still at his hip.', unless: { averted: 'blood_night' } },
    desc: 'The sect’s finest swordsman, and its worst-behaved elder.',
  },
  hua_senior: {
    name: 'Bang Ho-jin', g: 'm', born: -5, sect: 'mounthua', loc: 'mounthua', traits: ['proud', 'loyal'],
    realms: R([1, 1], [8, 2], [16, 3], [27, 4]),
    dies: { year: 34, cause: 'He died at the Blood Night.', unless: { averted: 'blood_night' } },
    desc: 'Mount Hua’s eldest disciple of your generation. Prickly, and fiercely loyal.',
  },
  hua_harin: {
    name: 'Ok Ha-rin', g: 'f', born: 2, sect: 'mounthua', loc: 'mounthua', romance: true, traits: ['cheerful', 'brave'],
    realms: R([10, 1], [17, 2], [25, 3], [33, 4]),
    dies: { year: 34, cause: 'She died at the Blood Night, covering the juniors’ retreat.', unless: { averted: 'blood_night' } },
    desc: 'A Mount Hua junior who laughs too loudly and trains too hard.',
  },
  hua_cook: { name: 'Granny Pyo', g: 'f', born: -60, sect: 'mounthua', loc: 'mounthua', traits: ['kind', 'nosy'], realms: R([1, 0]), desc: 'The sect cook. Knows every secret, feeds every stray.' },

  // ── Willow Creek ────────────────────────────────────────────────────
  jiho: { name: 'Han Ji-ho', g: 'm', born: 1, loc: 'willow', romance: true, traits: ['loyal', 'stubborn'], realms: R([16, 1], [25, 2]), desc: 'The miller’s son. Your oldest friend, if you let him be.' },
  bora: { name: 'Yun Bo-ra', g: 'f', born: 1, loc: 'willow', romance: true, traits: ['clever', 'sharp-tongued'], realms: R([1, 0]), desc: 'The village chief’s daughter, who reads more books than the village owns.' },
  village_chief: { name: 'Chief Yun Pal-bok', g: 'm', born: -40, loc: 'willow', traits: ['anxious', 'honest'], realms: R([1, 0]),
    dies: { year: 15, cause: 'He was killed in the raid on Willow Creek.', unless: { averted: 'willow_raid' } }, desc: 'Willow Creek’s worried chief.' },

  // ── Namgung ─────────────────────────────────────────────────────────
  namgung_jin: {
    name: 'Namgung Jin', g: 'm', born: 0, sect: 'namgung', loc: 'namgung', romance: true, traits: ['arrogant', 'proud', 'talented'],
    realms: R([6, 1], [12, 2], [18, 3], [26, 4], [39, 5], [60, 6]),
    dies: { year: 38, cause: 'He died defending the Namgung Estate against the Cult.', unless: { averted: 'cult_war' } },
    desc: 'Heir apparent of the Namgung. Talented, insufferable, and lonelier than he looks.',
  },
  namgung_sohee: {
    name: 'Namgung So-hee', g: 'f', born: 2, sect: 'namgung', loc: 'namgung', romance: true, traits: ['gentle', 'talented', 'stubborn'],
    realms: R([8, 1], [14, 2], [21, 3], [30, 4]),
    dies: { year: 38, cause: 'She died when the Namgung Estate burned.', unless: { averted: 'cult_war' } },
    desc: 'Namgung Jin’s younger sister. A sword prodigy her family keeps in a cage of silk.',
  },
  namgung_hwi: {
    name: 'Namgung Hwi', g: 'm', born: -48, sect: 'namgung', loc: 'namgung', traits: ['proud', 'just'], realms: R([1, 5]), warn: 'timeline.namgung_assassination', warnAverts: 'namgung_assassination',
    dies: { year: 23, cause: 'He was assassinated in his own study.', unless: { averted: 'namgung_assassination' } },
    desc: 'Patriarch of the Namgung. A hard man who keeps his word.',
  },

  // ── Demonic Cult ────────────────────────────────────────────────────
  old_demon: {
    name: 'Dokgo Hyeok', g: 'm', born: -72, sect: 'cult', loc: 'tenthousand', nick: 'the Heavenly Demon', traits: ['ancient', 'weary'], realms: R([1, 7]), warn: 'timeline.demon_poisoned', warnAverts: 'demon_poisoned',
    dies: { year: 28, cause: 'The old Heavenly Demon died suddenly. The Cult says it was age. It was poison.', unless: { averted: 'demon_poisoned' } },
    desc: 'The aging Heavenly Demon, who has kept the Cult in its mountains for forty years.',
  },
  blood_demon: {
    name: 'Ma Hyeol-cheon', g: 'm', born: -42, sect: 'cult', loc: 'tenthousand', nick: 'the Blood Demon', traits: ['ruthless', 'ambitious'],
    realms: R([1, 6], [30, 7]),
    dies: { year: 41, cause: 'He was slain at the Battle of the Yellow River Ford.', unless: { averted: 'cult_war' } },
    desc: 'Elder of the Blood Faction. He thinks the Cult has hidden long enough.',
  },
  haryeong: {
    name: 'Dan Ha-ryeong', g: 'f', born: -2, sect: 'cult', loc: 'tenthousand', romance: true, nick: 'the Young Heavenly Demon', traits: ['proud', 'clever', 'lonely'],
    realms: R([4, 1], [10, 3], [18, 4], [26, 5], [40, 6]), warn: 'timeline.cult_coup', warnAverts: 'cult_coup',
    dies: { year: 29, cause: 'She was killed in the Blood Faction’s coup.', unless: { averted: 'cult_coup' } },
    desc: 'The old Heavenly Demon’s chosen heir. She wants the Cult to be more than a weapon.',
  },
  mokcheol: { name: 'Mok Cheol', g: 'm', born: 1, sect: 'cult', loc: 'tenthousand', traits: ['quiet', 'loyal'], realms: R([8, 1], [16, 2], [24, 3], [35, 4]), desc: 'A Cult child who shares his food and never his feelings.' },
  shadow_master: { name: 'Ok Gwi', g: 'm', born: -40, sect: 'cult', loc: 'tenthousand', nick: 'Master of the Shadow Hall', traits: ['silent', 'cruel'], realms: R([1, 5], [30, 6]), desc: 'The Cult’s spymaster. Nobody has seen him blink.' },

  // ── Shaolin, Wudang, Emei, Kunlun, Beggars ─────────────────────────
  abbot: { name: 'Abbot Hyeon-gong', g: 'm', born: -70, sect: 'shaolin', loc: 'songshan', traits: ['serene', 'wise'], realms: R([1, 6]),
    dies: { year: 36, cause: 'He fell at the Siege of Mount Song.', unless: { averted: 'cult_war' } }, desc: 'Abbot of Shaolin. He has not raised his voice in thirty years.' },
  ilgak: { name: 'Il-gak', g: 'm', born: -1, sect: 'shaolin', loc: 'songshan', traits: ['cheerful', 'hungry', 'loyal'], realms: R([8, 1], [15, 2], [22, 3], [32, 4]), desc: 'A young monk who eats like a tiger and fights like a wall.' },
  sweeping_monk: { name: 'the Sweeping Monk', g: 'm', born: -95, sect: 'shaolin', loc: 'songshan', traits: ['hidden', 'serene'], realms: R([1, 8]), lifespan: 200, master: true, desc: 'An old monk who sweeps the Scripture Pavilion. Nobody remembers him arriving.' },
  cheongun: { name: 'Cheong-un', g: 'm', born: -84, sect: 'wudang', loc: 'wudang', nick: 'the Pure Cloud Daoist', traits: ['serene', 'playful'], realms: R([1, 7]), lifespan: 160, master: true, desc: 'Wudang’s eldest master, rumoured to be the strongest man in the Orthodox world.' },
  yeonwoo: { name: 'Song Yeon-woo', g: 'm', born: 2, sect: 'wudang', loc: 'wudang', romance: true, traits: ['gentle', 'serious'], realms: R([9, 1], [16, 2], [24, 3], [34, 4]), desc: 'A Wudang disciple who apologises before every duel and wins most of them.' },
  abbess: { name: 'Abbess Myo-hwa', g: 'f', born: -55, sect: 'emei', loc: 'emei', traits: ['strict', 'just'], realms: R([1, 5]), desc: 'Abbess of Emei. Her silence is a sentence.' },
  hyeryeong: { name: 'Gang Hye-ryeong', g: 'f', born: 0, sect: 'emei', loc: 'emei', romance: true, traits: ['fierce', 'loyal'], realms: R([8, 1], [15, 2], [23, 3], [33, 4]), desc: 'An Emei swordswoman who settles arguments with her sword and apologises with her cooking.' },
  kunlun_leader: { name: 'Baek Seol-san', g: 'm', born: -50, sect: 'kunlun', loc: 'kunlun', traits: ['aloof', 'proud'], realms: R([1, 5]), desc: 'Leader of the Kunlun Sect, who descends from the mountains once a decade.' },
  beggar_chief: { name: 'Hong Chil', g: 'm', born: -60, sect: 'beggars', loc: 'luoyang', nick: 'the Nine-Fingered Beggar', traits: ['jovial', 'shrewd'], realms: R([1, 6]), master: true, desc: 'Chief of the Beggars’ Sect. Knows everything, pays for nothing.' },
  dongsu: { name: 'Dong-su', g: 'm', born: 0, sect: 'beggars', loc: 'luoyang', traits: ['scrappy', 'loyal', 'funny'], realms: R([10, 1], [18, 2], [28, 3]), desc: 'A street urchin of the Beggars’ Sect with quick hands and a big mouth.' },
  alliance_leader: { name: 'Hwangbo Jun', g: 'm', born: -54, sect: 'zhongnan', loc: 'luoyang', traits: ['charming', 'hypocritical', 'ambitious'], realms: R([1, 6]), desc: 'Leader of the Murim Alliance. Righteous in public, practical in private.' },

  // ── The other Families ──────────────────────────────────────────────
  moyong_baek: { name: 'Moyong Baek', g: 'm', born: -50, sect: 'moyong', loc: 'moyong', traits: ['cold', 'calculating'], realms: R([1, 5]), desc: 'Moyong patriarch. Courteous as frost.' },
  moyong_yeon: { name: 'Moyong Yeon', g: 'f', born: 3, sect: 'moyong', loc: 'moyong', romance: true, traits: ['cold', 'curious'], realms: R([9, 1], [15, 2], [22, 3], [30, 4]), desc: 'The Moyong heir, who studies people the way others study swords.' },
  paeng_daeho: { name: 'Paeng Dae-ho', g: 'm', born: -46, sect: 'paeng', loc: 'paeng', traits: ['loud', 'generous'], realms: R([1, 5]), desc: 'Paeng patriarch. Laughs like a landslide.' },
  paeng_gu: { name: 'Paeng Gu', g: 'm', born: 1, sect: 'paeng', loc: 'paeng', traits: ['brash', 'loyal', 'hungry'], realms: R([7, 1], [14, 2], [21, 3], [31, 4]), desc: 'A Paeng son who would rather drink with you than duel you, and does both.' },
  dang_okran: { name: 'Dang Ok-ran', g: 'f', born: -62, sect: 'dang', loc: 'dangclan', traits: ['ruthless', 'protective'], realms: R([1, 5]), warn: 'timeline.dang_civil_war', warnAverts: 'dang_civil_war',
    dies: { year: 26, cause: 'She died in the Dang family’s civil war.', unless: { averted: 'dang_civil_war' } }, desc: 'The Dang matriarch. Her tea is safe. Probably.' },
  dang_min: { name: 'Dang Min', g: 'm', born: 2, sect: 'dang', loc: 'dangclan', romance: true, traits: ['curious', 'awkward', 'kind'], realms: R([10, 1], [17, 2], [26, 3]), desc: 'A Dang prodigy who would rather cure people than poison them.' },
  jegal_mun: { name: 'Jegal Mun', g: 'm', born: -50, sect: 'jegal', loc: 'jegal', traits: ['patient', 'scheming'], realms: R([1, 4]), desc: 'Jegal patriarch. Every move he makes is three moves old.' },
  jegal_ha: { name: 'Jegal Ha', g: 'f', born: 1, sect: 'jegal', loc: 'jegal', romance: true, traits: ['clever', 'playful'], realms: R([10, 1], [18, 2], [27, 3]), desc: 'A Jegal strategist who plays baduk against herself and loses on purpose.' },

  // ── Unorthodox ──────────────────────────────────────────────────────
  mountain_tiger: { name: 'Ma Hu', g: 'm', born: -40, sect: 'greenforest', loc: 'taihang', nick: 'the Mountain Tiger', traits: ['loud', 'honorable'], realms: R([1, 5]), desc: 'King of the Green Forest. A bandit who keeps his word.' },
  water_lord: { name: 'Gyeong Pa', g: 'm', born: -45, sect: 'waterfortress', loc: 'dongting', traits: ['greedy', 'practical'], realms: R([1, 5]), desc: 'Lord of the Water Fortress. Tolls are tolls.' },
  nameless: { name: 'Nameless', g: 'f', born: -38, sect: 'bloodshadow', loc: 'kaifeng', nick: 'Master of the Blood Shadow Pavilion', traits: ['silent', 'professional'], realms: R([1, 6]), desc: 'The assassin who leads the assassins. Nobody knows her face twice.' },
  blood_blade: { name: 'Pi Mun', g: 'm', born: -22, sect: 'greenforest', loc: 'taihang', nick: 'the Blood Blade Ghost', traits: ['cruel', 'cowardly'], realms: R([1, 3], [20, 4]), warn: 'timeline.willow_raid',
    dies: { year: 47, cause: 'He was cut down by the Alliance.', unless: { flag: 'never' } }, desc: 'A bandit chief who burns villages for sport.' },

  // ── Court and merchants ─────────────────────────────────────────────
  depot_director: { name: 'Wi Chung-hyeon', g: 'm', born: -40, sect: 'easterndepot', loc: 'capital', traits: ['smiling', 'ruthless', 'patient'], realms: R([1, 6]), desc: 'Director of the Eastern Depot. The murim is a disease he intends to cure.' },
  guard_commander: { name: 'Han Gyeong', g: 'm', born: -34, sect: 'easterndepot', loc: 'capital', traits: ['honest', 'tired'], realms: R([1, 4], [20, 5]), desc: 'Commander of the Imperial Guard, and the only honest man in the capital.' },
  merchant_king: { name: 'Geum Man-bok', g: 'm', born: -50, sect: 'goldenabacus', loc: 'hangzhou', traits: ['greedy', 'jovial'], realms: R([1, 1]), desc: 'Master of the Golden Abacus Guild. He weighs friendship in silver.' },
  madam_yeon: { name: 'Madam Yeon', g: 'f', born: -40, loc: 'kaifeng', traits: ['charming', 'shrewd'], realms: R([1, 3]), desc: 'Proprietress of the Thousand Ears Pavilion. Sells secrets by the ounce.' },
  escort_chief: { name: 'Pyo Gwang', g: 'm', born: -38, loc: 'luoyang', traits: ['honest', 'gruff'], realms: R([1, 3]), desc: 'Chief of the Dragon-Tiger Escort Agency.' },
  gaeun: { name: 'Seo Ga-eun', g: 'f', born: 1, loc: 'hangzhou', romance: true, traits: ['shrewd', 'warm'], realms: R([1, 0]), desc: 'A merchant’s daughter who can price a horse by its gait.' },
  taeo: { name: 'Kang Tae-o', g: 'm', born: -1, loc: 'luoyang', romance: true, traits: ['honest', 'shy'], realms: R([16, 1], [24, 2], [32, 3]), desc: 'A young escort guard with a crooked smile.' },

  // ── Hidden experts and wanderers ────────────────────────────────────
  sword_saint: { name: 'Dokgo Ung', g: 'm', born: -68, loc: 'zhongnan', nick: 'the Drunken Sword Saint', traits: ['drunk', 'lonely', 'hidden'], realms: R([1, 7]), master: true,
    locs: [[10, 'luoyang'], [20, 'dongting'], [30, 'mounthua'], [40, 'kunlun']],
    dies: { year: 52, cause: 'He died alone, with a wine jar for a pillow.', unless: { flag: 'saint.disciple' } }, desc: 'The greatest swordsman of the last generation, now mostly a drunk.' },
  yakseon: { name: 'Yak Seon', g: 'f', born: -80, loc: 'emei', nick: 'the Medicine Immortal', traits: ['eccentric', 'kind', 'hidden'], realms: R([1, 5]), lifespan: 140, master: true, desc: 'A hermit physician who lives in a valley that is not on any map.' },
  fisherman: { name: 'the Old Fisherman', g: 'm', born: -76, loc: 'dongting', traits: ['hidden', 'quiet'], realms: R([1, 6]), lifespan: 130, desc: 'He fishes Lake Dongting with no bait. He catches more than you would think.' },
  oldgu: { name: 'Old Man Gu', g: 'm', born: -57, sect: 'beggars', loc: 'luoyang', traits: ['drunk', 'kind'], realms: R([1, 3]), warn: 'timeline.old_gu', warnAverts: 'old_gu',
    dies: { year: 10, cause: 'He was killed by men in Eastern Depot black.', unless: { averted: 'old_gu' } }, desc: 'A drunken beggar with a secret he never tells sober.' },
};

// Characters who can become your master if you earn it.
export const MASTER_CANDIDATES = Object.entries(ROSTER).filter(([, r]) => r.master).map(([id]) => id);
