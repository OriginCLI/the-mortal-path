// Bonds, part two: friendships that deepen or sour, sworn siblings, masters and the disciples you take,
// romance arcs with the named roster (three stages each, chained by `bn.rom.<key>` flags), married life,
// children growing up, parents growing old, rivals who become friends, betrayal, reunions, letters,
// grief, and the regressor's particular loneliness: meeting people again who do not remember you.
import { E, O, C, R, P, M, Q, L, LATER } from './kit.js';
import { template } from '../../engine/registry.js';

// The dead cannot be bound to roles, so grief events test for a recent death by role and speak of the
// person by their role ("your mother") rather than by name.
const CLOSE = ['mother', 'father', 'sibling', 'spouse', 'child', 'lover', 'sworn', 'master', 'disciple', 'friend', 'guardian'];
const lost = (roles, yrs) => (g) => Object.values(g.life.npcs)
  .some((n) => n.dead && n.met && [].concat(roles).includes(n.role) && g.year - (n.deathYear ?? -999) <= yrs);
const mourned = (count) => (g) => Object.values(g.life.npcs).filter((n) => n.dead && n.met && CLOSE.includes(n.role)).length >= count;

// Roles a named person can hold and still be courted from scratch.
const OPEN = [null, 'acquaintance', 'friend', 'senior', 'junior', 'rival'];

// Memories of a marriage in another life. Defined where the marriage happens (bn_vow), used by the first
// meeting of a later life (bn_spark) and by the regression reunions.
const VOW = {
  harin: { id: 'bn.vow.harin', cat: 'people', title: 'Married to Ok Ha-rin, once', text: 'In another life you married Ok Ha-rin on Mount Hua, under the plum trees. She laughs with her whole face, is afraid of nothing but the dark, and wants to be buried where the blossoms fall.' },
  jiho: { id: 'bn.vow.jiho', cat: 'people', title: 'Married to Han Ji-ho, once', text: 'In another life you married Han Ji-ho and lived in the crooked house he built above the mill. He hums when he is worried. He promised you, by the mill race, that he would always come and find you.' },
  bora: { id: 'bn.vow.bora', cat: 'people', title: 'Married to Yun Bo-ra, once', text: 'In another life Yun Bo-ra proposed to you in writing, with footnotes. She cannot sleep without a book on the pillow and pretends not to cry at the ends of stories.' },
  sohee: { id: 'bn.vow.sohee', cat: 'people', title: 'Married to Namgung So-hee, once', text: 'In another life you married Namgung So-hee against her father’s wishes, or with them. She practises alone at dawn, and the only person she ever let watch was you.' },
  haryeong: { id: 'bn.vow.haryeong', cat: 'people', title: 'Married to Dan Ha-ryeong, once', text: 'In another life you married the Young Heavenly Demon at a new moon. She counts stars when she cannot sleep, and she asked you, only once, whether you would rather not.' },
  yeonwoo: { id: 'bn.vow.yeonwoo', cat: 'people', title: 'Married to Song Yeon-woo, once', text: 'In another life you married Song Yeon-woo of Wudang. He apologised four times during the ceremony. He keeps a dried pine needle from the day he asked, and thinks you do not know.' },
  hyeryeong: { id: 'bn.vow.hyeryeong', cat: 'people', title: 'Married to Gang Hye-ryeong, once', text: 'In another life you married Gang Hye-ryeong after a nine-course banquet. She apologises with food and fights with her whole heart, and her favourite dish is the one she burned the night you met.' },
  moyong_yeon: { id: 'bn.vow.moyong_yeon', cat: 'people', title: 'Married to Moyong Yeon, once', text: 'In another life you married Moyong Yeon in a small cold ceremony she said was perfect. She wrote forty pages about you, bound in blue silk. The last page asked a question.' },
  dang_min: { id: 'bn.vow.dang_min', cat: 'people', title: 'Married to Dang Min, once', text: 'In another life you married Dang Min, who gave you a ring with every antidote of the Dang family hidden in its stone. He is clumsy with everything except medicine.' },
  jegal_ha: { id: 'bn.vow.jegal_ha', cat: 'people', title: 'Married to Jegal Ha, once', text: 'In another life you married Jegal Ha, who planned the proposal eleven moves ahead and panicked on the twelfth. She loses at baduk on purpose to people she loves, by exactly half a point.' },
  gaeun: { id: 'bn.vow.gaeun', cat: 'people', title: 'Married to Seo Ga-eun, once', text: 'In another life you married Seo Ga-eun by contract, with a clause about dinner every fifth day. She can price a horse by its gait and a person by their silences.' },
  taeo: { id: 'bn.vow.taeo', cat: 'people', title: 'Married to Kang Tae-o, once', text: 'In another life you married Kang Tae-o, who saved three years for a silver hairpin and dropped it in the street. He is a terrible liar and the bravest person you ever knew.' },
  seol: { id: 'bn.vow.seol', cat: 'people', title: 'Married to Yu Seol-hwa', text: 'In one life you married the other regressor. Neither of you will ever be able to pretend it did not happen: she remembers too.' },
};

const SWORN_MEMORY = { id: 'bn.sworn.memory', cat: 'people', title: 'An oath under peach blossoms', text: 'In another life you swore to raise your sworn sibling’s children if the worst happened. You remember the promise better than the face.' };
const LINEAGE = { id: 'bn.master.lineage', cat: 'people', title: 'A name in the lineage', text: 'Once, a master wrote your name beneath their own in a lineage scroll. The ink smelled of pine soot. They told you not to make them regret it.' };
const FACE = { id: 'bn.face', cat: 'people', title: 'A face you memorised', text: 'In one life you lay awake memorising the sleeping face of the person you married, because you knew how quickly faces go. It went anyway.' };
const MILK_NAME = { id: 'bn.child.name', cat: 'people', title: 'A child’s milk-name', text: 'You had a child, once. You remember the milk-name, the weight of them in the crook of your arm, the smell of their hair. They will not be born again unless the dice fall the same way, and they never do.' };
const LETTERS = { id: 'bn.mother.letters', cat: 'people', title: 'Letters tied with red thread', text: 'In another life your mother kept every letter you ever sent her, tied with red thread, in order. There were not many. The folds had worn through.' };

