// Childhood: ages 0–12. Daily life, family, first friends, first glimpses of the murim,
// and (in later lives) what a child with an adult's memories can do.
import { E, O, C, R, P, M, Q, L, LATER } from './kit.js';

const PEASANT = { origin: 'peasant' };
const MERCHANT = { origin: 'merchant' };
const ORPHAN = { origin: 'orphan' };
const BRANCH = { origin: 'branch' };
const SECTBORN = { origin: 'sectborn' };
const CULTBORN = { origin: 'cultborn' };
const OFFICIAL = { origin: 'official' };

export default [
  // ── Infancy (0–2) ────────────────────────────────────────────────
  L('ch_first_word', 'daily', { age: [0, 1], meta: { loop: 1 } }, 'Your first word was "no." Your family took it as a sign of strong character. It was, mostly, a sign of things to come.', { charm: 1 }),
  E('ch_first_word_later', 'timeline', { if: { age: [0, 1], ...LATER }, text: 'You are a baby with a lifetime of memories, and your mouth will not make the words. The frustration is enormous. Your mother leans over the cradle, cooing.', choices: [
    C('Say a whole sentence', O('"Good morning, Mother. I have lived before." Your mother screamed, then fainted, then spent a month taking you to temples to have the ghost removed. You learned to keep quiet.', { sanity: -2, flag: 'ch.spooky' })),
    C('Gurgle like a normal baby', O('You gurgled. It was humiliating. It was also wise.', { insight: 1 })),
    C('Practise breathing the way you remember', O('You lay in your cradle and breathed the Small Heavenly Circuit. Nobody suspects an infant of cultivating. The warmth in your dantian came faster this time.', { qi: 10, insight: 1 })),
  ] }),
  L('ch_first_steps', 'daily', { age: [0, 1] }, 'You took your first steps toward the kitchen fire. Someone caught you two steps before you reached it. It became a family story told at every festival for years.', { body: 1 }),
  L('ch_fever_baby', 'daily', { age: [0, 2], chance: 0.6 }, 'A fever nearly took you in your second winter. Your mother did not sleep for six nights. You do not remember it; she will never forget it.', { health: -10 }),
  L('ch_teeth', 'daily', { age: [0, 2] }, 'You cut your first teeth on a wooden spoon and the edge of your father’s patience.'),
  E('ch_infant_grab', 'daily', { if: { age: [1, 2] }, text: 'At your first-birthday ceremony the family set out objects on a mat. Whatever you grab, they say, foretells your life.', choices: [
    C('Grab the brush', O('You grabbed the brush. Your family nodded: a scholar, then. You promptly ate it.', { insight: 2 })),
    C('Grab the wooden sword', O('You grabbed the wooden sword and hit your uncle with it. Everyone agreed this was very promising.', { body: 2 })),
    C('Grab the coin', O('You grabbed the coin and would not let go of it for an hour. Your grandmother laughed until she cried.', { wealth: 2, charm: 1 })),
    C('Grab the thread', O('You grabbed the thread. Long life, they say. Nobody knows what to do with that.', { health: 5 })),
  ] }),
  L('ch_later_infant', 'timeline', { age: [1, 2], ...LATER }, 'You spent your second year pretending to learn things you already knew, and learning, slowly, how to be small again.', { insight: 1 }),

  // ── Willow Creek (peasant) ───────────────────────────────────────
  L('ch_willow_rice', 'daily', { age: [3, 7], ...PEASANT, season: 1 }, 'You spent the summer in the paddies with your family, planting rice seedlings in neat rows that the ducks immediately disarranged.', { body: 1 }),
  E('ch_willow_jiho', 'bonds', { if: { age: [3, 6], ...PEASANT }, text: 'The miller’s son, Han Ji-ho, pushed you into the creek. When you climbed out dripping, he looked very worried that you would cry.', choices: [
    C('Push him in back', O('You pushed him in. He came up laughing. By evening you were sworn to be friends forever, in the way of children.', { meet: '@jiho', rel: { '@jiho': { aff: 25, role: 'friend' } } })),
    C('Cry loudly until his mother comes', O('His mother came, and so did yours. Ji-ho was made to apologise. He has not forgiven you, a little.', { meet: '@jiho', rel: { '@jiho': { aff: 5 } } })),
    C('Walk away with great dignity', O('You walked home dripping, with great dignity. Ji-ho followed you the whole way, apologising.', { meet: '@jiho', rel: { '@jiho': { aff: 15, res: 10 } }, charm: 1 })),
  ] }),
  E('ch_willow_bora', 'bonds', { if: { age: [5, 9], ...PEASANT }, text: 'The village chief’s daughter, Yun Bo-ra, is reading a book under the persimmon tree. It is the only book in Willow Creek that is not an almanac.', choices: [
    C('Ask her to teach you to read', O('Bo-ra looked at you as if you had finally said something intelligent. You spent the autumn under that tree, learning characters with a stick in the dirt.', { meet: '@bora', insight: 3, rel: { '@bora': { aff: 20, role: 'friend' } } })),
    C('Steal the book and run', O('You stole the book. She caught you in thirty steps and took it back with interest. You both have bruises and an understanding.', { meet: '@bora', body: 1, rel: { '@bora': { aff: 5, res: 10 } } })),
    C('Leave her alone', O('You left her to her book. Some friendships start late.')),
  ] }),
  L('ch_willow_festival', 'daily', { age: [3, 12], ...PEASANT, season: 0 }, 'At the spring festival the whole village danced around a bonfire on the riverbank, and old Grandfather Seok played the flute badly and with tremendous joy.', { sanity: 3 }),
  E('ch_willow_teacher', 'fortune', { if: { age: [6, 11], ...PEASANT, noManual: 'breath_basic' }, text: 'Old Teacher Pyo, who keeps the village school, was once a Third-Rate swordsman in a minor sect. He does not talk about it. He does sometimes breathe in a way that is not normal breathing.', choices: [
    R('Pester him until he teaches you', 'charm', 12, O('You pestered him for a month. Finally he sighed and taught you the Three-Breath Foundation Method, "so you will stop following me to the latrine."', { manual: 'breath_basic' }), O('He told you to go and help your parents in the fields. You did not stop pestering. He did not give in. Yet.', { flag: 'ch.pestered' })),
    C('Copy him in secret', O('You hid behind the school and copied his breathing. You got half of it right and a stitch in your side.', { qi: 4, insight: 1 })),
    M('Recite the method back to him', 'theory.breath_basic', O('You recited the Three-Breath Foundation Method back to him, word for word. He went pale. "Who taught you that?" "You did," you said, which was true, in a way he will never understand.', { manual: 'breath_basic', insight: 2 })),
  ] }),
  E('ch_willow_pestered', 'fortune', { if: { age: [7, 12], ...PEASANT, flag: 'ch.pestered', noManual: 'breath_basic' }, text: 'Teacher Pyo found you waiting outside his door at dawn, for the fortieth morning in a row.', choices: [C('Bow', O('"Fine," he said. "Fine. Sit." He taught you the Three-Breath Foundation Method. "It will take you to First-Rate, if you are lucky. Nobody from this village has ever been lucky."', { manual: 'breath_basic' }))] }),
  E('ch_willow_hua_visit', 'sect', { if: { age: [6, 10], ...PEASANT, sect: 'none' }, text: 'Two Mount Hua disciples came down the mountain to buy rice. Their sword hilts had plum blossoms carved on them. All the village children followed them like ducklings.', choices: [
    C('Ask how to join Mount Hua', O('"Come to the gate at the next spring exam," the older one said, kindly. "Bring rice. We are short of rice."', { flag: 'ch.hua_invite', rep: { orthodox: 1 } })),
    C('Challenge one to a fight', O('The younger disciple laughed, picked you up by the collar and set you in a haystack. "Come back in ten years," she said.', { body: 1, fame: 1 })),
    C('Watch their swords', O('You watched how they walked, light on the balls of their feet. That night you practised walking like that until your father asked if you had hurt your ankles.', { insight: 1 })),
  ] }),
  E('ch_willow_exam', 'sect', { if: { age: [6, 12], ...PEASANT, sect: 'none', flag: 'ch.hua_invite', season: 0 }, art: 'temple', title: 'The gate of Mount Hua', text: 'You climbed the thousand steps of Mount Hua with a sack of rice on your back. At the top, a stern elder looks over the children who made it.', choices: [
    R('Stand straight and wait', 'body', 14, O('The elder walked down the line and stopped at you. "This one. And the rice." You are a disciple of the Mount Hua Sect.', { join: 'mounthua', rep: { orthodox: 5 } }), O('The elder walked past you. "Come back next year," someone said. The rice they kept.', { wealth: -1 })),
    M('Tell him you know the Plum Blossom Path is unguarded', 'timeline.blood_night', O('The elder stopped. His face did not change, but his eyes did. "Who told you that?" He took you into the sect that day, and watched you very carefully.', { join: 'mounthua', flag: 'hua.suspicious_child' })),
  ] }),
  E('ch_willow_flood_dream', 'timeline', { if: { age: [5, 7], ...PEASANT, mem: 'timeline.yellow_flood', year: [6, 8] }, text: 'In your last life, the Yellow River flooded in your eighth summer. Willow Creek is far from it, but your mother’s sister lives near Kaifeng.', choices: [
    C('Beg your mother to send word to her sister', O('Your mother humoured you and wrote. Her sister moved to higher ground "for her health." That summer, her house went under the water, and she did not.', { fame: 1, flag: 'ch.aunt_saved', rel: { mother: { aff: 10 } } })),
    C('Say nothing; you are only a child', O('You said nothing. Children are not listened to anyway. That is what you told yourself.', { sanity: -3 })),
  ] }),
  E('ch_willow_raid_prep', 'timeline', { if: { age: [12, 14], ...PEASANT, mem: 'timeline.willow_raid', not: 'willow.prepared', year: [12, 15] }, art: 'fire', text: 'You remember how Willow Creek burns: the north road, dusk, torches, the Blood Blade Ghost. You have a year or two.', choices: [
    R('Convince Chief Yun to drill the village with bows', 'charm', 22, O('It took a year of nagging and one very convincing nightmare you described in detail. The chief bought bows. The village grumbled and drilled.', { flag: 'willow.prepared', rel: { '@village_chief': { res: 20 } } }), O('The chief patted your head. "Bandits never come this far south." You know better.', { flag: 'willow.tried' })),
    C('Plan to get your own family out', O('You found the goat path into the hills and made your family walk it "for a picnic" until they could do it in the dark.', { flag: 'family.evacuated' })),
    Q('Hire guards (60 taels)', { stat: { wealth: '>=60' } }, O('You hired a pair of Escort Agency guards to winter in Willow Creek, telling everyone a rich relative sent them. When the torches came, the guards held the north road.', { wealth: -60, avert: 'willow_raid', fame: 6 })),
  ] }),

  // ── Hangzhou (merchant) ──────────────────────────────────────────
  L('ch_hz_shop', 'daily', { age: [3, 8], ...MERCHANT }, 'You grew up under the counter of the silk shop, learning the feel of good silk and bad customers.', { charm: 1 }),
  E('ch_hz_abacus', 'daily', { if: { age: [5, 9], ...MERCHANT }, text: 'Your father sat you down with an abacus. "Before you learn anything else," he said, "learn to count what you are owed."', choices: [
    R('Master it', 'insight', 10, O('By winter you could add faster than the shop clerk. Your father glowed.', { insight: 2, wealth: 3, rel: { father: { aff: 8 } } }), O('You learned to make the beads click impressively without adding anything. It fooled most customers.', { charm: 1 })),
    C('Use it as a sled', O('You used it as a sled down the shop stairs. It was a very expensive sled.', { body: 1, rel: { father: { aff: -5 } } })),
  ] }),
  E('ch_hz_gaeun', 'bonds', { if: { age: [5, 9], ...MERCHANT }, text: 'The tea merchant’s daughter next door, Seo Ga-eun, has set up a rival stall in front of your shop selling your father’s own scraps back to him.', choices: [
    C('Go into business together', O('You formed a partnership. By summer you had made eight coppers and lost six. She kept the accounts; she always will.', { meet: '@gaeun', wealth: 1, rel: { '@gaeun': { aff: 20, role: 'friend' } } })),
    C('Report her to your father', O('Your father laughed so hard he gave her a job.', { meet: '@gaeun', rel: { '@gaeun': { aff: -5, res: 5 } } })),
  ] }),
  E('ch_hz_escort', 'fortune', { if: { age: [7, 12], ...MERCHANT, noManual: 'fist_basic' }, text: 'Your father hired an escort guard for a silk shipment, a scarred old man who drinks too much and practises his forms at dawn in the courtyard.', choices: [
    Q('Pay him to teach you (15 taels)', { stat: { wealth: '>=15' } }, O('For fifteen taels, he taught you the Common Fist Forms and a great many words your mother does not like.', { wealth: -15, manual: 'fist_basic' })),
    C('Watch him every morning', O('You watched every morning until he started correcting your stance without saying anything about it.', { body: 1, insight: 1 })),
  ] }),
  L('ch_hz_lake', 'daily', { age: [4, 12], ...MERCHANT, season: 1 }, 'You spent summer evenings on West Lake in a borrowed boat, watching the lanterns of the rich float past.', { sanity: 2 }),
  E('ch_hz_ruin_prep', 'timeline', { if: { age: [13, 16], ...MERCHANT, mem: 'timeline.merchant_ruin', year: [13, 16] }, text: 'You remember the morning the Golden Abacus Guild ruins your family. The debts are being bought up quietly, now.', choices: [
    R('Convince your father to move the shop into your mother’s family’s name', 'charm', 20, O('It took a month of arguments and one well-timed tantrum. The deeds changed hands quietly.', { avert: 'merchant_ruin', rel: { father: { aff: 5 } } }), O('Your father told you to mind your abacus.')),
    C('Start saving for that morning', O('You started hiding coins in a jar under the floor. Three hundred taels is a lot of coins.', { flag: 'ch.saving' })),
  ] }),

  // ── Luoyang (orphan) ─────────────────────────────────────────────
  L('ch_ly_begging', 'daily', { age: [3, 8], ...ORPHAN }, 'Old Man Gu taught you the beggar’s trade: which temples give rice, which inns throw out dumplings, and which dogs bite.', { charm: 1 }),
  E('ch_ly_dongsu', 'bonds', { if: { age: [4, 8], ...ORPHAN }, text: 'A boy with a missing front tooth stole your bowl and ran. He is fast, but he looks back too often.', choices: [
    R('Chase him down', 'body', 8, O('You caught him by the ankle under the Tianjin Bridge. He gave back the bowl and half his rice. His name is Dong-su. Somehow, you are friends now.', { meet: '@dongsu', body: 1, rel: { '@dongsu': { aff: 25, role: 'friend' } } }), O('He was faster. That night he brought back your bowl, empty, with a dumpling in it. "Sorry," he said. "I was hungry."', { meet: '@dongsu', rel: { '@dongsu': { aff: 15, role: 'friend' } } })),
    C('Let him go', O('You let him go. Hunger is hunger.', { sanity: 1 })),
  ] }),
  E('ch_ly_gu_breath', 'fortune', { if: { age: [6, 11], ...ORPHAN, noManual: 'beg_mind', alive: 'oldgu' }, text: 'Old Man Gu, drunk under the bridge, watched you shiver through a winter night. "Bah," he said. "Sit up. Breathe like this. No, like this."', choices: [
    C('Breathe', O('He taught you the Beggar’s Empty-Bowl Method, between swigs. "Don’t tell the Clan Chief I taught you that," he said. "Don’t tell anyone anything. That is the second lesson."', { manual: 'beg_mind', rel: { '@oldgu': { aff: 10 } } })),
  ] }),
  E('ch_ly_beggars_sect', 'sect', { if: { age: [8, 14], ...ORPHAN, sect: 'none' }, text: 'A beggar with three cloth pouches on his belt, a Three-Pouch disciple of the Beggars’ Sect, has been watching you work the temple steps.', choices: [
    C('Ask to join the Beggars’ Sect', O('He laughed. "You already beg. Now you will beg for a reason." You became a One-Pouch disciple of the largest sect under Heaven.', { join: 'beggars', rep: { orthodox: 3 } })),
    C('Steal one of his pouches', O('You tried. He caught your wrist without looking. "Good hands. Bad judgement." He let you go, but he remembered you.', { body: 1, flag: 'ch.beggar_noticed' })),
  ] }),
  E('ch_ly_gu_secret', 'timeline', { if: { age: [7, 10], ...ORPHAN, mem: 'timeline.old_gu', year: [7, 10], alive: 'oldgu' }, text: 'You remember the winter the Eastern Depot comes for Old Man Gu. He is asleep on his straw, smiling about something.', choices: [
    C('Warn him', O('"Black boots," you said. "This winter. They want what is in your coat." He stopped smiling. That week he took you to see an old friend in the Beggars’ Sect, and he never slept under the bridge again.', { avert: 'old_gu', rel: { '@oldgu': { aff: 20, res: 20 } } })),
    C('Dig a hiding place under the shrine', O('You spent a month digging a hole under the shrine floor with a broken spoon.', { flag: 'gu.hidingplace' })),
  ] }),

  // ── Namgung Estate (branch family) ──────────────────────────────
  L('ch_nam_cold', 'daily', { age: [3, 8], ...BRANCH }, 'The main family’s children have warm rooms and new robes. Branch children have the cold courtyard, the old robes, and a great deal of instruction about knowing their place.', { sanity: -1, body: 1 }),
  E('ch_nam_jin', 'bonds', { if: { age: [5, 9], ...BRANCH }, text: 'Namgung Jin, the main family’s heir, a year older than you, knocked your wooden sword out of your hands in front of everyone. "Branch blood," he said, and walked off.', choices: [
    C('Pick up the sword and attack him', O('You lost, badly, in front of everyone. But he stopped, looked at you properly for the first time, and said, "Again tomorrow."', { meet: '@namgung_jin', body: 2, rel: { '@namgung_jin': { res: 15, role: 'rival' } } })),
    C('Bow and say nothing', O('You bowed. He sneered. You will remember the sneer for a long time.', { meet: '@namgung_jin', rel: { '@namgung_jin': { res: -5 } }, sanity: -2 })),
    C('Laugh at him', O('You laughed at him. He did not know what to do with that. Nobody had ever laughed at him before.', { meet: '@namgung_jin', charm: 1, rel: { '@namgung_jin': { res: 5, aff: 5 } } })),
  ] }),
  E('ch_nam_sohee', 'bonds', { if: { age: [5, 10], ...BRANCH }, text: 'Namgung So-hee, the patriarch’s daughter, is practising sword forms alone in the plum garden where branch children are not allowed. She is much better than her brother. Nobody is allowed to say so.', choices: [
    C('Watch her quietly', O('She noticed you watching and, after a while, started correcting your stance from across the garden. It became your secret.', { meet: '@namgung_sohee', insight: 1, rel: { '@namgung_sohee': { aff: 15, role: 'friend' } } })),
    C('Tell her she is better than Jin', O('She went very still, then smiled, a real one. "Don’t ever say that where Father can hear."', { meet: '@namgung_sohee', rel: { '@namgung_sohee': { aff: 20, res: 5 } } })),
  ] }),
  L('ch_nam_ancestors', 'daily', { age: [4, 10], ...BRANCH, season: 3 }, 'At the winter ancestral rites you knelt at the very back of the hall, behind three hundred Namgung relatives, and smelled incense for six hours.', { insight: 1 }),

  // ── Mount Hua (sect-born) ───────────────────────────────────────
  L('ch_hua_granny', 'daily', { age: [3, 7], ...SECTBORN }, 'Granny Pyo, the sect cook, raised you in the kitchen on rice crust and gossip. You know which elders snore and which sneak wine.', { charm: 1, meet: '@hua_cook', rel: { '@hua_cook': { aff: 30, role: 'guardian' } } }),
  E('ch_hua_plum', 'daily', { if: { age: [4, 9], ...SECTBORN }, art: 'blossom', text: 'The plum trees of Mount Hua bloomed in the snow. Disciples say the founder could make a sword bloom like that. Nobody alive has seen it.', choices: [
    C('Ask Elder Seo about the founder', O('Elder Seo Un-pyeong, smelling of wine, told you the story for an hour and then fell asleep mid-sentence. You liked him at once.', { meet: '@hua_un', rel: { '@hua_un': { aff: 15 } }, insight: 1 })),
    C('Try to make a stick bloom', O('You waved a plum branch until all the blossoms fell off. That counts, you decided.', { body: 1 })),
  ] }),
  E('ch_hua_senior', 'bonds', { if: { age: [6, 11], ...SECTBORN }, text: 'Bang Ho-jin, the eldest disciple of your generation, caught you sneaking into the training hall at night.', choices: [
    C('Ask him to train you', O('He looked at you for a long time. "Dawn," he said. "If you are late once, never again." You were never late.', { meet: '@hua_senior', body: 2, rel: { '@hua_senior': { res: 15, role: 'senior' } } })),
    C('Run', O('He caught you in four steps and carried you back to the kitchen by the collar. Granny Pyo gave him a dumpling for it.', { meet: '@hua_senior', rel: { '@hua_senior': { aff: 5 } } })),
  ] }),
  E('ch_hua_debts', 'sect', { if: { age: [8, 12], ...SECTBORN }, text: 'Merchants came up the mountain to collect debts. The Sect Leader paid them from his own purse, and then sat alone in the main hall for a long time.', choices: [
    C('Bring him tea', O('Sect Leader Hyeon Mu-gyeong took the tea and looked at you as if he were seeing the sect’s future. "Thank you," he said. "Don’t tell anyone you saw me like this."', { meet: '@hua_leader', rel: { '@hua_leader': { aff: 20 } } })),
    C('Listen at the door to the elders arguing', O('Elder Gu Dal-pyeong argued loudest for selling the sect’s lands. He was smiling the whole time.', { meet: '@hua_traitor', insight: 1, flag: 'ch.heard_gu' })),
  ] }),

  // ── The Ten Thousand Mountains (cult-born) ──────────────────────
  L('ch_cult_drill', 'daily', { age: [4, 9], ...CULTBORN }, 'Cult children drill before they can read. You learned to stand in formation in the snow before you learned your own birthday.', { body: 2, sanity: -1 }),
  E('ch_cult_mokcheol', 'bonds', { if: { age: [5, 9], ...CULTBORN }, text: 'A silent boy in your training group, Mok Cheol, gives you half his rice every time you are punished with no supper.', choices: [
    C('Thank him', O('He shrugged. He does not talk much. But from then on you stood next to each other in every formation.', { meet: '@mokcheol', rel: { '@mokcheol': { aff: 25, role: 'friend' } } })),
    C('Take the rice and say nothing', O('You took it. He did not seem to mind.', { meet: '@mokcheol', rel: { '@mokcheol': { aff: 10 } } })),
  ] }),
  E('ch_cult_haryeong', 'bonds', { if: { age: [6, 11], ...CULTBORN }, art: 'demonic', text: 'The Young Heavenly Demon, Dan Ha-ryeong, a girl only a little older than you, inspected the children’s training. She stopped in front of you.', choices: [
    C('Meet her eyes', O('"This one is not afraid," she said, to no one in particular. "Good." She walked on. People treated you differently after that.', { meet: '@haryeong', rel: { '@haryeong': { res: 15 } }, rep: { cult: 3 } })),
    C('Bow to the ground', O('You bowed to the ground like everyone else. She did not notice you. That is safer, here.', { meet: '@haryeong' })),
  ] }),
  E('ch_cult_question', 'daily', { if: { age: [8, 12], ...CULTBORN }, text: 'Your instructor said that the orthodox sects are hypocrites and murderers. A child asked what orthodox people say about us. The instructor beat the child.', choices: [
    C('Ask the same question, later, quietly', O('You asked an old cook. She laughed. "They say we eat children. We say they eat the poor. Both are true enough."', { insight: 2 })),
    C('Keep your head down', O('You kept your head down. That is the first lesson of the Ten Thousand Mountains.')),
  ] }),

  // ── The Imperial Capital (official's house) ─────────────────────
  L('ch_cap_tutor', 'daily', { age: [4, 9], ...OFFICIAL }, 'A tutor with a cane drilled you in the Four Books every morning. You learned the classics, and also how to sleep with your eyes open.', { insight: 2 }),
  E('ch_cap_forbid', 'daily', { if: { age: [6, 11], ...OFFICIAL, noManual: 'fist_basic' }, text: 'Your father caught you copying the stances of the guards at the gate. "Officials do not brawl," he said. "The murim is for people who failed their exams."', choices: [
    C('Obey him', O('You obeyed. Mostly. The guards still let you watch.', { insight: 1, rel: { father: { aff: 5 } } })),
    C('Train in secret with the gatekeeper', O('Old gatekeeper Choi taught you the Common Fist Forms behind the stables, for the price of your sweets.', { manual: 'fist_basic', flag: 'ch.secret_training' })),
  ] }),
  E('ch_cap_parade', 'daily', { if: { age: [5, 10], ...OFFICIAL, year: [5, 10] }, art: 'palace', text: 'The boy Emperor’s procession passed down the avenue. Behind his palanquin rode a smiling eunuch in black and silver: Wi Chung-hyeon of the Eastern Depot.', choices: [
    C('Stare at the eunuch', O('He noticed you staring and smiled at you. It was the coldest thing you have ever seen.', { meet: '@depot_director', sanity: -2 })),
    C('Look at the Emperor', O('The Emperor was a boy your age who looked as if he wanted to be anywhere else.', { insight: 1 })),
  ] }),
  E('ch_cap_frame_prep', 'timeline', { if: { age: [16, 20], ...OFFICIAL, mem: 'timeline.father_framed', year: [16, 20] }, text: 'You remember the forged letters, and the clerk who forged them: a Depot clerk named Mun. In this life, he has not forged them yet.', choices: [
    R('Find Clerk Mun and gather proof of his forgeries', 'insight', 28, O('You found his practice sheets in a teahouse he favoured, and copies of seals that should not exist. When the Depot came for your father, the proof was already with Commander Han Gyeong.', { avert: 'father_framed', rel: { '@guard_commander': { res: 15 } } }), O('Clerk Mun noticed you watching him. He transferred to another office. Now you do not know where he is.', { flag: 'mun.alerted' })),
    C('Persuade your father to resign before then', O('Your father, astonishingly, listened. He retired to a country estate "for his health." The Depot found someone else to frame.', { avert: 'father_framed', wealth: -20 })),
  ] }),

  // ── Any origin: early childhood ─────────────────────────────────
  L('ch_storyteller', 'daily', { age: [4, 10], locType: ['city', 'village'] }, 'A travelling storyteller told the tale of the Drunken Sword Saint, who cut a waterfall in half and then fell asleep in it. You acted out the whole story for a week, sword and sleep included.', { insight: 1, sanity: 2 }),
  E('ch_stray_dog', 'daily', { if: { age: [3, 9] }, text: 'A stray dog with one ear followed you home and sat outside the door with an expression of total confidence.', choices: [
    C('Feed it', O('You fed it. It never left. You named it General, and it outranked everyone in the house.', { flag: 'pet.dog', sanity: 3 })),
    C('Chase it off', O('You chased it off. It came back the next day, more confident than ever.', { flag: 'pet.dog_maybe' })),
  ] }),
  L('ch_general_dies', 'daily', { flag: 'pet.dog', age: [13, 18], chance: 0.4 }, 'General, the one-eared dog, died in his sleep by the stove, as old and confident as ever. You buried him under the persimmon tree.', { sanity: -4 }),
  E('ch_bone_reader', 'fortune', { if: { age: [5, 9], chance: 0.6 }, text: 'A ragged old man in the market grabbed your wrist and pressed his thumb into the bone.', choices: [
    C('Let him look', O('"Hm," he said. "Hmm." He told you something about your meridians that you did not understand, gave you a copper, and vanished.', { flag: 'knowsBody', codex: 'self.constitution' })),
    C('Kick him', O('You kicked him in the shin. He laughed and let go. "Good reflexes!"', { body: 1 })),
  ] }),
  E('ch_fortune_teller', 'daily', { if: { age: [6, 12], locType: ['city', 'village'] }, text: 'A blind fortune-teller at the temple gate offered to read your fate for a copper.', choices: [
    C('Pay the copper', O('She ran her fingers over your palm and frowned. "Strange. Your lines go round in a circle." She gave you back your copper.', { flag: 'ch.circle_palm' })),
    M('Tell her your fate before she can', 'timeline.blood_night', O('You told her the date of your death in your last life. She went white and stopped taking customers for a week.', { sanity: -1 })),
    C('Walk past', O('You walked past. Your fate stayed unread.')),
  ] }),
  E('ch_bully', 'daily', { if: { age: [6, 11] }, text: 'A bigger child has been taking smaller children’s food all season. Today it is your turn.', choices: [
    R('Fight back', 'body', 10, O('You bit him. It was not elegant. He never took your food again.', { body: 1, fame: 1 }), O('He sat on you. It was humiliating. You started training the next morning.', { body: 1, sanity: -1 })),
    C('Hand it over', O('You handed it over and went hungry. Some days are like that.', { health: -2 })),
    R('Talk him out of it', 'charm', 10, O('You convinced him that your food had been spat in by a ghost. He believed you completely.', { charm: 2 }), O('He did not believe in ghosts. He took the food and laughed.')),
  ] }),
  L('ch_new_year', 'daily', { age: [3, 12], season: 0 }, 'At New Year you bowed to your elders, received red envelopes, and ate until you were sick. Firecrackers chased the old year out of every alley.', { sanity: 3, wealth: 1 }),
  L('ch_mid_autumn', 'daily', { age: [3, 12], season: 2 }, 'At Mid-Autumn you ate mooncakes on the roof and looked for the rabbit in the moon. You found it, eventually.', { sanity: 2 }),
  L('ch_dragon_boat', 'daily', { age: [4, 12], season: 1, locType: ['city', 'village'] }, 'At the Dragon Boat Festival you threw rice dumplings into the river for the drowned poet and ate twice as many yourself.', { sanity: 2 }),
  E('ch_lost', 'daily', { if: { age: [4, 8], chance: 0.5 }, text: 'You followed a fox into the hills and, when you looked up, did not know where you were. It is getting dark.', choices: [
    R('Follow the stream downhill', 'insight', 8, O('Streams lead to rivers, rivers lead to villages. You walked in at midnight to find the whole village searching for you with torches.', { insight: 1 }), O('The stream led to a waterfall. You spent the night in a hollow log, very cold and very proud of not crying.', { health: -5, body: 1 })),
    C('Climb a tree and wait', O('You waited in a tree until your father found you, hoarse from shouting your name.', { rel: { father: { aff: 5 } } })),
  ] }),
  E('ch_sickness', 'daily', { if: { age: [3, 10], chance: 0.5 }, text: 'A sickness went through the children of the town. You caught it.', choices: [
    C('Drink the bitter medicine', O('You drank it, every disgusting drop. You recovered in a week.', { health: -5 })),
    C('Pour it out the window', O('You poured it out the window. You recovered in a month. The plant under the window died.', { health: -15 })),
  ] }),
  E('ch_temple_visit', 'daily', { if: { age: [4, 10] }, art: 'temple', text: 'Your family took you to the temple to pray for health. An old monk sweeping the steps smiled at you as if he knew you.', choices: [
    C('Smile back', O('The monk bowed. "Again, then," he said, and went back to sweeping. You did not understand. Later, you would.', { flag: 'ch.monk_smile' })),
    C('Ask him what he means', O('"You will know," he said, "if you live long enough. Or short enough." He swept away.', { insight: 1 })),
  ] }),
  E('ch_nightmares', 'timeline', { if: { age: [3, 7], ...LATER }, text: 'You wake screaming from dreams of your last death. Your mother holds you and says it was only a dream.', choices: [
    C('Let her believe it', O('You let her hold you. For a little while, it helps to be small.', { sanity: 3 })),
    C('Write the dream down in secret', O('You wrote every detail you could remember, in a child’s clumsy hand, and hid it under the floorboard.', { insight: 1, sanity: -1 })),
  ] }),
  E('ch_later_play', 'timeline', { if: { age: [4, 8], ...LATER }, text: 'The other children want to play sects and demons. You have been in real sects, and met real demons.', choices: [
    C('Play anyway', O('You played the demon. You were very, very convincing. Some of the children cried.', { charm: 1, sanity: 2 })),
    C('Teach them a real stance', O('You taught them a real horse stance. Two of them grew up to be guards. One grew up to be a bandit. Such is fate.', { fame: 1 })),
  ] }),
  E('ch_later_know_everything', 'timeline', { if: { age: [6, 10], ...LATER }, text: 'Your teacher asks a question nobody can answer. You know the answer. You know the answer to everything he will ask this year.', choices: [
    C('Answer', O('You answered. And the next one. By the end of the week people were calling you a prodigy, and watching you strangely.', { insight: 2, fame: 2 })),
    C('Pretend not to know', O('You pretended. It is lonely, knowing everything and saying nothing.', { sanity: -1 })),
  ] }),
  E('ch_later_parents', 'timeline', { if: { age: [5, 10], ...LATER, has: 'parent' }, text: 'In your last life you never told your parents you loved them. You were busy. Then they were gone.', choices: [
    C('Tell them now', O('You said it at dinner, out of nowhere. Your mother cried. Your father pretended he had something in his eye. They talked about it for years.', { sanity: 6, rel: { mother: { aff: 10 }, father: { aff: 10 } } })),
    C('Show them instead', O('You helped in the fields every day that summer without being asked. Your father kept looking at you as if you had been replaced. In a way you had.', { body: 1, rel: { father: { aff: 8 } } })),
  ] }),
  E('ch_bead', 'timeline', { if: { age: [6, 6], ...LATER }, art: 'wheel', title: 'A black bead', text: 'On the morning of your sixth birthday you wake with something hard in your fist: a small black bead, cracked across one side, warm as skin. You have never seen it before. You are certain you have seen it before.', choices: [
    C('Keep it', O('You threaded it on a string and wore it under your shirt. When you hold it, you hear a faint sound, like a wheel turning very far away.', { item: { wheel_bead: 1 }, rival: 1, codex: { id: 'secret.bead', cat: 'secrets', title: 'The black bead', text: 'Every life since your first, you wake on your sixth birthday holding a cracked black bead that is warm as skin.' } })),
    C('Throw it in the river', O('You threw it in the river. The next morning it was in your fist again.', { item: { wheel_bead: 1 }, rival: 1, sanity: -3, codex: { id: 'secret.bead', cat: 'secrets', title: 'The black bead', text: 'Every life since your first, you wake on your sixth birthday holding a cracked black bead that is warm as skin.' } })),
  ] }),
  L('ch_school', 'daily', { age: [5, 9], locType: ['village', 'city'] }, 'You learned your first hundred characters by writing them in sand. Your teacher said your handwriting looked like a chicken had walked through ink, which was true.', { insight: 1 }),
  E('ch_sibling_fight', 'bonds', { if: { age: [4, 11], has: 'sibling' }, bind: { x: 'sibling' }, text: 'You and {x} fought over the last dumpling until it fell on the floor and the dog ate it.', choices: [
    C('Blame {x}', O('{x} got the beating. You got a guilty conscience, which lasted almost a day.', { rel: { x: -5 } })),
    C('Take the blame', O('You took the blame. {x} snuck you half {x.his} supper that night.', { rel: { x: 12 } })),
  ] }),
  E('ch_sibling_protect', 'bonds', { if: { age: [6, 12], has: 'sibling' }, bind: { x: 'sibling' }, text: 'Some older children cornered {x} behind the granary.', choices: [
    R('Charge in', 'body', 10, O('You charged in swinging. You both got bruised. You both got home. {x} looked at you differently after that.', { body: 1, rel: { x: 15 } }), O('You both got beaten. But you were beaten together, which counts for something.', { health: -5, rel: { x: 10 } })),
    C('Run for help', O('You ran for your father, who came with a hoe. The children scattered.', { rel: { x: 5 } })),
  ] }),
  E('ch_parent_sick', 'bonds', { if: { age: [6, 12], has: 'parent', chance: 0.4 }, bind: { x: 'parent' }, text: '{x} fell ill with a cough that would not stop. The household went quiet.', choices: [
    C('Sit by the bed every night', O('You sat by the bed every night, telling every story you knew. {x} recovered by spring.', { rel: { x: 12 }, sanity: 2 })),
    P('Go into the mountains for herbs', 0.6, O('You came back with an armful of herbs, half of them useful. The physician was impressed despite himself.', { insight: 2, rel: { x: 8 } }), O('You came back with an armful of weeds and a twisted ankle. {x} laughed until coughing, which the physician said was good for the lungs.', { health: -4, rel: { x: 6 } })),
  ] }),
  L('ch_moon', 'daily', { age: [5, 12], season: 1 }, 'On summer nights you lay on the threshing floor counting stars until you lost count, and then started again.', { sanity: 1 }),
  E('ch_wooden_sword', 'daily', { if: { age: [5, 9], noItem: 'wooden_sword' }, text: 'You found a straight branch exactly the length of a sword.', choices: [
    C('Carve it into a sword', O('You carved it into a sword and practised every day. It is crooked. You love it.', { item: { wooden_sword: 1 }, body: 1 })),
    C('Use it as a fishing pole', O('You caught three fish. Your family ate well that night.', { health: 3 })),
  ] }),
  E('ch_wandering_monk', 'fortune', { if: { age: [6, 12], noManual: 'shao_breath', sect: 'none', chance: 0.5 }, text: 'A Shaolin monk on pilgrimage stopped for water at your door. He looked at you for a moment longer than politeness requires.', choices: [
    C('Ask him to teach you', O('He taught you one breathing exercise and told you to come to Mount Song if you ever wanted the rest.', { qi: 6, flag: 'ch.shaolin_invite', rep: { orthodox: 1 } })),
    C('Give him rice', O('You gave him your own bowl of rice. He bowed very low to a very small person.', { sanity: 2, rep: { orthodox: 1 } })),
  ] }),
  E('ch_shaolin_gate', 'sect', { if: { age: [6, 14], flag: 'ch.shaolin_invite', loc: 'songshan', sect: 'none' }, art: 'temple', text: 'You stand at the gate of Shaolin Temple. The monk you gave water to years ago is sweeping the steps, as if he has been waiting.', choices: [C('Bow', O('He walked you in himself. You are a lay disciple of Shaolin.', { join: 'shaolin' }))] }),
  E('ch_recruiter', 'sect', { if: { age: [7, 13], sect: 'none', locType: ['village', 'city'], chance: 0.6 }, text: 'A recruiter from a minor sect set up a table in the square, promising martial arts, three meals a day, and a robe with a sword on it.', choices: [
    C('Sign up', O('It turned out the sect was three people and a goat, and the martial arts were mostly about the goat. You left in a month, wiser.', { insight: 1, body: 1 })),
    C('Ask him which sect is the strongest', O('"Mine, obviously," he said, and then, lowering his voice: "Wudang. Or Shaolin. But they do not take people like us."', { insight: 1 })),
  ] }),
  L('ch_first_snow', 'daily', { age: [3, 6], season: 3 }, 'You saw the first snow of winter and tried to catch every flake on your tongue. You did not manage it. You have never stopped trying.', { sanity: 2 }),
  E('ch_secret_place', 'daily', { if: { age: [6, 11] }, text: 'Behind the old mill there is a hollow under the roots of a camphor tree, just big enough for one child.', choices: [
    C('Make it your secret place', O('You brought a blanket and a candle stub. For years, it was the only place in the world that was completely yours.', { sanity: 4, flag: 'ch.secret_place' })),
    C('Show your friends', O('You showed your friends. It became a fortress, then a sect headquarters, then a pirate ship. It was never quiet again.', { charm: 1 })),
  ] }),
  E('ch_overheard', 'daily', { if: { age: [7, 12], has: 'parent' }, text: 'Late at night you overheard your parents talking in low voices about money, and about you.', choices: [
    C('Listen', O('They were worried about whether they could feed everyone through winter. You went back to bed and resolved to eat less. You did not manage it.', { insight: 1, sanity: -2 })),
    C('Go back to sleep', O('You went back to sleep. Some things are better not known. Yet.')),
  ] }),
  E('ch_harvest_help', 'daily', { if: { age: [6, 12], season: 2, locType: 'village' }, text: 'The whole village brings in the harvest before the autumn rains.', choices: [
    C('Work until dark', O('You cut sheaves until your hands blistered. At the harvest feast an old woman gave you the best piece of pork.', { body: 2, rep: { orthodox: 0 } })),
    C('Sneak off to the river', O('You sneaked off to the river. You were caught. You were made to work twice as hard the next day.', { body: 1 })),
  ] }),
  E('ch_puppet_show', 'daily', { if: { age: [4, 10], locType: 'city' }, text: 'A shadow-puppet troupe performed the tale of the Heavenly Demon and the hero who slew him.', choices: [
    C('Cheer for the hero', O('You cheered until you were hoarse. The hero won. Heroes always win, in puppet shows.', { sanity: 2 })),
    C('Cheer for the Demon', O('You cheered for the Demon. People stared. One old man in the back smiled.', { rep: { cult: 1 } })),
  ] }),
  E('ch_drowning', 'daily', { if: { age: [6, 12], season: 1, chance: 0.4 }, text: 'Swimming in the river, a younger child slipped into the deep pool and went under.', choices: [
    R('Dive in after her', 'body', 12, O('You dragged her out by her hair. Her mother wept and fed you for a month.', { fame: 2, body: 1, charm: 1 }), O('You both nearly drowned. A farmer pulled you both out with a hoe handle.', { health: -10, fame: 1 })),
    C('Shout for help', O('You shouted until a man came running. She lived. You learned to swim properly that summer.', { body: 1 })),
  ] }),
  E('ch_kite', 'daily', { if: { age: [5, 10], season: 0 }, text: 'The spring winds were perfect for kites.', choices: [
    C('Build a kite with your family', O('Your kite flew higher than anyone else’s, then snapped its string and sailed away over the hills. You watched it until it disappeared.', { sanity: 3 })),
    C('Steal someone else’s kite', O('You stole a kite. It flew beautifully. You felt bad about it for longer than it flew.', { infamy: 0.5 })),
  ] }),
  E('ch_cricket', 'daily', { if: { age: [6, 12], locType: ['city', 'village'], season: 2 }, text: 'The children are holding cricket fights in the alley. Your cricket, Black Thunder, is undefeated.', choices: [
    P('Put Black Thunder in the final', 0.55, O('Black Thunder fought like a demon and won. You were a hero for a week.', { fame: 1, wealth: 1 }), O('Black Thunder lost an antenna and his dignity. You buried him with honours.', { sanity: -1 })),
    C('Retire Black Thunder undefeated', O('You retired Black Thunder undefeated, a legend forever. It is the wisest thing you will do for years.', { insight: 1 })),
  ] }),
  E('ch_grandmother', 'bonds', { if: { age: [4, 10], has: 'parent', chance: 0.5 }, text: 'Your grandmother, who is very old and very fierce, called you over to tell you a family secret.', choices: [
    C('Listen', O('Your great-grandfather, she said, was a Second-Rate swordsman who once saved a magistrate. Nobody else believes her. You do.', { insight: 1, sanity: 2 })),
    C('Ask for sweets instead', O('She gave you sweets and the secret anyway. You forgot the secret. You remember the sweets.', { sanity: 1 })),
  ] }),
  E('ch_village_fire', 'daily', { if: { age: [8, 12], locType: ['village', 'city'], chance: 0.35 }, art: 'fire', text: 'A fire started in the night two houses down. People are running with buckets.', choices: [
    R('Join the bucket line', 'body', 10, O('You passed buckets until dawn. The fire was put out before it reached your street.', { fame: 1, body: 1 }), O('The smoke got into your lungs. You coughed for a month.', { health: -8 })),
    C('Help the old woman next door out of her house', O('You led her out by the hand while she complained about her slippers. She left you her best teapot when she died.', { fame: 1, charm: 1 })),
  ] }),
  E('ch_first_qi', 'fortune', { if: { age: [7, 12], stat: { qi: '>=20' }, realm: 0 }, text: 'Sitting by the river at dusk, you felt it for the first time: a warmth below your navel, like a small sun.', choices: [C('Breathe into it', O('The warmth grew, then settled. You sat there until it was dark, smiling at nothing.', { qi: 8, sanity: 3 }))] }),
  E('ch_beat_friend', 'bonds', { if: { age: [8, 12], has: 'friend' }, bind: { x: 'friend' }, text: '{x} says you have become strange since you started training, that you look at people like a fighter now.', choices: [
    C('Laugh it off', O('You laughed it off and played like a child again for an afternoon. It was harder than training.', { rel: { x: 6 }, sanity: 2 })),
    C('Admit it', O('You admitted it. {x} was quiet, then said, "Teach me, then." So you did.', { rel: { x: 10, res: 5 } })),
  ] }),
  L('ch_twelve', 'daily', { age: [12, 12] }, 'You turned twelve. Old enough, people say, to begin to be careful what you become.', { insight: 1 }),
];
