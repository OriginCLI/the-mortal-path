// Event preview: a sample event card, its multi-year chain, the category mix, and the
// data shape the engine would read (conditions, weights, outcomes that set flags).
import { h } from '../dom.js';
import { filler } from './lore.js';

const CATEGORY_NAMES = {
  fortune: 'Fortuitous', sect: 'Sect', jianghu: 'Gangho', timeline: 'Timeline', bonds: 'Bonds',
  war: 'War', tournament: 'Tournament', daily: 'Daily', crime: 'Crime',
};
const CHOICES = [
  { text: 'Climb down into the darkness', p: 35, hint: 'risky', unlock: null },
  { text: 'Mark the spot and return with rope', p: 80, hint: 'safe', unlock: null },
  { text: 'Tell your {senior}', p: 95, hint: 'safe', unlock: null },
  { text: 'Walk away', p: 100, hint: '', unlock: null },
  { text: 'You remember this cave. Go straight to the third alcove.', p: 100, hint: 'memory', unlock: 'memory' },
];
const CHAIN = [
  ['Collapsed cliff', 'age 12'], ['A rotting manual', 'age 12'], ['Practice in secret', 'age 13–15'],
  ['Deviation scare', 'age 16'], ['The ghost of its author', 'age 17'], ['Inheritance', 'age 20'],
];

export function eventsPreview(a, all) {
  const fill = filler(all);
  const n = a.choices === 'varies' ? 3 : Number(a.choices);
  let choices = CHOICES.slice(0, n);
  if (a.choices === 'varies' && a.triggers.includes('memory')) choices = [...choices, CHOICES[4]];
  const oddsText = (c) => {
    if (a.odds === 'hidden' || c.p === 100 && !c.unlock) return '';
    if (c.unlock) return ' ⟲ past life';
    return a.odds === 'shown' ? ` (${c.p}%)` : c.hint ? ` (${c.hint})` : '';
  };
  const chainLen = 1 + Math.round((a.chains / 100) * 5);
  const weights = a.categories.map((id, i) => ({ id, w: Math.round(100 / (1 + i * 0.45)) }));
  const total = weights.reduce((s, x) => s + x.w, 0);

  const card = h('div', { class: 'event-card' },
    h('div', { class: 'ev-top' }, h('span', { class: 'ev-cat' }, 'Fortuitous encounter'), h('span', { class: 'ev-age' }, 'Age 12')),
    h('h4', {}, 'The Collapsed Cliff'),
    h('p', {}, fill('After the spring storms, a section of cliff behind the woodcutter’s path has fallen away. Cold air breathes from a black crack in the rock.')),
    h('div', { class: 'ev-choices' }, choices.map((c) => h('button', {
      type: 'button', class: `ev-choice${c.unlock ? ' unlock' : ''}`,
    }, fill(c.text), h('small', {}, oddsText(c))))));

  const chain = h('ol', { class: 'chain' }, CHAIN.slice(0, chainLen).map(([t, age]) => h('li', {}, h('strong', {}, t), h('small', {}, age))));

  const mix = h('div', { class: 'mix' }, weights.map(({ id, w }) => h('div', { class: 'mix-row' },
    h('span', {}, CATEGORY_NAMES[id]),
    h('span', { class: 'bar gold' }, h('i', { style: `width:${(w / weights[0].w) * 100}%` })),
    h('b', {}, `${Math.round((w / total) * 100)}%`))));

  const cond = {};
  if (a.triggers.includes('age')) cond.age = [10, 14];
  if (a.triggers.includes('location')) cond.location = 'mountain_village';
  if (a.triggers.includes('stats')) cond.stats = { luck: '>= 4' };
  if (a.triggers.includes('flags')) cond.notFlags = ['found_cliff_cave'];
  if (a.triggers.includes('year')) cond.worldYear = [312, 330];
  if (a.triggers.includes('faction')) cond.rep = { orthodox: '>= -20' };
  if (a.triggers.includes('memory')) cond.unlocksWithMemory = 'cliff_cave_location';
  const schema = {
    id: 'cliff_cave_discovery',
    category: 'fortune',
    weight: a.triggers.includes('random') ? 3 : 0,
    conditions: cond,
    choices: [
      { text: 'Climb down into the darkness', odds: 0.35, success: { setFlags: ['found_cliff_cave'], next: 'rotting_manual' }, failure: { health: -30, log: 'You fell.' } },
      { text: 'Mark the spot…', success: { setFlags: ['knows_cliff_cave'], schedule: { event: 'cliff_cave_return', inYears: 1 } } },
    ],
    remember: 'cliff_cave_location',
  };

  return h('div', { class: 'pv pv-events' },
    card,
    h('p', { class: 'pv-note' }, `~${a.perYear} event${a.perYear > 1 ? 's' : ''} per year · formats: ${a.formats.join(', ') || 'none'}`),
    h('div', { class: 'pv-sub' }, `This event’s chain (${chainLen} link${chainLen > 1 ? 's' : ''})`),
    chain,
    h('div', { class: 'pv-sub' }, 'Deck mix by category'),
    mix,
    h('details', { class: 'schema' }, h('summary', {}, 'Event data shape (for the engine)'),
      h('pre', {}, JSON.stringify(schema, null, 2))));
}
