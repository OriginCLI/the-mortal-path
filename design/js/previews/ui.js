// UI preview: a game-screen mockup drawn with the chosen palette, layout, type, ornament, art and motion.
import { h } from '../dom.js';
import { portraitSVG, sealSVG } from '../art.js';
import { filler, termsFor, ladderFor } from './lore.js';

let view = 'phone';

export function uiPreview(a, all, env) {
  const q = env.trial.questions.find((x) => x.id === 'palette');
  const pal = q.options.find((o) => o.id === a.palette) || q.options[0];
  const [bg, panel, ink, accent, accent2] = pal.colors;
  const T = termsFor(all);
  const fill = filler(all);
  const ladder = ladderFor(all);
  const orn = Math.min(4, Math.round(a.ornament / 25));
  const has = (k) => a.art.includes(k);
  const term = (t) => (a.script === 'glossary' ? h('span', { class: 'gl', title: 'Tap for glossary' }, t) : t);
  const deco = (c) => (a.script === 'none' ? null : h('span', { class: 'deco' }, c));

  const mountains = has('backdrops')
    ? `<svg viewBox="0 0 300 80" preserveAspectRatio="none" class="mk-hills" aria-hidden="true">
        <path d="M0 80 L0 50 L40 30 L70 46 L110 14 L150 44 L190 24 L230 48 L260 34 L300 50 L300 80Z" fill="${ink}" opacity="0.10"/>
        <path d="M0 80 L0 60 L50 46 L90 58 L140 36 L200 60 L250 48 L300 62 L300 80Z" fill="${ink}" opacity="0.16"/></svg>` : '';

  const statsEl = h('div', { class: 'mk-stats' },
    [['Health', 82, accent2], ['Qi', 46, accent], ['Insight', 63, accent2], ['Karma', 55, accent]].map(([n, v, c]) =>
      h('div', { class: 'mk-stat' }, h('span', {}, n), h('span', { class: 'mk-bar' }, h('i', { style: `width:${v}%;background:${c}` })))));

  const logEl = h('div', { class: 'mk-log' },
    h('p', {}, h('b', {}, 'Age 15 '), deco('武'), fill('{S} passed the outer-disciple exam of '), term(T.Hwasan), '.'),
    h('p', {}, h('b', {}, 'Age 16 '), fill('An elder praised {p} footwork. {P} '), term(T.senior), ' did not.'),
    has('vignettes') ? h('div', { class: 'mk-vignette', html: `<svg viewBox="0 0 200 60" aria-hidden="true"><rect width="200" height="60" fill="${panel}"/><circle cx="150" cy="18" r="10" fill="${accent2}" opacity="0.7"/><path d="M0 60 L30 30 L50 44 L80 16 L110 46 L140 34 L170 50 L200 40 L200 60Z" fill="${ink}" opacity="0.35"/><path d="M60 60 l4 -18 l4 18 M64 46 l-6 4 M64 50 l6 -4" stroke="${ink}" stroke-width="1.5" opacity="0.7"/></svg>` }) : null,
    h('p', {}, h('b', {}, 'Age 17 '), deco('氣'), fill('Qi gathered in {p} dantian like morning dew.')));

  const menu = h('div', { class: 'mk-tabs' }, ['Cultivate', 'Relations', 'Activities', T.jianghu === 'rivers and lakes' ? 'Travel' : T.jianghu].map((t) => h('span', {}, t)));
  const ageBtn = h('button', { type: 'button', class: 'mk-age', tabindex: '-1' }, 'Age Up', has('seals') ? h('small', {}, '  +1 year') : null);

  const head = h('div', { class: 'mk-head' },
    h('div', { class: 'mk-hills-wrap', html: mountains }),
    has('portraits') ? h('div', { class: 'mk-portrait', html: portraitSVG(5, 17, { robe: accent2, trim: accent }) }) : null,
    h('div', { class: 'mk-id' }, h('strong', {}, T.name), h('small', {}, `Age 17 · ${ladder[2]}`)),
    has('seals') ? h('div', { class: 'mk-seal', html: sealSVG('二流', 34, accent) }) : h('span', { class: 'mk-badge' }, ladder[2]));

  const particles = has('particles')
    ? h('div', { class: 'mk-particles', 'aria-hidden': 'true' }, Array.from({ length: 10 }, (_, i) =>
      h('i', { style: `left:${(i * 37) % 100}%;animation-delay:${-(i * 0.7)}s;background:${accent}` }))) : null;
  const weather = has('weather')
    ? h('div', { class: 'mk-weather', 'aria-hidden': 'true' }, Array.from({ length: 12 }, (_, i) =>
      h('i', { style: `left:${(i * 29) % 100}%;animation-delay:${-(i * 0.9)}s` }))) : null;

  const screen = view === 'phone' || a.layout === 'mobile'
    ? h('div', { class: 'mk-col' }, head, statsEl, logEl, menu, ageBtn)
    : h('div', { class: 'mk-grid' },
      h('div', { class: 'mk-left' }, head, statsEl),
      h('div', { class: 'mk-mid' }, logEl, ageBtn),
      h('div', { class: 'mk-right' }, h('div', { class: 'mk-tabs vertical' }, [...menu.cloneNode(true).childNodes])));

  const speed = 14 - a.motion / 10;
  const mock = h('div', {
    class: `mock orn-${orn} type-${a.type} view-${view} layout-${a.layout}${a.motion > 60 ? ' lively' : ''}${a.motion < 15 ? ' still' : ''}`,
    style: `--bg:${bg};--panel:${panel};--ink:${ink};--accent:${accent};--accent2:${accent2};--spd:${speed}s`,
    role: 'img', 'aria-label': `Mockup of the game screen in ${pal.label}`,
  }, particles, weather, screen);

  const toggle = h('div', { class: 'seg', role: 'group', 'aria-label': 'Mockup device' },
    ['phone', 'desktop'].map((v) => h('button', {
      type: 'button', class: view === v ? 'on' : '', 'aria-pressed': String(view === v),
      onclick: () => { view = v; env.rerender(); },
    }, v === 'phone' ? 'Phone' : 'Desktop')));

  return h('div', { class: 'pv pv-ui' },
    toggle,
    h('div', { class: `mock-stage stage-${view}` }, mock),
    h('div', { class: 'swatch big', 'aria-hidden': 'true' }, pal.colors.map((c) => h('i', { style: `background:${c}`, title: c }))),
    h('p', { class: 'pv-note' }, `${pal.label}: ${pal.desc}`));
}
