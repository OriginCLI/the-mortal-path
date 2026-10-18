// Sect life: joining, chores and duties, exams and promotions, politics, punishments, succession,
// and each great organization's own flavour. Also the Mount Hua traitor thread.
import { E, O, C, R, P, M, Q, L, LATER } from './kit.js';

const IN = (s) => ({ sect: s });
const ORTHO = { faction: 'orthodox' };

export default [
  // ── Joining by other doors ──────────────────────────────────────
  E('sc_wudang_trial', 'sect', { if: { age: [6, 16], loc: 'wudang', sect: 'none' }, art: 'temple', title: 'The Wudang steps', text: 'A Daoist at the foot of the Wudang steps says anyone may climb them. Few reach the top before sunset, and only those are accepted.', choices: [
    R('Climb', 'body', 16, O('You reached the Golden Summit as the sun touched the peaks, shaking and grinning. A Daoist handed you a grey robe without a word.', { join: 'wudang' }), O('You reached the top an hour after sunset. The Daoist shook his head kindly and gave you a bun for the walk down.', { body: 1 })),
    C('Ask the Daoist why the steps matter', O('"They don’t," he said. "But the people who reach the top think they do, and that is useful." You liked him, and left.', { insight: 2 })),
  ] }),
  E('sc_emei_trial', 'sect', { if: { age: [6, 16], loc: 'emei', sect: 'none', gender: 'f' }, art: 'temple', text: 'At the Golden Summit of Emei, a nun pours you a cup of tea and asks you to hold it, full, without spilling, until the bell rings.', choices: [
    R('Hold the cup', 'sanity', 55, O('The bell rang at dusk. Not a drop had spilled. The nun took the cup and drank it, cold. "Welcome," she said.', { join: 'emei' }), O('Your arm shook. Tea spilled. "Come back when your heart is quieter," she said.')),
  ] }),
  E('sc_kunlun_trial', 'sect', { if: { age: [6, 16], loc: 'kunlun', sect: 'none' }, art: 'snow', text: 'Kunlun accepts disciples who can reach the sect gate through the snowfield without a guide. Many try. Some are found in spring.', choices: [
    R('Cross the snowfield', 'body', 22, O('You crossed it in two days, frostbitten and stubborn. The gate opened before you knocked.', { join: 'kunlun', health: -10 }), O('You turned back on the first night, half-frozen. A Kunlun disciple found you and carried you down without a word.', { health: -20 })),
    C('Turn back', O('You turned back. Snow does not care how brave you are.')),
  ] }),
  E('sc_greenforest_join', 'crime', { if: { age: [14, 40], loc: 'taihang', sect: 'none' }, text: 'Bandits stop you on a mountain road. Their captain looks you over. "We could kill you," he says, "or you could join us. The Green Forest takes anyone who can hold a blade and keep a secret."', choices: [
    C('Join the Green Forest', O('You drank wine mixed with blood from a common bowl and became a sworn brother of the Green Forest Alliance.', { join: 'greenforest', infamy: 5, rep: { unorthodox: 10, orthodox: -5 } })),
    R('Refuse and fight your way out', 'power', 30, O('You cut your way through and ran. They will remember your face.', { infamy: 1, rep: { unorthodox: -5 } }), O('They beat you, robbed you and let you go, laughing.', { wealth: -10, health: -15 })),
    C('Refuse politely', P('Refuse politely', 0.5, O('The captain laughed. "Polite! Go on, then." He let you go.', { charm: 1 }), O('"Politeness costs extra," he said, and took your purse.', { wealth: -8 }))),
  ] }),
  E('sc_depot_recruit', 'sect', { if: { age: [16, 40], loc: 'capital', sect: 'none', stat: { body: '>=25' } }, art: 'palace', text: 'An Eastern Depot officer watched you in the training yard. "The Emperor needs people who can fight and keep their mouths shut," he said. "The pay is good. The questions are few."', choices: [
    C('Accept', O('You put on the black and silver uniform of the Eastern Depot. People step aside for you in the street now. They do not smile.', { join: 'easterndepot', rep: { court: 15, orthodox: -5 } })),
    C('Decline', O('He shrugged. "Everyone says no once," he said.')),
  ] }),
  E('sc_guild_join', 'sect', { if: { age: [12, 40], loc: 'hangzhou', sect: 'none', stat: { charm: '>=15' } }, text: 'A clerk of the Golden Abacus Guild offers you an apprenticeship: room, board, and a share of whatever you can sell.', choices: [
    C('Sign the contract', O('You signed. The contract was eleven pages long and you read every word, which impressed them more than anything else.', { join: 'goldenabacus', rep: { merchants: 10 } })),
    C('Read the contract and refuse', O('Page nine said they owned your children. You declined.', { insight: 1 })),
  ] }),
  E('sc_cult_recruit', 'sect', { if: { age: [14, 40], sect: 'none', region: 'west', stat: { infamy: '>=10' } }, art: 'demonic', text: 'A woman in red finds you at an inn near the western passes. "The orthodox world has no place for people like you," she says. "The Heavenly Demon has a place for everyone strong."', choices: [
    C('Follow her into the mountains', O('You walked for a week into the Ten Thousand Mountains and knelt before the red banners. You are a Believer of the Heavenly Demon Divine Cult.', { join: 'cult', rep: { cult: 15, orthodox: -15 }, travel: 'tenthousand' })),
    C('Refuse', O('"The offer stays open," she said. "Until it doesn’t."')),
  ] }),
  E('sc_family_adopt', 'sect', { if: { age: [8, 20], loc: ['moyong', 'paeng', 'jegal', 'dangclan'], sect: 'none', stat: { insight: '>=20' } }, art: 'estate', text: 'A Family elder has noticed you around the estate. The Families sometimes take in promising outsiders as retainers, and occasionally, much later, as kin.', choices: [
    R('Offer your service', 'charm', 18, O('The elder looked you over and nodded. You are a retainer of the Family now, with a cot in the servants’ hall and the right to watch the training yard.', { fn: (g) => g.joinSect(g.loc.sect, 0) }), O('"Not yet," the elder said.')),
    C('Keep your freedom', O('You kept your freedom, and your cot under the stars.')),
  ] }),

  // ── New disciple ────────────────────────────────────────────────
  E('sc_first_day', 'sect', { if: { faction: ['orthodox', 'families'], rank: 0, age: [6, 20], fn: (g) => g.life.turn - (g.life.joinedTurn || 0) < 8 }, text: 'Your first season as a disciple: water to carry, floors to scrub, and seniors who seem to have been born knowing everything.', choices: [
    C('Work harder than anyone', O('You scrubbed until your knees bled. An elder walking past slowed down, just a little.', { merit: 6, body: 1 })),
    C('Find the shortcut', O('You discovered the kitchen does not count buckets, only full barrels. You were finished by noon. A senior noticed, and was annoyed, and impressed.', { merit: 3, insight: 1 })),
    C('Make friends with the other new disciples', O('You made friends. Misery shared is misery halved, and gossip doubled.', { charm: 1, merit: 2 })),
  ] }),
  E('sc_night_training', 'sect', { if: { rank: [0, 1], age: [8, 25], faction: ['orthodox', 'families', 'cult'] }, once: false, cd: 3, text: 'You slipped into the training yard at night, when no seniors were watching, and drilled alone under the moon.', choices: [
    C('Drill until dawn', O('You drilled until dawn and fell asleep in the morning lecture. Worth it.', { body: 1.5, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 6); } })),
    C('Meditate instead', O('You sat under the moon and breathed until the cold could not reach you.', { qi: 8 })),
  ] }),
  E('sc_chores_master', 'sect', { if: { rank: [0, 1], age: [8, 25] }, once: false, cd: 4, text: 'You have been assigned to chores again: chopping wood for the kitchen, a hundred logs a day.', choices: [
    C('Chop with your arts', O('You chopped using your sword forms. The logs came out in perfect halves. You were scolded for wasting forms on firewood, and secretly praised.', { body: 1, merit: 2, fn: (g) => { const f = g.trainingFocus(); if (f) g.addMastery(f, 3); } })),
    C('Chop properly', O('You chopped properly, a hundred logs a day, until your hands knew the axe better than your own face.', { body: 2, merit: 3 })),
    C('Skip it', P('Skip it', 0.5, O('Nobody noticed. This time.', { merit: -1 }), O('Your senior noticed. You chopped two hundred logs a day for a month.', { merit: -3, body: 2 }))),
  ] }),
  E('sc_lecture', 'sect', { if: { rank: [0, 2], age: [8, 30] }, once: false, cd: 3, text: 'An elder lectured on the heart method in the main hall. Half the disciples were asleep.', choices: [
    R('Listen closely', 'insight', 15, O('One line caught in your mind like a fishhook. That night your qi moved more smoothly than it had in months.', { insight: 2, qi: 6, merit: 1 }), O('You listened closely and understood almost nothing. Still, you wrote it down.', { insight: 1 })),
    C('Ask a question', O('You asked a question the elder could not answer. He looked at you for a long time, then said, "Come to my quarters tomorrow."', { merit: 4, flag: 'sc.elder_noticed' })),
    C('Sleep', O('You slept. You dreamed of dumplings.', { sanity: 2 })),
  ] }),
  E('sc_elder_quarters', 'sect', { if: { flag: 'sc.elder_noticed', rank: [0, 2] }, text: 'The elder who noticed your question pours tea and asks you what you think the heart method is for.', choices: [
    C('"To grow strong"', O('He nodded. "Everyone says that." He taught you nothing, and watched you a little more.', { merit: 2 })),
    C('"To stay alive"', O('He laughed. "Honest." He corrected your breathing, and your qi felt clearer for a month.', { qi: 10, merit: 3 })),
    C('"I don’t know yet"', O('"Good," he said. "Then you might learn something." From then on, you had tea with him every month.', { insight: 3, merit: 4 })),
  ] }),
  E('sc_sect_competition', 'tournament', { if: { rank: [0, 2], age: [10, 30], realm: '>=1', faction: ['orthodox', 'families', 'cult', 'unorthodox'] }, once: false, cd: 3, art: 'tournament', title: 'Inner-sect competition', text: 'The sect holds its yearly competition. Win, and you will be noticed. Lose badly, and you will be noticed too.', choices: [
    C('Compete', O('You stepped onto the platform.', { combat: { foe: { name: 'a fellow disciple', kind: 'disciple', rel: 0 }, context: 'spar', win: { text: 'You won your bracket. The elders wrote your name down.', merit: 15, fame: 2 }, lose: { text: 'You lost in the second round. Your senior told you that you had potential, which means you lost.', merit: 3 } } })),
    C('Watch and learn', O('You watched every bout and learned more about your seniors than they would like.', { insight: 1, merit: 1 })),
  ] }),
  E('sc_promotion_exam', 'sect', { if: { rank: 0, age: [12, 40], realm: '>=1', fn: (g) => g.life.merit >= 25 } , text: 'You are summoned to the Hall of Precepts. Three elders are waiting. It is the examination for inner disciples.', choices: [
    R('Demonstrate your art', 'power', 24, O('The elders conferred in whispers. Then the eldest nodded. "Inner disciple." It is the first time anyone has bowed back to you.', { rank: 1, fame: 2 }), O('"Not yet," they said. "Come back when your sword speaks for itself."', { merit: -5 })),
    R('Recite the precepts', 'insight', 22, O('You recited every precept, and then explained what three of them actually meant. They promoted you, a little warily.', { rank: 1 }), O('You forgot the seventh precept. It was the one about humility.')),
  ] }),
  E('sc_direct_disciple', 'sect', { if: { rank: 1, age: [16, 50], realm: '>=3', fn: (g) => g.life.merit >= 80 }, text: 'An elder offers to take you as a direct disciple, which would make you one of the sect’s inheritors.', choices: [
    C('Kneel and accept', O('You knelt and touched your head to the floor three times. The sect will teach you its true arts now.', { rank: 1, merit: 5 })),
    C('Decline; you want to choose your own master', O('The elder was offended, then amused. "You will be back," he said.', { merit: -10 })),
  ] }),
  E('sc_elder_seat', 'sect', { if: { rank: 2, realm: '>=4', age: [25, 120], fn: (g) => g.life.merit >= 180 }, title: 'A seat in the Hall', text: 'The Sect Leader summons you. An elder has died, and a seat in the Hall of Elders is empty.', choices: [
    C('Accept the seat', O('You are an Elder now. Disciples bow when you pass. It is lonelier than you expected.', { rank: 1, fame: 5 })),
    C('Refuse; you are not ready', O('"Nobody is ever ready," the Sect Leader said. He gave the seat to someone else, and you to more duties.', { merit: 10 })),
  ] }),
  E('sc_succession', 'sect', { if: { rank: 3, realm: '>=6', age: [30, 250] }, title: 'Succession', art: 'temple', text: 'The leader of your sect is dying. In the Hall of Elders, everyone is looking at you, and some of them are looking at you with knives in their eyes.', choices: [
    R('Accept the leadership', 'fame', 40, O('The Hall bowed. You lead the sect now: its debts, its feuds, its children. The weight settled on your shoulders like a mountain.', { rank: 1, fame: 15, achieve: 'sect_leader' }), O('The Hall chose another. You bowed, and meant it, mostly.', { merit: 20 })),
    C('Support another candidate', O('You threw your support behind a younger elder. The sect was spared a war. You were spared a crown.', { merit: 30, sanity: 5 })),
  ] }),
  E('sc_mission_bandits', 'sect', { if: { rank: [0, 3], age: [14, 60], realm: '>=1', faction: ['orthodox', 'families'] }, once: false, cd: 3, danger: true, text: 'The sect sends you to clear out a bandit camp that has been taxing pilgrims on the road.', choices: [
    C('Lead the attack', O('You found the camp at dusk.', { combat: { foe: { name: 'the bandit chief', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.3, win: { text: 'The camp was cleared. The pilgrims sent the sect a pig.', merit: 12, fame: 3, rep: { orthodox: 3 } }, lose: { text: 'You were driven off. The sect sent someone else.', merit: -4 } } })),
    R('Negotiate them out of the valley', 'charm', 25, O('You convinced the bandits that the next people the sect sent would not be as friendly. They moved on.', { merit: 8, charm: 1 }), O('They laughed at you, and then they did not laugh, and you had to fight anyway.', { combat: { foe: { name: 'a bandit', kind: 'bandit', rel: -0.5 }, context: 'ambush', lethal: 0.2, win: { text: 'You won, and left.', merit: 5 } } })),
  ] }),
  E('sc_mission_escort', 'sect', { if: { rank: [1, 3], age: [16, 60], faction: ['orthodox', 'families'] }, once: false, cd: 4, text: 'You are sent to escort a young disciple of an allied sect home across three provinces.', choices: [
    C('Take the main roads', O('Long, dull, safe. You delivered the disciple home and were given a jade token of thanks.', { merit: 8, item: { jade_pendant: 1 } })),
    C('Take the mountain shortcut', P('Take the mountain shortcut', 0.6, O('You saved a month and saw the most beautiful valley of your life.', { merit: 10, sanity: 3 }), O('Bandits. You fought them off, but the disciple was wounded, and you were blamed.', { merit: 2, combat: { foe: { name: 'a mountain bandit', kind: 'bandit', rel: 0 }, context: 'ambush', lethal: 0.2 } }))),
  ] }),
  E('sc_punishment', 'sect', { if: { rank: [0, 2], age: [8, 30], chance: 0.6 }, once: false, cd: 5, text: 'You broke a sect rule: out after the bell, or fighting in the yard, or something worse. You are called before the Discipline Hall.', choices: [
    C('Accept the punishment', O('Thirty days facing the wall in the Hall of Repentance. You meditated. It was, secretly, the best month of your training.', { qi: 10, merit: -3 })),
    R('Argue your case', 'charm', 20, O('You argued so well the elder halved your punishment and wrote down your reasoning for the sect records.', { charm: 1, merit: -1 }), O('Arguing doubled it.', { merit: -6 })),
    C('Blame someone else', O('Someone else was punished. You were not caught. You were not proud.', { sanity: -3, infamy: 1 })),
  ] }),
  E('sc_scripture_pavilion', 'sect', { if: { rank: [1, 3], faction: ['orthodox', 'families'], age: [14, 60] }, art: 'library', text: 'You have been given access to the lower floors of the sect library. The upper floors are locked; the key is with the Sect Leader.', choices: [
    C('Read everything you are allowed to', O('You read until your eyes ached. A forgotten commentary on your heart method explained something your master never had.', { insight: 3, qi: 8 })),
    R('Pick the lock to the upper floor', 'insight', 35, O('The upper floor held the sect’s true treasures. You read one scroll before you heard footsteps.', { insight: 4, flag: 'sc.read_forbidden' }), O('You were caught at the lock. Expulsion was discussed. Thirty days of repentance were agreed on.', { merit: -15 })),
  ] }),
  E('sc_sect_feud', 'sect', { if: { rank: [1, 3], faction: 'orthodox', age: [16, 60] }, once: false, cd: 5, text: 'A dispute with a rival sect over a mountain spring has turned ugly. Their disciples are waiting at the boundary stone.', choices: [
    C('Stand with your sect', O('You stood at the boundary.', { combat: { foe: { name: 'a rival sect disciple', kind: 'disciple', rel: 0 }, context: 'duel', win: { text: 'The rival sect withdrew. Your seniors clapped you on the back.', merit: 10, fame: 2 }, lose: { text: 'You lost, and your sect lost face. Your seniors were very quiet on the walk back.', merit: -2 } } })),
    R('Propose sharing the spring', 'charm', 28, O('Both sects grumbled, and both agreed. The spring runs for everyone now, and both sects claim credit.', { merit: 12, rep: { orthodox: 4 } }), O('Both sides called you a coward.', { merit: -3 })),
  ] }),
  E('sc_sect_poor', 'sect', { if: { sect: ['mounthua', 'beggars', 'kongtong', 'diancang'], rank: [1, 4], age: [16, 80] }, once: false, cd: 6, text: 'The sect treasury is empty again. Disciples are eating gruel. The elders are arguing about what to sell.', choices: [
    Q('Donate 50 taels', { stat: { wealth: '>=50' } }, O('You quietly left fifty taels with the treasurer. The disciples ate rice that winter, and never knew why.', { wealth: -50, merit: 20 })),
    C('Take a mercenary job to raise money', O('You guarded a salt merchant for a season and brought the money home.', { merit: 10, wealth: 5, rep: { merchants: 2 } })),
    C('Suggest the elders sell less and spend less', O('The elders did not like being told about money by a disciple. The treasurer did.', { merit: 2 })),
  ] }),

  // ── Mount Hua: the debts, the traitor, the Blood Night ─────────
  E('sc_hua_traitor_debts', 'sect', { if: { year: [20, 33], loc: 'kaifeng' }, art: 'night', text: 'In a gambling den of the Ghost Market, you see a familiar face: a Mount Hua elder, Gu Dal-pyeong, losing a fortune he does not have to men who do not forgive debts.', choices: [
    C('Watch him', O('You watched him sign a debt note with a hand that shook. Later, a man in red spoke to him in a corner. The man in red was not a gambler.', { codex: { id: 'secret.gu_debts', cat: 'secrets', title: 'Elder Gu’s debts', text: 'Mount Hua’s Elder Gu Dal-pyeong owes a fortune in the Kaifeng Ghost Market, and the Cult has bought his debts. That is how they get the Plum Blossom Path.' } })),
    C('Leave; not your business', O('You left. It was not your business. Yet.')),
  ] }),
  E('sc_hua_expose', 'sect', { if: { year: [20, 33], loc: 'mounthua', mem: 'secret.gu_debts', not: 'traitor.exposed', alive: 'hua_traitor' }, art: 'temple', title: 'The traitor', text: 'You know what Elder Gu Dal-pyeong owes, and to whom. The Sect Leader is in the main hall. Gu is standing beside him, smiling.', choices: [
    R('Accuse Gu before the whole sect', 'fame', 25, O('You laid it out: the Ghost Market, the debt notes, the man in red. The Sect Leader sent disciples to Kaifeng. They came back with the notes. Gu Dal-pyeong was stripped of his rank and sealed in the Hall of Repentance. The Plum Blossom Path has new guards.', { flag: 'traitor.exposed', merit: 50, fame: 10, rel: { '@hua_leader': { res: 30 } }, gaze: 1 }), O('Gu smiled and asked for proof. You had only memories. You were disciplined for slander, and Gu began to watch you.', { merit: -20, flag: 'gu.wary' })),
    R('Tell the Sect Leader privately', 'charm', 22, O('Hyeon Mu-gyeong listened without interrupting. Then he said, very tiredly, "I have wondered about him for years." The investigation was quiet, and thorough. Gu was exposed.', { flag: 'traitor.exposed', merit: 30, rel: { '@hua_leader': { res: 20, aff: 10 } }, gaze: 1 }), O('The Sect Leader could not believe it of an old friend. He asked you to say nothing more.', { flag: 'hua.leader_doubts' })),
    C('Confront Gu alone', O('You found Gu in his quarters at night.', { combat: { foe: '@hua_traitor', context: 'duel', important: true, lethal: 0.3, win: { text: 'He confessed everything, bleeding, before the Sect Leader. The Plum Blossom Path will be guarded now.', flag: 'traitor.exposed', merit: 40, fame: 8, gaze: 1 }, lose: { text: 'He beat you, and smiled, and told the Sect Leader you had attacked him in a jealous rage.', merit: -30 } } })),
  ] }),
  E('sc_hua_path', 'timeline', { if: { year: [25, 33], mem: 'timeline.blood_night', not: 'traitor.exposed', sect: 'mounthua' }, text: 'You remember how the Cult came in: up the Plum Blossom Path, the old secret path behind the eastern peak.', choices: [
    R('Persuade the elders to guard it', 'fame', 30, O('The elders were puzzled why a disciple cared so much about a goat track, but posted guards to humour you. That spring the Cult found the path guarded, and turned back.', { avert: 'blood_night', merit: 40, gaze: 1 }), O('"Nobody even remembers that path," they said. Exactly, you thought.')),
    C('Booby-trap it yourself', O('You spent a season digging pit traps and stringing bells along the path. Disciples thought you had gone mad.', { flag: 'hua.path_trapped', merit: 5 })),
  ] }),
  E('sc_hua_revival', 'sect', { if: { sect: 'mounthua', rank: [2, 4], averted: 'blood_night', year: [36, 80] }, title: 'The plum blossoms', art: 'blossom', text: 'Mount Hua survived the war that broke every other sect’s back. Young people climb the thousand steps every spring now. Merchants come up the mountain to sell, not to collect.', choices: [C('Watch the new disciples', O('You watched them drill in the snow under the plum trees, clumsy and loud. One of them, a girl with a crooked sword, reminded you of yourself.', { sanity: 10, fame: 10, merit: 20 }))] }),
  E('sc_hua_after', 'war', { if: { happened: 'blood_night', year: [34, 45], rep: { orthodox: '>=0' } }, text: 'Mount Hua is ash and wild goats. A few survivors are rebuilding one hall, stone by stone.', choices: [
    C('Help them rebuild', O('You hauled stones all season. On the last day, someone planted a plum seedling in the courtyard.', { fame: 3, body: 2, rep: { orthodox: 4 } })),
    C('Walk past', O('You walked past. Some ruins are not yours to rebuild.')),
  ] }),

  // ── Shaolin, Wudang, Emei, Kunlun ───────────────────────────────
  E('sc_shao_sweeper', 'fortune', { if: { sect: 'shaolin', age: [10, 60], alive: 'sweeping_monk' }, art: 'temple', text: 'An old monk sweeps the courtyard of the Scripture Pavilion every morning. His broom never seems to touch the ground, and no leaf ever stays on the stones.', choices: [
    C('Sweep beside him', O('You swept beside him for a season without a word. On the last day he said, "Your broom is too heavy," and tapped your wrist. Something in your meridians unknotted.', { meet: '@sweeping_monk', qi: 15, rel: { '@sweeping_monk': { aff: 20, res: 10 } } })),
    C('Ask him to teach you', O('"Teach you to sweep?" he said. "Gladly." You swept for a year.', { meet: '@sweeping_monk', body: 2, rel: { '@sweeping_monk': { aff: 10 } } })),
  ] }),
  E('sc_shao_meat', 'sect', { if: { sect: 'shaolin', age: [8, 30] }, text: 'Your fellow novice Il-gak has smuggled a roast chicken into the dormitory. Shaolin monks do not eat meat.', choices: [
    C('Share it', O('You shared it under a blanket, laughing. Il-gak swore you to secrecy with grease on his fingers. Friends for life.', { meet: '@ilgak', rel: { '@ilgak': { aff: 25, role: 'friend' } } })),
    C('Report him', O('Il-gak swept the courtyard for a month. He forgave you within a week, which was worse.', { meet: '@ilgak', merit: 2, rel: { '@ilgak': { aff: -5 } } })),
  ] }),
  E('sc_wu_cheongun', 'fortune', { if: { sect: 'wudang', age: [10, 60], alive: 'cheongun' }, text: 'An ancient Daoist in a patched robe is feeding the carp in the pond. Every disciple bows as they pass. He is Cheong-un, the Pure Cloud.', choices: [
    C('Feed the carp with him', O('He did not say a word all afternoon. At sunset he said, "The carp do not try to swim. They swim." It made no sense. Then, a month later, it did.', { meet: '@cheongun', insight: 4, qi: 8 })),
    C('Ask him to spar', O('He laughed until he had to sit down. Then he poked you once with a finger and you sat down too, for an hour.', { meet: '@cheongun', rel: { '@cheongun': { aff: 15 } } })),
  ] }),
  E('sc_emei_hye', 'bonds', { if: { sect: 'emei', age: [10, 30] }, text: 'Gang Hye-ryeong, the fiercest disciple of your year, challenges anyone who lands a hit on her to a second duel. Nobody has ever won the second duel.', choices: [
    C('Land a hit', O('You landed a hit. She challenged you to the second duel, which you lost spectacularly. Then she cooked you dinner. That is apparently how friendships start with her.', { meet: '@hyeryeong', rel: { '@hyeryeong': { aff: 20, res: 15, role: 'friend' } } })),
    C('Avoid her', O('You avoided her. She noticed, and was offended.', { meet: '@hyeryeong', rel: { '@hyeryeong': { aff: -5 } } })),
  ] }),
  E('sc_kunlun_lotus', 'fortune', { if: { sect: 'kunlun', flag: 'w.lotus', noItem: 'snow_lotus', age: [14, 80] }, art: 'snow', text: 'The Snow Lotus has bloomed on the north face. Kunlun disciples are forbidden to pick it; it belongs to the sect.', choices: [
    C('Obey the rule', O('You obeyed. The Sect Leader gave you one petal for your loyalty. It was enough to warm you for a whole winter.', { merit: 10, health: 15 })),
    R('Pick one in secret', 'body', 30, O('You climbed the north face at night and picked a Snow Lotus. Its cold burned your fingers for a week.', { item: { snow_lotus: 1 }, merit: -5 }), O('You fell. You lived. Barely.', { health: -30 })),
  ] }),

  // ── The Beggars’ Sect ───────────────────────────────────────────
  E('sc_beg_network', 'sect', { if: { sect: 'beggars', age: [10, 70] }, once: false, cd: 4, text: 'Word moves through the Beggars’ Sect faster than horses. Today a Six-Pouch elder wants you to listen at a certain inn.', choices: [
    C('Listen', O('You sat outside the inn with your bowl for three days. A merchant boasted about smuggling salt for the Water Fortress. The elder was pleased.', { merit: 8, insight: 1, rep: { orthodox: 1 } })),
    C('Ask why', O('"Because everything is connected," the elder said. "And because I said so."', { merit: 2 })),
  ] }),
  E('sc_beg_chief', 'fortune', { if: { sect: 'beggars', rank: '>=2', alive: 'beggar_chief', noManual: 'beg_dragon_palms' }, text: 'The Clan Chief, Hong Chil the Nine-Fingered Beggar, has invited you to share a roast duck behind the Luoyang drum tower.', choices: [
    C('Cook the duck for him', O('You cooked it exactly the way he likes, crispy skin, too much salt. He ate in silence, then wiped his fingers and said, "Fine. I will show you one palm." He showed you three.', { meet: '@beggar_chief', manual: 'beg_dragon_palms', rel: { '@beggar_chief': { aff: 20 } } })),
    C('Eat it with him', O('You ate and talked until dawn. He told you stories about the old Sword Saint that no one else knows.', { meet: '@beggar_chief', rel: { '@beggar_chief': { aff: 15 } }, insight: 2 })),
  ] }),

  // ── The Families ────────────────────────────────────────────────
  E('sc_nam_politics', 'sect', { if: { sect: 'namgung', age: [14, 60] }, once: false, cd: 5, art: 'estate', text: 'The Namgung main family and the branches are quarrelling again over who inherits a set of rice fields.', choices: [
    C('Side with the main family', O('You sided with power. Power remembered you, a little.', { merit: 8, rep: { families: 3 } })),
    C('Side with the branches', O('The branches will remember. So will the main family.', { merit: -2, charm: 1 })),
    R('Propose a compromise', 'insight', 26, O('Your compromise satisfied nobody completely, which is the definition of a good compromise. Both sides respected you for it.', { merit: 12 }), O('Both sides hated your compromise.', { merit: -3 })),
  ] }),
  E('sc_marriage_alliance', 'bonds', { if: { faction: 'families', age: [17, 30], married: false }, title: 'A marriage alliance', text: 'The Family elders inform you that a marriage has been arranged with another great family, for the good of the clan.', choices: [
    C('Accept', O('You married a stranger in red silk. Over time, the stranger became a person, and the person became someone you could live beside.', { fn: (g) => { const s = g.generateNpc({ role: 'spouse', age: [g.age - 2, g.age + 2], aff: 40, res: 50, sect: 'moyong', family: 'Moyong', romance: true }); g.marry(s); }, rep: { families: 10 }, merit: 15 })),
    C('Refuse', O('You refused. The elders did not speak to you for a year. You did not mind, much.', { merit: -20, rep: { families: -5 } })),
  ] }),
  E('sc_dang_poison_test', 'sect', { if: { sect: 'dang', age: [12, 40] }, once: false, cd: 6, text: 'Dang tradition: every year, members drink a cup of mild poison to build their resistance. This year’s cup smells stronger than last year’s.', choices: [
    C('Drink it', O('You drank it. You were sick for three days and stronger afterwards.', { health: -10, body: 1, merit: 5 })),
    R('Identify the poison first', 'insight', 25, O('You named every ingredient. The elder smiled. "Good. Drink it anyway."', { insight: 2, health: -5, merit: 6 }), O('You could not name it. You drank it.', { health: -12 })),
  ] }),
  E('sc_paeng_drinking', 'bonds', { if: { sect: 'paeng', age: [16, 60] }, once: false, cd: 4, text: 'The Paeng family settles disputes, celebrates victories and mourns losses the same way: drinking until someone falls over.', choices: [
    R('Out-drink Paeng Gu', 'body', 25, O('You out-drank Paeng Gu, which nobody has ever done. He hugged you, wept, and declared you his brother. Then he fell over.', { meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 25, res: 15 } }, merit: 5 }), O('You fell over first. Paeng Gu tucked you in, very gently, and told everyone you were a hero.', { meet: '@paeng_gu', rel: { '@paeng_gu': { aff: 15 } } })),
    C('Stay sober and watch', O('You watched. You learned who in the family talks too much when drunk. Useful.', { insight: 2 })),
  ] }),
  E('sc_jegal_baduk', 'bonds', { if: { sect: 'jegal', age: [12, 60] }, text: 'Jegal Ha, the patriarch’s daughter, plays baduk against herself in the garden. She looks up. "Play me. I am bored of winning."', choices: [
    R('Play seriously', 'insight', 28, O('You lost by half a point. She stared at the board for a long time, then at you. "Again," she said. She has been playing you ever since.', { meet: '@jegal_ha', insight: 2, rel: { '@jegal_ha': { res: 20, aff: 10 } } }), O('You lost badly. She was gracious about it, which was worse.', { meet: '@jegal_ha', insight: 1 })),
    C('Make outrageous moves', O('You made moves so bad they confused her completely. She laughed for the first time anyone could remember.', { meet: '@jegal_ha', rel: { '@jegal_ha': { aff: 20 } } })),
  ] }),

  // ── The Cult ────────────────────────────────────────────────────
  E('sc_cult_trial', 'sect', { if: { sect: 'cult', rank: 0, age: [12, 30] }, art: 'demonic', title: 'The Trial of Blood', text: 'To become a Demon Warrior, a Believer must survive the Trial of Blood: three days in the Valley of Bones with nothing but a knife.', choices: [
    R('Enter the valley', 'body', 26, O('You came out on the third day carrying your knife and nobody else’s. The elders marked your forehead in red. Demon Warrior.', { rank: 1, merit: 10, sanity: -5 }), O('You came out on the second day, half dead. You will try again next year, if you live.', { health: -30 })),
  ] }),
  E('sc_cult_factions', 'sect', { if: { sect: 'cult', age: [16, 60], year: [20, 28] }, once: false, cd: 4, text: 'Inside the Cult, two powers circle each other: the Young Heavenly Demon Dan Ha-ryeong, and the Blood Demon Ma Hyeol-cheon. Everyone must choose, eventually.', choices: [
    C('Lean toward Dan Ha-ryeong', O('You carried messages for her loyalists. It is dangerous work. She noticed.', { flag: 'cult.loyalist', rel: { '@haryeong': { res: 10 } }, merit: 5 })),
    C('Lean toward the Blood Demon', O('The Blood Faction is stronger, and pays better. You joined its training.', { flag: 'cult.blood', merit: 8, sanity: -5 })),
    C('Stay out of it', O('You kept your head down. That only works for so long.')),
  ] }),
  E('sc_cult_warn_coup', 'timeline', { if: { sect: 'cult', mem: 'timeline.cult_coup', year: [26, 28] }, text: 'You remember the coup: the Hall of Ten Thousand Demons, spring of year 29, the Blood Faction’s knives.', choices: [
    C('Warn Dan Ha-ryeong', O('You found her alone on the wall. She listened, very still. "If you are lying, I will kill you," she said. "If you are not, I will owe you." That spring, the coup failed.', { avert: 'cult_coup', meet: '@haryeong', rel: { '@haryeong': { aff: 20, res: 30 } }, gaze: 1 })),
    C('Warn the old Heavenly Demon of the poison', O('You got a message to Dokgo Hyeok through a servant you remembered was loyal. The poisoned wine never reached his lips.', { avert: 'demon_poisoned', gaze: 1 })),
    C('Say nothing', O('You said nothing. The Cult is not your family. Is it?', { sanity: -3 })),
  ] }),
  E('sc_cult_heavenly_demon', 'sect', { if: { sect: 'cult', rank: 3, realm: '>=6', age: [30, 250] }, title: 'The throne of the Heavenly Demon', art: 'demonic', text: 'The throne of the Heavenly Demon is empty. By the Cult’s oldest law, whoever can hold it may take it.', choices: [
    C('Take the throne', O('You sat. Ten thousand believers knelt. The Heavenly Demon Divine Art was placed in your hands.', { rank: 1, manual: 'cult_heavenly_demon', achieve: ['heavenly_demon', 'sect_leader'], fame: 20, infamy: 20 })),
    C('Leave the throne to someone else', O('You walked away from the throne. Some called it cowardice. A few called it wisdom.', { sanity: 8 })),
  ] }),

  // ── Unorthodox brotherhoods ─────────────────────────────────────
  E('sc_gf_toll', 'crime', { if: { sect: 'greenforest', age: [14, 60] }, once: false, cd: 3, text: 'The Green Forest is collecting "tolls" on the Taihang road today. A merchant caravan is approaching.', choices: [
    C('Collect the toll', O('The merchants paid. They always pay. You took your share.', { wealth: 12, infamy: 2, merit: 4, rep: { merchants: -2 } })),
    C('Let the poor-looking ones through free', O('You waved through a family with a cart of turnips. Your captain grumbled. The family remembered.', { merit: 1, fame: 1 })),
  ] }),
  E('sc_gf_king', 'sect', { if: { sect: 'greenforest', rank: '>=2', alive: 'mountain_tiger' }, text: 'Ma Hu, the Mountain Tiger, King of the Green Forest, has called the captains to his hall. He wants an honest opinion, which is rare and dangerous.', choices: [
    C('Give it to him', O('You told him his strongholds were too spread out and his captains too greedy. He stared at you, then roared with laughter. "Finally," he said.', { meet: '@mountain_tiger', merit: 20, rel: { '@mountain_tiger': { res: 25 } } })),
    C('Flatter him', O('He listened to your flattery with a bored face. You were not invited back.', { merit: -5 })),
  ] }),
  E('sc_depot_mission', 'sect', { if: { sect: 'easterndepot', age: [16, 60] }, once: false, cd: 3, art: 'palace', text: 'Your orders: arrest a minor official who has been "writing ungrateful poems." He is sixty, and his poems are very good.', choices: [
    C('Arrest him', O('You arrested him. He recited a poem the whole way to the prison. You remember all of it.', { merit: 10, infamy: 3, rep: { court: 5 }, sanity: -3 })),
    C('Warn him to flee, then report him gone', O('He fled to the south. Your report said he had already left. Your officer looked at you for a long moment.', { merit: -5, fame: 1, flag: 'depot.mercy' })),
  ] }),
  E('sc_guild_deal', 'sect', { if: { sect: 'goldenabacus', age: [14, 70] }, once: false, cd: 3, text: 'The Guild sends you to negotiate the price of a hundred bolts of silk with a stubborn buyer from the north.', choices: [
    R('Haggle', 'charm', 22, O('You talked the price up by a fifth and the buyer still left happy. The Guild was impressed.', { merit: 10, wealth: 10, charm: 1 }), O('The buyer walked away. The Guild was not impressed.', { merit: -3 })),
    C('Sell at his price and buy his goodwill', O('You sold low and asked about his family. Next year he bought three times as much, only from you.', { merit: 6, rep: { merchants: 3 } })),
  ] }),

  // ── Leaving, returning ──────────────────────────────────────────
  E('sc_leave_temptation', 'sect', { if: { rank: [0, 2], age: [16, 40], realm: '>=2' }, text: 'An old friend from the road writes: the Gangho is wide, and a sect is a cage with nice robes. Come wander.', choices: [
    C('Stay', O('You burned the letter. Cages have their uses.', { merit: 3 })),
    C('Leave the sect', O('You left before dawn, with your sword and your debts to no one.', { leave: true, sanity: 3 })),
  ] }),
  E('sc_expelled_return', 'sect', { if: { sect: 'none', age: [20, 80], fn: (g) => Object.keys(g.life.flags).some((f) => f.startsWith('expelled.')) }, text: 'A former senior from the sect that expelled you finds you on the road. "The sect is in trouble," he says. "They would never ask. So I am asking."', choices: [
    C('Go back and help', O('You went back. You helped. They did not thank you. Your old senior did, in a small way that was enough.', { fame: 3, sanity: 4 })),
    C('Refuse', O('"I understand," he said, and left. You were not sure you did.')),
  ] }),
];
