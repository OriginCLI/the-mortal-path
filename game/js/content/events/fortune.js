// Fortuitous encounters (기연): hidden masters, lost scriptures, treasures and sudden enlightenment.
// Most legendary finds have a first, dangerous discovery and a later-life shortcut through memory.
import { E, O, C, R, P, M, Q, L, LATER } from './kit.js';

const SAINT_HERE = { fn: (g) => !g.life.npcs.sword_saint?.dead && g.life.npcs.sword_saint?.loc === g.life.loc };

export default [
  // ── The Drunken Sword Saint ─────────────────────────────────────
  E('fo_saint_meet', 'fortune', { if: { age: [10, 60], ...SAINT_HERE, notMet: 'sword_saint' }, art: 'inn', title: 'A drunk in the gutter', text: 'A filthy old man is asleep in the gutter outside the wine-house, hugging an empty jar. His sword is wrapped in rags. People step over him.', choices: [
    C('Help him up and buy him a jar', O('He drank half the jar in one breath, looked at you with surprisingly clear eyes, and said, "You stand like someone who has been taught badly." Then he fell asleep on your shoulder.', { meet: '@sword_saint', wealth: -2, rel: { '@sword_saint': { aff: 15 } } })),
    C('Step over him like everyone else', O('You stepped over him. Behind you, someone laughed, softly, and it was not a drunk’s laugh.')),
    M('Bring him a jar of Fenzhou plum wine, his favourite', 'people.sword_saint', O('He sniffed the jar before he opened his eyes. "Fenzhou," he said. "Nobody knows that." He looked at you for a long, long time. "Who are you?"', { meet: '@sword_saint', rel: { '@sword_saint': { aff: 35, res: 15 } } })),
  ] }),
  E('fo_saint_test', 'fortune', { if: { age: [12, 60], ...SAINT_HERE, met: 'sword_saint', npc: { '@sword_saint': { aff: '>=30' } } }, art: 'duel', title: 'The drunk’s sword', text: 'The old drunk unwraps the rags from his sword. The blade is plain, and it hums. "Attack me," he says. "Seriously. I am curious."', choices: [
    C('Attack with everything you have', O('You attacked with everything. He did not draw. He did not need to. When you could breathe again he was smiling. "Again tomorrow."', { rel: { '@sword_saint': { res: 20 } }, insight: 3, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 10); } })),
    C('Refuse to attack a drunk', O('"Good manners," he said. "Bad answer." He went back to sleep.', { rel: { '@sword_saint': { aff: 5 } } })),
  ] }),
  E('fo_saint_disciple', 'fortune', { if: { age: [12, 70], ...SAINT_HERE, npc: { '@sword_saint': { aff: '>=60', res: '>=40' } }, not: 'saint.disciple' }, art: 'moon', title: 'The Sword Saint', text: 'Under a full moon the old drunk stands up straight for the first time since you have known him. He is not drunk at all. "I am Dokgo Ung," he says. "They used to call me the Sword Saint. I have one technique left that I have never taught. I am dying, a little faster every year. Kneel."', choices: [
    C('Kneel', O('You knelt. He taught you for a year, sober every morning and drunk every night, and on the last day he gave you his testament: the Sword Saint’s Final Testament.', { manual: 'lost_sword_saint', flag: 'saint.disciple', achieve: ['saint_disciple', 'master_found'], role: { '@sword_saint': 'master' }, fame: 5 })),
    C('Refuse; you already have a master', O('He laughed until he coughed blood. "Loyal. Stupid. Good." He gave you a jar of wine and was gone by morning.', { rel: { '@sword_saint': { res: 15 } } })),
  ] }),
  E('fo_saint_death', 'fortune', { if: { flag: 'saint.disciple', year: [50, 60], fn: (g) => g.life.npcs.sword_saint?.role === 'master' && !g.life.npcs.sword_saint.dead }, title: 'The last lesson', art: 'snow', text: 'Your master Dokgo Ung asks you to carry him up to the snow line. "I want to see what the sword sees," he says, "one last time."', choices: [C('Carry him', O('At the snow line he drew his sword and made one cut in the air. Nothing happened. Then the snow on the whole slope slid away in a perfect line. "That," he said, "is the Formless Sword." He died smiling.', { manual: 'lost_formless_sword', kill: '@sword_saint', sanity: -6, fame: 5 }))] }),

  // ── The Sweeping Monk ───────────────────────────────────────────
  E('fo_sweeper_test', 'fortune', { if: { loc: 'songshan', age: [14, 80], met: 'sweeping_monk', npc: { '@sweeping_monk': { aff: '>=25' } }, not: 'sweeper.taught' }, art: 'temple', text: 'The old sweeping monk hands you his broom. "The Scripture Pavilion has seven thousand stones," he says. "Sweep each one without raising dust."', choices: [
    R('Sweep for a year', 'sanity', 60, O('You swept for a year. On the last day, not a grain of dust rose. The monk took his broom back and pressed two fingers to your dantian. Your qi doubled. "Now go and do something useful," he said.', { qiFill: 60, insight: 5, flag: 'sweeper.taught', rel: { '@sweeping_monk': { aff: 20, res: 20 } } }), O('After a month, dust rose. The monk took his broom back, gently. "Not yet."', { insight: 1 })),
  ] }),
  E('fo_sweeper_tendon', 'fortune', { if: { loc: 'songshan', flag: 'sweeper.taught', realm: '>=4', noManual: 'shao_tendon', stat: { infamy: '<20' } }, art: 'library', text: 'The sweeping monk leads you up a stair in the Scripture Pavilion that you are certain was not there before. At the top, a single scroll on a single table.', choices: [C('Read it', O('It is the Tendon-Changing Classic in Bodhidharma’s own words. When you look up, the monk is gone, and the stair is a wall again.', { manual: 'shao_tendon', fame: 5 }))] }),

  // ── Yak Seon, the Medicine Immortal ─────────────────────────────
  E('fo_yak_deer', 'fortune', { if: { region: 'shu', age: [10, 80], notMet: 'yakseon' }, art: 'forest', text: 'A white deer watches you from the edge of the bamboo forest below Mount Emei. When you take a step toward it, it takes a step away, and waits.', choices: [
    C('Follow the deer', O('You followed it for a day and a night, into a valley that is not on any map. At its heart, an old woman is drying herbs on a rack. "Ah," she says. "The deer brought me another one."', { meet: '@yakseon', codex: { id: 'secret.yak_valley', cat: 'secrets', title: 'The Medicine Immortal’s valley', text: 'Follow the white deer from the bamboo forest below Mount Emei. Yak Seon, the Medicine Immortal, lives in the valley at the end.' }, rel: { '@yakseon': { aff: 10 } } })),
    C('Leave it be', O('You left it be. The deer looked almost disappointed.')),
  ] }),
  E('fo_yak_valley_mem', 'fortune', { if: { region: 'shu', age: [10, 80], notMet: 'yakseon', mem: 'secret.yak_valley' }, text: 'You remember the way to the Medicine Immortal’s valley.', choices: [C('Go straight there', O('You walked into her valley without the deer. She looked up from her herbs, startled for the first time in decades. "Nobody finds this place alone," she said. "Sit. Tell me how."', { meet: '@yakseon', rel: { '@yakseon': { aff: 25, res: 15 } } }))] }),
  E('fo_yak_apprentice', 'fortune', { if: { met: 'yakseon', npc: { '@yakseon': { aff: '>=30' } }, noManual: 'med_physician', age: [12, 90] }, art: 'garden', text: 'Yak Seon hands you a basket. "If you are going to keep visiting, make yourself useful. Gather what I tell you, and if you poison yourself, that is a lesson too."', choices: [
    C('Become her apprentice', O('You gathered, boiled, failed, and gathered again for two years. Then she gave you the Divine Physician’s Canon. "Don’t kill anyone with it," she said. "Not by accident."', { manual: 'med_physician', recipe: ['qi_pill', 'healing_salve', 'heart_calming'], insight: 4, role: { '@yakseon': 'master' } })),
    C('Just visit', O('You visited and drank her terrible tea. She told you which mushrooms are deadly, which is most of them.', { insight: 2, recipe: 'healing_salve' })),
  ] }),
  E('fo_yak_cure', 'fortune', { if: { met: 'yakseon', npc: { '@yakseon': { aff: '>=40' } }, or: [{ crippled: true }, { constitution: 'nine_yin' }] }, title: 'The Medicine Immortal’s needles', text: 'Yak Seon takes your wrist and frowns. "Your meridians are a disgrace," she says. "Lie down. This will hurt more than anything you can imagine."', choices: [
    R('Lie down', 'health', 35, O('It hurt more than anything you could imagine. When it was over, qi moved through every meridian like spring water.', { cure: ['crippled', 'nine_yin'], recipe: 'yang_cure', health: -20, sanity: -5 }), O('Halfway through, your heart stopped. She started it again with a slap. "Too weak. Come back stronger."', { health: -30 })),
  ] }),

  // ── The Old Fisherman of Dongting ───────────────────────────────
  E('fo_fisherman', 'fortune', { if: { loc: 'dongting', age: [14, 90] }, art: 'lake', text: 'An old man fishes from the reeds with no bait on his hook. He has been there all day. He has caught eleven fish.', choices: [
    C('Sit beside him and fish', O('You fished beside him until dark and caught nothing. He gave you three of his fish. "You were trying," he said. "Fish can tell."', { meet: '@fisherman', insight: 2, rel: { '@fisherman': { aff: 15 } } })),
    C('Ask how he does it', O('"I don’t," he said. "The lake does." It sounded like nonsense. It stayed with you anyway.', { meet: '@fisherman', insight: 1 })),
  ] }),
  E('fo_fisherman_lesson', 'fortune', { if: { loc: 'dongting', met: 'fisherman', npc: { '@fisherman': { aff: '>=30' } }, realm: '>=5', noManual: 'lost_formless_sword' }, art: 'lake', text: 'The old fisherman puts down his rod. "You are strong now," he says. "Strong enough to be stupid. Watch." He lifts his empty hand, and the lake parts in a line from shore to horizon.', choices: [C('Watch', O('You watched until the water closed again. Then you understood: the sword was never in his hand.', { manual: 'lost_formless_sword', insight: 5, rel: { '@fisherman': { res: 30 } } }))] }),

  // ── The Nine Yang Scripture (cure for the Nine Yin cold) ───────
  E('fo_cliff_fall', 'fortune', { if: { region: ['west', 'guanzhong'], age: [12, 60], chance: 0.15 }, art: 'mountain', danger: true, title: 'The Cliff of Sighs', text: 'On a mountain path above a sea of cloud, the edge crumbles under your feet.', choices: [
    R('Grab for the roots', 'body', 25, O('You caught a root and hung there for an hour, then climbed back up shaking. Below you, through a gap in the cloud, you glimpsed a green valley where no valley should be.', { flag: 'fo.saw_valley', codex: { id: 'secret.ape_valley', cat: 'secrets', title: 'The valley below the Cliff of Sighs', text: 'Below the Cliff of Sighs on the road to Kunlun lies a hidden valley. A white ape lives there with something in its belly.' } }), O('You fell. Through cloud, through branches, into snow.', { health: -40, next: 'fo_ape_valley' })),
  ] }),
  E('fo_ape_valley', 'fortune', { on: 'scheduled', art: 'forest', title: 'The hidden valley', text: 'You wake in a hidden valley full of fruit trees. A white ape sits watching you, holding its stomach, in obvious pain. There is a hard lump under its belly fur.', choices: [
    C('Help the ape', O('You cut the lump free with your knife while the ape trembled and trusted you. Inside, wrapped in oiled silk: the Nine Yang Scripture.', { manual: 'lost_nine_yang', codex: { id: 'secret.ape_valley', cat: 'secrets', title: 'The valley below the Cliff of Sighs', text: 'Below the Cliff of Sighs on the road to Kunlun lies a hidden valley. A white ape lives there with something in its belly.' } })),
    C('Find a way out', O('You climbed out of the valley over three days, eating fruit. You never saw the ape again.', { health: 10 })),
  ] }),
  E('fo_ape_mem', 'fortune', { if: { region: ['west', 'guanzhong'], age: [10, 80], mem: 'secret.ape_valley', noManual: 'lost_nine_yang' }, text: 'You remember the hidden valley below the Cliff of Sighs, and what the white ape carries.', choices: [
    C('Climb down with a rope', O('You climbed down with a rope and a knife and a bag of peaches. The ape remembered nothing, and trusted you anyway.', { manual: 'lost_nine_yang' })),
    C('Not now', O('Not now. The valley will keep.')),
  ] }),

  // ── The Tendon-Changing Classic, stolen ─────────────────────────
  E('fo_gu_map', 'fortune', { if: { mem: 'secret.gu_scroll', noManual: 'shao_tendon', loc: 'songshan', age: [12, 80] }, art: 'cave', text: 'You remember Old Man Gu’s map: a cave behind a waterfall on the western slope of Mount Song, where a traitor monk hid a stolen scripture a century ago.', choices: [
    C('Find the cave', O('Behind the waterfall, a skeleton in monk’s robes still clutches an iron box. Inside: the Tendon-Changing Classic.', { flag: 'fo.has_tendon_box', next: 'fo_tendon_choice' })),
  ] }),
  E('fo_tendon_choice', 'fortune', { on: 'scheduled', art: 'library', title: 'Bodhidharma’s scripture', text: 'You hold the Tendon-Changing Classic, Shaolin’s greatest treasure, lost for a hundred years.', choices: [
    C('Return it to Shaolin', O('You laid the iron box before the Abbot. The whole temple knelt. In gratitude they taught you from it themselves, and gave you a Small Reincarnation Pill.', { manual: 'shao_tendon', item: { reincarnation_pill: 1 }, rep: { orthodox: 30 }, fame: 20 })),
    C('Keep it', O('You kept it. Shaolin will never know. You will.', { manual: 'shao_tendon', sanity: -5, infamy: 3 })),
  ] }),

  // ── The Star-Absorbing Great Art ────────────────────────────────
  E('fo_west_lake_prison', 'fortune', { if: { loc: 'hangzhou', age: [16, 80], realm: '>=3', chance: 0.5 }, art: 'prison', danger: true, title: 'Under West Lake', text: 'Rumours say a madman is imprisoned in an iron cell beneath a manor on West Lake, a master so dangerous his enemies could not kill him, only bury him.', choices: [
    R('Break in at night', 'power', 60, O('Under the manor, in the dark, a voice laughed. "Free me, and I will teach you to drink the stars." You freed him. He kept his word. He also drank the guards.', { manual: 'lost_star_absorb', infamy: 15, codex: { id: 'secret.star_prisoner', cat: 'secrets', title: 'The prisoner under West Lake', text: 'Beneath a manor on West Lake, an iron cell holds the master of the Star-Absorbing Great Art. His jailers drink in the pavilion every Mid-Autumn night.' } }), O('The manor’s guards were no rumour. You barely escaped.', { health: -25 })),
    C('Leave rumours alone', O('Some doors should stay shut.')),
  ] }),
  E('fo_star_mem', 'fortune', { if: { loc: 'hangzhou', mem: 'secret.star_prisoner', noManual: 'lost_star_absorb', age: [16, 80] }, text: 'You remember the iron cell under West Lake, and that the guards drink in the pavilion every Mid-Autumn night.', choices: [
    C('Go on Mid-Autumn night', O('You walked past the drunken guards and down into the dark. The prisoner taught you, and you locked the door behind you when you left.', { manual: 'lost_star_absorb', infamy: 5, sanity: -5 })),
    C('Leave him buried', O('You left him where he is. The world is better for it.', { sanity: 2 })),
  ] }),

  // ── The Heaven and Earth Harmony Art (the Kunlun ice tomb) ────
  E('fo_ice_tomb', 'fortune', { if: { loc: 'kunlun', realm: '>=5', mem: 'timeline.kunlun_tomb', noManual: 'lost_heaven_earth', year: [30, 300] }, art: 'snow', title: 'The tomb in the ice', text: 'You remember where the glacier will crack, a century from now, and what lies beneath it. You do not have to wait a century.', choices: [
    R('Cut down through the ice', 'power', 150, O('It took a month of cutting through ice harder than stone. At the bottom, in a chamber of blue light, a seated skeleton held a scroll on its knees. The first line read: "Heaven turns; so must you."', { manual: 'lost_heaven_earth', fame: 10, gaze: 2 }), O('The ice was older and harder than any sword you own. You will need to be stronger.', { body: 1 })),
  ] }),
  E('fo_ice_tomb_open', 'fortune', { if: { loc: 'kunlun', year: [120, 300], noManual: 'lost_heaven_earth', realm: '>=3' }, art: 'snow', title: 'The opened tomb', text: 'The glacier has cracked as the stories said. The Kunlun Sect guards the tomb’s entrance, but the guards are young and cold.', choices: [
    R('Slip past them', 'power', 90, O('You slipped past the guards and down into blue light. On the knees of a seated skeleton: the Heaven and Earth Harmony Art.', { manual: 'lost_heaven_earth', rep: { orthodox: -10 } }), O('The guards caught you. Kunlun’s anger is long.', { rep: { orthodox: -15 } })),
    C('Ask Kunlun for permission', O('They refused, of course.', { rep: { orthodox: 1 } })),
  ] }),

  // ── Other treasures ─────────────────────────────────────────────
  E('fo_autumn_water', 'fortune', { if: { loc: 'dongting', age: [14, 80], noItem: 'famous_sword', chance: 0.6 }, art: 'lake', text: 'Fishermen say a merchant ship sank here a century ago, carrying a famous sword to the Emperor. On still days, they say, you can see it shining under the water.', choices: [
    R('Dive for it', 'body', 35, O('You dove until your lungs burned, and on the ninth dive your hand closed on a hilt. Autumn Water: it cut the reeds as you surfaced.', { item: { famous_sword: 1 }, codex: { id: 'secret.autumn_water', cat: 'secrets', title: 'Autumn Water', text: 'The famous sword Autumn Water lies in the wreck east of the third island in Lake Dongting, nine fathoms down.' } }), O('You dove all day and came up with an old boot.', { health: -5 })),
    M('Dive at the third island; you know exactly where', 'secret.autumn_water', O('You went straight to the wreck. Nine fathoms. Autumn Water was waiting.', { item: { famous_sword: 1 } })),
  ] }),
  E('fo_ginseng', 'fortune', { if: { locType: ['wild', 'sect'], region: ['hebei', 'liaodong', 'jingchu'], age: [12, 80], chance: 0.4 }, art: 'forest', text: 'Deep in the forest, a red-berried plant grows from a crack in a boulder, alone, as if the forest is afraid of it.', choices: [
    R('Dig it up carefully', 'insight', 25, O('It took all day to dig without breaking a single root: a Thousand-Year Spirit Ginseng, shaped like a little man.', { item: { spirit_ginseng: 1 } }), O('You broke the root. What was left was still worth a fortune to the right buyer.', { wealth: 40 })),
    C('Eat it on the spot', O('It tasted like dirt and lightning. Your qi surged so hard you saw stars for a week.', { qiFill: 50, health: 15 })),
  ] }),
  E('fo_serpent', 'fortune', { if: { region: ['shu', 'jingchu'], age: [14, 80], realm: '>=2', chance: 0.4 }, art: 'cave', danger: true, text: 'In a cave behind a waterfall coils a golden serpent as thick as your waist. It has been here longer than most dynasties.', choices: [
    C('Fight it', O('It raised its head.', { combat: { foe: { name: 'the Golden Serpent', kind: 'beast', rel: 1 }, context: 'beast', win: { text: 'You took its gall, still warm and bitter, and drank half on the spot.', item: { serpent_gall: 1 }, qiFill: 30, fame: 4 }, lose: { text: 'You escaped with venom in your arm and your pride in pieces.' } } })),
    C('Back away slowly', O('You backed away very slowly. It watched you go, as if amused.')),
  ] }),
  E('fo_fire_fruit', 'fortune', { if: { loc: ['diancang', 'mounthua', 'kongtong'], age: [12, 80], chance: 0.4 }, art: 'mountain', text: 'On a cliff face that steams in the cold, a red fruit hangs from a twisted tree: a Vermilion Fire Fruit.', choices: [
    R('Climb for it', 'body', 30, O('You climbed, burned your hands on the rock, and picked it. It is warm, like holding a coal.', { item: { red_fruit: 1 } }), O('You fell ten feet onto a ledge. The fruit stayed where it was.', { health: -15 })),
  ] }),
  E('fo_dying_master', 'fortune', { if: { age: [12, 70], locType: ['wild', 'frontier', 'sect'], chance: 0.5 }, bind: { x: { age: [60, 90], realm: [3, 6], role: 'acquaintance' } }, art: 'mountain', title: 'An old man in the snow', text: 'You find an old martial artist dying in the snow, a sword wound in his side. "No one," he whispers, "no one to pass it to."', choices: [
    C('Stay with him', O('You stayed. Before dawn he pressed his remaining qi into your dantian through his palm, and a battered manual into your hands. Then he was gone.', { qiFill: 40, kill: 'x', fn: (g) => { const pool = ['uno_ghost_step', 'ext_tiger_bone', 'kun_cloud_sword', 'qing_pine_sword', 'dian_swift_sword', 'escort_spear']; const m = g.rng.pick(pool.filter((x) => !(x in g.life.manuals))) ; if (m) g.learnManual(m); } })),
    C('Take his sword and go', O('You took his sword and left him. He said nothing. That was worse than a curse.', { item: { fine_sword: 1 }, sanity: -6, infamy: 2 })),
  ] }),
  E('fo_skeleton_cave', 'fortune', { if: { age: [10, 70], locType: ['wild', 'sect'], chance: 0.5 }, art: 'cave', text: 'Sheltering from rain in a cave, you find a skeleton seated against the wall, and words carved into the rock beside it: "To whoever finds me, I leave my art. Kowtow a thousand times."', choices: [
    C('Kowtow a thousand times', O('You kowtowed a thousand times. On the last one, the stone under your forehead shifted. Beneath it, a manual.', { fn: (g) => { const pool = ['hua_fragrance_step', 'wu_taiji_fist', 'uno_blood_saber', 'beg_drunk_step', 'kun_cloud_step', 'med_five_venoms']; const m = g.rng.pick(pool.filter((x) => !(x in g.life.manuals))); if (m) g.learnManual(m); }, body: 1 })),
    C('Search the cave', O('You searched and found nothing. Kowtowing, apparently, was the point.')),
    C('Bury the skeleton', O('You buried them properly. That night you dreamed of a woman in white who taught you to breathe in a new way.', { qi: 15, insight: 2 })),
  ] }),
  E('fo_enlightenment_waterfall', 'fortune', { if: { age: [14, 200], realm: '>=1', chance: 0.6 }, once: false, cd: 15, art: 'mountain', text: 'You sit beneath a waterfall to train. After an hour you stop feeling the water. After two, you stop feeling yourself.', choices: [C('Let go', O('When you came back to yourself it was night, and your qi had completed a circuit it never had before.', { qi: 25, insight: 3, sanity: 3 }))] }),
  E('fo_falling_leaf', 'fortune', { if: { age: [16, 200], realm: '>=2', season: 2 }, once: false, cd: 12, text: 'A single red leaf falls past your face, and for one heartbeat you can see every possible path it might take.', choices: [C('Follow the thought', O('Your sword moved before you did. A new understanding of your art settled in your bones.', { insight: 3, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 15); } }))] }),
  E('fo_lightning', 'fortune', { if: { age: [16, 200], realm: '>=3', chance: 0.3 }, art: 'storm', danger: true, text: 'Caught in a mountain storm, you are holding your sword when lightning strikes the peak above you.', choices: [
    R('Hold on', 'health', 50, O('Lightning ran down the mountain and through your sword and into your meridians. You lived. Your qi has never been so wild, or so strong.', { qiFill: 60, health: -20 }), O('You lived. Barely.', { health: -45 })),
    C('Let go of the sword', O('You threw the sword and dove. Lightning hit it. You found it later, melted into a beautiful, useless shape.', { sanity: 1 })),
  ] }),
  E('fo_chess_immortals', 'fortune', { if: { age: [14, 200], locType: ['wild', 'sect'], chance: 0.3 }, art: 'mountain', title: 'A game of baduk', text: 'On a mountain ledge two old men play baduk on a stone board. They do not look up. The game seems very important.', choices: [
    C('Watch the whole game', O('You watched until the last stone. When you walked back down the mountain, the village had changed: three years had passed. The old men were gone.', { insight: 6, fn: (g) => { g.life.turn += 12; g.meta.stats.years += 3; } })),
    C('Point out a good move', O('One of the old men laughed. "Rude!" he said, and flicked a stone at your forehead. You woke at the foot of the mountain with a bruise and an idea you cannot explain.', { insight: 3 })),
  ] }),
  E('fo_treasure_map_fake', 'fortune', { if: { age: [12, 70], locType: 'city', stat: { wealth: '>=10' } }, art: 'market', text: 'A peddler sells you a "treasure map" for ten taels. It is very old, and very dramatic.', choices: [
    C('Follow it', P('Follow it', 0.25, O('Under an old pagoda, exactly where the map said: a buried jar of silver.', { wealth: 80 }), O('The X marked a latrine. The peddler is long gone.', { wealth: -10, insight: 1 }))),
    C('Don’t buy it', O('You laughed at the peddler. He laughed back. You will always wonder.')),
  ] }),
  E('fo_rescued_crane', 'fortune', { if: { age: [8, 80], locType: ['wild', 'village'], chance: 0.5 }, text: 'A red-crowned crane is tangled in a hunter’s net, beating its wings against the ropes.', choices: [
    C('Cut it free', O('You cut it free. It circled you three times and flew east. That autumn, wherever you went, you seemed to find your way more easily.', { flag: 'crane.blessing', sanity: 3 })),
    C('Leave it for the hunter', O('You left it. The hunter will eat well.')),
  ] }),
  L('fo_crane_return', 'fortune', { flag: 'crane.blessing', age: [20, 200], chance: 0.3 }, 'A red-crowned crane landed in front of you on the road, dropped a red fruit at your feet, and flew away. You are fairly sure it was the same crane.', { item: { red_fruit: 1 } }),
  E('fo_qi_spring', 'fortune', { if: { region: ['west', 'shu', 'guanzhong'], locType: ['wild', 'sect', 'frontier'], age: [12, 200], chance: 0.4 }, art: 'lake', text: 'You find a hot spring in the mountains where the water glows faintly at night. The air is thick with qi.', choices: [
    C('Cultivate here for a season', O('You stayed a season. Your qi grew as if you had trained for a year.', { qi: 35, sanity: 4, codex: { id: 'secret.qi_spring', cat: 'secrets', title: 'The glowing spring', text: 'A qi-rich hot spring lies in the mountains of the west. A season there is worth a year of cultivation.' } })),
    C('Bottle the water to sell', O('You bottled it. By the time you reached a city, it had stopped glowing. You sold it anyway.', { wealth: 15 })),
  ] }),
  E('fo_meteor', 'fortune', { if: { age: [14, 200], season: 2, chance: 0.2 }, art: 'moon', text: 'A falling star crosses the whole sky and lands in the hills with a sound like a temple bell.', choices: [
    C('Go and find it', O('You found a black stone, still warm, heavy as a city gate. A smith would sell his soul for this iron.', { flag: 'fo.star_iron' })),
    C('Make a wish', O('You made a wish. You will not say what it was.', { sanity: 2 })),
  ] }),
  E('fo_star_iron_forge', 'fortune', { if: { flag: 'fo.star_iron', locType: ['city', 'estate'], noItem: 'famous_sword' }, art: 'forge', text: 'A master smith turns your star-iron in his hands and goes pale. "I can make a sword from this. It will take a year. It will cost two hundred taels. It will be the best thing I ever make."', choices: [
    Q('Pay him (200 taels)', { stat: { wealth: '>=200' } }, O('A year later he handed you a sword that sings when drawn. You named it after the night it fell.', { wealth: -200, item: { famous_sword: 1 }, unflag: 'fo.star_iron' })),
    C('Keep the stone for now', O('You kept the stone.')),
  ] }),
  E('fo_dream_master', 'fortune', { if: { age: [10, 200], chance: 0.3 }, once: false, cd: 20, text: 'You dream of an old master you have never met, teaching you in a hall you have never seen. In the morning you remember every word.', choices: [C('Practise it', O('It worked. You do not know whose memory it was.', { insight: 3, qi: 15 }))] }),
  E('fo_hidden_inn_master', 'fortune', { if: { age: [14, 80], locType: 'city', chance: 0.4 }, art: 'inn', text: 'The innkeeper, an ordinary middle-aged man, catches a falling teacup without looking, and puts it back on the tray. Nobody else noticed.', choices: [
    C('Ask him who he really is', O('He looked at you for a long time. "Retired," he said. "Very retired." But he corrected your grip on your chopsticks, and somehow your sword grip too.', { insight: 2, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 8); } })),
    C('Pretend you didn’t see', O('You pretended. He served you the best dumplings in the house, and never charged you again.', { health: 3 })),
  ] }),
  E('fo_purple_mist_ashes', 'fortune', { if: { loc: 'mounthua', happened: 'blood_night', year: [34, 100], noManual: 'hua_purple_mist' }, art: 'fire', text: 'In the ashes of Mount Hua’s library, under a fallen beam, your foot hits something hard: a fireproof iron box.', choices: [C('Open it', O('Inside, unburned: the Purple Mist Divine Art. Mount Hua is gone. Its heart is in your hands.', { manual: 'hua_purple_mist', sanity: -3 }))] }),
  E('fo_vajra_hermitage', 'fortune', { if: { loc: 'jadegate', age: [16, 200], noManual: 'ext_vajra' }, art: 'desert', text: 'In a hermitage half-buried by sand outside Jade Gate, a mummified monk sits in meditation. Pressed into the clay wall beside him is the outline of a body, as if someone threw himself against it, and the wall lost.', choices: [
    R('Study the imprint', 'insight', 35, O('You studied it for a month. The imprint was a lesson: the Vajra Indestructible Body, written in the shape of a man.', { manual: 'ext_vajra' }), O('You stared at a dent in a wall for a month. Some lessons are not for everyone.')),
  ] }),
  E('fo_dang_vault', 'fortune', { if: { loc: 'dangclan', happened: 'dang_civil_war', year: [26, 27], noManual: 'med_ten_thousand' }, art: 'estate', danger: true, text: 'In the chaos of the Dang civil war, the door to the forbidden poison vault stands open and unguarded.', choices: [
    C('Go in', O('Inside, among a thousand jars, a single scroll: the Ten Thousand Poisons Body Art. You walked out before anyone noticed.', { manual: 'med_ten_thousand', rep: { families: -10 }, infamy: 5 })),
    C('Close the door and walk away', O('You closed the door. Some knowledge kills.', { sanity: 2 })),
  ] }),
  E('fo_old_book', 'fortune', { if: { age: [8, 80], locType: 'city', chance: 0.6 }, art: 'library', text: 'In a second-hand bookshop, between a cookbook and a book of love poems, you find a thin, water-stained volume of breathing exercises.', choices: [
    Q('Buy it (5 taels)', { stat: { wealth: '>=5' } }, O('It turned out to be a real cultivation method, if a modest one.', { wealth: -5, manual: 'breath_basic' }), { show: { noManual: 'breath_basic' } }),
    C('Buy the love poems instead', O('The love poems were terrible. You read them all.', { charm: 1 })),
  ] }),
  E('fo_later_shortcut', 'timeline', { if: { age: [10, 30], ...LATER, fn: (g) => g.recallable().length > 0 } , text: 'Lying awake, you can feel the shape of a martial art you mastered in another life, like a word on the tip of your tongue.', choices: [C('Write down what you can', O('You filled three pages by candlelight. Pieces of it came back as you wrote.', { insight: 2, fn: (g) => { const r = g.recallable(); if (r.length && g.rng.chance(0.5)) g.learnManual(g.rng.pick(r)); } }))] }),
];