const HAND = [
  // ── Friendship, deepening and fraying ───────────────────────────
  E('bn_friend_roof', 'bonds', { if: { has: 'friend', age: [12, 70] }, once: false, cd: 5, bind: { x: 'friend' }, art: 'moon', text: '{x} has climbed onto your roof in the middle of the night with two cushions and a bag of roasted chestnuts. "The stars are better from up here," {x.he} says. They are not.', choices: [
    C('Climb up', O('You stayed until the chestnuts ran out and the sky went grey. {x} told you what {x.he} is afraid of. You told {x.him} yours.', { rel: { x: { aff: 10, res: 3 } }, sanity: 4 })),
    C('Tell {x.him} the roof leaks for a reason', O('You sent {x.him} down. {x.He} left the chestnuts on your step, which was worse.', { rel: { x: { aff: -3 } }, sanity: -1 })),
  ] }),
  E('bn_friend_sibling', 'bonds', { if: { has: ['friend', 'sibling'], age: [16, 50] }, bind: { x: 'friend', y: 'sibling' }, text: 'Your friend {x} confesses, scarlet to the ears, that {x.he} has been in love with {y} for three years and would like your permission to say so.', choices: [
    C('Give your blessing', O('You gave it. {x} hugged you hard enough to make something click. Whatever {y} said, {x.he} smiled for a month.', { rel: { x: { aff: 12 }, y: { aff: 5 } } })),
    R('Warn {x.him} what {y} is really like', 'charm', 25, O('You told every embarrassing story you know. {x} listened carefully and fell further in love. {y} has not forgiven you for the stories.', { rel: { x: { aff: 8 }, y: { aff: -4 } }, charm: 1 }), O('{x} took it as a refusal. Things were stiff between you for a year.', { rel: { x: { aff: -8 } } })),
    C('Forbid it', O('You forbade it. They courted anyway, and made a point of seating you next to the latrine at every family dinner.', { rel: { x: { aff: -12 }, y: { aff: -10 } } })),
  ] }),
  E('bn_friend_ruin', 'bonds', { if: { has: 'friend', age: [18, 70] }, bind: { x: 'friend' }, text: '{x}’s shop has failed. {x.He} will not take money from you; {x.he} has said so twice, which means {x.he} has thought about it.', choices: [
    Q('Buy {x.his} debts quietly (25 taels)', { stat: { wealth: '>=25' } }, O('You bought the debts through a broker and burned them. {x} found out eventually, did not speak to you for a season, and never again let you pay for a meal.', { wealth: -25, rel: { x: { aff: 15, res: 5 } } })),
    C('Carry crates beside {x.him} until it reopens', O('You hauled crates for a season. People laughed. The shop reopened in spring with your name painted, very small, under the counter.', { rel: { x: { aff: 12 } }, body: 1, wealth: -3 })),
    C('Respect {x.his} pride', O('You respected it. {x} moved to a cousin’s village. The letters stopped after a year.', { rel: { x: { aff: -6 } } })),
  ] }),
  E('bn_friend_uniform', 'bonds', { if: { has: 'friend', age: [18, 60], notSect: 'easterndepot' }, bind: { x: 'friend' }, art: 'palace', text: '{x} has joined the Eastern Depot. {x.He} comes to tell you in person, in the black and silver, and stands very straight, waiting to see what you will do.', choices: [
    C('Pour {x.him} a cup anyway', O('You poured. {x} drank, and the uniform sat between you like a third guest. You are still friends. You are careful now.', { rel: { x: { aff: 6 } }, rep: { court: 2 } })),
    R('Ask what {x.he} has already had to do', 'insight', 30, O('{x} told you, after the third cup. You wished {x.he} had not. You are the only one {x.he} has told.', { rel: { x: { aff: 10 } }, sanity: -3, flag: 'bn.friend.depot' }), O('{x} smiled the Depot smile. "Paperwork," {x.he} said. Something went out of the evening.', { rel: { x: { aff: -5 } } })),
    C('Show {x.him} the door', O('You showed {x.him} the door. {x.He} went through it without a word, the way the Depot teaches.', { rel: { x: { aff: -20, role: 'acquaintance' } }, rep: { court: -2 } })),
  ] }),
  E('bn_friend_old', 'bonds', { if: { has: 'friend', age: [60, 200] }, bind: { x: 'friend' }, art: 'lake', text: 'You and {x} sit on a bench by the water, two old people arguing about a duel that happened forty years ago. Neither of you remembers who won. Both of you are certain.', choices: [
    C('Concede, finally', O('You conceded. {x} was so shocked that {x.he} conceded too. You both won, at last.', { rel: { x: { aff: 10 } }, sanity: 5 })),
    C('Never concede', O('You did not concede. Neither did {x}. You will both die certain, and it is one of the best afternoons you have had in years.', { rel: { x: { aff: 5, res: 5 } }, sanity: 3 })),
  ] }),
  E('bn_friend_tales', 'bonds', { if: { has: 'friend', age: [16, 80], stat: { fame: '>=10' } }, bind: { x: 'friend' }, art: 'inn', text: 'Your friend {x} has been telling the story of how you met in every tavern in {region}. In the latest version you killed a tiger. There was no tiger.', choices: [
    C('Let the tiger stand', O('The tiger grew a second head by summer. Strangers buy you drinks now, and ask about the heads.', { fame: 3, rel: { x: { aff: 3 } } })),
    C('Correct the record', O('You told the true story. It involved a goose. Nobody believed it, and {x} sulked.', { charm: 1, sanity: 1, rel: { x: { aff: -2 } } })),
  ] }),

  // ── Sworn siblings ──────────────────────────────────────────────
  E('bn_sworn_second', 'bonds', { if: { has: 'sworn', age: [16, 60], realm: '>=1' }, bind: { x: 'sworn' }, art: 'duel', text: '{x} has insulted a Qingcheng swordsman, and the Qingcheng Sect forgets no insult. The duel is at dawn. {x}, bandaged from a previous misunderstanding, has named you as {x.his} second.', choices: [
    C('Fight in {x.his} place', O('You took {x}’s place on the field.', { combat: { foe: { name: 'a Qingcheng swordsman', kind: 'disciple', rel: 0 }, context: 'duel', win: { text: 'You won, cleanly, and bowed to the Qingcheng man, who did not bow back. {x} cheered so loudly {x.his} bandages came loose.', rel: { x: { aff: 15, res: 10 } }, rep: { orthodox: -2 }, fame: 2 }, lose: { text: 'You lost, honourably. {x} carried you home and swore to avenge you. You made {x.him} swear not to.', rel: { x: { aff: 10 } } } } })),
    R('Talk the Qingcheng man out of it', 'charm', 30, O('It took a long apology and a longer lunch. The Qingcheng man left mollified. {x} was annoyed to be denied a fight.', { rel: { x: { aff: 4 } }, rep: { orthodox: 2 } }), O('He would not be talked down. You took {x} and left town by the back road before dawn.', { rel: { x: { res: -5 } }, fame: -1 })),
    C('Make {x} apologise', O('{x} apologised through clenched teeth. "I will remember this," {x.he} said, meaning you, not the Qingcheng man.', { rel: { x: { aff: -6 } }, insight: 1 })),
  ] }),
  E('bn_sworn_guardian', 'bonds', { if: { has: 'sworn', age: [20, 60] }, bind: { x: 'sworn' }, art: 'inn', text: '{x} asks you, drunk and very serious, to raise {x.his} children if anything happens to {x.him}. {x.He} does not have children yet. {x.He} wants it settled first.', choices: [
    C('Swear it', O('You swore it on the same knife as the first oath. {x} wept, then fell asleep on the table, satisfied.', { flag: 'bn.sworn.guardian', rel: { x: { aff: 10 } }, codex: SWORN_MEMORY })),
    C('Tell {x.him} nothing is going to happen', O('"That is what everyone says," {x} said, "right before."', { rel: { x: { aff: 2 } }, sanity: -1 })),
  ] }),
  E('bn_sworn_dice', 'bonds', { if: { has: 'sworn', age: [16, 60], chance: 0.26 }, bind: { x: 'sworn' }, title: 'Dice', text: 'The money you left with {x} for safekeeping is gone. {x} lost it at dice in Kaifeng, all of it, and has come to tell you before you hear it from someone else.', choices: [
    C('Forgive {x.him}', O('You forgave {x.him}. The oath said nothing about money. You wish it had.', { wealth: -15, rel: { x: { aff: 5 } }, sanity: -2 })),
    C('Make {x.him} work it off', O('{x} worked it off hauling your firewood for a year, cheerfully, which was its own punishment for both of you.', { wealth: -5, rel: { x: { res: 5, aff: -3 } } })),
    C('Break the oath', O('You cut the oath with the knife you made it with. {x} wept. You did not, until later.', { wealth: -15, role: { x: 'acquaintance' }, rel: { x: { aff: -30 } }, sanity: -6, flag: 'bn.betrayed' })),
  ] }),
  E('bn_sworn_day', 'bonds', { if: { has: 'sworn', season: 0, age: [16, 200] }, once: false, cd: 4, bind: { x: 'sworn' }, art: 'blossom', text: 'Spring again. Every year on the day you swore, {x} turns up with a jar of wine and the same bad joke about peaches.', choices: [
    C('Laugh at the joke as if it were new', O('You laughed. {x} beamed. Some jokes are rituals.', { rel: { x: { aff: 6 } }, sanity: 4 })),
    C('Tell a worse joke first', O('You told a worse one. {x} was outraged, and then delighted, and then told {x.his} anyway.', { rel: { x: { aff: 8 } }, charm: 1, sanity: 3 })),
  ] }),

  // ── Masters ─────────────────────────────────────────────────────
  E('bn_master_forbidden', 'bonds', { if: { has: 'master', age: [10, 40], realm: '>=1' }, bind: { x: 'master' }, text: 'Your master {x} has caught you practising a move you invented yourself. It is not in any manual {x.he} ever gave you.', choices: [
    R('Show {x.him} the whole thing', 'insight', 25, O('{x} watched in silence. Then {x.he} corrected one angle and said, "Now it is a technique."', { rel: { x: { res: 10 } }, insight: 2 }), O('{x} watched in silence. "That will get you killed," {x.he} said, and showed you exactly how.', { health: -4, insight: 1, rel: { x: { res: 3 } } })),
    C('Apologise and keep to the forms', O('You apologised. {x} looked, for a moment, almost disappointed.', { rel: { x: { aff: 4, res: -3 } }, sanity: -1 })),
  ] }),
  E('bn_master_challenge', 'bonds', { if: { has: 'master', age: [16, 60], realm: '>=2' }, bind: { x: 'master' }, danger: true, art: 'duel', text: 'An old enemy of your master {x} has come to the gate: a grey-haired swordsman with a grudge older than you. {x} is not as strong as {x.he} was, and you both know it.', choices: [
    C('Fight in {x.his} place', O('You stepped past your master into the yard.', { combat: { foe: { name: 'your master’s old enemy', kind: 'disciple', rel: 1 }, context: 'duel', lethal: 0.25, important: true, win: { text: 'You won. The old swordsman bowed to you, then to {x}. "You raised a good one," he said, and left. {x} said nothing all evening, which from {x.him} is a speech.', rel: { x: { aff: 15, res: 20 } }, fame: 4 }, lose: { text: 'You lost. {x} stepped in at the last moment and ended it with a cut you had never seen. "You were not ready," {x.he} said. "But you were brave."', rel: { x: { aff: 10, res: 5 } } } } })),
    P('Let {x.him} fight', 0.6, O('{x} won, slowly, and sat down afterwards for a long time. "Old fools should not do that," {x.he} said.', { rel: { x: { res: 5 } }, insight: 2 }), O('{x} lost. The swordsman wiped his blade and left without looking back. Your master lived three more days.', { kill: 'x', sanity: -10 })),
    R('Find out what the grudge is about', 'insight', 30, O('A woman, forty years ago, who married neither of them. You got them drinking instead of fighting. By midnight they were weeping on each other’s shoulders.', { rel: { x: { aff: 10 } }, insight: 1 }), O('Neither would tell you. The duel went ahead at dawn, and {x} won by a hair.', { rel: { x: { res: 3 } }, sanity: -3 })),
  ] }),
  E('bn_master_lineage', 'bonds', { if: { has: 'master', age: [22, 70], realm: '>=3' }, bind: { x: 'master' }, art: 'scroll', title: 'The lineage scroll', text: 'Your master {x} has written your name in the lineage scroll, directly beneath {x.his} own. The ink is still wet. "Do not make me regret it," {x.he} says.', choices: [
    C('Bow nine times', O('You bowed nine times, forehead to the floor. {x} pretended to be busy with the inkstone.', { rel: { x: { aff: 10, res: 10 } }, fame: 2, codex: LINEAGE })),
    R('Ask what {x.he} regrets', 'charm', 30, O('{x} told you: a disciple before you, who left and never wrote. You had not known there was one.', { insight: 2, rel: { x: { aff: 8 } }, codex: LINEAGE }), O('{x} rolled up the scroll. "Ask me when I am dying," {x.he} said.', { rel: { x: { res: -2 } }, codex: LINEAGE })),
  ] }),
  E('bn_master_again', 'bonds', { if: { ...LATER, mem: 'bn.master.lineage', age: [8, 20], hasNot: 'master' }, art: 'meditation', text: 'In this life nobody has written your name beneath their own. Some mornings you still bow before you train, to someone who does not know you exist yet.', choices: [
    C('Train the way you were taught', O('You trained the old way, every correction in its place. It felt like being watched over.', { qi: 10, insight: 1, sanity: -2 })),
    C('Train the way you would teach', O('You trained as if someone small were copying you from behind a haystack. It made you better.', { insight: 3 })),
  ] }),

  // ── Disciples ───────────────────────────────────────────────────
  E('bn_disciple_assembly', 'bonds', { if: { has: 'disciple', age: [28, 120] }, bind: { x: 'disciple' }, art: 'tournament', text: '{x} has put {x.his} name down for the Dragon-Phoenix Assembly qualifiers without asking you, and is now terrified you will be angry.', choices: [
    P('Be angry, then coach {x.him}', 0.5, O('{x} reached the second round and lost to a Namgung. {x.He} came back taller.', { npcRealm: { x: 1 }, rel: { x: { res: 8 } }, fame: 2 }), O('{x} lost in the first round, to a girl with a fan. {x.He} wants to try again in six years.', { rel: { x: { aff: 5 } } })),
    C('Withdraw {x.his} name', O('You withdrew it. {x} said nothing. {x.He} trained twice as hard, out of spite, which was the point.', { rel: { x: { aff: -10, res: 3 } } })),
  ] }),
  E('bn_disciple_love', 'bonds', { if: { has: 'disciple', age: [28, 120], npc: { x: { age: '>=16' } } }, bind: { x: 'disciple' }, text: '{x} has fallen in love with a disciple of a sect yours has been feuding with for three generations. {x.He} came to you first, which you suppose is a compliment.', choices: [
    C('Bless it', O('You blessed it. Your elders were not consulted. They noticed.', { rel: { x: { aff: 15 } }, sanity: 2, infamy: 1 })),
    C('Forbid it', O('You forbade it. {x} obeyed. {x.He} has never quite looked at you the same way since.', { rel: { x: { aff: -15, res: 5 } } })),
    R('Arrange tea with the other master', 'charm', 30, O('The other master was as tired of the feud as you. The wedding was small, and both sects pretended not to attend.', { rel: { x: { aff: 15 } }, fame: 2 }), O('The other master threw the tea at you. The feud has a fourth generation now.', { rel: { x: { aff: 5 } }, infamy: 1 })),
  ] }),
  E('bn_disciple_deviation', 'bonds', { if: { has: 'disciple', realm: '>=2', age: [25, 200] }, bind: { x: 'disciple' }, art: 'night', title: 'Qi deviation', text: 'Your disciple {x} has gone into qi deviation in the middle of the night: veins standing black, eyes rolled back, qi tearing through {x.his} meridians like a river through a broken dam.', choices: [
    R('Guide {x.his} qi with your own', 'realm', 30, O('{x} came back to {x.him}self at dawn, weak and alive. Your own meridians ached for a month.', { health: -10, rel: { x: { aff: 15, res: 10 } } }), O('{x} lived. {x.His} dantian did not. {x.He} will never cultivate again, and has not yet asked you why you could not save it.', { npcRealm: { x: -8 }, sanity: -8, rel: { x: { aff: 5 } } })),
    Q('Burn Heart-Calming Incense by {x.his} head', { item: 'heart_calming' }, O('The smoke reached {x} before the madness did. {x.He} slept for two days and woke up hungry.', { take: { heart_calming: 1 }, rel: { x: { aff: 10 } } })),
    P('Run for a physician', 0.4, O('The physician arrived in time, and charged accordingly.', { wealth: -10, rel: { x: { aff: 5 } } }), O('You came back with the physician and found {x} very still.', { kill: 'x', sanity: -12 })),
  ] }),
  E('bn_disciple_why', 'bonds', { if: { has: 'disciple', age: [28, 200] }, bind: { x: 'disciple' }, text: '{x} asks you, between drills, why you fight at all. It is a better question than {x.he} knows.', choices: [
    C('"To protect people."', O('{x} nodded, satisfied. You were less satisfied.', { rel: { x: { aff: 5 } }, rep: { orthodox: 1 } })),
    C('"Because I do not know how to stop."', O('{x} looked at you for a long time and did not ask again.', { insight: 2, rel: { x: { res: 5 } }, sanity: -2 })),
    C('"Because I have died, and I mean to do it better."', O('{x} laughed, then saw your face, and stopped.', { insight: 1, rel: { x: { res: 10 } }, sanity: 2 }), { show: LATER }),
  ] }),
  E('bn_disciple_grand', 'bonds', { if: { has: 'disciple', age: [40, 200], npc: { x: { age: '>=25' } } }, bind: { x: 'disciple' }, art: 'garden', text: '{x} has taken a disciple of {x.his} own: a solemn child who calls you "Grand-master" and is terrified of you.', choices: [
    C('Be magnificently terrifying', O('You were terrifying. The child will tell this story to {x.his} own disciples one day, embellished.', { fame: 1, sanity: 3, rel: { x: { res: 5 } } })),
    C('Slip the child sweets behind {x}’s back', O('You slipped the child candied haws. {x} caught you, and pretended not to have.', { sanity: 5, rel: { x: { aff: 5 } } })),
  ] }),
  E('bn_disciple_leave', 'bonds', { if: { has: 'disciple', npc: { x: { age: '>=18' } } }, bind: { x: 'disciple' }, art: 'road', text: '{x} wants to leave and wander the Gangho, the way you once did. {x.He} has polished {x.his} sword three times this morning and still cannot look at you.', choices: [
    C('Give {x.him} your old sword tassel', O('You tied it on {x.his} hilt yourself. You will hear of {x.him} for years, here and there, in other people’s stories.', { rel: { x: { aff: 15 } }, sanity: -2, fame: 1 })),
    C('Tell {x.him} {x.he} is not ready', O('{x} stayed. {x.He} was ready. You both know it.', { rel: { x: { res: 5, aff: -8 } } })),
  ] }),
  E('bn_vengeance_done', 'bonds', { on: 'scheduled', if: { npc: { x: { alive: true } } }, bind: { x: 'disciple' }, art: 'night', title: 'Blood on the sleeve', text: '{x} has come back. Years ago {x.he} knelt in the rain asking to learn how to kill a man. Tonight there is blood on {x.his} sleeve and nothing at all in {x.his} face.', choices: [
    C('Take {x.him} in and wash the sleeve', O('You washed it yourself. {x} sat by the fire all night and never once said the man’s name.', { rel: { x: { aff: 10 } }, sanity: -5 })),
    C('Ask if it was worth it', O('"No," {x} said. "You knew it would not be. You taught me anyway."', { insight: 2, sanity: -4, rel: { x: { aff: 5, res: -5 } } })),
    C('Turn {x.him} over to the magistrate', O('You walked {x.him} to the yamen yourself. {x} did not resist, and did not look back.', { role: { x: 'acquaintance' }, rel: { x: { aff: -40 } }, fame: 2, sanity: -6 })),
  ] }),

  // ── Courtship and the beloved ───────────────────────────────────
  E('bn_lover_suitor', 'bonds', { if: { has: 'lover', age: [16, 40] }, bind: { x: 'lover', y: { role: 'acquaintance', ageRel: [-2, 6], minAge: 16, aff: 10, res: 20, realm: [0, 2] } }, text: 'A wealthy suitor named {y} has been sending {x} gifts: silk, a caged songbird, a horse. {x} has sent them all back, but keeps glancing at you, waiting to see if you mind.', choices: [
    C('Mind, loudly', O('You minded, loudly and at length. {x} looked enormously pleased with {x.him}self.', { rel: { x: { aff: 6 } }, sanity: -1 })),
    C('Challenge {y} to a duel', O('You sent {y} a challenge, which {y.he} accepted out of pride.', { combat: { foe: 'y', context: 'duel', lethal: 0.1, win: { text: '{y} went home with a bruise and no more gifts to send. {x} pretended to disapprove.', fame: 2, rel: { x: { aff: 6 }, y: { role: 'rival' } } }, lose: { text: '{y} won and sent {x} one more gift: your sword. {x} sent it back to you with a note: "Idiot."', rel: { x: { aff: 4 } } } } })),
    C('Trust {x.him}', O('You trusted {x.him}. {x} trusted you back. The horse, you heard, went to a farmer who needed it.', { rel: { x: { aff: 10, res: 5 } } })),
  ] }),
  E('bn_lover_promise', 'bonds', { if: { has: 'lover', age: [16, 60] }, bind: { x: 'lover' }, art: 'road', text: 'You are leaving: a mission, a war, a road too long to see the end of. {x} ties a red thread around your wrist and asks you to promise to come back.', choices: [
    C('Promise', O('You promised. {x} tied the knot three times, for luck.', { flag: 'bn.thread', rel: { x: { aff: 10 } }, sanity: 3 })),
    C('Promise only to try', O('"That is the only honest promise," {x} said, and tied the knot tighter.', { flag: 'bn.thread', rel: { x: { res: 6, aff: 5 } } })),
    P('Ask {x.him} to come with you', 0.5, O('{x} packed in an hour. You learned on the road that {x.he} snores. You did not mind.', { rel: { x: { aff: 15 } }, sanity: 5 }), O('"Someone has to be here when you come back," {x} said. You left with the thread and no company.', { flag: 'bn.thread', rel: { x: { aff: 4 } } })),
  ] }),
  L('bn_thread_beat', 'bonds', { flag: 'bn.thread', age: [20, 90], has: ['lover'] }, 'The red thread on your wrist has faded to pink and frayed to almost nothing. You have kept it through everything.', { sanity: 3 }),
  E('bn_lover_parting', 'bonds', { if: { has: 'lover', age: [18, 50], chance: 0.34 }, bind: { x: 'lover' }, art: 'river', title: 'The ferry landing', text: '{x}’s family has arranged a marriage for {x.him} in another province. {x.He} tells you at the ferry landing, already holding the ticket.', choices: [
    P('Ask {x.him} to stay', 0.5, O('{x} tore the ticket in half and dropped it in the river. {x.His} family will be furious for a decade.', { rel: { x: { aff: 15 } }, sanity: 4 }), O('{x} got on the ferry. {x.He} did not look back, which is how you knew it was hard.', { role: { x: 'acquaintance' }, sanity: -10 })),
    Q('Kneel and propose, here, on the planks', { npc: { x: { aff: '>=70' } } }, O('You knelt on the wet planks and asked. {x} dropped the ticket in the river.', { marry: 'x', sanity: 5 })),
    C('Let {x.him} go', O('You let {x.him} go. The ferryman, who has seen this before, did not charge you for standing on the landing until dark.', { role: { x: 'friend' }, sanity: -6 })),
  ] }),

  // ── Yu Seol-hwa and Namgung Jin ─────────────────────────────────
  E('bn_seol_heart', 'bonds', { if: { met: 'seol', alive: 'seol', meta: { rival: '>=5' }, age: [18, 60], married: false, npc: { '@seol': { aff: '>=50' } } }, art: 'moon', title: 'A hundred lives', text: 'On the roof again, Seol-hwa says without looking at you: "In a hundred and twelve lives I never once let myself love anyone. They die, or I do, and then they do not remember." A pause. "You would remember."', choices: [
    C('Take her hand', O('You took her hand. She let you. Neither of you said anything clever, for once.', { rel: { '@seol': { aff: 15, role: 'lover' } }, sanity: 5 })),
    C('"I would remember."', O('That was all you said. She nodded, as if a contract had been signed, and stayed on the roof with you until dawn.', { rel: { '@seol': { aff: 10, res: 10 } } })),
    C('Tell her it would be a weakness', O('"Yes," she said. "That was the point." She climbed down first.', { rel: { '@seol': { aff: -5, res: 5 } }, sanity: -3 })),
  ] }),
  E('bn_seol_vow', 'bonds', { if: { alive: 'seol', married: false, age: [18, 70], npc: { '@seol': { role: 'lover' } } }, art: 'wedding', text: 'Seol-hwa asks, very practically, whether you would like to be married in this life, "since we will probably not get another one that goes this well."', choices: [
    C('Marry her', O('You married on an ordinary day in an ordinary temple. She laughed during the bows, which she says she has not done in eighty years.', { marry: '@seol', sanity: 8, codex: VOW.seol })),
    C('Ask her to wait until her brother is safe', O('"Then we wait," she said. "I am good at waiting." She did not let go of your sleeve.', { flag: 'bn.seol.wait', rel: { '@seol': { res: 10 } } })),
  ] }),
  E('bn_seol_again', 'bonds', { if: { ...LATER, mem: 'bn.vow.seol', alive: 'seol', age: [10, 40] }, art: 'wheel', text: 'Seol-hwa finds you before you find her. "You remember," she says. It is not a question. "So do I. Do not make it strange."', choices: [
    C('Make it a little strange', O('You told her she had ink on her chin, the same as last time. She hit you, the same as last time.', { meet: '@seol', rel: { '@seol': { aff: 20, res: 5 } }, rival: 3, sanity: 4 })),
    C('Bow, as if to a stranger', O('You bowed. She bowed back. Then she said, "Coward," very fondly, and walked with you anyway.', { meet: '@seol', rel: { '@seol': { aff: 10, res: 10 } }, rival: 3 })),
  ] }),
  E('bn_jin_drunk', 'bonds', { if: { met: 'namgung_jin', alive: 'namgung_jin', age: [18, 37], married: false, npc: { '@namgung_jin': { aff: '>=55', role: OPEN } } }, art: 'inn', text: 'Namgung Jin, very drunk for the first time in his life, informs you that you are the only person under Heaven who has beaten him, laughed at him, or bought him a drink, and that he has spent a year deciding which of these is the problem.', choices: [
    C('Kiss him, to settle it', O('He forgot to be insufferable for an entire minute. Then he remembered, and was insufferable about this.', { rel: { '@namgung_jin': { aff: 15, role: 'lover' } }, sanity: 3 })),
    C('Put him to bed', O('He did not remember the speech in the morning. You did.', { rel: { '@namgung_jin': { aff: 8, res: 5 } } })),
    C('Tell him the problem is the wine', O('"Ah," he said, relieved and disappointed in exactly equal measure.', { rel: { '@namgung_jin': { aff: 3 } }, charm: 1 })),
  ] }),

  // ── Married life ────────────────────────────────────────────────
  E('bn_spouse_plum', 'bonds', { if: { has: 'spouse', age: [18, 60] }, bind: { x: 'spouse' }, art: 'garden', text: '{x} has planted a plum sapling in the courtyard. "For when we are old," {x.he} says. It is a very small sapling.', choices: [
    C('Water it every morning', O('You watered it every morning, even in the years when you were barely home. It was the one thing you never forgot.', { flag: 'bn.plum', rel: { x: { aff: 6 } }, sanity: 4 })),
    C('Point out that plum trees take thirty years', O('"Then we had better hurry and get old," {x} said.', { flag: 'bn.plum', rel: { x: { aff: 3 } }, insight: 1 })),
  ] }),
  L('bn_plum_beat', 'bonds', { flag: 'bn.plum', has: 'spouse', age: [50, 200] }, 'The plum tree {x} planted is taller than the roof now. Most evenings you sit under it together and complain about the petals.', { sanity: 5 }, { bind: { x: 'spouse' } }),
  E('bn_spouse_children', 'bonds', { if: { has: 'spouse', hasNot: 'child', age: [20, 42] }, w: 2, bind: { x: 'spouse' }, art: 'moon', text: '{x} asks you, very quietly, in the dark, whether you have ever thought about children. Then, before you can answer: "I have. I have thought about it a great deal."', choices: [
    C('"So have I."', O('You had. Neither of you slept much that night. The following winter a child was born, red-faced and furious about it.', { child: true, rel: { x: { aff: 10 } }, sanity: 6 })),
    C('"The world is too cruel for it."', O('{x} said nothing for a long time. "It was cruel when we were born," {x.he} said at last, and let the matter rest, for now.', { rel: { x: { aff: -4 } }, insight: 1 })),
    C('Ask {x.him} to wait until you are stronger', O('"Stronger for what?" {x} asked. You did not have an answer that did not frighten you both.', { rel: { x: { aff: -2, res: 3 } }, sanity: -2 })),
  ] }),
  E('bn_spouse_ledger', 'bonds', { if: { has: 'spouse', age: [20, 70] }, bind: { x: 'spouse' }, text: '{x} has taken one look at how you handle money and quietly confiscated the household purse.', choices: [
    C('Surrender it', O('{x} gave you an allowance. By winter you had more money than you had ever had, and no idea where it came from.', { wealth: 15, rel: { x: { aff: 5 } } })),
    R('Argue for your financial competence', 'insight', 35, O('You made a surprisingly good case. {x} let you keep half, under supervision.', { wealth: 5, rel: { x: { res: 5 } } }), O('{x} produced the receipts. All of them. You surrendered.', { wealth: 10, charm: -1 })),
  ] }),
  E('bn_spouse_past', 'bonds', { if: { has: 'spouse', age: [22, 70], chance: 0.26 }, bind: { x: 'spouse' }, danger: true, art: 'night', title: 'A name you never heard', text: 'A stranger stopped {x} in the market and called {x.him} by a name you have never heard. That night {x.he} tells you {x.he} was once a Blood Shadow Pavilion blade, and that nobody simply leaves the Pavilion.', choices: [
    C('Tell {x.him} it changes nothing', O('It changed nothing. It changed how you sleep: lightly, facing the door.', { flag: 'bn.spouse.shadow', rel: { x: { aff: 20 } }, sanity: -3 })),
    R('Find the stranger first', 'power', 35, O('You found him at an inn and had a long conversation with your sword on the table. He left Kaifeng before morning.', { infamy: 2, rel: { x: { aff: 15 } }, rep: { unorthodox: -5 } }), O('The stranger found you first. You survived it. He left a message: the Pavilion keeps its accounts.', { health: -20, rep: { unorthodox: -5 }, flag: 'bn.spouse.shadow' })),
    C('Ask {x.him} to leave', O('You asked {x.him} to leave. {x.He} went before dawn, taking nothing but the hairpin you gave {x.him}.', { role: { x: 'acquaintance' }, rel: { x: { aff: -40 } }, sanity: -12 })),
  ] }),
  E('bn_spouse_shadow', 'bonds', { if: { has: 'spouse', flag: 'bn.spouse.shadow', age: [22, 80] }, bind: { x: 'spouse' }, danger: true, art: 'night', text: '{x} has been gone three days. A note on the pillow: "One last contract, to buy my name back. Do not follow."', choices: [
    C('Follow', O('You followed the trail to Kaifeng.', { combat: { foe: { name: 'a Blood Shadow blade', kind: 'assassin', rel: 0 }, context: 'ambush', lethal: 0.3, win: { text: 'You found {x} on a rooftop, and the blades waiting for {x.him}. Afterwards {x.he} burned {x.his} Pavilion token in a brazier. "Bought," {x.he} said.', rel: { x: { aff: 20 } }, unflag: 'bn.spouse.shadow', rep: { unorthodox: -5 } }, lose: { text: 'You were too slow. {x} came home a week later with a wound that never healed right, and a name that was {x.his} own again.', rel: { x: { aff: 10 } }, unflag: 'bn.spouse.shadow' } } })),
    P('Wait, as asked', 0.5, O('{x} came home on the ninth day, thinner, and free.', { rel: { x: { aff: 10 } }, unflag: 'bn.spouse.shadow' }), O('{x} did not come home. The Pavilion sent back {x.his} hairpin, which is how they say a thing is finished.', { kill: 'x', sanity: -20, unflag: 'bn.spouse.shadow' })),
  ] }),
  E('bn_spouse_lessons', 'bonds', { if: { has: 'spouse', realm: '>=1', age: [18, 70], npc: { x: { realm: 0 } } }, bind: { x: 'spouse' }, text: '{x} has asked you to teach {x.him} to fight. "Not to be a hero," {x.he} says. "Only so that next time I am not the one waiting."', choices: [
    C('Teach {x.him} properly', O('You taught {x.him} every dawn for a year. {x.He} is not a hero. {x.He} is not helpless either.', { npcRealm: { x: 1 }, rel: { x: { aff: 10, res: 5 } } })),
    C('Teach {x.him} to run', O('You taught {x.him} to run, and where to. {x} was insulted, and then, years later, grateful.', { rel: { x: { aff: 4 } }, insight: 1 })),
  ] }),
  E('bn_spouse_who_first', 'bonds', { if: { has: 'spouse', age: [60, 200] }, bind: { x: 'spouse' }, art: 'garden', text: 'You and {x} are arguing again about which of you will die first. You both want to go first. Neither of you will say why.', choices: [
    C('Say why', O('"So I never have to sit with this alone," you said. {x} said, "Yes. That."', { rel: { x: { aff: 10 } }, sanity: -2 })),
    C('Change the subject to dinner', O('You changed the subject to dinner. You both knew. Dinner was good.', { sanity: 3 })),
  ] }),
  E('bn_inlaws', 'bonds', { if: { has: 'spouse', age: [20, 60] }, bind: { x: 'spouse' }, text: '{x}’s family has fallen into a feud with the neighbouring clan over a well. They expect you, the martial artist in the family, to settle it.', choices: [
    R('Settle it with words', 'charm', 28, O('You brokered a schedule: mornings to one family, evenings to the other. Both sides hate it equally, which is peace.', { fame: 1, rel: { x: { aff: 10 } } }), O('The well is now the subject of a lawsuit, and you are named in it.', { wealth: -10, rel: { x: { aff: 2 } } })),
    C('Stand by the well with your sword', O('You stood by the well with your sword for an afternoon. The neighbours found another well.', { infamy: 2, rel: { x: { aff: 5 } } })),
    C('Stay out of it', O('You stayed out of it. {x}’s mother has not addressed you directly since.', { rel: { x: { aff: -10 } } })),
  ] }),
  E('bn_spouse_face', 'bonds', { if: { ...LATER, has: 'spouse', age: [20, 70] }, bind: { x: 'spouse' }, art: 'moon', text: 'Lying awake, you study {x}’s sleeping face as if memorising a manual. You have died before. You know how quickly faces go.', choices: [
    C('Memorise every line', O('You memorised every line, the scar at the eyebrow, the crease that comes when {x.he} dreams. You will lose it anyway. You know that too.', { codex: FACE, sanity: -1 })),
    C('Wake {x.him} and say it aloud', O('You woke {x.him}. {x.He} listened, half asleep, then said, "Then look at me in daylight, fool," and went back to sleep.', { rel: { x: { aff: 10 } }, sanity: 3 })),
  ] }),
  E('bn_face_again', 'bonds', { if: { ...LATER, mem: 'bn.face', age: [16, 32], married: false }, art: 'blossom', bind: { y: { role: 'acquaintance', ageRel: [-3, 3], minAge: 16, aff: 30, romance: true } }, text: 'At the lantern festival a face across the crowd stops your heart. It is not them. It is never them. The person you married has not been born this time, or was born to someone else.', choices: [
    C('Walk the lanterns alone', O('You walked them alone, and set one on the water for someone who does not exist.', { sanity: -4, insight: 2 })),
    C('Let a stranger step on your foot', O('A stranger named {y} stepped on your foot and apologised, and you laughed at the same moment. It is not the same. It does not have to be.', { rel: { y: { aff: 12 } }, sanity: 3 })),
  ] }),

  // ── Children ────────────────────────────────────────────────────
  E('bn_child_fever', 'bonds', { if: { has: 'child', npc: { x: { age: [0, 8] } } }, w: 2, bind: { x: 'child' }, art: 'night', title: 'The fever', text: '{x} has a fever that will not break. Three days now. The physician has stopped meeting your eyes.', choices: [
    Q('Send for a famous physician (50 taels)', { stat: { wealth: '>=50' } }, O('The famous physician came by fast horse, frowned, and changed one herb. The fever broke on the fifth dawn.', { wealth: -50, rel: { x: { aff: 5 } }, sanity: -2 })),
    R('Sit up with {x.him} and keep {x.him} cool', 'insight', 25, O('You did not sleep for four nights. On the fifth, {x} woke and asked for dumplings.', { sanity: -3, rel: { x: { aff: 10 } } }), O('You did everything. You will never forgive the dawn.', { kill: 'x', sanity: -20 })),
    M('Brew the cure you learned in another life', 'secret.plague_cure', O('Your hands knew the measures before your head did. {x} sweated it out by morning.', { insight: 2, rel: { x: { aff: 10 } } })),
  ] }),
  E('bn_child_name', 'bonds', { if: { has: 'child', npc: { x: { age: [0, 1] } } }, w: 3, bind: { x: 'child' }, art: 'birth', text: 'It is time to choose a milk-name for {x}, something to keep the ghosts from noticing. Everyone in the family has opinions. Yours, apparently, does not count.', choices: [
    C('Something fierce, to frighten the ghosts', O('You chose a name that means "Little Tiger". The baby yawned at it.', { codex: MILK_NAME, sanity: 4, rel: { x: { aff: 5 } } })),
    C('Something humble, so the ghosts will not bother', O('You chose a name that means "Dog Turd", in the old way. Your mother-in-law nearly fainted. The ghosts were suitably unimpressed.', { codex: MILK_NAME, sanity: 5, charm: 1 })),
  ] }),
  E('bn_child_unborn', 'bonds', { if: { ...LATER, mem: 'bn.child.name', age: [25, 50], hasNot: 'child' }, art: 'night', text: 'There is a name you keep almost saying. It belonged to a child who has not been born in this life and may never be. Some nights you say it anyway, to the dark.', choices: [
    C('Say it', O('You said it. The dark kept it.', { sanity: -5, insight: 1 })),
    C('Write it in your journal and close the book', O('You wrote it down, once, carefully, and closed the book. It is safe there.', { sanity: 2 })),
  ] }),
  E('bn_child_rival_sect', 'bonds', { if: { has: 'child', npc: { x: { age: '>=14' } }, rank: '>=0' }, bind: { x: 'child' }, fmt: 'letter', from: 'x', art: 'letter', text: '"Do not be angry. I have joined another sect. They took me for my own name, not yours." {x} sent the letter after the oath was sworn: thoughtful, cowardly, and very like you.', choices: [
    C('Write back with your blessing', O('You wrote: "Beat me at the next Assembly." {x} kept the letter on {x.his} wall.', { rel: { x: { aff: 10, res: 5 } }, sanity: 2 })),
    C('Do not write back', O('You did not write back. {x} waited a year for a letter, then stopped waiting.', { rel: { x: { aff: -12 } }, sanity: -3 })),
  ] }),
  E('bn_child_war', 'bonds', { if: { has: 'child', happened: 'cult_war', npc: { x: { age: '>=16' } }, chance: 0.34 }, bind: { x: 'child' }, danger: true, art: 'battlefield', text: '{x} has gone to the war. {x.He} did not ask you. {x.He} left a note on the table saying it was {x.his} turn.', choices: [
    P('Ride after {x.him}', 0.65, O('You found {x} in a camp by the Yellow River and stayed by {x.his} side through two battles. You both came home.', { health: -10, rel: { x: { aff: 15, res: 10 } }, fame: 2 }), O('You reached the battlefield after the battle. You found {x} among the dead by the sword you had given {x.him}.', { kill: 'x', sanity: -20, health: -5 })),
    P('Light incense and wait', 0.7, O('{x} came home in winter with a scar and no stories.', { rel: { x: { aff: 5 } }, sanity: -3 }), O('The letter came in winter, in an officer’s hand.', { kill: 'x', sanity: -20 })),
  ] }),

  // ── Parents ─────────────────────────────────────────────────────
  E('bn_parent_story', 'bonds', { if: { has: 'parent', age: [12, 50] }, once: false, cd: 6, bind: { x: 'parent' }, text: '{x} tells you, out of nowhere, about the year before you were born: a flood, a debt, and a decision {x.he} has never told anyone. You realise {x.he} was barely older then than you are now.', choices: [
    C('Ask for more', O('{x} told you more than {x.he} meant to. You walked home seeing {x.him} as a person, which is a strange thing to do to a parent.', { rel: { x: { aff: 8 } }, insight: 1 })),
    C('Tell {x.him} one of yours', O('You traded a secret for a secret. {x} laughed until {x.he} coughed.', { rel: { x: { aff: 10 } }, sanity: 3 })),
  ] }),
  E('bn_parent_remarry', 'bonds', { if: { has: 'mother', age: [16, 60], fn: lost('father', 6) }, bind: { x: 'mother' }, text: 'Your mother has been seen walking with the widower who sells charcoal. She tells you about it before you can ask, chin up, ready for a fight.', choices: [
    C('Give your blessing', O('You gave it. She pretended not to need it, and then held your face in both hands.', { rel: { x: { aff: 15 } }, sanity: 3 })),
    C('Ask what Father would have thought', O('"He would have thought it took me long enough," she said, and did not speak to you until the New Year.', { rel: { x: { aff: -10 } }, sanity: -2 })),
  ] }),
  E('bn_mother_letters', 'bonds', { if: { ...LATER, mem: 'bn.mother.letters', has: 'mother', age: [14, 50] }, fmt: 'letter', art: 'letter', bind: { x: 'mother' }, text: 'In another life your mother kept every letter you ever sent her, tied with red thread. There were not many. This time you have been writing more, and her replies have started to sound surprised.', choices: [
    C('Write another', O('You wrote about nothing: the weather, a dog you met. She will tie it with the others.', { rel: { x: { aff: 10 } }, sanity: 4 })),
    C('Go home instead of writing', O('You went home. She opened the door, stared, and burst into tears, because you have never once come home without being asked.', { rel: { x: { aff: 15 } }, sanity: 6, health: 2 })),
  ] }),
  E('bn_parent_youth', 'bonds', { if: { ...LATER, has: 'parent', age: [16, 24] }, bind: { x: 'parent' }, text: 'Watching {x} haul water, you realise {x.he} is younger now than you were when you last died. {x.He} catches you staring. "What?"', choices: [
    C('Carry the water', O('You took the buckets. {x} let you, suspiciously.', { rel: { x: { aff: 8 } }, body: 1 })),
    C('Tell {x.him} {x.he} looks well', O('"You are a strange child," {x} said, pleased.', { rel: { x: { aff: 5 } }, sanity: 3 })),
  ] }),
  E('bn_again_firstword', 'bonds', { if: { ...LATER, has: 'mother', age: [1, 2] }, bind: { x: 'mother' }, art: 'birth', text: 'Your first word, this time, is your mother’s name, said on purpose and very clearly. {x} drops the washing.', choices: [
    C('Say it again', O('You said it again. {x} ran to tell the neighbours. You will have to be more careful.', { rel: { x: { aff: 10 } }, sanity: 4 })),
    C('Babble, quickly, like a normal baby', O('You babbled. {x} decided {x.he} had imagined it, mostly.', { insight: 1 })),
  ] }),

  // ── Rivals ──────────────────────────────────────────────────────
  E('bn_rival_falls', 'bonds', { if: { has: 'rival', age: [18, 80], chance: 0.34 }, bind: { x: 'rival' }, danger: true, art: 'grave', text: 'Word comes that your rival {x} has been killed: ambushed on a mountain road by men not fit to carry {x.his} sword. You did not expect it to feel like this.', choices: [
    C('Find the men who did it', O('You found their camp in the hills.', { kill: 'x', combat: { foe: { name: 'the leader of the ambushers', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.3, win: { text: 'It was over quickly. You left {x}’s sword standing in the earth where they had camped.', fame: 3, sanity: 3 }, lose: { text: 'They were more than you thought. You crawled away, and lived, which {x} would have mocked you for.', sanity: -4 } } })),
    C('Burn incense for {x.him}', O('You burned incense and stood a long time. There is nobody left to be better than.', { kill: 'x', sanity: -5, insight: 1 })),
  ] }),
  E('bn_rival_child', 'bonds', { if: { has: 'rival', age: [35, 90] }, bind: { x: 'rival', y: { role: 'acquaintance', age: [12, 15], realm: [0, 1], aff: 30, res: 20 } }, text: 'Your rival {x} has brought {x.his} youngest relative, {y}, who has exhausted every teacher in {x.his} sect. "You are the only one good enough," {x.he} says through gritted teeth. "Tell nobody I said that."', choices: [
    C('Take {y} as your disciple', O('{y} bowed three times. {x} looked as if {x.he} had swallowed a lemon, then bowed too.', { rel: { y: { role: 'disciple', aff: 15 }, x: { aff: 15, res: 10 } }, achieve: 'first_disciple' })),
    C('Decline, but spar with {x} for old times’ sake', O('You declined and drew your practice sword instead.', { combat: { foe: 'x', context: 'spar', win: { text: 'You won. {x} laughed for the first time in your acquaintance. "Same as ever," {x.he} said.', rel: { x: { res: 10, aff: 10 } } }, lose: { text: '{x} won, and was so pleased {x.he} took {y} away to find another teacher without complaint.', rel: { x: { res: 5, aff: 10 } } } } })),
  ] }),

  // ── Betrayal ────────────────────────────────────────────────────
  E('bn_betray_sworn', 'bonds', { if: { has: 'sworn', age: [18, 80], chance: 0.26 }, bind: { x: 'sworn' }, danger: true, art: 'inn', title: 'A quiet inn', text: 'Your sworn sibling {x} invited you to a quiet inn outside town. It is very quiet. The other guests are Eastern Depot men, and {x} will not meet your eyes.', choices: [
    C('Fight your way out', O('You overturned the table.', { combat: { foe: { name: 'an Eastern Depot officer', kind: 'soldier', rel: 1 }, context: 'ambush', lethal: 0.35, win: { text: 'You cut your way out. {x} was gone when it was over. On the table lay the Depot’s receipt, made out in {x.his} name.', role: { x: 'enemy' }, rel: { x: { aff: -50 } }, flag: 'bn.betrayed', rep: { court: -5 }, sanity: -8 }, lose: { text: 'They took you in chains. You escaped on the third night, through a drain, and the first thing you thought of was {x}’s face.', health: -15, role: { x: 'enemy' }, flag: 'bn.betrayed', rep: { court: -10 }, sanity: -10 } } })),
    R('Ask {x.him} why, before anyone moves', 'charm', 35, O('{x} broke. "They have my mother," {x.he} said, and turned {x.his} blade on the Depot men instead. You got out together. The oath held, barely.', { rel: { x: { aff: -5, res: 10 } }, rep: { court: -8 }, sanity: -4 }), O('{x} did not answer. You went out through the window, and took a crossbow bolt in the shoulder on the way.', { health: -18, role: { x: 'enemy' }, flag: 'bn.betrayed', sanity: -8 })),
  ] }),
  E('bn_betray_lover_spy', 'bonds', { if: { has: 'lover', age: [18, 60], chance: 0.26 }, bind: { x: 'lover' }, art: 'letter', text: 'In {x}’s things you find a letter in a cipher you know: the Thousand Ears Pavilion. Every place you have been this year is in it.', choices: [
    C('Confront {x.him}', O('{x} did not deny it. "It started as work," {x.he} said. "It did not stay work." You do not know which half to believe.', { role: { x: 'acquaintance' }, rel: { x: { aff: -20 } }, sanity: -8, flag: 'bn.betrayed' })),
    R('Feed {x.him} false places', 'insight', 35, O('A Pavilion buyer wasted a season chasing you around Jingchu. {x} never knew you knew. You stayed together, which is its own kind of betrayal.', { insight: 2, sanity: -4, rel: { '@madam_yeon': { res: 5 } } }), O('{x} noticed. {x.He} left before dawn, the cipher key on the pillow, as an apology.', { role: { x: 'acquaintance' }, sanity: -10, flag: 'bn.betrayed' })),
    C('Burn the letter and say nothing', O('You burned it. Some nights you watch {x} sleep and wonder what {x.he} will write tomorrow.', { sanity: -6 })),
  ] }),
  E('bn_betray_master_credit', 'bonds', { if: { has: 'master', age: [16, 60], realm: '>=2', chance: 0.26 }, bind: { x: 'master' }, text: 'Your master {x} presented the technique you spent three years developing to the elders, as {x.his} own. The elders were very impressed with {x.him}.', choices: [
    C('Say nothing', O('You said nothing. You are still {x}’s disciple. Something in the word has gone hollow.', { rel: { x: { aff: -10 } }, sanity: -4, insight: 1 })),
    R('Demonstrate it better than {x.he} can, in front of everyone', 'insight', 35, O('You did it better, in front of everyone. Nobody said anything. Everybody knew.', { fame: 3, rel: { x: { aff: -20, res: 15 } } }), O('You fumbled the third movement. {x} corrected you, kindly, in front of everyone.', { fame: -1, rel: { x: { aff: -15 } }, sanity: -3 })),
    C('Leave your master', O('You bowed once, not three times, and walked out of {x}’s courtyard for good.', { role: { x: 'acquaintance' }, sanity: -5, flag: 'bn.betrayed' })),
  ] }),
  E('bn_betray_disciple_poison', 'bonds', { if: { has: 'disciple', age: [35, 200], chance: 0.26 }, bind: { x: 'disciple' }, danger: true, art: 'night', title: 'Bitter almonds', text: 'Your tea tastes of bitter almonds. Across the table, your disciple {x} has stopped breathing normally, watching you drink.', choices: [
    R('Force the poison out with your qi', 'realm', 30, O('You sat very still and pushed it out through your fingertips, drop by black drop. {x} ran before you could stand.', { role: { x: 'enemy' }, health: -10, flag: 'bn.betrayed', sanity: -6 }), O('You lived, which surprised everyone, {x} most of all. {x.He} was long gone when you could walk again.', { health: -35, role: { x: 'enemy' }, flag: 'bn.betrayed', sanity: -8 })),
    P('Set the cup down and ask {x.him} why', 0.5, O('{x} broke down. A rival sect had promised {x.him} a manual you would not teach. You sent {x.him} away with nothing, not even anger.', { role: { x: 'acquaintance' }, health: -6, insight: 1, sanity: -4 }), O('{x} fled over the wall. You poured the rest of the tea on the roots of the plum tree, which died.', { role: { x: 'enemy' }, health: -8, flag: 'bn.betrayed', sanity: -6 })),
  ] }),
  E('bn_friend_loan', 'bonds', { if: { has: 'friend', age: [18, 70], stat: { wealth: '>=40' } }, bind: { x: 'friend' }, text: '{x} asks to borrow forty taels for a sick mother. {x.He} cannot quite look at you while asking, which could mean shame, or could mean something else.', choices: [
    P('Lend it', 0.74, O('You lent it. {x} wept and promised to repay you by spring.', { wealth: -40, next: { id: 'bn_loan_repaid', in: 4 } }), O('You lent it. {x} wept and promised to repay you by spring.', { wealth: -40, next: { id: 'bn_loan_truth', in: 4 } }), { hint: 'a matter of trust' }),
    C('Refuse', O('You refused, gently. {x} said {x.he} understood, and did not visit again that year.', { rel: { x: { aff: -8 } } })),
  ] }),
  E('bn_loan_repaid', 'bonds', { on: 'scheduled', bind: { x: 'friend' }, text: '{x} turns up at your door with forty-four taels and a jar of the good wine. "Interest," {x.he} says. "And Mother says thank you."', choices: [
    C('Drink the interest together', O('You drank the interest together. It was the good wine.', { wealth: 44, rel: { x: { aff: 12, res: 8 } }, sanity: 3 })),
  ] }),
  E('bn_loan_truth', 'bonds', { on: 'scheduled', bind: { x: 'friend' }, title: 'No mother', text: '{x} has no mother. You learn this from {x.his} landlord, who is also owed money, and who heard {x.he} is in Hangzhou now, wearing a new coat.', choices: [
    R('Go to Hangzhou and find {x.him}', 'insight', 30, O('You found {x} at a gambling house in a very nice coat. {x.He} paid back half on the spot, shaking. You did not ask for the rest.', { wealth: 20, role: { x: 'acquaintance' }, rel: { x: { aff: -30 } }, flag: 'bn.betrayed' }), O('Hangzhou is large and {x} is clever. You came home poorer by the journey.', { wealth: -4, role: { x: 'enemy' }, flag: 'bn.betrayed', sanity: -4 })),
    C('Write it off', O('You wrote it off. Forty taels is the price of learning something about {x}. It felt expensive.', { role: { x: 'acquaintance' }, rel: { x: { aff: -30 } }, sanity: -5, flag: 'bn.betrayed' })),
  ] }),
  E('bn_betrayer_returns', 'bonds', { if: { has: 'enemy', flag: 'bn.betrayed', age: [30, 200] }, bind: { x: 'enemy' }, art: 'snow', title: 'At the gate', text: '{x}, who betrayed you, is at your gate: older, sick, and alone. {x.He} has walked a long way to say something, and is not sure {x.he} will be allowed to say it.', choices: [
    C('Let {x.him} say it', O('You let {x.him} say it. You did not forgive {x.him}. You let {x.him} sleep by the fire.', { role: { x: 'acquaintance' }, rel: { x: { aff: 20 } }, sanity: 4 })),
    C('Forgive {x.him}', O('You forgave {x.him}, out loud, in the snow. It cost more than anything you have ever paid for. It was worth it.', { role: { x: 'friend' }, rel: { x: { aff: 30 } }, sanity: 10, burden: -1 })),
    C('Close the gate', O('You closed the gate. In the morning there were footprints going away, and a small bundle on the step that you did not open.', { sanity: -3 })),
  ] }),

  // ── Reunions ────────────────────────────────────────────────────
  E('bn_reunion_tavern', 'bonds', { on: 'tavern', if: { has: 'friend', age: [20, 90] }, bind: { x: 'friend' }, art: 'inn', text: 'Through the tavern smoke you see {x}, whom you have not seen in far too long, telling a story badly to strangers. {x.He} sees you mid-sentence and forgets the ending.', choices: [
    C('Finish the story for {x.him}', O('You finished it, better. {x} accused you of stealing it. The strangers bought you both a round.', { rel: { x: { aff: 10 } }, charm: 1, sanity: 3 })),
    C('Pay for {x.his} whole table', O('You paid for the table. {x} pretended to be insulted for almost a full breath.', { wealth: -4, rel: { x: { aff: 12 } } })),
  ] }),
  E('bn_reunion_playmate', 'bonds', { if: { age: [30, 70] }, bind: { x: { role: 'acquaintance', ageRel: [-1, 1], aff: 40, res: 20 } }, text: 'A stranger with grey at the temples stops you in the street. "You do not remember me," says {x}. "We stole persimmons together when we were six. You fell out of the tree."', choices: [
    R('Pretend to remember', 'charm', 20, O('You pretended beautifully. {x} was delighted. You have a friend now, apparently since you were six.', { rel: { x: { aff: 15, role: 'friend' } } }), O('{x} saw through you at once and laughed. "You never could lie."', { rel: { x: { aff: 8, role: 'friend' } } })),
    C('Admit you do not', O('"Ah," {x} said. "Well. I remember for both of us."', { rel: { x: { aff: 3 } }, insight: 1, sanity: -1 })),
    C('Tell {x.him} you remember too many lives to keep one tree', O('{x} looked at you strangely and wished you good health, the way one does with the unwell.', { insight: 2, rel: { x: { aff: -2 } } }), { show: LATER }),
  ] }),
  E('bn_reunion_refugee', 'bonds', { if: { has: 'sibling', happened: 'cult_war', age: [20, 80] }, bind: { x: 'sibling' }, art: 'road', text: 'Among the refugees on the Luoyang road you see a face you had given up on: {x}, alive, thinner, carrying someone else’s child.', choices: [
    C('Run to {x.him}', O('You ran. {x} handed you the child without a word and then fell into you, laughing or crying, both.', { rel: { x: { aff: 20 } }, sanity: 8 })),
    Q('Buy passage south for {x} and the whole cart (20 taels)', { stat: { wealth: '>=20' } }, O('You bought the passage. The cart went south with nine strangers and {x.title}, all of them waving.', { wealth: -20, rel: { x: { aff: 15 } }, sanity: 5, fame: 1 })),
  ] }),
  E('bn_reunion_road', 'bonds', { on: 'road', if: { has: 'senior', age: [18, 80] }, bind: { x: 'senior' }, art: 'road', text: 'On the road you meet {x}, your old senior, coming the other way with a mule and a great deal more grey than you remember.', choices: [
    C('Walk together a while', O('You walked together a day out of your way, talking about the old instructors. {x} remembered all your worst mistakes, fondly.', { rel: { x: { aff: 8, res: 3 } }, insight: 1 })),
    C('Spar on the roadside, like old times', O('You drew practice swords in a field while the mule watched.', { combat: { foe: 'x', context: 'spar', win: { text: 'You won. {x} bowed, the full bow, the first time {x.he} has ever given it to you.', rel: { x: { res: 10 } } }, lose: { text: '{x} still has the old trick. "Some things you never teach," {x.he} said, smug.', rel: { x: { aff: 6, res: 3 } } } } })),
  ] }),

  // ── Letters ─────────────────────────────────────────────────────
  E('bn_letter_unsent', 'bonds', { if: { age: [20, 90], fn: lost(['mother', 'father', 'friend', 'sworn', 'spouse', 'sibling'], 10) }, art: 'letter', text: 'Clearing out a drawer, you find a letter you wrote years ago and never sent. The person it was for is dead now. It is not a very good letter. It would have been enough.', choices: [
    C('Burn it at the grave', O('You burned it at the grave and read it aloud first. The wind took most of it.', { sanity: 4 })),
    C('Keep it', O('You kept it. You do not read it. You know where it is.', { sanity: -3, insight: 1 })),
  ] }),
  E('bn_letter_late', 'bonds', { if: { age: [18, 90], fn: lost(['friend', 'sworn'], 1) }, fmt: 'letter', art: 'letter', title: 'A late letter', text: 'A letter arrives in a hand you know, from someone who has been dead since the leaves turned. The courier is apologetic: the road was long. Inside: "Bring wine next time. Not the cheap one."', choices: [
    Q('Bring the good wine to the grave', { stat: { wealth: '>=3' } }, O('You brought the good wine and drank half of it there. You left the other half. Not the cheap one.', { wealth: -3, sanity: 3 })),
    C('Drink the cheap one, alone', O('You drank the cheap one alone. It was terrible. You could hear the complaint.', { sanity: -4 })),
  ] }),
  E('bn_letter_master_old', 'bonds', { if: { has: 'master', age: [25, 80], home: false }, fmt: 'letter', from: 'x', art: 'letter', bind: { x: 'master' }, text: '"I am old," writes your master {x}. "Not dying. Old. Come and see me before I am the other thing."', choices: [
    C('Go at once', O('You went at once. {x} was in the courtyard, correcting a child’s stance with a stick, and pretended not to have expected you.', { rel: { x: { aff: 10, res: 5 } }, insight: 2 })),
    C('Promise to come in spring', O('You promised spring. {x} wrote back one word: "Fine." It was underlined twice.', { rel: { x: { aff: -2 } }, sanity: -1 })),
  ] }),

  // ── Grief ───────────────────────────────────────────────────────
  E('bn_ghost_festival', 'bonds', { if: { age: [16, 200], season: 2, fn: mourned(2) }, once: false, cd: 3, art: 'river', title: 'The Ghost Festival', text: 'It is the Ghost Festival. Along the river, families set paper lanterns on the water for their dead. You buy more lanterns than you expected to need.', choices: [
    C('Name each one as you set it down', O('You named each one. A child beside you asked who they all were. You told her.', { sanity: 4, insight: 1 })),
    C('Set them down without a word', O('You set them down without a word and watched them go round the bend, one by one.', { sanity: 2 })),
  ] }),
  E('bn_grief_heart', 'bonds', { if: { age: [14, 200], stat: { sanity: '<=35' }, fn: lost(CLOSE, 3) }, art: 'night', text: 'Grief has settled into you like a cold in the chest. You train and eat and sleep, and none of it reaches the place where it lives.', choices: [
    R('Go back to the world, a little at a time', 'charm', 20, O('You went to the market, and then to the tavern, and then to a wedding. It did not cure anything. It let air in.', { sanity: 10 }), O('You went out and came straight home. Tomorrow, then.', { sanity: 3 })),
    C('Train until you cannot feel it', O('You trained until your hands bled. It worked, while you were doing it.', { qi: 20, body: 1, sanity: -5 })),
    Q('Light Heart-Calming Incense', { item: 'heart_calming' }, O('The smoke smelled of temple floors. For the first time in a season you slept through the night.', { take: { heart_calming: 1 }, sanity: 15 })),
  ] }),
  E('bn_again_oath', 'bonds', { if: { ...LATER, mem: 'bn.sworn.memory', hasNot: 'sworn', age: [14, 40] }, art: 'blossom', text: 'Some nights you dream of an oath under peach blossoms, with someone whose face is starting to blur. In this life you have not met them. Perhaps you will not.', choices: [
    C('Look for them', O('You looked at every face in every market for a season. None of them blurred the right way.', { sanity: -3, insight: 1 })),
    C('Keep the promise anyway, to whoever needs it', O('You took a neighbour’s orphaned children to the festival and bought them too many sweets. It was close enough.', { sanity: 5, fame: 1 })),
  ] }),
];
// ── Romance, stage one: the spark ─────────────────────────────────
// One row per named person who can be courted. Sets `bn.rom.<key>` and remembers them for later lives.
// If you married them in a past life, a memory choice lets you reach for what they have forgotten.
const SPARK = template('bn_spark', [
  { key: 'harin', id: 'hua_harin', if: { age: [15, 32], or: [{ met: 'hua_harin' }, { loc: 'mounthua' }] }, art: 'mountain',
    text: 'Ok Ha-rin of Mount Hua has started saving you a place at the dawn drills, and denies it loudly whenever anyone asks.',
    choices: [
      R('Spar with her until sunrise', 'body', 20, O('You sparred until the sun came over the peaks. She laughed every time she hit you, and once, when you hit her.', { rel: { '@hua_harin': { aff: 15, res: 5 } }, body: 1, flag: 'bn.rom.harin', codex: 'people.hua_harin' }), O('She knocked you into the plum trees three times, then sat with you while you picked petals out of your hair.', { rel: { '@hua_harin': { aff: 10 } }, flag: 'bn.rom.harin', codex: 'people.hua_harin' })),
      C('Bring her breakfast from Granny Pyo’s kitchen', O('Granny Pyo gave you two buns and a look. Ha-rin ate both buns and pretended not to understand the look.', { rel: { '@hua_harin': { aff: 12 }, '@hua_cook': { aff: 3 } }, flag: 'bn.rom.harin', codex: 'people.hua_harin' })),
      M('Tell her what she once told you about plum blossoms', VOW.harin.id, O('"Who told you that?" she whispered. "Nobody knows that. That is mine." She looked at you for a long time, as if trying to remember a dream.', { rel: { '@hua_harin': { aff: 25 } }, flag: 'bn.rom.harin', sanity: -3 })),
      C('Keep your distance', O('You kept your distance. She stopped saving the place after a month. You noticed.', { sanity: -1, rel: { '@hua_harin': { aff: -2 } } })),
    ] },
  { key: 'jiho', id: 'jiho', if: { age: [15, 30], or: [{ met: 'jiho' }, { loc: 'willow' }] }, art: 'moon',
    text: 'Han Ji-ho walks you home from the harvest festival the long way, past the mill, talking the whole way about nothing at all.',
    choices: [
      C('Take his hand', O('You took his hand. He stopped talking. It was the first quiet you had ever heard from him, and he did not let go until your gate.', { rel: { '@jiho': { aff: 15 } }, flag: 'bn.rom.jiho', codex: 'people.jiho', sanity: 3 })),
      R('Ask him what he is not saying', 'insight', 18, O('He told you, at the mill race, to the water. You told him back, to the moon.', { rel: { '@jiho': { aff: 12, res: 5 } }, insight: 1, flag: 'bn.rom.jiho', codex: 'people.jiho' }), O('He laughed it off and talked about the price of millet. He walked you home the long way again the next night, though.', { rel: { '@jiho': { aff: 5 } }, flag: 'bn.rom.jiho', codex: 'people.jiho' })),
      M('Repeat the promise he made you by the mill race, in another life', VOW.jiho.id, O('He went white. "I was going to say that," he said. "I have been practising it for a week."', { rel: { '@jiho': { aff: 25 } }, flag: 'bn.rom.jiho', sanity: -2 })),
      C('Tease him until he goes quiet', O('You teased him until he went quiet. He stayed quiet for a month.', { rel: { '@jiho': { aff: -3 } } })),
    ] },
  { key: 'bora', id: 'bora', if: { age: [15, 30], or: [{ met: 'bora' }, { loc: 'willow' }] }, art: 'library',
    text: 'Yun Bo-ra has decided you need educating. She turns up every evening with a book and a list of questions she already knows the answers to.',
    choices: [
      R('Out-argue her, once', 'insight', 25, O('You won one argument, about a dead poet. She stared at you as if you had grown wings, and brought two books the next evening.', { rel: { '@bora': { aff: 15, res: 10 } }, insight: 2, flag: 'bn.rom.bora', codex: 'people.bora' }), O('You lost every argument, gloriously. She came back every evening anyway.', { rel: { '@bora': { aff: 8 } }, insight: 1, flag: 'bn.rom.bora', codex: 'people.bora' })),
      C('Read aloud to her while she mends nets', O('You read aloud, badly. She corrected your pronunciation without looking up from the nets, and smiled every time.', { rel: { '@bora': { aff: 12 } }, insight: 1, flag: 'bn.rom.bora', codex: 'people.bora' })),
      M('Ask about the book she has not written yet', VOW.bora.id, O('"How do you know about that?" she said. "I have not told anyone." You said you guessed. She did not believe you, and did not stop smiling.', { rel: { '@bora': { aff: 25 } }, flag: 'bn.rom.bora', sanity: -2 })),
      C('Tell her you would rather train', O('She closed the book with a snap. "Then train," she said, and did not come back.', { rel: { '@bora': { aff: -6, res: -3 } }, body: 1 })),
    ] },
  { key: 'sohee', id: 'namgung_sohee', if: { age: [15, 34], or: [{ met: 'namgung_sohee' }, { loc: 'namgung' }] }, art: 'estate',
    text: 'Namgung So-hee has been sent a list of suitable matches by her father. She reads it aloud to you on the garden wall, crossing out names with her sword tip.',
    choices: [
      C('Ask whose name she is looking for', O('She stopped crossing out. "It is not on the list," she said, and did not look at you, and did not need to.', { rel: { '@namgung_sohee': { aff: 14 } }, flag: 'bn.rom.sohee', codex: 'people.namgung_sohee' })),
      R('Offer to duel the first suitor on the list', 'power', 30, O('You fought him in the practice yard and won. So-hee watched from the wall, very carefully not cheering.', { fame: 2, rel: { '@namgung_sohee': { aff: 18 } }, rep: { families: -2 }, flag: 'bn.rom.sohee', codex: 'people.namgung_sohee' }), O('The first suitor was better than his reputation. So-hee bandaged your hand herself, scolding.', { health: -8, rel: { '@namgung_sohee': { aff: 10 } }, flag: 'bn.rom.sohee', codex: 'people.namgung_sohee' })),
      M('Recite the sword form she only ever showed you', VOW.sohee.id, O('She dropped the list. "That form is mine. I made it up. I have never shown anyone." Her hand was shaking on the hilt.', { rel: { '@namgung_sohee': { aff: 25, res: 10 } }, flag: 'bn.rom.sohee' })),
      C('Tell her to obey her father', O('She looked at you the way the Namgung look at branch cousins. You had not known she could.', { rel: { '@namgung_sohee': { aff: -10 } }, rep: { families: 2 } })),
    ] },
  { key: 'haryeong', id: 'haryeong', if: { age: [15, 30], region: 'west', or: [{ met: 'haryeong' }, { loc: 'tenthousand' }] }, art: 'demonic',
    text: 'The Young Heavenly Demon summons you to the top of the Black Spire at midnight, and then says nothing for an hour, looking at the stars.',
    choices: [
      C('Say nothing back', O('You said nothing back. At the end of the hour she said, "Good," and let you go. She summoned you again the next night.', { rel: { '@haryeong': { aff: 15, res: 5 } }, flag: 'bn.rom.haryeong', codex: 'people.haryeong' })),
      R('Name the constellations for her', 'insight', 22, O('You named them all. She corrected one, then asked you to tell her the stories that go with them.', { rel: { '@haryeong': { aff: 15 } }, insight: 1, flag: 'bn.rom.haryeong', codex: 'people.haryeong' }), O('You got them wrong. She corrected all of them, coldly, one by one. It was the most she had ever said to anyone.', { rel: { '@haryeong': { aff: 6, res: -2 } }, flag: 'bn.rom.haryeong', codex: 'people.haryeong' })),
      M('Point out the star she counts when she cannot sleep', VOW.haryeong.id, O('She went very still. "Nobody knows that," said the most dangerous woman in the west. "Who are you?"', { rel: { '@haryeong': { aff: 22, res: 15 } }, flag: 'bn.rom.haryeong', rep: { cult: 3 } })),
      C('Ask why you were summoned', O('"If you have to ask," she said, and dismissed you.', { rel: { '@haryeong': { res: -5, aff: 2 } } })),
    ] },
  { key: 'yeonwoo', id: 'yeonwoo', if: { age: [15, 34], realm: '>=1', or: [{ met: 'yeonwoo' }, { loc: 'wudang' }] }, art: 'temple',
    text: 'Song Yeon-woo of Wudang apologises to you before your sparring match, as he does to everyone. Then he apologises after, which he does not do for everyone.',
    choices: [
      C('Spar with him properly', O('You crossed practice swords on the Wudang terrace.', { flag: 'bn.rom.yeonwoo', codex: 'people.yeonwoo', combat: { foe: '@yeonwoo', context: 'spar', win: { text: 'You won. He apologised for losing, then laughed at himself, which you suspect he has never done in front of anyone.', rel: { '@yeonwoo': { aff: 12, res: 10 } } }, lose: { text: 'He won, and apologised so thoroughly that you ended up comforting him.', rel: { '@yeonwoo': { aff: 15 } } } } })),
      C('Ask what the second apology was for', O('He went red to the collar. "For looking at you during the match," he said. "It is very bad form."', { rel: { '@yeonwoo': { aff: 15 } }, flag: 'bn.rom.yeonwoo', codex: 'people.yeonwoo', charm: 1 })),
      M('Hand him the pine needle before he can drop it', VOW.yeonwoo.id, O('He had picked one up to fidget with, as he always does. He stared at it in your palm. "How did you know I would drop that?"', { rel: { '@yeonwoo': { aff: 25 } }, flag: 'bn.rom.yeonwoo' })),
      C('Tell him to stop apologising', O('He apologised for apologising. You gave up.', { rel: { '@yeonwoo': { res: 3 } } })),
    ] },
  { key: 'hyeryeong', id: 'hyeryeong', if: { age: [15, 34], or: [{ met: 'hyeryeong' }, { loc: 'emei' }] }, art: 'feast',
    text: 'Gang Hye-ryeong of Emei lost a duel to you and has been cooking you dinner every night since, furiously, as if it were a punishment for one of you.',
    choices: [
      C('Eat everything and ask for more', O('You ate everything and asked for more. She glared, and served you more, and glared, and served you more.', { rel: { '@hyeryeong': { aff: 15 } }, health: 3, flag: 'bn.rom.hyeryeong', codex: 'people.hyeryeong' })),
      R('Cook for her in return', 'insight', 20, O('You made noodles. They were edible. She was so surprised she forgot to be angry for an entire evening.', { rel: { '@hyeryeong': { aff: 18 } }, flag: 'bn.rom.hyeryeong', codex: 'people.hyeryeong' }), O('You set the kitchen on fire. A small fire. She put it out with her sleeve and laughed until she cried.', { rel: { '@hyeryeong': { aff: 12 } }, health: -2, flag: 'bn.rom.hyeryeong', codex: 'people.hyeryeong' })),
      M('Ask for the dish she burned the night you met, in another life', VOW.hyeryeong.id, O('"That is my grandmother’s recipe," she said slowly. "I always burn it." She cooked it. She burned it. You ate every bite.', { rel: { '@hyeryeong': { aff: 25 } }, flag: 'bn.rom.hyeryeong' })),
      C('Tell her the debt is paid', O('"It is not a debt," she snapped, and the dinners stopped, and you missed them more than you expected.', { rel: { '@hyeryeong': { res: 5, aff: -4 } } })),
    ] },
  { key: 'moyong_yeon', id: 'moyong_yeon', if: { age: [16, 34], or: [{ met: 'moyong_yeon' }, { loc: 'moyong' }] }, art: 'snow',
    text: 'Moyong Yeon informs you that she has been studying you, the way one studies a difficult manual. She would like to ask some questions. She has a list.',
    choices: [
      R('Answer every question honestly', 'sanity', 45, O('You answered all forty. She wrote for an hour, then looked up. "You are not what I expected," she said, which from a Moyong is a love poem.', { rel: { '@moyong_yeon': { aff: 12, res: 12 } }, flag: 'bn.rom.moyong_yeon', codex: 'people.moyong_yeon' }), O('You flinched at question nine. She noted it. She noted everything.', { rel: { '@moyong_yeon': { aff: 6, res: 6 } }, sanity: -2, flag: 'bn.rom.moyong_yeon', codex: 'people.moyong_yeon' })),
      C('Ask her questions back', O('You asked her questions back. Nobody had ever done that. She answered three, and then, flustered, left the room.', { rel: { '@moyong_yeon': { aff: 12, res: 8 } }, insight: 1, flag: 'bn.rom.moyong_yeon', codex: 'people.moyong_yeon' })),
      M('Answer the question on the last page before she asks it', VOW.moyong_yeon.id, O('She put down her brush. "That question is not on this list," she said. "I have not written it yet." For once, she had nothing to write.', { rel: { '@moyong_yeon': { aff: 25 } }, flag: 'bn.rom.moyong_yeon' })),
      C('Decline to be studied', O('She wrote that down too.', { rel: { '@moyong_yeon': { res: 6, aff: -2 } } })),
    ] },
  { key: 'dang_min', id: 'dang_min', if: { age: [15, 34], or: [{ met: 'dang_min' }, { loc: 'dangclan' }] }, art: 'garden',
    text: 'Dang Min accidentally poisoned you, a little, while testing an antidote, and is so mortified that he has not left your bedside in three days.',
    choices: [
      C('Tell him it was worth it', O('"It was worth it," you said, purple-lipped. Dang Min dropped a whole tray of vials.', { health: -5, rel: { '@dang_min': { aff: 15 } }, flag: 'bn.rom.dang_min', codex: 'people.dang_min' })),
      R('Help him fix the antidote', 'insight', 28, O('Between you, sweating, you got it right. He wrote your name on the recipe beside his.', { recipe: 'healing_salve', insight: 2, rel: { '@dang_min': { aff: 12, res: 8 } }, flag: 'bn.rom.dang_min', codex: 'people.dang_min' }), O('You got it wrong, twice. On yourself. He has not stopped apologising.', { health: -8, rel: { '@dang_min': { aff: 10 } }, flag: 'bn.rom.dang_min', codex: 'people.dang_min' })),
      M('Tell him which herb he left out, before he finds it', VOW.dang_min.id, O('He stared. "That would take me another month to find," he whispered. "How do you know Dang medicine?" You said you had a good teacher.', { rel: { '@dang_min': { aff: 22, res: 10 } }, flag: 'bn.rom.dang_min' })),
      C('Demand compensation from the Dang matriarch', O('Dang Ok-ran paid, smiling, which was more frightening than the poison. Dang Min could not look at you.', { wealth: 15, rel: { '@dang_min': { aff: -10 }, '@dang_okran': { res: 5 } } })),
    ] },
  { key: 'jegal_ha', id: 'jegal_ha', if: { age: [15, 34], or: [{ met: 'jegal_ha' }, { loc: 'jegal' }] }, art: 'library',
    text: 'Jegal Ha has started losing to you at baduk. She is very good at losing. You can tell, because she does it by exactly half a point, every time.',
    choices: [
      R('Beat her when she is trying', 'insight', 35, O('You made her try. You won anyway, by a whole point. She swept the stones away and said, "Again," and her ears were red.', { rel: { '@jegal_ha': { aff: 15, res: 15 } }, insight: 2, flag: 'bn.rom.jegal_ha', codex: 'people.jegal_ha' }), O('She tried. You lost by sixty points. She looked delighted.', { rel: { '@jegal_ha': { aff: 10 } }, flag: 'bn.rom.jegal_ha', codex: 'people.jegal_ha' })),
      C('Ask her what she wants', O('"For someone to notice," she said, and placed a stone. You noticed.', { rel: { '@jegal_ha': { aff: 14 } }, charm: 1, flag: 'bn.rom.jegal_ha', codex: 'people.jegal_ha' })),
      M('Lose to her by half a point, on purpose', VOW.jegal_ha.id, O('She counted the board twice. Then she looked up, very pale. "That is my trick," she said. "Nobody does that to me."', { rel: { '@jegal_ha': { aff: 25 } }, flag: 'bn.rom.jegal_ha' })),
      C('Stop playing', O('You stopped playing. She set up the board every evening for a month, alone.', { rel: { '@jegal_ha': { aff: -5 } } })),
    ] },
  { key: 'gaeun', id: 'gaeun', if: { age: [15, 34], or: [{ met: 'gaeun' }, { loc: 'hangzhou' }] }, art: 'market',
    text: 'Seo Ga-eun has drawn up a contract for the two of you. It covers business, the division of profits, and, in a small clause at the bottom, dinner every fifth day.',
    choices: [
      C('Sign it', O('You signed. She counter-signed so fast she smudged it, and blew on the ink for a long time to hide her face.', { rel: { '@gaeun': { aff: 15 } }, wealth: 5, flag: 'bn.rom.gaeun', codex: 'people.gaeun' })),
      R('Negotiate the dinner clause', 'charm', 22, O('You negotiated it to every third day. She called it the worst deal she had ever made, and kept it framed.', { rel: { '@gaeun': { aff: 18, res: 5 } }, flag: 'bn.rom.gaeun', codex: 'people.gaeun' }), O('You negotiated it down to every tenth day by accident. She was furious. She signed.', { rel: { '@gaeun': { aff: 8 } }, flag: 'bn.rom.gaeun', codex: 'people.gaeun' })),
      M('Point out the clause she always hides on the back', VOW.gaeun.id, O('She turned the contract over, slowly, to the clause you named. "I have not written that yet," she said. "I was going to write it tonight."', { rel: { '@gaeun': { aff: 25 } }, flag: 'bn.rom.gaeun' })),
      C('Refuse to sign anything you have not read twice', O('She approved of that, professionally. Personally, less so.', { rel: { '@gaeun': { res: 8, aff: 2 } }, insight: 1 })),
    ] },
  { key: 'taeo', id: 'taeo', if: { age: [15, 34], or: [{ met: 'taeo' }, { loc: 'luoyang' }] }, art: 'road',
    text: 'Kang Tae-o, the escort guard with the crooked smile, keeps volunteering for every caravan you travel with. He says it is a coincidence. He is a very bad liar.',
    choices: [
      C('Ride beside him', O('You rode beside him from Luoyang to Kaifeng. He told you every story he knows, twice, and was gloriously wrong about all the geography.', { rel: { '@taeo': { aff: 15 } }, flag: 'bn.rom.taeo', codex: 'people.taeo' })),
      P('Ask him to teach you the escort spear', 0.5, O('He taught you well, standing very close to correct your grip.', { body: 2, rel: { '@taeo': { aff: 10, res: 5 } }, flag: 'bn.rom.taeo', codex: 'people.taeo' }), O('He tried, and mostly taught you to fall off a horse correctly.', { health: -3, rel: { '@taeo': { aff: 8 } }, flag: 'bn.rom.taeo', codex: 'people.taeo' })),
      M('Tell him not to buy the silver hairpin yet', VOW.taeo.id, O('He went so red he nearly fell off the wagon. "What hairpin?" he said. "There is no hairpin." There was, in his pocket.', { rel: { '@taeo': { aff: 25 } }, flag: 'bn.rom.taeo' })),
      C('Report the coincidence to his chief', O('Chief Pyo Gwang laughed until his moustache shook and assigned Tae-o to the salt route. Tae-o waved at you sadly from the other road.', { rel: { '@taeo': { aff: -5 }, '@escort_chief': { aff: 5 } } })),
    ] },
], (r) => E('bn_spark', 'bonds', {
  if: { alive: r.id, married: false, not: `bn.rom.${r.key}`, npc: { [`@${r.id}`]: { role: OPEN } }, ...r.if },
  art: r.art, text: r.text, choices: r.choices,
}));

// ── Romance, stage two: the heart ─────────────────────────────────
// Each person’s own crossroads: an arranged match, a vow, a test from the family. Success makes them
// your beloved (and sets `bn.rom.<key>=2`).
const HEART = template('bn_heart', [
  { key: 'harin', id: 'hua_harin', if: { age: [16, 33] }, art: 'mountain',
    text: 'You find Ok Ha-rin alone on Lotus Peak at night, crying over a broken practice sword she has had since she was nine.',
    choices: [
      R('Tell her how you feel', 'charm', 22, O('You told her. She laughed, wet-eyed, and held on to your sleeve with both hands. "Took you long enough."', { rel: { '@hua_harin': { aff: 10, role: 'lover' } }, flag: 'bn.rom.harin=2', sanity: 4 }), O('She laughed, wet-eyed, and said, "Not tonight." It was not a no.', { rel: { '@hua_harin': { aff: 5 } } })),
      Q('Have a Chang’an smith reforge it (20 taels)', { stat: { wealth: '>=20' } }, O('The sword came back whole, with a plum blossom on the guard. She did not say anything. She kissed you instead.', { wealth: -20, rel: { '@hua_harin': { aff: 15, role: 'lover' } }, flag: 'bn.rom.harin=2' })),
      M('Warn her about the Blood Night', 'timeline.blood_night', O('She did not laugh. She listened to every word, then wiped her face. "Then we had better be ready," she said, and kept your hand.', { flag: 'bn.harin.warned', rel: { '@hua_harin': { aff: 8, res: 10 } } })),
    ] },
  { key: 'jiho', id: 'jiho', if: { age: [16, 30] }, art: 'river',
    text: 'Han Ji-ho’s father wants him to marry the butcher’s daughter by spring. Ji-ho tells you this at the mill race, looking at the water, not at you.',
    choices: [
      R('Tell him not to', 'charm', 18, O('"Don’t," you said. He turned from the water. "All right," he said, as if it were simple. For him it was.', { rel: { '@jiho': { aff: 12, role: 'lover' } }, flag: 'bn.rom.jiho=2' }), O('You could not get the words out. He married her in spring, and looked for you in the crowd.', { rel: { '@jiho': { aff: -5, role: 'friend' } }, npcFlag: { '@jiho': 'wed' }, sanity: -6 })),
      C('Wish him happiness', O('You wished him happiness. He thanked you very politely, which was how you knew.', { rel: { '@jiho': { aff: -5, role: 'friend' } }, npcFlag: { '@jiho': 'wed' }, sanity: -4 })),
      R('Go and talk to his father yourself', 'fame', 15, O('The old miller heard you out, scratched his head, and said the butcher’s daughter could do better anyway.', { rel: { '@jiho': { aff: 15, role: 'lover' } }, flag: 'bn.rom.jiho=2', fame: 1 }), O('The old miller threw you out of the mill. Ji-ho climbed out of the window that night to apologise.', { rel: { '@jiho': { aff: 8 } } })),
    ] },
  { key: 'bora', id: 'bora', if: { age: [16, 32] }, art: 'letter',
    text: 'Yun Bo-ra has been offered a post as tutor to a magistrate’s daughters in Chang’an. It is everything she ever wanted. She asks what you think, very carefully.',
    choices: [
      C('Tell her to go, and that you will follow', O('"You will follow?" she said. "You?" Then she kissed you, briskly, as if checking a fact.', { rel: { '@bora': { aff: 15, role: 'lover' } }, flag: 'bn.rom.bora=2' })),
      R('Ask her to stay', 'charm', 30, O('She stayed, and complained about it happily for years.', { rel: { '@bora': { aff: 12, role: 'lover' } }, flag: 'bn.rom.bora=2' }), O('She went. Her letters were long and kind and never said the thing.', { rel: { '@bora': { aff: 2 } }, sanity: -5 })),
      C('Tell her to go, and say nothing else', O('She went. She wrote once, about the magistrate’s library. She did not ask what you had meant to say.', { rel: { '@bora': { res: 5 } }, insight: 1, sanity: -3 })),
    ] },
  { key: 'sohee', id: 'namgung_sohee', if: { age: [16, 37] }, art: 'estate',
    text: 'Namgung So-hee’s engagement to a Moyong cousin has been announced. She finds you in the plum garden at night with her sword drawn, and asks you to give her one reason not to run.',
    choices: [
      R('Give her a reason', 'charm', 28, O('You gave her one. She sheathed the sword. "That is a terrible reason," she said, and kissed you anyway.', { rel: { '@namgung_sohee': { aff: 12, role: 'lover' } }, rep: { families: -5 }, flag: 'bn.rom.sohee=2' }), O('Your reason was not good enough. She ran. Her father’s men found her in Hangzhou, and she has not written.', { rel: { '@namgung_sohee': { aff: 3 } }, sanity: -6 })),
      C('Run with her', O('You ran together as far as Chang’an. Her father’s men caught up there, and so did her courage: she went home and broke the engagement herself, holding your hand.', { rel: { '@namgung_sohee': { aff: 18, role: 'lover' } }, rep: { families: -12 }, infamy: 2, flag: ['bn.rom.sohee=2', 'bn.sohee.fled'] })),
      C('Tell her to stay and fight for herself', O('She broke off the engagement in front of her father the next morning. She did not need you for that. She wanted you to see it.', { rel: { '@namgung_sohee': { res: 15, aff: 5 } } })),
    ] },
  { key: 'haryeong', id: 'haryeong', if: { age: [16, 40] }, art: 'demonic',
    text: 'Dan Ha-ryeong orders you to tell her one true thing that nobody else in the Cult would dare say to her face.',
    choices: [
      R('Tell her she is lonely', 'sanity', 40, O('She did not move for a long time. Then she took your face in her hands, the way one inspects a blade, and kissed you.', { rel: { '@haryeong': { aff: 12, role: 'lover' } }, flag: 'bn.rom.haryeong=2' }), O('She had you whipped. Then she sent you medicine, herself, at midnight.', { health: -10, rel: { '@haryeong': { res: 8, aff: 5 } } })),
      M('Tell her the Blood Faction is moving against her', 'timeline.cult_coup', O('"I know," she said. "But you are the first to say it to me." She kissed you once, like a seal pressed into wax.', { flag: ['bn.rom.haryeong=2', 'bn.haryeong.warned'], rel: { '@haryeong': { aff: 10, res: 15, role: 'lover' } } })),
      C('Tell her she is beautiful', O('"That is what everyone says," she said, bored, and dismissed you.', { rel: { '@haryeong': { aff: -5 } } })),
    ] },
  { key: 'yeonwoo', id: 'yeonwoo', if: { age: [16, 36] }, art: 'temple',
    text: 'Song Yeon-woo has been ordered into a three-year seclusion by his master. He comes to say goodbye and cannot finish a single sentence.',
    choices: [
      R('Finish one for him', 'charm', 20, O('You finished the sentence. He stared, then nodded, then apologised, then kissed you, then apologised for that.', { rel: { '@yeonwoo': { aff: 12, role: 'lover' } }, flag: 'bn.rom.yeonwoo=2' }), O('You finished the wrong sentence. He agreed with it politely and went into seclusion very confused.', { rel: { '@yeonwoo': { aff: 4 } } })),
      C('Promise to wait for him', O('"Three years," he said. "I will count every day." He did; he showed you the marks later.', { rel: { '@yeonwoo': { aff: 15, role: 'lover' } }, flag: ['bn.rom.yeonwoo=2', 'bn.yeonwoo.wait'], sanity: -2 })),
      C('Wish him enlightenment', O('He bowed very low. You suspect enlightenment was not what he had come for.', { rel: { '@yeonwoo': { res: 5 } }, rep: { orthodox: 1 } })),
    ] },
  { key: 'hyeryeong', id: 'hyeryeong', if: { age: [16, 36] }, art: 'temple',
    text: 'Gang Hye-ryeong has been offered ordination as an Emei nun. She must answer the Abbess by the full moon, and she has told nobody but you.',
    choices: [
      R('Tell her you love her', 'charm', 25, O('She threw a dumpling at you, then cried, then declined the ordination in a letter that made the Abbess laugh for the first time in a decade.', { rel: { '@hyeryeong': { aff: 12, role: 'lover' }, '@abbess': { res: -5 } }, flag: 'bn.rom.hyeryeong=2' }), O('She took the vows. She cooked you one last dinner first, and burned it.', { npcFlag: { '@hyeryeong': 'nun' }, rel: { '@hyeryeong': { aff: -2 } }, sanity: -8 })),
      C('Tell her to choose for herself', O('She chose the sword and not the vows, and told you so with a glare that said she had expected more of you.', { rel: { '@hyeryeong': { res: 10, aff: 6 } } })),
      Q('Duel her for the answer', { realm: '>=2' }, O('She drew before you finished the sentence.', { combat: { foe: '@hyeryeong', context: 'spar', win: { text: 'You won. She sat in the dust and laughed. "Fine," she said. "You can have the answer." The answer was you.', rel: { '@hyeryeong': { aff: 12, res: 12, role: 'lover' } }, flag: 'bn.rom.hyeryeong=2' }, lose: { text: 'She won. "I keep my vows to swords," she said, "not to Abbesses," and declined the ordination anyway.', rel: { '@hyeryeong': { aff: 8, res: 10 } } } } })),
    ] },
  { key: 'moyong_yeon', id: 'moyong_yeon', if: { age: [17, 36] }, art: 'snow',
    text: 'Moyong Yeon presents you with her finished study of you: forty pages, bound in blue silk. The last page is blank except for a single question.',
    choices: [
      R('Answer the question', 'insight', 30, O('You answered it. She read your answer twice, closed the book, and took your hand as if adding a footnote.', { rel: { '@moyong_yeon': { aff: 12, role: 'lover' } }, flag: 'bn.rom.moyong_yeon=2' }), O('You answered a different question. She sighed. "Close," she said, and kept the book.', { rel: { '@moyong_yeon': { aff: 4 } } })),
      P('Write your answer on the blank page and give it back', 0.6, O('She read it in the snow and forgot, for once, to be composed.', { rel: { '@moyong_yeon': { aff: 15, role: 'lover' } }, flag: 'bn.rom.moyong_yeon=2' }), O('She read it, nodded, and filed it. You will never know what she thought.', { rel: { '@moyong_yeon': { res: 5 } }, sanity: -2 })),
      C('Ask for a copy', O('She gave you a copy. It is the most accurate thing anyone has ever written about you, and you did not enjoy it.', { insight: 2, rel: { '@moyong_yeon': { aff: 5 } } })),
    ] },
  { key: 'dang_min', id: 'dang_min', if: { age: [16, 36] }, art: 'garden', danger: true,
    text: 'The Dang matriarch has noticed how much time her grandson spends with you. She invites you to tea. There are three cups. Dang Min is very pale.',
    choices: [
      R('Drink the tea', 'health', 50, O('It was only tea. Probably. Dang Ok-ran smiled at you for the first time, which was worse.', { rel: { '@dang_min': { aff: 12, role: 'lover' }, '@dang_okran': { res: 15 } }, flag: 'bn.rom.dang_min=2' }), O('It was not only tea. You lived. Dang Min did not leave your side for a week, and his grandmother nodded, satisfied, as if you had passed.', { health: -20, rel: { '@dang_min': { aff: 15, role: 'lover' }, '@dang_okran': { res: 10 } }, flag: 'bn.rom.dang_min=2' })),
      M('Swap the cups, the way she expects', 'people.dang_okran', O('You swapped the cups. Dang Ok-ran laughed out loud, drank hers, and said, "Finally, someone with sense." Dang Min nearly fainted with relief.', { rel: { '@dang_min': { aff: 10, role: 'lover' }, '@dang_okran': { res: 25 } }, flag: 'bn.rom.dang_min=2' })),
      C('Refuse the tea politely', O('Dang Min walked you to the gate, apologising for his entire family for an hour.', { rel: { '@dang_okran': { res: -10 }, '@dang_min': { aff: -3 } } })),
    ] },
  { key: 'jegal_ha', id: 'jegal_ha', if: { age: [16, 36] }, art: 'library',
    text: 'Jegal Ha has left a baduk problem on the board in your room. The stones, you realise after a long time, spell out a question.',
    choices: [
      R('Solve it', 'insight', 32, O('You solved it, and answered with one stone at the centre point. She came in, saw it, and sat down very suddenly.', { rel: { '@jegal_ha': { aff: 12, role: 'lover' } }, insight: 1, flag: 'bn.rom.jegal_ha=2' }), O('You solved a different problem. She sighed and swept the stones back into their bowls.', { rel: { '@jegal_ha': { aff: -2 } } })),
      P('Answer with a single stone, and hope', 0.5, O('The stone landed in the right place, by luck. She does not know it was luck. She will never know.', { rel: { '@jegal_ha': { aff: 12, role: 'lover' } }, flag: 'bn.rom.jegal_ha=2' }), O('The stone landed in the wrong place. She studied it for an hour and decided it meant something profound and sad.', { rel: { '@jegal_ha': { res: 5 } }, sanity: -2 })),
      C('Ask her to just say it', O('"Where would be the fun in that?" she said, and kept the problem on the board for a year.', { rel: { '@jegal_ha': { aff: 5 } }, charm: 1 })),
    ] },
  { key: 'gaeun', id: 'gaeun', if: { age: [16, 36] }, art: 'market',
    text: 'Seo Ga-eun’s family has found her a match: the heir of a rival silk house. It would merge two fortunes. She shows you the accounts. They are very good accounts.',
    choices: [
      Q('Put a better offer on the table (60 taels)', { stat: { wealth: '>=60' } }, O('You put sixty taels on the table. "That is a terrible investment," she said, and took your hand instead of the money.', { rel: { '@gaeun': { aff: 15, role: 'lover' } }, flag: 'bn.rom.gaeun=2' })),
      R('Find the flaw in the accounts', 'insight', 28, O('You found it: the rival house was nearly bankrupt. Her family broke the match. She looked at you over the ledger as if you had given her pearls.', { rel: { '@gaeun': { aff: 12, res: 10, role: 'lover' } }, flag: 'bn.rom.gaeun=2', rep: { merchants: 3 } }), O('You found nothing wrong. They were very good accounts.', { rel: { '@gaeun': { aff: 3 } }, sanity: -3 })),
      P('Tell her to marry for love', 0.5, O('She looked at you for a long time. "I am trying to," she said.', { rel: { '@gaeun': { aff: 12, role: 'lover' } }, flag: 'bn.rom.gaeun=2' }), O('"Love does not balance," she said, and married the ledger.', { rel: { '@gaeun': { aff: -5, role: 'friend' } }, npcFlag: { '@gaeun': 'wed' }, sanity: -6 })),
    ] },
  { key: 'taeo', id: 'taeo', if: { age: [16, 36] }, art: 'road',
    text: 'Kang Tae-o took an arrow meant for you on the Kaifeng road. The physician says he will live. He says he would do it again, and then blushes so hard he nearly faints.',
    choices: [
      C('Stay by his bed until he wakes properly', O('You stayed three days. When he woke, you were asleep holding his hand. He did not move until you woke too.', { rel: { '@taeo': { aff: 15, role: 'lover' } }, flag: 'bn.rom.taeo=2', sanity: 3 })),
      R('Tell him never to do it again', 'charm', 15, O('"Never again," you said, fiercely, and kissed him to make the point. He agreed to nothing.', { rel: { '@taeo': { aff: 12, role: 'lover' } }, flag: 'bn.rom.taeo=2' }), O('It came out as a scolding. He apologised for being shot.', { rel: { '@taeo': { aff: 5 } } })),
      Q('Pay for the best physician in Kaifeng (15 taels)', { stat: { wealth: '>=15' } }, O('The physician was excellent. Tae-o was on his feet in a week, following you around with a sling and a crooked smile.', { wealth: -15, rel: { '@taeo': { aff: 10, res: 5, role: 'lover' } }, flag: 'bn.rom.taeo=2' })),
    ] },
], (r) => E('bn_heart', 'bonds', {
  if: { flag: `bn.rom.${r.key}`, not: `bn.rom.${r.key}>=2`, alive: r.id, married: false, npc: { [`@${r.id}`]: { aff: '>=35', role: OPEN } }, ...r.if },
  art: r.art, danger: r.danger, text: r.text, choices: r.choices,
}));

// ── Romance, stage three: the vow ─────────────────────────────────
// Once they are your beloved: the proposal, and whatever stands in its way. Marriage is remembered.
const VOW_TPL = template('bn_vow', [
  { key: 'harin', id: 'hua_harin', if: { year: '<=33' }, art: 'wedding',
    text: 'Ok Ha-rin asked the Sect Leader’s permission to marry you before she asked you, which is very like her. Hyeon Mu-gyeong said yes. Everyone on the mountain knows except you, until now.',
    choices: [
      C('Say yes in front of everyone', O('You said yes in the main hall. The whole sect cheered, and Elder Seo Un-pyeong cried into his wine gourd.', { marry: '@hua_harin', sanity: 8, codex: VOW.harin, rel: { '@hua_leader': { aff: 5 } } })),
      M('Marry her, and make her promise to be far from the mountain in the spring of year 34', 'timeline.blood_night', O('You married her under the plum trees and made her promise. She did, laughing, not understanding. You will hold her to it.', { marry: '@hua_harin', codex: VOW.harin, flag: 'bn.harin.promise', sanity: 4 })),
      C('Ask her to wait until the danger has passed', O('"What danger?" she said. You could not explain. She waited, hurt and patient.', { rel: { '@hua_harin': { aff: -5 } }, sanity: -3 })),
    ] },
  { key: 'jiho', id: 'jiho', if: { age: [18, 50] }, art: 'estate',
    text: 'Han Ji-ho has built a house. He did it himself, badly, on the hill above the mill where you used to watch the stars. One door, two windows, and a question he has been practising for a month.',
    choices: [
      C('Say yes before he finishes', O('You said yes before he finished. He finished anyway, because he had practised.', { marry: '@jiho', codex: VOW.jiho, sanity: 6 })),
      C('Say yes, and then fix the roof', O('You said yes and spent your wedding month on the roof. It still leaks. It is yours.', { marry: '@jiho', codex: VOW.jiho, body: 1, wealth: -5 })),
      C('Tell him you cannot stay in Willow Creek', O('He nodded, as if he had always known. He kept the house. He never put anyone else in it.', { rel: { '@jiho': { aff: -15, role: 'friend' } }, sanity: -5 })),
    ] },
  { key: 'bora', id: 'bora', if: { age: [18, 50] }, art: 'scroll',
    text: 'Yun Bo-ra proposes to you herself, in writing, with footnotes. The footnotes address every objection you might have, and several you would never have thought of.',
    choices: [
      R('Find an objection she missed', 'insight', 35, O('You found one: she had not accounted for your snoring. She married you anyway, delighted, and added an appendix.', { marry: '@bora', codex: VOW.bora, insight: 2 }), O('There were no objections she had missed. You married her, outmanoeuvred.', { marry: '@bora', codex: VOW.bora })),
      C('Write your acceptance with footnotes of your own', O('Your footnotes were mostly jokes. She read them aloud at the wedding.', { marry: '@bora', codex: VOW.bora, charm: 1, sanity: 4 })),
      C('Ask for time', O('She gave you time, and a reading list.', { rel: { '@bora': { aff: -5 } } })),
    ] },
  { key: 'sohee', id: 'namgung_sohee', if: { year: '<=37' }, art: 'estate',
    text: 'Namgung Hwi has learned about you and his daughter. He receives you in the great hall, under nine generations of Namgung portraits, and asks what exactly you are.',
    choices: [
      R('Answer as an equal', 'fame', 30, O('He listened, and for a long moment nothing happened. Then he said, "Hm," which in the Namgung is a blessing.', { marry: '@namgung_sohee', codex: VOW.sohee, rep: { families: 5 }, rel: { '@namgung_hwi': { res: 10 } } }), O('He had you thrown out. So-hee climbed over the wall that night with a bag already packed.', { marry: '@namgung_sohee', codex: VOW.sohee, rep: { families: -10 }, flag: 'bn.sohee.fled' })),
      Q('Answer with your sword', { realm: '>=4' }, O('You drew, and showed him. When you sheathed it, nine generations of portraits had nothing to say. Neither did he, except: "When?"', { marry: '@namgung_sohee', codex: VOW.sohee, fame: 3, rel: { '@namgung_hwi': { res: 15 } } })),
      C('Withdraw, for her sake', O('You withdrew. She did not forgive you, and she was right not to.', { rel: { '@namgung_sohee': { aff: -20, role: 'friend' } }, sanity: -6 })),
    ] },
  { key: 'haryeong', id: 'haryeong', art: 'demonic',
    text: 'Dan Ha-ryeong informs you that you will be married at the next new moon. It is not a question. Then, quietly, when the guards have gone: "Unless you would rather not."',
    choices: [
      C('"I would rather."', O('You were married at the new moon, under red banners. She did not smile once during the ceremony, and did not stop smiling afterwards.', { marry: '@haryeong', codex: VOW.haryeong, rep: { cult: 10 } })),
      M('Marry her, and double the guard on her chambers before the spring of year 29', 'timeline.cult_coup', O('You married her and changed every guard on her door with your own people. She noticed. "Paranoid," she said, approving.', { marry: '@haryeong', codex: VOW.haryeong, flag: 'bn.haryeong.guard', rep: { cult: 5 } }, { show: { year: '<=28' } })),
      P('Ask her to leave the Cult with you', 0.3, O('She looked west at the black peaks for a long time. Then she took off the Young Heavenly Demon’s ring. You were married in a lowland village by a priest who had no idea who she was.', { marry: '@haryeong', codex: VOW.haryeong, rep: { cult: -20 }, flag: 'bn.haryeong.fled' }), O('"Then you do not know me at all," she said.', { rel: { '@haryeong': { aff: -15, role: 'friend' } }, sanity: -6 })),
    ] },
  { key: 'yeonwoo', id: 'yeonwoo', if: { age: [18, 60] }, art: 'temple',
    text: 'Song Yeon-woo came out of seclusion a season early, which his master says has never happened, and walked straight down the mountain to ask you a question.',
    choices: [
      C('Answer it', O('You answered it. His master, watching from the steps, threw up his hands and went to find a priest.', { marry: '@yeonwoo', codex: VOW.yeonwoo, rep: { orthodox: 2 } })),
      R('Make him ask without apologising', 'charm', 25, O('He managed it, sweating. You married him the following spring, and he did not apologise once during the vows.', { marry: '@yeonwoo', codex: VOW.yeonwoo, charm: 1, sanity: 4 }), O('He apologised four times. You married him anyway.', { marry: '@yeonwoo', codex: VOW.yeonwoo })),
      C('Tell him to go back and finish', O('He went back and finished. It was the right thing. He did not come down again.', { rel: { '@yeonwoo': { res: 10, aff: -8 } }, sanity: -3 })),
    ] },
  { key: 'hyeryeong', id: 'hyeryeong', if: { age: [18, 60] }, art: 'feast',
    text: 'Gang Hye-ryeong has cooked a nine-course banquet, which in her family means one thing, and invited the Abbess of Emei, which in hers means another.',
    choices: [
      R('Win the Abbess over', 'charm', 32, O('By the eighth course the Abbess was telling stories about Hye-ryeong as a child. That is consent.', { marry: '@hyeryeong', codex: VOW.hyeryeong, rep: { orthodox: 5 }, rel: { '@abbess': { res: 10 } } }), O('The Abbess left before the soup. Hye-ryeong married you anyway, and sent the Abbess the leftovers.', { marry: '@hyeryeong', codex: VOW.hyeryeong, rep: { orthodox: -3 }, rel: { '@abbess': { res: -10 } } })),
      C('Eat all nine courses and propose with your mouth full', O('You proposed with your mouth full. She said yes with hers.', { marry: '@hyeryeong', codex: VOW.hyeryeong, health: 3 })),
      C('Leave before the soup', O('You left before the soup. She threw the soup after you.', { rel: { '@hyeryeong': { aff: -20, role: 'friend' } }, sanity: -4 })),
    ] },
  { key: 'moyong_yeon', id: 'moyong_yeon', if: { age: [18, 60] }, art: 'snow',
    text: 'Moyong Baek summons you to the Moyong seat. The sea is grey, the hall is colder, and the patriarch wishes to know whether his daughter’s "study" has concluded.',
    choices: [
      R('Hold his gaze', 'sanity', 45, O('You held it. He looked away first, which no one has seen in twenty years. The wedding was small and very cold and Yeon said it was perfect.', { marry: '@moyong_yeon', codex: VOW.moyong_yeon, rel: { '@moyong_baek': { res: 10 } }, rep: { families: 5 } }), O('You looked away. He dismissed you. Yeon married you anyway, in a fishing village, and sent him a very polite letter.', { marry: '@moyong_yeon', codex: VOW.moyong_yeon, rel: { '@moyong_baek': { res: -10 } }, rep: { families: -4 } })),
      Q('Present a betrothal gift worthy of the Moyong', { item: 'jade_pendant' }, O('He turned the jade over once, as if weighing you with it. "Adequate," he said. From him, a feast.', { take: { jade_pendant: 1 }, marry: '@moyong_yeon', codex: VOW.moyong_yeon, rep: { families: 3 } })),
      C('Leave the north', O('You left the north. Yeon added a final page to her study, and closed the book.', { rel: { '@moyong_yeon': { aff: -15, role: 'friend' } }, sanity: -5 })),
    ] },
  { key: 'dang_min', id: 'dang_min', if: { age: [18, 60] }, art: 'garden',
    text: 'Dang Min has made you a ring with a hollow stone. Inside, he explains nervously, is the antidote to every poison his family has ever made. It is the most romantic thing any Dang has ever done.',
    choices: [
      C('Wear it', O('You wore it. You married him in the poison garden, among the prettiest flowers in Shu, none of which you touched.', { marry: '@dang_min', codex: VOW.dang_min, health: 5 })),
      M('Tell him about the Dang civil war, and that you will stand with him', 'timeline.dang_civil_war', O('He listened, very quiet. Then he took the ring back, added one more antidote, and gave it to you again. "For both of us, then."', { marry: '@dang_min', codex: VOW.dang_min, flag: 'bn.dang.warned', rel: { '@dang_okran': { res: 10 } } }, { show: { year: '<=25' } })),
      P('Ask him to leave his family', 0.4, O('He packed his medicine chest and nothing else. You married in Chengdu. The Dang sent a gift that you had tested before opening.', { marry: '@dang_min', codex: VOW.dang_min, rep: { families: -10 } }), O('"I cannot," he said. "They need someone who would rather cure." He gave you the ring anyway.', { rel: { '@dang_min': { aff: -10, role: 'friend' } }, sanity: -5 })),
    ] },
  { key: 'jegal_ha', id: 'jegal_ha', if: { age: [18, 60] }, art: 'library',
    text: 'Jegal Ha planned your proposal, she admits, eleven moves ahead. She is now on move twelve, which she did not plan, and is visibly panicking.',
    choices: [
      C('Make move twelve for her', O('You made it. She laughed so hard she knocked over the board, and then said yes from underneath the table.', { marry: '@jegal_ha', codex: VOW.jegal_ha, sanity: 5 })),
      R('Make her play it out', 'insight', 30, O('She played it out, brilliantly, and the proposal she improvised was better than the one she planned.', { marry: '@jegal_ha', codex: VOW.jegal_ha, insight: 3 }), O('She lost on purpose, by half a point. You let her.', { marry: '@jegal_ha', codex: VOW.jegal_ha })),
      C('Resign the game', O('You resigned. She stared at the board for a long time, alone, after you left.', { rel: { '@jegal_ha': { aff: -15, role: 'friend' } }, sanity: -4 })),
    ] },
  { key: 'gaeun', id: 'gaeun', if: { age: [18, 60] }, art: 'market',
    text: 'Seo Ga-eun has proposed a merger. The terms are on silk, the seal is her grandmother’s, and the dowry column is blank where she expects you to write something.',
    choices: [
      Q('Write a hundred taels', { stat: { wealth: '>=100' } }, O('You wrote it and paid it. She invested it the same afternoon. It has tripled. She calls it "our first child".', { wealth: -100, marry: '@gaeun', codex: VOW.gaeun, rep: { merchants: 10 } })),
      C('Write: "everything"', O('You wrote "everything". She crossed it out and wrote "enough", and sealed it.', { marry: '@gaeun', codex: VOW.gaeun, charm: 1 })),
      R('Negotiate', 'charm', 30, O('You negotiated a dowry from her side instead. She was so impressed she married you that week.', { marry: '@gaeun', codex: VOW.gaeun, wealth: 20 }), O('You negotiated badly. She tore up the silk. "Come back when you mean it."', { rel: { '@gaeun': { aff: -10 } } })),
    ] },
  { key: 'taeo', id: 'taeo', if: { age: [18, 60] }, art: 'city',
    text: 'Kang Tae-o has saved three years for a silver hairpin. He drops it in the street trying to give it to you, and both of you dive for it at once.',
    choices: [
      C('Let him put it in your hair', O('He put it in your hair, in the middle of the street, hands shaking. A fruit seller applauded.', { marry: '@taeo', codex: VOW.taeo, sanity: 6 })),
      C('Ask Chief Pyo Gwang to officiate', O('Pyo Gwang married you in the agency courtyard between two caravans, and gave Tae-o a week off, which has never happened.', { marry: '@taeo', codex: VOW.taeo, rel: { '@escort_chief': { aff: 10 } } })),
      C('Tell him you are bound for places he cannot follow', O('He picked up the hairpin and put it back in his pocket. He was still carrying it, they say, years later.', { rel: { '@taeo': { aff: -15, role: 'friend' } }, sanity: -4 })),
    ] },
], (r) => E('bn_vow', 'bonds', {
  if: { alive: r.id, married: false, age: [18, 70], npc: { [`@${r.id}`]: { role: 'lover' } }, ...r.if },
  art: r.art, title: 'A proposal', text: r.text, choices: r.choices,
}));

// ── The regressor’s reunions ──────────────────────────────────────
// In a later life you meet people you knew before. They do not know you. You know their songs.
const AGAIN = template('bn_again', [
  { key: 'jiho', id: 'jiho', if: { age: [6, 12], met: 'jiho' }, art: 'river',
    text: 'Han Ji-ho, aged eight, offers you half his rice cake. In another life he was at your side for fifty years. He does not know that. He only thinks you look hungry.',
    choices: [
      C('Take it, and do not cry', O('You took it and did not cry, mostly. He decided you were strange and followed you everywhere after that.', { rel: { '@jiho': { aff: 15, role: 'friend' } }, sanity: -2 })),
      C('Tell him he will be the best miller in Guanzhong', O('He looked at you as if you were mad, and then, slowly, very pleased.', { rel: { '@jiho': { aff: 8, res: 5 } } })),
      M('Remember the house he built for you, once', VOW.jiho.id, O('You were married, once. He is eight. You ate the rice cake and that night cried into your pillow where nobody could hear.', { rel: { '@jiho': { aff: 20 } }, sanity: -6, insight: 1 })),
    ] },
  { key: 'bora', id: 'bora', if: { age: [7, 14], met: 'bora' }, art: 'library',
    text: 'Yun Bo-ra, nine years old, is teaching herself characters from the almanac with a stick in the dirt. In another life she wrote a book. In this one she has not yet learned the character for "book".',
    choices: [
      Q('Bring her a real book (5 taels)', { stat: { wealth: '>=5' } }, O('You gave her a battered copy of the Analects. She held it like a live bird.', { wealth: -5, rel: { '@bora': { aff: 15, res: 5 } }, insight: 1 })),
      C('Ask her to teach you, again', O('She taught you, as if for the first time. For her it was. You were a far better student than she expected.', { rel: { '@bora': { aff: 10, res: 10 } }, insight: 2 })),
    ] },
  { key: 'dongsu', id: 'dongsu', if: { age: [9, 30], notMet: 'dongsu', loc: 'luoyang' }, art: 'city',
    text: 'A Beggars’ Sect boy with a missing front tooth bumps into you in Luoyang and is three streets away with your purse before you notice. You know where he will go. You have known him for a lifetime.',
    choices: [
      C('Wait for him under the Tianjin Bridge', O('You were sitting on his favourite stone when he got there. He nearly fell in the river. "How?" You held out your hand for the purse, then gave him half.', { meet: '@dongsu', rel: { '@dongsu': { aff: 20, res: 10 } }, wealth: -1 })),
      C('Let him keep it', O('You let him keep it. Somewhere in Luoyang a boy ate well that night and never knew who paid.', { wealth: -4, meet: '@dongsu', sanity: 2 })),
    ] },
  { key: 'ilgak', id: 'ilgak', if: { age: [10, 40], notMet: 'ilgak', loc: 'songshan' }, art: 'temple',
    text: 'Behind the Scripture Pavilion, a young monk the size of a door is hiding with a roast chicken. He has never met you. You have shared a hundred chickens with him.',
    choices: [
      C('Sit down and hold out your hand for a leg', O('He stared, then tore off a leg and gave it to you, as if this happened every day. "Do I know you?" he asked, chewing. "You will," you said.', { meet: '@ilgak', rel: { '@ilgak': { aff: 25, role: 'friend' } } })),
      P('Pretend to be a disciplinary monk', 0.5, O('He dropped the chicken, saw your face, and laughed so hard the bell-ringer came to look. You were friends by the time he stopped.', { meet: '@ilgak', rel: { '@ilgak': { aff: 18 } } }), O('He believed you completely and fled. It took a month to get him to speak to you.', { meet: '@ilgak', rel: { '@ilgak': { aff: 3, res: 5 } } })),
    ] },
  { key: 'mokcheol', id: 'mokcheol', if: { age: [6, 14], met: 'mokcheol', faction: 'cult' }, art: 'demonic',
    text: 'Mok Cheol gives you half his rice again. In another life you stood beside him in every formation for forty years. His hands are so small now.',
    choices: [
      C('Give him half of yours back', O('He looked at the rice, then at you, and for the first time in any life you can remember, he grinned.', { rel: { '@mokcheol': { aff: 15, role: 'friend' } } })),
      C('Hold on to his sleeve a moment too long', O('He did not ask why. He never does. He stood closer to you in formation the next day.', { rel: { '@mokcheol': { aff: 8, res: 5 } }, sanity: -2 })),
    ] },
  { key: 'paeng_gu', id: 'paeng_gu', if: { age: [14, 50], notMet: 'paeng_gu', loc: 'paeng' }, art: 'feast',
    text: 'Paeng Gu is challenging all comers to a drinking contest in the fortress yard. In another life you were sworn siblings. He looks right through you, and then challenges you too.',
    choices: [
      R('Out-drink him again', 'body', 28, O('You out-drank him. He wept, hugged you, and declared you his sibling, exactly as before. You had to go outside for a while.', { meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 25 } }, sanity: -2 }), O('He out-drank you. He always could, it turns out; last time he let you win.', { meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 12 } }, health: -3 })),
      C('Order the plum wine with pepper that nobody else drinks', O('He stared at the cup. "That is my drink," he said. "Nobody drinks that." He sat down beside you and did not get up all night.', { meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 20, res: 5 } } })),
    ] },
  { key: 'hua_senior', id: 'hua_senior', if: { age: [8, 25], met: 'hua_senior', sect: 'mounthua', year: '<=33' }, art: 'mountain',
    text: 'Bang Ho-jin, your senior brother, assigns you latrine duty with a sneer. In your last life he died on the main hall steps, covering your retreat. The sneer is only the outside.',
    choices: [
      C('Thank him, sincerely', O('You thanked him. He was deeply suspicious for a month, and then, grudgingly, kind.', { rel: { '@hua_senior': { aff: 15, res: -3 } } })),
      M('Warn him about the Blood Night', 'timeline.blood_night', O('He laughed, then saw you were not joking. "Then I will be on the steps," he said, as if that settled it. You will have to think of something better.', { rel: { '@hua_senior': { res: 10 } }, flag: 'bn.hojin.warned' })),
    ] },
  { key: 'hua_cook', id: 'hua_cook', if: { age: [6, 30], notMet: 'hua_cook', loc: 'mounthua' }, art: 'feast',
    text: 'Granny Pyo, the Mount Hua cook, does not know you. You know where she hides the good honey, the name of her late husband, and which songs make her cry.',
    choices: [
      C('Ask after her husband, by name', O('She dropped the ladle. Then she fed you until you could not move, and never once asked how you knew.', { meet: '@hua_cook', rel: { '@hua_cook': { aff: 20 } }, health: 3 })),
      P('Steal the honey, for old times’ sake', 0.5, O('You got away with it. She found the empty jar and laughed, and began hiding it in the old place again, as if testing someone.', { meet: '@hua_cook', rel: { '@hua_cook': { aff: 8 } } }), O('She caught you by the ear. "Nobody finds that jar," she said. "Who are you?"', { meet: '@hua_cook', rel: { '@hua_cook': { res: 10, aff: 5 } } })),
    ] },
  { key: 'hua_un', id: 'hua_un', if: { age: [10, 40], notMet: 'hua_un', loc: 'mounthua', realm: '>=1' }, art: 'blossom',
    text: 'Elder Seo Un-pyeong is asleep under a plum tree with his wine gourd. In another life he taught you everything worth knowing. In this one he has never seen your face.',
    choices: [
      C('Refill his gourd while he sleeps', O('He woke, sniffed the gourd and squinted at you. "Who taught you which wine I drink?" You said nobody. He did not believe you.', { meet: '@hua_un', rel: { '@hua_un': { aff: 15, res: 5 } } })),
      R('Show him the form he taught you', 'insight', 30, O('You performed his own sword form, the one he never wrote down. He was on his feet, sober as stone. "Where did you learn that? Again."', { meet: '@hua_un', rel: { '@hua_un': { res: 25, aff: 10 } }, insight: 2 }), O('You performed it badly. He watched with one eye open. "Who taught you to hold your elbow like that? That is my mistake."', { meet: '@hua_un', rel: { '@hua_un': { res: 10 } } })),
    ] },
  { key: 'oldgu', id: 'oldgu', if: { age: [3, 9], origin: 'orphan', met: 'oldgu' }, art: 'night',
    text: 'Old Man Gu sings the same drinking song he always sings, off-key, under the bridge. He does not know that one winter night, when you are ten, men in black will come for him. You do.',
    choices: [
      M('Memorise the faces of the men who watch him from the bridge', 'timeline.old_gu', O('You saw them: two men in plain coats who never drink. You will know them again.', { insight: 2, flag: 'bn.gu.watched', rel: { '@oldgu': { aff: 5 } } })),
      C('Learn the song this time', O('You learned every verse. He was so pleased he sang it twice more, even worse.', { rel: { '@oldgu': { aff: 12 } }, sanity: 3 })),
    ] },
  { key: 'namgung_jin', id: 'namgung_jin', if: { age: [8, 30], notMet: 'namgung_jin', loc: 'namgung' }, art: 'estate',
    text: 'Namgung Jin sneers at you across the Namgung courtyard, insufferable and alone. You know he has never had a friend. In another life, you were the first.',
    choices: [
      C('Walk over and insult his footwork', O('He was so outraged he forgot to sneer. You will be friends by summer. He does not know it yet.', { meet: '@namgung_jin', rel: { '@namgung_jin': { res: 10, aff: 10 } } })),
      C('Leave him be this time', O('You left him be. Some kindnesses cost too much to repeat.', { sanity: -2 })),
    ] },
], (r) => E('bn_again', 'bonds', {
  if: { ...LATER, mem: `people.${r.id}`, alive: r.id, ...r.if }, art: r.art, text: r.text, choices: r.choices,
}));

