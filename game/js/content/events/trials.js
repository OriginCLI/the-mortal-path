// Mini-game events: the imperial examination, forging, riddles, dice and meditation trials.
// The score from the game decides the rolled choices (P with a `pass` mark).
import { E, O, C, P, Q, M, LATER } from './kit.js';

export default [
  // ── The imperial examination (scholars need it to rise) ─────────
  E('tr_exam_county', 'daily', { if: { career: 'scholar', age: [14, 60], not: 'passedExam' }, once: false, cd: 3, game: 'exam', art: 'library', title: 'The county examination',
    text: 'The examination cells are the size of a coffin and smell like one. You have three days, a brush, an inkstone, and a topic the examiners chose to be difficult.', choices: [
      P('Write', 0.5, O('Your name was posted on the wall outside the yamen, eleventh of twelve. Eleventh is still on the wall. You are a Licentiate.', { flag: 'passedExam', careerUp: 10, fame: 2, rep: { court: 4 } }),
        O('Your name was not on the wall. You read the list four times anyway. There is always next time, the examiners say, as they have said for a thousand years.', { sanity: -4, insight: 1 }), { pass: 0.6 }),
      Q('Bribe the copyist (40 taels)', { stat: { wealth: '>=40' } }, O('The copyist "improved" your essay before the examiners read it. You passed. You will spend years hoping nobody checks.', { flag: ['passedExam', 'tr.exam_bribe'], careerUp: 10, wealth: -40, sanity: -3 })),
      C('Walk out', O('You stood up on the first morning, bowed to the proctor, and walked out into the sunlight. Some things are not worth three days in a box.', { sanity: 2 })),
    ] }),
  E('tr_exam_palace', 'daily', { if: { career: 'scholar', flag: 'passedExam', age: [20, 70], stat: { insight: '>=35' } }, game: 'exam', art: 'palace', title: 'The palace examination',
    text: 'You kneel in the palace courtyard among three hundred candidates. Somewhere behind the screen, the Son of Heaven may or may not be listening. The topic is announced by a eunuch with a voice like a temple bell.', choices: [
      P('Write for the throne', 0.5, O('You placed in the second tier. The minister who read your essay asked to meet you, and remembered your name a year later when a post opened.', { careerUp: 14, fame: 5, rep: { court: 10 }, flag: 'tr.palace_graduate' }),
        O('You were not placed. A minister wrote in the margin: "Competent. Forgettable." You keep the essay in a drawer and read the margin when you are feeling proud.', { sanity: -3, insight: 2 }), { pass: 0.7 }),
      C('Write what you believe, not what they want', O('You wrote about the granaries, and named the officials who emptied them. You were not placed. Three of the officials were quietly dismissed the next year.', { rep: { court: -5 }, fame: 3, sanity: 4 })),
    ] }),
  E('tr_exam_tutor', 'daily', { if: { age: [8, 16], career: 'none', stat: { insight: '>=25' } }, game: 'exam', text: 'A retired magistrate in town sets the local children a practice essay every spring, and pays a tael to the best.', choices: [
    P('Try for the tael', 0.5, O('He read yours aloud to the others. Your ears burned for a week. "This one could sit the examinations," he told your family.', { wealth: 1, insight: 2, flag: 'tr.tutor_praise' }),
      O('He handed yours back with a single character circled: "Why?" You are still thinking about it.', { insight: 1 }), { pass: 0.5 }),
    C('Go fishing instead', O('The fish were not biting. Neither, it turns out, were you.')),
  ] }),

  // ── Forging ─────────────────────────────────────────────────────
  E('tr_forge_commission', 'daily', { if: { career: 'smith', age: [14, 70] }, once: false, cd: 3, game: 'forge', art: 'forge', title: 'A commission',
    text: 'A young swordsman from the {sect} lays a purse on your anvil. "A blade for my first tournament. Something that will not break."', choices: [
      P('Forge it', 0.5, O('The blade sang when he tested it. He came back after the tournament to tell you he had reached the third round, and that the blade had not a nick on it.', { wealth: 18, careerUp: 4, fame: 1 }),
        O('The blade cracked at the tang on the first test cut. You returned his money and spent the night staring at the coals.', { careerUp: 1, sanity: -2 }), { pass: 0.6 }),
      C('Sell him something from the rack', O('A decent blade, honestly priced. He did not know the difference. You did.', { wealth: 8 })),
    ] }),
  E('tr_forge_master_test', 'daily', { if: { career: 'smith', age: [20, 70], stat: { body: '>=35' } }, game: 'forge', art: 'forge', title: 'The guild test',
    text: 'To be named a Master Smith, the guild asks for one blade, made in front of the guild elders, in a single day.', choices: [
      P('Begin at dawn', 0.5, O('At dusk the eldest elder flexed your blade until the tip touched the hilt, let go, and watched it spring back true. He nodded once. That was all, and it was everything.', { careerUp: 12, fame: 3, rep: { merchants: 5 } }),
        O('Your blade was good. "Good," the elders said, "is what journeymen make." Come back next year.', { careerUp: 3 }), { pass: 0.67 }),
    ] }),
  E('tr_forge_meteor', 'fortune', { if: { career: 'smith', age: [25, 80], stat: { fame: '>=10' } }, game: 'forge', art: 'forge', title: 'Star iron',
    text: 'A herdsman brings you a lump of black metal that fell burning out of the sky over his pasture. It is heavier than it should be, and warm to the touch in winter.', choices: [
      P('Forge it into a sword', 0.5, O('Forty days at the anvil. The blade came out black with silver veins like a night sky, and it cut through a temple bell. Murim masters began to write to you.', { item: { fine_sword: 1 }, fame: 10, careerUp: 8, codex: { id: 'secret.star_iron', cat: 'secrets', title: 'Star iron', text: 'A herdsman’s pasture north of Taiyuan is struck by a falling star in some years. Star iron forged at the right heat makes a blade that cuts bells.' } }),
        O('The star iron would not take an edge. You ruined it, and the herdsman’s hopes with it. It sits on your windowsill, still warm in winter.', { sanity: -3 }), { pass: 0.67 }),
      C('Sell it to the Golden Abacus', O('The Golden Abacus paid handsomely and asked no questions, which was itself a kind of answer.', { wealth: 60, rep: { merchants: 3 } })),
    ] }),

  // ── Riddles ─────────────────────────────────────────────────────
  E('tr_riddle_gate', 'fortune', { if: { age: [12, 80], region: ['jingchu', 'shu', 'jiangnan'] }, game: 'riddle', art: 'mountain', title: 'The Gate of Three Questions',
    text: 'Halfway up a mountain, a gate with no wall stands across the path. An old man sits beside it shelling peanuts. "Three riddles," he says. "Answer, and go on. Fail, and go back. Peanut?"', choices: [
      P('Answer his riddles', 0.5, O('He laughed, swept the shells off his lap, and walked you to a hut beyond the gate where he showed you a breathing exercise for an afternoon. "Wit is the sharpest sword," he said, "and the cheapest."', { insight: 4, qi: 10, codex: { id: 'secret.riddle_gate', cat: 'secrets', title: 'The Gate of Three Questions', text: 'An old man guards a gate with no wall on a southern mountain. Answer three riddles and he teaches a breathing exercise. He likes peanuts, and wrong answers do not anger him.' } }),
        O('He shook his head kindly and gave you a handful of peanuts for the walk down. "Come back when you are cleverer, or older. Same thing, usually."', { insight: 1 }), { pass: 0.67 }),
      C('Walk around the gate', O('You walked around the gate. The path on the other side led nowhere at all; you were back at the bottom by evening. When you looked up, the old man waved.')),
      M('Bring him a sack of peanuts', 'secret.riddle_gate', O('He brightened like a boy. "Someone remembered!" He skipped the riddles and taught you until moonrise.', { insight: 5, qi: 15 })),
    ] }),
  E('tr_riddle_tavern', 'daily', { on: 'tavern', if: { age: [14, 80] }, once: false, cd: 4, game: 'riddle', text: 'A storyteller offers a jug of the good wine to anyone who can answer three of his riddles. The last man to try is still sitting in the corner, sulking.', choices: [
    P('Try your luck', 0.5, O('You won the jug and shared it. The storyteller added you to his stories, slightly taller.', { charm: 2, fame: 1, sanity: 3 }), O('You lost, and the corner gained a second sulker.', { charm: -1 }), { pass: 0.67 }),
    C('Just listen', O('You listened. Some of the riddles were very old. Some of the answers were wrong.')),
  ] }),
  E('tr_riddle_beggar_test', 'sect', { if: { sect: 'beggars', age: [10, 50], rank: [0, 1] }, game: 'riddle', title: 'The Elder’s questions', text: '{@beggar_chief} eats half your dumpling and squints at you. "Strength I have plenty of. Before I teach you anything, let’s see what’s between your ears."', choices: [
    P('Answer', 0.5, O('He grunted, took the other half of your dumpling, and taught you a step he does not teach many.', { manual: 'step_basic', merit: 10, insight: 2 }), O('"Hm. Strength, then," he said, and set you to carrying water for a month.', { body: 2, merit: 3 }), { pass: 0.67 }),
  ] }),

  // ── Dice ────────────────────────────────────────────────────────
  E('tr_dice_duel', 'crime', { on: 'gamble', if: { age: [16, 80] }, once: false, cd: 3, game: 'dice', art: 'inn', title: 'A dice duel', text: 'A one-eyed gambler with very clean hands offers you a private game in the back room. "Three throws. Best of three takes the pot. Twenty taels each."', choices: [
    P('Play him', 0.5, O('You won the pot. He smiled with his one eye and said he would see you again. You would rather he did not.', { wealth: 20, infamy: 1 }), O('You lost the pot. On the way out you noticed his dice were very slightly too clean.', { wealth: -20 }), { pass: 0.6, req: { stat: { wealth: '>=20' } } }),
    C('Decline', O('You declined. He shrugged and found someone drunker.')),
  ] }),
  E('tr_dice_monk', 'jianghu', { on: 'wander', if: { age: [14, 80] }, game: 'dice', text: 'A drunken monk with a gourd of wine challenges you to dice on a temple step. The stakes: if you win, he teaches you something; if he wins, you fetch his wine for a month.', choices: [
    P('Throw', 0.5, O('You won. The monk, true to his word, showed you a staggering drunken step that somehow never fell over.', { manual: 'step_basic', body: 1, charm: 1 }), O('You lost, and spent a month fetching wine for a monk who should not have been drinking it. You learned a great deal about wine.', { wealth: -6, sanity: 2 }), { pass: 0.6 }),
    C('Politely refuse', O('He called you a coward and fell asleep mid-insult.')),
  ] }),

  // ── Meditation trials ───────────────────────────────────────────
  E('tr_waterfall', 'daily', { if: { age: [10, 60], realm: [0, 3], region: ['central', 'shu', 'jingchu', 'guanzhong'] }, once: false, cd: 6, game: 'meditate', art: 'river', title: 'Under the falls',
    text: 'The old practice: sit under a waterfall in early spring, breathe, and do not let the cold reach your heart.', choices: [
      P('Sit beneath it', 0.5, O('The cold hammered you for an hour and then, suddenly, could not touch you. Your qi ran hot and clear for days afterwards.', { qi: 18, body: 2, sanity: 2 }), O('The cold won. You staggered out blue and coughing and spent a week in bed.', { health: -10, body: 1 }), { pass: 0.6 }),
      C('Watch someone else try', O('A Wudang disciple sat beneath it for two hours. You stood beside the pool in your coat and learned a little from his breathing.', { insight: 1 })),
    ] }),
  E('tr_heart_demon_vigil', 'daily', { if: { age: [16, 120], realm: '>=3', stat: { sanity: '<=50' } }, once: false, cd: 5, game: 'meditate', art: 'meditation', title: 'The vigil',
    text: 'The voice in your meditation is your own voice, saying the worst things you have ever thought. It wants you to stop breathing evenly. It is very persuasive.', choices: [
      P('Keep breathing', 0.5, O('You breathed through it until the voice tired, and when it was quiet, you could hear the wind again. The heart-demon has less of you now.', { sanity: 14, insight: 2 }), O('You lost the rhythm. When you came to, you had broken your own meditation cushion in half and could not remember doing it.', { sanity: -8, health: -5 }), { pass: 0.6 }),
      C('Stop meditating for a season', O('You put it away for a season and went fishing. The voice did not follow you to the river. It will be waiting.', { sanity: 4 })),
    ] }),
  E('tr_master_breath_test', 'sect', { if: { age: [8, 30], rank: [0, 1], faction: ['orthodox', 'families'] }, game: 'meditate', art: 'meditation', title: 'The breathing test',
    text: 'Your instructor lights a stick of incense and sets it in front of you. "Circulate until it burns down. If your breath wavers, I will know."', choices: [
      P('Circulate', 0.5, O('The incense burned to ash. Your instructor opened one eye and said nothing, which, from him, was a speech.', { merit: 8, qi: 10 }), O('Your breath caught at the third circuit. "Again," he said, and lit another stick, and another, until midnight.', { merit: 3, qi: 4, sanity: -2 }), { pass: 0.67 }),
    ] }),
  E('tr_regressor_breath', 'daily', { if: { ...LATER, age: [6, 14], realm: 0 }, game: 'meditate', text: 'Lying awake in your small bed, you try the breathing you remember from a life you have not lived yet. Your child’s meridians are narrow, like a river in a drought.', choices: [
    P('Try anyway', 0.5, O('Narrow, but open. The qi moved, a thread of it, and you smiled in the dark like an old man.', { qi: 20, insight: 1 }), O('Too much, too soon. Your chest burned all night, and you wept like the child you are.', { health: -6, sanity: -2 }), { pass: 0.67 }),
    C('Wait until you are older', O('You waited. The body has its own seasons, even if the mind does not.', { sanity: 1 })),
  ] }),
];
