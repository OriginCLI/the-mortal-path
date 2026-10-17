// Scope preview: what goes into the first playable, in build order, with a rough effort gauge.
import { h } from '../dom.js';

const FEATURES = {
  loop: ['Age-up loop & life log', 3], events: ['Data-driven events', 5], cultivation: ['Cultivation', 4],
  combat: ['Combat', 4], regression: ['Regression & journal', 4], relationships: ['Relationships', 4],
  sects: ['Sects & reputation', 4], jianghu: ['Gangho travel', 4], seclusion: ['Seclusion', 1],
  audio: ['Music & sound', 3], art: ['Art polish', 3], saves: ['Save / export / import', 1],
};

export function scopePreview(a, all, env) {
  const q = env.trial.questions.find((x) => x.id === 'mustHave');
  const ordered = [...a.order.filter((id) => FEATURES[id]), ...q.options.map((o) => o.id).filter((id) => !a.order.includes(id))];
  const first = ordered.filter((id) => a.mustHave.includes(id));
  const later = ordered.filter((id) => !a.mustHave.includes(id));
  const content = Math.round(a.firstEvents / 40);
  const points = first.reduce((s, id) => s + FEATURES[id][1], 0) * (a.approach === 'narrow' ? 1.25 : 0.85) + content;
  const full = Object.values(FEATURES).reduce((s, f) => s + f[1], 0) * 1.25 + Math.round(a.fullEvents / 40);
  const perYear = all.events?.perYear ?? 2;
  const perLife = 70 * perYear;
  const milestones = a.milestones === 'milestones' ? Math.max(2, Math.ceil(first.length / 2)) : 1;

  const col = (title, ids, cls) => h('div', { class: `scope-col ${cls}` },
    h('h4', {}, title),
    h('ol', {}, ids.length ? ids.map((id) => h('li', {}, FEATURES[id][0], h('small', {}, '●'.repeat(Math.ceil(FEATURES[id][1] / 1.5)))))
      : h('li', { class: 'empty' }, 'Nothing')));

  return h('div', { class: 'pv pv-scope' },
    h('div', { class: 'scroll-title' }, a.title || 'Untitled'),
    h('div', { class: 'scope-cols' },
      col('First playable', first, 'first'),
      col('Complete game adds', later, 'later')),
    h('div', { class: 'pv-sub' }, 'Effort gauge (first playable vs. complete game)'),
    h('div', { class: 'gauge' }, h('i', { style: `width:${Math.min(100, (points / full) * 100)}%` }), h('span', {}, `${Math.round((points / full) * 100)}%`)),
    h('div', { class: 'kpis' },
      h('div', { class: 'kpi' }, h('b', {}, `${a.firstEvents}`), h('small', {}, 'events at first')),
      h('div', { class: 'kpi' }, h('b', {}, `${a.fullEvents}`), h('small', {}, 'events when complete')),
      h('div', { class: 'kpi' }, h('b', {}, `${a.session}m`), h('small', {}, 'per life')),
      h('div', { class: 'kpi' }, h('b', {}, `${milestones}`), h('small', {}, milestones > 1 ? 'test milestones' : 'release'))),
    h('p', { class: 'pv-note' }, `${a.approach === 'narrow' ? 'Narrow & polished' : 'Broad & rough'} · ${{ mobile: 'phone first', desktop: 'desktop first', both: 'phone & desktop equally' }[a.platform]}.`),
    h('p', { class: 'pv-note' }, `A ~70-year life shows about ${perLife} events (${perYear} per year), so ${a.firstEvents} events cover ~${(a.firstEvents / perLife).toFixed(1)} lives before repeats; the complete game covers ~${(a.fullEvents / perLife).toFixed(1)}. Conditions and chains stretch this further.`));
}