// ── Letters, one per kind of bond ─────────────────────────────────
const LETTER = template('bn_letter', [
  { key: 'father', role: 'father', cd: 4, if: { age: [15, 70], home: false },
    text: '"The harvest was fair," writes your father, who writes the way he talks: rarely, and all at once. "Your mother is fine. I am fine. Come home if you are ever not fine." That is the whole letter.',
    choices: [
      C('Go home', O('You went home. {x} looked up from the woodpile, said, "You are not fine, then," and put the kettle on.', { rel: { x: { aff: 10 } }, sanity: 4 })),
      C('Write back three lines', O('You wrote back three lines. {x} will read them until the paper goes soft.', { rel: { x: { aff: 4 } } })),
    ] },
  { key: 'sibling', role: 'sibling', cd: 4, if: { age: [14, 70] },
    text: '"Mother keeps your room as it was," writes {x}. "I have moved my things into it. Also I am getting married. Also it is your fault, somehow. I will explain when you visit."',
    choices: [
      C('Visit and demand the explanation', O('The explanation was long, made no sense, and involved a goose. You were made to give a toast.', { rel: { x: { aff: 10 } }, sanity: 3 })),
      Q('Send a wedding gift (10 taels)', { stat: { wealth: '>=10' } }, O('You sent ten taels and a jar of good wine. {x} wrote back that the wine was gone before the wedding.', { wealth: -10, rel: { x: { aff: 8 } } })),
    ] },
  { key: 'spouse', role: 'spouse', cd: 3, if: { age: [18, 80], home: false },
    text: '"The house is too quiet," writes {x}. "The cat sleeps on your side. I am not jealous of the cat. Come home before I am."',
    choices: [
      C('Come home', O('You came home. The cat was asked to move. The cat refused.', { rel: { x: { aff: 10 } }, sanity: 5 })),
      C('Write back a page about the cat', O('You wrote a page about the cat. {x} wrote back two.', { rel: { x: { aff: 5 } }, charm: 1 })),
    ] },
  { key: 'master', role: 'master', cd: 5, if: { age: [14, 70] },
    text: 'A letter from your master {x}, one line long: "Your third form is still wrong." No greeting, no signature, and a pressed blossom inside.',
    choices: [
      C('Practise the third form until it is right', O('You practised it until your shoulders burned. Somewhere, you suspect, {x} felt it.', { body: 1, qi: 10, rel: { x: { res: 5 } } })),
      C('Write back: "It is not."', O('{x}’s reply came within the month: "It is." You are both enjoying this.', { rel: { x: { aff: 3, res: -2 } }, charm: 1 })),
    ] },
  { key: 'disciple', role: 'disciple', cd: 4, if: { age: [25, 120] },
    text: '"I won a duel with the move you said I was not ready for," writes your disciple {x}. "I was not ready. I won anyway. Please do not be angry."',
    choices: [
      C('Write back that you are proud', O('You wrote that you were proud. {x} wrote back that {x.he} had cried, and then crossed it out, badly.', { rel: { x: { aff: 10 } }, sanity: 3 })),
      C('Write back three corrections', O('You wrote three corrections. {x} practised all three and won the rematch.', { rel: { x: { res: 8 } }, insight: 1, npcRealm: { x: 1 } })),
    ] },
  { key: 'sworn', role: 'sworn', cd: 5, if: { age: [16, 80] },
    text: '"Dear {brother}," writes {x}, in what may be blood or may be cheap ink, "I am in Kaifeng and in debt to the wrong people. Do not come." Underneath, smaller: "Come."',
    choices: [
      Q('Send thirty taels by fast courier', { stat: { wealth: '>=30' } }, O('The money reached Kaifeng in four days. So did {x}’s next letter, which was mostly exclamation marks.', { wealth: -30, rel: { x: { aff: 15 } } })),
      C('Go to Kaifeng', O('You went. The wrong people were much less wrong once they had met you.', { travel: 'kaifeng', rel: { x: { aff: 20 } }, infamy: 1 })),
      C('Write back: "Do not be an idiot."', O('{x} was an idiot anyway, survived it, and did not write for a year.', { rel: { x: { aff: -5 } } })),
    ] },
  { key: 'lover', role: 'lover', cd: 3, if: { age: [16, 60] },
    text: '{x} has written you nine pages. Eight are about the weather. The ninth is not.',
    choices: [
      C('Reply with nine pages about the weather', O('You replied with nine pages about the weather. {x} understood every word.', { rel: { x: { aff: 10 } }, charm: 1 })),
      C('Reply with one page, about the ninth', O('You wrote one page. {x} kept it inside {x.his} collar for a year.', { rel: { x: { aff: 15 } }, sanity: 3 })),
    ] },
  { key: 'rival', role: 'rival', cd: 4, if: { age: [14, 80] },
    text: 'A letter from your rival {x}: a list of every technique {x.he} has mastered since you last met. At the bottom: "Your move."',
    choices: [
      C('Send back a longer list', O('Your list was longer. Some of it was even true. {x} sent back a single furious brushstroke.', { rel: { x: { res: 8 } }, fame: 1 })),
      C('Train instead of answering', O('You did not answer. You trained. Silence is also a reply, and {x} will know what it means.', { body: 1, qi: 15, rel: { x: { res: 3 } } })),
      C('Send back a recipe for dumplings', O('{x} wrote back three pages of outrage. The last line said the dumplings were good.', { rel: { x: { aff: 8, res: -3 } } })),
    ] },
  { key: 'nemesis', role: 'nemesis', cd: 6, if: { age: [16, 90] },
    text: 'An unsigned letter, but you know the hand: {x}. "I know where you sleep. I am not coming tonight. I wanted you to know that I could."',
    choices: [
      C('Burn it', O('You burned it. You slept with your sword for a month anyway.', { sanity: -4 })),
      R('Track the courier back', 'insight', 30, O('You traced it to an inn two towns away. The room was empty, the bed still warm, and on the pillow was another note: "Good."', { rel: { x: { res: -5 } }, insight: 2 }), O('The courier had been paid by a child, who had been paid by someone else.', { sanity: -3 })),
      C('Write back: "Come, then."', O('You sent it to every inn in the province. Word got around. People think you are very brave, or very stupid.', { fame: 1, rel: { x: { res: 10 } }, sanity: -2 })),
    ] },
  { key: 'senior', role: 'senior', cd: 5, if: { age: [14, 70], rank: '>=0', home: false },
    text: '"Everything is the same," writes your senior {x}, "except the new juniors, who are worse than we were, and the elders, who are worse than they were. The training yard misses you. That is a figure of speech."',
    choices: [
      C('Send gossip back', O('You sent back three pages of gossip from the road. {x} read it aloud to the juniors, who now think you are a legend.', { rel: { x: { aff: 8 } }, sanity: 2 })),
      R('Ask what is really happening', 'insight', 25, O('{x}’s next letter was careful and short and told you exactly which elder is in debt to whom.', { flag: 'bn.sect.gossip', insight: 2, merit: 3 }), O('{x} wrote back that nothing was happening, which you did not believe.', { rel: { x: { aff: 3 } } })),
    ] },
  { key: 'guardian', role: 'guardian', cd: 4, if: { origin: 'orphan', age: [11, 60], home: false },
    text: 'Old Man Gu cannot write, so the letter is in a Beggars’ Sect scribe’s hand: "He says you are to eat. He says he is sober. The scribe says he is not."',
    choices: [
      Q('Send a jar of rice wine', { item: 'rice_wine' }, O('You sent it. The scribe wrote back that Old Man Gu sang all night and then cried, happily.', { take: { rice_wine: 1 }, rel: { x: { aff: 12 } } })),
      C('Send money for food, and a note: "Eat."', O('The scribe wrote back: "He says you first."', { wealth: -5, rel: { x: { aff: 10 } }, sanity: 3 })),
      C('Go back to Luoyang', O('You went back. He was exactly where you left him, and pretended not to have been waiting.', { travel: 'luoyang', rel: { x: { aff: 15 } } })),
    ] },
], (r) => E('bn_letter', 'bonds', {
  if: { has: r.role, ...r.if }, once: false, cd: r.cd, fmt: 'letter', from: 'x', art: 'letter', bind: { x: r.role }, text: r.text, choices: r.choices,
}));

