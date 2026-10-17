// Combat preview: a playable mini-duel in whichever system is selected, using the chosen
// length, lethality, information display, technique naming and ways out.
import { h, rng } from '../dom.js';
import { sfx } from '../audio.js';
import { filler, termsFor } from './lore.js';

const TECH = {
  poetic: {
    you: ['Plum Blossom Sword: Falling Petals', 'Twenty-Four Plum Steps', 'Cloud-Splitting Thrust'],
    foe: ['Heavenly Emperor Sword: Thunder Descends', 'Azure Sky Sword Wall', 'Great Sun Slash'],
  },
  literal: {
    you: ['Rising Slash', 'Quick Sidestep', 'Piercing Thrust'],
    foe: ['Overhead Cut', 'Defensive Screen', 'Heavy Slash'],
  },
};

const LINES = {
  youHit: [
    '{S} flowed into {tech}; {foe} was a heartbeat late, and steel kissed his shoulder{dmg}.',
    '{tech}! {P} sword traced a crescent of light across his guard and found the ribs beneath{dmg}.',
    '{S} feinted high and cut low with {tech}, and {foe} staggered back, clutching his thigh{dmg}.',
  ],
  foeHit: [
    '{foe} answered with {etech}. {S} {was} too slow, and pain blossomed along {p} side{dmg}.',
    '{etech}! Thunder seemed to fall from a clear sky, and the blow drove {o} to one knee{dmg}.',
    '{foe}’s blade slid past {p} guard like water through fingers{dmg}.',
  ],
  clash: [
    'Blade met blade with a sound like a temple bell. Neither gave an inch.',
    '{tech} met {etech}; the shock of {qi} rippled the dust around them in a perfect ring.',
    'They broke apart, circling. {foe} smiled thinly. “Not bad, for a nobody.”',
  ],
};
const TELLS = {
  strike: '{foe}’s weight shifts onto his front foot. He means to strike.',
  guard: '{foe} sinks into a low, rooted stance, sword held close.',
  feint: '{foe}’s eyes flick to {p} left hand; his blade wavers, playful.',
};
const BEATS = { strike: 'feint', feint: 'guard', guard: 'strike' };

function condition(hp) {
  if (hp > 75) return 'barely scratched';
  if (hp > 45) return 'bleeding';
  if (hp > 20) return 'staggering';
  return 'on the brink';
}

