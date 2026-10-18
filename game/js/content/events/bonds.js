// Bonds: courtship and marriage, children and family legacy, parents growing old, friendship and
// sworn siblings, rivals and nemeses, betrayal, letters, loss.
import { E, O, C, R, P, M, Q, L } from './kit.js';

const NEW_FRIEND = { ageRel: [-3, 3], role: 'acquaintance', aff: 35 };

export default [
  // ── Meeting people ──────────────────────────────────────────────
  E('bd_meet_romance', 'bonds', { if: { age: [16, 40], married: false }, once: false, cd: 4, bind: { x: { role: 'acquaintance', aff: 35, romance: true, ageRel: [-4, 4], minAge: 16 } }, art: 'garden', text: 'At the lantern festival, someone steps on your foot, apologises, and then laughs at the same moment you do. {x}.', choices: [
    C('Walk the lanterns together', O('You walked the lantern-lined streets until the oil ran out. {x} has a laugh that makes the night warmer.', { rel: { x: { aff: 15 } } })),
    C('Say goodnight', O('You said goodnight. Some meetings are only meetings.', { rel: { x: { aff: 3 } } })),
  ] }),
  E('bd_meet_friend_inn', 'bonds', { if: { age: [14, 70], locType: 'city' }, once: false, cd: 5, bind: { x: NEW_FRIEND }, art: 'inn', text: 'The only free seat in the crowded inn is across from a traveller named {x}, who has ordered far too many dumplings and offers to share.', choices: [
    C('Share and talk', O('You talked until the innkeeper threw you both out. {x} is good company, the kind that does not need to be filled with words.', { rel: { x: { aff: 15, role: 'friend' } } })),
    C('Eat in silence', O('You ate in companionable silence. It was nice.', { rel: { x: { aff: 5 } } })),
  ] }),
  E('bd_meet_sparring', 'bonds', { if: { age: [14, 60], realm: '>=1' }, once: false, cd: 5, bind: { x: { ageRel: [-4, 4], role: 'acquaintance', realm: [1, 4], aff: 30, res: 30 } }, text: 'A wandering martial artist named {x} is practising in the same field as you. Neither of you will leave first.', choices: [
    C('Offer to spar', O('You sparred until dusk. Neither won. You shared a drink and a grudging respect.', { rel: { x: { aff: 10, res: 15, role: 'friend' } }, body: 1 })),
    C('Practise harder to make a point', O('You practised harder. So did {x.he}. By sunset you were both exhausted and laughing.', { rel: { x: { res: 10 } }, body: 1 })),
  ] }),

  // ── Courtship ───────────────────────────────────────────────────
  E('bd_lover_walk', 'bonds', { if: { has: 'lover' }, once: false, cd: 2, bind: { x: 'lover' }, art: 'blossom', text: '{x} asks you to walk by the river in the evening, just the two of you.', choices: [
    C('Go', O('You walked until the stars came out. {x} talked about the future as if it were certain. You did not correct {x.him}.', { rel: { x: { aff: 8 } }, sanity: 4 })),
    C('Train instead', O('You trained instead. {x} said {x.he} understood. {x.He} did not.', { rel: { x: { aff: -6 } } })),
  ] }),
  E('bd_lover_jealous', 'bonds', { if: { has: 'lover', age: [16, 60] }, once: false, cd: 6, bind: { x: 'lover' }, text: '{x} saw you laughing with someone else at the market and has been very quiet ever since.', choices: [
    C('Explain', O('You explained. {x} pretended not to have been jealous. You pretended to believe {x.him}.', { rel: { x: { aff: 4 } } })),
    C('Tease {x.him} about it', P('Tease {x.him} about it', 0.5, O('{x} threw a peach at you, and then laughed.', { rel: { x: { aff: 6 } } }), O('That was a mistake.', { rel: { x: { aff: -10 } } }))),
  ] }),
  E('bd_lover_parents', 'bonds', { if: { has: 'lover', age: [18, 40] }, bind: { x: 'lover' }, text: '{x}’s family has asked to meet you. {x.His} father is said to be very particular.', choices: [
    R('Charm them', 'charm', 25, O('By the end of dinner {x.his} father was telling you embarrassing stories about {x} as a child. That is approval.', { rel: { x: { aff: 10 } } }), O('{x.His} father asked about your prospects, and your sword hand, and your ancestors. You fumbled all three.', { rel: { x: { aff: -3 } } })),
    C('Be honest about who you are', O('You told them who you are and what you do. They were not thrilled. {x} squeezed your hand under the table.', { rel: { x: { aff: 8 } } })),
  ] }),
  E('bd_wedding', 'bonds', { if: { has: 'spouse', flag: 'married', not: 'wed.feast' }, art: 'wedding', title: 'The wedding', text: 'Red lanterns, red silk, too much wine, firecrackers, and every relative either of you has ever had. You and {spouse} bowed to Heaven, to the ancestors, and to each other.', choices: [
    C('Drink with every guest', O('You drank with every guest and remember almost none of it. {spouse} remembers all of it, and will remind you for decades.', { flag: 'wed.feast', sanity: 8, charm: 1 })),
    C('Slip away together early', O('You slipped away before the third course. Nobody was surprised.', { flag: 'wed.feast', sanity: 8, rel: { spouse: { aff: 8 } } })),
  ] }),
  E('bd_spouse_quarrel', 'bonds', { if: { has: 'spouse' }, once: false, cd: 3, bind: { x: 'spouse' }, text: 'You and {x} quarrelled about money, or about your training, or about nothing at all. It is late. Neither of you wants to be the first to speak.', choices: [
    C('Apologise first', O('You apologised first. {x} apologised second. You both slept better.', { rel: { x: { aff: 6 } }, sanity: 2 })),
    C('Sleep in the training hall', O('You slept on the training hall floor. It was cold and very satisfying and very stupid.', { rel: { x: { aff: -6 } } })),
  ] }),
  E('bd_spouse_child', 'bonds', { if: { has: 'spouse', age: [18, 45] }, once: false, cd: 3, bind: { x: 'spouse' }, art: 'birth', text: '{x} has news, and does not know how you will take it: a child is coming.', choices: [
    C('Weep with joy', O('You wept. {x} laughed at you, then wept too. In the spring, a child was born.', { child: true, rel: { x: { aff: 10 } }, sanity: 6 })),
    C('Worry about the world it will be born into', O('You worried. You will worry for the rest of your life. In the spring, a child was born anyway.', { child: true, insight: 1 })),
  ] }),
  E('bd_spouse_anniversary', 'bonds', { if: { has: 'spouse' }, once: false, cd: 5, bind: { x: 'spouse' }, text: 'It is the anniversary of your wedding. {x} pretends not to remember. {x.He} remembers.', choices: [
    Q('Buy {x.him} a jade pendant (12 taels)', { stat: { wealth: '>=12' } }, O('{x} wore it every day afterwards.', { wealth: -12, rel: { x: { aff: 10 } } })),
    C('Cook {x.his} favourite meal', O('You burned it. {x} ate it anyway and said it was the best thing {x.he} had ever tasted.', { rel: { x: { aff: 8 } } })),
    C('Forget', O('You forgot. {x} did not say anything. That was the worst part.', { rel: { x: { aff: -8 } } })),
  ] }),
  E('bd_spouse_sick', 'bonds', { if: { has: 'spouse', age: [30, 120] }, once: false, cd: 8, bind: { x: 'spouse' }, art: 'night', text: '{x} has a fever that the physicians cannot name.', choices: [
    Q('Pay the best physician in the city (40 taels)', { stat: { wealth: '>=40' } }, O('The physician was expensive and worth it. {x} recovered by summer.', { wealth: -40, rel: { x: { aff: 10 } } })),
    R('Nurse {x.him} yourself', 'insight', 25, O('You read every medical text you could find and nursed {x.him} through it. {x.He} recovered.', { insight: 2, rel: { x: { aff: 12 } } }), O('You did everything you could. It was not enough.', { kill: 'x', sanity: -15 })),
  ] }),

  // ── Children and family legacy ─────────────────────────────────
  E('bd_child_first_word', 'bonds', { if: { has: 'child' }, bind: { x: 'child' }, text: '{x}’s first word was your name, more or less. Mostly less.', choices: [C('Pretend you are not crying', O('You pretended. Badly.', { sanity: 5, rel: { x: { aff: 10 } } }))] }),
  E('bd_child_training', 'bonds', { if: { has: 'child', realm: '>=1' }, once: false, cd: 3, bind: { x: 'child' }, text: '{x} wants to learn what you know. {x.His} stance is terrible. {x.His} determination is not.', choices: [
    C('Teach {x.him} properly', O('You taught {x.him} every morning before dawn. {x.He} complained every morning. {x.He} never missed one.', { npcRealm: { x: 1 }, rel: { x: { aff: 8, res: 8 } } })),
    C('Tell {x.him} to study instead', O('You told {x.him} the murim is no place for a {x.son} of yours. {x.He} did not speak to you for a week.', { rel: { x: { aff: -5 } } })),
  ] }),
  E('bd_child_trouble', 'bonds', { if: { has: 'child' }, once: false, cd: 4, bind: { x: 'child' }, text: '{x} has got into a fight with the son of a powerful family. The other boy has a broken nose. The family wants an apology, or more.', choices: [
    C('Make {x.him} apologise', O('{x} apologised, through gritted teeth. The matter was closed. {x.He} has not forgiven you.', { rel: { x: { aff: -4, res: 4 } } })),
    C('Defend {x.him}', O('You went to the family’s gate and explained, politely and with your sword visible, that children fight. They agreed, eventually.', { rel: { x: { aff: 10 } }, infamy: 1 })),
  ] }),
  E('bd_child_leaves', 'bonds', { if: { has: 'child', fn: (g) => g.withRole('child').some((c) => g.npcAge(c) >= 16) } , bind: { x: 'child' }, title: 'Leaving home', text: '{x} has packed a bag. {x.He} wants to see the world, or join a sect, or simply be somewhere you are not.', choices: [
    C('Give {x.him} your blessing', O('You gave {x.him} your blessing and a pouch of silver. You stood at the gate until {x.he} was out of sight, and then a while longer.', { rel: { x: { aff: 15 } }, sanity: -3, wealth: -10 })),
    C('Forbid it', O('You forbade it. {x} left anyway, three months later, without a goodbye.', { rel: { x: { aff: -20 } } })),
  ] }),
  E('bd_child_letter', 'bonds', { if: { has: 'child', fn: (g) => g.withRole('child').some((c) => g.npcAge(c) >= 18) }, once: false, cd: 3, fmt: 'letter', from: 'child', bind: { x: 'child' }, art: 'letter', text: '"Father/Mother, I am well. The food here is terrible. I have been promoted, a little. Please don’t worry. I am not eating properly." The handwriting is {x}’s, terrible as ever.', choices: [C('Write back at length', O('You wrote back ten pages of advice. {x} will not read most of it. {x.He} will keep all of it.', { rel: { x: { aff: 8 } }, sanity: 3 }))] }),
  E('bd_grandchild', 'bonds', { if: { has: 'child', age: [40, 200], fn: (g) => g.withRole('child').some((c) => g.npcAge(c) >= 22) } , art: 'birth', title: 'A grandchild', text: 'A letter, then a visit: {child} has a child of {child.his} own, and has come home to show you.', choices: [C('Hold the baby', O('The baby grabbed your finger and would not let go. Neither would you.', { sanity: 10, achieve: 'parent' }))] }),
  E('bd_child_surpasses', 'bonds', { if: { has: 'child', fn: (g) => g.withRole('child').some((c) => c.realm >= g.life.realm && c.realm >= 2) } , bind: { x: 'child' }, text: 'Sparring in the courtyard, {x} disarmed you. Not by luck.', choices: [C('Bow to {x.him}', O('You bowed to your own child. {x} did not know what to do with {x.his} face.', { rel: { x: { aff: 10, res: 15 } }, sanity: 5, fame: 2 }))] }),

  // ── Parents and siblings growing old ────────────────────────────
  E('bd_parent_old', 'bonds', { if: { has: 'parent', age: [25, 70] }, once: false, cd: 6, bind: { x: 'parent' }, text: '{x} has slowed down. {x.He} pretends not to have. {x.He} asks you to carry the water, "just this once."', choices: [
    C('Stay a season and help', O('You stayed a season. You fixed the roof, chopped a year of wood, and listened to every story twice.', { rel: { x: { aff: 10 } }, sanity: 4 })),
    C('Send money', O('You sent money. It is not the same, and you both know it.', { wealth: -8, rel: { x: { aff: 3 } } })),
  ] }),
  E('bd_parent_dies', 'bonds', { if: { has: 'parent', age: [30, 90], fn: (g) => g.withRole('parent').some((p) => g.npcAge(p) >= 62) } , bind: { x: 'parent' }, art: 'grave', title: 'The last winter', text: '{x} is dying. Not of anything; of everything. {x.He} asks for you.', choices: [
    C('Go home at once', O('You arrived in time. {x} held your hand and told you a story you had never heard, about the day you were born. Then {x.he} slept, and did not wake.', { kill: 'x', sanity: -8, burden: -1 })),
    C('You cannot leave now', O('You could not leave. The letter that came a month later was short.', { kill: 'x', sanity: -15 })),
  ] }),
  E('bd_sibling_marries', 'bonds', { if: { has: 'sibling', age: [16, 50] }, bind: { x: 'sibling' }, art: 'wedding', text: '{x} is getting married, and wants you there.', choices: [
    C('Go and dance', O('You went and danced badly and cried at the right moment. {x} hugged you so hard your ribs creaked.', { rel: { x: { aff: 12 } }, sanity: 4 })),
    Q('Send a generous gift', { stat: { wealth: '>=20' } }, O('You sent twenty taels and a letter. It was not the same.', { wealth: -20, rel: { x: { aff: 5 } } })),
  ] }),
  E('bd_sibling_debt', 'bonds', { if: { has: 'sibling', age: [18, 60] }, once: false, cd: 6, bind: { x: 'sibling' }, text: '{x} has gambling debts and has come to you, ashamed.', choices: [
    Q('Pay them (30 taels)', { stat: { wealth: '>=30' } }, O('You paid. {x} swore it would never happen again. It happened again.', { wealth: -30, rel: { x: { aff: 10 } } })),
    C('Refuse', O('You refused. {x} left without a word. The debt collectors were less polite than you.', { rel: { x: { aff: -12 } } })),
    C('Go and talk to the debt collectors', R('Go and talk to the debt collectors', 'power', 30, O('You talked to them, with your sword on the table. The debt was forgiven.', { infamy: 2, rel: { x: { aff: 15 } } }), O('They had more swords than you.', { health: -15 }))),
  ] }),

  // ── Friendship and sworn siblings ───────────────────────────────
  E('bd_friend_drink', 'bonds', { if: { has: 'friend' }, once: false, cd: 3, bind: { x: 'friend' }, art: 'inn', text: '{x} turns up with a jar of wine and no explanation.', choices: [
    C('Drink until dawn', O('You drank until dawn and talked about everything. Most of it was nonsense. All of it mattered.', { rel: { x: { aff: 10 } }, sanity: 5, health: -2 })),
    C('One cup, then sleep', O('One cup, then sleep. {x} called you old. You are.', { rel: { x: { aff: 3 } } })),
  ] }),
  E('bd_friend_help', 'bonds', { if: { has: 'friend' }, once: false, cd: 5, bind: { x: 'friend' }, text: '{x} is in trouble: a debt, a feud, a family matter. {x.He} has not asked for help. {x.He} would never ask.', choices: [
    C('Help without being asked', O('You helped. {x} pretended not to know it was you. You both knew.', { rel: { x: { aff: 15, res: 5 } } })),
    C('Wait to be asked', O('You waited. {x} never asked. The trouble passed, eventually, and something between you cooled.', { rel: { x: { aff: -5 } } })),
  ] }),
  E('bd_peach_oath', 'bonds', { if: { has: 'friend', age: [14, 60], season: 0 }, bind: { x: 'friend' }, art: 'blossom', title: 'Under the peach trees', text: 'The peach trees are in bloom. {x} looks at you, then at the trees, and says, half joking: "Isn’t this where heroes swear brotherhood?"', choices: [
    C('Swear it', O('You cut your palms and swore, under falling petals, to live and die as one. You were both laughing, and you both meant it.', { role: { x: 'sworn' }, achieve: 'sworn', rel: { x: { aff: 15 } } })),
    C('Laugh it off', O('You laughed it off. {x} laughed too, a little late.', { rel: { x: { aff: -2 } } })),
  ] }),
  E('bd_sworn_danger', 'bonds', { if: { has: 'sworn', age: [16, 90] }, once: false, cd: 6, bind: { x: 'sworn' }, danger: true, text: 'Word comes that your sworn sibling {x} has been ambushed on the road and is holding out in a burning inn.', choices: [
    C('Ride to {x.him}', O('You rode all night.', { combat: { foe: { name: 'the ambushers’ leader', kind: 'bandit', rel: 0.5 }, context: 'ambush', lethal: 0.4, win: { text: 'You got {x} out of the burning inn on your back. {x.He} said nothing at all for a day, and then never stopped talking about it.', rel: { x: { aff: 20, res: 20 } }, fame: 4 }, lose: { text: 'You were too late, and too weak. {x} is dead.', kill: 'x', sanity: -15 } } })),
    C('Send others', P('Send others', 0.5, O('The others got there in time. {x} lived, and asked where you were.', { rel: { x: { aff: -10 } } }), O('The others got there too late.', { kill: 'x', sanity: -20 }))),
  ] }),

  // ── Rivals and nemeses ──────────────────────────────────────────
  E('bd_rival_appears', 'bonds', { if: { age: [12, 40], realm: '>=1', hasNot: 'rival' }, bind: { x: { ageRel: [-2, 2], role: 'rival', realm: [1, 5], aff: 15, res: 30, nick: true } }, text: 'A fighter your own age named {x} has been telling everyone in town {x.he} could beat you with one hand.', choices: [
    C('Challenge {x.him}', O('You found {x.him} in the market.', { combat: { foe: 'x', context: 'duel', win: { text: '{x} lost, with both hands. {x.He} swore {x.he} would be back. {x.He} will.', fame: 3, rel: { x: { res: 15 } } }, lose: { text: '{x} won, with both hands. {x.He} did not say anything about it, which was worse.', rel: { x: { res: 5 } } } } })),
    C('Ignore {x.him}', O('You ignored {x.him}. That infuriated {x.him} more than anything.', { rel: { x: { aff: -5 } } })),
  ] }),
  E('bd_rival_grows', 'bonds', { if: { has: 'rival', age: [14, 80] }, once: false, cd: 4, bind: { x: 'rival' }, text: 'News: your rival {x} has broken through to a new realm. {x.He} sent you a single word: "Next."', choices: [
    C('Train twice as hard', O('You trained twice as hard for a season. Rivalry is the best whetstone.', { body: 2, qi: 10, npcRealm: { x: 0 } })),
    C('Send back a single word: "Whenever."', O('You sent it. Somewhere, {x} laughed.', { rel: { x: { res: 5 } } })),
  ] }),
  E('bd_rival_respect', 'bonds', { if: { has: 'rival', age: [20, 90], npc: { rival: { res: '>=50' } } }, bind: { x: 'rival' }, text: 'Your rival {x} is hurt, alone, and being hunted by people you both dislike.', choices: [
    C('Help {x.him}', O('You stood next to {x.him} and fought. Afterwards, bleeding, {x.he} said, "This changes nothing." It changed everything.', { role: { x: 'friend' }, rel: { x: { aff: 25, res: 15 } } })),
    C('Let {x.him} handle it', O('{x} handled it, barely. {x.He} saw you watching. {x.He} will remember that too.', { rel: { x: { aff: -8 } } })),
  ] }),
  E('bd_nemesis_vow', 'bonds', { if: { age: [16, 90], fn: (g) => g.life.tally.kills > 0 } , bind: { x: { role: 'nemesis', age: [16, 40], aff: 0, res: 40, realm: [1, 5], nick: true } }, title: 'A blood debt', text: 'A stranger stops you in the road. "Years ago, you killed someone I loved," says {x}. "I have trained every day since. Today I collect."', choices: [
    C('Fight', O('So be it.', { combat: { foe: 'x', context: 'nemesis', important: true, win: { text: 'It ended. Another blood debt, paid in the same coin.', sanity: -5 }, lose: { text: '{x} stood over you, breathing hard, and did not strike. "Not like this," {x.he} said, and left.' } } })),
    R('Apologise, truly', 'charm', 35, O('You knelt in the road and apologised. {x} wept with rage. {x.He} did not draw. "That is worse than anything," {x.he} said.', { role: { x: 'enemy' }, sanity: 3 }), O('Words are not enough. {x.He} drew.', { combat: { foe: 'x', context: 'nemesis', important: true } })),
  ] }),
  E('bd_namgung_jin_rival', 'bonds', { if: { age: [16, 40], met: 'namgung_jin', alive: 'namgung_jin' }, art: 'duel', text: 'Namgung Jin finds you on the road, alone, his hand already on his sword. "Everyone keeps comparing us," he says. "I am tired of it. Let’s settle it."', choices: [
    C('Settle it', O('You drew.', { combat: { foe: '@namgung_jin', context: 'duel', important: true, win: { text: 'He lay in the dust, staring at the sky. Then he laughed, for the first time in years. "Again," he said. "Next year."', rel: { '@namgung_jin': { res: 25, aff: 10, role: 'rival' } }, fame: 8 }, lose: { text: 'He won. He held out his hand to help you up, and you were both surprised.', rel: { '@namgung_jin': { res: 10, aff: 10, role: 'rival' } } } } })),
    C('Buy him a drink instead', O('He stared at you as if you had grown a second head. Then he sat down. You learned that the heir of the Namgung has never had a friend.', { rel: { '@namgung_jin': { aff: 20 } } })),
  ] }),

  // ── Betrayal and loss ───────────────────────────────────────────
  E('bd_betrayal', 'bonds', { if: { has: 'friend', age: [16, 90], chance: 0.26 }, once: false, cd: 12, bind: { x: 'friend' }, title: 'Betrayal', text: 'You learn that {x}, whom you trusted, sold information about you to people who want you dead.', choices: [
    C('Confront {x.him}', O('{x} did not deny it. "They had my family," {x.he} said. You do not know if it is true. You will never know.', { role: { x: 'enemy' }, rel: { x: { aff: -40 } }, sanity: -8 })),
    C('Forgive {x.him}', O('You forgave {x.him}. It was the hardest thing you have done with your hands empty.', { rel: { x: { aff: -10 } }, sanity: 3 })),
    C('Cut {x.him} out of your life without a word', O('You never spoke to {x.him} again.', { role: { x: 'acquaintance' }, rel: { x: { aff: -50 } } })),
  ] }),
  E('bd_friend_dies', 'bonds', { if: { has: 'friend', age: [20, 200], chance: 0.34 }, once: false, cd: 10, bind: { x: 'friend' }, art: 'grave', text: 'A letter, in someone else’s handwriting: {x} is dead. A fever, or a sword, or the road. The letter does not say, as if it matters.', choices: [
    C('Visit the grave', O('You poured wine on the grave and drank the rest. You told {x} the joke you never got round to telling.', { kill: 'x', sanity: -8 })),
    C('Burn the letter', O('You burned the letter. It does not undo anything.', { kill: 'x', sanity: -12 })),
  ] }),
  E('bd_master_dies', 'bonds', { if: { has: 'master', age: [20, 200], chance: 0.34 }, once: false, cd: 10, bind: { x: 'master' }, art: 'grave', title: 'Your master', text: 'Your master {x} is dying, and has asked for you.', choices: [C('Kneel by the bed', O('{x} told you three things: a technique, a regret, and that {x.he} was proud of you. You will tell no one the regret.', { kill: 'x', insight: 4, sanity: -8, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 15); } }))] }),
  E('bd_disciple_pride', 'bonds', { if: { has: 'disciple' }, once: false, cd: 5, bind: { x: 'disciple' }, text: '{x}, your disciple, has won {x.his} first real fight. {x.He} comes to tell you, trying very hard not to look pleased.', choices: [
    C('Praise {x.him}', O('You praised {x.him}. {x.He} pretended not to care. {x.He} told everyone.', { rel: { x: { aff: 10 } } })),
    C('Point out {x.his} three mistakes', O('You pointed out three mistakes. {x} sulked, then fixed all three.', { rel: { x: { res: 10 } }, npcRealm: { x: 1 } })),
  ] }),
  E('bd_disciple_betray', 'bonds', { if: { has: 'disciple', chance: 0.26 }, once: false, cd: 15, bind: { x: 'disciple' }, text: 'Your disciple {x} has run off to a rival sect, taking a copy of your notes.', choices: [
    C('Hunt {x.him} down', O('You found {x.him}.', { combat: { foe: 'x', context: 'duel', win: { text: '{x} knelt. You took back your notes and nothing else. "Go," you said.', role: { x: 'enemy' } }, lose: { text: '{x} had learned more than you thought.', role: { x: 'rival' } } } })),
    C('Let {x.him} go', O('You let {x.him} go. Every teacher is eventually a stepping stone.', { role: { x: 'acquaintance' }, sanity: -4 })),
  ] }),

  // ── Letters ─────────────────────────────────────────────────────
  E('bd_letter_friend', 'bonds', { if: { has: 'friend', age: [16, 200] }, once: false, cd: 4, fmt: 'letter', from: 'friend', art: 'letter', bind: { x: 'friend' }, text: '"The plum trees here are blooming and nobody appreciates them properly. Come and appreciate them. Bring wine. Bring better wine than last time." It is from {x}.', choices: [
    C('Go', O('You went. The wine was better. The plum trees were appreciated.', { rel: { x: { aff: 10 } }, sanity: 4 })),
    C('Write back instead', O('You wrote back a poem about plum trees. It was terrible. {x} framed it.', { rel: { x: { aff: 5 } } })),
  ] }),
  E('bd_letter_mother', 'bonds', { if: { has: 'mother', age: [14, 70] }, once: false, cd: 3, fmt: 'letter', from: 'mother', art: 'letter', text: '"Are you eating? You are not eating. Your cousin has married. The roof leaks again. Come home for New Year. Are you eating?"', choices: [
    C('Go home for New Year', O('You went home. You ate. You were told you were not eating enough.', { rel: { mother: { aff: 10 } }, sanity: 5, health: 3 })),
    C('Send money for the roof', O('You sent money for the roof. The next letter thanked you for the roof and asked if you were eating.', { wealth: -6, rel: { mother: { aff: 4 } } })),
  ] }),
  E('bd_letter_anonymous', 'bonds', { if: { age: [18, 200], stat: { fame: '>=20' } }, once: false, cd: 6, fmt: 'letter', art: 'letter', text: 'An unsigned letter: "You saved my son on the Luoyang road three years ago. You did not stay to be thanked. Thank you." There is a pressed flower inside.', choices: [C('Keep it', O('You kept it in your journal. Some days it is the only thing that helps.', { sanity: 6 }))] }),
  E('bd_letter_challenge', 'bonds', { if: { age: [16, 80], stat: { fame: '>=15' }, realm: '>=2' }, once: false, cd: 5, fmt: 'letter', art: 'letter', bind: { x: { role: 'rival', realm: [1, 6], ageRel: [-5, 10], nick: true, aff: 10, res: 30 } }, text: '"I have heard your name too often. Meet me at the Cliff of Broken Swords at the next full moon, or be known as a coward. — {x}"', choices: [
    C('Go to the cliff', O('Full moon. {x} was waiting.', { combat: { foe: 'x', context: 'duel', win: { text: '{x} bowed, bleeding. "Your name deserves its reputation."', fame: 6 }, lose: { text: '{x} took your sword as a trophy.', fame: -3 } } })),
    C('Ignore it', O('You ignored it. The word "coward" went around for a season, and then people forgot.', { fame: -2 })),
  ] }),

  // ── Small kindnesses ────────────────────────────────────────────
  E('bd_kind_stranger', 'bonds', { if: { age: [10, 200] }, once: false, cd: 6, text: 'You are caught in a downpour with no coat. An old woman beckons you under her eaves and gives you hot tea without a word.', choices: [C('Thank her', O('You thanked her. She waved it away. You walked on warmer than you had any right to be.', { sanity: 3 }))] }),
  E('bd_lost_child', 'bonds', { if: { age: [14, 200], locType: 'city' }, once: false, cd: 6, text: 'A small child is crying in the market, lost.', choices: [
    C('Help find the parents', O('You carried the child on your shoulders until a frantic mother came running. She bowed so low her forehead touched the street.', { fame: 1, sanity: 3 })),
    C('Leave it to the guards', O('You told a guard. The guard shrugged. You walked on, and looked back once.')),
  ] }),
  E('bd_old_teacher', 'bonds', { if: { age: [25, 90], origin: 'peasant', loc: 'willow' }, text: 'Old Teacher Pyo is still alive, very old now, sitting outside the school. He squints at you. "You," he says. "You were the one who pestered me."', choices: [C('Bow to him', O('You bowed, deeply. He waved you off. "Did you get past First-Rate?" You told him. He laughed until he cried.', { sanity: 6 }))] }),
  E('bd_jiho_grown', 'bonds', { if: { age: [18, 40], met: 'jiho', alive: 'jiho', npc: { '@jiho': { aff: '>=40' } } }, text: 'Han Ji-ho, your childhood friend, runs the mill now. He has flour in his hair and three children hanging off his legs.', choices: [
    C('Stay for dinner', O('You stayed for dinner and told the children stories about their father that he begged you not to tell.', { rel: { '@jiho': { aff: 10 } }, sanity: 5 })),
    C('Ask if he still wants to see the world', O('"Every day," he said, looking at his children. "And never." You understood.', { rel: { '@jiho': { aff: 5 } }, insight: 1 })),
  ] }),
  E('bd_bora_book', 'bonds', { if: { age: [16, 50], met: 'bora', alive: 'bora' }, fmt: 'letter', from: '@bora', art: 'letter', text: '"I have written a book. Nobody will publish it because I am a woman from a village. I am sending it to you because you are the only person who ever asked me to teach them to read."', choices: [
    Q('Pay to have it printed (40 taels)', { stat: { wealth: '>=40' } }, O('You had a hundred copies printed. One of them ended up in the Imperial Library. Bo-ra wrote back three words: "You absolute fool." You could hear her crying.', { wealth: -40, rel: { '@bora': { aff: 30 } }, sanity: 4 })),
    C('Read it and write back', O('You read it twice and wrote back ten pages. It was very good. You told her so.', { rel: { '@bora': { aff: 12 } }, insight: 2 })),
  ] }),
  E('bd_dongsu_grown', 'bonds', { if: { age: [16, 50], met: 'dongsu', alive: 'dongsu' }, text: 'Dong-su, now a Six-Pouch elder of the Beggars’ Sect with the same missing tooth, finds you at an inn. "I hear things," he says. "And I hear people are looking for you."', choices: [C('Listen', O('He told you who, and why, and where. "On the house," he said. "For the bowl."', { rel: { '@dongsu': { aff: 10 } }, insight: 2, flag: 'warned.hunters' }))] }),
  E('bd_ilgak_grown', 'bonds', { if: { age: [20, 60], met: 'ilgak', alive: 'ilgak' }, text: 'Il-gak, your old friend from Shaolin, now a warrior monk the size of a door, turns up on your doorstep with a roast chicken and a guilty smile.', choices: [C('Share it', O('You shared it under a blanket, like old times. He is a great monk now. He is still a terrible monk.', { rel: { '@ilgak': { aff: 12 } }, sanity: 5 }))] }),
];