// ── Grief, one per kind of loss ───────────────────────────────────
const GRIEF = template('bn_grief', [
  { key: 'mother', if: { age: [12, 200], fn: lost('mother', 2) },
    text: 'Clearing out your mother’s things, you find every letter you ever sent her, tied with red thread, in order. Some have been read so often the folds have worn through.',
    choices: [
      C('Read them all', O('You read them all. You were a terrible correspondent. She kept every one.', { sanity: -3, insight: 1, codex: LETTERS })),
      C('Burn them with incense, so she can read them again', O('You burned them one by one. The smoke went straight up, which the old women say is a good sign.', { sanity: 4, codex: LETTERS })),
    ] },
  { key: 'father', if: { age: [12, 200], fn: lost('father', 2) },
    text: 'Your father’s tools still hang in the shed, each in its place. His hands wore grooves into the handles. They do not fit yours.',
    choices: [
      C('Use them anyway', O('You used them. In a year the grooves will fit you. That is the point of tools.', { body: 1, sanity: 3 })),
      C('Give them to a neighbour who needs them', O('You gave them away. You hear them sometimes, across the fence, in someone else’s hands.', { charm: 1, fame: 1, sanity: 2 })),
      C('Lock the shed', O('You locked the shed. The key is on a string around your neck.', { sanity: -4 })),
    ] },
  { key: 'sibling', if: { age: [10, 200], fn: lost('sibling', 2) },
    text: 'At your sibling’s funeral, a child you have never met asks whether you are the one from the stories. You did not know there were stories.',
    choices: [
      C('Ask to hear them', O('The stories were all about you, all exaggerated, and all kind.', { sanity: 5, insight: 1 })),
      C('Say no', O('You said no. The child looked disappointed, and went to find the real one.', { sanity: -3 })),
    ] },
  { key: 'spouse', if: { age: [18, 200], fn: lost('spouse', 2) },
    text: 'You still set out two cups in the morning. You have stopped correcting yourself.',
    choices: [
      C('Pour the second cup anyway', O('You poured it. It went cold. You drank it cold, the way they used to leave yours.', { sanity: 2 })),
      R('Go out among people again', 'charm', 25, O('You went to the market and let a fruit seller cheat you, and laughed about it, out loud, for the first time since.', { sanity: 8 }), O('You got as far as the gate.', { sanity: -2 })),
      C('Close the doors and train until you cannot think', O('You trained for a season without speaking to anyone. Your body has never been better. Nothing else has either.', { body: 2, qi: 20, sanity: -6 })),
    ] },
  { key: 'child', if: { age: [18, 200], fn: lost('child', 3) }, bind: { y: { role: 'acquaintance', age: [6, 10], realm: 0, aff: 40, romance: false } },
    text: 'There is a mark on the doorframe at the height of a child’s head. It will never be added to.',
    choices: [
      C('Carve the date beside it', O('You carved it. You will not plane that doorframe as long as you live.', { sanity: -6, insight: 1 })),
      C('Take in {y}, the orphan who sleeps in your doorway', O('You did not plan it. {y} has started measuring {y.him}self against the other side of the doorframe.', { rel: { y: { role: 'child', aff: 20 } }, sanity: 4 })),
      C('Plane the doorframe smooth', O('You could not bear it. You could not bear its absence either.', { sanity: -10 })),
    ] },
  { key: 'master', if: { age: [14, 200], fn: lost('master', 3) },
    text: 'On the anniversary of your master’s death you perform the forms your master taught you, in the order your master taught them, at the hour your master always woke you.',
    choices: [
      C('Perform them perfectly', O('Perfect, every one. The courtyard was very quiet afterwards.', { qi: 15, insight: 1, sanity: 2 })),
      C('Perform them the way you have changed them', O('Your master would have hated it. Your master would have been proud.', { insight: 3, sanity: 1 })),
    ] },
  { key: 'disciple', if: { age: [25, 200], fn: lost('disciple', 3) },
    text: 'Your disciple’s sword hangs on your wall. You taught them everything except how to outlive you.',
    choices: [
      R('Find out who was responsible', 'insight', 30, O('You found out. It was not a person. It was the Gangho, the ordinary cruelty of it. There is no one to kill.', { insight: 2, sanity: -2 }), O('You never found out. That is its own kind of answer.', { sanity: -5 })),
      C('Promise yourself another disciple, someday', O('Someday. You took the sword down and oiled it, so it would be ready to give.', { sanity: 3, insight: 1 })),
    ] },
  { key: 'sworn', if: { age: [16, 200], fn: lost('sworn', 3) },
    text: 'You swore to die on the same day. You did not. The oath sits in your chest like a stone you swallowed.',
    choices: [
      C('Pour wine for two on the oath ground', O('You poured two cups and drank both. It is what you would have done anyway.', { wealth: -1, sanity: 3 })),
      C('Take up their unfinished feud', O('You took it up. You finished it. It did not help, but it was owed.', { fame: 2, infamy: 2, body: 1, sanity: -2 })),
    ] },
  { key: 'friend', if: { age: [14, 200], fn: lost('friend', 2) },
    text: 'The drinking house you used to visit together still keeps your friend’s cup on the shelf. The owner asks if you want it.',
    choices: [
      C('Take the cup', O('You took it home. It sits on your shelf now, still slightly chipped where they always drank from it.', { sanity: 2 })),
      C('Leave it where it is', O('You left it on the shelf. Sometimes you come in and drink across from it.', { sanity: 4 })),
    ] },
  { key: 'lover', if: { age: [16, 200], fn: lost('lover', 3) },
    text: 'You never married. Now you never will, not to them. People are kind about it in a way that makes you want to hit something.',
    choices: [
      C('Hit something', O('You hit a training post until it split. It helped, the way a lie helps.', { body: 1, health: -2, sanity: 2 })),
      C('Let them be kind', O('You let them be kind. It was harder than the training post.', { sanity: 5, charm: 1 })),
    ] },
  { key: 'guardian', if: { age: [10, 40], origin: 'orphan', dead: 'oldgu', met: 'oldgu' },
    text: 'Under the Tianjin Bridge, Old Man Gu’s spot is empty. The other beggars have left it empty.',
    choices: [
      C('Sit in it a while', O('It smelled of cheap wine and old rain. When you stood up, someone had left a bowl of rice beside you.', { sanity: -3, insight: 1 })),
      M('Remember the faces of the men in Eastern Depot black', 'timeline.old_gu', O('You remember them now: their faces, their gait, the way one of them limped. One day you will know where they live.', { insight: 2, flag: 'bn.gu.faces', sanity: -2 })),
    ] },
], (r) => E('bn_grief', 'bonds', { if: r.if, bind: r.bind, art: 'grave', title: 'Grief', text: r.text, choices: r.choices }));

