// Life systems preview: character sheet, activities menu, and a live "roll an origin" birth.
import { h, rng } from '../dom.js';
import { portraitSVG } from '../art.js';
import { filler, termsFor, ladderFor, lifespanAt } from './lore.js';

const STAT_NAMES = {
  health: 'Health', body: 'Body', qi: 'Qi', insight: 'Insight', charm: 'Charm', luck: 'Luck',
  karma: 'Karma', fame: 'Fame', wealth: 'Wealth', sanity: 'Heart',
};
const ACT_NAMES = {
  train: ['練', 'Train'], meditate: ['坐', 'Meditate'], seclusion: ['關', 'Seclusion'], wander: ['遊', 'Wander'],
  work: ['業', 'Work'], study: ['學', 'Study'], doctor: ['醫', 'Physician'], gamble: ['賭', 'Gamble'],
  tavern: ['酒', 'Tavern'], journal: ['錄', 'Journal'],
};
const ORIGINS = {
  peasant: '{S} {was} born in a leaking farmhouse in a mountain village, the third child of rice farmers.',
  merchant: '{S} {was} born above a silk shop in Hangzhou, into a family that counted coins before prayers.',
  orphan: '{S} {was} found as a newborn on the steps of a ruined shrine, wrapped in a beggar’s coat.',
  branch: '{S} {was} born into a minor branch of the {Namgung} family: noble name, no inheritance.',
  sectborn: '{S} {was} born within the walls of {Hwasan}, to a disciple who died in childbirth.',
  cultborn: '{S} {was} born in the Ten Thousand Mountains, under the banner of the {cheonma}.',
  official: '{S} {was} born in a magistrate’s house, expected to pass the imperial exams.',
};

export function lifePreview(a, all) {
  const T = termsFor(all);
  const fill = filler(all);
  let seed = 11;
  const sheet = h('div', { class: 'sheet' });
  const birth = h('p', { class: 'birth', 'aria-live': 'polite' });
  const ladder = ladderFor(all);

  const draw = () => {
    const r = rng(seed);
    const age = 17;
    sheet.replaceChildren(
      h('div', { class: 'sheet-head' },
        h('div', { class: 'portrait', html: portraitSVG(seed, age) }),
        h('div', {},
          h('strong', {}, T.name),
          h('small', {}, `Age ${age} · ${ladder[2]} · ${a.granularity === 'season' ? 'Spring' : 'Year 329'}`))),
      h('div', { class: 'stat-grid' }, a.stats.map((s) => {
        const v = s === 'wealth' ? r.int(3, 120) : r.int(15, 90);
        return h('div', { class: 'bar-row' },
          h('span', {}, STAT_NAMES[s]),
          s === 'wealth' ? h('b', { class: 'taels' }, `${v} taels`) : h('span', { class: `bar ${s === 'karma' ? 'qi' : 'gold'}` }, h('i', { style: `width:${v}%` })));
      })));
    const pool = a.origins.length ? a.origins : ['peasant'];
    birth.textContent = fill(ORIGINS[r.pick(pool)]);
  };
  draw();

  const acts = h('div', { class: 'acts' }, a.activities.map((id) =>
    h('div', { class: 'act' }, h('span', { class: 'glyph' }, ACT_NAMES[id][0]), ACT_NAMES[id][1])));

  const lifeLine = a.lifespan === 'realm'
    ? `Lifespan: mortal ~${lifespanAt(all, 0)} · ${ladder[4]} ~${lifespanAt(all, 4)} · ${ladder[8]} ~${lifespanAt(all, 8)} years`
    : `Lifespan: mortal limits, rarely beyond ${lifespanAt(all, 8)}`;

  return h('div', { class: 'pv pv-life' },
    sheet,
    h('div', { class: 'roll' },
      h('button', { type: 'button', class: 'btn small', onclick: () => { seed = (seed * 7 + 13) % 9973; draw(); } }, 'Roll a new birth'),
      birth),
    h('div', { class: 'pv-sub' }, `Activities${a.granularity === 'season' ? ' (per season)' : ' (per year)'}`),
    acts,
    h('div', { class: 'pv-sub' }, `${a.careers.length} careers`),
    h('p', { class: 'pv-note' }, lifeLine));
}
