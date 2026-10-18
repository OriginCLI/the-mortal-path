// Martial manuals. A "heart" manual is an internal method you cultivate with (sets your pace and how
// high it can take you). An "art" manual teaches combat techniques. Mastery (0–100) unlocks an art's
// techniques in order at 0, 35 and 70.
//
// Technique kinds: strike, heavy, guard, step, hidden, poison, counter.

const KIND = {
  strike: { pow: 1.0, cost: 4 },
  heavy: { pow: 1.9, cost: 14 },
  guard: { pow: 0.5, cost: 3 },
  step: { pow: 0.6, cost: 3 },
  hidden: { pow: 0.9, cost: 5 },
  poison: { pow: 0.7, cost: 6 },
  counter: { pow: 1.2, cost: 8 },
};

export const MANUALS = {};
export const TECHS = {};

function heart(id, name, o) {
  MANUALS[id] = { id, name, type: 'heart', techs: [], rarity: 'common', tier: 0, ...o };
}
function art(id, name, o, techs) {
  const ids = techs.map(([tname, kind, extra = {}], i) => {
    const tid = `${id}.${i}`;
    TECHS[tid] = { id: tid, name: tname, kind, manual: id, ...KIND[kind], ...extra, pow: (extra.pow ?? KIND[kind].pow) * (1 + (o.tier || 0) * 0.12) };
    return tid;
  });
  MANUALS[id] = { id, name, type: 'art', rarity: 'common', tier: 0, ...o, techs: ids };
}

// Basic techniques everyone has.
TECHS.basic_strike = { id: 'basic_strike', name: 'a plain strike', kind: 'strike', pow: 0.8, cost: 0, manual: null };
TECHS.basic_guard = { id: 'basic_guard', name: 'a careful guard', kind: 'guard', pow: 0.4, cost: 0, manual: null };

// ── Common ──────────────────────────────────────────────
heart('breath_basic', 'Three-Breath Foundation Method', { path: 'orthodox', qi: 1.0, cap: 3, desc: 'The breathing exercise every village teacher knows. It will take you to First-Rate and no further.' });
art('fist_basic', 'Common Fist Forms', { path: 'any', weapon: 'fist' }, [['Straight Fist', 'strike'], ['Low Sweep', 'strike', { pow: 1.1 }], ['Rooted Stance', 'guard']]);
art('sword_basic', 'Basic Sword Forms', { path: 'any', weapon: 'sword' }, [['Level Thrust', 'strike'], ['Hanging Guard', 'guard'], ['Crossing Cut', 'strike', { pow: 1.15 }]]);
art('step_basic', 'Grass-Skimming Step', { path: 'any', weapon: 'step' }, [['Grass-Skimming Step', 'step']]);
art('escort_spear', 'Escort’s Flowing Spear', { path: 'any', weapon: 'spear', tier: 1 }, [['Spear Like Flowing Water', 'strike'], ['Wheel of Spears', 'guard'], ['Dragon Leaves the Sea', 'heavy']]);