// ── Sworn siblings with named people ──────────────────────────────
const SWEAR_OK = ['friend', 'acquaintance', 'senior', 'junior', 'rival'];
const OATH = template('bn_oath', [
  { key: 'ilgak', id: 'ilgak', if: {},
    text: 'Il-gak has decided, with the solemnity of a monk who has broken every rule but this one, that you will swear brotherhood before the Buddha. He has brought a roast chicken as an offering. He intends to eat the offering.',
    choices: [
      C('Swear, and share the offering', O('You swore, and shared the chicken. The Buddha, you felt, understood.', { rel: { '@ilgak': { role: 'sworn', aff: 15 } }, achieve: 'sworn', health: 2 })),
      C('Swear, and make him leave the chicken for the Buddha', O('He wept over the chicken. The oath held. The chicken was gone by morning; neither of you asked.', { rel: { '@ilgak': { role: 'sworn', res: 10 } }, achieve: 'sworn', rep: { orthodox: 2 }, sanity: 2 })),
      C('Tell him a monk’s only sibling is the Buddha', O('"The Buddha does not share chickens," he said sadly, and ate it alone.', { rel: { '@ilgak': { aff: -5 } }, insight: 1 })),
    ] },
  { key: 'dongsu', id: 'dongsu', if: {},
    text: 'Dong-su has found a ruined shrine under the Tianjin Bridge and wants to swear the oath there, like heroes in a storyteller’s tale, over a bowl of the cheapest wine in Luoyang.',
    choices: [
      C('Swear on the bowl', O('You swore on the bowl. Dong-su made you say every word of the storyteller’s version, including the parts about dragons.', { rel: { '@dongsu': { role: 'sworn', aff: 12 } }, achieve: 'sworn', rep: { orthodox: 1 } })),
      R('Swear, and drink the whole bowl', 'body', 20, O('You drank it all. Dong-su was so impressed he made up a new verse about you.', { rel: { '@dongsu': { role: 'sworn', aff: 15 } }, achieve: 'sworn', health: -2 }), O('You were sick in the river. Dong-su said it made it more binding.', { rel: { '@dongsu': { role: 'sworn', aff: 10 } }, achieve: 'sworn', health: -5 })),
      C('Decline', O('He laughed it off. Then he stole your shoes, which is how you knew he was hurt.', { rel: { '@dongsu': { aff: -8 } } })),
    ] },
  { key: 'paeng_gu', id: 'paeng_gu', if: { realm: '>=1' },
    text: 'Paeng Gu wakes you at dawn, still drunk from last night, and announces that he is adopting you as his sibling whether you like it or not.',
    choices: [
      C('Like it', O('You liked it. He roared so loudly the whole fortress woke up to witness.', { rel: { '@paeng_gu': { role: 'sworn', aff: 10 } }, achieve: 'sworn', rep: { families: 3 } })),
      R('Insist on doing it properly, sober, at noon', 'charm', 25, O('He managed to stay sober until noon, a family record. His father, Paeng Dae-ho, laughed like a landslide and poured the wine himself.', { rel: { '@paeng_gu': { role: 'sworn', aff: 10, res: 10 }, '@paeng_daeho': { aff: 5 } }, achieve: 'sworn' }), O('He could not stay sober until noon. You swore at dawn after all, more or less.', { rel: { '@paeng_gu': { role: 'sworn', aff: 8 } }, achieve: 'sworn' })),
      C('Arm-wrestle him for the right to refuse', O('He cleared the table with one sweep of his arm.', { combat: { foe: '@paeng_gu', context: 'spar', win: { text: 'You won. He swore brotherhood to you anyway, on the grounds that anyone who could beat him had to be family.', rel: { '@paeng_gu': { role: 'sworn', res: 15 } }, achieve: 'sworn' }, lose: { text: 'He won, roared, and did not let you refuse.', rel: { '@paeng_gu': { role: 'sworn', aff: 10 } }, achieve: 'sworn' } } })),
    ] },
  { key: 'mokcheol', id: 'mokcheol', if: {},
    text: 'Mok Cheol, who says perhaps ten words a season, says seven of them to you at once: "We should swear the oath. If you want."',
    choices: [
      C('Say yes, at length', O('You said yes, and a great deal more. He listened to all of it, and at the end, very slightly, smiled.', { rel: { '@mokcheol': { role: 'sworn', aff: 20 } }, achieve: 'sworn' })),
      C('Say "Yes," and nothing more', O('"Yes." He nodded. That was all. It was enough.', { rel: { '@mokcheol': { role: 'sworn', res: 10 } }, achieve: 'sworn', rep: { cult: 2 }, sanity: 3 })),
      C('Ask him why', O('He shrugged and walked off. You realised too late that the shrug was the answer.', { rel: { '@mokcheol': { aff: -2 } }, insight: 1 })),
    ] },
  { key: 'hua_senior', id: 'hua_senior', if: { sect: 'mounthua' },
    text: 'Bang Ho-jin, who has spent years pretending to dislike you, asks you to meet him at the plum shrine at midnight. He has two cups and his father’s sword.',
    choices: [
      C('Swear on his father’s sword', O('You swore on the sword. He held it the whole time, very carefully, as if it might be heavier than it looked.', { rel: { '@hua_senior': { role: 'sworn', aff: 15 } }, achieve: 'sworn', merit: 5 })),
      M('Swear, and make him promise to stay off the main hall steps on the Blood Night', 'timeline.blood_night', O('He promised, puzzled. "What steps?" he said. "Any steps," you said. He has never broken a promise to you.', { rel: { '@hua_senior': { role: 'sworn', res: 10 } }, achieve: 'sworn', flag: 'bn.hojin.warned' })),
      C('Ask what changed', O('"Nothing," he said. "I stopped pretending." He poured the cups anyway, and waited for you to be ready.', { rel: { '@hua_senior': { aff: 5, res: 5 } } })),
    ] },
  { key: 'jiho', id: 'jiho', if: { not: 'bn.rom.jiho' },
    text: 'Han Ji-ho, with a mill to run and no time for heroes, proposes the oath anyway, by the creek where he once pushed you in.',
    choices: [
      C('Push him in first', O('You pushed him in. He pulled you in. You swore the oath soaking wet, laughing, in the creek.', { rel: { '@jiho': { role: 'sworn', aff: 10 } }, achieve: 'sworn', sanity: 4 })),
      C('Swear with your feet in the water', O('You sat on the bank with your feet in the creek and swore it quietly, like a prayer. He held your hand like a farmer, hard.', { rel: { '@jiho': { role: 'sworn', aff: 15 } }, achieve: 'sworn', insight: 1 })),
    ] },
  { key: 'taeo', id: 'taeo', if: { not: 'bn.rom.taeo' },
    text: 'After the third caravan you have survived together, Kang Tae-o cuts his palm with an escort’s knife and holds it out to you.',
    choices: [
      C('Cut yours', O('You cut yours and clasped his. Chief Pyo Gwang, watching, pretended something was in his eye.', { rel: { '@taeo': { role: 'sworn', aff: 12 }, '@escort_chief': { aff: 5 } }, achieve: 'sworn', health: -2 })),
      R('Ask whether he cleaned the knife', 'insight', 15, O('He had. He had cleaned it three times, being nervous. You swore, and laughed, and he blushed.', { rel: { '@taeo': { role: 'sworn', aff: 10 } }, achieve: 'sworn', charm: 1 }), O('He had not. The oath held. So did the fever, for a week.', { rel: { '@taeo': { role: 'sworn', aff: 10 } }, achieve: 'sworn', health: -6 })),
    ] },
  { key: 'yeonwoo', id: 'yeonwoo', if: { not: 'bn.rom.yeonwoo' },
    text: 'Song Yeon-woo asks you to swear brotherhood, apologises for asking, and then apologises for apologising.',
    choices: [
      C('Swear, and forbid him to apologise to you ever again', O('He swore that too. He has kept it, mostly. He apologises to the furniture instead.', { rel: { '@yeonwoo': { role: 'sworn', aff: 10, res: 5 } }, achieve: 'sworn' })),
      C('Swear before the Wudang ancestors', O('You swore before the ancestral tablets on the Golden Summit. A Wudang elder recorded it, which makes it the most official oath of your life.', { rel: { '@yeonwoo': { role: 'sworn', aff: 8 } }, achieve: 'sworn', rep: { orthodox: 4 } })),
    ] },
  { key: 'namgung_jin', id: 'namgung_jin', if: { age: [16, 37] },
    text: 'Namgung Jin, who has never had a friend, has read about the Peach Garden Oath in a book and wishes to know the correct procedure.',
    choices: [
      C('Show him', O('You showed him, step by step. He took notes. At the end he swore so seriously that you nearly laughed, and did not.', { rel: { '@namgung_jin': { role: 'sworn', res: 10 } }, achieve: 'sworn', rep: { families: 3 } })),
      C('Tell him there is no procedure, only meaning it', O('"That is very inefficient," he said. Then he meant it.', { rel: { '@namgung_jin': { role: 'sworn', aff: 10 } }, achieve: 'sworn', insight: 1, sanity: 3 })),
      C('Tell him he is not ready', O('He went pale with offence. He was not ready. He knew it, and hated that you knew it.', { rel: { '@namgung_jin': { aff: -10, res: 5 } } })),
    ] },
  { key: 'hyeryeong', id: 'hyeryeong', if: { not: 'bn.rom.hyeryeong' },
    text: 'Gang Hye-ryeong proposes the oath the way she proposes duels: loudly, in public, with a cooked meal to follow.',
    choices: [
      R('Accept with equal ceremony', 'charm', 20, O('Your speech was nearly as loud as hers. The whole street applauded. The meal was enormous.', { rel: { '@hyeryeong': { role: 'sworn', aff: 15 } }, achieve: 'sworn', fame: 1 }), O('Your speech was shorter and worse than hers. She accepted you anyway, condescendingly.', { rel: { '@hyeryeong': { role: 'sworn', aff: 8 } }, achieve: 'sworn' })),
      Q('Insist on a duel first', { realm: '>=2' }, O('Her eyes lit up. She was already drawing.', { combat: { foe: '@hyeryeong', context: 'spar', win: { text: 'You won. She swore the oath flat on her back in the dust, grinning.', rel: { '@hyeryeong': { role: 'sworn', res: 15 } }, achieve: 'sworn' }, lose: { text: 'She won, and swore the oath standing over you, and then helped you up and fed you.', rel: { '@hyeryeong': { role: 'sworn', aff: 15 } }, achieve: 'sworn' } } })),
    ] },
], (r) => E('bn_oath', 'bonds', {
  if: { age: [14, 60], met: r.id, alive: r.id, npc: { [`@${r.id}`]: { aff: '>=50', role: SWEAR_OK } }, ...r.if },
  art: 'blossom', title: 'The oath', text: r.text, choices: r.choices,
}));

