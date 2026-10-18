// Events the timeline queues when you are present for history (witness events), and the
// Dragon-Phoenix Assembly bracket. "Personal" history (your family, people you can save) is decided here.

export default [
  // ── Year 8: the Yellow River flood ──────────────────────────────────
  {
    id: 'tl_flood_witness', cat: 'timeline', on: 'scheduled', art: 'flood', title: 'The river comes',
    text: 'The rain had not stopped for nine days. Then, in the night, a sound like the sky tearing: the dikes north of Kaifeng broke, and the Yellow River came for the Central Plains.',
    choices: [
      { t: 'Help carry the old and the young to high ground', roll: { stat: 'body', dc: 18 },
        ok: { text: 'You carried children on your back through water to your chest until dawn. Some families will name their sons after you.', fame: 4, rep: { orthodox: 3 }, health: -8 },
        no: { text: 'The current took your feet. Someone hauled you out by your hair. You saved no one, and nearly drowned.', health: -20 } },
      { t: 'Climb the nearest roof and wait', r: { text: 'You clung to a temple roof for two days, watching the drowned float by. You will dream of it.', sanity: -8 } },
      { t: 'Use what you remember: you already moved your family to the hills', show: { mem: 'timeline.yellow_flood' }, r: { text: 'You had dragged your family to your uncle’s farm in the hills a month ago, ranting about dreams. Now nobody calls you mad.', sanity: 5, fame: 2 } },
    ],
  },

  // ── Year 10: Old Man Gu (orphan origin) ────────────────────────────
  {
    id: 'tl_old_gu', cat: 'timeline', on: 'scheduled', art: 'night', title: 'Men in black',
    text: 'Snow on the shrine steps, and footprints that were not there an hour ago. Men in Eastern Depot black stand around Old Man Gu, who is drunk, and smiling, and very afraid.',
    choices: [
      { t: 'Run for the Beggars’ Sect', roll: { stat: 'body', dc: 14 },
        ok: { text: 'You ran through the alleys like a rat through a wall. Beggars came pouring out of the dark with staves. The Depot men left. Old Man Gu lived.', avert: 'old_gu', rel: { oldgu: { aff: 20 } }, rep: { orthodox: 2 } },
        no: { text: 'You were too slow. By the time the beggars came, there was nothing to save.', happen: 'old_gu', sanity: -12 } },
      { t: 'Throw yourself in front of him', r: { text: 'A boot sent you into the snow. When you could stand again, the men were gone, and so was he.', happen: 'old_gu', health: -10, sanity: -10 } },
      { t: 'He told you to hide when they came. You hid him first.', show: { mem: 'timeline.old_gu' }, r: { text: 'You had dug a hole under the shrine floor weeks ago, the way you remembered he should have. The Depot men searched until dawn and found an empty shrine.', avert: 'old_gu', rel: { oldgu: { aff: 30 } }, codex: { id: 'secret.gu_scroll', cat: 'secrets', title: 'Old Man Gu’s secret', text: 'Old Man Gu carries a map, sewn into his coat, to a cave on Mount Song where a Shaolin traitor hid a stolen scripture.' } } },
    ],
  },

  // ── The Dragon-Phoenix Assembly (Years 12, 18, 24, 30, 44) ─────────
  {
    id: 'tl_assembly_12', cat: 'tournament', on: 'scheduled', art: 'tournament', title: 'The Dragon-Phoenix Assembly',
    text: 'Luoyang is full of banners. Young fighters from every sect crowd the arena around a stone platform, and in the place of honour stands a boy in Namgung blue who has not lost a bout all year: Namgung Jin.',
    choices: [
      { t: 'Enter the tournament', req: { realm: '>=1' }, r: { text: 'You signed your name in the register, under a hundred better-known names.', next: 'tourney_r1', meet: '@namgung_jin' } },
      { t: 'Watch from the stands, and learn how he fights', r: { text: 'You watched Namgung Jin dismantle three opponents. He favours his right; he opens with Thunder Descends; he always overcommits on the third exchange. You will remember.', insight: 2, codex: 'foe.namgung_jin', meet: '@namgung_jin' } },
      { t: 'Go home', r: { text: 'You left before the finals. Somebody won. It was not you.' } },
    ],
  },
  {
    id: 'tl_assembly', cat: 'tournament', on: 'scheduled', art: 'tournament', title: 'The Dragon-Phoenix Assembly', if: { age: '<=30' },
    text: 'The Dragon-Phoenix Assembly fills Luoyang with young blades, old grudges and gamblers. Anyone under thirty may enter.',
    choices: [
      { t: 'Enter the tournament', req: { realm: '>=1' }, r: { text: 'You signed the register.', next: 'tourney_r1' } },
      { t: 'Watch, and take notes', r: { text: 'You watched every bout from the cheap seats and filled a notebook with other people’s weaknesses.', insight: 2, codex: 'foe.namgung_jin' } },
      { t: 'Bet on the outcome', req: { stat: { wealth: '>=10' } }, p: 0.45, ok: { text: 'You bet on the underdog and the underdog won. (+40 taels)', wealth: 40 }, no: { text: 'Your fighter lost in the first round. So did your money.', wealth: -10 } },
    ],
  },
  {
    id: 'tourney_r1', cat: 'tournament', on: 'scheduled', title: 'First round',
    text: 'Your first opponent is a disciple of the Qingcheng Sect who bows exactly as deep as courtesy requires and not a hair deeper.',
    choices: [{ t: 'Fight', r: { combat: { foe: { name: 'a Qingcheng disciple', kind: 'disciple', rel: 0 }, context: 'tournament', win: { text: 'The judge raised your arm. One round down.', fame: 3, next: 'tourney_r2' }, lose: { text: 'You were knocked off the platform in the first round. The crowd had already forgotten you by the time you stood up.', fame: -1 } } } }],
  },
  {
    id: 'tourney_r2', cat: 'tournament', on: 'scheduled', title: 'Semifinal',
    text: 'The semifinal. Your opponent is a Paeng son with a saber the size of a door and a grin to match.',
    choices: [{ t: 'Fight', r: { combat: { foe: { name: 'a son of the Paeng family', kind: 'bandit', rel: 0.5 }, context: 'tournament', win: { text: 'He laughed when he lost, and offered to buy you a drink. The final awaits.', fame: 5, next: 'tourney_final' }, lose: { text: 'The Paeng saber came down like weather. Semifinalist: not bad, people said, in the tone that means it was.', fame: 2 } } } }],
  },
  {
    id: 'tourney_final', cat: 'tournament', on: 'scheduled', art: 'tournament', title: 'The final',
    text: 'The final. The arena falls silent as your opponent steps onto the stone, and it is who you expected. Of course it is.',
    choices: [
      { t: 'Fight Namgung Jin', show: { alive: 'namgung_jin', year: '<=28' }, r: { combat: { foe: '@namgung_jin', context: 'tournament', important: true, win: { text: 'Namgung Jin lay on the stone, staring at the sky as if it had insulted him. Then he laughed, for the first time anyone could remember. Champion of the Dragon-Phoenix Assembly: you.', fame: 15, rep: { orthodox: 8, families: 5 }, achieve: 'champion', rel: { '@namgung_jin': { res: 25, role: 'rival' } } }, lose: { text: 'He beat you, cleanly. Afterwards he said, "Again. Next time." It sounded almost like respect.', fame: 6, rel: { '@namgung_jin': { res: 10, role: 'rival' } } } } } },
      { t: 'Fight the champion', show: { or: [{ dead: 'namgung_jin' }, { year: '>28' }] }, r: { combat: { foe: { name: 'the reigning champion', kind: 'disciple', rel: 1 }, context: 'tournament', important: true, win: { text: 'The stone was cold under your knees when you knelt to accept the jade plaque. Champion of the Dragon-Phoenix Assembly.', fame: 15, rep: { orthodox: 8 }, achieve: 'champion' }, lose: { text: 'Second place. Your name will be in the records, in smaller characters.', fame: 6 } } } },
    ],
  },

  // ── Year 15: Willow Creek burns (peasant origin) ───────────────────
  {
    id: 'tl_willow_raid', cat: 'timeline', on: 'scheduled', art: 'fire', title: 'Riders on the north road',
    text: 'Dusk. Dogs barking all at once. Then torches on the north road, a long snake of them, and a man at their head with a red-lacquered blade: the Blood Blade Ghost.',
    choices: [
      { t: 'Stand at the village gate and fight', r: { combat: { foe: '@blood_blade', context: 'ambush', important: true, lethal: 0.5,
        win: { text: 'The Blood Blade Ghost fell in the mud of the north road. Without him, his men ran. Willow Creek stood, and its people looked at you like a stranger.', avert: 'willow_raid', fame: 12, rep: { orthodox: 6 }, codex: 'foe.blood_blade' },
        lose: { text: 'You fell at the gate. When you woke, Willow Creek was ash.', happen: 'willow_raid', sanity: -15 } } } },
      { t: 'Get your family out by the back path', roll: { stat: 'body', dc: 20 },
        ok: { text: 'You dragged your mother, your father and everyone who would follow up the goat path into the hills. Behind you the village burned, but your family watched it from the ridge, alive.', flag: 'family.evacuated', happen: 'willow_raid', sanity: -5 },
        no: { text: 'You got some of them out. Not all.', happen: 'willow_raid', sanity: -12 } },
      { t: 'Hide in the well', r: { text: 'You hid in the well while Willow Creek burned above you. You heard everything.', happen: 'willow_raid', sanity: -20 } },
      { t: 'You remember this. The village is already waiting with bows.', show: { mem: 'timeline.willow_raid', flag: 'willow.prepared' }, r: { text: 'The torches came down the north road into a hail of arrows from the barley field, just as you had drilled them all summer. The Blood Blade Ghost’s band broke and fled.', avert: 'willow_raid', fame: 10, rep: { orthodox: 5 } } },
    ],
  },

  // ── Year 17: the merchant family’s ruin ────────────────────────────
  {
    id: 'tl_merchant_ruin', cat: 'timeline', on: 'scheduled', art: 'city', title: 'The debt collectors',
    text: 'Men from the Golden Abacus Guild arrive at dawn with a ledger, a magistrate’s seal, and a smile. Every debt your father owes has been bought up and called in, all on one day.',
    choices: [
      { t: 'Pay it (300 taels)', req: { stat: { wealth: '>=300' } }, r: { text: 'You counted out three hundred taels on the counter, one ingot at a time. The Guild men stopped smiling around the second hundred.', wealth: -300, avert: 'merchant_ruin', rel: { father: { aff: 20 } } } },
      { t: 'Petition the magistrate', roll: { stat: 'charm', dc: 30 },
        ok: { text: 'You argued for an hour that debts bought in secret were bought in bad faith. The magistrate, who disliked Geum Man-bok, agreed.', avert: 'merchant_ruin', fame: 3 },
        no: { text: 'The magistrate had already been paid. The silk shop was sold by spring.', happen: 'merchant_ruin' } },
      { t: 'Accept it', r: { text: 'The silk shop was sold by spring. Your family moved to two rooms by the canal.', happen: 'merchant_ruin', wealth: -20 } },
      { t: 'You saw this coming. The debts were never in your father’s name.', show: { mem: 'timeline.merchant_ruin' }, r: { text: 'A year ago, remembering, you had quietly moved the shop into your mother’s family’s name. The Guild’s ledger was worthless. Geum Man-bok sent you a bottle of wine, with respect.', avert: 'merchant_ruin', rel: { '@merchant_king': { res: 20 } } } },
    ],
  },

  // ── Year 19: plague in Shu ─────────────────────────────────────────
  {
    id: 'tl_plague', cat: 'timeline', on: 'scheduled', art: 'plague', title: 'Plague',
    text: 'Chengdu’s gates are shut. Inside, carts collect the dead at dawn, and the physicians wear masks soaked in vinegar.',
    choices: [
      { t: 'Help the physicians', roll: { stat: 'insight', dc: 30 },
        ok: { text: 'You boiled water, buried the dead, and learned more medicine in a season than most learn in a lifetime.', insight: 4, fame: 4, codex: { id: 'secret.plague_cure', cat: 'recipes', title: 'The cure for the Shu plague', text: 'Willow bark, coptis root, and boiling every drop of water from the river by the tanneries. It works if started before summer.' } },
        no: { text: 'You caught it. For two weeks you burned with fever, and then, somehow, you did not die.', health: -40 } },
      { t: 'Leave before the gates close completely', r: { text: 'You slipped out with a merchant caravan. Behind you, Chengdu burned its dead.', travel: 'emei' } },
      { t: 'Brew the cure you remember', show: { mem: 'secret.plague_cure' }, r: { text: 'You knew the cure. You brewed it in temple cauldrons for a month. Thousands lived who would have died. Chengdu will name a street after you.', fame: 25, rep: { orthodox: 10, merchants: 5 }, achieve: 'plague_cure', flag: 'plague.cured' } },
    ],
  },

  // ── Year 21: your father framed (official origin) ─────────────────
  {
    id: 'tl_father_framed', cat: 'timeline', on: 'scheduled', art: 'palace', title: 'Black boots at the gate',
    text: 'Eastern Depot agents are at the gate with forged letters "proving" your father conspired with the Cult. Your father, very pale, is putting on his official hat, as if that will help.',
    choices: [
      { t: 'Hide him and get him out of the city', roll: { stat: 'insight', dc: 32 },
        ok: { text: 'You smuggled your father out in a night-soil cart. He will hate you forever for the smell, and live to do it.', avert: 'father_framed', rel: { father: { aff: 25 } }, rep: { court: -10 } },
        no: { text: 'They found him at the river gate.', happen: 'father_framed', sanity: -15 } },
      { t: 'Fight them', r: { combat: { foe: { name: 'an Eastern Depot officer', kind: 'soldier', rel: 0.5 }, context: 'ambush', lethal: 0.4, win: { text: 'The officer fell. Your father escaped in the confusion. You are both outlaws now.', avert: 'father_framed', infamy: 10, rep: { court: -30 } }, lose: { text: 'They took you both. Only your father was executed; they let you live, to make a point.', happen: 'father_framed', sanity: -15 } } } },
      { t: 'Do nothing', r: { text: 'They took him. Three days later, they took his head.', happen: 'father_framed', sanity: -20 } },
      { t: 'Expose the forger, Clerk Mun, whose name you remember', show: { mem: 'timeline.father_framed' }, roll: { stat: 'charm', dc: 25 },
        ok: { text: 'You dragged Clerk Mun before Commander Han Gyeong, with the forger’s own practice sheets. The Depot let your father go, and remembered your face.', avert: 'father_framed', rep: { court: 5 }, rel: { '@guard_commander': { res: 20 } } },
        no: { text: 'Clerk Mun was found in the canal before you could bring him to anyone. They took your father anyway.', happen: 'father_framed', sanity: -15 } },
    ],
  },

  // ── Year 23: the Namgung assassination ─────────────────────────────
  {
    id: 'tl_namgung_assassination', cat: 'timeline', on: 'scheduled', art: 'night', title: 'A shadow on the roof',
    text: 'Midnight at the Namgung Estate. Snow, silence, and a shadow moving across the roof of the patriarch’s study where no shadow should be.',
    choices: [
      { t: 'Intercept the assassin', r: { combat: { foe: { name: 'a Blood Shadow assassin', kind: 'assassin', realm: 4 }, context: 'assassination', lethal: 0.5, important: true,
        win: { text: 'The assassin fell from the roof into the snow. Namgung Hwi came out of his study, sword in hand, and looked at you for a long time.', avert: 'namgung_assassination', fame: 10, rep: { families: 15 }, rel: { '@namgung_hwi': { res: 30, aff: 15 } } },
        lose: { text: 'The assassin went through you like water through a crack. By the time the guards came, the patriarch was dead.', happen: 'namgung_assassination' } } } },
      { t: 'Shout for the guards', roll: { stat: 'charm', dc: 28 },
        ok: { text: 'You shouted until the whole estate woke. The shadow vanished. Namgung Hwi lived.', avert: 'namgung_assassination', rep: { families: 8 } },
        no: { text: 'The guards thought you were a drunk. By the time they understood, it was over.', happen: 'namgung_assassination' } },
      { t: 'Keep out of it', r: { text: 'You kept to your room. In the morning, the wailing started.', happen: 'namgung_assassination' } },
    ],
  },

  // ── Year 26: the Dang civil war ────────────────────────────────────
  {
    id: 'tl_dang_war', cat: 'timeline', on: 'scheduled', art: 'estate', title: 'The matriarch’s tea',
    text: 'A family dinner at the Dang manor. The second son, Dang Gwang, pours tea for his mother himself, which he has never done before.',
    choices: [
      { t: 'Knock the cup from her hand', show: { mem: 'timeline.dang_civil_war' }, r: { text: 'The cup shattered and the tea hissed on the stone floor. Everyone looked at Dang Gwang. Dang Ok-ran looked at you, and nodded once.', avert: 'dang_civil_war', rep: { families: 10 }, rel: { '@dang_okran': { res: 30, aff: 20 } } } },
      { t: 'Say nothing', r: { text: 'She drank. By morning the Dang family was at war with itself.', happen: 'dang_civil_war' } },
      { t: 'Ask, loudly, why the second son is so eager to pour', roll: { stat: 'charm', dc: 30 },
        ok: { text: 'Silence. Then the matriarch slid her cup across the table to her son. "You drink it." He went white.', avert: 'dang_civil_war', rep: { families: 6 } },
        no: { text: 'They laughed at the rude guest. She drank.', happen: 'dang_civil_war' } },
    ],
  },

  // ── Year 29: the Cult coup ─────────────────────────────────────────
  {
    id: 'tl_cult_coup', cat: 'timeline', on: 'scheduled', art: 'demonic', title: 'The Hall of Ten Thousand Demons',
    text: 'Blood Faction warriors fill the Hall of Ten Thousand Demons. At its heart, alone, the Young Heavenly Demon Dan Ha-ryeong draws her sword and laughs at them.',
    choices: [
      { t: 'Fight at her side', r: { combat: { foe: { name: 'a Blood Faction commander', kind: 'cultist', realm: 5 }, context: 'war', lethal: 0.5, important: true,
        win: { text: 'Back to back, you and Dan Ha-ryeong held the hall until her loyalists broke through. The coup failed. She looked at you, bloody and smiling. "I will remember this."', avert: 'cult_coup', rep: { cult: 25 }, rel: { '@haryeong': { aff: 30, res: 30 } }, fame: 10 },
        lose: { text: 'You fell. When you woke, in a cell, the Blood Demon ruled the Cult, and she was dead.', happen: 'cult_coup' } } } },
      { t: 'Side with the Blood Faction', r: { text: 'You chose the winning side. The Blood Demon remembers his friends, for now.', happen: 'cult_coup', rep: { cult: 10 }, infamy: 10, sanity: -10 } },
      { t: 'Slip away', r: { text: 'You slipped out of the Ten Thousand Mountains in the chaos.', happen: 'cult_coup', travel: 'jadegate' } },
    ],
  },

  // ── Year 34: the Blood Night of Mount Hua ──────────────────────────
  {
    id: 'tl_blood_night', cat: 'war', on: 'scheduled', art: 'fire', title: 'The Blood Night',
    text: 'The bells of Mount Hua ring all at once, then stop. On the Plum Blossom Path, torches. The Cult is already inside the walls.',
    choices: [
      { t: 'Hold the main hall steps', r: { combat: { foe: { name: 'a Cult vanguard captain', kind: 'cultist', rel: 0.5 }, context: 'war', lethal: 0.6, important: true,
        win: { text: 'You held the steps until the juniors were through the back gate. Mount Hua fell anyway, but not all of it.', fame: 10, flag: 'hua.juniors_saved', rel: { '@hua_harin': { aff: 25 } } },
        lose: { text: 'You fell on the third step of the main hall.', deathText: 'You fell on the third step of the main hall, a spear through the chest. The bells had stopped ringing.' } } } },
      { t: 'Find Yu Jin, the kid who never runs', show: { alive: 'yujin' }, r: { text: 'You found Yu Jin with his back to the woodshed and a girl beside him, sword drawn, who looked at you as if she had seen a ghost. "You," Yu Seol-hwa whispered. "You were not here last time." Together you got him out.', flag: ['seol.saved', 'yujin.saved'], rival: 2, meet: ['@seol', '@yujin'], rel: { '@seol': { aff: 15, res: 20 } }, achieve: 'met_seol' } },
      { t: 'Run', r: { text: 'You ran down the mountain in the dark while it burned behind you.', sanity: -20, infamy: 3 } },
    ],
  },

  // ── War battles (Mount Song, Namgung, Yellow River Ford) ──────────
  {
    id: 'tl_war_battle', cat: 'war', on: 'scheduled', once: false, cd: 1, art: 'war', title: 'Battle',
    text: 'The battle reaches you whether you want it or not: drums, smoke, red banners, and men screaming in a dozen dialects.',
    choices: [
      { t: 'Fight', r: { combat: { foe: { name: 'a Cult warrior', kind: 'cultist', rel: 0 }, context: 'war', win: { text: 'You held your ground. Afterwards, nobody remembered your name, only that the line held where you stood.', fame: 5, rep: { orthodox: 5 } }, lose: { text: 'You were carried off the field on a door.' } } } },
      { t: 'Tend the wounded', roll: { stat: 'insight', dc: 22 }, ok: { text: 'You sewed wounds until your hands stopped shaking, then kept going.', fame: 3, insight: 1 }, no: { text: 'You did what you could. It was not enough, and it never would be.', sanity: -8 } },
      { t: 'Flee', r: { text: 'You fled the battle. No one would blame you aloud.', fame: -3 } },
    ],
  },
];
