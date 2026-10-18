// Timeline mysteries: regression-linked events. The other regressor (Yu Seol-hwa) across many lives,
// the black bead, knowledge put to use, and the costs of turning the wheel.
import { E, O, C, R, P, M, Q, L, LATER } from './kit.js';

const SEOL_HERE = { fn: (g) => { const s = g.life.npcs.seol; return !!s && !s.dead && s.loc === g.life.loc; } };
const SEOL_ALIVE = { alive: 'seol' };

export default [
  // ── Yu Seol-hwa, the other regressor ─────────────────────────────
  E('my_seol_first', 'timeline', { if: { age: [10, 30], ...SEOL_HERE, notMet: 'seol' }, art: 'city', title: 'The girl who knew', text: 'A young woman grabs a child by the collar and pulls him back from the street a heartbeat before a runaway cart thunders through where he was standing. She did not look at the cart. She did not need to.', choices: [
    C('Ask her how she knew', O('"Luck," she said, and walked away fast. Her name, the child’s mother told you, is Yu Seol-hwa.', { meet: '@seol', flag: 'seol.seen' })),
    M('Show her the black bead', 'secret.bead', O('She saw the bead and went white to the lips. "Where did you get that?" Then, very quietly: "How many times have you died?"', { meet: '@seol', rival: 2, achieve: 'met_seol', rel: { '@seol': { res: 20 } } })),
  ] }),
  E('my_seol_dejavu', 'timeline', { if: { age: [14, 40], met: 'seol', meta: { rival: 1 }, ...SEOL_ALIVE } , text: 'Yu Seol-hwa watches you from across the market with an expression you cannot read. When you look back, she turns away.', choices: [
    C('Follow her', O('You followed her to a quiet alley. She was waiting. "You are not supposed to be different this time," she said. "Why are you different?"', { rival: 2, achieve: 'met_seol', rel: { '@seol': { res: 10 } } })),
    C('Let her go', O('You let her go. You will see her again. You are oddly sure of that.')),
  ] }),
  E('my_seol_count', 'timeline', { if: { met: 'seol', meta: { rival: 2 }, ...SEOL_ALIVE, age: [12, 60] }, art: 'moon', title: 'How many lives', text: 'Yu Seol-hwa sits with you on a roof under the moon. "A hundred and twelve," she says. "That is how many times I have died. You? Never mind. You don’t have to tell me."', choices: [
    C('Tell her the truth', O('You told her. She laughed, not unkindly. "A child." Then she told you why she keeps going back: her brother Yu Jin dies on the Blood Night of Mount Hua, every time. She has never saved him.', { rival: 3, rel: { '@seol': { aff: 15 } }, codex: { id: 'people.seol_brother', cat: 'people', title: 'Why Seol-hwa turns the wheel', text: 'Yu Seol-hwa has died over a hundred times trying to save her brother Yu Jin, who dies at the Blood Night of Mount Hua in year 34.' } })),
    C('Ask why she does it', O('"My brother," she said, and nothing else that night.', { rival: 3, rel: { '@seol': { aff: 5 } } })),
  ] }),
  E('my_seol_shares', 'timeline', { if: { met: 'seol', meta: { rival: '>=3' }, ...SEOL_ALIVE, year: [10, 33], noMem: 'secret.gu_debts' }, title: 'What she knows', text: '"I will tell you what I know," Seol-hwa says, "because I am tired of doing this alone." She draws a map of Mount Hua in spilled tea.', choices: [C('Listen', O('The Plum Blossom Path. Elder Gu Dal-pyeong. His debts in the Kaifeng Ghost Market. The man in red. She had worked it all out over a hundred lives, and never once been believed.', { codex: [{ id: 'secret.gu_debts', cat: 'secrets', title: 'Elder Gu’s debts', text: 'Mount Hua’s Elder Gu Dal-pyeong owes a fortune in the Kaifeng Ghost Market, and the Cult has bought his debts. That is how they get the Plum Blossom Path.' }], rel: { '@seol': { aff: 10, res: 10 } } }))] }),
  E('my_seol_bead', 'timeline', { if: { met: 'seol', meta: { rival: 3 }, ...SEOL_ALIVE, age: [16, 80] }, art: 'wheel', title: 'Her first life', text: 'Seol-hwa takes out a black bead exactly like yours, cracked on the opposite side. "In my first life I stole this from the Cult treasury," she says. "I was dying on the steps of Mount Hua, with my brother dead beside me. I used it. There was someone else dying next to us. I was holding their hand."', choices: [C('"It was me."', O('She did not answer. She did not have to. The two beads, held side by side, fit together like halves of a broken coin.', { rival: 4, achieve: 'seol_truth', rel: { '@seol': { aff: 15 } }, codex: { id: 'secret.two_beads', cat: 'secrets', title: 'Two beads', text: 'Yu Seol-hwa carries the other half of your bead. She used it in her first life, dying at Mount Hua, while holding your hand. That is why you turn with her.' } }))] }),
  E('my_seol_ruthless', 'timeline', { if: { met: 'seol', meta: { rival: 4 }, ...SEOL_ALIVE, year: [20, 33] }, title: 'Her way', text: 'Seol-hwa has a list. On it are the names of everyone who helps the Cult take Mount Hua: Elder Gu Dal-pyeong, his wife, his son. "Kill them all this year," she says calmly, "and Mount Hua survives. I have done the arithmetic."', choices: [
    C('Help her', O('You helped. It worked, the way arithmetic works. You both washed your hands for a long time afterwards.', { rival: 5, flag: ['traitor.exposed', 'seol.ruthless'], infamy: 15, sanity: -15, rel: { '@seol': { res: 15 } } })),
    C('Stop her', O('"There is another way," you said. "There always is." She looked at you as if you were very young. But she put the list away.', { rival: 5, flag: 'seol.mercy', rel: { '@seol': { aff: 10, res: -5 } } })),
    C('Argue all night', O('You argued until dawn. Neither of you won. She agreed to try your way first, "this once."', { rival: 5, rel: { '@seol': { aff: 5, res: 5 } } })),
  ] }),
  E('my_seol_faces', 'timeline', { if: { met: 'seol', meta: { rival: 5 }, ...SEOL_ALIVE, age: [18, 90] }, title: 'Faces', text: 'Seol-hwa confesses that she no longer remembers her mother’s face. "Too many lives. They wear the faces off people," she says. "One day I will forget his face too, and then what am I doing this for?"', choices: [
    C('Describe her mother to her', O('You had met her mother, years ago, in this life. You described her: the mole by her lip, the way she laughed with her hand over her mouth. Seol-hwa cried, silently, for the first time in a hundred lives.', { rival: 6, rel: { '@seol': { aff: 25 } }, sanity: 3 })),
    C('Tell her to write things down, like you do', O('You showed her your journal. She read it all night. In the morning she started her own.', { rival: 6, rel: { '@seol': { aff: 15, res: 10 } } })),
  ] }),
  E('my_seol_brother_lives', 'timeline', { if: { met: 'seol', meta: { rival: '>=4' }, averted: 'blood_night', alive: ['yujin', 'seol'], year: [34, 40] }, art: 'blossom', title: 'The spring after', text: 'Spring, year 34. The Blood Night did not happen. Seol-hwa stands in the Mount Hua courtyard, watching her brother Yu Jin argue with a junior about whose turn it is to sweep. He is alive. He is complaining. He is alive.', choices: [C('Stand beside her', O('She took your hand without looking at you. "One hundred and thirteen," she said. "It only took one hundred and thirteen." She laughed, and then she could not stop crying.', { rival: 7, achieve: 'seol_ally', sanity: 15, rel: { '@seol': { aff: 30, res: 20 } }, fame: 5 }))] }),
  E('my_bead_archive', 'timeline', { if: { meta: { rival: '>=4' }, loc: 'tenthousand', age: [16, 200] }, art: 'library', title: 'The archive of the first Heavenly Demon', text: 'Deep in the Cult’s forbidden archive, among scrolls no one has read in centuries, you find an ink drawing of a black bead, cracked in two.', choices: [R('Read the scroll', 'insight', 40, O('The first Heavenly Demon made the bead to cheat death. It turns the wheel for whoever holds it when they die, and for anyone they hold onto. It was made to be broken in two. As long as both halves are held, it can never stop.', { rival: 8, codex: { id: 'secret.bead_origin', cat: 'secrets', title: 'The bead’s origin', text: 'The first Heavenly Demon made the bead to cheat death. As long as both halves are held by the dying, the wheel can never stop.' } }), O('The script is archaic and the ink is faded. You understood only: "two halves."', { insight: 2 }))] }),
  E('my_seol_choice', 'timeline', { if: { meta: { rival: '>=7' }, mem: 'secret.bead_origin', met: 'seol', ...SEOL_ALIVE, age: [30, 200], item: 'wheel_bead' }, art: 'wheel', title: 'Two halves', text: 'Seol-hwa sits with both halves of the bead in her open palm. "If I give you mine," she says, "I stop. I die once and stay dead, like everyone else. You keep turning, alone. If you give me yours, you are free and I am alone. Or we keep them both, and go on together, forever."', choices: [
    C('Let her rest; take her half', O('She pressed her half into your hand and closed your fingers over it. "Thank you," she said. Next life, she will be a girl in Chang’an who has never died before. She will not know you. You will know her.', { rival: 9, achieve: 'seol_ally', sanity: -5, flag: 'seol.free', fn: (g) => { g.meta.seolFree = true; } })),
    C('Keep turning together', O('"Together, then," she said. "Forever is a long time. Let’s make it interesting." Next life, she will find you. She always will.', { rival: 10, achieve: 'seol_ally', sanity: 8, fn: (g) => { g.meta.seolTogether = true; } })),
  ] }),
  E('my_seol_free_meet', 'timeline', { if: { meta: { rival: 9 }, ...SEOL_HERE, age: [12, 60] }, art: 'blossom', title: 'A stranger', text: 'A young woman in Chang’an buys peaches at the stall next to you. She has never seen you before. She laughs at something the peach-seller says, with her hand over her mouth, exactly like her mother.', choices: [
    C('Introduce yourself', O('"Yu Seol-hwa," she said, and bowed. "Have we met? You look at me like we have."', { meet: '@seol', rel: { '@seol': { aff: 10 } }, sanity: 4 })),
    C('Let her live her life', O('You watched her walk away into an ordinary, unrepeating life. It was the kindest thing you have ever done.', { sanity: 6, burden: -1 })),
  ] }),
  E('my_seol_together', 'timeline', { if: { meta: { rival: 10 }, age: [8, 30], ...SEOL_ALIVE }, title: 'She finds you', text: 'A letter arrives, in a hand you know: "Same as always. Mount Hua, the spring of 34. Bring peaches. S."', fmt: 'letter', from: '@seol', choices: [C('Write back', O('You wrote back: "Bring the arithmetic." You have done this together for a long time now. It never gets old.', { meet: '@seol', rel: { '@seol': { aff: 20, res: 10 } }, sanity: 5 }))] }),
  E('my_seol_romance', 'bonds', { if: { met: 'seol', meta: { rival: '>=6' }, age: [20, 60], npc: { '@seol': { aff: '>=70', role: ['friend', 'acquaintance', 'sworn'] } } }, art: 'moon', text: 'Seol-hwa, on the roof again, says: "In all my lives I never let myself love anyone. They always die. Or I do. And then they forget." She looks at you. "You don’t forget."', choices: [
    C('Take her hand', O('You took her hand. Neither of you said anything else for a long time.', { role: { '@seol': 'lover' }, rel: { '@seol': { aff: 15 } } })),
    C('Stay her friend', O('"I don’t forget," you said. "That is why I am staying your friend." She smiled. "Coward," she said, fondly.', { role: { '@seol': 'sworn' }, achieve: 'sworn' })),
  ] }),
  E('my_seol_dies', 'timeline', { if: { met: 'seol', dead: 'seol', meta: { rival: '>=3' }, age: [15, 200] }, title: 'She will be back', text: 'Seol-hwa is dead. Everyone else grieves. You know she is a newborn in Chang’an by now, screaming with a hundred lives’ worth of memory.', choices: [C('Light incense anyway', O('You lit incense anyway. Some things are for the living.', { sanity: -3 }))] }),

  // ── The bead and the wheel ──────────────────────────────────────
  E('my_bead_warm', 'timeline', { if: { item: 'wheel_bead', age: [10, 200] }, once: false, cd: 15, text: 'The black bead under your shirt grows warm, then hot. Somewhere, something is going wrong with the wheel.', choices: [
    C('Hold it', O('You held it until it cooled. For a moment you heard a thousand voices saying your name.', { sanity: -3, insight: 2 })),
    C('Ignore it', O('You ignored it. It cooled by itself. It always does.')),
  ] }),
  E('my_bead_appraise', 'timeline', { if: { item: 'wheel_bead', locType: 'city', age: [14, 80] }, text: 'An appraiser in a jade shop examines your black bead with a loupe for a long time. "It is not jade," he says finally. "It is not stone. It is not anything. Where did you get it?"', choices: [
    C('"I was born with it"', O('He laughed. Then he saw your face, and stopped, and gave it back very quickly.', { insight: 1 })),
    C('Offer to sell it', O('He offered a fortune. You almost said yes. The next morning it was back in your fist anyway.', { wealth: 0, sanity: -2 })),
  ] }),
  E('my_heaven_notices', 'timeline', { if: { meta: { gaze: '>=5' }, age: [12, 200] }, once: false, cd: 12, danger: true, art: 'storm', text: 'Clear sky, and then thunder directly overhead, once. People in the street look up, then at you, without knowing why.', choices: [C('Bow to Heaven', O('You bowed. Nothing happened. But the roads have been more dangerous lately, and the bandits better armed.', { sanity: -2 }))] }),
  E('my_burden', 'timeline', { if: { meta: { burden: '>=4' }, age: [10, 200] }, once: false, cd: 10, text: 'You count your deaths sometimes, lying awake. The number is getting heavy.', choices: [
    C('Write the number down and stop counting', O('You wrote it down and burned the paper. It helped a little.', { sanity: 4 })),
    C('Count them all again', O('You counted them all, one by one, every death, until dawn.', { sanity: -6, insight: 1 })),
  ] }),
  E('my_dejavu_people', 'timeline', { if: { ...LATER, age: [10, 80] }, once: false, cd: 6, text: 'A stranger says exactly the words you knew they would say, in exactly the tone. You mouth them along with them.', choices: [
    C('Say them first', O('You said the words before they could. They stared at you. "How did you…?" You did not explain.', { sanity: -1, charm: -1 })),
    C('Let them speak', O('You let them speak. There is a strange comfort in a world that keeps its promises.', { sanity: 2 })),
  ] }),
  E('my_grave', 'timeline', { if: { ...LATER, age: [20, 200], chance: 0.5 }, art: 'grave', text: 'You pass the place where you were buried in a past life. In this life there is no grave, only grass and a few wildflowers.', choices: [C('Sit for a while', O('You sat on your own grave, which does not exist, and ate a peach. Life is strange.', { sanity: 3 }))] }),
  E('my_previous_spouse', 'timeline', { if: { ...LATER, age: [18, 60], has: 'romance' }, bind: { x: 'romance' }, text: 'In a past life you married {x}. In this life, {x.he} is a stranger who has just bumped into you in the street and apologised.', choices: [
    C('Start again', O('You started again. It was different. It was also, somehow, the same.', { rel: { x: { aff: 20 } } })),
    C('Let {x.him} go', O('You let {x.him} go. Some loves are better remembered than repeated.', { sanity: -3 })),
  ] }),
  E('my_child_forgotten', 'timeline', { if: { ...LATER, age: [15, 60], fn: (g) => g.meta.hall.some((h) => h.children > 0) }, title: 'Children who were never born', text: 'Your children from your last life have not been born in this one. They may never be. You remember their faces.', choices: [
    C('Write down their names', O('You wrote down their names in your journal, so at least someone will remember them.', { sanity: -4, insight: 1 })),
    C('Promise yourself they will be born again', O('You promised. Whether the wheel will let you keep it is another question.', { sanity: 2 })),
  ] }),

  // ── Using knowledge ─────────────────────────────────────────────
  E('my_grain_speculate', 'timeline', { if: { mem: 'timeline.famine', year: [6, 8], age: [5, 9], stat: { wealth: '>=5' } }, text: 'You remember the famine after the flood. Grain bought now will be worth three times as much in year 9.', choices: [
    C('Spend everything on grain', O('You bought grain with all your savings and your family’s confused blessing. In year 9 you sold it at triple the price, and gave a sack to every family on your street.', { wealth: 30, fame: 3 })),
    C('Store grain for your family only', O('You filled the cellar. That winter, your family did not go hungry.', { health: 5 })),
  ] }),
  E('my_flood_warn', 'timeline', { if: { mem: 'timeline.yellow_flood', year: [6, 8], age: [10, 30], region: 'central' }, text: 'The dikes north of Kaifeng will break in the summer of year 8. The dike wardens are drinking the repair money.', choices: [
    R('Shame the wardens into fixing the dikes', 'fame', 15, O('You made such a public fuss that the magistrate inspected the dikes himself. When the rains came, they held. The Yellow River stayed in its bed.', { avert: 'yellow_flood', fame: 10, gaze: 1 }), O('Nobody listens to a child shouting about dikes.')),
    C('Warn the villages instead', O('You walked from village to village warning people. Some laughed. Some moved. When the river came, the ones who moved lived.', { fame: 4 })),
  ] }),
  E('my_plague_warn', 'timeline', { if: { mem: 'timeline.shu_plague', year: [15, 19], loc: 'chengdu' }, text: 'You remember where the plague begins: the tanners’ quarter, the river, early summer of year 19.', choices: [
    R('Convince the magistrate to close the tanners’ wells', 'charm', 26, O('The magistrate grumbled, but closed the wells and moved the tanneries downriver. In year 19, a few people fell sick. Only a few.', { flag: 'plague.prevented', avert: 'shu_plague', fame: 12, gaze: 1 }), O('The magistrate had you thrown out for wasting his time.')),
    M('Brew the cure in advance', 'secret.plague_cure', O('You brewed the cure in advance and sold it cheaply to every physician in the city. When the fever came, they were ready.', { flag: 'plague.prevented', avert: 'shu_plague', fame: 15, achieve: 'plague_cure', gaze: 1 })),
  ] }),
  E('my_namgung_warn', 'timeline', { if: { mem: 'timeline.namgung_assassination', year: [18, 23], loc: 'namgung' }, art: 'estate', text: 'You remember the night the Namgung patriarch dies: winter of year 23, an assassin through the study roof.', choices: [
    R('Request an audience with Namgung Hwi', 'fame', 22, O('He heard you out, stone-faced. "If you are lying," he said, "I will know in a year." That winter, the assassin found the patriarch waiting.', { avert: 'namgung_assassination', meet: '@namgung_hwi', rel: { '@namgung_hwi': { res: 25 } }, gaze: 1 }), O('The guards turned you away at the gate.')),
    C('Plan to be on that roof yourself', O('You marked the night in your journal.', { flag: 'namgung.plan' })),
  ] }),
  E('my_dang_warn', 'timeline', { if: { mem: 'timeline.dang_civil_war', year: [22, 25], loc: 'dangclan' }, text: 'You remember the poisoned tea that starts the Dang civil war, and the hand that pours it: the second son, Dang Gwang.', choices: [
    R('Get word to the matriarch', 'insight', 28, O('You got a note into her tea tray: "Your second son pours with his left hand." She understood. The Dang family settled it in the dark, as the Dang do.', { avert: 'dang_civil_war', rep: { families: 8 }, gaze: 1 }), O('Your note was intercepted. Someone in the Dang manor now knows your name.', { flag: 'dang.hunted' })),
  ] }),
  E('my_alliance_letters', 'timeline', { if: { mem: 'timeline.alliance_betrayal', year: [33, 38], loc: 'luoyang' }, text: 'You remember the letters that prove Alliance Leader Hwangbo Jun has been dealing with the Cult. In this life, they are still in a lacquer box in his study.', choices: [
    R('Steal the letters and publish them', 'insight', 35, O('You stole the box. The letters, read aloud in the Alliance hall, ended Hwangbo Jun’s career in an afternoon. The Alliance chose a real leader, and the war went differently.', { fame: 15, rep: { orthodox: 10 }, gaze: 1, flag: 'alliance.cleansed', avert: 'alliance_betrayal' }), O('Hwangbo Jun’s guards nearly caught you.', { health: -10 })),
  ] }),
  E('my_depot_director', 'timeline', { if: { mem: 'timeline.registry_edict', year: [45, 54], loc: 'capital', alive: 'depot_director', realm: '>=5' }, art: 'palace', title: 'The Director', text: 'You remember the Registry Edict and the purge that follows. Wi Chung-hyeon walks through the palace gardens alone every evening.', choices: [
    C('End it', O('He saw you coming and smiled.', { combat: { foe: '@depot_director', context: 'assassination', lethal: 0.6, important: true, win: { text: 'The Director of the Eastern Depot died among his chrysanthemums. The Registry Edict died with him.', infamy: 10, rep: { court: -30, orthodox: 10 }, gaze: 2 }, lose: { text: 'He was stronger than you remembered.' } } })),
    C('Walk away', O('You walked away. History is not only yours to edit.')),
  ] }),
  E('my_tournament_bets', 'timeline', { if: { ...LATER, loc: 'luoyang', year: [12, 30], stat: { wealth: '>=20' }, fn: (g) => [12, 18, 24, 30].includes(g.year) } , text: 'You remember who wins this year’s Dragon-Phoenix Assembly. The bookmakers do not.', choices: [
    C('Bet everything', O('You bet everything on the winner at long odds. The bookmaker paid out with shaking hands, and banned you for life.', { fn: (g) => g.addStat('wealth', Math.floor(g.life.stats.wealth * 2)), infamy: 1 })),
    C('Bet a little', O('A modest bet, a modest win, no suspicion.', { wealth: 15 })),
  ] }),
  E('my_exam_answers', 'timeline', { if: { ...LATER, career: 'scholar', age: [14, 40], not: 'passedExam' }, text: 'You remember the examination questions from your last life. They never change; the examiners are lazy.', choices: [
    C('Use them', O('You passed with the highest marks in the province. The examiners called you a genius. You felt like a fraud, and a magistrate.', { flag: 'passedExam', fn: (g) => g.careerXp(10), fame: 3 })),
    C('Answer honestly anyway', R('Answer honestly anyway', 'insight', 35, O('You passed on your own merit. It felt better.', { flag: 'passedExam', fn: (g) => g.careerXp(10), insight: 2 }), O('You failed. Honesty is expensive.', { sanity: -2 }))),
  ] }),
  E('my_old_enemy', 'timeline', { if: { ...LATER, age: [14, 80] }, bind: { x: 'hostile' }, text: 'In your last life, {x} killed someone you loved. In this one, {x.he} has not done it yet. {x.He} is just a person, buying vegetables.', choices: [
    C('Strike first', O('You struck first. It solved one problem and created several others.', { combat: { foe: 'x', context: 'duel', lethal: 0.4, win: { text: 'It was done. It did not feel the way you hoped.', infamy: 5, sanity: -5 } } })),
    C('Watch and wait', O('You watched, and waited. Maybe, this time, {x.he} will not.', { sanity: -1 })),
    C('Make {x.him} a friend instead', O('You bought {x.him} a drink. It was the strangest evening of your life, and possibly {x.his} too.', { rel: { x: { aff: 15, role: 'acquaintance' } } })),
  ] }),
  E('my_save_parents_later', 'timeline', { if: { ...LATER, age: [10, 40], has: 'parent', fn: (g) => g.meta.hall.length > 0 } , text: 'You know how your parents die in other lives. Sometimes it is fever, sometimes the road, sometimes old age if you are lucky. This life, you watch them like a hawk.', choices: [
    C('Spend the year with them', O('You stayed home a whole year, fixing roofs and walking slowly beside them. It was not wasted.', { sanity: 6, rel: { mother: { aff: 10 }, father: { aff: 10 } } })),
    C('Leave them money and go', O('You left money and went. Love is also sometimes leaving.', { wealth: -10 })),
  ] }),
  E('my_meet_master_early', 'timeline', { if: { ...LATER, age: [8, 18], fn: (g) => g.meta.hall.length > 0 && Object.values(g.life.npcs).some((n) => n.named && !n.met && g.remembers(`people.${n.id}`)) }, text: 'You know where someone important to you is right now, in this life, a stranger who has never met you.', choices: [C('Go to them', O('You found them exactly where you remembered. They did not know you. You introduced yourself as if for the first time, which, for them, it was.', { fn: (g) => { const n = Object.values(g.life.npcs).find((x) => x.named && !x.met && g.remembers(`people.${x.id}`)); if (n) { g.meetNpc(n); n.aff += 15; } } }))] }),
  E('my_peaceful_life', 'timeline', { if: { ...LATER, age: [30, 60], fn: (g) => g.meta.hall.length >= 3 } , text: 'Three lives, or more, chasing realms and fixing history. You wonder what it would be like to just grow vegetables.', choices: [
    C('Try it this life', O('You bought a small farm and grew vegetables. The cabbages were terrible. It was the happiest year you have had in several lifetimes.', { sanity: 15, career: 'farmer' })),
    C('No. There is too much left to fix.', O('There is too much left to fix. There always will be.', { sanity: -2 })),
  ] }),
  L('my_first_death_dream', 'timeline', { ...LATER, age: [8, 16], chance: 0.5 }, 'You dreamed of your first death again: the cold, the dark, and then your mother’s kitchen. You woke smelling millet porridge, and for a moment did not know which life you were in.', { sanity: -2 }),
  E('my_teach_child_future', 'timeline', { if: { ...LATER, age: [30, 80], has: 'child' }, bind: { x: 'child' }, text: '{x} asks how you always know what the weather will be.', choices: [
    C('Tell {x.him} the truth', O('{x.He} did not believe you, of course. But {x.he} remembered the story, and told it to {x.his} own children.', { rel: { x: { aff: 8 } } })),
    C('"Old bones"', O('"Old bones," you said, and {x.he} laughed.', { rel: { x: { aff: 4 } } })),
  ] }),
];
