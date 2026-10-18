// The Gangho: roads, inns, strangers, escorts, wandering. Includes events triggered on the road,
// on arrival, and by the Wander activity.
import { E, O, C, R, P, M, Q, L } from './kit.js';

export default [
  // ── On the road ─────────────────────────────────────────────────
  E('jh_road_bandits', 'jianghu', { on: 'road', once: false, cd: 2, danger: true, art: 'road', title: 'Bandits', text: 'Five men step out of the trees with sabers and a speech they have clearly given many times. "This road belongs to the Green Forest. The toll is everything."', choices: [
    C('Fight', O('You drew.', { combat: { foe: { name: 'the bandit leader', kind: 'bandit', rel: -0.5 }, context: 'ambush', lethal: 0.35, win: { text: 'The bandits scattered into the trees. One of them dropped a purse.', wealth: 8, fame: 2 }, lose: { text: 'They took everything, including your boots.', wealth: -20 } } })),
    Q('Pay the toll', { stat: { wealth: '>=10' } }, O('You paid. They wished you a pleasant journey with complete sincerity.', { wealth: -10 })),
    R('Run', 'body', 18, O('You ran. Bandits are lazy; they did not follow far.', { body: 1 }), O('They caught you, laughing, and took your purse.', { wealth: -15, health: -5 })),
    M('Name their captain and ask after his mother', 'foe.bandit_captain', O('The bandits stared. Their captain went red. "How do you know my mother?" They let you pass, and their captain walked with you for a while, asking questions.', { charm: 1 })),
  ] }),
  E('jh_road_wounded_monk', 'jianghu', { on: 'road', art: 'road', text: 'A monk in torn grey robes lies by the road, a knife wound in his side. He is still clutching a sealed letter.', choices: [
    C('Bind his wound and carry the letter', O('He pressed the letter into your hands. "Shaolin. The Abbot. Please." You delivered it. The Abbot read it and looked at you for a long time. "The temple owes you," he said.', { rep: { orthodox: 10 }, fame: 3, flag: 'shaolin.debt' })),
    C('Bind his wound and go on your way', O('You bound his wound and left him at the next village. He lived. He did not forget.', { rep: { orthodox: 3 } })),
    C('Read the letter', O('It was a list of names: people in the Murim Alliance taking money from the Cult. You burned it, or kept it. Either way, you know now.', { codex: { id: 'secret.alliance_list', cat: 'secrets', title: 'A list of names', text: 'A letter carried by a wounded Shaolin monk listed Murim Alliance members taking Cult money. Alliance Leader Hwangbo Jun’s name was first.' }, sanity: -2 })),
  ] }),
  E('jh_road_storm', 'jianghu', { on: 'road', once: false, cd: 3, art: 'storm', text: 'A storm catches you in the open. The only shelter is a ruined temple where three other travellers have already lit a fire.', choices: [
    C('Share their fire', O('A merchant, a nun and a gambler. You told stories until dawn. The gambler cheated at cards, the nun caught him, and the merchant laughed until he fell over.', { sanity: 4, charm: 1 })),
    C('Keep your distance and keep watch', O('You sat by the door all night. Nothing happened. In the morning the gambler’s purse was missing; it was not you.', { insight: 1 })),
  ] }),
  E('jh_road_toll_soldiers', 'jianghu', { on: 'road', once: false, cd: 3, art: 'road', text: 'Imperial soldiers have set up a checkpoint. They are looking for "murim troublemakers." They look at your sword.', choices: [
    Q('Bribe them (5 taels)', { stat: { wealth: '>=5' } }, O('Five taels made you a respectable citizen.', { wealth: -5 })),
    R('Talk your way through', 'charm', 20, O('You were a tea merchant, you explained, the sword was for snakes. They believed you, or were too bored not to.', { charm: 1 }), O('They took the sword "for inspection." You never saw it again.', { rep: { court: -2 } })),
    C('Go around through the hills', O('A day lost in the hills, but no questions.', { body: 1 })),
  ] }),
  E('jh_road_caravan', 'jianghu', { on: 'road', once: false, cd: 4, art: 'road', text: 'A merchant caravan travelling the same way offers you a place, food, and pay, if you help guard it.', choices: [
    C('Join them', P('Join them', 0.65, O('Uneventful, apart from the cook’s food. They paid you at the end and invited you back.', { wealth: 10, rep: { merchants: 2 } }), O('Raiders hit the caravan on the second night.', { combat: { foe: { name: 'a raider', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.3, win: { text: 'The raiders were driven off. The merchants paid you double.', wealth: 20, rep: { merchants: 4 } }, lose: { text: 'The raiders took the cargo. The merchants did not pay you.' } } }))),
    C('Travel alone', O('You travelled alone, faster and quieter.')),
  ] }),
  E('jh_road_fleeing_girl', 'jianghu', { on: 'road', once: false, cd: 5, danger: true, art: 'road', text: 'A young woman runs out of the forest, bare-footed, and hides behind you. Three men in good clothes follow, breathing hard. "Our master’s runaway servant," one says. "Hand her over."', choices: [
    C('Refuse', O('They did not like that.', { combat: { foe: { name: 'a household guard', kind: 'soldier', rel: 0 }, context: 'duel', win: { text: 'They left, limping. She told you her master had bought her for a debt her father owed. You walked her to the next town and gave her money for the road.', fame: 3, wealth: -5 }, lose: { text: 'They beat you and took her. You will remember their master’s crest.', sanity: -8 } } })),
    Q('Buy her debt (40 taels)', { stat: { wealth: '>=40' } }, O('You paid. The men left, counting silver. She wept, and walked away free.', { wealth: -40, fame: 2, sanity: 4 })),
    C('Step aside', O('You stepped aside. She did not scream when they took her. That was the worst part.', { sanity: -10 })),
  ] }),
  E('jh_road_deserter', 'jianghu', { on: 'road', once: false, cd: 5, art: 'road', text: 'A young man in a red Cult tunic sits by the road with his head in his hands. He has torn off his armband. "I ran," he says. "I couldn’t do what they wanted. Kill me if you want to."', choices: [
    C('Give him your spare clothes', O('You gave him your spare clothes and a story to tell. He went south. Years later a farmer in Shu sent you a sack of peppers with no letter.', { rep: { cult: -2 }, sanity: 3 })),
    C('Turn him in to the Alliance', O('The Alliance paid a bounty. You do not like to think about what happened to him.', { wealth: 10, rep: { orthodox: 3 }, sanity: -6 })),
    C('Ask him about the Cult', O('He told you everything he knew about the western passes: where the Cult’s scouts camp, how they signal.', { codex: { id: 'secret.cult_signals', cat: 'secrets', title: 'Cult scouts', text: 'Cult scouts in Guanzhong signal with red cloth on dead trees, and camp in the old salt mines west of Chang’an.' } })),
  ] }),
  E('jh_road_shortcut', 'jianghu', { on: 'road', once: false, cd: 4, text: 'An old woman at a crossroads tells you about a shortcut through the hills. It will save a week, she says. It goes past the old fox shrine.', choices: [
    P('Take the shortcut', 0.6, O('It saved a week. At the fox shrine someone had left fresh plums. You ate one. Nothing bad happened. Probably.', { sanity: 2, fn: (g) => { if (g.life.travel && g.life.travel.left > 1) g.life.travel.left -= 1; } }), O('You got lost for a week. When you finally reached the fox shrine, there was a fox on it, laughing at you. Probably laughing.', { health: -5 })),
    C('Stay on the road', O('You stayed on the road.')),
  ] }),
  E('jh_road_old_master', 'jianghu', { on: 'road', once: false, cd: 6, art: 'road', bind: { x: { age: [55, 85], realm: [3, 6], role: 'acquaintance', aff: 40 } }, text: 'An old traveller with a walking stick asks if he may walk with you for a while. His steps make no sound on the gravel.', choices: [
    C('Walk with him', O('You walked together for three days. He corrected your breathing twice and your manners once, and turned off at a crossroads without saying goodbye.', { meet: 'x', insight: 2, qi: 8 })),
    C('Walk faster', O('You walked faster. Somehow he kept pace without seeming to try.', { meet: 'x' })),
  ] }),
  E('jh_road_beast', 'jianghu', { on: 'road', once: false, cd: 4, danger: true, art: 'forest', text: 'A tiger steps onto the mountain road ahead of you, and sits down, and looks at you.', choices: [
    C('Fight it', O('It stood up.', { combat: { foe: { name: 'a mountain tiger', kind: 'beast', rel: 0 }, context: 'beast', win: { text: 'The tiger lay still. Villagers came out of hiding and named you a hero. The pelt kept you warm for years.', fame: 5, wealth: 15 }, lose: { text: 'You escaped with claw marks you will carry forever.' } } })),
    R('Stare it down', 'sanity', 55, O('You stared. The tiger yawned, stood, and walked off into the trees.', { insight: 1 }), O('The tiger did not care for your staring.', { combat: { foe: { name: 'a mountain tiger', kind: 'beast', rel: 0 }, context: 'beast' } })),
    C('Back away slowly', O('You backed away slowly for a very long time.')),
  ] }),
  E('jh_road_body', 'jianghu', { on: 'road', once: false, cd: 6, art: 'road', text: 'A body in the ditch, a few days old. Robbed. A martial artist, by the calluses.', choices: [
    C('Bury them', O('You buried them. In their sleeve, the robbers missed a slip of paper with a sect seal on it.', { sanity: 2, fame: 1, insight: 1 })),
    C('Search them', O('A few coins the robbers missed. You felt like a crow.', { wealth: 3, sanity: -2 })),
    C('Walk on', O('You walked on. The road is full of the dead.')),
  ] }),

  // ── Arriving somewhere ──────────────────────────────────────────
  E('jh_arrive_pickpocket', 'jianghu', { on: 'arrive', once: false, cd: 3, art: 'city', text: 'A child brushes against you in the crowded gate. A moment later your purse is lighter.', choices: [
    R('Catch the child', 'body', 15, O('You caught a thin wrist. The child glared at you, all bones and defiance.', { next: 'jh_pickpocket_child' }), O('Gone. The city has swallowed child and coins together.', { wealth: -5 })),
    C('Let it go', O('Let it go. Some child eats tonight.', { wealth: -5, sanity: 1 })),
  ] }),
  E('jh_pickpocket_child', 'jianghu', { on: 'scheduled', text: 'The pickpocket is maybe eight, and starving.', choices: [
    C('Buy them a meal and let them keep the coins', O('You bought two bowls of noodles. The child ate both. Ran off without a word. Came back, later, to give you a stolen apple.', { sanity: 3 })),
    C('Take them to the Beggars’ Sect', O('The Beggars’ Sect took the child in. "Another one," said the elder. "Good hands."', { rep: { orthodox: 1 } })),
    C('Hand them to the guards', O('The guards took the child. You do not want to know what happened next.', { sanity: -6 })),
  ] }),
  E('jh_arrive_festival', 'jianghu', { on: 'arrive', once: false, cd: 4, art: 'market', text: 'You arrive in the middle of a festival: drums, lion dancers, firecrackers, and nowhere to sleep.', choices: [
    C('Join the festival', O('You danced, ate, drank and slept in a haystack. Best night in months.', { sanity: 6, health: 2 })),
    C('Find a quiet inn outside the walls', O('Quiet. Expensive. Dull.', { wealth: -3 })),
  ] }),
  E('jh_arrive_wanted', 'jianghu', { on: 'arrive', if: { stat: { infamy: '>=25' } }, once: false, cd: 3, text: 'Your face is on a wanted poster at the city gate. It is not a good likeness, but it is not a bad one either.', choices: [
    C('Pull up your hood and go in', P('Pull up your hood and go in', 0.7, O('Nobody looked twice.'), O('A guard looked twice.', { combat: { foe: { name: 'a city guard', kind: 'soldier', rel: -0.5 }, context: 'duel', win: { text: 'You left the city faster than you came.', infamy: 3 }, lose: { text: 'A night in the cells and a heavy fine.', wealth: -30 } } }))),
    C('Tear the poster down', O('You tore it down. There were six more.', { infamy: 1 })),
  ] }),
  E('jh_arrive_famous', 'jianghu', { on: 'arrive', if: { stat: { fame: '>=40' } }, once: false, cd: 4, text: 'Word of your arrival runs ahead of you. Children follow you through the gate; an innkeeper insists you stay for free; three young fighters want to challenge you.', choices: [
    C('Accept the challenges', O('You beat all three, gently. They will tell their grandchildren.', { fame: 3, body: 1 })),
    C('Accept the free room', O('Free rooms taste better than paid ones.', { wealth: 5 })),
  ] }),

  // ── Wandering (the Wander activity) ─────────────────────────────
  E('jh_wander_inn_brawl', 'jianghu', { on: 'wander', once: false, cd: 3, art: 'inn', text: 'In a roadside inn two drunk swordsmen start a brawl over a spilled cup of wine. Tables fly.', choices: [
    C('Join in', O('You joined in, for reasons you could not explain afterwards. Everyone ended up on the floor laughing, and the innkeeper made you all pay.', { wealth: -4, body: 1, charm: 1 })),
    R('Stop the fight', 'power', 20, O('You caught both their wrists at once. The inn went silent. Then someone bought you a drink.', { fame: 2 }), O('You got a bench across the back for your trouble.', { health: -6 })),
    C('Eat your noodles', O('You ate your noodles. They were good noodles.', { health: 2 })),
  ] }),
  E('jh_wander_escort_hire', 'jianghu', { on: 'wander', once: false, cd: 4, if: { age: [15, 60] }, text: 'The Dragon-Tiger Escort Agency is short of guards for a run to the coast. Chief Pyo Gwang looks you over. "Can you hold a spear? Can you keep your mouth shut?"', choices: [
    C('Sign on for the run', P('Sign on for the run', 0.7, O('The run went smoothly. Pyo Gwang paid you and said, "Come back if you want work." From him, that is a speech.', { wealth: 15, meet: '@escort_chief', rel: { '@escort_chief': { res: 10 } } }), O('Ambush at the river crossing.', { meet: '@escort_chief', combat: { foe: { name: 'a river pirate', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.3, win: { text: 'You held the crossing. Pyo Gwang paid you double and bought you wine.', wealth: 30, rel: { '@escort_chief': { res: 20 } } }, lose: { text: 'The cargo was lost. Pyo Gwang paid you anyway, which made it worse.', wealth: 5 } } }))),
    C('Decline', O('You declined. Pyo Gwang shrugged.')),
  ] }),
  E('jh_wander_hermit', 'jianghu', { on: 'wander', once: false, cd: 6, art: 'mountain', text: 'You climb a hill you have never climbed and find a hermit’s hut at the top. The hermit is out. There is tea, still warm, and a note: "Help yourself."', choices: [
    C('Drink the tea and wait', O('The hermit never came back. The tea was extraordinary. Something in it made your qi run warm for days.', { qi: 10, sanity: 3 })),
    C('Leave a gift in return', O('You left a little silver. When you came back months later, the silver was gone and there was a new note: "Better tea next time." You laughed all the way down.', { wealth: -2, sanity: 4 })),
  ] }),
  E('jh_wander_duel_watch', 'jianghu', { on: 'wander', once: false, cd: 4, art: 'duel', text: 'On a bridge, two masters of different sects are dueling with an audience of farmers and a goat.', choices: [
    C('Watch and learn', O('You watched every move. One of them had a habit of dropping his left shoulder. You will remember that kind of thing from now on.', { insight: 2, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 4); } })),
    C('Bet with the farmers', P('Bet with the farmers', 0.5, O('Your man won. The farmers paid in eggs.', { health: 2 }), O('Your man fell off the bridge. The goat seemed pleased.', { wealth: -2 }))),
  ] }),
  E('jh_wander_ghost_market', 'crime', { on: 'wander', if: { loc: 'kaifeng' }, once: false, cd: 3, art: 'night', title: 'The Ghost Market', text: 'At midnight the lanterns of the Ghost Market light up under the old city wall. Everything is for sale here: stolen manuals, poisons, secrets, people.', choices: [
    Q('Buy a stolen manual (80 taels)', { stat: { wealth: '>=80' } }, O('The manual was real. Probably stolen from someone who will want it back.', { wealth: -80, fn: (g) => { const pool = ['uno_ghost_step', 'uno_blood_saber', 'med_five_venoms', 'kong_seven_injuries', 'uno_silent_needle']; const m = g.rng.pick(pool.filter((x) => !(x in g.life.manuals))); if (m) g.learnManual(m); }, infamy: 2 })),
    Q('Buy a secret (30 taels)', { stat: { wealth: '>=30' } }, O('A hooded broker sold you a secret about someone powerful. It was even true.', { wealth: -30, fn: (g) => { const secrets = ['secret.gu_debts', 'secret.alliance_list', 'secret.cult_signals']; const s = g.rng.pick(secrets); if (!g.remembers(s)) g.remember(s); } })),
    C('Just look', O('You walked the stalls until dawn and bought a candied plum. Even in the Ghost Market, there are candied plums.', { insight: 1 })),
  ] }),
  E('jh_wander_village_wedding', 'jianghu', { on: 'wander', once: false, cd: 5, art: 'wedding', text: 'You stumble into a village wedding. Nobody knows who you are. Everyone insists you eat.', choices: [C('Eat', O('You ate, drank, sang badly, and were thanked by the bride’s grandmother for bringing luck. You hope you did.', { sanity: 5, health: 2 }))] }),
  E('jh_wander_lost_sect', 'jianghu', { on: 'wander', once: false, cd: 8, art: 'temple', text: 'Deep in the hills you find the ruins of a sect nobody remembers: a cracked training ground, a collapsed hall, and a stone tablet worn smooth.', choices: [
    R('Study the tablet', 'insight', 30, O('Under moss, faint carvings: a breathing exercise. It is old and strange and it works.', { qi: 12, insight: 2 }), O('Whatever was written here is gone.')),
    C('Rest in the ruins', O('You slept in the old hall under the stars. You dreamed of disciples training, long ago.', { sanity: 3 })),
  ] }),
  E('jh_wander_rescue', 'jianghu', { on: 'wander', once: false, cd: 4, danger: true, text: 'Screams from a farmhouse: bandits are dragging out a family.', choices: [
    C('Charge in', O('You charged.', { combat: { foe: { name: 'the raiders’ leader', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.3, win: { text: 'The bandits fled. The family offered you everything they had. You took a meal.', fame: 4, rep: { orthodox: 2 } }, lose: { text: 'You were beaten and the farm was robbed. At least the family lived.', fame: 1 } } })),
    C('Go for the village militia', P('Go for the village militia', 0.6, O('You ran for help and came back with twenty farmers with pitchforks. The bandits did not wait to argue.', { fame: 2 }), O('By the time you came back with help, it was over.', { sanity: -5 }))),
  ] }),
  E('jh_wander_peddler', 'jianghu', { on: 'wander', once: false, cd: 3, art: 'market', text: 'A travelling peddler unrolls his mat: herbs, needles, charms, and a "genuine fragment of the Heavenly Demon’s fingernail."', choices: [
    Q('Buy herbs for your health (6 taels)', { stat: { wealth: '>=6' } }, O('The herbs were real. You felt better for weeks.', { wealth: -6, health: 10 })),
    Q('Buy the fingernail (2 taels)', { stat: { wealth: '>=2' } }, O('It is almost certainly a goat’s toenail. You love it.', { wealth: -2, sanity: 2 })),
    C('Haggle for fun', O('You haggled for an hour and bought nothing. The peddler enjoyed it as much as you did.', { charm: 1 })),
  ] }),
  E('jh_wander_sick_village', 'jianghu', { on: 'wander', once: false, cd: 6, art: 'plague', text: 'A village with a fever going through it. People look at you from doorways with hollow eyes.', choices: [
    R('Help with what medicine you know', 'insight', 28, O('You knew enough. The fever broke in a week. They will remember you.', { fame: 4, insight: 2 }), O('You knew too little, and caught it yourself.', { health: -20 })),
    Q('Leave money for a physician (20 taels)', { stat: { wealth: '>=20' } }, O('The physician came. Most of them lived.', { wealth: -20, fame: 2 })),
    C('Keep walking', O('You kept walking. You could not save everyone. You remind yourself of that often.', { sanity: -3 })),
  ] }),
  E('jh_wander_sunrise', 'jianghu', { on: 'wander', once: false, cd: 3, art: 'mountain', text: 'You climbed a peak in the dark and reached the top just as the sun came up over a sea of clouds.', choices: [C('Watch it rise', O('For a while, nothing else mattered.', { sanity: 6, insight: 1 }))] }),
  E('jh_wander_drunk_poet', 'jianghu', { on: 'wander', once: false, cd: 5, art: 'moon', text: 'A drunk poet on a riverboat is reciting to the moon. He invites you aboard.', choices: [
    C('Drink with him', O('He wrote a poem about you. It was very flattering and rhymed "sword" with "bored." It will be quoted in teahouses for years.', { fame: 3, charm: 1, health: -2 })),
    C('Recite one back', R('Recite one back', 'insight', 22, O('You recited a poem you remembered from somewhere. He wept. "Who wrote that?" You could not say.', { fame: 2, charm: 2 }), O('You forgot the second line. He finished it for you, better.', { charm: 1 }))),
  ] }),
  E('jh_wander_bridge_toll', 'jianghu', { on: 'wander', once: false, cd: 5, art: 'river', text: 'A huge man stands in the middle of a narrow bridge. "Nobody crosses without beating me," he announces. Behind you, a long queue of farmers sighs.', choices: [
    C('Beat him', O('You stepped onto the bridge.', { combat: { foe: { name: 'the bridge brute', kind: 'brawler', rel: -0.5 }, context: 'duel', win: { text: 'He fell in the river. The farmers cheered. He climbed out and asked to be your disciple. You said no.', fame: 2 }, lose: { text: 'You fell in the river. The farmers sighed.', fame: -1 } } })),
    C('Talk to him', O('It turned out he was lonely and his sect had thrown him out. You talked for an hour. He let everyone cross.', { charm: 1, sanity: 2 })),
  ] }),
];
