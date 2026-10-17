// Regression preview: a looping timeline of several lives, the regression moment, and the memory journal.
import { h } from '../dom.js';
import { filler, numberWord } from './lore.js';
import { chip } from './tone.js';

const JOURNAL = {
  timeline: ['Year 23: plague in the southern provinces. Sell grain at 21.', 'Year 34: the Cult breaches {Hwasan} at midnight.'],
  secrets: ['The Purple Mist Manual is hidden behind the waterfall on Mount Song.', 'Elder Jo of the Alliance is the Cult’s spy.'],
  theory: ['Plum Blossom Sword, form 9: the wrist turns before the hip, not after.'],
  people: ['{rival} fears his father more than death. He is kind to stray dogs.'],
  recipes: ['Spirit Ginseng + Snow Lotus, boiled 3 days: a Small Reincarnation Pill.'],
  echo: ['Echo of a past life: Body +1.'],
};

export function regressionPreview(a, all) {
  const r0 = a.returnAge;
  const back = r0 <= 1 ? 'an infant again' : `${numberWord(r0)} years old again`;
  const fill = filler(all, { back });
  const drift = a.variance === 'drift';
  const deaths = [34, 52, 27, 71];
  const lives = deaths.map((d, i) => {
    const start = i === 0 ? 0 : drift ? r0 + i * 2 : a.variance === 'random' ? Math.max(0, r0 + [0, -3, 4, 1][i]) : r0;
    return { start, end: d };
  });
  const maxAge = 80;
  const X = (age) => 20 + (age / maxAge) * 350;
  const rows = lives.map((L, i) => {
    const y = 26 + i * 34;
    const known = a.carry.length;
    const dots = Array.from({ length: Math.min(6, i * 2 + 1) }, (_, k) =>
      `<circle cx="${X(L.start + 4 + k * 5)}" cy="${y}" r="2.2" fill="#d8a94a" opacity="${known ? 0.9 : 0.15}"/>`).join('');
    const arc = i < lives.length - 1
      ? `<path d="M${X(L.end)} ${y} C${X(L.end) + 18} ${y + 14}, ${X(lives[i + 1].start) - 18} ${y + 20}, ${X(lives[i + 1].start)} ${y + 34}" fill="none" stroke="#c23b2b" stroke-width="1.4" stroke-dasharray="3 3" marker-end="url(#ar)"/>`
      : '';
    return `<line x1="${X(L.start)}" y1="${y}" x2="${X(L.end)}" y2="${y}" stroke="#efe4cf" stroke-opacity="0.65" stroke-width="3" stroke-linecap="round"/>
      ${dots}
      <text x="${X(L.end) + 5}" y="${y + 3.5}" font-size="8" fill="#c96a5a">✝ ${L.end}</text>
      <text x="4" y="${y + 3}" font-size="8" fill="#a8987e">${i + 1}</text>${arc}`;
  }).join('');
  const ticks = [0, 20, 40, 60, 80].map((v) => `<text x="${X(v)}" y="170" font-size="7" fill="#7d6f5d" text-anchor="middle">${v}</text>`).join('');
  const svg = `<svg viewBox="0 0 400 176" class="loops" role="img" aria-label="Four lives looping back to age ${r0}">
    <defs><marker id="ar" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6z" fill="#c23b2b"/></marker></defs>
    ${rows}${ticks}</svg>`;

  const trig = {
    always: 'Any death turns the wheel.',
    unjust: 'Only an early or unjust death turns the wheel; a content death in old age is an ending.',
    artifact: 'The cracked bead at your throat has 3 charges left.',
  }[a.trigger];

  const entries = a.carry.flatMap((c) => JOURNAL[c] || []).slice(0, 6);
  const faded = a.costs.includes('fade');
  const fixed = a.determinism < 34 ? 'History repeats exactly unless you intervene.' : a.determinism < 67 ? 'History mostly repeats, with small wobbles each loop.' : 'Each loop drifts. Even unchanged lives play out differently.';
  const change = a.butterfly < 34 ? 'Fate pushes back: save someone, and they may die another way.' : a.butterfly < 67 ? 'Your choices ripple outward in real but limited ways.' : 'You can rewrite history, and every change creates new unknowns.';

  return h('div', { class: 'pv pv-regress' },
    h('div', { class: 'loops-wrap', html: svg }),
    h('p', { class: 'pv-note' }, `Four lives. Gold dots are knowledge carried forward. ${trig}`),
    h('div', { class: 'paper log' },
      h('p', { class: 'log-line death' }, h('b', {}, 'The wheel turns: '),
        fill('{S} opened {p} eyes. {S} {was} {back}. Outside, the same rooster crowed the same crow.')),
      a.npcMemory === 'rival' ? h('p', { class: 'log-line' }, h('b', {}, 'Age 9: '), fill('{rival} met {p} eyes across the market, and went white. He remembered too.')) : null,
      a.npcMemory === 'dejavu' ? h('p', { class: 'log-line' }, h('b', {}, 'Age 12: '), fill('The innkeeper’s daughter frowned at {o}. “Have we met? I feel I owe you a dumpling.”')) : null),
    h('div', { class: 'pv-sub' }, `Memory journal${a.journal === 'manual' ? ' (only what you wrote down)' : ''}`),
    h('ul', { class: 'journal' }, entries.length
      ? entries.map((e, i) => h('li', { class: faded && i > 2 ? 'faded' : '' }, fill(e)))
      : h('li', { class: 'faded' }, 'Nothing carries over. Each life starts truly fresh.'),
    a.journal !== 'auto' ? h('li', { class: 'mine' }, fill('✎ “Don’t trust the kind elder. Leave {Hwasan} before 33.”')) : null),
    h('dl', { class: 'facts' },
      h('dt', {}, 'History'), h('dd', {}, fixed),
      h('dt', {}, 'Change'), h('dd', {}, change),
      h('dt', {}, 'Ending'), h('dd', {}, { endless: 'The wheel never stops.', true: 'Learn why the wheel turns, and break it.', multiple: 'Several endings: ascension, rule, contentment, damnation, and breaking the wheel.' }[a.ending])),
    a.costs.length ? h('div', { class: 'pv-chips' }, a.costs.map((c) => chip({ none: 'No cost', fade: 'Memories fade', burden: 'Karmic burden', harsher: 'Heaven notices' }[c]))) : null);
}

