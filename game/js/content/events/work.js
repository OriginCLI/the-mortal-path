// Working life: careers and their ranks, bosses, customers, accidents, scandals and guild politics;
// odd jobs for people without a trade; the imperial examinations; and events triggered by the Work,
// Study and Physician activities.
//
// Career rank has no condition of its own, so senior-rank events are gated on the career's stat
// (promotion to rank n needs that stat at 12 + (n - 1) * 14: about 26 for rank 2, 40 for rank 3) and on
// flags this file sets (wk.*). Note: the engine only rolls `on: 'work'` events for people who have a
// career, so odd jobs for people without one (`career: 'none'`) are deck events.
import { E, O, C, R, P, M, Q, L, LATER } from './kit.js';
import { template } from '../../engine/registry.js';

// Common gates.
const JOB = (career, age = [14, 70], extra = {}) => ({ career, age, ...extra });
const NO_JOB = (age = [12, 60], extra = {}) => ({ career: 'none', age, ...extra });
const COUNTY = { not: ['passedExam', 'wk.sch.banned'] };
const PROV = { flag: 'passedExam', not: 'wk.exam.prov', stat: { insight: '>=26' } };
const PALACE = { flag: 'wk.exam.prov', not: 'wk.exam.palace', loc: 'capital' };
const PALACE_Q = { id: 'secret.wk_palace_question', cat: 'secrets', title: 'The palace question', text: 'In the boy Emperor’s reign the palace examination asks, in his own hand, "Whom should a ruler trust?" The Director of the Eastern Depot wants to hear "Those who watch over him." The boy wants to hear "No one but yourself."' };
const STAR_IRON = { id: 'secret.wk_star_iron', cat: 'secrets', title: 'The fallen star of Kongtong', text: 'A star fell in the gullies east of Mount Kongtong. A shepherd keeps the black iron as a doorstop and will trade it for a jar of wine and a good story.' };
const GHOST_MARKET = { id: 'secret.wk_ghost_market', cat: 'secrets', title: 'The Ghost Market’s word', text: 'At the Ghost Market of Kaifeng the stalls with the real goods open only to those who say "The moon owes me money." The phrase never changes.' };
const TEMPER = { id: 'secret.wk_temper', cat: 'recipes', title: 'The cold quench', text: 'Quench a blade in brine with ash from burned pine needles, then once more in snow-melt. Old smiths of Guanzhong swear it gives steel a second soul.' };

// The main rolled choice of a template row: [label, stat, dc, okText, okFx, noText, noFx].
const ROLL = (a) => R(a[0], a[1], a[2], O(a[3], a[4] || {}), O(a[5], a[6] || {}));

// ── Templates ────────────────────────────────────────────────────

