// Difficulty preview: a Monte Carlo of 2,000 simulated lives using this trial's sliders together with the
// cultivation pace/risk and lifespan answers, showing when and how people die and how far they climb.
import { h, rng } from '../dom.js';
import { ladderFor, lifespanAt, breakthroughOdds, BASE_YEARS } from './lore.js';

export function simulate(all, n = 2000, seed = 99) {
  const d = all.difficulty;
  const c = all.cultivation;
  const r = rng(seed);
  const diff = d.overall / 100;
  const danger = d.mortality / 100;
  const scarcity = d.scarcity / 100;
  const control = d.agency / 100;
  const speed = c.speed / 100;
  const deviationKills = c.deviation.includes('death');
  const ages = [];
  const causes = { illness: 0, violence: 0, deviation: 0, age: 0 };
  const realms = new Array(9).fill(0);
  for (let i = 0; i < n; i++) {
    let age = 0;
    let realm = 0;
    let progress = 0;
    let cause = 'age';
    for (;;) {
      age++;
      const limit = lifespanAt(all, realm);
      const child = age < 6 ? 0.004 + 0.012 * diff : 0;
      const sick = 0.002 + 0.004 * diff;
      const violent = age >= 14 ? (0.002 + 0.018 * danger * (0.4 + diff)) * (1.15 - control * 0.4) / (1 + realm * 0.25) : 0;
      const old = age > limit - 25 ? Math.exp((age - limit) / 6) * 0.2 : 0;
      const roll = r();
      if (roll < child + sick) { cause = 'illness'; break; }
      if (roll < child + sick + violent) { cause = 'violence'; break; }
      if (roll < child + sick + violent + old || age > limit + 20) { cause = 'age'; break; }
      if (age >= 8 && realm < 8) {
        progress += (0.5 + speed * 1.6) * (1.2 - scarcity * 0.5) * r.range(0.6, 1.4);
        if (progress >= BASE_YEARS[realm + 1] * 1.1) {
          progress = 0;
          const odds = breakthroughOdds(c.risk, realm + 1) / 100;
          if (r() < odds) realm++;
          else if (deviationKills && r() < (c.risk / 100) * 0.12 * (0.6 + diff)) { cause = 'deviation'; break; }
        }
      }
    }
    ages.push(age);
    causes[cause]++;
    realms[realm]++;
  }
  const avg = ages.reduce((s, x) => s + x, 0) / n;
  const under20 = ages.filter((x) => x < 20).length / n;
  const reachPeak = realms.slice(4).reduce((s, x) => s + x, 0) / n;
  return { ages, causes, realms, avg, under20, reachPeak, n };
}

export function difficultyPreview(a, all) {
  const sim = simulate(all);
  const buckets = new Array(10).fill(0);
  sim.ages.forEach((x) => { buckets[Math.min(9, Math.floor(x / 15))]++; });
  const max = Math.max(...buckets);
  const W = 360;
  const H = 130;
  const bw = W / buckets.length;
  const bars = buckets.map((b, i) => {
    const bh = (b / max) * (H - 30);
    return `<rect x="${i * bw + 3}" y="${H - 18 - bh}" width="${bw - 6}" height="${bh}" rx="2" fill="${i < 2 ? '#c23b2b' : '#d8a94a'}" opacity="0.85"/>
      <text x="${i * bw + bw / 2}" y="${H - 6}" font-size="7.5" fill="#a8987e" text-anchor="middle">${i === 9 ? '135+' : i * 15}</text>`;
  }).join('');
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="hist" role="img" aria-label="Distribution of age at death">${bars}</svg>`;
  const pct = (x) => `${Math.round(x * 100)}%`;
  const lives = sim.reachPeak > 0 ? Math.max(1, Math.round(1 / sim.reachPeak)) : '∞';
  const ladder = ladderFor(all);
  const c = sim.causes;
  const causeBar = h('div', { class: 'cause-bar' },
    [['illness', '#7b958c', 'Illness'], ['violence', '#c23b2b', 'Violence'], ['deviation', '#b98ad9', 'Qi deviation'], ['age', '#d8a94a', 'Old age']].map(([k, col, label]) =>
      h('i', { style: `width:${(c[k] / sim.n) * 100}%;background:${col}`, title: `${label} ${pct(c[k] / sim.n)}` })));

  return h('div', { class: 'pv pv-diff' },
    h('div', { class: 'pv-sub' }, `Age at death across ${sim.n.toLocaleString()} simulated lives`),
    h('div', { class: 'hist-wrap', html: svg }),
    h('div', { class: 'kpis' },
      kpi(`${Math.round(sim.avg)}`, 'average lifespan'),
      kpi(pct(sim.under20), 'die before 20'),
      kpi(pct(sim.reachPeak), `reach ${ladder[4]}`),
      kpi(`${lives}`, `lives to reach ${ladder[4]}*`)),
    h('div', { class: 'pv-sub' }, 'How lives end'),
    causeBar,
    h('div', { class: 'cause-legend' },
      ['Illness', 'Violence', 'Qi deviation', 'Old age'].map((l, i) => h('span', {}, h('i', { style: `background:${['#7b958c', '#c23b2b', '#b98ad9', '#d8a94a'][i]}` }), `${l} ${pct(Object.values(c)[i] / sim.n)}`))),
    h('p', { class: 'pv-note' }, '* with no regression knowledge. A regressor who knows where the manuals are should need far fewer. Uses your cultivation pace, breakthrough risk and lifespan answers.'));
}

function kpi(v, label) {
  return h('div', { class: 'kpi' }, h('b', {}, v), h('small', {}, label));
}