// ── Taking a disciple of your own ─────────────────────────────────
const KID = (age, extra = {}) => ({ role: 'acquaintance', age, realm: 0, aff: 30, res: 10, romance: false, ...extra });
const TAKE = (aff = 15) => ({ rel: { x: { role: 'disciple', aff } }, achieve: 'first_disciple' });
const PUPIL = template('bn_pupil', [
  { key: 'pickpocket', if: { loc: 'luoyang', realm: '>=2' }, x: KID([9, 12]), art: 'city',
    text: 'A pickpocket of about ten tries for your purse in Luoyang and fails so gracefully that you catch yourself admiring the technique. {x} does not run. {x.He} waits to see what you will do.',
    choices: [
      C('Take {x.him} as your disciple', O('You fed {x.him} first, then started teaching. {x.He} still checks your pockets out of habit. You check {x.his}.', { ...TAKE(15), wealth: -3 })),
      C('Hand {x.him} to the Beggars’ Sect', O('The Beggars took {x.him} in. {x.He} will eat, and learn, and owe them. It is something.', { rep: { orthodox: 3 }, rel: { x: { aff: 5 } } })),
      C('Give {x.him} a coin and walk on', O('You gave {x.him} a coin. {x.He} bit it to check.', { wealth: -1, sanity: 1 })),
    ] },
  { key: 'farmchild', if: { locType: 'village', realm: '>=2' }, x: KID([8, 11], { aff: 40 }), art: 'forest',
    text: 'A farm child named {x} has been copying your morning forms from behind a haystack for a month, and has got two of them right.',
    choices: [
      C('Teach {x.him} properly', O('You called {x.him} out from behind the haystack. {x.He} came at a run, as if {x.he} had been waiting all month to be caught.', { ...TAKE(20), sanity: 3 })),
      C('Send {x.him} to sit a sect entrance exam', O('{x} passed. You heard {x.he} told the examiners who had taught {x.him} the two forms.', { rel: { x: { aff: 10 } }, rep: { orthodox: 2 }, fame: 1 })),
    ] },
  { key: 'junior', if: { faction: 'orthodox', rank: '>=2', realm: '>=3' }, x: KID([12, 16], { role: 'junior', realm: [0, 1], aff: 20 }), art: 'mountain',
    text: 'The {sect} has assigned you a junior to train: {x}, whom every other elder has refused. {x.He} stands at your door very straight, braced to be refused again.',
    choices: [
      R('Find what the others missed', 'insight', 30, O('You found it: a left-handed swordsman taught right-handed for six years. You turned {x.his} stance around. {x.He} cried, once, and never again.', { ...TAKE(20), npcRealm: { x: 1 }, merit: 5 }), O('You found nothing special. You took {x.him} anyway. That turned out to be the special thing.', { ...TAKE(10), merit: 2 })),
      C('Refuse, like the others', O('{x} bowed and left. {x.He} did not cry until {x.he} was round the corner.', { merit: -3, rel: { x: { aff: -20 } }, sanity: -2 })),
    ] },
  { key: 'cultchild', if: { faction: 'cult', realm: '>=3' }, x: KID([8, 11], { realm: [0, 1], aff: 35, res: 20 }), art: 'demonic',
    text: 'A Cult child of nine, the last survivor of {x.his} training cohort, has been following you everywhere at three paces, like a shadow afraid of being stepped on.',
    choices: [
      C('Make {x.him} your disciple', O('In the Cult, a disciple is a weapon you sharpen. You sharpened {x.him}, and also fed {x.him}, which nobody else had thought to do.', { ...TAKE(15), rep: { cult: 3 }, sanity: -1 })),
      C('Smuggle {x.him} to a family in the lowlands', O('You got {x.him} over the passes in a salt cart. {x.He} will grow up hearing rice frogs instead of drums.', { rep: { cult: -5 }, sanity: 5, rel: { x: { aff: 15 } } })),
    ] },
  { key: 'dangreject', if: { loc: 'dangclan', realm: '>=2' }, x: KID([10, 13], { sect: 'dang' }), art: 'garden',
    text: 'The Dang have cast out a child, {x}, who has no talent for poison. In that family it is a death sentence by other means.',
    choices: [
      C('Take {x.him} with you', O('You walked out of the Dang gate with {x} on your back. Nobody stopped you. That was the frightening part.', { ...TAKE(20), rep: { families: -3 } })),
      Q('Pay a Chengdu physician to apprentice {x.him} (20 taels)', { stat: { wealth: '>=20' } }, O('The physician says {x.he} has gentle hands. A Dang who cures people. Somebody in that family should.', { wealth: -20, sanity: 3, rel: { x: { aff: 15 } } })),
    ] },
  { key: 'merchantson', if: { loc: 'hangzhou', realm: '>=2' }, x: KID([12, 15], { aff: 15, res: 5 }), art: 'market',
    text: 'A silk merchant offers you eighty taels to make his son, {x}, into a martial artist. {x} is eating candied lotus seeds and watching you with deep, practised boredom.',
    choices: [
      C('Take the money and the student', O('{x} complained for a year, then stopped complaining, then started getting up before you did.', { ...TAKE(5), wealth: 80 })),
      R('Break the boredom first', 'charm', 30, O('You flicked a lotus seed at {x.him} and caught the one {x.he} threw back. {x.He} has not been bored since.', { ...TAKE(20), wealth: 80 }), O('You failed to impress {x.him}. The merchant paid half, for effort.', { ...TAKE(0), wealth: 40 })),
      C('Refuse', O('The merchant found another master, cheaper and worse. You see {x} sometimes in the market, still bored.', { sanity: 1 })),
    ] },
  { key: 'runawaymonk', if: { region: 'central', realm: '>=2' }, x: KID([10, 13], { realm: [0, 1], sect: 'shaolin' }), art: 'temple',
    text: 'A child in a monk’s robe three sizes too big has run away from Shaolin because, {x.he} says, they will not teach {x.him} to fight, only to sweep.',
    choices: [
      C('Tell {x.him} sweeping is the secret, and walk {x.him} back', O('The monk at the gate did not seem surprised. "Sweeping," he told you gravely, "is the secret." You both kept straight faces.', { insight: 1, rep: { orthodox: 3 }, rel: { x: { aff: 5 } } })),
      C('Take {x.him}, and answer to the Abbot later', O('You took {x.him}. Shaolin sent a polite letter, then a less polite one, then a monk who sat outside your door for a week.', { ...TAKE(15), rep: { orthodox: -4 } })),
    ] },
  { key: 'banditorphan', if: { loc: 'taihang', realm: '>=2' }, x: KID([7, 10], { aff: 10, res: 30 }), art: 'fire',
    text: 'In a burned Green Forest stronghold, a child sits beside the body of a bandit chief, holding his saber in both hands. {x} has decided that you did this. You did not. It does not matter.',
    choices: [
      C('Take {x.him} with you', O('{x} came, carrying the saber, and sleeps with it still. One day {x.he} will ask who really did it, and you will have to know.', { ...TAKE(5), sanity: -3, flag: 'bn.pupil.bandit' })),
      C('Leave {x.him} with a village headman', O('You paid for a year of rice. The headman promised. You looked back twice.', { wealth: -5, sanity: 2 })),
      R('Tell {x.him} the truth, and who did', 'charm', 30, O('{x} listened, and put the saber down, and picked it up again, and came with you.', { ...TAKE(10), rel: { x: { res: 15 } } }), O('{x} did not believe you, and ran into the hills with the saber.', { rel: { x: { aff: -10, role: 'nemesis' } }, sanity: -4 })),
    ] },
  { key: 'soldierdaughter', if: { loc: 'jadegate', realm: '>=3' }, x: KID([12, 15], { g: 'f', realm: [0, 1], res: 20 }), art: 'desert',
    text: 'At the Jade Gate a one-armed old soldier asks you to teach his daughter, {x}, who already fights better than half his old regiment and hits harder than the other half.',
    choices: [
      R('Test her first', 'power', 35, O('She lasted longer than you expected and complained that you had gone easy. You had not.', { ...TAKE(10), rel: { x: { res: 15 } } }), O('{x} knocked you flat. Her father laughed until he coughed. You took her on, bruised.', { ...TAKE(15), health: -6 })),
      C('Take her at once', O('Her father wept, and gave you his old regimental spear, and told you not to let her near it.', { ...TAKE(10), rep: { court: 3 } })),
    ] },
  { key: 'vengeance', if: { locType: 'city', realm: '>=3', age: [30, 120] }, x: KID([13, 16], { aff: 25 }), art: 'storm',
    text: '{x} kneels outside your door in the rain. {x.His} family was murdered by a man with a Green Forest tattoo. {x.He} wants to learn how to kill him, and will kneel there until you agree.',
    choices: [
      C('Teach {x.him}, and teach {x.him} what revenge costs', O('You took {x.him} in. The first lesson was how to sit still. The second was why.', { ...TAKE(15), insight: 1 })),
      C('Teach {x.him} only to kill', O('You taught {x.him} exactly what {x.he} asked for, and nothing more. {x.He} learned fast. That was the worst of it.', { ...TAKE(5), rel: { x: { res: 10 } }, infamy: 3, next: { id: 'bn_vengeance_done', in: 24 } })),
      C('Close the door', O('In the morning {x} was gone. You looked for {x.him} in every crowd for a year.', { sanity: -3 })),
    ] },
], (r) => E('bn_pupil', 'bonds', {
  if: { age: [25, 120], ...r.if }, bind: { x: r.x }, art: r.art, title: 'A disciple', text: r.text, choices: r.choices,
}));

