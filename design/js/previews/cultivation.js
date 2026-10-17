// Cultivation preview: the realm staircase with projected ages, breakthrough odds,
// and a live "attempt breakthrough" roll that uses the chosen deviation outcomes.
import { h, esc } from '../dom.js';
import { sfx } from '../audio.js';
import { ladderFor, realmAges, lifespanAt, breakthroughOdds } from './lore.js';
import { chip } from './tone.js';

const TALENT = {
  constitutions: [
    'Rolled at birth: Nine Yin Absolute Meridians. Talent is doubled, but you die of cold by 20 unless cured.',
    'Rolled at birth: Heaven-Spurned Body. Breakthroughs are harder, and qi deviation never drives you mad.',
    'Rolled at birth: ordinary meridians, like ninety-nine children in a hundred.',
  ],
  stat: ['Talent: 7 / 10. Comfortably above average.', 'Talent: 3 / 10. Hard work ahead.'],
  effort: ['No innate gifts. What you know is all you have.'],
};
const DEVIATION = {
  injury: 'Qi rebounds through the meridians. Internal injury: three years of recovery.',
  crippled: 'A meridian tears with a sound like silk ripping. Cultivation is sealed until a cure is found.',
  madness: 'Red mist fills your vision. Heart-demon +30; the demonic path whispers.',
  death: 'The dantian ruptures. Qi burns outward from the navel. You die, and the wheel turns.',
  insight: 'Through the agony, a strange insight: you have learned the forbidden Reversed Meridian Step.',
};

export function cultivationPreview(a, all) {
  const names = ladderFor(all);
  const ages = realmAges(a.speed);
  const subs = { none: 1, three: 3, nine: 9 }[a.substages];
  const W = 380;
  const H = 230;
  const stepW = W / names.length;

  const geo = names.map((nm, i) => ({
    nm, x: i * stepW, y: H - 30 - i * 21, life: lifespanAt(all, i),
    unreachable: i > 0 && ages[i] > lifespanAt(all, i - 1),
  }));
  const rects = geo.map(({ x, y, unreachable }, i) => {
    const ticks = i === 0 || subs === 1 ? '' : Array.from({ length: subs - 1 }, (_, k) =>
      `<line x1="${x + ((k + 1) * stepW) / subs}" y1="${y}" x2="${x + ((k + 1) * stepW) / subs}" y2="${y + 4}" stroke="#0f0d0c" stroke-opacity="0.6"/>`).join('');
    return `<rect x="${x + 1}" y="${y}" width="${stepW - 2}" height="${H - y - 18}" rx="2" fill="${unreachable ? '#3a2f25' : `hsl(${38 - i * 3} ${50 + i * 4}% ${30 + i * 4}%)`}"/>${ticks}`;
  }).join('');
  const labels = geo.map(({ nm, x, y, life, unreachable }, i) => `
      <text x="${x + stepW / 2}" y="${y - 14}" text-anchor="middle" font-size="7.4" fill="#efe4cf" paint-order="stroke" stroke="#17130f" stroke-width="2.5">${esc(nm)}</text>
      <text x="${x + stepW / 2}" y="${y - 5}" text-anchor="middle" font-size="7" fill="${unreachable ? '#c96a5a' : '#a8987e'}">${i === 0 ? 'birth' : unreachable ? `~${ages[i]}*` : `~${ages[i]}`}</text>
      <text x="${x + stepW / 2}" y="${H - 6}" text-anchor="middle" font-size="6.5" fill="#7d6f5d">${i === 0 ? '' : `${breakthroughOdds(a.risk, i)}%`}</text>
      ${life > 150 && i > 0 ? `<text x="${x + stepW / 2}" y="${y + 12}" text-anchor="middle" font-size="6.5" fill="#1a130c">${life}y</text>` : ''}`).join('');
  const steps = rects + labels;

  const svg = `<svg viewBox="0 0 ${W} ${H}" class="stairs" role="img" aria-label="Realm staircase with projected ages">${steps}
    <text x="2" y="${H - 6}" font-size="6.5" fill="#7d6f5d">odds →</text></svg>`;

  const talentLines = TALENT[a.talent];
  const out = h('div', { class: 'roll-out', 'aria-live': 'polite' }, 'Pick a realm and try to break through.');
  const sel = h('select', { class: 'mini-select', 'aria-label': 'Realm to attempt' },
    names.slice(1).map((nm, i) => h('option', { value: i + 1, selected: i + 1 === 4 ? true : null }, `${names[i]} → ${nm}`)));
  let tries = 0;
  const attempt = () => {
    tries++;
    const k = Number(sel.value);
    const odds = breakthroughOdds(a.risk, k);
    const roll = Math.random() * 100;
    out.classList.remove('good', 'bad');
    if (roll < odds) {
      out.classList.add('good');
      out.textContent = `Success (${odds}% odds). The bottleneck shatters, and you stand in the ${names[k]} realm.`;
      sfx('breakthrough', { intensity: 0.5 });
    } else {
      out.classList.add('bad');
      const pool = a.deviation.length ? a.deviation : ['injury'];
      // Deadlier outcomes are more likely the higher the risk slider.
      const weights = pool.map((id) => ({ injury: 40, crippled: 20, madness: 20, death: 5 + a.risk / 4, insight: 6 }[id]));
      let pick = Math.random() * weights.reduce((s, w) => s + w, 0);
      const id = pool.find((_, i) => (pick -= weights[i]) < 0) || pool[0];
      out.textContent = `Qi deviation! (${odds}% odds) ${DEVIATION[id]}`;
      sfx(id === 'death' ? 'death' : 'deviation', { intensity: 0.5 });
    }
    out.dataset.tries = tries;
  };

  return h('div', { class: 'pv pv-cult' },
    h('div', { class: 'stairs-wrap', html: svg }),
    h('p', { class: 'pv-note' }, 'Typical age to reach each realm; * means beyond a single lifespan, only reachable with regression knowledge or great fortune. Bottom row shows breakthrough odds.'),
    h('div', { class: 'roll' }, sel, h('button', { type: 'button', class: 'btn small', onclick: attempt }, 'Attempt breakthrough'), out),
    h('div', { class: 'pv-sub' }, 'Talent'),
    h('p', { class: 'pv-note' }, talentLines[0]),
    h('div', { class: 'pv-sub' }, 'Paths & sources'),
    h('div', { class: 'pv-chips' }, a.paths.map((p) => chip({ orthodox: 'Orthodox', unorthodox: 'Unorthodox', demonic: 'Demonic', external: 'External', poison: 'Medicine & poison' }[p], `path-${p}`)),
      a.resources.map((r) => chip({ manuals: 'Manuals', elixirs: 'Elixirs', masters: 'Masters', seclusion: 'Seclusion', enlightenment: 'Enlightenment', absorption: 'Qi absorption' }[r], 'term'))));
}