// Escort jobs, one per real route. Rolled when an escort guard works in the starting city.
const tplRoute = template('wk_route', [
  { key: 'luoyang_kaifeng', from: 'luoyang', title: 'Silk for Kaifeng',
    text: 'Forty bolts of silk for a gambling-house owner in Kaifeng, two days down the canal road. The client’s nephew insists on riding with the cargo and keeps asking which cart is which.',
    roll: ['Watch the nephew', 'insight', 20, 'On the second night you caught the nephew signalling to the reeds with a lantern. The thieves waiting there found guards instead of silk. The owner paid a bonus and disowned his nephew in the same breath.', { wealth: 6, careerUp: 2, rep: { merchants: 3 } }, 'You watched the road instead of the nephew. Three bolts went missing near the locks, and the agency docked your pay.', { wealth: -3 }],
    more: [C('Keep to your post and say nothing', O('You kept to your post. Two bolts vanished at Kaifeng. Nobody could prove anything, which in Kaifeng counts as a good trip.', { wealth: 2 }))] },
  { key: 'changan_jadegate', from: 'changan', age: [17, 55], title: 'The western road', art: 'desert',
    text: 'Tea and lacquer bound for Jade Gate Pass, a month along the old Silk Road. On the twelfth day the horizon turns the colour of rust.',
    roll: ['Rope the camels together and push through the sandstorm', 'body', 30, 'You walked at the head of the line for two days with a rope around your waist and sand in your teeth. Every camel reached Jade Gate. The caravan master paid you double and called you his little camel, affectionately.', { wealth: 14, careerUp: 3, fame: 2, body: 1 }, 'The storm took two camels and most of your skin. You reached Jade Gate alive and in debt for the cargo.', { health: -12, wealth: -5 }],
    more: [C('Make camp in the lee of a dune and wait', O('You waited out the storm under felt blankets. It cost four days and the caravan master’s good mood, but nobody died.', { wealth: 6 }))] },
  { key: 'hangzhou_wuchang', from: 'hangzhou', title: 'Tea up the Great River', art: 'river', danger: true,
    text: 'Tea barges from Hangzhou to Wuchang. Past the river bend a skiff flying the Water Fortress pennant pulls alongside, and a smiling man asks for the toll.',
    roll: ['Haggle over the toll', 'charm', 25, 'You haggled him down to half, poured him a cup of the cargo, and parted friends. He promised to remember your face, which on this river is worth more than the toll.', { wealth: 9, careerUp: 2, rep: { unorthodox: 3 } }, 'He listened to your haggling with real interest, then doubled the toll for wasting his afternoon.', { wealth: -8 }],
    more: [C('Refuse and draw', O('You put your hand on your saber. The smiling man stopped smiling.', { combat: { foe: { name: 'the toll-taker', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.25,
      win: { text: 'He went over the side and swam for it. The barge captain toasted you all the way to Wuchang, and the agency paid a bounty.', wealth: 12, fame: 2, rep: { unorthodox: -5 } },
      lose: { text: 'They threw you in the river and took a crate of the best leaves. You swam to the bank and walked to Wuchang wet.', wealth: -6, health: -8 } } }))] },
  { key: 'chengdu_wuchang', from: 'chengdu', title: 'The Three Gorges', art: 'river',
    text: 'Brocade and pepper down the Three Gorges from Chengdu to Wuchang. At the Witch Gorge rapids the boatman goes white, and the hull hits something it should not have.',
    roll: ['Dive in after the cargo', 'body', 25, 'You went into the white water with a rope and came back with the brocade chests one by one. The boatman lit incense for you at the next shrine, which was alarming.', { wealth: 10, careerUp: 3, body: 2 }, 'The river nearly kept you. You lost the pepper and some of the hearing in one ear.', { health: -15 }],
    more: [C('Save the boatman instead', O('You hauled the boatman out and let the cargo go. The agency deducted it from your pay. His wife sent you pickled vegetables for a year.', { wealth: -4, sanity: 4 }))] },
  { key: 'capital_paeng', from: 'capital', title: 'Wine for the Paeng', art: 'estate',
    text: 'Twelve jars of wine for the Paeng Family Fortress. At the gate a Paeng son with shoulders like a door announces that no escort enters until it proves it could have defended the wine.',
    roll: ['Talk your way in', 'charm', 30, 'You told him the wine had already defended itself against three bandit gangs and a magistrate. He laughed so hard he opened a jar on the spot.', { wealth: 8, careerUp: 2, rep: { families: 3 } }, 'He did not find you funny. You waited outside the gate until dark.', { sanity: -2 }],
    more: [C('Spar with him', O('He grinned and took off his outer robe.', { combat: { foe: { name: 'a Paeng son', kind: 'brawler', rel: 0.5 }, context: 'spar', lethal: 0,
      win: { text: 'You put him on his back in the courtyard. The whole fortress cheered, him loudest. The Paeng paid for the wine twice.', wealth: 12, fame: 2, rep: { families: 5 } },
      lose: { text: 'He won, then helped you up and poured you a cup of the delivery. The Paeng respect people who lose cheerfully.', rep: { families: 2 }, health: -5 } } }))] },
  { key: 'kaifeng_capital', from: 'kaifeng', title: 'A sealed dispatch', art: 'palace',
    text: 'An Eastern Depot officer hires the agency to carry a lacquered dispatch box to the capital. It is not locked. The officer seems to know that you know it is not locked.',
    roll: ['Read it, carefully', 'insight', 35, 'You slid the letter out by lamplight and back without disturbing the wax thread. It was a list of Beggars’ Sect safe houses in Luoyang. You delivered it, and remembered every word.', { wealth: 10, careerUp: 2, codex: { id: 'secret.wk_depot_list', cat: 'secrets', title: 'The Depot’s list', text: 'The Eastern Depot keeps a list of Beggars’ Sect safe houses in Luoyang: under the Tianjin Bridge, behind the Red Lantern pawnshop, and in the old granary by the north gate.' } }, 'The wax thread snapped. At the capital the officer looked at it, then at you, and smiled. He paid you anyway. That was the frightening part.', { rep: { court: -5 }, sanity: -3, flag: 'wk.depot.watch' }],
    more: [C('Deliver it unopened', O('You delivered it unopened. The officer nodded as if you had passed a test. Perhaps you had.', { wealth: 4, rep: { court: 4 } }))] },
  { key: 'luoyang_songshan', from: 'luoyang', age: [15, 65], title: 'Pilgrims to Shaolin', art: 'temple',
    text: 'An easy job: eleven pilgrims from Luoyang to Shaolin Temple. Twelve arrive at the meeting place. The twelfth wears his hat too low and has a sword wrapped in his bedroll.',
    roll: ['Ask him, quietly, what he is running from', 'charm', 22, 'He was a Qingcheng disciple fleeing a feud he had not started. At Shaolin the monks took him in without a question. A month later an envelope of silver arrived from Mount Qingcheng, with no letter.', { wealth: 5, careerUp: 2, rep: { orthodox: 5 } }, 'He ran in the night and took the pilgrims’ donation box with him.', { wealth: -6, rep: { merchants: -2 } }],
    more: [C('Turn him away', O('You turned him away. The other pilgrims sang all the way to Mount Song. You did not.', { wealth: 2, sanity: -1 }))] },
  { key: 'wuchang_dongting', from: 'wuchang', title: 'Fog on Dongting', art: 'lake',
    text: 'A retired magistrate’s family crossing Lake Dongting to their ancestral village. Fog closes in until you cannot see the bow from the stern. Somewhere out there, oars.',
    roll: ['Steer by the sound of the reeds', 'insight', 28, 'You listened to the reeds and the water and brought the boat in to the right shore. The oars in the fog went the other way. The old magistrate wrote you a recommendation in excellent calligraphy.', { wealth: 7, careerUp: 4, rep: { court: 3 } }, 'You steered by the reeds into more reeds. You spent a cold night lost, and the magistrate’s wife will never forgive you.', { health: -5, sanity: -2 }],
    more: [C('Drop anchor and shout the agency’s name into the fog', O('You shouted. The oars stopped, considered, and went away. Reputation is armour.', { fame: 1, wealth: 3 }))] },
  { key: 'hangzhou_namgung', from: 'hangzhou', title: 'Silk for the Namgung', art: 'estate',
    text: 'Bridal silk for the Namgung Estate. The Namgung steward inspects every bolt and announces that one has a flaw, which means, he explains, that the Namgung will pay half.',
    roll: ['Prove the "flaw" is a weave pattern', 'insight', 30, 'You turned the bolt to the light and showed him the pattern was deliberate, from the best workshop in Hangzhou. The steward paid in full and looked at you as if you were a new kind of insect.', { wealth: 12, careerUp: 2, insight: 1 }, 'You could not find the flaw. Neither could he, you suspect. You accepted half.', { wealth: 3 }],
    more: [C('Bow and accept half', O('You bowed and accepted half. The Namgung remember who bows. You are not sure that is good.', { wealth: 3, rep: { families: 3 } }))] },
  { key: 'chengdu_dangclan', from: 'chengdu', title: 'Medicine for the Dang', art: 'estate',
    text: 'Six sealed medicine chests for the Dang Clan Manor. At the outer gate a servant offers your crew tea. Your crew is very thirsty.',
    roll: ['Watch who drinks first', 'insight', 32, 'The servant did not drink. Neither did you, and you stopped your crew with a look. The Dang steward laughed and gave you a jar of salve "for next time." With the Dang there is always a next time.', { wealth: 9, careerUp: 2, item: { healing_salve: 1 }, rep: { families: 2 } }, 'You drank. It was only tea, this time. You were sick for a week anyway, out of sheer nerves.', { health: -6 }],
    more: [C('Refuse, very politely, for everyone', O('The servant poured the tea onto a potted orchid. The orchid did not die, which was somehow worse.', { wealth: 5, sanity: -1 }))] },
  { key: 'jadegate_tenthousand', from: 'jadegate', age: [18, 50], title: 'A caravan to the red banners', art: 'demonic',
    text: 'A merchant offers triple pay for an escort through the western passes to a trading post under the red banners of the Heavenly Demon Divine Cult. "Salt and iron," he says. "Mostly salt."',
    roll: ['Take the job and keep your eyes down', 'sanity', 35, 'The Cult guards weighed every sack and searched every cart. One of them, a girl younger than you, asked where you were from and seemed to want an honest answer. You came back richer and thinking.', { wealth: 25, careerUp: 3, rep: { cult: 5, orthodox: -3 } }, 'The red banners did something to your sleep. You came back with the pay and a voice in your dreams that knows your name.', { wealth: 20, sanity: -8, rep: { cult: 3, orthodox: -3 } }],
    more: [C('Refuse', O('You refused. The merchant found someone else. You saw that guard months later, drinking alone, very rich and very quiet.', { insight: 1 }))] },
  { key: 'capital_taihang', from: 'capital', age: [16, 60], title: 'The Taihang road', art: 'mountain', danger: true,
    text: 'Salt carts by the Taihang road, through the Green Forest’s country. At the third pass a line of men with axes sit on the rocks as if they had been waiting all morning. They have.',
    roll: ['Shout the agency’s name and ask for passage', 'fame', 15, 'Their captain had heard of you. He waved you through and asked you to give his regards to your mother, whom he had also apparently heard of.', { wealth: 11, careerUp: 2, fame: 1, rep: { unorthodox: 3 } }, 'Nobody had heard of you. They took a cart as a lesson.', { wealth: -10 }],
    more: [
      C('Charge the pass', O('You lowered your spear and charged.', { combat: { foe: { name: 'a Green Forest axeman', kind: 'bandit', rel: 0.5 }, context: 'ambush', lethal: 0.3,
        win: { text: 'You broke through and the carts rolled after you. The Green Forest will talk about this. So will the agency.', fame: 3, careerUp: 4, rep: { unorthodox: -6 } },
        lose: { text: 'They let you live, which the Green Forest does when it wants a story told. They kept two carts.', wealth: -12, health: -10 } } })),
      C('Ask for the Mountain Tiger by name', O('The axemen looked at each other. One ran up the hill. He came back with a jar of wine and the Mountain Tiger’s compliments, and walked your carts through the pass himself.', { wealth: 11, rel: { '@mountain_tiger': { res: 5 } }, rep: { unorthodox: 5 } }), { show: { met: 'mountain_tiger' } }),
    ] },
], (r) => E('wk_route', 'jianghu', {
  on: 'work', once: false, cd: 3, danger: !!r.danger, art: r.art || 'road', title: r.title,
  if: JOB('escort', r.age || [15, 60], { loc: r.from }), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// The imperial examinations: county (passing unlocks the scholar's career), provincial, and palace.
const tplExam = template('wk_exam', [
  { key: 'analects', gate: COUNTY, age: [12, 45], title: 'The county examination',
    text: 'The county examination hall: a thousand cubicles, a thousand candles, one question. "Explain: the gentleman is not a vessel."',
    roll: ['Write what the commentaries say', 'insight', 18, 'You wrote eight hundred correct characters and not one surprising one. You passed in the middle of the list, which is exactly where the examiners like people to be.', { flag: 'passedExam', careerUp: 6 }, 'Your mind went white at the third character. You failed, and walked home past the list without looking at it.', { sanity: -4 }],
    more: [R('Write what you actually think', 'insight', 30, O('An examiner wrote "original" in the margin and passed you near the top. Original is a dangerous word in an examination hall, but it was attached to a pass.', { flag: 'passedExam', careerUp: 6, fame: 2, insight: 1 }), O('An examiner wrote "eccentric" in the margin. In an examination, that is a death sentence. You failed.', { sanity: -3, insight: 1 }))] },
  { key: 'poetry', gate: COUNTY, age: [12, 45], title: 'Wild geese',
    text: 'The poetry section asks for eight lines on "Wild geese crossing the frontier." The candidate in the next cubicle has been weeping quietly since dawn.',
    roll: ['Compose the poem', 'charm', 20, 'Your geese flew well. The examiner circled your third couplet in red, which is either very good or very bad. It was very good. You passed.', { flag: 'passedExam', careerUp: 6, fame: 1 }, 'Your geese crashed in the fifth line. You failed.', { sanity: -3 }],
    more: [C('Lend the weeping candidate your spare ink-stick', O('You lent him the ink and ran out of time yourself. You handed in seven lines and failed. He passed. He sent you a letter every New Year for the rest of his life.', { sanity: 4, charm: 1 }))] },
  { key: 'statutes', gate: COUNTY, age: [14, 45], title: 'The widow’s field',
    text: 'This year the examiners ask about the statutes: a widow, her late husband’s brother, and a field both claim. The correct answer favours the brother.',
    roll: ['Give the correct answer', 'insight', 22, 'You cited the statute, and the commentary on the statute. You passed. Somewhere a hypothetical widow lost a hypothetical field.', { flag: 'passedExam', careerUp: 6, rep: { court: 3 } }, 'You confused two statutes about water rights. You failed.', { sanity: -3 }],
    more: [R('Argue for the widow from first principles', 'insight', 34, O('An old examiner read your answer twice and passed you over the objections of the other two. "We need a few of these," he said.', { flag: 'passedExam', careerUp: 6, fame: 2 }), O('You failed. The widow would have appreciated it.', { sanity: -2, insight: 1 }))] },
  { key: 'winter_brush', gate: { ...COUNTY, season: 3 }, age: [12, 45], title: 'A cold hall',
    text: 'The examination is held in midwinter. The hall is so cold your brush freezes in the ink, and they judge the calligraphy as harshly as the content.',
    roll: ['Breathe on your hands and write slowly', 'sanity', 30, 'Your strokes came out as steady as temple pillars. You passed.', { flag: 'passedExam', careerUp: 6, charm: 1 }, 'Your hand shook. The examiners called your characters "drunk." You failed, and caught a cold besides.', { health: -6, sanity: -2 }],
    more: [Q('Circulate qi to warm your hands', { realm: '>=1' }, O('You let warm qi run down your arms. Your brush moved like summer. You passed, and the candidates on either side suspected witchcraft.', { flag: 'passedExam', careerUp: 6, infamy: 1 }))] },
  { key: 'frontier', gate: COUNTY, age: [14, 45], title: 'On the western frontier',
    text: 'The essay question: "On the pacification of the western frontier." Everyone knows the Eastern Depot reads the essays.',
    roll: ['Praise the court’s wisdom', 'charm', 16, 'You praised the court so fluently that you almost believed it. You passed.', { flag: 'passedExam', careerUp: 6, rep: { court: 5 } }, 'Your praise came out sounding like sarcasm. It was not meant to. You failed.', { sanity: -3 }],
    more: [R('Write the truth about the frontier garrisons', 'insight', 32, O('You passed. A month later a man in Depot black visited your home and asked for a copy of your essay "for the archive."', { flag: ['passedExam', 'wk.depot.watch'], careerUp: 6, fame: 3, rep: { court: -3 } }), O('You failed, and your name went into a ledger somewhere.', { flag: 'wk.depot.watch', sanity: -4 }))] },
  { key: 'rites', gate: PROV, age: [16, 55], title: 'The provincial examination', art: 'scroll',
    text: 'The provincial examination: three days locked in a cell the size of a coffin. The question on the second day concerns the mourning rites for an emperor who died young.',
    roll: ['Write it from memory', 'insight', 36, 'You passed the provincial examination. Your family hung red paper on the gate. Even the neighbours who dislike you came to drink.', { flag: 'wk.exam.prov', careerUp: 8, rep: { court: 5 }, fame: 2 }, 'You failed, and spent the third day staring at the wall.', { sanity: -5 }],
    more: [C('Walk out on the second day', O('You walked out. The guards were so astonished they let you. You went home, ate a whole fish, and did not regret it until the next morning.', { sanity: 4 }))] },
  { key: 'famine_policy', gate: PROV, age: [16, 55], title: 'Empty granaries', art: 'scroll',
    text: 'The policy question: a province has flooded and the granaries are empty. What does the magistrate do first?',
    roll: ['Open the granaries of the rich', 'insight', 30, 'You argued it so well that the examiners passed you while visibly hoping you would never be posted near them.', { flag: 'wk.exam.prov', careerUp: 8, fame: 3, rep: { court: -2 } }, 'Your argument was bold and badly cited. You failed.', { sanity: -4 }],
    more: [R('Petition the court for relief', 'charm', 28, O('A safe answer, beautifully written. You passed.', { flag: 'wk.exam.prov', careerUp: 8, rep: { court: 4 } }), O('A safe answer, carelessly written. You failed.', { sanity: -3 }))] },
  { key: 'palace_trust', gate: PALACE, age: [18, 60], title: 'The Palace Examination', art: 'palace',
    text: 'The Palace Examination. The boy Emperor sits behind a silk screen, and the Director of the Eastern Depot stands beside it. The question is in the Emperor’s own childish hand: "Whom should a ruler trust?"',
    roll: ['Answer: "His ministers, and his people."', 'insight', 40, 'The screen was silent for a long time. Then a small voice said, "Write that down." You placed third in the empire. The Director smiled at you as you left.', { flag: 'wk.exam.palace', careerUp: 12, fame: 5, rep: { court: 3 }, codex: PALACE_Q }, 'You stumbled. The screen rustled with boredom. You passed at the bottom of the list, which is still passing.', { flag: 'wk.exam.palace', careerUp: 4, codex: PALACE_Q }],
    more: [
      C('Answer: "Those who watch over him."', O('The Director of the Eastern Depot inclined his head a fraction. You placed first. You are not sure, afterwards, whom you work for.', { flag: ['wk.exam.palace', 'wk.depot.friend'], careerUp: 12, rep: { court: 10, orthodox: -3 }, meet: '@depot_director', codex: PALACE_Q })),
      M('Answer: "No one but yourself, Majesty."', 'secret.wk_palace_question', O('A small gasp behind the screen. The boy Emperor came out from behind it, against all protocol, and looked at you. You placed first, and the Director of the Eastern Depot never took his eyes off you again.', { flag: ['wk.exam.palace', 'wk.emperor.ear'], careerUp: 15, fame: 8, gaze: 1 })),
    ] },
  { key: 'palace_murim', gate: PALACE, age: [18, 60], title: 'The question of the sects', art: 'palace',
    text: 'The Palace Examination, second session: "The martial sects keep private armies and answer to no magistrate. Propose a remedy."',
    roll: ['Propose a registry of martial artists', 'insight', 34, 'The court loved it. You placed high, and the Eastern Depot asked for a copy. One day someone will say the Murim Registry was your idea.', { flag: ['wk.exam.palace', 'wk.registry.idea'], careerUp: 12, rep: { court: 8, orthodox: -5 } }, 'Your registry had holes a sect elder could walk through. You passed, barely.', { flag: 'wk.exam.palace', careerUp: 4 }],
    more: [R('Argue that the sects are the empire’s shield against the Cult', 'charm', 36, O('A daring answer. The examiners argued about it for a week and placed you in the second rank. The Murim Alliance heard of it, and was grateful.', { flag: 'wk.exam.palace', careerUp: 10, fame: 4, rep: { orthodox: 6 } }), O('Too daring. You were failed, quietly, and the Depot opened a file.', { flag: 'wk.depot.watch', sanity: -5 }))] },
  { key: 'palace_official', gate: PALACE, age: [18, 60], title: 'One line', art: 'palace',
    text: 'The last question is short: "What is a good official?" The candidate beside you has written eleven pages already.',
    roll: ['Write one line', 'insight', 44, 'You wrote: "One who is remembered by the poor." The examiners argued for a day. You placed first in the empire.', { flag: 'wk.exam.palace', careerUp: 15, fame: 8 }, 'One line was not enough. You passed near the bottom.', { flag: 'wk.exam.palace', careerUp: 4 }],
    more: [R('Write eleven pages too', 'body', 25, O('You wrote until your wrist seized. You passed, respectably, and could not hold chopsticks for a week.', { flag: 'wk.exam.palace', careerUp: 10 }), O('Your wrist gave out on page six. You failed.', { sanity: -5 }))] },
], (r) => E('wk_exam', 'daily', {
  on: ['work', 'study'], art: r.art || 'library', title: r.title,
  if: JOB('scholar', r.age, r.gate), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// A physician's patients.
const tplPatient = template('wk_patient', [
  { key: 'fever_child', if: { age: [12, 80] },
    text: 'A mother carries in a boy burning with fever. She has three coppers and a look you will remember for a long time.',
    roll: ['Treat him', 'insight', 15, 'You sat with him through the night with cool cloths and willow bark. In the morning he asked for congee. His mother tried to give you the three coppers. You let her, because she needed you to.', { sanity: 3, fame: 1, careerUp: 2 }, 'You did everything right, and he was still very sick for a week. He lived. You did not sleep for the week either.', { sanity: -3, careerUp: 1 }],
    more: [C('Send them to a richer physician', O('You sent them across town. You never learned what happened. You think about it more than you would like.', { sanity: -4 }))] },
  { key: 'qi_deviation', if: { age: [16, 80], locType: ['sect', 'estate'] },
    text: 'Two disciples carry in a third, foaming at the mouth, his meridians knotted from a breakthrough gone wrong. His master is standing behind them, very still.',
    roll: ['Needle the knotted meridians', 'insight', 30, 'Forty needles, one breath at a time. The knot in his dantian loosened and his eyes cleared. His master bowed to you, which masters do not do.', { careerUp: 4, rep: { orthodox: 4 }, wealth: 10, insight: 1 }, 'The knot held. He lived, but he will never cultivate again. His master thanked you anyway, and that was the worst part.', { sanity: -6 }],
    more: [C('Tell the master you cannot help', O('You told the truth. The master carried his disciple out himself. You heard later that the boy lived, crippled.', { sanity: -2 }))] },
  { key: 'dang_needle', if: { age: [16, 80], region: 'shu' },
    text: 'A merchant with a blue line climbing his arm from a pinprick. A Dang needle, unmistakably. He swears he has never met a Dang in his life.',
    roll: ['Draw the poison out', 'insight', 35, 'You drew the poison into a cup of black sticky rice that turned the colour of a bruise. The merchant paid well. Two days later a Dang servant left a box of tea on your doorstep, with no note.', { wealth: 15, careerUp: 4, rep: { families: 3 } }, 'You slowed it, but the Dang make poisons to outlast physicians. He lost the arm.', { sanity: -5, careerUp: 1 }],
    more: [C('Send for the Dang Clan’s own antidote', O('The Dang sent an antidote, and a bill, and a polite note asking how you knew whose needle it was.', { wealth: 4, rep: { families: 1 }, flag: 'wk.dang.notice' }))] },
  { key: 'old_general', if: { age: [18, 80], loc: ['capital', 'changan'] },
    text: 'A retired general with an arrowhead still in his shoulder from a war forty years ago. "It aches when it rains," he says. "It is always raining."',
    roll: ['Cut it out', 'insight', 32, 'You cut out a Khitan arrowhead the size of your thumb. The general had it set in gold and wore it to court. He mentioned your name to everyone.', { wealth: 20, careerUp: 4, rep: { court: 3 }, fame: 2 }, 'The arrowhead was wrapped around a nerve. You left it. He was gracious about it, which was worse.', { careerUp: 1 }],
    more: [C('Prescribe a warming plaster', O('He came back every month for the plaster, paid every time, and told you stories of the frontier. It was the best-paid listening you have ever done.', { wealth: 8, insight: 1 }))] },
  { key: 'bandit_wound', if: { age: [16, 80], region: ['hebei', 'guanzhong'] },
    text: 'Past midnight, someone pounds on your door. A man with a saber cut across his ribs, and two friends who keep looking at the street.',
    roll: ['Stitch him by candlelight', 'insight', 22, 'You stitched him and asked no questions. His friends left a bag of silver and promised your house would never be robbed. It never was.', { wealth: 12, careerUp: 3, rep: { unorthodox: 4 }, flag: 'wk.doc.bandits' }, 'He died on your table. His friends took it badly, and your furniture took it worse.', { wealth: -6, sanity: -5 }],
    more: [C('Send a boy to the magistrate while you work', O('You stitched him slowly while the constables came. The magistrate praised your civic spirit. The man’s friends know where you live.', { rep: { court: 4, unorthodox: -6 }, flag: 'wk.doc.informer' }))] },
  { key: 'hard_birth', if: { age: [18, 80], stat: { insight: '>=26' } },
    text: 'The midwife sends for you at dawn: the baby is turned wrong and the mother is fading. The father is sitting in the yard, holding a hoe for no reason.',
    roll: ['Turn the child', 'insight', 34, 'Mother and daughter both lived. The father tried to give you the hoe, then a chicken, then cried. They named the girl after you.', { sanity: 8, fame: 2, careerUp: 4 }, 'The child lived. The mother did not. You stayed to help bury her, because there was no one else to stay.', { sanity: -10, careerUp: 2 }],
    more: [C('Tell the father to choose', O('He chose his wife. She lived, and they never spoke of it again in front of you.', { sanity: -6, careerUp: 2 }))] },
  { key: 'gout', if: { age: [16, 80], locType: 'city' },
    text: 'The magistrate has gout in his left foot and opinions about it. He wants a pill, not advice. Above all he does not want to hear the word "wine."',
    roll: ['Tell him the truth, charmingly', 'charm', 28, 'You told him to give up wine so diplomatically that he thought it was his idea. His foot recovered. He recommended you to every official in the prefecture.', { wealth: 12, careerUp: 3, rep: { court: 4 } }, 'He heard the word "wine" and stopped listening. He found another physician.', { rep: { court: -2 } }],
    more: [C('Sell him an expensive pill', O('You sold him a beautifully gilded pill of chalk and liquorice. His foot did not improve, but his mood did, and he paid.', { wealth: 15, infamy: 1, sanity: -1 }))] },
  { key: 'beggar_leg', if: { age: [14, 80], loc: 'luoyang' },
    text: 'A beggar with a leg wound gone green sits on your step. He cannot pay. Behind him, at a respectful distance, a dozen other beggars are pretending not to watch.',
    roll: ['Save the leg', 'insight', 28, 'You saved the leg. The next week a Beggars’ Sect elder with too few fingers came by to thank you, and you discovered that you now hear every rumour in Luoyang a day early.', { careerUp: 3, rep: { orthodox: 4 }, meet: '@beggar_chief', rel: { '@beggar_chief': { aff: 10 } } }, 'You could not save the leg, only the man. He thanked you all the same. The beggars took him away on a door.', { sanity: -3, rep: { orthodox: 2 } }],
    more: [C('Give him salve and send him off', O('You gave him a pot of salve. A dozen beggars watched him limp away, and then looked at you, and then were gone.', { rep: { orthodox: -1 }, sanity: -2 }))] },
  { key: 'cult_defector', if: { age: [16, 80], region: ['west', 'shu', 'guanzhong'] },
    text: 'A woman in a travelling cloak with red thread at the hem. Her pulse is wrong: hot, fast, demonic qi eating its own channels. "I left," she says. "It did not."',
    roll: ['Bleed the demonic qi out slowly', 'insight', 38, 'It took a month of needles and cold baths. When she left, her pulse was a mortal’s. She wrote down what she knew of how demonic qi moves, and left it under her pillow for you.', { careerUp: 5, insight: 3, codex: { id: 'theory.wk_demon_pulse', cat: 'theory', title: 'The demonic pulse', text: 'Demonic qi runs against the meridians and burns hottest at the Heart Governor point. Needle there, and bleed it slowly, and a defector can be made mortal again.' } }, 'Her qi went wild under your needles. She fled before dawn. Your hands were burned to the wrists.', { health: -10, sanity: -4 }],
    more: [C('Report her to the Murim Alliance', O('The Alliance took her away and paid you a bounty. You did not ask what they did with her. You were careful not to ask.', { wealth: 15, rep: { orthodox: 5, cult: -8 }, sanity: -5 }))] },
  { key: 'tanners_fever', if: { age: [14, 80], loc: 'chengdu', year: [17, 19], not: 'plague.prevented' },
    text: 'A third tanner this month with the same fever and the same black spots behind the ears. All three draw water from the same well by the river.',
    roll: ['Trace it to the well and close it', 'insight', 40, 'You followed the fever from house to house to the tanners’ well and had it sealed, with a magistrate’s order you obtained by being unbearable. The summer came and went. Chengdu never learned what it had escaped.', { flag: 'plague.prevented', avert: 'shu_plague', careerUp: 6, fame: 5, gaze: 1, codex: 'secret.plague_cure' }, 'You treated the three tanners and missed the pattern. The fever spread to your own hands that summer.', { health: -10, careerUp: 1 }],
    more: [M('You know this fever', 'secret.plague_cure', O('You knew it at once. You boiled the well, brewed the willow-and-coptis cure in temple cauldrons, and gave it away. When summer came, Chengdu barely noticed.', { flag: 'plague.prevented', avert: 'shu_plague', achieve: 'plague_cure', fame: 10, gaze: 1 }))] },
  { key: 'fasting_monk', if: { age: [16, 80], loc: 'songshan' },
    text: 'A young Shaolin monk has stopped eating. He says he is practising. His abbot says he is grieving. He says nothing at all to you.',
    roll: ['Sit with him and talk about anything else', 'charm', 25, 'You talked about rice for an hour, and then about his mother, who died in the flood. He ate a bowl of congee and wept into it. The abbot sent you a sack of temple tea.', { careerUp: 3, sanity: 4, item: { tea_brick: 1 }, rep: { orthodox: 3 } }, 'He listened politely and ate nothing. He recovered in the end, on his own, and you learned that some illnesses are not yours to cure.', { insight: 1 }],
    more: [C('Prescribe a bitter tonic', O('He drank the tonic because it was bitter. Monks like that. He started eating again a month later, and thanked the tonic.', { wealth: 3, careerUp: 2 }))] },
  { key: 'lovesick_heir', if: { age: [16, 80], locType: 'estate' },
    text: 'A young lord of the house is wasting away. The steward wants a medicine. The young lord wants a girl in the kitchens. The steward does not want you to know that.',
    roll: ['Diagnose him honestly', 'insight', 20, 'You prescribed "fresh air in the kitchen garden, daily." The steward glared. The young lord recovered remarkably fast.', { careerUp: 2, wealth: 6, charm: 1 }, 'You prescribed fresh air. The steward understood exactly what you meant and paid you to leave.', { wealth: 4 }],
    more: [C('Sell the steward a sleeping draught', O('The young lord slept for a month and woke up still in love. The steward paid well.', { wealth: 14, sanity: -2 }))] },
], (r) => E('wk_patient', 'daily', {
  on: 'work', art: r.art || null, title: r.title,
  if: { career: 'physician', ...r.if }, text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// A smith's commissions.
const tplCommission = template('wk_commission', [
  { key: 'plum_swords', if: { region: 'guanzhong' },
    text: 'Mount Hua orders twenty practice swords. The steward who brings the order explains, with great dignity, that the sect will pay after the harvest. Whose harvest is unclear.',
    roll: ['Forge them well and give credit', 'body', 18, 'The swords rang true. The sect paid, eventually, in plum wine and gratitude, and a Mount Hua elder now nods to you in the street.', { careerUp: 3, rep: { orthodox: 5 }, item: { rice_wine: 1 } }, 'Three blades bent in testing. The steward was very polite about it.', { rep: { orthodox: 1 }, sanity: -2 }],
    more: [C('Demand payment in advance', O('The steward went red and paid in old coins from a cloth purse. Mount Hua orders from someone else now.', { wealth: 10, rep: { orthodox: -3 } }))] },
  { key: 'paeng_saber', if: { region: 'hebei' },
    text: 'Paeng Gu, of the Paeng family, wants a saber "twice as heavy as sensible." He is not joking. He is never joking about sabers.',
    roll: ['Forge the monster', 'body', 32, 'It took two men to lift it out of the quench. Paeng Gu swung it one-handed, laughed until he cried, and bought you dinner for a week.', { wealth: 30, careerUp: 5, meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 15 } } }, 'The blade cracked in the quench. Paeng Gu took it anyway, as a club.', { wealth: 8, meet: '@paeng_gu', body: 1 }],
    more: [C('Forge him a sensible saber and lie about the weight', O('He noticed in one swing. He was so delighted to be lied to by a smith that he paid double and told the story at every feast.', { wealth: 18, meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 8, res: 5 } } }))] },
  { key: 'shaolin_ferrules', if: { region: 'central' },
    text: 'A Shaolin monk wants iron caps for forty staves. He offers payment in tea and a blessing. He is very clear that the blessing is the valuable part.',
    roll: ['Fit them perfectly', 'insight', 22, 'Forty staves, forty caps, not one loose. The monk tapped each one and listened. "Good," he said. You felt blessed, against your will.', { careerUp: 3, item: { tea_brick: 2 }, rep: { orthodox: 3 }, sanity: 3 }, 'Several caps rattled. The monk said nothing, which from a Shaolin monk is a sermon.', { sanity: -1 }],
    more: [C('Ask for coin instead of the blessing', O('He paid in coin, with a small sigh that followed you around for a month.', { wealth: 8, sanity: -2 }))] },
  { key: 'dang_needles', if: { region: 'shu' },
    text: 'A Dang Clan steward orders a thousand needles with hollow cores, finer than hair, and asks you to forget the order once it is done.',
    roll: ['Forge them', 'insight', 30, 'You did the finest work of your life on a thing you did not want to think about. The Dang paid in gold and in a kind of respect that frightened you.', { wealth: 35, careerUp: 5, rep: { families: 5 }, infamy: 1 }, 'The cores collapsed. The steward collected the failed needles carefully, every one, and left without a word.', { rep: { families: -2 }, sanity: -3 }],
    more: [C('Refuse', O('You refused. The steward smiled. "Of course," he said. Your forge was unusually quiet for a season afterwards.', { rep: { families: -3 }, sanity: 2 }))] },
  { key: 'bandit_sabers', if: { region: ['hebei', 'guanzhong', 'central'], age: [16, 70] },
    text: 'Three hard men order thirty sabers and pay half in advance, in silver that still has a merchant’s seal on it.',
    roll: ['Forge them brittle on purpose', 'insight', 30, 'You forged sabers that would snap on the third good blow. Months later you heard a bandit raid had broken on a village militia armed with hoes. You did not tell anyone why.', { careerUp: 3, wealth: 15, fame: 1, sanity: 3 }, 'They tested a blade on your anvil and it snapped. They did not kill you. They did take everything in the forge.', { wealth: -20, health: -10 }],
    more: [
      C('Forge them well and take the money', O('Thirty good sabers. Thirty taels. You do not ask what they did with them, and you do not sleep well.', { wealth: 30, infamy: 3, rep: { unorthodox: 5 }, sanity: -4 })),
      C('Refuse and return the silver', O('You returned the silver. One of them looked at your hammer and decided not to argue. They will find another smith.', { rep: { unorthodox: -2 } })),
    ] },
  { key: 'plough', if: { locType: 'village' },
    text: 'Old Hwang wants a plough blade. He has been bringing you the same broken blade every spring for six years, and every spring he says this is the last time.',
    roll: ['Forge him a blade that will outlive him', 'body', 15, 'You forged it thick and true. Old Hwang said it was too good and that you were robbing yourself. He paid in eggs, all spring.', { careerUp: 2, sanity: 4, health: 3 }, 'You were tired, and it showed. He was back by summer.', { careerUp: 1 }],
    more: [C('Patch the old one again', O('You patched it again. He was delighted. Six years is a tradition.', { wealth: 1, charm: 1 }))] },
  { key: 'wedding_knife', if: { region: 'jiangnan' },
    text: 'A silk merchant wants a ceremonial knife for his daughter’s wedding: silver inlay, two cranes, and the bride’s name in the blade. He wants it in ten days.',
    roll: ['Work through the nights', 'insight', 28, 'Two cranes, flying so lightly they looked about to leave the steel. The bride cried when she saw it. The merchant ordered three more for his other daughters, who are not yet engaged.', { wealth: 25, careerUp: 4, fame: 1 }, 'The inlay lifted on the ninth night. You delivered it late and he paid half.', { wealth: 6, health: -4 }],
    more: [C('Tell him it takes a month', O('He found another smith, who delivered a knife on the tenth day with ducks on it. The merchant has since apologised.', { charm: 1 }))] },
  { key: 'depot_shackles', if: { loc: 'capital' },
    text: 'The Eastern Depot orders two hundred sets of shackles, light enough to carry and strong enough to hold a martial artist’s wrists.',
    roll: ['Forge them, and leave a flaw only you know', 'insight', 38, 'Two hundred sets of shackles, and in every one a rivet that gives if struck just so. You told the Beggars’ Sect where. Some nights you hear stories of escapes and pretend not to listen.', { wealth: 20, careerUp: 4, rep: { orthodox: 5 }, flag: 'wk.smith.flawed_shackles' }, 'A Depot inspector found the flaw in the first set. You spent a very long night explaining it as an accident.', { rep: { court: -8 }, health: -10, flag: 'wk.depot.watch' }],
    more: [
      C('Forge them properly', O('They paid promptly and well. The Depot always pays promptly. That is the frightening part.', { wealth: 30, rep: { court: 6, orthodox: -3 }, sanity: -3 })),
      C('Decline the order', O('You declined, citing a bad back. The officer wrote something down.', { rep: { court: -3 }, flag: 'wk.depot.watch' })),
    ] },
  { key: 'kunlun_crampons', if: { region: 'west' },
    text: 'Pilgrims to the Kunlun glaciers want iron crampons. The Kunlun disciples who guide them want something lighter, and will not explain why.',
    roll: ['Forge them in the cold, with snow-melt', 'body', 28, 'You quenched them in snow-melt at dawn. They were the lightest crampons ever made at the Pass, and a Kunlun disciple showed you, wordlessly, how the cold changes a quench.', { careerUp: 4, wealth: 12, codex: TEMPER }, 'The cold cracked half the batch. The pilgrims went up the glacier in straw sandals and came back very quiet.', { wealth: -4, health: -5 }],
    more: [C('Forge the heavy ones the pilgrims asked for', O('Heavy crampons, honestly made. The pilgrims were grateful. The Kunlun disciples sighed.', { wealth: 8 }))] },
  { key: 'drunk_sword', if: { age: [20, 80], stat: { body: '>=40' }, alive: 'sword_saint' },
    text: 'A drunk old man drops a battered sword on your anvil. "Sharpen it," he says, "but do not make it sharp." Then he falls asleep against your water barrel.',
    roll: ['Work out what he means', 'insight', 40, 'You sharpened only the last finger-width of the edge and left the rest like a bar of iron. He woke, tested it on a hair, and laughed. "A smith who listens," he said. "Rarer than a swordsman who does." He stayed a week and showed you how a sword should sing.', { careerUp: 6, insight: 4, meet: '@sword_saint', rel: { '@sword_saint': { res: 15, aff: 10 } } }, 'You made it sharp. He woke, looked at it, and sighed. "Everyone does," he said, and paid with a copper and a hiccup.', { meet: '@sword_saint', sanity: -1 }],
    more: [C('Wake him and ask for payment first', O('He opened one eye, looked at you for a long moment, and left with his sword. You had the oddest sense of a door closing.', { sanity: -1 }))] },
], (r) => E('wk_commission', 'daily', {
  on: 'work', art: 'forge', if: JOB('smith', r.if.age || [12, 70], r.if), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// A merchant's deals.
const tplDeal = template('wk_deal', [
  { key: 'silk_frost', if: { loc: 'hangzhou', season: [1, 2] },
    text: 'An old silk broker on West Lake swears there will be an early frost and the mulberry leaves will fail. Buy silk now, he says, and sell it in winter for double.',
    roll: ['Read the sky yourself', 'insight', 25, 'You watched the geese, the lake and the old broker’s hands, and bought. The frost came. You sold in winter at nearly double.', { wealth: 25, careerUp: 3 }, 'No frost. The silk sat in your storeroom all winter and the moths ate the profit.', { wealth: -12 }],
    more: [C('Buy a little, just in case', O('You bought a little. It turned out just in case was worth a little.', { wealth: 5 }))] },
  { key: 'tea_bricks', if: { loc: 'chengdu' },
    text: 'A Shu tea house is selling aged tea bricks cheap because the owner is moving to his son’s house in the capital and cannot carry them.',
    roll: ['Haggle', 'charm', 20, 'You haggled him down and then paid a little more than you had agreed, because you liked him. You walked away with three bricks and a good conscience.', { wealth: -6, item: { tea_brick: 3 }, careerUp: 2 }, 'He haggled you up. You paid full price and he threw in a cup of tea out of pity.', { wealth: -12, item: { tea_brick: 2 } }],
    more: [C('Buy the lot for the caravans', O('You bought the whole stock and sold it to a caravan bound for the frontier, where tea is worth its weight in silver. Almost.', { wealth: 12, careerUp: 3 }))] },
  { key: 'salt', if: { loc: 'capital', age: [18, 70] }, cat: 'crime',
    text: 'Salt is an imperial monopoly. A man in a grey robe offers you twenty sacks of untaxed salt at a fifth of the price, and a buyer in Hebei who asks no questions.',
    roll: ['Move it through the night markets', 'insight', 32, 'The salt went north in rice sacks under rice. You made a fortune and told nobody, which is the hardest part of making a fortune.', { wealth: 60, infamy: 3, careerUp: 4, rep: { court: -3, unorthodox: 3 } }, 'The Depot was waiting at the north gate. You paid a fine the size of the profit, and they kept the salt, and a note of your name.', { wealth: -40, rep: { court: -8 }, flag: 'wk.depot.watch' }],
    more: [C('Report him to the Salt Commission', O('The Salt Commission paid you a reward and arrested the wrong man. The man in the grey robe sent you a single grain of salt in an envelope.', { wealth: 10, rep: { court: 5, unorthodox: -5 } }))] },
  { key: 'horses', if: { loc: 'jadegate' },
    text: 'Horse traders from beyond the Pass, with steppe ponies and three tall western horses that could make your fortune in the capital. One of the tall ones stands a little oddly.',
    roll: ['Inspect the horses yourself', 'insight', 30, 'You found the bruise in the odd one’s hoof and bought the other two at its price, out of embarrassment on the trader’s part. They sold in Chang’an for a small fortune.', { wealth: 35, careerUp: 4 }, 'You bought all three. The odd one went lame at the first river. The other two paid for it, barely.', { wealth: 3 }],
    more: [C('Buy steppe ponies for the escort agencies', O('Ponies are ugly, cheap and unkillable. The escort agencies bought every one.', { wealth: 12, rep: { merchants: 3 } }))] },
  { key: 'ginseng', if: { region: 'liaodong' },
    text: 'A trapper in a fur hat unwraps a root in red silk. "Thousand-year spirit ginseng," he says. "Three hundred taels." It looks like a root. Most roots do.',
    roll: ['Examine it closely', 'insight', 45, 'The fine hairs, the rings, the smell of snow and earth: it was real. You paid what he asked, which was a quarter of what it was worth, and the trapper went home happy and drunk.', { wealth: -80, item: { spirit_ginseng: 1 }, careerUp: 5 }, 'It was a radish with ambitions, cleverly stained. You found out in Hangzhou.', { wealth: -80, sanity: -4 }],
    more: [C('Decline', O('You declined. You will wonder about that root for years.', { insight: 1 }))], req: { stat: { wealth: '>=80' } } },
  { key: 'ghost_market', if: { loc: 'kaifeng', age: [16, 70] },
    text: 'At midnight the canals of Kaifeng fill with lanterns: the Ghost Market. A masked stallholder offers you a lacquered box, contents unknown, for ten taels.',
    roll: ['Bargain like a ghost', 'charm', 30, 'You bargained in whispers and walked away with the box for six taels and a password the stallholder let slip. In the box: a real Qi-Gathering Pill, wrapped in a page from someone’s diary.', { wealth: -6, item: { qi_pill: 1 }, codex: GHOST_MARKET, careerUp: 2 }, 'The box held a dried frog and a note reading "Ha." You paid ten taels for it.', { wealth: -10 }],
    more: [
      C('Buy it at the asking price', P('Buy it at the asking price', 0.4, O('Inside, wrapped in oiled cloth: a pill that smelled of pine and lightning.', { wealth: -10, item: { qi_pill: 1 } }), O('A dried frog. A note reading "Ha."', { wealth: -10 }))),
      M('Say "The moon owes me money."', 'secret.wk_ghost_market', O('The mask tilted. A curtain at the back of the stall drew aside, and the real goods were brought out. You bought a Foundation-Settling Pill at a price that was almost honest.', { wealth: -40, item: { foundation_pill: 1 } })),
    ] },
  { key: 'drought_grain', if: { region: 'hebei', year: [46, 48] },
    text: 'After the drought in Hebei, grain prices are tripling by the week. You have a warehouse, a cart, and a contact in Kaifeng with millet to spare.',
    roll: ['Bring in rice and sell it at a fair price', 'charm', 25, 'You sold at a fair price and still made money, and the street remembers. When the famine ended, people crossed the city to buy from you.', { wealth: 20, fame: 4, careerUp: 4, rep: { merchants: 3 } }, 'Your carts were robbed by hungry men at the city gate. You did not have the heart to chase them.', { wealth: -15, sanity: 2 }],
    more: [C('Hold it until the price peaks', O('You held until the price peaked and made a fortune. The children on your street stopped saying good morning.', { wealth: 70, infamy: 4, sanity: -5 }))] },
  { key: 'cracked_porcelain', if: { loc: 'luoyang' },
    text: 'A shipment of Jingdezhen porcelain arrives with hairline cracks in a third of the bowls, invisible unless you hold them to the light. Your buyer is a nearsighted old official.',
    roll: ['Sell the good ones and mend the rest with gold', 'insight', 28, 'You mended the cracks with lacquer and gold dust and sold them as a new style. Within a year the mended bowls cost more than the whole ones.', { wealth: 25, careerUp: 4, fame: 1 }, 'The gold dust cost more than the bowls. You broke even, artistically.', { wealth: -3, charm: 1 }],
    more: [C('Sell them all as perfect', O('The official never noticed. His wife did. She now tells every household in Luoyang about you.', { wealth: 18, rep: { merchants: -4 }, infamy: 1 }))] },
  { key: 'winehouse', if: { loc: 'changan', not: 'wk.mer.winehouse' },
    text: 'The widow who owns the Drunken Crane wine-house in Chang’an needs a partner with silver. The wine is excellent. The books are a mess.',
    roll: ['Go through the books first', 'insight', 26, 'The books were a mess because the head waiter had been stealing for nine years. You sacked him, bought a third share, and the Drunken Crane began to turn a profit.', { wealth: -50, flag: 'wk.mer.winehouse', careerUp: 4 }, 'You found nothing and bought in. The head waiter kept stealing.', { wealth: -50, flag: ['wk.mer.winehouse', 'wk.mer.thief'] }],
    more: [C('Walk away', O('You walked away. The Drunken Crane still serves the best wine in Chang’an. You drink there sometimes, and pay full price.', {}))], req: { stat: { wealth: '>=50' } } },
  { key: 'protection', if: { loc: ['dongting', 'wuchang'], age: [16, 70] },
    text: 'A Water Fortress clerk with very good handwriting offers your barges a protection contract: one tenth of every cargo, and no barge of yours will ever sink.',
    roll: ['Negotiate it down', 'charm', 32, 'You got it down to one twentieth and a written guarantee. The clerk admired your nerve. Your barges have not sunk since.', { wealth: 10, careerUp: 3, rep: { unorthodox: 4 } }, 'The clerk listened, smiled, and raised it to one eighth.', { wealth: -10, rep: { unorthodox: 2 } }],
    more: [C('Refuse', P('Refuse', 0.5, O('You refused. For some reason your barges were left alone. Perhaps the Water Fortress has bigger fish.', { fame: 1 }), O('A barge sank that autumn, in calm water, with no one aboard.', { wealth: -30 })))] },
], (r) => E('wk_deal', r.cat || 'daily', {
  on: 'work', art: 'market', if: JOB('merchant', r.if.age || [14, 70], r.if), text: r.text,
  choices: [r.req ? { ...ROLL(r.roll), req: r.req } : ROLL(r.roll), ...r.more],
}));

// A farmer's seasons.
const tplField = template('wk_field', [
  { key: 'late_rain', if: { season: 0 },
    text: 'The spring rains are late. The seedlings in the nursery bed are yellowing, and the old men of the village are arguing about which god to bribe.',
    roll: ['Dig a channel from the stream yourself', 'body', 18, 'You dug for nine days. The water came down your channel on the tenth, and half the village came to look at it as if it were a miracle. It was a ditch. It was a very good ditch.', { careerUp: 3, body: 1, fame: 1 }, 'The stream was lower than the field. You had dug a long, sad trench.', { health: -4 }],
    more: [C('Bribe the god', O('You left a jar of rice wine at the shrine. The rain came three days later. You will never know, and you leave a jar every spring now.', { wealth: -2, sanity: 2 }))] },
  { key: 'drought', if: { season: 1, region: ['hebei', 'central', 'guanzhong'] },
    text: 'No rain since spring. The canal is a crack in the earth, and the well rope comes up shorter every week.',
    roll: ['Deepen the well', 'body', 26, 'You went down the well with a lamp and a spade and came up three days later with mud to the eyebrows and water behind you. The neighbours drew from it all summer.', { careerUp: 4, body: 2, fame: 2 }, 'The well wall caved. They pulled you out by the ankles.', { health: -12 }],
    more: [C('Plant millet instead of rice', O('Millet is a poor man’s grain, but it lived. You ate it all winter and dreamed of rice.', { wealth: 1, insight: 1 }))] },
  { key: 'bumper', if: { season: 2 },
    text: 'The best harvest in ten years. Every barn in the district is full, which means that the price of grain at market is about to collapse.',
    roll: ['Sell early, before the others', 'insight', 20, 'You were at market before dawn with the first carts. You sold at a good price and passed the other farmers coming the other way.', { wealth: 8, careerUp: 2 }, 'Everyone had the same idea. You sold for almost nothing.', { wealth: 1 }],
    more: [C('Store it and wait for spring', O('You stored it. By spring the price had doubled, and the rats had taken their tenth.', { wealth: 6 }))] },
  { key: 'winter_roof', if: { season: 3 },
    text: 'Snow on the roof, and the roof does not love it. Next door, the widow Bang’s roof has already given in at one corner.',
    roll: ['Fix both roofs before the next snow', 'body', 22, 'Two roofs in one day, on frozen fingers. The widow Bang fed you dumplings until you could not move. Her son began calling you uncle, or aunt, which was unexpected.', { careerUp: 2, sanity: 5, charm: 1 }, 'You fell off the widow’s roof into a snowdrift. She laughed until she cried, and fixed it herself.', { health: -5, sanity: 2 }],
    more: [C('Fix your own and lend her a ladder', O('You lent her the ladder. She fixed her own roof, and returned the ladder with a look.', { charm: -1 }))] },
  { key: 'boar', if: { season: [1, 2], region: ['shu', 'guanzhong', 'jingchu'] }, danger: true,
    text: 'A wild boar the size of a calf has been tearing up the sweet potato field every night. Tonight you are waiting for it with a pitchfork and poor judgement.',
    roll: ['Scare it off with fire and noise', 'charm', 15, 'You banged pots and waved torches until it left in disgust. It went to the neighbour’s field, which is technically a success.', { careerUp: 1 }, 'It was not impressed by pots.', { health: -6 }],
    more: [C('Face it', O('It came out of the dark like a boulder with opinions.', { combat: { foe: { name: 'the wild boar', kind: 'beast', realm: 1 }, context: 'beast', lethal: 0.15,
      win: { text: 'The village ate pork for a week and called you a hero. The sweet potatoes were saved, mostly.', fame: 2, body: 1, health: 3 },
      lose: { text: 'It tossed you into the irrigation ditch and went back to the sweet potatoes.', health: -10 } } }))] },
  { key: 'hail', if: { season: 1, region: ['guanzhong', 'west'] },
    text: 'Hail, out of a green summer sky, in stones the size of quail eggs. In a quarter of an hour the wheat is flattened.',
    roll: ['Gather the village to save what can be saved', 'charm', 22, 'You organised the whole village to cut what was still standing and dry it in the temple. You saved a third. People listen to you now, which you had not wanted.', { careerUp: 3, fame: 2 }, 'You saved a little. The landlord took his share of the little.', { wealth: -2, sanity: -3 }],
    more: [C('Sit on the step and laugh', O('You sat on the step and laughed, because the alternative was worse. A neighbour sat down and laughed with you.', { sanity: 3, wealth: -3 }))] },
  { key: 'crooked_bushel', if: { season: 2, region: ['jiangnan', 'jingchu'] },
    text: 'The tax collector measures your rice with a bushel that is quite clearly larger than the bushel in the county office. He is not even embarrassed.',
    roll: ['Bring the county bushel and measure in public', 'insight', 22, 'You borrowed the county bushel from a clerk who owed you a favour and measured in front of the whole village. The tax collector paid back the difference, and remembered your face.', { wealth: 4, careerUp: 2, fame: 1, rep: { court: -2 } }, 'The clerk who owed you a favour had forgotten it. You paid the big bushel.', { wealth: -4 }],
    more: [C('Pay and say nothing', O('You paid. Everyone pays. That is how bushels grow.', { wealth: -3, sanity: -1 }))] },
  { key: 'silkworms', if: { season: 0, region: 'jiangnan' },
    text: 'Your wife’s cousin, or someone’s cousin, says you could raise silkworms on the side. All you need is a mulberry tree, a dark room, and no sleep for a month.',
    roll: ['Try it', 'insight', 24, 'The worms ate, slept, spun and made you money. Your house smells of mulberry leaves forever now.', { wealth: 12, careerUp: 2 }, 'The worms caught a chill and died, all at once, like a tragedy in a play.', { wealth: -4, sanity: -2 }],
    more: [C('Stick to rice', O('Rice does not need to be talked to at night. You stuck to rice.', { sanity: 1 }))] },
], (r) => E('wk_field', 'daily', {
  on: 'work', danger: !!r.danger, art: r.art || 'garden', if: JOB('farmer', [10, 80], r.if), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// A bandit's jobs.
const tplHeist = template('wk_job', [
  { key: 'salt_carts', if: { region: 'hebei' },
    text: 'Salt carts on the Hebei road with only two old guards. Your captain sends you to bring them in quietly.',
    roll: ['Bluff the guards into running', 'charm', 20, 'You told the guards there were fifty of you in the trees. There were four. They ran. The salt fed the stronghold for a month.', { wealth: 8, careerUp: 3, rep: { unorthodox: 3 } }, 'The old guards did not believe you. One of them broke your nose with a cart-pole.', { health: -8 }],
    more: [C('Let the old men keep their salt', O('You let them pass and told your captain the carts were empty. He knew you were lying. He let it go, this time.', { sanity: 3, rep: { unorthodox: -2 } }))] },
  { key: 'pilgrims', if: { region: 'central' },
    text: 'A party of pilgrims on the road to Shaolin, carrying a donation box for the temple. Your captain says monks have no use for silver.',
    roll: ['Rob them without hurting anyone', 'body', 18, 'You took the box. Nobody was hurt. An old pilgrim blessed you as you left, and that was the part you could not shake.', { wealth: 10, infamy: 2, careerUp: 2, rep: { orthodox: -5 }, sanity: -3 }, 'A pilgrim turned out to be a Shaolin lay disciple. He sat on you until the constables arrived, and you bribed your way out.', { wealth: -10, health: -5, rep: { orthodox: -3 } }],
    more: [C('Escort them to the temple instead', O('You walked them to Shaolin and told the gatekeeper they had been in danger on the road. The monk looked at your saber and said, "Yes. They were."', { rep: { orthodox: 3, unorthodox: -3 }, sanity: 3 }))] },
  { key: 'tax_convoy', if: { region: 'guanzhong', age: [16, 60] }, danger: true,
    text: 'An imperial tax convoy, eight carts and twenty soldiers. Your captain has a plan involving a landslide. Plans involving landslides never go to plan.',
    roll: ['Cut the rope at the right moment', 'insight', 30, 'The rocks came down between the soldiers and the last two carts. You were gone before the dust settled. The Green Forest will drink to this for years.', { wealth: 30, infamy: 4, careerUp: 5, rep: { unorthodox: 6, court: -8 } }, 'You cut too early and buried the road in front of the convoy. The soldiers came up the hill.', { health: -12, infamy: 1 }],
    more: [C('Fight the rearguard', O('You came down the hill with a saber and a scream.', { combat: { foe: { name: 'an imperial sergeant', kind: 'soldier', rel: 0.5 }, context: 'war', lethal: 0.3,
      win: { text: 'The rearguard broke. You came back to the stronghold with a cart of silver and a sergeant’s helmet.', wealth: 25, infamy: 4, careerUp: 4, rep: { court: -10 } },
      lose: { text: 'You crawled back to the stronghold with a spear wound and no silver.', health: -10, injury: { name: 'spear wound', seasons: 3, sev: 6 } } } }))] },
  { key: 'bridal_procession', if: { region: 'jiangnan' },
    text: 'A bridal procession on the road: red palanquin, drums, a nervous groom’s family. Your captain wants the dowry, and possibly the bride, for ransom.',
    roll: ['Take only the dowry, fast', 'body', 22, 'You took the dowry chest and left the bride, the drums and the groom’s dignity. The wedding went ahead. You hope it was a happy one, which is an odd thing for a bandit to hope.', { wealth: 18, infamy: 2, careerUp: 3, sanity: -2 }, 'The groom’s uncles had swords under their robes. You ran.', { health: -6, infamy: 1 }],
    more: [C('Toss a copper for luck and let them pass', O('You let them pass and tossed the bride a copper for luck. She caught it and threw back a sweet. Your captain called you soft. He ate the sweet.', { sanity: 4, rep: { unorthodox: -1 } }))] },
  { key: 'rival_stronghold', if: { loc: 'taihang' },
    text: 'The Black Wind stronghold has been raiding on your stronghold’s road. Your captain wants their champion beaten in front of both camps, the old way.',
    roll: ['Out-drink their champion instead', 'health', 50, 'You drank their champion under the table, then under the floor. Both camps agreed that this counted. The road was yours.', { careerUp: 4, fame: 2, rep: { unorthodox: 5 }, health: -5 }, 'You lost the drinking contest and most of the following day.', { health: -8, sanity: -2 }],
    more: [C('Fight him, the old way', O('Two camps formed a ring and started betting.', { combat: { foe: { name: 'the Black Wind champion', kind: 'bandit', rel: 0.5 }, context: 'duel', lethal: 0.1,
      win: { text: 'You knocked him out of the ring. His own camp cheered you, which is how bandits are.', careerUp: 5, fame: 3, rep: { unorthodox: 8 } },
      lose: { text: 'He knocked you out of the ring. Your captain paid the bet and did not speak to you for a month.', health: -6, rep: { unorthodox: -3 } } } }))] },
  { key: 'protection_village', if: { locType: 'village' },
    text: 'Your captain sends you to collect "protection" from a village of forty roofs. The headman meets you with an empty purse and a full speech.',
    roll: ['Squeeze them', 'body', 15, 'You squeezed. The village paid. You walked out under forty silent roofs.', { wealth: 6, infamy: 3, careerUp: 2, sanity: -3 }, 'The village had hired a wandering swordsman. He was not impressed.', { health: -8 }],
    more: [C('Tell your captain the village is already ruined', O('You lied for the village. The headman never knew. Your captain suspected, and gave you the worst watch for a month.', { sanity: 4, rep: { unorthodox: -2 }, fame: 1 }))] },
  { key: 'poor_scholar', if: { age: [14, 60] },
    text: 'A thin scholar on the road to the examinations, with a bundle of books and a single string of coppers. He offers you the coppers before you ask.',
    roll: ['Take a book instead', 'insight', 15, 'You took a commentary on the Analects. You read it by the campfire all winter. It is the best thing you have ever stolen.', { insight: 3, careerUp: 1 }, 'You took a book. It was a rhyming dictionary. You read it anyway.', { insight: 1 }],
    more: [C('Give him a string of coppers', O('You gave him your own coppers for the road. He looked at you as if you were a ghost. If he passes, somewhere there is a magistrate who will hesitate before hanging a bandit.', { wealth: -2, sanity: 5, flag: 'wk.ban.scholar' }))] },
  { key: 'escort_agency', if: { region: 'central', age: [16, 60] },
    text: 'A Dragon-Tiger Escort Agency caravan under the agency flag. Bandits do not usually touch that flag. Your captain is unusual.',
    roll: ['Sneak in at night and cut the strongbox loose', 'body', 32, 'You got the strongbox off a cart and into the trees without waking a soul. The agency chief, they say, has sworn to find you personally.', { wealth: 25, infamy: 3, careerUp: 4, rep: { merchants: -8 } }, 'You woke a soul. It was Kang Tae-o, and he had a spear.', { health: -10, meet: '@taeo', rel: { '@taeo': { aff: -10 } } }],
    more: [C('Negotiate a road toll with the agency', O('You walked up to the caravan with your hands open and negotiated a toll. Bandits and escorts have been doing this for a thousand years. Everybody went home.', { wealth: 6, rep: { merchants: 2, unorthodox: 2 }, careerUp: 2 }))] },
], (r) => E('wk_job', 'crime', {
  on: 'work', danger: !!r.danger, art: r.art || 'road', if: JOB('bandit', r.if.age || [14, 60], r.if), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// An assassin's contracts.
const tplContract = template('wk_contract', [
  { key: 'magistrate', if: { locType: 'city' },
    text: 'The contract: a magistrate who hangs the poor and dines with the rich. Whoever paid for it was poor, and saved for a long time. The coins are mostly copper.',
    roll: ['Poison his evening wine', 'insight', 28, 'He died at dinner, in front of the rich men he dined with. The poor of the district lit incense, and nobody asked why.', { wealth: 10, infamy: 2, careerUp: 4, sanity: -2 }, 'His food taster died instead. The magistrate doubled his guards and hanged three innocent men for it.', { sanity: -10, infamy: 2 }],
    more: [C('Collect evidence and send it to the censor instead', O('You sent the evidence to the Imperial Censor. Nothing happened for a year. Then the magistrate was quietly removed. The Pavilion was not pleased with you.', { rep: { court: 2, unorthodox: -4 }, sanity: 4 }))] },
  { key: 'rival_merchant', if: { loc: 'hangzhou' },
    text: 'A silk merchant wants his rival dead before the spring auctions. The rival is a fat, cheerful man who feeds the stray cats of his street every morning.',
    roll: ['Make it look like a fall', 'body', 26, 'He fell down his own stairs. The cats waited on his step for a week.', { wealth: 25, infamy: 3, careerUp: 4, sanity: -6 }, 'He saw you on the stairs and screamed. You fled over the rooftops, and the contract was cancelled with a fine.', { wealth: -10 }],
    more: [C('Warn him, then report the contract as failed', O('You told him to leave Hangzhou for a season. He took his cats. The Pavilion docked your pay and watched you more carefully.', { wealth: -5, sanity: 5, rep: { unorthodox: -3 } }))] },
  { key: 'depot_officer', if: { loc: 'capital', age: [18, 60] }, danger: true,
    text: 'A Depot officer who tortures prisoners for pleasure. The contract comes from three families at once. He is a Second-Rate expert and never sleeps in the same house twice.',
    roll: ['Learn his habits for a season', 'insight', 38, 'He never slept in the same house twice, but he always visited the same bathhouse. You were the steam. Three families paid in full.', { wealth: 50, infamy: 4, careerUp: 6, rep: { court: -6 } }, 'He noticed he was being watched. Depot men turned three streets inside out looking for you.', { flag: 'wk.depot.watch', sanity: -4 }],
    more: [C('Take him in the street', O('You stepped out of an alley as he passed.', { combat: { foe: { name: 'the Depot officer', kind: 'soldier', realm: 2 }, context: 'assassination', lethal: 0.35,
      win: { text: 'He fell in the street. You were over the wall before his men turned around.', wealth: 50, infamy: 5, careerUp: 6, rep: { court: -10 } },
      lose: { text: 'He was better than the contract said. You escaped across the roofs, bleeding, with Depot whistles behind you.', health: -12, flag: 'wk.depot.watch' } } }))] },
  { key: 'sect_elder', if: { locType: 'sect', age: [18, 60], stat: { body: '>=26' } }, danger: true,
    text: 'The target is a sect elder who, it is said, has a habit of ruining young disciples. The client is one of them, now grown, with a crippled hand.',
    roll: ['Lace his incense', 'insight', 35, 'He died meditating, which his sect announced as a glorious passing. Only the client knew. The client wept, and paid, and could not look at you.', { wealth: 40, infamy: 3, careerUp: 5, rep: { orthodox: -4 } }, 'He smelled it. Elders always smell it. You left the mountain with a sect hunting party behind you.', { rep: { orthodox: -8 }, health: -6 }],
    more: [C('Challenge him openly', O('You waited for him on the mountain path, unmasked.', { combat: { foe: { name: 'the elder', kind: 'disciple', rel: 1 }, context: 'duel', lethal: 0.3,
      win: { text: 'He fell on the path he had walked for forty years. The sect called it a duel, and could not call it anything else.', fame: 3, infamy: 2, careerUp: 4, wealth: 30 },
      lose: { text: 'He beat you and let you go, which was contempt, not mercy.', health: -15, sanity: -4 } } }))] },
  { key: 'husband', if: { age: [16, 60] },
    text: 'A woman with bruised wrists wants her husband dead. She has his money, and twelve years of reasons, and two children asleep in the next room.',
    roll: ['Make it look like a heart failure', 'insight', 25, 'His heart failed at the gambling table. The widow paid you with a hand that did not shake.', { wealth: 15, infamy: 2, careerUp: 3, sanity: -2 }, 'The poison was weak. He was ill for a month, recovered, and began to suspect.', { sanity: -5 }],
    more: [C('Frighten him instead', O('You visited him at night with a knife and a long talk. He left town the next morning and never came back. It does not count as a contract. It counts.', { sanity: 4, rep: { unorthodox: -2 }, wealth: 5 }))] },
  { key: 'old_general', if: { loc: 'changan' },
    text: 'An old general in Chang’an, harmless now, who once burned a village on the frontier. The client was a child in that village.',
    roll: ['Do it while he sleeps', 'body', 22, 'It was easy. He was old. On his desk was a letter he had been writing for twenty years, to the village. You did not read it. You wish you had.', { wealth: 20, infamy: 2, careerUp: 3, sanity: -6 }, 'He was awake, sitting in the dark, waiting. "I wondered when one of you would come," he said. You could not do it.', { sanity: -3 }],
    more: [C('Bring the client to face him instead', O('You brought the client to his door. They talked all night. Nobody died. The Pavilion called it a failed contract, and you did not argue.', { sanity: 6, rep: { unorthodox: -3 } }))] },
  { key: 'poisoner', if: { region: 'shu', age: [18, 60] },
    text: 'The target is a poisoner who sells to anyone, and has killed more people than plague. The Dang Clan wants him gone, quietly, because he was one of theirs.',
    roll: ['Poison the poisoner', 'insight', 40, 'You poisoned a poisoner, which they will be talking about in the Pavilion for years. The Dang paid in gold and in a nod from the matriarch’s steward.', { wealth: 45, infamy: 2, careerUp: 6, rep: { families: 6 } }, 'He tasted it at once, laughed, and threw a needle at you. You were sick for a season.', { health: -15 }],
    more: [C('Refuse; the Dang can clean their own house', O('The Dang were not pleased. The poisoner was found dead a month later anyway. The Dang clean their own house.', { rep: { families: -3 } }))] },
  { key: 'gambler', if: { loc: 'kaifeng' },
    text: 'A gambling-house owner wants a debtor killed as an example. The debtor is nineteen and owes forty taels.',
    roll: ['Get him out of the city and report it done', 'insight', 24, 'You put him on a grain barge to his mother’s village with a fake scar on his neck for the owner to hear about. The owner was satisfied. So, one hopes, was his mother.', { sanity: 6, careerUp: 2 }, 'The owner’s men saw him at the docks. They came to ask you about it, with sticks.', { health: -8, wealth: -10, rep: { unorthodox: -3 } }],
    more: [C('Do the job', O('An example was made. Kaifeng’s gamblers paid their debts that season. You do not remember his face, and you are trying very hard not to.', { wealth: 12, infamy: 3, careerUp: 3, sanity: -8 }))] },
  { key: 'bandit_chief', if: { region: ['hebei', 'guanzhong'], age: [18, 60] },
    text: 'A bounty from three villages: a bandit chief who burns houses with people inside. For once, nobody will mind.',
    roll: ['Find his camp and wait', 'body', 30, 'You waited three days on a cold ridge. On the fourth night he came out to relieve himself. The villages held a feast, and could not say why they were celebrating.', { wealth: 20, fame: 3, careerUp: 4, rep: { unorthodox: -3 } }, 'He moved camp. You spent a season chasing smoke.', { health: -5 }],
    more: [C('Sell his location to the magistrate', O('The magistrate sent soldiers. They got him, and the reward, and the credit. You got a cut.', { wealth: 10, rep: { court: 4 } }))] },
  { key: 'young_heir', if: { locType: 'estate', age: [18, 60] },
    text: 'A Family elder wants his nephew dead, to settle an inheritance. The nephew is fourteen, practises his sword alone at dawn, and is not very good.',
    roll: ['Report the elder to the boy’s mother', 'charm', 30, 'The mother listened, went very pale, and thanked you. The elder fell ill that winter. Families settle their own inheritances.', { rep: { families: 3, unorthodox: -4 }, sanity: 5 }, 'She did not believe you. She sent guards to arrest you instead.', { health: -8, rep: { families: -4 } }],
    more: [C('Do it', O('It was done. The elder inherited. The boy’s sword is in a lacquered case in the family hall, and you see it in your dreams.', { wealth: 60, infamy: 5, careerUp: 5, sanity: -15, burden: 1 }))] },
], (r) => E('wk_contract', 'crime', {
  on: 'work', danger: !!r.danger, art: r.art || 'night', if: JOB('assassin', r.if.age || [15, 60], r.if), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// An information broker's rumours, by city.
const tplRumor = template('wk_rumor', [
  { key: 'luoyang', loc: 'luoyang', stat: 'charm', dc: 20,
    text: 'A drunk Alliance clerk in a Luoyang wine-house says the Alliance Leader keeps a second set of accounts.',
    ok: 'You bought him more wine and learned where the accounts are kept. You sold the knowledge to the Beggars’ Sect, who already knew, and paid anyway, to see what you would do.', okfx: { wealth: 12, careerUp: 3, rep: { orthodox: 2 } },
    no: 'He sobered up mid-sentence and left. The next day an Alliance man asked you about your health.', nofx: { sanity: -3 },
    alt: ['Sell it to the Alliance Leader’s rivals', 'The Zhongnan elders paid well and asked you to keep listening. You are now, it seems, a spy.', { wealth: 20, careerUp: 3, flag: 'wk.inf.zhongnan' }] },
  { key: 'kaifeng', loc: 'kaifeng', stat: 'insight', dc: 26,
    text: 'Three different men in Kaifeng have asked you this month who sells the best lime powder. Something is going to happen at the gambling houses.',
    ok: 'You worked out which house, and which night, and sold the warning to the house’s owner. The robbers walked into a room full of dice and guards.', okfx: { wealth: 15, careerUp: 3, rep: { unorthodox: -2, merchants: 3 } },
    no: 'You guessed the wrong house. The right one was robbed, and its owner wants to know why you were asking questions.', nofx: { health: -6 },
    alt: ['Sell the robbers the guard rota instead', 'You sold the robbers the guard rota. The robbery went beautifully. You are not proud, but you are paid.', { wealth: 20, infamy: 2, rep: { unorthodox: 3 } }] },
  { key: 'capital', loc: 'capital', stat: 'charm', dc: 30,
    text: 'A palace maid buys you tea and says the boy Emperor has been asking questions about the Eastern Depot that the Depot does not like.',
    ok: 'You listened, and the maid kept talking. It seems the boy Emperor has a friend among the Imperial Guard: Commander Han Gyeong. You keep that one to yourself.', okfx: { careerUp: 4, insight: 2, codex: { id: 'secret.wk_emperor_guard', cat: 'secrets', title: 'The boy Emperor’s friend', text: 'The boy Emperor trusts Commander Han Gyeong of the Imperial Guard, and asks him about the Eastern Depot in secret. The Director does not yet know.' } },
    no: 'The maid was a Depot plant. She asked you more than you asked her.', nofx: { flag: 'wk.depot.watch', sanity: -3 },
    alt: ['Sell what she said to the Depot', 'The Depot paid generously. The maid was not seen again. You are not proud of this one.', { wealth: 30, rep: { court: 6 }, sanity: -8 }] },
  { key: 'hangzhou', loc: 'hangzhou', stat: 'insight', dc: 24,
    text: 'The Golden Abacus Guild is quietly buying debts in Hangzhou: rice merchants, silk houses, small families. Somebody is about to be ruined on purpose.',
    ok: 'You traced the debts to one house and sold the warning to the family. They paid off the debts in time. Geum Man-bok noticed, and sent you a polite invitation you would rather not have received.', okfx: { wealth: 15, careerUp: 4, rep: { merchants: -3 }, meet: '@merchant_king' },
    no: 'Too many debts, too many names. You learned nothing you could sell.', nofx: { insight: 1 },
    alt: ['Sell your findings to the guild itself', 'The guild paid you to know what you know and say nothing. It was the easiest money of your life, and the dirtiest.', { wealth: 25, rep: { merchants: 5 }, sanity: -3 }] },
  { key: 'chengdu', loc: 'chengdu', stat: 'charm', dc: 26,
    text: 'A Dang servant on her day off in Chengdu says the matriarch’s second son orders very particular teas from very particular suppliers.',
    ok: 'You bought her dumplings and listened. The second son, Dang Gwang, has been buying poisons the family does not make. You sold the hint to a Dang elder, who went white.', okfx: { wealth: 18, careerUp: 4, rep: { families: 3 }, codex: { id: 'secret.wk_dang_tea', cat: 'secrets', title: 'Dang Gwang’s teas', text: 'Dang Gwang, the Dang matriarch’s second son, buys foreign poisons from a herbalist on Brocade Street in Chengdu, years before the civil war.' } },
    no: 'She realised what she was saying and went quiet. On the way home, someone followed you for a long time.', nofx: { sanity: -4 },
    alt: ['Sell it to Dang Gwang himself', 'He paid you in gold and a cup of tea, which you did not drink. He asked you to name your other buyers. You named nobody, and he smiled.', { wealth: 30, rep: { families: -2 }, infamy: 2 }] },
  { key: 'changan', loc: 'changan', stat: 'insight', dc: 22,
    text: 'An old woman sells you something odd in a Chang’an alley: there is a young lady from a ruined family here who keeps asking about events that have not happened yet.',
    ok: 'You asked around. The girl is called Yu Seol-hwa, and she writes everything she hears in a little book. When she saw you watching her, she looked frightened, and then curious.', okfx: { careerUp: 3, insight: 2, meet: '@seol' },
    no: 'You followed the wrong girl for a week and earned a slap from her grandmother.', nofx: { charm: -1 },
    alt: ['Sell the rumour to a fortune-teller', 'The fortune-teller paid three taels, and began to tell everyone that a girl in Chang’an could see the future. You are not sure you did her a kindness.', { wealth: 3 }] },
  { key: 'wuchang', loc: 'wuchang', stat: 'charm', dc: 24,
    text: 'On the Wuchang docks a boatman says the Water Fortress has been counting imperial grain barges, very carefully, for a month.',
    ok: 'You bought rounds until you had the barges, the dates and the reed channels. You sold it to the grain office, which ignored it. It was still worth selling.', okfx: { wealth: 10, careerUp: 3, rep: { court: 2 } },
    no: 'The boatman was a Water Fortress man. He bought the next round, and asked who you work for.', nofx: { rep: { unorthodox: -3 } },
    alt: ['Sell the docks’ gossip to the Water Fortress', 'The Water Fortress pays in silver and in not drowning. You took both.', { wealth: 15, rep: { unorthodox: 4 } }] },
  { key: 'jadegate', loc: 'jadegate', stat: 'insight', dc: 30,
    text: 'Caravans out of the west have started carrying fewer goods and more men. The caravan masters will not meet your eye.',
    ok: 'You counted horses, saddles and sword-bundles for a season. The Cult is moving people east, quietly, in ones and twos. The Alliance paid you, and did not believe you.', okfx: { wealth: 15, careerUp: 4, rep: { orthodox: 3 }, flag: 'wk.inf.cult_scouts' },
    no: 'You counted wrong, or someone made sure you did.', nofx: { sanity: -2 },
    alt: ['Sell the count to a Cult contact', 'A man with red thread on his cuff paid you to count for him instead. Now both sides pay you, which is the broker’s dream and nightmare at once.', { wealth: 20, rep: { cult: 5, orthodox: -4 } }] },
  { key: 'dongting', loc: 'dongting', stat: 'charm', dc: 28,
    text: 'The old fisherman of Dongting is said to catch more fish with no bait than anyone with bait. People have been asking about him: rough people, with swords.',
    ok: 'You sat on his jetty and fished with him, and he caught four fish to your none, and when the rough people came he was simply not there. You sold nothing. You learned a great deal.', okfx: { insight: 3, careerUp: 2, meet: '@fisherman' },
    no: 'He would not speak to you. The fish would not speak to you either.', nofx: { sanity: -1 },
    alt: ['Sell his location to the swordsmen', 'You sold his jetty to the swordsmen. They went out at dawn. They did not come back, and neither did your nerve, for some time.', { wealth: 15, sanity: -6, infamy: 1 }] },
  { key: 'willow', loc: 'willow', stat: 'insight', dc: 18, age: [12, 30],
    text: 'In a village of forty roofs, the most valuable rumour is about bandits. A shepherd swears he saw riders in the hills above Willow Creek.',
    ok: 'You walked the hills and found the riders’ cold campfires, and counted the horse-dung like a scholar. You sold the warning to the village chief for a sack of rice.', okfx: { careerUp: 2, wealth: 3, fame: 2, flag: 'wk.inf.willow_warned' },
    no: 'You found nothing but sheep. The shepherd is still sure.', nofx: { insight: 1 },
    alt: ['Sell the shepherd’s story in Chang’an', 'A Chang’an broker paid a little and passed it on to somebody who paid a lot. You never learned who.', { wealth: 6 }] },
], (r) => E('wk_rumor', 'daily', {
  on: 'work', art: r.art || 'inn', if: JOB('informant', r.age || [12, 70], { loc: r.loc }), text: r.text,
  choices: [R('Dig deeper', r.stat, r.dc, O(r.ok, r.okfx), O(r.no, r.nofx)), C(r.alt[0], O(r.alt[1], r.alt[2])), C('Forget you heard it', O('You forgot it, as far as a broker can forget anything.', { sanity: 1 }))],
}));

// Odd jobs for people without a trade (deck events: Work only rolls events for people with careers).
const tplOdd = template('wk_oddjob', [
  { key: 'willow', loc: 'willow', age: [10, 50], title: 'Harvest hands',
    text: 'Chief Yun is hiring hands for the rice harvest: three coppers a day and all the rice you can eat at noon. The noon rice is famous.',
    roll: ['Cut rice from dawn to dusk', 'body', 14, 'You cut more rice than men twice your size. Chief Yun paid you a bonus and told his wife about you, which is how reputations start in Willow Creek.', { wealth: 4, body: 1, fame: 1 }, 'You cut your thumb on the first morning and spent the harvest tying sheaves.', { wealth: 2, health: -3 }],
    more: [C('Glean after the cutters instead', O('You gleaned with the widows and the children. You made almost nothing and laughed more than you had all year.', { wealth: 1, sanity: 4 }))] },
  { key: 'luoyang', loc: 'luoyang', age: [10, 40], title: 'Running messages',
    text: 'A grubby boy with a quick mouth offers you a job running messages for the Beggars’ Sect. "No questions," he says. "Mostly no questions. Some questions."',
    roll: ['Run like the wind', 'body', 16, 'You ran messages across Luoyang for a season. You know every alley now, and the boy, Dong-su, has decided you are his friend.', { wealth: 3, body: 1, meet: '@dongsu', rel: { '@dongsu': { aff: 10 } } }, 'You delivered a message to the wrong bridge. Dong-su laughed for a whole day.', { wealth: 1, meet: '@dongsu' }],
    more: [C('Read the messages', O('You read them. They were mostly about the price of buns. One was not. You delivered that one very fast.', { insight: 2, wealth: 2 }))] },
  { key: 'kaifeng', loc: 'kaifeng', age: [12, 50], title: 'Sweeping the den',
    text: 'A Kaifeng gambling den needs someone to sweep up after midnight. Among the cracked shells and spilt wine, you find a pair of dice that roll six every time.',
    roll: ['Sell the dice back to the house quietly', 'charm', 22, 'The owner bought them back for ten taels and your silence, then hired you to watch the tables. You declined. You took the ten taels.', { wealth: 10, charm: 1 }, 'The owner accused you of making them. You were thrown into the canal.', { health: -4 }],
    more: [C('Keep them', O('You kept the dice. You never dared to use them, but sometimes, at night, you roll them in your palm and they come up six.', { infamy: 1, insight: 1 }))] },
  { key: 'hangzhou', loc: 'hangzhou', age: [10, 50], season: [0, 1], title: 'Dragon Well tea',
    text: 'Tea picking in the Dragon Well hills above West Lake: two leaves and a bud, before the dew dries, ten thousand times a morning.',
    roll: ['Pick fast and clean', 'insight', 15, 'Your basket was the cleanest on the hill. The old forewoman gave you a twist of the first-grade leaves to take home.', { wealth: 3, item: { tea_brick: 1 } }, 'You picked stems, leaves and a small frog. The forewoman paid you half.', { wealth: 1 }],
    more: [C('Sing with the pickers', O('You learned the picking songs, which are very old and very rude. You will remember them in every life.', { sanity: 4, charm: 1 }))] },
  { key: 'capital', loc: 'capital', age: [14, 50], title: 'Palanquin bearer',
    text: 'You are hired as the fourth bearer of an official’s palanquin. The official is heavy, and talks to his secretary as if bearers had no ears.',
    roll: ['Listen and remember', 'insight', 20, 'He talked all the way across the capital about a magistrate who would be dismissed next month. You sold the news to the magistrate himself for six taels.', { wealth: 6, insight: 1 }, 'You listened so hard you stepped in a gutter. The palanquin tilted. You were dismissed without pay.', { charm: -1 }],
    more: [C('Just carry', O('You carried. Your shoulders ached for a week. Honest work is heavy.', { wealth: 3, body: 1 }))] },
  { key: 'chengdu', loc: 'chengdu', age: [10, 50], title: 'The pepper mill',
    text: 'A Chengdu chilli-oil shop pays you to grind Sichuan pepper all day. Your lips go numb in the first hour and stay numb until spring.',
    roll: ['Grind through it', 'health', 40, 'You lasted the season. The owner gave you a jar of his chilli oil, and you are now unable to eat anything without it.', { wealth: 4, body: 1 }, 'Your eyes swelled shut on the third day. The owner paid you anyway and laughed kindly.', { wealth: 2, health: -3 }],
    more: [C('Ask to learn the oil recipe instead', O('He told you the recipe, every step but one. That step has been in his family for nine generations. You suspect it is sugar.', { insight: 1, wealth: 2 }))] },
  { key: 'wuchang', loc: 'wuchang', age: [14, 50], title: 'On the docks',
    text: 'Dock work at Wuchang, where the Han meets the Great River. A crane rope frays above a crate of porcelain and a porter half your age.',
    roll: ['Shove him clear', 'body', 20, 'You shoved him clear. The crate smashed where he had been standing. The dock master paid you a week’s wages to stop talking about the rope.', { wealth: 5, fame: 1 }, 'You shoved him clear and the crate clipped your shoulder.', { health: -8, wealth: 2 }],
    more: [C('Shout a warning', P('Shout a warning', 0.6, O('He heard you and jumped. The crate smashed. He brought you a fish every week until you left Wuchang.', { sanity: 3 }), O('He did not hear. He lived, with a broken leg. You visited him every day.', { sanity: -4 })))] },
  { key: 'changan', loc: 'changan', age: [12, 60], title: 'Rubbings',
    text: 'An antiquarian hires you to take ink rubbings of old stone tablets in Chang’an’s forgotten temples. One of the tablets has a carving of a bead, cracked, held in an open hand.',
    roll: ['Study the carving', 'insight', 25, 'The inscription beneath was worn almost smooth. You made out four characters: "the wheel remembers." You did not sleep that night.', { wealth: 3, insight: 2, sanity: -2, flag: 'wk.odd.bead_tablet' }, 'The inscription was too worn. The antiquarian paid you and kept the rubbing.', { wealth: 3 }],
    more: [C('Just take the rubbings', O('You took the rubbings, got ink on everything, and earned four taels.', { wealth: 4 }))] },
  { key: 'jadegate', loc: 'jadegate', age: [12, 50], title: 'Camel boy',
    text: 'A caravan master needs someone to tend his camels at Jade Gate Pass. The camels have opinions, and spit.',
    roll: ['Win the lead camel’s trust', 'charm', 18, 'The lead camel decided she liked you. The rest followed. The caravan master offered you a place on the road west. You said no, but you think about it.', { wealth: 4, charm: 1 }, 'The lead camel spat in your face, ceremonially, every morning.', { wealth: 2, sanity: -1 }],
    more: [C('Learn words from the foreign traders', O('You learned twenty words in three languages, mostly about camels and prices. It is a start.', { insight: 2, wealth: 1 }))] },
  { key: 'dangclan', loc: 'dangclan', age: [12, 40], title: 'The Dang gardens',
    text: 'The Dang Clan Manor hires outsiders to weed its outer gardens. The gardener hands you thick gloves and says, "Do not touch your face. Ever."',
    roll: ['Learn which plants are which', 'insight', 25, 'By autumn you could tell foxglove from comfrey at twenty paces. The gardener, who had not spoken to you all season, said "Good," and taught you a salve.', { wealth: 4, recipe: 'healing_salve' }, 'You touched your face. Once. You spent three days in the Dang infirmary, which is the safest place in Shu to be poisoned.', { health: -10, wealth: 2 }],
    more: [C('Keep your head down and weed', O('You weeded, took your pay, and kept all your fingers.', { wealth: 4 }))] },
], (r) => E('wk_oddjob', 'daily', {
  once: false, cd: 4, title: r.title, if: NO_JOB(r.age, { loc: r.loc, ...(r.season ? { season: r.season } : {}) }), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// The boss: every trade has someone above you.
const tplBoss = template('wk_boss', [
  { key: 'landlord', career: 'farmer', age: [14, 70],
    text: 'The landlord’s steward walks your field with a measuring rope, nodding to himself. Next year’s rent, he says, will be a little higher. The field is the same size.',
    roll: ['Argue with numbers', 'insight', 22, 'You walked the rope with him and found the knot he had been skipping. The rent stayed where it was. The steward will not forget the knot.', { wealth: 4, careerUp: 2 }, 'He had better numbers. Or a bigger rope.', { wealth: -4 }],
    more: [C('Pay with a smile and a chicken', O('The chicken did it. The rent rose only a little.', { wealth: -2, charm: 1 }))] },
  { key: 'agency_chief', career: 'escort', age: [15, 60],
    text: 'A cart went missing on your last job, and the agency chief wants someone to blame. He is looking at you, and at the new porter, and back at you.',
    roll: ['Find the cart', 'insight', 26, 'You found it in a ditch two li back, with a drunk driver asleep under it. The chief laughed, fined the driver, and made you head of the next job.', { careerUp: 5, wealth: 4 }, 'You found nothing. The chief docked your pay and the porter’s.', { wealth: -5 }],
    more: [C('Take the blame for the porter', O('You took the blame. The chief knew. He docked your pay and gave you a nod you will remember. The porter would die for you now, which is a heavy thing to be given.', { wealth: -5, sanity: 3, careerUp: 3 }))] },
  { key: 'guild_clerk', career: 'merchant', age: [14, 70],
    text: 'A guild clerk explains that your trading permit has a small error in it. The error can be corrected for a small fee. The fee is not small.',
    roll: ['Find the error yourself', 'insight', 28, 'You found the "error": a missing seal the clerk had removed himself. You mentioned it to his superior, loudly. Your permit was corrected free.', { careerUp: 3, rep: { merchants: 2 } }, 'You found nothing. You paid, and the clerk smiled the smile of a man who will do this again.', { wealth: -10 }],
    more: [C('Pay the fee', O('You paid. Everyone pays. That is how the guild is built.', { wealth: -8, rep: { merchants: 2 } }))] },
  { key: 'old_physician', career: 'physician', age: [12, 50],
    text: 'Your teacher keeps a recipe in a locked box and never lets you see him compound it. He is getting old. He is getting very forgetful.',
    roll: ['Watch him through the screen', 'insight', 30, 'You memorised every step and confessed the next day. He laughed. "That is how I learned it too," he said, and taught you properly.', { recipe: 'qi_pill', careerUp: 3 }, 'He caught you. He did not speak to you for a month, and in that month he forgot the recipe himself.', { sanity: -3 }],
    more: [C('Ask him to teach you', O('He looked at you for a long time. "Next year," he said. Every year he says next year.', { careerUp: 1 }))] },
  { key: 'drunk_master', career: 'smith', age: [12, 50],
    text: 'Your master smith has been drinking, and an Emei commission is due tomorrow. The blade on the anvil is ruined, and he is asleep on the coal heap.',
    roll: ['Forge it again yourself, overnight', 'body', 28, 'You forged it alone, by the light of the furnace, until dawn. The Emei nun tested it, nodded, and paid your master. Your master woke and knew. He has never been drunk at the forge since.', { careerUp: 6, body: 1, rep: { orthodox: 2 } }, 'The second blade was worse than the first. The nun was gentle about it, which you will never forgive.', { health: -4, sanity: -3 }],
    more: [C('Tell the nun the truth', O('She listened, and laughed, and gave you a week. Your master was furious, and then grateful, and then furious again.', { charm: 1 }))] },
  { key: 'senior_official', career: 'scholar', age: [18, 70], extra: { flag: 'passedExam' },
    text: 'You wrote a memorial on flood control. Your superior has presented it to the prefect under his own name.',
    roll: ['Correct him in front of the prefect, gracefully', 'charm', 32, 'You complimented him on "our" memorial and asked a question about the third section that only its author could answer. He could not. The prefect noticed.', { careerUp: 5, rep: { court: 3 } }, 'You were not graceful. The prefect noticed that too.', { rep: { court: -4 }, sanity: -3 }],
    more: [C('Let him have it', O('You let him have it. He owes you now, and he knows it, and he hates you for it.', { careerUp: 2, sanity: -2 }))] },
  { key: 'bandit_captain', career: 'bandit', age: [14, 60],
    text: 'Your captain orders you to burn a granary in a village that did not pay. There are children in that village. There are children in every village.',
    roll: ['Burn an empty barn and tell him it was the granary', 'insight', 25, 'You burned a barn. The village understood the message and kept the grain. Your captain never checked.', { careerUp: 2, sanity: 3 }, 'He checked. You spent a month on latrine duty and the granary burned anyway.', { sanity: -6, rep: { unorthodox: -2 } }],
    more: [
      C('Burn it', O('It burned. You watched the village from the hill. You will see it again on bad nights.', { careerUp: 3, infamy: 4, sanity: -8, rep: { unorthodox: 3 } })),
      C('Refuse to his face', O('He beat you in front of the camp and stripped you of your share. Two of the younger bandits brought you food that night.', { health: -10, rep: { unorthodox: -4 }, fame: 1 })),
    ] },
  { key: 'handler', career: 'assassin', age: [15, 60], extra: { has: 'friend' }, bind: { x: 'friend' },
    text: 'Your handler slides a name across the table. It is {x}.',
    roll: ['Warn {x} and fake the kill', 'insight', 35, 'You staged it with pig’s blood and a burned house. {x} left the province under another name. The Pavilion paid you. You will never be able to tell {x.him} why.', { rel: { x: { aff: 10 } }, careerUp: 3, sanity: -3, flag: 'wk.asn.faked' }, 'The Pavilion saw through it. {x} lived, warned and running. You are on a list now.', { rep: { unorthodox: -8 }, flag: 'wk.asn.marked', rel: { x: { aff: -10 } } }],
    more: [
      C('Refuse the contract and leave the Pavilion', O('You left. The Pavilion does not forgive. But {x} is alive.', { career: null, rep: { unorthodox: -10 }, flag: 'wk.asn.marked' })),
      C('Do it', O('You did it. You went to the funeral. Nobody there knew.', { kill: 'x', infamy: 4, careerUp: 5, sanity: -20, burden: 1 })),
    ] },
  { key: 'spymaster', career: 'informant', age: [14, 70],
    text: 'The broker above you wants the names of your sources: the palace maid, the drunk clerk, the boy on the docks. "For safekeeping," he says.',
    roll: ['Give him plausible fakes', 'insight', 30, 'You gave him a list of three people who do not exist. He used them for years and never found out. Your real sources still bring you tea.', { careerUp: 4 }, 'One of your fake names belonged to a real person. That person had a very bad month.', { sanity: -5 }],
    more: [C('Give him the real names', O('He thanked you warmly. Within a year two of your sources were working for him directly, and one was dead.', { careerUp: 3, sanity: -6, wealth: 10 }))] },
], (r) => E('wk_boss', 'daily', {
  bind: r.bind, if: JOB(r.career, r.age, r.extra), text: r.text,
  choices: [ROLL(r.roll), ...r.more],
}));

// ── Hand-written events ──────────────────────────────────────────

const HAND = [
  // ── Farmers ─────────────────────────────────────────────────────
  E('wk_farm_land', 'daily', { on: 'work', if: JOB('farmer', [16, 70], { not: 'wk.farm.land' }), art: 'garden', title: 'A field of your own', text: 'The landlord needs silver for his son’s wedding, and offers to sell you the field you have worked for years. Sixty taels, and it is yours, and your children’s.', choices: [
    Q('Buy it (60 taels)', { stat: { wealth: '>=60' } }, O('You signed with a shaking hand. That evening you walked the edges of your field three times and did not know what to do with yourself.', { wealth: -60, flag: 'wk.farm.land', careerUp: 6, sanity: 6 })),
    R('Haggle him down', 'charm', 28, O('You talked him down to forty by pointing out every stone in the field, by name. The field is yours.', { wealth: -40, flag: 'wk.farm.land', careerUp: 6, sanity: 4 }), O('He would not move. "Sixty," he said, "or my cousin buys it."'), { req: { stat: { wealth: '>=40' } } }),
    C('Let it go', O('His cousin bought it. You still work it. It still is not yours.', { sanity: -3 })),
  ] }),
  E('wk_farm_ox', 'daily', { on: 'work', if: JOB('farmer', [12, 80]), text: 'Your ox has stopped eating. She is old, and she has pulled your plough for eleven years, and she is looking at you.', choices: [
    R('Nurse her yourself', 'insight', 20, O('You sat with her through three nights with warm bran mash and a lamp. She ate on the fourth morning. You told nobody that you cried.', { sanity: 5, careerUp: 1 }), O('She died on the third night, with her head in your lap.', { sanity: -6 })),
    Q('Pay the village physician (5 taels)', { stat: { wealth: '>=5' } }, O('The physician had never treated an ox, and said so, and did it anyway. She lived another three years.', { wealth: -5, sanity: 3 })),
    C('Sell her to the butcher', O('The butcher paid eight taels. You bought a young ox that does not like you.', { wealth: 2, sanity: -4 })),
  ] }),
  E('wk_farm_fugitive', 'daily', { if: JOB('farmer', [14, 75]), art: 'night', text: 'At dusk you find a man in your haystack with a sword wound and very good boots. An hour later, riders in Eastern Depot black stop at your gate and ask if you have seen anyone.', choices: [
    R('Lie to the Depot', 'charm', 25, O('You talked about the weather and your bad back until they left. The man in the haystack was gone by morning. On your doorstep: a fine sword, and a note that said only "Thank you."', { item: { fine_sword: 1 }, rep: { court: -2 }, flag: 'wk.farm.hid' }), O('They searched the haystack. They took him, and your winter rice, and your name.', { wealth: -5, rep: { court: -4 }, flag: 'wk.depot.watch' })),
    C('Point at the haystack', O('They took him away. The officer paid you two taels. You buried the money under the persimmon tree and never spent it.', { wealth: 2, rep: { court: 4 }, sanity: -6 })),
  ] }),
  E('wk_farm_child_leaves', 'bonds', { if: JOB('farmer', [32, 75], { has: 'child', npc: { x: { age: [12, 20] } } }), bind: { x: 'child' }, text: '{x} sets down the hoe in the middle of the spring planting. "I do not want to be a farmer," {x.he} says. "I want to join a sect."', choices: [
    C('Give {x.him} your blessing and your savings', O('You gave {x.him} your blessing and the money from under the floor. {x.He} cried and bowed three times. The planting took twice as long without {x.him}. It was worth it.', { wealth: -10, rel: { x: { aff: 20, res: 10 } }, sanity: 2 })),
    C('Forbid it', O('{x} stayed. {x.He} is a good farmer. {x.He} does not look at the mountains when {x.he} thinks you are watching.', { rel: { x: { aff: -15 } } })),
    R('Ask {x.him} to wait until the harvest', 'charm', 20, O('{x.He} waited until the harvest, and helped bring it in, and left with your blessing and a full belly.', { rel: { x: { aff: 10 } }, wealth: 2 }), O('{x.He} left the next morning, before you woke.', { rel: { x: { aff: -5 } }, sanity: -3 })),
  ] }),
  E('wk_farm_festival', 'daily', { if: JOB('farmer', [10, 80], { season: 2 }), once: false, cd: 3, art: 'feast', text: 'Harvest festival. Lanterns, rice wine, a pig on a spit, and the annual wrestling contest, which your neighbour has won six years in a row and mentions daily.', choices: [
    R('Enter the wrestling', 'body', 25, O('You threw him into the millpond. The village carried you around the square, and he bought you wine all night, sulking.', { fame: 2, sanity: 4, body: 1 }), O('He threw you into the millpond. Seven years in a row, he says, daily.', { sanity: 2, health: -2 })),
    C('Dance until the lanterns go out', O('You danced until the lanterns went out and then danced in the dark. Some years are good years.', { sanity: 6, charm: 1 })),
  ] }),
  E('wk_farm_weather_eye', 'daily', { on: 'work', if: JOB('farmer', [16, 80], { stat: { body: '>=26' } }), text: 'Old Granny Ma, who has farmed the hill field for seventy years, watches you plant and clicks her tongue. "You plant like a man who has never looked at the sky," she says.', choices: [
    C('Ask her to teach you', O('She taught you to read clouds, ants, swallows and the ache in your own knees. Your yields went up. Your knees, she said, would come later.', { insight: 3, careerUp: 4 })),
    C('Tell her the sky is not your business', O('She cackled. That year it rained on the day she said it would, and on your seed-beds, not hers.', { wealth: -2 })),
  ] }),

  // ── Escort guards ───────────────────────────────────────────────
  E('wk_esc_first', 'jianghu', { on: 'work', if: JOB('escort', [15, 40], { loc: 'luoyang' }), art: 'road', title: 'The Dragon-Tiger Escort Agency', text: 'Chief Pyo Gwang of the Dragon-Tiger Escort Agency looks at your hands, your feet, and your eyes, in that order. "Rule one," he says. "The cargo is worth more than you. Rule two: not much more."', choices: [
    C('Ask what rule three is', O('"Rule three: come back." He clapped you on the shoulder hard enough to bruise. You have been his since.', { meet: '@escort_chief', rel: { '@escort_chief': { aff: 10 } }, careerUp: 2 })),
    R('Ask him to test you', 'body', 22, O('He tested you with a pole until you fell over, then nodded. "Porter, not for long," he said.', { meet: '@escort_chief', rel: { '@escort_chief': { res: 15 } }, careerUp: 4 }), O('He tested you with a pole until you fell over, very quickly. "Porter," he said, "for a while."', { meet: '@escort_chief', health: -3 })),
  ] }),
  E('wk_esc_box', 'jianghu', { on: 'work', if: JOB('escort', [15, 60]), art: 'night', text: 'The client was very clear: do not open the black box. On the fourth night of the journey, the black box begins to hum.', choices: [
    R('Open it', 'sanity', 30, O('Inside, in silk, a sword was humming against its scabbard like a struck bell. You closed the box and slept beside it. It stopped when you did.', { insight: 2, sanity: -2, careerUp: 2 }), O('Inside, in silk, something looked at you. You closed the box. You do not sleep well now.', { sanity: -10 })),
    C('Sit on it until it stops', O('You sat on the box until dawn. It stopped humming around midnight, as if it had given up on you. The client paid a bonus and did not explain.', { wealth: 6, careerUp: 2 })),
  ] }),
  E('wk_esc_taeo', 'bonds', { on: 'work', if: JOB('escort', [15, 40], { loc: ['luoyang', 'kaifeng', 'changan'], notMet: 'taeo' }), art: 'road', text: 'On the night watch the other guard is a young man with a crooked smile who apologises to his spear when he drops it. His name is Kang Tae-o, and he cannot cook.', choices: [
    C('Cook for both of you', O('You made a terrible soup over the watch fire. He said it was the best thing he had ever eaten, and he meant it, which tells you about his cooking.', { meet: '@taeo', rel: { '@taeo': { aff: 15 } } })),
    C('Spar to stay awake', O('You sparred with sticks until dawn. He was better than he looked and worse than he thought.', { meet: '@taeo', rel: { '@taeo': { res: 10, aff: 5 } }, body: 1 })),
  ] }),
  E('wk_esc_spear', 'jianghu', { on: 'work', if: JOB('escort', [15, 50], { stat: { body: '>=20' }, noManual: 'escort_spear' }), text: 'An old escort with a limp watches you fight off a pack of wild dogs with a cart-pole. "Terrible," he says. "Come here. I will show you how we used to do it."', choices: [
    C('Learn from him', O('He taught you the Escort’s Flowing Spear on the evenings of a long road. On the last night he gave you his old spear-head, worn smooth.', { manual: 'escort_spear', careerUp: 3 })),
    C('Thank him and decline', O('He shrugged. "Everyone young is immortal," he said.', { sanity: 1 })),
  ] }),
  E('wk_esc_captain', 'jianghu', { if: JOB('escort', [20, 60], { stat: { body: '>=30' }, not: 'wk.esc.captain' }), art: 'road', title: 'The agency flag', text: 'The chief gives you your first caravan to command. Tradition says the captain rides ahead with the agency flag and shouts its name at every bandit hill. Tradition was invented by people who were not captains.', choices: [
    C('Shout it at every hill', O('You shouted until your voice broke. The hills listened. Bandits respect a captain who is loud and stupid, which is a kind of courage.', { flag: 'wk.esc.captain', fame: 3, careerUp: 5 })),
    R('Scout the hills quietly instead', 'insight', 28, O('You found two ambushes before they found you and went around both. Nobody in the caravan ever knew how close it had been.', { flag: 'wk.esc.captain', careerUp: 6, insight: 1 }), O('You scouted the wrong hill. The right one had men on it.', { flag: 'wk.esc.captain', wealth: -10, health: -6 })),
  ] }),
  E('wk_esc_widow', 'jianghu', { if: JOB('escort', [18, 65]), art: 'grave', text: 'A guard named Jo Pil died on your last job, an arrow from nowhere in the hills. The chief gives you his last pay to take to his widow. It is not much.', choices: [
    Q('Add your own pay to it', { stat: { wealth: '>=10' } }, O('You added your own pay and said it was from the agency. The widow knew. She gave you Jo Pil’s good boots.', { wealth: -10, sanity: 4 })),
    C('Deliver it and stay for the rites', O('You stayed for the rites and helped carry the empty coffin. His son asked you how his father died. You said bravely. It was true enough.', { sanity: -2, charm: 1 })),
  ] }),
  E('wk_esc_inside_job', 'crime', { on: 'work', if: JOB('escort', [18, 60], { stat: { body: '>=26' } }), danger: true, art: 'night', text: 'Two of your own guards are planning to "lose" the strongbox at the river crossing tonight. They have offered you a third.', choices: [
    C('Take your third', O('The strongbox was lost. You were questioned and believed. Your third bought very little, in the end, compared with what it cost.', { wealth: 25, infamy: 3, rep: { merchants: -3 }, sanity: -6 })),
    C('Stop them at the crossing', O('You were waiting at the river with your spear.', { combat: { foe: { name: 'the treacherous guard', kind: 'brawler', rel: 0.2 }, context: 'ambush', lethal: 0.2,
      win: { text: 'You brought them back tied to the strongbox. The agency gave you a bonus and their shares.', wealth: 15, fame: 2, careerUp: 5, rep: { merchants: 5 } },
      lose: { text: 'They left you in the river and ran with the strongbox. The agency believed you, mostly.', health: -12, wealth: -5 } } })),
    C('Warn the chief and let him handle it', O('The chief had them arrested at dawn. He looked at you a long time afterwards. "Good," he said. "Tell no one it was you."', { careerUp: 4, rep: { merchants: 3 } })),
  ] }),

  // ── Merchants ───────────────────────────────────────────────────
  E('wk_mer_scales', 'daily', { on: 'work', if: JOB('merchant', [14, 70]), art: 'market', text: 'An older trader shows you a trick: a hollow weight with mercury inside that rolls to one end when you tilt the scale. "Everybody does it," he says. "The trick is not to be the only one who does not."', choices: [
    C('Buy the weight', O('Your profits rose by a tenth. So did the number of customers who did not come back.', { wealth: 10, infamy: 2, rep: { merchants: -2 } })),
    C('Refuse, and buy an honest scale', O('You bought an honest scale and hung a sign over it. Business was slower, then steadier. Honesty is a long game.', { wealth: -3, fame: 2, careerUp: 2 })),
    R('Learn to spot it in others', 'insight', 22, O('You learned the tilt of a mercury weight. You caught two suppliers with it that year and renegotiated, forcefully.', { wealth: 8, insight: 1, careerUp: 2 }), O('You learned nothing except that the old trader will not teach you for free.', { wealth: -1 })),
  ] }),
  E('wk_mer_dues', 'daily', { on: 'work', if: JOB('merchant', [16, 70], { loc: 'hangzhou' }), art: 'market', text: 'The Golden Abacus Guild’s collector arrives with this year’s dues, and a personal note from Guild Master Geum Man-bok himself, inviting you to "consider your future."', choices: [
    C('Pay the dues and accept the invitation', O('Geum Man-bok fed you seven courses and weighed you like a sack of rice. "You will do," he said. You are not sure what for.', { wealth: -10, meet: '@merchant_king', rel: { '@merchant_king': { res: 10 } }, rep: { merchants: 5 } })),
    R('Pay late and decline politely', 'charm', 30, O('You declined so politely that he was amused. "Independent," he said. "For now."', { meet: '@merchant_king', rel: { '@merchant_king': { res: 5 } }, wealth: -6 }), O('He was not amused. Your suppliers raised their prices that season, all at once.', { wealth: -15, rep: { merchants: -5 } })),
  ] }),
  E('wk_mer_gaeun', 'bonds', { on: 'work', if: JOB('merchant', [15, 45], { loc: 'hangzhou', notMet: 'gaeun' }), art: 'market', text: 'At the horse market a young woman watches a mare walk twice, names a price lower than yours, and wins. She turns and smiles at you. "Her left hind is weak," she says. "You were about to overpay."', choices: [
    C('Ask her to teach you', O('Her name was Seo Ga-eun. She taught you to price a horse by its gait and a man by his shoes. You have not stopped thinking about her shoes, or her.', { meet: '@gaeun', rel: { '@gaeun': { aff: 10, res: 5 } }, insight: 1 })),
    R('Outbid her on the next horse', 'charm', 30, O('You outbid her on a grey with a beautiful gait. She laughed and bought you tea. "Lucky," she said. It was.', { meet: '@gaeun', rel: { '@gaeun': { res: 15 } }, careerUp: 2 }), O('You outbid her on a grey that went lame in a month. She sent you a sympathy note in perfect calligraphy.', { meet: '@gaeun', rel: { '@gaeun': { aff: 5 } }, wealth: -10 })),
  ] }),
  E('wk_mer_counterfeit', 'crime', { on: 'work', if: JOB('merchant', [14, 70]), art: 'market', text: 'Your biggest buyer of the season paid in silver ingots. Tonight, cutting one to make change, you find it is lead under a skin of silver.', choices: [
    C('Pass them on quickly', O('You passed them on to a supplier you never liked. It worked. You feel like someone you never liked.', { wealth: 5, infamy: 2, sanity: -3 })),
    R('Track the buyer down', 'insight', 30, O('You found him in a teahouse in the next town, paying with the same ingots. The magistrate was very interested. So was the reward.', { wealth: 15, fame: 2, rep: { court: 3 } }), O('He had vanished. You melted the ingots down for the silver skin, and made back a tenth.', { wealth: -15 })),
    C('Swallow the loss', O('You swallowed the loss and a lesson: always cut one ingot in front of the buyer.', { wealth: -15, insight: 2 })),
  ] }),
  E('wk_mer_shopfront', 'daily', { if: JOB('merchant', [18, 70], { stat: { charm: '>=26' }, not: 'wk.mer.shop', locType: 'city' }), art: 'market', title: 'A shop with a sign', text: 'A shopfront on the main street is for sale: two rooms, a counter worn smooth by forty years of elbows, and a sign-board that is waiting for a name.', choices: [
    Q('Buy it (120 taels)', { stat: { wealth: '>=120' } }, O('You had your family name carved on the sign. On the first morning you opened the shutters yourself and stood there for a long time.', { wealth: -120, flag: 'wk.mer.shop', careerUp: 8, fame: 3, sanity: 5 })),
    R('Rent it, with an option to buy', 'charm', 30, O('The owner liked you and agreed. Your name went on the sign in paint, not carving. Paint is a start.', { wealth: -30, flag: 'wk.mer.shop', careerUp: 5 }), O('Another merchant offered more. He has carved his name on it. You walk past it every day.', { sanity: -3 })),
    C('Keep peddling', O('Shops are anchors, you tell yourself. You keep walking.', { insight: 1 })),
  ] }),
  E('wk_mer_winehouse_share', 'daily', { if: JOB('merchant', [18, 80], { flag: 'wk.mer.winehouse', not: 'wk.mer.winehouse_paid' }), art: 'inn', title: 'The Drunken Crane', text: 'A year on, the widow who owns the Drunken Crane sends for you with the accounts.', choices: [
    C('Look at the accounts', O('The Drunken Crane had its best year in a decade. Your share came to eighty taels and a jar of the house wine every New Year, forever.', { wealth: 80, flag: 'wk.mer.winehouse_paid', item: { rice_wine: 2 }, sanity: 3 }), { show: { not: 'wk.mer.thief' } }),
    C('Look at the accounts', O('The accounts were worse than last year. The head waiter now has a new coat. You sacked him, a year late, and earned back your silver over the next three.', { wealth: 20, flag: 'wk.mer.winehouse_paid', insight: 2 }), { show: { flag: 'wk.mer.thief' } }),
    C('Sell your share back to the widow', O('She bought it back with her savings, for exactly what you paid. You drink there sometimes. She never lets you pay.', { wealth: 50, flag: 'wk.mer.winehouse_paid', charm: 1 })),
  ] }),
  E('wk_mer_partner', 'daily', { if: JOB('merchant', [20, 70], { stat: { charm: '>=30' } }), bind: { x: { age: [25, 55], role: 'acquaintance', aff: 40, res: 35 } }, art: 'market', text: 'A trader named {x} proposes a partnership: {x.his} boats, your customers, profits split evenly. {x.He} has a reputation for being honest, which in your trade is either true or very clever.', choices: [
    R('Take a season to check {x.him} out', 'insight', 30, O('{x} was honest, to an almost tiresome degree. The partnership made you both rich, slowly, and {x.he} became a friend.', { role: { x: 'friend' }, rel: { x: { aff: 15, res: 10 } }, wealth: 30, careerUp: 5 }), O('You found nothing either way, and by the time you decided, {x.he} had a different partner.', { insight: 1 })),
    C('Shake on it today', P('Shake on it today', 0.6, O('A handshake was enough. {x} kept every promise. You made money and a friend.', { role: { x: 'friend' }, rel: { x: { aff: 15 } }, wealth: 25 }), O('{x} vanished with your first season’s profits, very cleverly.', { wealth: -30, role: { x: 'enemy' }, sanity: -4 }))),
    C('Decline', O('{x} took it graciously and went to your rival, who is now richer than you.', {})),
  ] }),

  // ── Physicians ──────────────────────────────────────────────────
  E('wk_doc_blind_herbs', 'daily', { on: 'work', if: JOB('physician', [12, 30], { noMem: 'recipe.healing_salve' }), art: 'garden', title: 'Herbs by the tongue', text: 'Your teacher blindfolds you and puts nine herbs in front of you, one at a time. "A physician who needs her eyes," she says, "is half a physician. Taste."', choices: [
    R('Taste them all', 'insight', 22, O('Licorice, angelica, coptis, ginger, and five more you named one by one. She took off the blindfold and taught you the Golden Wound Salve that afternoon.', { recipe: 'healing_salve', careerUp: 4 }), O('The sixth was not an herb. It was a dead beetle. She laughed until she wheezed.', { careerUp: 1, health: -1 })),
    C('Ask why it matters', O('"Because one day you will be in the dark with a dying man and a bag of roots," she said. You tasted them all. You got four right.', { insight: 1, careerUp: 2 })),
  ] }),
  E('wk_doc_poison_ask', 'daily', { on: 'work', if: JOB('physician', [16, 80]), text: 'A woman with a bruise she does not explain asks you for something "to help her husband sleep. A long time."', choices: [
    C('Give her a sleeping draught, a real one', O('You gave her a draught that would make him sleep for one night, and the name of a magistrate’s wife who takes in women with bruises. She looked at the name for a long time.', { sanity: 3, careerUp: 2 })),
    C('Give her what she asked for', O('You gave her what she asked for. A month later there was a funeral on her street. She brought you a basket of pears. You could not eat them.', { wealth: 5, infamy: 3, sanity: -8 })),
    C('Refuse and send her away', O('You refused. She thanked you, as if that was what she had expected, and left.', { sanity: -3 })),
  ] }),
  E('wk_doc_yakseon', 'fortune', { on: 'work', if: JOB('physician', [16, 80], { region: 'shu', notMet: 'yakseon', stat: { insight: '>=30' } }), art: 'garden', text: 'An old woman with mud on her sleeves reads your prescription over a patient’s shoulder and laughs. "Coptis? For that pulse? He will live, but he will hate you."', choices: [
    C('Ask her what she would use', O('"Honeysuckle," she said, "and a walk." She stayed an hour, criticised everything, and left you a recipe on the back of your own prescription. She signed it with a drawing of a white deer.', { meet: '@yakseon', rel: { '@yakseon': { res: 15 } }, recipe: 'heart_calming', careerUp: 4 })),
    R('Defend your prescription', 'insight', 40, O('You defended it, point by point. She stopped laughing and started listening. "Hm," she said. "Not hopeless." From her, that was a medal.', { meet: '@yakseon', rel: { '@yakseon': { res: 25 } }, insight: 3, careerUp: 4 }), O('She took your arguments apart like a roast duck. "Come back in ten years," she said, kindly.', { meet: '@yakseon', insight: 2 })),
  ] }),
  E('wk_doc_dang_min', 'bonds', { on: 'work', if: JOB('physician', [14, 45], { region: 'shu', notMet: 'dang_min' }), text: 'A young man from the Dang Clan, awkward and very polite, asks if he may watch you treat patients. "We only learn how to make people ill," he says. "I would like to learn the other half."', choices: [
    C('Let him watch, and teach him', O('Dang Min watched for a season, asked a thousand questions, and taught you more about poisons in return than you wanted to know. You think you have made a friend. You check your tea anyway.', { meet: '@dang_min', rel: { '@dang_min': { aff: 15, res: 10 } }, insight: 2, careerUp: 3 })),
    C('Refuse; you do not want Dang trouble', O('He bowed, unsurprised. "Everyone says that," he said. He went to another physician, who was less careful and more famous.', { meet: '@dang_min', rel: { '@dang_min': { aff: -5 } } })),
  ] }),
  E('wk_doc_depot_prisoner', 'daily', { on: 'work', if: JOB('physician', [18, 80], { loc: 'capital' }), art: 'prison', text: 'Depot officers bring you, blindfolded, to a cellar. A man on a table has been questioned for a week. "Keep him alive," the officer says, "until he talks."', choices: [
    C('Treat him as well as you can', O('You treated him as well as you could. He looked at you once, very clearly. You do not know if he talked. You know he lived for a while.', { wealth: 15, rep: { court: 3 }, sanity: -6 })),
    R('Give him something for the pain the officers will not notice', 'insight', 30, O('You gave him poppy hidden in the wound-dressing. He slept through the next session. You do not know if it helped. It was what you had.', { wealth: 10, sanity: -2 }), O('The officer noticed. You were blindfolded again and released at dawn, poorer and in a ledger.', { flag: 'wk.depot.watch', rep: { court: -5 }, sanity: -4 })),
    C('Refuse', O('They released you, eventually. The man on the table did not have another physician that week, or ever.', { rep: { court: -6 }, sanity: -4, flag: 'wk.depot.watch' })),
  ] }),
  E('wk_doc_apprentice_error', 'daily', { on: 'work', if: JOB('physician', [25, 80], { stat: { insight: '>=26' } }), bind: { x: { age: [13, 18], role: 'acquaintance', aff: 50, res: 30, romance: false } }, text: 'Your apprentice {x} mixed aconite where the recipe said angelica. The patient is vomiting in the yard. {x} is white as rice paper.', choices: [
    R('Treat the patient fast', 'insight', 30, O('You had the antidote down him in a hundred breaths. He lived, and complained. You took {x} aside and said nothing for a long time, and then, "Again. Slowly." {x.He} never made the mistake again.', { rel: { x: { aff: 10, res: 15 } }, careerUp: 3 }), O('The patient lived, barely. His family wants your licence. {x} has not stopped crying.', { rep: { court: -2 }, sanity: -4, rel: { x: { aff: 5 } } })),
    C('Dismiss {x}', O('You dismissed {x.him} that afternoon. {x.He} became a ferryman. You think about it, on and off, for years.', { rel: { x: { aff: -30 } }, sanity: -3 })),
  ] }),
  E('wk_doc_divine_canon', 'fortune', { if: JOB('physician', [30, 90], { stat: { insight: '>=45' }, noManual: 'med_physician' }), art: 'scroll', title: 'The Divine Physician’s Canon', text: 'An old physician you have argued with for twenty years is dying. He sends for you, not his sons. On his blanket is a book wrapped in oilcloth.', choices: [
    C('Sit with him', O('You sat with him through the night and argued about pulses until he laughed and stopped. The book was the Divine Physician’s Canon. His last note in its margin was addressed to you: "You were right about the liver."', { manual: 'med_physician', sanity: -3, careerUp: 8 })),
    C('Tell him to give it to his sons', O('He looked at you with something like pride. "That is why it is yours," he said. You took it. You did not deserve it, which is why you will try to.', { manual: 'med_physician', careerUp: 6, charm: 1 })),
  ] }),
  E('wk_doc_field_hospital', 'war', { if: JOB('physician', [16, 80], { happened: 'cult_war', year: [34, 42] }), art: 'battlefield', title: 'The field hospital', text: 'The Alliance has turned a temple into a field hospital. The wounded lie in rows from the altar to the gate, and there are three physicians, and you are one.', choices: [
    R('Work until you drop', 'health', 50, O('You worked for nine days and slept in two-hour pieces. Hundreds lived who would have died. You will never be able to smell incense again without seeing them.', { fame: 6, rep: { orthodox: 8 }, careerUp: 8, sanity: -8, health: -10 }), O('You collapsed on the fourth day. They put you in a row with the others.', { health: -20, fame: 3, rep: { orthodox: 4 }, sanity: -6 })),
    C('Choose who to treat', O('You chose. Some you treated, some you made comfortable. It was the right way to do it, and you hate it.', { fame: 3, rep: { orthodox: 5 }, sanity: -12, careerUp: 5 })),
  ] }),

  // ── Smiths ──────────────────────────────────────────────────────
  E('wk_smith_first_blade', 'daily', { on: 'work', if: JOB('smith', [12, 40], { not: 'wk.smith.first' }), art: 'forge', title: 'Your first blade', text: 'Your master lets you forge a blade on your own for the first time. Fold, hammer, fold, hammer, until the steel is a river and you are part of it.', choices: [
    R('Quench it at dawn', 'body', 20, O('It came out of the quench singing. Your master turned it in the light, said nothing, and hung it on the wall where customers would see it. Later he gave it to you.', { flag: 'wk.smith.first', item: { fine_sword: 1 }, careerUp: 5 }), O('It warped in the quench like a dying fish. Your master hung that on the wall too, with a label.', { flag: 'wk.smith.first', careerUp: 2, sanity: -2 })),
    C('Fold it one more time', O('You folded it one more time, and one more, and on the fortieth fold your master took the hammer away. "Enough," he said. "Learn when to stop." It was a fine blade. He sold it.', { flag: 'wk.smith.first', wealth: 10, careerUp: 3 })),
  ] }),
  E('wk_smith_burn', 'daily', { on: 'work', if: JOB('smith', [12, 70]), once: false, cd: 6, art: 'forge', text: 'A crucible cracks in the furnace and a spray of white-hot slag comes at your face.', choices: [
    R('Throw your arm up', 'body', 22, O('Your sleeve caught fire, and you put it out in the quench tub. A scar on your forearm, like a small map of somewhere.', { health: -4 }), O('It caught your arm and shoulder. You will carry the burn for years.', { injury: { name: 'forge burn', seasons: 4, sev: 12 } })),
    Q('Step aside with lightness', { realm: '>=1' }, O('You were simply not there when it arrived. The apprentice dropped his tongs and stared at you for a week.', { fame: 1 })),
  ] }),
  E('wk_smith_star', 'fortune', { if: JOB('smith', [18, 70], { stat: { body: '>=26' }, not: 'wk.smith.star' }), art: 'mountain', title: 'Star iron', text: 'A peddler sells you a lump of black iron he swears fell from the sky over Mount Kongtong. It is heavier than it should be, and colder.', choices: [
    R('Go and find where it came from', 'insight', 30, O('You walked to Kongtong and asked every shepherd in the gullies. One had the rest of the star as a doorstop. It cost you a jar of wine and a long story.', { flag: 'wk.smith.star', wealth: -2, codex: STAR_IRON, careerUp: 3 }), O('You walked to Kongtong and found only wind and Kongtong disciples, who were not helpful.', { health: -4 })),
    M('You know where the rest of it is', 'secret.wk_star_iron', O('You went straight to the shepherd’s hut east of Kongtong with a jar of wine. He laughed, and gave you the doorstop.', { flag: 'wk.smith.star', careerUp: 4 })),
    C('Keep the lump as a paperweight', O('It holds down your accounts very well.', { insight: 1 })),
  ] }),
  E('wk_smith_star_blade', 'daily', { if: JOB('smith', [20, 80], { flag: 'wk.smith.star', stat: { body: '>=36' }, not: 'wk.smith.star_done' }), art: 'forge', title: 'The star blade', text: 'You have the star iron, and the skill, at last. The furnace has been burning for three days. The iron is still not glowing.', choices: [
    R('Feed the fire with your own qi', 'qi', 30, O('You put your palms to the bellows and pushed your qi into the fire until the iron took it. The blade came out black, with stars in it. You have never made anything so beautiful, and never will again.', { flag: 'wk.smith.star_done', item: { fine_sword: 1 }, fame: 8, careerUp: 10 }), O('The fire took your qi and gave nothing back. You fainted at the bellows.', { health: -10 })),
    R('Burn it for nine days, the old way', 'body', 40, O('Nine days. Your apprentices fainted in shifts. On the ninth day the iron glowed, and you made a blade that sings when the wind blows. A Kunlun elder offered three hundred taels for it on the spot.', { flag: 'wk.smith.star_done', wealth: 300, fame: 6, careerUp: 10 }), O('On the seventh day you collapsed at the anvil. The iron is still waiting.', { health: -15 })),
  ] }),
  E('wk_smith_tiger_rhythm', 'daily', { on: 'work', if: JOB('smith', [14, 60], { stat: { body: '>=30' }, noManual: 'ext_tiger_bone' }), art: 'forge', text: 'Your old master never hammers in a straight rhythm: three, a pause, two, a breath. One evening you notice that your body has started breathing that way too, and it is stronger for it.', choices: [
    C('Ask him about it', O('He grunted. "My grandfather was a Paeng retainer," he said. "Hammer, breath, bone." He taught you, and it was Tiger Bone Tempering all along.', { manual: 'ext_tiger_bone', body: 2, careerUp: 3 })),
    C('Keep hammering', O('You kept hammering, and breathing, and growing stronger without knowing why.', { body: 2 })),
  ] }),
  E('wk_smith_broken_sword', 'bonds', { on: 'work', if: JOB('smith', [16, 70]), bind: { x: { age: [16, 25], role: 'acquaintance', aff: 30, realm: [1, 2] } }, art: 'forge', text: 'A young swordsman named {x} lays two halves of a sword on your anvil. "My master’s," {x.he} says. "He died with it. I need it whole."', choices: [
    R('Rejoin the blade', 'insight', 30, O('You welded it with a sleeve of new steel and polished it until the seam was a silver vein. {x} wept, and swore {x.he} would repay you, and two years later {x.he} did, with a story about a duel and a bag of silver.', { rel: { x: { aff: 25, res: 15 } }, role: { x: 'friend' }, careerUp: 4, next: { id: 'wk_smith_sword_repaid', in: 8 } }), O('The steel would not take the weld. You gave the halves back with a new hilt, so {x.he} could carry it.', { rel: { x: { aff: 5 } } })),
    C('Tell {x.him} to forge a new one and keep the old one', O('{x} listened, and thought, and nodded. "He would have said that," {x.he} said.', { rel: { x: { res: 10 } }, insight: 1 })),
  ] }),
  E('wk_smith_sword_repaid', 'daily', { on: 'scheduled', if: { npc: { x: true } }, art: 'letter', text: 'A bag of silver arrives at the forge, and a letter from {x}: "It held. In the duel that mattered, it held. Thank you."', fx: { wealth: 25, fame: 2, rel: { x: { aff: 5 } } } }),

  // ── Scholars ────────────────────────────────────────────────────
  E('wk_sch_answers', 'crime', { on: ['work', 'study'], if: JOB('scholar', [12, 40], { not: ['passedExam', 'wk.sch.banned'] }), text: 'A man in the teahouse sells "this year’s questions" for thirty taels. Half the candidates in the prefecture are suddenly very cheerful.', choices: [
    P('Buy them (30 taels)', 0.55, O('The questions were real. You passed. You felt like a fraud, and then like a licentiate.', { wealth: -30, flag: 'passedExam', careerUp: 6, sanity: -4 }), O('The questions were real, and so was the investigation. Every candidate who used them was banned from the examinations for life.', { wealth: -30, flag: 'wk.sch.banned', rep: { court: -8 }, infamy: 2 }), { req: { stat: { wealth: '>=30' } } }),
    C('Report him to the examiners', O('The examiners arrested him and changed the questions. Half the prefecture hates you. The other half did not buy.', { rep: { court: 4 }, fame: 1, careerUp: 2 })),
    C('Ignore it and study', O('You studied. It was the only honest option and the only one that did not cost thirty taels.', { insight: 1 })),
  ] }),
  E('wk_sch_banned', 'daily', { if: JOB('scholar', [14, 70], { flag: 'wk.sch.banned' }), text: 'Banned from the examinations, you are a scholar with no road. Your teacher, the only person who still visits, says there are other roads.', choices: [
    C('Become a merchant', O('You put your calligraphy on shop signs and your arithmetic on accounts. It turns out the examinations were good preparation for something.', { career: 'merchant', insight: 1 })),
    C('Become a broker of information', O('You know every scholar in the prefecture and every secret they told you over wine. You open a quiet trade.', { career: 'informant' })),
    C('Keep studying, for its own sake', O('You kept studying. You will never be an official. You are, slowly, something better.', { insight: 3, sanity: 3 })),
  ] }),
  E('wk_sch_tutor', 'daily', { on: 'study', if: JOB('scholar', [12, 30], { not: 'passedExam' }), title: 'The failed scholar', text: 'Old Master Choi failed the examinations eleven times and now tutors other people’s sons for rice. He knows every trick an examiner has ever used.', choices: [
    C('Study with him', O('He drilled you until you dreamed in eight-legged essays. On the last day he said, "You will pass. I never did, because I could not stop arguing." He looked happy, saying it.', { insight: 3, careerUp: 4 })),
    R('Argue with him', 'insight', 25, O('You argued with him every afternoon for a season. He was delighted. You both learned something, and he refused to take your rice.', { insight: 4, sanity: 3 }), O('He won every argument, gently, and charged double.', { wealth: -3, insight: 2 })),
  ] }),
  E('wk_sch_case', 'daily', { on: 'work', if: JOB('scholar', [18, 80], { flag: 'passedExam', stat: { insight: '>=26' } }), art: 'palace', title: 'The case of the stolen ox', text: 'A rich landlord accuses a tenant’s widow of stealing his ox. The ox is in the widow’s yard. So, the widow says, was her late husband’s money, before the landlord came to collect a debt nobody else remembers.', choices: [
    R('Investigate the debt', 'insight', 30, O('You found the debt in no ledger and the landlord’s steward in a wine-house, talkative. The ox stayed with the widow, and the landlord paid a fine he will pass on to his tenants somehow.', { fame: 4, careerUp: 5, rep: { court: 2 } }), O('You found nothing. You ruled the law: the ox went back. The widow bowed to you, which was the worst part.', { sanity: -5, careerUp: 2 })),
    C('Rule for the landlord', O('The landlord sent you a fine ham. The widow did not send anything.', { wealth: 10, rep: { court: 2 }, sanity: -4 })),
    C('Buy the ox yourself and give it to the widow', O('You paid the landlord for the ox out of your own purse and ruled the case closed. It was not law. It was something.', { wealth: -15, fame: 2, sanity: 4 })),
  ] }),
  E('wk_sch_depot_charge', 'daily', { on: 'work', if: JOB('scholar', [20, 80], { flag: 'passedExam', loc: 'capital' }), art: 'palace', text: 'An Eastern Depot officer lays a document on your desk: charges of treason against a Beggars’ Sect envoy. It needs a magistrate’s seal. "A formality," he says.', choices: [
    C('Seal it', O('You sealed it. He was taken that afternoon. You did not ask what happened next. You are learning not to ask.', { rep: { court: 8, orthodox: -6 }, sanity: -6, flag: 'wk.depot.friend' })),
    R('Find a procedural error', 'insight', 34, O('You found that the charges named the wrong district and returned them for correction. By the time they came back, the envoy had left the capital. Someone had warned him. Possibly you.', { rep: { orthodox: 5 }, fame: 1, careerUp: 2 }), O('There was no error. He waited while you looked, smiling.', { rep: { court: -3 }, flag: 'wk.depot.watch' })),
    C('Refuse', O('You refused. He took the document to another magistrate, who sealed it. Your name went in a ledger.', { rep: { court: -8, orthodox: 4 }, flag: 'wk.depot.watch', sanity: 2 })),
  ] }),
  E('wk_sch_poem', 'daily', { if: JOB('scholar', [14, 70], { stat: { charm: '>=20' } }), art: 'inn', text: 'A poem you wrote half-drunk about a willow and a broken cup has escaped. The singing girls of three wine-houses are performing it, with improvements.', choices: [
    C('Claim it', O('You claimed it. You are now famous among poets and singing girls and suspect among examiners.', { fame: 4, charm: 1, rep: { court: -1 } })),
    C('Deny it', O('You denied it so hard that everyone knew it was you, and admired your modesty.', { fame: 2, charm: 2 })),
    C('Write a better one', R('Write a better one', 'charm', 34, O('The second poem made people cry in the street. A minister quoted it in a memorial.', { fame: 6, careerUp: 3 }), O('The second poem was worse. The singing girls kept the first.', { sanity: -2 }))),
  ] }),
  E('wk_sch_melon', 'crime', { on: 'work', if: JOB('scholar', [20, 80], { flag: 'passedExam' }), text: 'A merchant with a case before your court sends a gift: a melon. It is the heaviest melon you have ever lifted. Inside, of course, is silver.', choices: [
    C('Keep the melon, return the silver', O('You returned the silver with a note: "Thank you for the melon." It became a famous story. The merchant lost his case and admired you anyway.', { fame: 3, rep: { court: 2 }, careerUp: 2 })),
    C('Keep both', O('You kept both and ruled for him. The melon was excellent. You are now, in the eyes of the prefecture, a melon magistrate.', { wealth: 40, infamy: 3, sanity: -3 })),
    C('Have him charged with bribery', O('You charged him. He paid a fine larger than the silver, and the prefect noticed your zeal. So did every merchant in the district.', { rep: { court: 5, merchants: -5 }, careerUp: 3 })),
  ] }),
  E('wk_sch_court_factions', 'daily', { if: JOB('scholar', [24, 80], { flag: 'wk.exam.palace', stat: { insight: '>=40' }, loc: 'capital' }), art: 'palace', title: 'Two banners', text: 'The court is splitting in two: the Director of the Eastern Depot on one side, the Grand Secretary and the old ministers on the other. Both have sent you invitations to dinner on the same night.', choices: [
    C('Dine with the Depot', O('The Director was charming, informed and unhurried. By the end of dinner you had a promotion, and a feeling that you had been bought very cheaply.', { rep: { court: 10, orthodox: -5 }, careerUp: 8, flag: 'wk.depot.friend', meet: '@depot_director', sanity: -4 })),
    C('Dine with the ministers', O('The ministers were old, frightened and principled. They welcomed you like a son. The Depot noticed which dinner you chose.', { rep: { court: -3, orthodox: 4 }, fame: 3, careerUp: 4, flag: 'wk.depot.watch' })),
    C('Visit the Imperial Guard instead', O('You went to see Commander Han Gyeong, who looked at you for a long time and then poured tea. "The Emperor mentioned you," he said. You talked until dawn about a boy who wants to rule.', { meet: '@guard_commander', rel: { '@guard_commander': { aff: 15, res: 15 } }, careerUp: 6, gaze: 1 }), { show: { flag: 'wk.emperor.ear' } }),
  ] }),

  // ── Bandits ─────────────────────────────────────────────────────
  E('wk_ban_first', 'crime', { on: 'work', if: JOB('bandit', [14, 35], { not: 'wk.ban.first' }), art: 'road', title: 'Your first robbery', text: 'Your first job: an old peddler with a donkey. The others are watching to see what you do. The peddler is watching too, without much hope.', choices: [
    C('Rob him', O('You took his purse. It had four taels in it, and a carved wooden horse, for a grandchild. You kept the horse. You do not know why.', { flag: 'wk.ban.first', wealth: 4, infamy: 2, sanity: -3, careerUp: 2 })),
    C('Rob him, then give it back when the others look away', O('You took his purse in front of the others and slipped it back into his donkey’s pack. He found it later, you hope.', { flag: 'wk.ban.first', sanity: 2, careerUp: 1 })),
    R('Convince the others he is not worth it', 'charm', 20, O('You said he had lice. The others backed away. The peddler, who did not have lice, thanked you with his eyes.', { flag: 'wk.ban.first', charm: 1 }), O('They did not believe you, and robbed him themselves, and laughed at you all evening.', { flag: 'wk.ban.first', rep: { unorthodox: -2 } })),
  ] }),
  E('wk_ban_split', 'crime', { on: 'work', if: JOB('bandit', [15, 60]), art: 'night', text: 'Dividing the loot by the fire, your captain takes half and gives the rest to twelve men. He takes his half of your half too, smiling.', choices: [
    R('Challenge him on the arithmetic', 'insight', 25, O('You laid the arithmetic out in the dirt with sticks. The men started to murmur. The captain laughed, a little too loud, and paid fairly.', { wealth: 5, rep: { unorthodox: 3 }, careerUp: 3 }), O('He did not like arithmetic. He liked his saber.', { health: -8 })),
    C('Say nothing and plan', O('You said nothing. Next time, you kept a little back first. Everybody does.', { wealth: 3, infamy: 1 })),
  ] }),
  E('wk_ban_tiger', 'crime', { on: 'work', if: JOB('bandit', [16, 60], { loc: 'taihang', notMet: 'mountain_tiger' }), art: 'mountain', title: 'The Mountain Tiger', text: 'The King of the Green Forest himself, Ma Hu, is visiting your stronghold. He is enormous, loud, and asks every bandit one question: "Why are you here?"', choices: [
    C('Tell the truth', O('You told him. He listened, all of it, and nodded. "Good answer," he said, about an answer that was not good at all. "Stay alive. Keep your word. The rest is weather."', { meet: '@mountain_tiger', rel: { '@mountain_tiger': { aff: 10, res: 10 } }, rep: { unorthodox: 5 } })),
    C('Tell him you want to be him', O('He roared with laughter and clapped you on the back hard enough to dislocate something. "Then kill fewer people than I did," he said.', { meet: '@mountain_tiger', rel: { '@mountain_tiger': { aff: 5 } }, fame: 1, health: -2 })),
    Q('Ask to swear brotherhood with the Green Forest', { sect: 'none' }, O('You drank the wine with blood in it from the common bowl. The Mountain Tiger himself poured.', { join: 'greenforest', meet: '@mountain_tiger', rel: { '@mountain_tiger': { aff: 10 } }, rep: { unorthodox: 10, orthodox: -5 } })),
  ] }),
  E('wk_ban_amnesty', 'crime', { if: JOB('bandit', [18, 60]), art: 'palace', title: 'The amnesty', text: 'An imperial amnesty is read at the foot of the mountains: bandits who surrender their weapons will be pardoned and given land. Your captain says it is a trap. It may be.', choices: [
    P('Surrender and take the land', 0.65, O('It was not a trap, this time. You were given a field and an ox and a new name in the register. You are a farmer now, and nobody in your new village knows.', { career: 'farmer', infamy: -5, rep: { court: 3, unorthodox: -5 }, sanity: 4 }), O('It was a trap. You escaped the stockade at night with a soldier’s spear in your leg.', { injury: { name: 'spear wound', seasons: 3, sev: 10 }, rep: { court: -5 } })),
    C('Stay on the mountain', O('You stayed. Half the stronghold went down the mountain. You never heard from them, which could mean anything.', { rep: { unorthodox: 4 } })),
  ] }),
  E('wk_ban_blood_blade', 'crime', { on: 'work', if: JOB('bandit', [14, 50], { region: ['guanzhong', 'hebei'], year: [15, 46], alive: 'blood_blade', not: 'wk.ban.pimun' }), art: 'fire', title: 'The Blood Blade Ghost', text: 'Pi Mun, the Blood Blade Ghost, is recruiting for a raid. "A farming village in the hills," he says. "Forty roofs. We burn it, so the others pay." He is smiling. He always smiles.', choices: [
    C('Join the raid', O('You took the silver and the torch. You will remember that village in every life, whether you want to or not.', { flag: 'wk.ban.pimun', wealth: 15, infamy: 8, sanity: -10, burden: 1, codex: 'people.blood_blade' })),
    C('Refuse, and ride to warn the village', O('You rode through the night and told the village chief. He did not believe you, quite. But he posted watchmen, and he will remember your face.', { flag: ['wk.ban.pimun', 'wk.ban.warned'], rep: { unorthodox: -5 }, fame: 2, codex: 'people.blood_blade' })),
    C('Refuse and keep your head down', O('Pi Mun smiled at you. "Next time," he said. He has a long memory for refusals.', { flag: 'wk.ban.pimun', codex: 'people.blood_blade' })),
  ] }),

  // ── Assassins ───────────────────────────────────────────────────
  E('wk_asn_test', 'crime', { on: 'work', if: JOB('assassin', [15, 50], { loc: 'kaifeng', notMet: 'nameless' }), art: 'night', title: 'The Pavilion Master', text: 'Your contract tonight is very simple: walk into a room and come out again. In the room, a woman you have never seen sits drinking tea. You are sure you have never seen her. You will not remember her face tomorrow.', choices: [
    R('Sit and drink with her', 'sanity', 35, O('You drank. She talked about the weather. When you left, someone said, "She liked you." It was the master of the Blood Shadow Pavilion. You have been promoted, it seems, by tea.', { meet: '@nameless', rel: { '@nameless': { res: 15 } }, careerUp: 6 }), O('Your hand shook on the cup. She watched it shake, finished her tea, and left. Nobody mentions it, ever.', { meet: '@nameless', sanity: -4 })),
    C('Walk in, bow, and walk out', O('You bowed and left. Behind you a voice said, "Correct." You do not know what you passed.', { meet: '@nameless', careerUp: 4 })),
  ] }),
  E('wk_asn_witness', 'crime', { on: 'work', if: JOB('assassin', [16, 60]), art: 'night', text: 'The contract is done. Then, in the doorway: a little girl in her nightclothes, holding a doll by one arm, looking at you.', choices: [
    C('Kneel and tell her it is a dream', O('You knelt and told her, softly, that it was a bad dream and she should go back to bed. She went. You hope she believes it. You know you will not.', { sanity: -6 })),
    C('Leave through the window', O('You left through the window. The magistrate’s sketch, from her description, looks nothing like you, except the eyes.', { sanity: -4, flag: 'wk.asn.seen' })),
  ] }),
  E('wk_asn_banquet', 'crime', { on: 'work', if: JOB('assassin', [18, 60], { stat: { insight: '>=26' } }), art: 'feast', text: 'A banquet of two hundred guests. Your target sits at the high table, drinking from the same jar as everyone around him.', choices: [
    R('Poison only his cup', 'insight', 36, O('You poisoned the rim of his cup, and only his. He died the next morning of what the physician called a weak heart. Two hundred guests went home with headaches and no idea.', { wealth: 40, infamy: 2, careerUp: 6 }), O('Your hand slipped near the jar. Three guests fell ill with him. Two lived.', { wealth: 20, infamy: 5, sanity: -10, burden: 1 })),
    C('Poison the whole jar', O('The jar went round the high table. Seven people died, one of them the target. The Pavilion paid, and moved you to quieter work.', { wealth: 30, infamy: 8, sanity: -15, burden: 1 })),
    C('Wait for another night', O('You waited a month for another night. The client complained. The target lived a month longer, and so did everyone else at the banquet.', { wealth: -5, sanity: 2 })),
  ] }),
  E('wk_asn_retire', 'crime', { if: JOB('assassin', [35, 75]), title: 'The way out', text: 'You are getting old for this. The Blood Shadow Pavilion has a saying: nobody retires. There is a second saying that nobody repeats: nobody retires twice.', choices: [
    P('Disappear', 0.5, O('You took a new name and a boat to the south and became a seller of paper umbrellas. Nobody came. You still sleep facing the door.', { career: null, sanity: 5, infamy: -3 }), O('You disappeared. They found you in a year. You talked your way into "a long leave," which means they will need you again.', { sanity: -5, health: -5 })),
    R('Ask the Pavilion Master directly', 'fame', 30, O('She listened, and drank her tea, and said, "Granted." You do not know why. You think it may have been a kindness.', { career: null, sanity: 6 }), O('She listened, and drank her tea, and said nothing. You understood.', { sanity: -4 })),
    C('Stay', O('You stayed. It is what you know.', { careerUp: 3 })),
  ] }),
  E('wk_asn_hunted', 'crime', { if: JOB('assassin', [18, 70], { stat: { infamy: '>=20' } }), danger: true, art: 'duel', bind: { x: { age: [18, 30], role: 'enemy', aff: 0, res: 30, realm: [1, 4] } }, title: 'A son’s vengeance', text: 'A young swordsman named {x} blocks the road. "Three years ago, you killed my father," {x.he} says. "In a bathhouse. I have been looking for you ever since."', choices: [
    C('Fight', O('So be it.', { combat: { foe: 'x', context: 'duel', lethal: 0.35, important: true,
      win: { text: 'You won. You left {x.him} alive, which {x.he} will hate more than dying.', fame: 2, infamy: 2, rel: { x: { res: 10 } } },
      lose: { text: '{x} stood over you, sword at your throat, shaking. "Not like this," {x.he} said, and left. You are alive. You do not know what to do with that.', health: -10, sanity: -4 } } })),
    R('Tell {x.him} the truth about the contract', 'charm', 34, O('You told {x.him} who paid, and why, and what {x.his} father had done to earn it. {x} went very still. Then {x.he} walked away to find the person who paid.', { sanity: -2, role: { x: 'acquaintance' } }), O('{x.He} did not want the truth. {x.He} wanted you.', { combat: { foe: 'x', context: 'duel', lethal: 0.35, important: true, win: { text: 'You won, and walked away from {x.him}, and felt nothing for a long time.', infamy: 2 }, lose: { text: '{x} left you in the road, alive, because {x.he} could not finish it.', health: -12 } } })),
    R('Run', 'body', 30, O('You were gone before {x.he} finished drawing. {x.He} will keep looking.', { sanity: -2 }), O('{x.He} was faster. You took a cut across the back and kept running.', { injury: { name: 'sword cut', seasons: 2, sev: 10 } })),
  ] }),

  // ── Information brokers ─────────────────────────────────────────
  E('wk_inf_yeon', 'daily', { on: 'work', if: JOB('informant', [14, 60], { loc: 'kaifeng', notMet: 'madam_yeon' }), art: 'inn', title: 'The Thousand Ears Pavilion', text: 'Madam Yeon of the Thousand Ears Pavilion buys you a cup of the most expensive tea in Kaifeng and asks what you have heard this month. She already knows. She wants to know whether you will lie.', choices: [
    C('Tell her everything, honestly', O('She listened, and paid you more than it was worth. "Honesty is rare in this trade," she said. "Rare things are expensive." You are hers now, in a loose and pleasant way.', { meet: '@madam_yeon', rel: { '@madam_yeon': { res: 15, aff: 10 } }, wealth: 10, careerUp: 4 })),
    R('Tell her almost everything', 'charm', 34, O('She noticed what you left out, and smiled, and paid you for that too. "Good," she said. "Never sell it all."', { meet: '@madam_yeon', rel: { '@madam_yeon': { res: 20 } }, wealth: 8, careerUp: 5 }), O('She noticed what you left out and paid you for the rest, exactly. "Next time," she said.', { meet: '@madam_yeon', wealth: 4 })),
  ] }),
  E('wk_inf_double', 'daily', { on: 'work', if: JOB('informant', [14, 70]), text: 'You have one secret and two buyers: a sect elder who wants to know where a manual is hidden, and the man who hid it, who wants to know who is asking.', choices: [
    C('Sell to both', O('You sold to both. They met at the hiding place. You heard it was very loud.', { wealth: 25, infamy: 2, careerUp: 3 })),
    C('Sell to the elder', O('The elder paid, and found the manual, and recommended you to his friends.', { wealth: 12, rep: { orthodox: 2 }, careerUp: 2 })),
    C('Sell to the man who hid it', O('He paid, and moved the manual, and recommended you to his friends, who are less respectable and pay better.', { wealth: 15, rep: { unorthodox: 2 }, careerUp: 2 })),
  ] }),
  E('wk_inf_beggars', 'daily', { on: 'work', if: JOB('informant', [12, 70], { loc: 'luoyang' }), art: 'city', text: 'A cheerful beggar with nine fingers offers to trade: everything the Beggars’ Sect knows about the Ghost Market, for everything you know about the Murim Alliance’s new treasurer.', choices: [
    C('Trade', O('It was the best trade you have ever made. Hong Chil, chief of the Beggars’ Sect, ate your dumplings and told you three things you will never forget.', { meet: '@beggar_chief', rel: { '@beggar_chief': { aff: 10, res: 5 } }, codex: GHOST_MARKET, careerUp: 4 })),
    R('Ask for more', 'charm', 40, O('He laughed until he cried and gave you more. "A broker who haggles with me," he said. "My sect could use you."', { meet: '@beggar_chief', rel: { '@beggar_chief': { res: 15 } }, codex: GHOST_MARKET, insight: 2, careerUp: 5 }), O('He laughed, ate your dumplings, and left without trading. You have no idea how.', { meet: '@beggar_chief' })),
  ] }),
  E('wk_inf_depot_list', 'daily', { on: 'work', if: JOB('informant', [18, 70], { loc: 'capital', stat: { charm: '>=26' } }), art: 'palace', text: 'A Depot clerk, drunk, offers to sell you a copy of the list: every martial artist the Eastern Depot is watching in the capital. Your name may be on it.', choices: [
    Q('Buy it (40 taels)', { stat: { wealth: '>=40' } }, O('Your name was on it, misspelled, with a note: "harmless." You have never been so relieved to be insulted. You sold copies of the rest, carefully.', { wealth: 20, careerUp: 5, insight: 2 })),
    C('Report the clerk to the Depot', O('The Depot thanked you. The clerk disappeared. Your name was taken off the list, or moved to a different one.', { rep: { court: 6 }, sanity: -4, flag: 'wk.depot.friend' })),
    C('Walk away', O('You walked away. Some lists are better not read.', { sanity: 1 })),
  ] }),
  E('wk_inf_about_you', 'daily', { on: 'work', if: JOB('informant', [16, 80], LATER), art: 'inn', text: 'A fortune-teller in a stained robe tries to sell you a secret: "There is a person in this city who has died before, and come back. I know their name."', choices: [
    C('Pay to hear the name', O('He told you your own name. Then he looked at you properly, and went grey, and ran. You never found him again.', { wealth: -5, sanity: -4, gaze: 1 })),
    C('Laugh and buy him a drink', O('You bought him a drink and asked about his life instead. He was a failed monk. He did not know anything. Probably.', { wealth: -1, sanity: 1 })),
  ] }),

  // ── Odd jobs (no career) ────────────────────────────────────────
  E('wk_odd_letters', 'daily', { if: NO_JOB([12, 60], { stat: { insight: '>=12' } }), art: 'letter', text: 'You write letters at two coppers a page for soldiers who cannot write. A young one asks you to write to his mother. He talks for a long time. She died last winter, he says at the end. He wants to send it anyway.', choices: [
    C('Write it, and burn it with him', O('You wrote every word and burned it with him at the river shrine. He did not pay you. You did not let him.', { sanity: 3, charm: 1 })),
    C('Write it, and keep a copy', O('You kept a copy. You do not know why. Some letters you keep.', { insight: 1, wealth: 1 })),
  ] }),
  E('wk_odd_crate', 'daily', { if: NO_JOB([12, 45]), text: 'A merchant offers ten coppers to whoever can carry a crate from the dock to his warehouse. Three men have tried. The crate is still on the dock.', choices: [
    R('Lift it', 'body', 22, O('You carried it all the way, red-faced, and set it down without dropping it. The merchant paid you a full tael, and the men who failed bought you wine.', { wealth: 1, body: 1, fame: 1 }), O('You lifted it a hand’s width and set it down again. Your back will remember this.', { health: -4 })),
    R('Ask what is in it', 'charm', 18, O('Iron ingots. You rolled it on bamboo poles like the old builders and got there with dry hands. The merchant laughed and offered you regular work.', { wealth: 1, insight: 1 }), O('"None of your business," he said, which is what everyone says when it is iron ingots.')),
  ] }),
  E('wk_odd_kitchen', 'daily', { if: NO_JOB([12, 35], { locType: 'city' }), art: 'inn', text: 'Washing dishes at the back of an inn, you hear two martial artists arguing over wine about the breathing in a heart method, loudly and in detail.', choices: [
    R('Listen very carefully', 'insight', 22, O('You listened until the dishes were cold. You understood perhaps a third. That night you tried the breathing, and something stirred in your belly that had never stirred before.', { insight: 2, qi: 8 }), O('They switched to talking about women. You broke a bowl.', { wealth: -0.5 })),
    C('Bring them more wine and ask a question', R('Bring them more wine and ask a question', 'charm', 25, O('They were delighted to have an audience and explained everything, twice, with gestures. One of them gave you a copper and a bruise on the shoulder by way of demonstration.', { insight: 3, qi: 5 }), O('They told you to mind your dishes.', {}))),
  ] }),
  E('wk_odd_apprentice', 'daily', { if: NO_JOB([12, 22], { not: 'wk.odd.offer' }), title: 'An apprenticeship', text: 'You have been doing odd jobs for a while, and people have noticed. Three of them, as it happens, are offering apprenticeships: the blacksmith, the herbalist, and the cloth seller.', choices: [
    C('The blacksmith', O('You became a bellows boy. Your arms will never be thin again.', { career: 'smith', flag: 'wk.odd.offer' })),
    C('The herbalist', O('You became an herb gatherer. You know nine roots by smell already.', { career: 'physician', flag: 'wk.odd.offer' })),
    C('The cloth seller', O('You became a peddler of cloth, with a pack on your back and a sweet tongue in your head.', { career: 'merchant', flag: 'wk.odd.offer' })),
    C('None of them', O('You stayed free. Odd jobs are odd, but they are yours.', { flag: 'wk.odd.offer', sanity: 2 })),
  ] }),
  E('wk_odd_dike', 'daily', { if: NO_JOB([7, 12], { region: 'central', happened: 'yellow_flood', year: [8, 12] }), art: 'flood', title: 'The dike gangs', text: 'After the flood, the magistrate pays a bowl of rice a day for every pair of hands on the Yellow River dikes, and he is not counting how old the hands are. The mud is waist-deep on a grown man.', choices: [
    R('Carry baskets of earth all season', 'body', 12, O('You carried earth until the dike stood. You were thinner and stronger, and the river stayed in its bed the next spring. You were proud of that dike for the rest of your life.', { body: 2, wealth: 2, fame: 1 }), O('You came down with river fever on the third week.', { health: -12 })),
    C('Carry water to the workers instead', P('Carry water to the workers instead', 0.7, O('You ran water up and down the dike all season. The men called you Little Bucket and shared their rice with you.', { wealth: 1, charm: 1, sanity: 3 }), O('You slipped on the wet bank and the river nearly took you. A stranger pulled you out by the collar and went back to work without a word.', { health: -6, sanity: -3 }))),
  ] }),

  // ── Studying ────────────────────────────────────────────────────
  E('wk_study_margins', 'daily', { on: 'study', if: { age: [10, 80] }, art: 'library', text: 'In a second-hand book of commentaries, the margins are full of notes in a fine, impatient hand. The previous owner disagreed with everything, and was usually right.', choices: [
    C('Read the margins instead of the book', O('You read the margins for a season. On the last page, in the same hand: "If you have read this far, you are as stubborn as I was. Good." It was signed by someone who later became a minister.', { insight: 3 })),
    C('Write your own replies', O('You wrote back in the gaps, arguing. It was the best conversation you had all year, with a dead stranger.', { insight: 2, sanity: 2 })),
  ] }),
  E('wk_study_salve', 'daily', { on: 'study', if: { age: [10, 80], noMem: 'recipe.healing_salve' }, art: 'library', text: 'Among the classics on the shelf is a battered herbal with one page folded down, and a stain on it that might be blood: the recipe for Golden Wound Salve.', choices: [
    R('Study it until you understand it', 'insight', 18, O('You understood it: the proportions, the order, the heat. It is yours now, in every life you remember it.', { recipe: 'healing_salve' }), O('The stain covered the proportions. You learned only that someone had needed it badly.', { insight: 1 })),
    C('Read the poetry instead', O('You read the poetry instead. It was about a general who died far from home. You will not need the salve for that.', { sanity: 2, charm: 1 })),
  ] }),
  E('wk_study_candle', 'daily', { on: 'study', if: { age: [8, 80] }, once: false, cd: 6, text: 'You fall asleep over your books and wake to the smell of burning. The candle has fallen onto the page.', choices: [
    R('Beat it out', 'body', 12, O('You beat it out with your sleeve. One page is lost. You rewrite it from memory, which turns out to be the best way to learn it.', { insight: 2 }), O('You beat it out with your sleeve, which then also needed beating out.', { health: -3, insight: 1 })),
    C('Save the book, sacrifice the sleeve', O('The book lived. The sleeve did not. Your mother, or someone like her, sighed.', { charm: -1, insight: 1 })),
  ] }),
  E('wk_study_meridians', 'daily', { on: 'study', if: { age: [12, 90], realm: '>=1' }, art: 'scroll', text: 'An old chart of the meridians, copied and recopied for three hundred years, has a mistake in it: a channel drawn where there is none. Or is there?', choices: [
    R('Trace it in your own body', 'insight', 30, O('You sat with your qi and felt for it. There was something there: a narrow channel the chart-makers had drawn by accident, or by memory. Qi moved through it like a key turning.', { qi: 20, insight: 2, codex: { id: 'theory.wk_hidden_channel', cat: 'theory', title: 'The copyist’s channel', text: 'Old meridian charts show a thin channel from the Spirit Gate to the Inner Pass that modern charts leave out. It is real. Qi moves through it faster than anywhere else.' } }), O('You felt for it and found only a cramp.', { health: -2 })),
    C('Correct the chart', O('You corrected it neatly. A teacher praised your accuracy. You wonder, sometimes, what you erased.', { insight: 1 })),
  ] }),
  E('wk_study_jegal', 'bonds', { on: 'study', if: { age: [14, 50], region: 'hebei', notMet: 'jegal_ha' }, art: 'library', text: 'At the prefectural library a young woman has borrowed the book you wanted. She has borrowed every book you wanted, it turns out, for a month, and she has left notes in all of them.', choices: [
    C('Leave a note back', O('You left a note: "Your third point is wrong." The next day: "Prove it." You argued in the margins for a season before you met. Her name was Jegal Ha, and she lost the first argument on purpose.', { meet: '@jegal_ha', rel: { '@jegal_ha': { aff: 10, res: 15 } }, insight: 2 })),
    C('Ask the librarian who she is', O('"Jegal," the librarian said, as if that explained everything. In Hebei, it does.', { insight: 1 })),
  ] }),
  E('wk_study_child', 'daily', { on: 'study', if: { age: [5, 9] }, art: 'library', text: 'You are learning to write your name. The teacher’s brush moves like a bird. Yours moves like a duck.', choices: [
    C('Practise a hundred times', O('A hundred times. By the hundredth, it was a bird. A small, angry bird, but a bird.', { insight: 2 })),
    C('Draw a duck instead', O('You drew a duck. The teacher pretended to be angry, then laughed, then hung it on the wall.', { charm: 1, sanity: 2 })),
  ] }),

  // ── Physician visits ────────────────────────────────────────────
  E('wk_dr_quack', 'daily', { on: 'doctor', if: { age: [14, 90] }, text: 'This physician has a gold sign, a silk robe, and a special offer: an Immortality Pill, only fifty taels, guaranteed or your money back.', choices: [
    C('Ask how the guarantee works', O('"If it does not work," he said, "come back after you die." You laughed so hard you forgot what you came for.', { sanity: 3 })),
    Q('Buy one (50 taels)', { stat: { wealth: '>=50' } }, O('It was a ball of honey and pine resin, rolled in gold leaf. It tasted wonderful. You did not become immortal, as far as you can tell.', { wealth: -50, health: 3 })),
    R('Expose him', 'insight', 25, O('You cracked the pill open in front of his customers. Honey, resin, gold leaf. He left town that night with his sign.', { fame: 2 }), O('His customers took his side. Hope is expensive and they had already paid.', { charm: -1 })),
  ] }),
  E('wk_dr_old_scar', 'daily', { on: 'doctor', if: { ...LATER, age: [10, 90] }, text: 'The physician runs her thumb along your ribs and frowns. "There is an old wound here," she says. "A sword, I would say, a deep one. When did it happen?" There is no wound. Not in this life.', choices: [
    C('Tell her it was a long time ago', O('"It must have been," she said slowly. "It healed very strangely." You walked home with your hand on your ribs, remembering the cold of it.', { sanity: -3, insight: 1 })),
    C('Ask her what else she sees', O('She looked at you a long time. "A body that remembers more than it should," she said. "Rest. Do not be in a hurry to die." It was good advice. You will probably not take it.', { sanity: 2 })),
  ] }),
  E('wk_dr_needles', 'daily', { on: 'doctor', if: { age: [14, 90] }, text: 'The physician suggests acupuncture: forty silver needles, she says, will clear the blockage in your meridians. She is already laying them out.', choices: [
    R('Lie still and breathe', 'sanity', 25, O('You breathed through forty needles. Something unknotted in your back that had been knotted for years. Qi moved more easily for a month.', { qi: 10, health: 5 }), O('You flinched on the twelfth needle. She sighed and charged you for forty.', { wealth: -2 })),
    C('Decline the needles', O('She shrugged and prescribed a tea so bitter you suspect it was revenge.', { health: 3 })),
  ] }),
  E('wk_dr_herb_offer', 'daily', { on: 'doctor', if: { age: [12, 25], career: 'none', stat: { insight: '>=14' } }, text: 'While the physician wraps your ankle, you name three of the herbs on her shelf by smell. She stops wrapping. "Who taught you that?"', choices: [
    C('Ask her to teach you more', O('She looked at you for a long moment, and then put a basket in your hands. "Herb gatherer," she said. "Tomorrow, at dawn. Do not be late."', { career: 'physician' })),
    C('Tell her nobody did', O('"Then you have a nose," she said. "Use it." You went home and smelled everything in the kitchen.', { insight: 2 })),
  ] }),
  L('wk_dr_toddler', 'daily', { age: [1, 5] }, 'The physician gave you a sweet to stop you crying, and then a bitter medicine, and then another sweet. You learned something about the world that day.', { health: 3 }, { on: 'doctor' }),
  E('wk_dr_war_wound', 'daily', { on: 'doctor', if: { age: [16, 90], injured: true }, text: 'The physician probes your wound and goes quiet. "Someone put poison on this blade," she says, "and someone else, later, put something on the wound to save you. Who?"', choices: [
    C('Say you do not know', O('"Then you have a friend you do not know about," she said. "Or an enemy who wants you alive." She cleaned the wound with something that hurt more than the sword.', { health: 8, cure: 'poison' })),
    R('Ask what it was', 'insight', 28, O('She showed you the stain on the dressing: Dang green, neutralised by a Shaolin powder. A strange pairing. You will be thinking about it for some time.', { health: 8, insight: 2, cure: 'poison' }), O('She did not know either, and charged you for the mystery.', { health: 6, wealth: -2 })),
  ] }),

  // ── Every trade ─────────────────────────────────────────────────
  E('wk_any_bosses_son', 'daily', { if: { career: ['merchant', 'escort', 'smith', 'physician'], age: [16, 50] }, bind: { x: { age: [16, 26], role: 'rival', aff: 20, res: 10 } }, text: 'Your employer’s son, {x}, has joined the business. {x.He} is lazy, takes credit for your work, and is going to inherit everything.', choices: [
    R('Teach {x.him} the trade', 'charm', 28, O('It took a year. {x} turned out to be lazy because nobody had ever expected anything of {x.him}. You did. {x.He} is not lazy now, and {x.he} tells people who taught {x.him}.', { role: { x: 'friend' }, rel: { x: { aff: 25, res: 20 } }, careerUp: 4 }), O('{x} learned nothing and resented you for trying.', { rel: { x: { aff: -10 } } })),
    C('Let {x.him} fail', O('{x} failed, loudly and expensively. {x.His} father finally noticed who did the real work. So did {x}.', { careerUp: 5, rel: { x: { aff: -15 } } })),
    C('Quit', O('You quit. You will find work elsewhere. You always do.', { career: null, sanity: 3 })),
  ] }),
  E('wk_any_midlife', 'daily', { if: { career: ['merchant', 'farmer', 'smith', 'scholar', 'informant', 'escort'], age: [38, 55] }, art: 'road', text: 'One morning you look at your hands, and your trade, and the road out of town, and wonder what you would have been if you had taken it.', choices: [
    C('Take the road', O('You gave up your trade and walked out of town with a bundle and a stick. It was terrifying. You have never felt younger.', { career: null, sanity: 6, insight: 2 })),
    C('Stay, and take a holiday', O('You took a season off and went to the mountains. You came back and worked better than before. Sometimes the road only needs to be looked at.', { sanity: 4, wealth: -5 })),
    C('Stay', O('You stayed. It is a good life. It is your life.', { sanity: 1 })),
  ] }),
  E('wk_any_retire', 'daily', { if: { career: ['merchant', 'farmer', 'smith', 'physician', 'scholar', 'escort', 'informant'], age: [62, 95] }, art: 'feast', title: 'Putting down the tools', text: 'Your hands ache in the mornings now. The young ones in your trade call you "elder" and ask your advice, and sometimes take it.', choices: [
    C('Retire, with a feast', O('You retired with a feast. People you had forgotten came to toast you. You made a speech, which was too long, and nobody minded.', { career: null, sanity: 8, fame: 2 })),
    C('Keep working until you drop', O('You kept working. Somebody has to show the young ones how it is really done.', { careerUp: 2, health: -3 })),
  ] }),
];

export default [...HAND, ...tplRoute, ...tplExam, ...tplPatient, ...tplCommission, ...tplDeal, ...tplField, ...tplHeist, ...tplContract, ...tplRumor, ...tplOdd, ...tplBoss];