// ── Mount Hua ───────────────────────────────────────────
heart('hua_mind', 'Mount Hua Heart Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'mounthua', desc: 'The sect’s entry method: clean, steady, unremarkable.' });
heart('hua_purple_mist', 'Purple Mist Divine Art', { path: 'orthodox', qi: 1.5, cap: 7, tier: 3, rarity: 'rare', sect: 'mounthua', desc: 'Mount Hua’s treasure. Qi rises like dawn mist over the five peaks.' });
art('hua_plum_sword', 'Plum Blossom Sword', { path: 'orthodox', weapon: 'sword', tier: 1, sect: 'mounthua' }, [
  ['Plum Blossom Sword: Falling Petals', 'strike', { pow: 1.15 }], ['Plum Shadow Guard', 'guard'], ['Twenty-Four Plum Blossom Sword', 'heavy', { pow: 2.1 }]]);
art('hua_fragrance_step', 'Dark Fragrance Steps', { path: 'orthodox', weapon: 'step', tier: 2, sect: 'mounthua' }, [['Dark Fragrance Drifting Step', 'step', { pow: 0.75 }], ['Fragrance Hidden in Snow', 'counter']]);

// ── Shaolin ─────────────────────────────────────────────
heart('shao_breath', 'Shaolin Breathing Art', { path: 'orthodox', qi: 1.1, cap: 4, sect: 'shaolin', desc: 'Slow, sure, and very hard to break.' });
heart('shao_tendon', 'Tendon-Changing Classic', { path: 'orthodox', qi: 1.8, cap: 8, tier: 5, rarity: 'legendary', sect: 'shaolin', desc: 'Bodhidharma’s scripture. It rebuilds the meridians themselves.' });
art('shao_arhat', 'Eighteen Arhat Fists', { path: 'orthodox', weapon: 'fist', tier: 1, sect: 'shaolin' }, [['Arhat Fist: Tiger Descends the Mountain', 'strike', { pow: 1.1 }], ['Arhat Fist: Subduing the Dragon', 'heavy'], ['Arhat Stance', 'guard']]);
art('shao_bell', 'Golden Bell Shield', { path: 'external', weapon: 'body', tier: 2, sect: 'shaolin', body: 1.4 }, [['Golden Bell Cover', 'guard', { pow: 0.75 }], ['Bell-Toll Shoulder', 'counter']]);
art('shao_staff', 'Shaolin Staff of Twelve Directions', { path: 'orthodox', weapon: 'staff', tier: 2, sect: 'shaolin' }, [['Staff Sweeps the Thousand Armies', 'strike', { pow: 1.2 }], ['Wall of Staves', 'guard'], ['Vajra Pounds the Mortar', 'heavy']]);
art('shao_tathagata', 'Tathagata Palm', { path: 'orthodox', weapon: 'palm', tier: 5, rarity: 'legendary', sect: 'shaolin' }, [['Tathagata Palm: Buddha Appears', 'heavy', { pow: 2.3 }], ['Tathagata Palm: Ten Thousand Buddhas Bow', 'heavy', { pow: 2.6, cost: 22 }]]);

// ── Wudang ──────────────────────────────────────────────
heart('wu_mind', 'Taiji Heart Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'wudang', desc: 'Breath like a slow river.' });
heart('wu_pure_yang', 'Pure Yang Without Limit', { path: 'orthodox', qi: 1.55, cap: 7, tier: 3, rarity: 'rare', sect: 'wudang', desc: 'Wudang’s great method: warm, endless, patient.' });
art('wu_taiji_fist', 'Taiji Fist', { path: 'orthodox', weapon: 'fist', sect: 'wudang' }, [['Parting the Wild Horse’s Mane', 'strike'], ['Cloud Hands', 'guard', { pow: 0.6 }], ['Single Whip', 'counter']]);
art('wu_taiji_sword', 'Taiji Sword', { path: 'orthodox', weapon: 'sword', tier: 2, sect: 'wudang' }, [['Taiji Sword: Embracing the Moon', 'strike', { pow: 1.15 }], ['Taiji Sword: Yin-Yang Circle', 'counter', { pow: 1.4 }], ['Taiji Sword: Return to the Origin', 'heavy', { pow: 2.1 }]]);
art('wu_ladder', 'Ladder to the Clouds', { path: 'orthodox', weapon: 'step', tier: 3, sect: 'wudang' }, [['Ladder to the Clouds', 'step', { pow: 0.85 }]]);

// ── Emei ────────────────────────────────────────────────
heart('emei_mind', 'Emei Still-Water Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'emei', desc: 'A mind like a mountain lake.' });
heart('emei_buddha_light', 'Buddha’s Light of the Golden Summit', { path: 'orthodox', qi: 1.5, cap: 7, tier: 3, rarity: 'rare', sect: 'emei', desc: 'Emei’s hidden heart method, said to glow like the summit at dawn.' });
art('emei_sword', 'Silent Waters Sword', { path: 'orthodox', weapon: 'sword', tier: 1, sect: 'emei' }, [['Silent Waters: The Lake Does Not Ripple', 'strike', { pow: 1.1 }], ['Moon in the Water', 'counter'], ['Golden Summit Sea of Clouds', 'heavy']]);
art('emei_needles', 'Emei Piercing Needles', { path: 'orthodox', weapon: 'hidden', tier: 2, sect: 'emei' }, [['Needles Like Falling Rain', 'hidden'], ['Thread Through the Eye', 'hidden', { pow: 1.2 }]]);

// ── Kunlun ──────────────────────────────────────────────
heart('kun_mind', 'Kunlun Snow Heart Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'kunlun', desc: 'Cold, clear and thin as mountain air.' });
art('kun_cloud_sword', 'Cloud Dragon Sword', { path: 'orthodox', weapon: 'sword', tier: 2, sect: 'kunlun' }, [['Cloud Dragon Shows Its Claws', 'strike', { pow: 1.2 }], ['Dragon Coils in the Clouds', 'guard'], ['Cloud Dragon Descends', 'heavy']]);
art('kun_cloud_step', 'Cloud Dragon Eight Transformations', { path: 'orthodox', weapon: 'step', tier: 3, sect: 'kunlun' }, [['Cloud Dragon Turns Eight Times', 'step', { pow: 0.95 }], ['Dragon Strikes from Above', 'counter', { pow: 1.4 }]]);
art('kun_snow_palm', 'Kunlun Snow-Burial Palm', { path: 'orthodox', weapon: 'palm', tier: 3, rarity: 'rare', sect: 'kunlun' }, [['Snow Buries the Pass', 'heavy'], ['Frost on the Heart', 'poison', { pow: 0.9 }]]);

// ── Kongtong / Qingcheng / Diancang / Zhongnan ─────────
heart('kong_mind', 'Kongtong Iron Heart Method', { path: 'orthodox', qi: 1.1, cap: 4, sect: 'kongtong' });
art('kong_seven_injuries', 'Seven Injuries Fist', { path: 'orthodox', weapon: 'fist', tier: 2, sect: 'kongtong' }, [['Seven Injuries: Heart', 'heavy', { pow: 2.2, self: 6 }], ['Seven Injuries: Lungs', 'strike', { pow: 1.3, self: 2 }]]);
art('kong_iron_wall', 'Iron Wall of Kongtong', { path: 'external', weapon: 'body', tier: 1, sect: 'kongtong', body: 1.2 }, [['Iron Wall', 'guard', { pow: 0.7 }]]);
heart('qing_mind', 'Qingcheng Green Mist Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'qingcheng' });
art('qing_pine_sword', 'Pine Wind Sword', { path: 'orthodox', weapon: 'sword', tier: 1, sect: 'qingcheng' }, [['Pine Wind Through the Valley', 'strike', { pow: 1.15 }], ['Pines Stand in Snow', 'guard'], ['Ten Thousand Pines Bow', 'heavy']]);
art('qing_rain_needles', 'Green Rain Needles', { path: 'orthodox', weapon: 'hidden', tier: 2, sect: 'qingcheng' }, [['Green Rain', 'hidden', { pow: 1.05 }]]);
heart('dian_mind', 'Diancang Cloud Heart Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'diancang' });
art('dian_swift_sword', 'Diancang Swift Sword', { path: 'orthodox', weapon: 'sword', tier: 2, sect: 'diancang' }, [['Swift Sword: Lightning Without Thunder', 'strike', { pow: 1.3 }], ['Swift Sword: Seventy-Two Flashes', 'heavy', { pow: 1.8, cost: 10 }]]);
art('dian_cloud_step', 'Cloud-Treading Step', { path: 'orthodox', weapon: 'step', tier: 2, sect: 'diancang' }, [['Treading on Clouds', 'step', { pow: 0.8 }]]);
heart('zhong_mind', 'Zhongnan Seven Stars Method', { path: 'orthodox', qi: 1.15, cap: 4, sect: 'zhongnan' });
art('zhong_heaven_gate', 'Heavenly Gate Sword', { path: 'orthodox', weapon: 'sword', tier: 1, sect: 'zhongnan' }, [['Heavenly Gate Opens', 'strike', { pow: 1.1 }], ['Heavenly Gate Closes', 'guard', { pow: 0.6 }], ['The Gate of Heaven Falls', 'heavy']]);
art('zhong_formation', 'Big Dipper Sword Formation', { path: 'orthodox', weapon: 'sword', tier: 2, sect: 'zhongnan' }, [['Seven Stars Encircle', 'counter', { pow: 1.35 }]]);

// ── Beggars’ Sect ───────────────────────────────────────
heart('beg_mind', 'Beggar’s Empty-Bowl Method', { path: 'orthodox', qi: 1.1, cap: 5, sect: 'beggars', desc: 'Hunger sharpens the mind. So they say.' });
art('beg_staff', 'Dog-Beating Staff', { path: 'orthodox', weapon: 'staff', tier: 2, sect: 'beggars' }, [['Beat the Dog’s Head', 'strike', { pow: 1.2 }], ['Tripping the Dog', 'counter'], ['No Dogs Under Heaven', 'heavy']]);
art('beg_drunk_step', 'Drunken Immortal Steps', { path: 'orthodox', weapon: 'step', tier: 2, sect: 'beggars' }, [['Drunken Immortal Staggers', 'step', { pow: 0.8 }]]);
art('beg_dragon_palms', 'Eighteen Dragon-Subduing Palms', { path: 'orthodox', weapon: 'palm', tier: 4, rarity: 'legendary', sect: 'beggars' }, [['Haughty Dragon Repents', 'heavy', { pow: 2.4 }], ['Dragon Wanders in the Field', 'strike', { pow: 1.4 }], ['Flying Dragon in the Sky', 'heavy', { pow: 2.6, cost: 20 }]]);

// ── Five Great Families ────────────────────────────────
heart('nam_mind', 'Emperor Sword Heart Method', { path: 'orthodox', qi: 1.25, cap: 6, sect: 'namgung' });
art('nam_emperor_sword', 'Heavenly Emperor Sword', { path: 'orthodox', weapon: 'sword', tier: 2, sect: 'namgung' }, [['Heavenly Emperor Sword: Thunder Descends', 'heavy', { pow: 2.0 }], ['Azure Sky Sword Wall', 'guard', { pow: 0.65 }], ['Great Sun Slash', 'strike', { pow: 1.25 }]]);
art('nam_heaven_thunder', 'Heavenly Thunder Sword Intent', { path: 'orthodox', weapon: 'sword', tier: 4, rarity: 'rare', sect: 'namgung' }, [['Nine Heavens Thunder', 'heavy', { pow: 2.5, cost: 20 }]]);
heart('moy_mind', 'Moyong Mirror Heart Method', { path: 'orthodox', qi: 1.25, cap: 6, sect: 'moyong' });
art('moy_return_art', 'Return to Sender', { path: 'orthodox', weapon: 'palm', tier: 2, sect: 'moyong' }, [['Return to Sender', 'counter', { pow: 1.6 }], ['Shifting Stars', 'guard', { pow: 0.7 }]]);
art('moy_star_shift', 'Star-Shifting Palm', { path: 'orthodox', weapon: 'palm', tier: 4, rarity: 'rare', sect: 'moyong' }, [['The Stars Change Places', 'counter', { pow: 2.0, cost: 14 }]]);
heart('paeng_mind', 'Tiger’s Breath Method', { path: 'external', qi: 1.1, cap: 5, sect: 'paeng', body: 1.3 });
art('paeng_tiger_saber', 'Five Tigers Severing Saber', { path: 'external', weapon: 'saber', tier: 2, sect: 'paeng' }, [['Tiger Leaps the Ravine', 'strike', { pow: 1.3 }], ['Five Tigers Sever the Gate', 'heavy', { pow: 2.2 }], ['Tiger Guards Its Den', 'guard']]);
heart('dang_mind', 'Dang Clan Hundred-Toxin Method', { path: 'poison', qi: 1.2, cap: 6, sect: 'dang' });
art('dang_needles', 'Ten Thousand Flowers Hidden Weapons', { path: 'poison', weapon: 'hidden', tier: 1, sect: 'dang' }, [['Plum Blossom Darts', 'hidden', { pow: 1.0 }], ['Flying Flower Needles', 'hidden', { pow: 1.2 }], ['Ten Thousand Flowers Bloom', 'heavy', { pow: 1.9 }]]);
art('dang_poison_canon', 'Dang Poison Canon', { path: 'poison', weapon: 'poison', tier: 2, sect: 'dang', craft: true }, [['Scattering Five Venoms', 'poison', { pow: 0.9 }], ['Soul-Seizing Mist', 'poison', { pow: 1.2 }]]);
art('dang_rain_of_flowers', 'Storm of Pear Blossoms', { path: 'poison', weapon: 'hidden', tier: 4, rarity: 'rare', sect: 'dang' }, [['Storm of Pear Blossoms', 'heavy', { pow: 2.5, cost: 18 }]]);
heart('jegal_mind', 'Sleeping Dragon Heart Method', { path: 'orthodox', qi: 1.25, cap: 6, sect: 'jegal', insight: 1.3 });
art('jegal_formations', 'Eight Formations Art', { path: 'orthodox', weapon: 'fan', tier: 2, sect: 'jegal' }, [['Gate of Life', 'guard', { pow: 0.8 }], ['Gate of Death', 'counter', { pow: 1.5 }], ['Stone Sentinel Maze', 'step', { pow: 0.85 }]]);
art('jegal_sleeping_dragon', 'Sleeping Dragon Awakens', { path: 'orthodox', weapon: 'fan', tier: 4, rarity: 'rare', sect: 'jegal' }, [['The Dragon Wakes', 'heavy', { pow: 2.3 }]]);

// ── Unorthodox ──────────────────────────────────────────
heart('uno_mind', 'Black Path Heart Method', { path: 'unorthodox', qi: 1.35, cap: 6, desc: 'Fast and painful. The Black Path does not wait for anyone.' });
art('uno_mountain_axe', 'Mountain-Cleaving Axe', { path: 'unorthodox', weapon: 'axe', tier: 1, sect: 'greenforest' }, [['Split the Mountain', 'heavy', { pow: 2.0 }], ['Axe Wind', 'strike', { pow: 1.2 }]]);
art('uno_ghost_step', 'Ghost Shadow Step', { path: 'unorthodox', weapon: 'step', tier: 2 }, [['Ghost Shadow Step', 'step', { pow: 0.85 }], ['Shadow Behind You', 'counter', { pow: 1.4 }]]);
art('uno_blood_saber', 'Blood Saber Art', { path: 'unorthodox', weapon: 'saber', tier: 3, rarity: 'rare' }, [['Blood Saber: Crimson Crescent', 'strike', { pow: 1.4 }], ['Blood Saber: River of Red', 'heavy', { pow: 2.3 }]]);
art('uno_water_palm', 'Water Ghost Palm', { path: 'unorthodox', weapon: 'palm', tier: 1, sect: 'waterfortress' }, [['Undertow Palm', 'strike', { pow: 1.15 }], ['Drowning Grip', 'poison', { pow: 0.9 }]]);
art('uno_silent_needle', 'Silent Death Needle', { path: 'unorthodox', weapon: 'hidden', tier: 2, sect: 'bloodshadow' }, [['Needle in the Dark', 'hidden', { pow: 1.3 }], ['Hundred-Step Venom', 'poison', { pow: 1.1 }]]);

// ── Demonic Cult ────────────────────────────────────────
heart('cult_mind', 'Demon Mind Method', { path: 'demonic', qi: 1.5, cap: 6, sect: 'cult', desc: 'The first step of the Cult. Qi comes fast and hot.' });
heart('cult_heavenly_demon', 'Heavenly Demon Divine Art', { path: 'demonic', qi: 2.3, cap: 8, tier: 5, rarity: 'legendary', sect: 'cult', desc: 'The Heavenly Demon’s own art. It has never been mastered without madness.' });
art('cult_demon_palm', 'Heavenly Demon Palm', { path: 'demonic', weapon: 'palm', tier: 2, sect: 'cult' }, [['Demon Palm: Black Sun', 'strike', { pow: 1.35 }], ['Demon Palm: Hell Opens', 'heavy', { pow: 2.3 }]]);
art('cult_shadow_step', 'Shadow Demon Step', { path: 'demonic', weapon: 'step', tier: 2, sect: 'cult' }, [['Shadow Demon Step', 'step', { pow: 0.9 }], ['Demon’s Embrace', 'counter', { pow: 1.5 }]]);
art('cult_blood_art', 'Blood Demon Art', { path: 'demonic', weapon: 'palm', tier: 4, rarity: 'rare', sect: 'cult', absorb: true }, [['Blood Demon Drinks', 'poison', { pow: 1.3, drain: true }], ['Sea of Blood', 'heavy', { pow: 2.5, cost: 20 }]]);

// ── Court ───────────────────────────────────────────────
heart('court_mind', 'Imperial Guard Method', { path: 'orthodox', qi: 1.15, cap: 5, sect: 'easterndepot' });
art('court_guard_saber', 'Embroidered Uniform Saber', { path: 'any', weapon: 'saber', tier: 1, sect: 'easterndepot' }, [['Spring Saber', 'strike', { pow: 1.15 }], ['Saber Wall', 'guard']]);
art('court_withered_flower', 'Withered Flower Canon', { path: 'unorthodox', weapon: 'needle', tier: 4, rarity: 'rare', sect: 'easterndepot' }, [['Embroidery Needle Through the Heart', 'hidden', { pow: 1.6 }], ['Flower Withers in Winter', 'heavy', { pow: 2.3 }]]);

// ── External body arts ─────────────────────────────────
art('ext_iron_shirt', 'Iron Shirt', { path: 'external', weapon: 'body', tier: 1, body: 1.3 }, [['Iron Shirt', 'guard', { pow: 0.7 }], ['Iron Shoulder', 'strike', { pow: 1.1 }]]);
art('ext_tiger_bone', 'Tiger Bone Tempering', { path: 'external', weapon: 'fist', tier: 2, body: 1.5 }, [['Tiger Claw', 'strike', { pow: 1.3 }], ['Tiger Roars', 'heavy']]);
art('ext_vajra', 'Vajra Indestructible Body', { path: 'external', weapon: 'body', tier: 4, rarity: 'rare', body: 1.8 }, [['Vajra Body', 'guard', { pow: 0.95 }], ['Vajra Shatters the Mountain', 'heavy', { pow: 2.3 }]]);

// ── Medicine & poison ──────────────────────────────────
heart('med_physician', 'Divine Physician’s Canon', { path: 'poison', qi: 1.2, cap: 7, tier: 2, rarity: 'rare', craft: true, heal: true, desc: 'A healer’s method: qi flows like medicine. Lets you compound elixirs.' });
art('med_five_venoms', 'Five Venoms Palm', { path: 'poison', weapon: 'palm', tier: 2 }, [['Centipede Palm', 'poison', { pow: 1.0 }], ['Five Venoms Seize the Heart', 'poison', { pow: 1.35 }]]);
heart('med_ten_thousand', 'Ten Thousand Poisons Body Art', { path: 'poison', qi: 1.6, cap: 8, tier: 4, rarity: 'legendary', desc: 'Swallow poison until you become it.' });

// ── Lost scriptures (found, never taught) ──────────────
heart('lost_nine_yang', 'Nine Yang Scripture', { path: 'orthodox', qi: 1.7, cap: 8, tier: 3, rarity: 'legendary', cures: 'nine_yin', desc: 'Hidden inside a monkey’s belly, or so the story goes. Its warmth can cure the coldest meridians.' });
heart('lost_heaven_earth', 'Heaven and Earth Harmony Art', { path: 'orthodox', qi: 2.1, cap: 8, tier: 6, rarity: 'legendary', desc: 'Written by no sect. Its first line: "Heaven turns; so must you."' });
heart('lost_star_absorb', 'Star-Absorbing Great Art', { path: 'demonic', qi: 1.9, cap: 8, tier: 4, rarity: 'legendary', absorb: true, desc: 'It drinks other people’s qi like water. Every drop has a cost.' });
art('lost_sword_saint', 'Sword Saint’s Final Testament', { path: 'any', weapon: 'sword', tier: 5, rarity: 'legendary' }, [['A Sword Without Hesitation', 'strike', { pow: 1.6 }], ['The Saint’s Last Stroke', 'heavy', { pow: 2.8, cost: 22 }], ['Intent Before the Blade', 'counter', { pow: 1.8 }]]);
art('lost_formless_sword', 'Formless Sword Intent', { path: 'any', weapon: 'sword', tier: 6, rarity: 'legendary' }, [['Formless Sword', 'heavy', { pow: 3.0, cost: 24 }], ['No Sword in the Hand', 'counter', { pow: 2.0 }]]);
art('lost_reversed_step', 'Reversed Meridian Step', { path: 'any', weapon: 'step', tier: 3, rarity: 'rare' }, [['Reversed Meridian Step', 'step', { pow: 1.0 }]]);

export const HEARTS = Object.values(MANUALS).filter((m) => m.type === 'heart');
export const RARITY_LABEL = { common: 'Common', rare: 'Rare', legendary: 'Legendary' };
export const MASTERY_UNLOCK = [0, 35, 70];