// ── Children growing up ───────────────────────────────────────────
const GROWING = template('bn_growing', [
  { key: 'sword', age: [3, 5], art: 'garden',
    text: '{x} has found your sword and is dragging it across the courtyard, singing a song about killing demons that {x.he} has made up.',
    choices: [
      C('Carve {x.him} a wooden one', O('You carved a wooden sword that evening. {x} slept with it. The courtyard demons were defeated by morning.', { rel: { x: { aff: 10 } }, sanity: 3 })),
      P('Let {x.him} hold the real one properly, once', 0.7, O('You closed {x.his} small hands around the hilt and helped {x.him} lift it. {x.His} face was worth the risk.', { rel: { x: { res: 10, aff: 5 } } }), O('{x} dropped it on your foot. You both learned something.', { health: -3, rel: { x: { aff: 3 } } })),
    ] },
  { key: 'vase', age: [5, 8],
    text: '{x} broke a vase and blamed the cat, then the wind, then a ghost. You do not have a cat.',
    choices: [
      C('Laugh', O('You laughed. {x} laughed too, relieved, and blamed the ghost for the next vase as well.', { rel: { x: { aff: 8, res: -5 } }, sanity: 3 })),
      C('Make {x.him} apologise to the ghost', O('{x} apologised to the ghost at length, with real feeling. Then {x.he} apologised to you.', { rel: { x: { res: 10, aff: -2 } }, insight: 1 })),
    ] },
  { key: 'exam', age: [7, 11], if: { rank: '>=0' }, art: 'mountain',
    text: '{x} wants to sit the entrance examination of {sect}, but insists on doing it without your name.',
    choices: [
      C('Let {x.him} sit it as a stranger', O('{x} passed on {x.his} own and told no one whose child {x.he} was. You found out last of all.', { npcRealm: { x: 1 }, rel: { x: { res: 10, aff: 5 } } })),
      C('Put in a quiet word with the elders', O('{x} passed. Then {x.he} found out about the word, and was furious, and stayed anyway.', { merit: -5, npcRealm: { x: 1 }, rel: { x: { aff: -3 } } })),
      C('Tell {x.him} to wait a year', O('{x} waited a year, and practised every day of it, at you.', { rel: { x: { aff: -5, res: 3 } } })),
    ] },
  { key: 'blackeye', age: [10, 14],
    text: '{x} came home with a black eye and will not say who gave it. The other child, you learn, came home with two.',
    choices: [
      C('Teach {x.him} to win without fighting', O('{x} thought it was the most boring lesson of {x.his} life. {x.He} used it a week later, and came home without a mark.', { insight: 1, rel: { x: { res: 8 } } })),
      Q('Teach {x.him} to block', { realm: '>=1' }, O('You taught {x.him} to block. {x.He} has not come home with a black eye since. The other child has stopped trying.', { npcRealm: { x: 1 }, rel: { x: { aff: 6 } } })),
      R('Go and see the other child’s parents', 'charm', 20, O('The other parents were mortified. The children are friends now, which is what children do.', { rel: { x: { aff: 5 } }, fame: 1 }), O('The other parents were proud of their child. It became a feud. It is still a feud.', { infamy: 1, rel: { x: { aff: -3 } } })),
    ] },
  { key: 'poem', age: [13, 17],
    text: '{x} has written a poem. It is terrible. It is about a baker’s apprentice. You found it in the wash.',
    choices: [
      C('Put it back and say nothing', O('You put it back. {x} never knew. The baker’s apprentice did, eventually.', { rel: { x: { aff: 5 } } })),
      R('Offer some gentle advice', 'charm', 20, O('The second poem was only bad. The baker’s apprentice liked it.', { rel: { x: { aff: 10 } } }), O('{x} did not speak to you for a week.', { rel: { x: { aff: -8 } } })),
      C('Read it aloud at dinner', O('Cruel. Hilarious. Remembered for the rest of your life, by both of you.', { rel: { x: { aff: -15 } }, sanity: 3 })),
    ] },
  { key: 'path', age: [14, 20],
    text: '{x} does not want the martial path. {x.He} wants to study medicine, and has been saving for the books in a jar under {x.his} bed.',
    choices: [
      Q('Pay for {x.his} studies (25 taels)', { stat: { wealth: '>=25' } }, O('You emptied the jar back into {x.his} hands and added your own. {x.He} left for Chengdu with a crate of books.', { wealth: -25, rel: { x: { aff: 15 } }, sanity: 3 })),
      C('Insist on the sword', O('{x} took up the sword. {x.He} is good at it. {x.He} reads medicine at night, by a lamp you pretend not to see.', { rel: { x: { aff: -12 } }, npcRealm: { x: 1 } })),
      R('Let {x.him} do both', 'insight', 30, O('Both, it turned out, were possible. {x} sets bones as well as {x.he} breaks them.', { rel: { x: { aff: 10, res: 5 } }, npcRealm: { x: 1 } }), O('Neither went well for a while. {x.He} is still deciding.', { rel: { x: { aff: 3 } } })),
    ] },
  { key: 'duel', age: [16, 24], art: 'duel',
    text: '{x} has been challenged to a duel by the young master of a great family, over a matter of face. {x.He} has accepted, of course.',
    choices: [
      P('Stand behind {x.him}', 0.7, O('You stood behind {x.him} and said nothing. {x} won, narrowly, and looked for you before anyone else.', { fame: 2, rel: { x: { aff: 10, res: 5 } } }), O('{x} lost, and lived, and has a scar now that {x.he} will tell lies about for the rest of {x.his} life.', { rel: { x: { aff: 6 } }, sanity: -3 })),
      C('Settle it yourself', O('You went to the duelling ground in {x}’s place.', { combat: { foe: { name: 'the young master', kind: 'disciple', rel: -1 }, context: 'duel', lethal: 0.05, win: { text: 'You won. {x} was furious that you had fought {x.his} battle, and grateful, in that order.', fame: 2, rel: { x: { aff: 3, res: -5 } }, rep: { families: -3 } }, lose: { text: 'You lost to someone half your age. {x} has never let you forget it, fondly.', fame: -2, rel: { x: { aff: 8 } } } } })),
      C('Forbid the duel', O('You forbade it. {x} obeyed. Everyone at the next festival knew why.', { fame: -1, rel: { x: { aff: -10, res: 3 } } })),
    ] },
  { key: 'betrothed', age: [18, 30], art: 'wedding',
    text: '{x} brings someone home to meet you, and is more nervous than you have ever seen {x.him} before a fight.',
    choices: [
      R('Be gracious', 'charm', 20, O('You were gracious. {x} looked at you across the table as if seeing you for the first time, and liked what {x.he} saw.', { rel: { x: { aff: 12 } }, sanity: 4 }), O('You were gracious, stiffly. {x} apologised for you afterwards.', { rel: { x: { aff: -5 } } })),
      C('Interrogate the poor soul', O('You asked about prospects, sword hand and ancestors. You approved, in the end. {x} will never forgive the question about ancestors.', { rel: { x: { aff: -3 } }, sanity: 2 })),
    ] },
  { key: 'heir', age: [22, 50], if: { age: [45, 200] }, art: 'estate',
    text: '{x} kneels and asks you, formally, to name {x.him} heir to everything you have built.',
    choices: [
      C('Do it', O('You did it in front of witnesses. {x} did not stand up for a long time.', { rel: { x: { aff: 15, res: 10 } }, fame: 1, sanity: 4 })),
      C('Make {x.him} earn it', O('{x} rose without a word and went to earn it. {x.He} will.', { rel: { x: { res: 15, aff: -5 } } })),
      C('Tell {x.him} there is nothing worth inheriting but the name', O('{x} said that was the part {x.he} wanted. You had not expected that.', { insight: 2, rel: { x: { aff: 5 } }, sanity: -1 })),
    ] },
], (r) => E('bn_growing', 'bonds', {
  if: { has: 'child', npc: { x: { age: r.age } }, ...r.if }, w: 2, bind: { x: 'child' }, art: r.art, text: r.text, choices: r.choices,
}));