export function combatPreview(a, all) {
  const T = termsFor(all);
  const foe = T.rival;
  const names = TECH[a.naming];
  const r = rng(Date.now() & 0xffff);
  const fill = filler(all, { foe });
  const st = { you: 100, foe: 100, qi: 40, ex: 0, over: false };
  const maxEx = a.length;
  const baseDmg = 10 + a.lethality * 0.22;

  const log = h('div', { class: 'duel-log', 'aria-live': 'polite' });
  const bars = h('div', { class: 'duel-bars' });
  const controls = h('div', { class: 'duel-controls' });

  const drawBars = () => {
    if (a.display === 'prose') {
      bars.replaceChildren(h('p', { class: 'pv-note' },
        `${T.name}: ${condition(st.you)} · ${foe}: ${condition(st.foe)}`));
      return;
    }
    const bar = (label, v, cls, max = 100) => h('div', { class: 'bar-row' },
      h('span', {}, label),
      h('span', { class: `bar ${cls}` }, h('i', { style: `width:${Math.max(0, (v / max) * 100)}%` })),
      a.display === 'numbers' ? h('b', {}, `${Math.max(0, Math.round(v))}`) : null);
    bars.replaceChildren(
      bar(T.name, st.you, 'hp'),
      a.system === 'technique' ? bar('Qi', st.qi, 'qi', 40) : null,
      bar(foe, st.foe, 'foe'));
  };
  const say = (text, cls = '') => {
    log.append(h('p', { class: cls }, text));
    log.scrollTop = log.scrollHeight;
  };
  const dmgText = (n) => (a.display === 'numbers' ? ` (−${n})` : '');
  const hit = (who, techIdx = null) => {
    const n = Math.round(baseDmg * r.range(0.7, 1.3) * (techIdx === 2 ? 1.4 : 1));
    st[who] -= n;
    const tpl = r.pick(who === 'foe' ? LINES.youHit : LINES.foeHit);
    say(fill(tpl.replace('{tech}', names.you[techIdx ?? r.int(0, 2)]).replace('{etech}', names.foe[r.int(0, 2)]).replace('{dmg}', dmgText(n))),
      who === 'foe' ? 'good' : 'bad');
    sfx('hit', { intensity: 0.4 });
  };
  const clash = () => {
    say(fill(r.pick(LINES.clash).replace('{tech}', names.you[r.int(0, 2)]).replace('{etech}', names.foe[r.int(0, 2)])));
    sfx('clash', { intensity: 0.4 });
  };

  const finish = (forced) => {
    st.over = true;
    controls.replaceChildren();
    const L = a.lethality;
    if (forced) {
      say(fill(forced), 'end');
    } else if (st.foe <= st.you) {
      if (L < 35) {
        say(fill(`${foe} lowered his sword. “Enough. I yield.” Word of the duel spread through the {jianghu}.`), 'end good');
        say('Flags set: defeated_namgung_jin · Fame +5', 'flag');
      } else {
        say(fill(`${foe} fell to his knees, blood between his fingers. His life was in {p} hands.`), 'end good');
        controls.append(
          h('button', { type: 'button', class: 'btn small', onclick: () => { controls.replaceChildren(); say(fill('{S} sheathed the sword. The Namgung would remember this mercy, or this humiliation.'), 'end'); say('Flags set: spared_namgung_jin · Orthodox rep +10', 'flag'); } }, 'Spare him'),
          h('button', { type: 'button', class: 'btn small ghost', onclick: () => { controls.replaceChildren(); say(fill('The sword fell once. By spring, the Namgung family had sworn a blood feud against {o}.'), 'end bad'); say('Flags set: killed_namgung_jin · namgung_feud · Infamy +20', 'flag'); sfx('death', { intensity: 0.4 }); } }, 'Finish it'));
      }
    } else if (L < 35) {
      say(fill('{S} woke in a ditch, bruised and penniless, but alive. The lesson stung more than the wounds.'), 'end bad');
      say('Flags set: lost_to_namgung_jin · Health −10', 'flag');
    } else if (L < 70) {
      say(fill('{S} {was} carried back with three broken ribs. Training halted for a season.'), 'end bad');
      say('Flags set: lost_to_namgung_jin · injured(1y)', 'flag');
    } else {
      say(fill(`${foe}’s blade found {p} heart. {S} died at nineteen.`), 'end bad');
      say(all.regression?.trigger === 'artifact' ? 'The bead at your throat cracks. The wheel turns… (one charge spent)' : 'The wheel turns… (regression triggers)', 'flag');
      sfx('death', { intensity: 0.5 });
    }
    drawBars();
  };

  const checkEnd = () => {
    drawBars();
    if (st.you <= 0 || st.foe <= 0 || st.ex >= maxEx) { finish(); return true; }
    return false;
  };

  const exitButtons = () => {
    const outs = {
      flee: ['Flee', '{S} vaulted the inn railing and vanished over the rooftops. Lightness skill check passed; face lost.'],
      yield: ['Yield', '{S} dropped the sword and bowed. {foe} laughed and let {o} live. Fame −5.'],
      talk: ['Talk', '“Your father would not want this brawl reported to the Alliance,” {s} said quietly. {foe} hesitated, then left.'],
      trick: ['Lime powder', 'A handful of lime to the eyes. Not honorable, but {s} walked away. Infamy +5.'],
      foreknowledge: ['Use a memory', 'In a past life {s} had watched {foe} lose to a feint at the left knee. {S} did it again. He fell.'],
    };
    return a.alternatives.map((id) => h('button', {
      type: 'button', class: 'chip-btn', onclick: () => finish(outs[id][1]),
    }, outs[id][0]));
  };

  const stanceTurn = () => {
    if (st.over) return;
    const intent = r.pick(['strike', 'guard', 'feint']);
    const truthful = r() < 0.7;
    const shown = truthful ? intent : r.pick(Object.keys(TELLS).filter((k) => k !== intent));
    say(fill(TELLS[shown]), 'tell');
    controls.replaceChildren(
      ...['strike', 'guard', 'feint'].map((mine) => h('button', {
        type: 'button', class: 'btn small',
        onclick: () => {
          st.ex++;
          if (BEATS[mine] === intent) hit('foe');
          else if (BEATS[intent] === mine) hit('you');
          else clash();
          if (!checkEnd()) stanceTurn();
        },
      }, mine[0].toUpperCase() + mine.slice(1))),
      h('span', { class: 'outs' }, exitButtons()));
  };

  const techTurn = () => {
    if (st.over) return;
    const costs = [0, 8, 16];
    controls.replaceChildren(
      ...names.you.map((nm, i) => h('button', {
        type: 'button', class: 'btn small', disabled: st.qi < costs[i] ? true : null,
        onclick: () => {
          st.ex++;
          st.qi -= costs[i];
          if (r() < [0.6, 0.75, 0.55][i]) hit('foe', i);
          else say(fill(`{S} unleashed ${nm}, but ${foe} slipped aside.`));
          if (st.foe > 0) {
            if (r() < 0.5) hit('you');
            else clash();
          }
          if (!checkEnd()) techTurn();
        },
      }, nm, a.display === 'numbers' ? h('small', {}, ` ${costs[i]} qi`) : null)),
      h('span', { class: 'outs' }, exitButtons()));
  };

  const autoFight = () => {
    controls.replaceChildren();
    const step = () => {
      if (st.over) return;
      st.ex++;
      const x = r();
      if (x < 0.42) hit('foe');
      else if (x < 0.77) hit('you');
      else clash();
      if (!checkEnd()) setTimeout(step, 650);
    };
    step();
  };

  const decisive = () => {
    const showOdds = a.display === 'numbers';
    const hint = (p) => (showOdds ? ` (${p}%)` : a.display === 'bars' ? ` (${p > 70 ? 'likely' : p > 45 ? 'even' : 'risky'})` : '');
    const opts = [
      ['Fight with everything', 50, () => (r() < 0.5 ? (st.foe = 10, finish()) : (st.you = 0, finish()))],
    ];
    if (a.alternatives.includes('flee')) opts.push(['Flee over the rooftops', 75, () => finish(r() < 0.75 ? '{S} escaped into the night. Face lost; life kept.' : 'He caught {o} at the gate. A sword hilt to the temple, then darkness.')]);
    if (a.alternatives.includes('talk')) opts.push(['Talk him down', 40, () => finish(r() < 0.4 ? '{foe} snorted, but sheathed his sword.' : '“You talk too much.” He drew.')]);
    if (a.alternatives.includes('foreknowledge')) opts.push(['Strike the knee you remember', 90, () => (st.foe = 0, finish())]);
    controls.replaceChildren(...opts.map(([label, p, fn]) => h('button', { type: 'button', class: 'btn small', onclick: fn }, label + hint(p))));
  };

  function start() {
    Object.assign(st, { you: 100, foe: 100, qi: 40, ex: 0, over: false });
    log.replaceChildren();
    say(fill(`${foe} of the {Namgung} family drew his sword in the inn courtyard. “Kneel, or bleed.”`), 'intro');
    drawBars();
    if (a.system === 'stance') stanceTurn();
    else if (a.system === 'technique') techTurn();
    else if (a.system === 'decisive') decisive();
    else controls.replaceChildren(h('button', { type: 'button', class: 'btn small', onclick: autoFight }, 'Begin duel'));
  }
  start();

  const help = {
    stance: 'Strike beats Feint, Feint beats Guard, Guard beats Strike. Tells are right 70% of the time.',
    technique: 'Each technique costs qi; stronger ones miss more often.',
    auto: 'Stats decide; you watch the prose unfold.',
    decisive: 'One choice, one outcome, BitLife-style.',
  }[a.system];

  return h('div', { class: 'pv pv-combat' },
    h('p', { class: 'pv-note' }, `Live demo · ${help} Up to ${maxEx} exchange${maxEx > 1 ? 's' : ''}.`),
    bars, log, controls,
    h('button', { type: 'button', class: 'link-btn', onclick: () => start() }, '↻ Restart duel'));
}