// ── Parents growing old, by birth ─────────────────────────────────
const ELDERS = template('bn_elders', [
  { key: 'peasant_father', origin: 'peasant', role: 'father', age: [22, 60], art: 'forest',
    text: '{x} can no longer bend to plant rice. He stands at the edge of the paddy every morning anyway, telling the hired hands they are doing it wrong.',
    choices: [
      C('Plant the paddy yourself this year', O('You planted it. He told you that you were doing it wrong, and was happier than you have seen him in years.', { body: 2, rel: { x: { aff: 10 } }, sanity: 3 })),
      Q('Hire hands for good (20 taels)', { stat: { wealth: '>=20' } }, O('You hired two hands. He told them they were doing it wrong for the rest of his life, contentedly.', { wealth: -20, rel: { x: { aff: 6 } } })),
      C('Tell him to rest', O('He did not rest.', { rel: { x: { aff: -3 } } })),
    ] },
  { key: 'peasant_mother', origin: 'peasant', role: 'mother', age: [28, 65], art: 'night',
    text: '{x} has started calling you by your sibling’s name, then laughing at herself. It is happening more often.',
    choices: [
      C('Answer to any name she gives you', O('You answered to every name. On her good days she used yours, and you treasured those days like coins.', { sanity: -3, rel: { x: { aff: 10 } } })),
      R('Find a physician who knows the forgetting sickness', 'insight', 30, O('The physician said there was nothing to be done, but told you how to make it gentle. You did all of it.', { sanity: 2, rel: { x: { aff: 8 } } }), O('The physician took your money and gave you a tea that smelled of dust.', { wealth: -5, sanity: -2 })),
      C('Stay the winter with her', O('You stayed the winter. She told you stories about yourself you had forgotten, and some that had never happened, and you kept them all.', { rel: { x: { aff: 12 } }, sanity: 2, insight: 1 })),
    ] },
  { key: 'merchant_father', origin: 'merchant', role: 'father', age: [22, 60], art: 'market',
    text: '{x} hands you the keys to the shop’s strongbox. "My eyes cannot read the ledgers any more," he says. "Yours had better."',
    choices: [
      R('Take over the books', 'insight', 25, O('You took over the books and found three errors in his favour and one in yours. He was very proud.', { wealth: 30, rel: { x: { aff: 10 } } }), O('You lost a season’s profit. He pretended not to notice.', { wealth: -20, rel: { x: { aff: 3 } } })),
      C('Give the keys to your sibling', O('Your sibling had been waiting for this all their life. Your father understood, eventually.', { rel: { x: { aff: -3 }, sibling: { aff: 10 } }, sanity: 2 }), { show: { has: 'sibling' } }),
      C('Sell the shop and buy him a quiet old age', O('You sold it. He spent the money on caged birds and tea and complained about the quiet.', { wealth: 60, rel: { x: { aff: -8 } }, sanity: 2 })),
    ] },
  { key: 'merchant_mother', origin: 'merchant', role: 'mother', age: [25, 65], art: 'temple',
    text: '{x} has decided to spend her last good years on pilgrimage to every temple in Jiangnan, and has decided you will carry the luggage.',
    choices: [
      C('Carry the luggage', O('You carried it up four hundred temple steps. She prayed at every one of them, mostly for you to marry.', { body: 1, sanity: 6, rel: { x: { aff: 12 } }, wealth: -8 })),
      Q('Hire a palanquin instead (15 taels)', { stat: { wealth: '>=15' } }, O('"Lazy," she said from the palanquin, delighted.', { wealth: -15, rel: { x: { aff: 6 } } })),
    ] },
  { key: 'branch_father', origin: 'branch', role: 'father', age: [20, 60], art: 'estate',
    text: '{x}, who has bowed to the main family all his life, has been summoned to bow once more: the patriarch wants his small parcel of land back for a nephew.',
    choices: [
      R('Argue for him before the patriarch', 'fame', 25, O('The land stayed his. He did not thank you. He bowed to you, which he has never done.', { rep: { families: -3 }, rel: { x: { aff: 15 } } }), O('You argued and lost, and the main family will remember your name for it.', { rep: { families: -8 }, rel: { x: { aff: 5 } } })),
      C('Tell him to give it up', O('He gave it up. He sat in the cold courtyard afterwards, very straight, for a long time.', { rel: { x: { aff: -10 } }, rep: { families: 3 } })),
      Q('Buy the land outright (80 taels)', { stat: { wealth: '>=80' } }, O('You bought it with your own silver and put the deed in his hands. The patriarch was amused. Your father was not, and then was.', { wealth: -80, rel: { x: { aff: 15 } }, rep: { families: 2 } })),
    ] },
  { key: 'branch_mother', origin: 'branch', role: 'mother', age: [30, 70], art: 'grave',
    text: '{x} has never once said she was proud of you. Now, very ill, she has sent for you, and you suspect she means to say it.',
    choices: [
      C('Go', O('She did not say it. She held your hand until morning and corrected your posture. That was how she said it. She did not wake.', { kill: 'x', sanity: -6 })),
      C('Go, and say it first', O('You told her you were proud of her. She laughed, the old cold laugh, and then she cried, and then she slept, and did not wake.', { kill: 'x', sanity: -2, charm: 1 })),
      P('Bring the best physician in Jiangnan', 0.5, O('She recovered. She never said it. You have stopped needing her to.', { wealth: -30, rel: { x: { aff: 10 } } }), O('The physician came too late to do anything but bow.', { wealth: -30, kill: 'x', sanity: -8 }), { req: { stat: { wealth: '>=30' } } }),
    ] },
  { key: 'official_father', origin: 'official', role: 'father', age: [22, 60], art: 'scroll',
    text: '{x} has retired from office and spends his days composing memorials to the throne about corruption he once ignored. Nobody will read them, except, possibly, the Eastern Depot.',
    choices: [
      C('Help him write them', O('You ground his ink and argued with his grammar. They were very good memorials. You hid copies.', { insight: 2, rel: { x: { aff: 10 } }, rep: { court: -3 } })),
      C('Burn them, to keep him safe', O('"The Depot reads everything," you said. He knew. That was why he wrote them.', { rel: { x: { aff: -10 } }, rep: { court: 2 } })),
      R('Get one to an honest official', 'charm', 30, O('Commander Han Gyeong read it, and kept it, and did not say what he would do with it.', { rep: { court: 5 }, fame: 2, rel: { '@guard_commander': { res: 5 }, x: { aff: 8 } } }), O('It reached the wrong desk. A Depot clerk came to visit, smiling.', { rep: { court: -5 }, sanity: -3 })),
    ] },
  { key: 'official_mother', origin: 'official', role: 'mother', age: [25, 70], art: 'garden',
    text: '{x}, a gentry daughter who put away her zither when she married, has taken it up again after forty years. She plays badly and happily every evening.',
    choices: [
      C('Listen every evening', O('You listened every evening. By winter she was playing less badly, and you were sorry.', { sanity: 6, rel: { x: { aff: 6 } } })),
      Q('Find her a teacher (10 taels)', { stat: { wealth: '>=10' } }, O('The teacher was half her age and terrified of her. She improved enormously.', { wealth: -10, rel: { x: { aff: 12 } } })),
    ] },
  { key: 'cult_father', origin: 'cultborn', role: 'father', age: [20, 60], art: 'demonic',
    text: '{x}, a Demon Warrior who never rose higher, can no longer stand in formation. In the Cult, those who cannot fight are "released to the mountains".',
    choices: [
      C('Hide him in your quarters', O('You hid him behind a screen in your quarters. He mended your armour and grumbled, and nobody came, yet.', { rep: { cult: -5 }, rel: { x: { aff: 20 } }, flag: 'bn.father.hidden' })),
      R('Petition the elders for his pension', 'fame', 30, O('The elders granted it, for your sake. He lives in a hut below the wall and keeps goats, terribly.', { rep: { cult: 3 }, rel: { x: { aff: 10 } } }), O('The petition failed. He walked into the mountains himself, at night, to spare you.', { rep: { cult: -3 }, kill: 'x', sanity: -10 })),
      C('Let the law take its course', O('He went to the mountains with his head up. You did not watch. You will always wish you had.', { kill: 'x', sanity: -15, rep: { cult: 5 } })),
    ] },
  { key: 'cult_mother', origin: 'cultborn', role: 'mother', age: [20, 65], art: 'city',
    text: '{x} wants to see the lowlands before she dies: rice paddies, she says, and a city without red banners.',
    choices: [
      C('Take her', O('You took her to Chang’an. She stood in the market for an hour without speaking, and then bought a paper fan with a cat on it.', { travel: 'changan', rep: { cult: -5 }, rel: { x: { aff: 15 } }, sanity: 5 })),
      C('Describe them to her instead', O('You described the lowlands all night. She closed her eyes and corrected you twice, about places she has never seen.', { rel: { x: { aff: 6 } }, insight: 1 })),
    ] },
  { key: 'gu', origin: 'orphan', role: 'guardian', age: [14, 50], art: 'city',
    text: 'Old Man Gu, who should be dead by every life you remember, is alive and very old, and has started telling the other beggars that you are his grandchild.',
    choices: [
      C('Let him', O('You let him. He was so proud that he gave up drinking for three days.', { rel: { x: { aff: 15 } }, sanity: 6 })),
      Q('Buy him a room with a roof (60 taels)', { stat: { wealth: '>=60' } }, O('He complained about the roof, and the walls, and slept better than he had in forty years.', { wealth: -60, rel: { x: { aff: 20 } } })),
      R('Ask him, finally, about the secret he never tells sober', 'charm', 30, O('He told you about a woman in Kaifeng he loved fifty years ago. That was the whole secret. You had expected a manual.', { insight: 2, rel: { x: { aff: 10 } } }), O('"When I am drunk," he said, and got drunk, and forgot.', { rel: { x: { aff: 4 } } })),
    ] },
], (r) => E('bn_elders', 'bonds', {
  if: { origin: r.origin, age: r.age, has: r.role }, bind: { x: r.role }, art: r.art, text: r.text, choices: r.choices,
}));

// ── Rivals who become friends ─────────────────────────────────────
const MEND = template('bn_mend', [
  { key: 'roof', if: { age: [16, 50] }, art: 'inn',
    text: 'Your rival {x} lost in the first round of a tournament today, to a nobody, in front of {x.his} whole sect. You find {x.him} on an inn roof with a jar of wine.',
    choices: [
      C('Sit down and take the jar', O('You sat down and drank. Neither of you mentioned the tournament. By midnight you were friends, which neither of you mentioned either.', { rel: { x: { aff: 15, role: 'friend' } } })),
      C('Tell {x.him} the nobody’s weakness', O('You told {x.him}. {x.He} stared, then laughed. "You watched?" {x.He} won the rematch.', { rel: { x: { res: 10, aff: 8 } }, insight: 1 })),
      C('Leave {x.him} to it', O('You left {x.him} to the roof. Rivals do not need witnesses.', { rel: { x: { aff: -2 } }, sanity: -1 })),
    ] },
  { key: 'mission', if: { rank: '>=1' }, art: 'road',
    text: 'The {sect} has paired you with your rival {x} to escort a relic across three provinces. Neither of you asked for this. Both of you suspect the elders of a sense of humour.',
    choices: [
      R('Work together', 'charm', 25, O('By the second province you were covering each other’s blind sides without a word. The elders looked insufferably pleased.', { rel: { x: { aff: 15, role: 'friend' } }, merit: 8 }), O('You argued across three provinces. The relic arrived. So did a formal complaint, from each of you.', { merit: 3, rel: { x: { aff: -5 } } })),
      C('Compete for the credit', O('You raced each other the whole way and arrived a week early. The elders were alarmed.', { merit: 5, rel: { x: { res: 5, aff: -5 } } })),
    ] },
  { key: 'wedding', if: { npc: { x: { age: '>=20' } } }, art: 'wedding',
    text: '{x} has sent you a wedding invitation. At the bottom, in {x.his} hand: "If you do not come I will assume you are afraid of weddings."',
    choices: [
      C('Go and give a toast', O('Your toast insulted {x} eleven times. {x.He} laughed at every one. You have been friends ever since, though you both deny it.', { rel: { x: { aff: 15, role: 'friend' } }, sanity: 3 })),
      Q('Send a jade pendant instead', { item: 'jade_pendant' }, O('{x} wore the pendant at the wedding, very visibly, to annoy you. It worked.', { take: { jade_pendant: 1 }, rel: { x: { aff: 10, res: 5 } } })),
      C('Do not go', O('You did not go. {x} told everyone you were afraid of weddings.', { rel: { x: { aff: -5 } }, fame: -1 })),
    ] },
  { key: 'fever', if: { age: [16, 60] }, art: 'night',
    text: '{x} has caught a fever and cannot fight the duel you arranged months ago. {x.His} sect is calling it cowardice.',
    choices: [
      C('Postpone the duel, publicly', O('You postponed it in front of everyone, and said that you would fight nobody but {x} at full strength. {x} heard, in {x.his} sickbed.', { fame: 1, rel: { x: { aff: 12, role: 'friend' } } })),
      C('Claim the win', O('You claimed it. {x} will never forgive you, and the win tastes of nothing.', { fame: 2, infamy: 1, rel: { x: { aff: -15 } } })),
      Q('Send {x.him} Golden Wound Salve', { item: 'healing_salve' }, O('Wound salve does nothing for fever, as you both knew. {x} kept the jar.', { take: { healing_salve: 1 }, rel: { x: { aff: 10, res: 5 } } })),
    ] },
  { key: 'old', if: { age: [55, 120] }, art: 'garden',
    text: 'You and {x} are old now. {x.He} challenges you to one last duel, and you both know neither of you can lift a sword above the shoulder.',
    choices: [
      C('Duel with chopsticks over dinner instead', O('You duelled for the last dumpling. {x} won, by cheating. You have never laughed so hard.', { rel: { x: { aff: 20, role: 'friend' } }, sanity: 6 })),
      C('Duel anyway, slowly', O('You met in the old field, slowly.', { combat: { foe: 'x', context: 'spar', win: { text: 'You won, by a whisker and a wheeze. {x} lay on the grass and said it was the best fight of {x.his} life. It was the best of yours.', rel: { x: { res: 10, role: 'friend' } }, sanity: 4 }, lose: { text: '{x} won, and was so pleased {x.he} forgot to gloat, and helped you up instead.', rel: { x: { aff: 10, role: 'friend' } }, sanity: 4 } } })),
    ] },
  { key: 'disciples', if: { has: ['rival', 'disciple'] },
    text: 'Your disciple and {x}’s disciple fought in the market. Both masters have been summoned to apologise to the magistrate, together.',
    choices: [
      C('Laugh about it on the way home', O('You apologised together, very solemnly, and laughed all the way home. Your disciples are horrified that you are friends.', { rel: { x: { aff: 12, role: 'friend' } } })),
      C('Blame {x.his} disciple', O('You blamed {x.his} disciple. {x} blamed yours. The magistrate fined you both.', { wealth: -5, rel: { x: { aff: -8, res: 3 } } })),
    ] },
  { key: 'doorway', if: { has: ['rival', 'family'] }, art: 'estate',
    text: 'While you were away, bandits came to your family’s door. {x}, of all people, happened to be passing, and stood in the doorway until they left.',
    choices: [
      C('Go and thank {x.him} on your knees', O('You knelt. {x} was so embarrassed {x.he} tried to fight you to make you stop. You are friends now. It is unbearable.', { rel: { x: { aff: 20, res: 5, role: 'friend' } }, sanity: 3 })),
      C('Ask {x.him} why', O('"Because I want to beat you myself," {x.he} said. "Nobody else gets to hurt you."', { rel: { x: { res: 10, aff: 10 } }, insight: 1 })),
    ] },
  { key: 'jin', named: true, if: { met: 'namgung_jin', alive: 'namgung_jin', age: [20, 40], year: [18, 37], npc: { '@namgung_jin': { role: 'rival' } } }, art: 'estate',
    text: 'Namgung Jin is to be formally named heir of the Namgung. He sends for you and asks you to stand beside him at the ceremony, "as the only person who has never once flattered me."',
    choices: [
      C('Stand beside him', O('You stood beside him under nine generations of portraits and did not flatter him once. Afterwards he shook your hand for a long time.', { rel: { '@namgung_jin': { aff: 20, role: 'friend' } }, rep: { families: 5 } })),
      C('Flatter him outrageously, for once', O('He laughed so hard the elders frowned. It was the first time anyone had seen him laugh in the great hall.', { rel: { '@namgung_jin': { aff: 10 } }, charm: 1 })),
    ] },
], (r) => E('bn_mend', 'bonds', {
  if: r.named ? r.if : { has: 'rival', ...r.if }, bind: r.named ? undefined : { x: 'rival' }, art: r.art, text: r.text, choices: r.choices,
}));

export default [...HAND, ...SPARK, ...HEART, ...VOW_TPL, ...AGAIN, ...LETTER, ...GRIEF, ...OATH, ...PUPIL, ...GROWING, ...ELDERS, ...MEND];
