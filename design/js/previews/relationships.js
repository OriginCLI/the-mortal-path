// Relationships preview: a web of bonds around the player; tap a person to see their interaction menu.
import { h, esc } from '../dom.js';
import { termsFor } from './lore.js';

const PEOPLE = {
  family: { who: 'Mother', name: 'Kim So-yeon', warm: true, aff: 92, res: 60 },
  master: { who: 'Master', name: 'Elder Un-am', warm: true, aff: 55, res: 80 },
  disciple: { who: 'Disciple', name: 'Little Dok', warm: true, aff: 70, res: 85 },
  sect: { who: 'Sect sibling', name: 'Yun Jong', warm: true, aff: 64, res: 50 },
  rival: { who: 'Rival', name: '{rival}', warm: false, aff: 20, res: 75 },
  sworn: { who: 'Sworn brother', name: 'Jang Il-do', warm: true, aff: 88, res: 70 },
  lover: { who: 'Beloved', name: 'Yeon Hwa', warm: true, aff: 81, res: 66 },
  child: { who: 'Daughter', name: 'Baek Ha-eun', warm: true, aff: 95, res: 40 },
  enemy: { who: 'Nemesis', name: 'Blood Blade Ghost', warm: false, aff: 2, res: 45 },
};
const ACTIONS = {
  talk: 'Share tea', spar: 'Spar', gift: 'Give a gift', learn: 'Ask for teaching', provoke: 'Provoke',
  duel: 'Challenge to a duel', oath: 'Swear brotherhood', confess: 'Confess feelings', warn: 'Warn of the future', kill: 'Assassinate',
};
const FITS = {
  family: ['talk', 'gift', 'warn'], master: ['talk', 'gift', 'learn', 'spar', 'warn'], disciple: ['talk', 'spar', 'gift', 'warn'],
  sect: ['talk', 'spar', 'gift', 'provoke', 'oath', 'warn'], rival: ['spar', 'provoke', 'duel', 'talk', 'oath', 'kill'],
  sworn: ['talk', 'spar', 'gift', 'warn'], lover: ['talk', 'gift', 'confess', 'warn'], child: ['talk', 'gift', 'learn'],
  enemy: ['provoke', 'duel', 'kill', 'talk'],
};
const REPLIES = {
  talk: '{n} poured the tea and talked until the candle guttered.',
  spar: 'You crossed wooden swords with {n} until both of you were laughing and bruised.',
  gift: '{n} turned the jade pendant over in their hands, and smiled.',
  learn: '{n} sighed, but corrected your stance for an hour.',
  provoke: '{n}’s eyes narrowed. “Say that again.”',
  duel: '{n} accepted. Dawn, at the cliff of broken swords.',
  oath: 'Under the peach trees, you and {n} cut your palms and swore to die on the same day.',
  confess: '{n} looked away, then back. “…Took you long enough.”',
  warn: '{n} did not believe you. Not yet.',
  kill: 'You sharpen a needle and wait for the new moon.',
};

export function relationshipsPreview(a, all) {
  const T = termsFor(all);
  const types = a.types.filter((t) => a.romance !== 'none' || t !== 'lover');
  const nm = (id) => PEOPLE[id].name.replace('{rival}', T.rival);
  const cx = 190;
  const cy = 120;
  const R = 88;
  const thick = 1 + a.depth / 30;
  const nodes = types.map((id, i) => {
    const ang = (i / types.length) * Math.PI * 2 - Math.PI / 2;
    return { id, x: cx + Math.cos(ang) * R * 1.25, y: cy + Math.sin(ang) * R * 0.95 };
  });
  const svg = `<svg viewBox="0 0 380 240" class="web" role="img" aria-label="Relationship web">
    ${nodes.map((n) => `<line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" stroke="${PEOPLE[n.id].warm ? '#d8a94a' : '#c23b2b'}" stroke-opacity="0.6" stroke-width="${thick.toFixed(1)}" ${PEOPLE[n.id].warm ? '' : 'stroke-dasharray="4 3"'}/>`).join('')}
    <circle cx="${cx}" cy="${cy}" r="20" fill="#b8352a"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="#f6e7cd" font-weight="700">YOU</text>
    ${nodes.map((n) => `<g class="person" data-id="${n.id}" tabindex="0" role="button" aria-label="${esc(PEOPLE[n.id].who)}: ${esc(nm(n.id))}">
      <circle cx="${n.x}" cy="${n.y}" r="15" fill="#251f19" stroke="${PEOPLE[n.id].warm ? '#d8a94a' : '#c23b2b'}" stroke-width="1.6"/>
      <text x="${n.x}" y="${n.y + 3}" text-anchor="middle" font-size="7.5" fill="#efe4cf">${esc(PEOPLE[n.id].who.split(' ')[0])}</text>
      <text x="${n.x}" y="${n.y + 25}" text-anchor="middle" font-size="7" fill="#a8987e">${esc(nm(n.id))}</text></g>`).join('')}
  </svg>`;

  const panel = h('div', { class: 'rel-panel' });
  const show = (id) => {
    const p = PEOPLE[id];
    const acts = (FITS[id] || []).filter((x) => a.interactions.includes(x));
    const meters = a.meters === 'hidden'
      ? h('p', { class: 'pv-note' }, p.aff > 60 ? 'You sense warmth in how they say your name.' : 'Their courtesy is a closed door.')
      : h('div', {},
        meter('Affection', p.aff, 'hp'),
        a.meters === 'two' ? meter('Respect', p.res, 'qi') : null);
    const reply = h('p', { class: 'rel-reply', 'aria-live': 'polite' });
    panel.replaceChildren(
      h('div', { class: 'rel-head' }, h('strong', {}, nm(id)), h('span', {}, ` · ${p.who}`)),
      meters,
      h('div', { class: 'rel-acts' }, acts.length
        ? acts.map((x) => h('button', { type: 'button', class: 'chip-btn', onclick: () => { reply.textContent = REPLIES[x].replace('{n}', nm(id)); } }, ACTIONS[x]))
        : h('span', { class: 'pv-note' }, 'No interactions selected for this bond.')),
      reply);
  };
  const wrap = h('div', { class: 'web-wrap', html: svg });
  wrap.addEventListener('click', (e) => { const g = e.target.closest('.person'); if (g) show(g.dataset.id); });
  wrap.addEventListener('keydown', (e) => {
    const g = e.target.closest('.person');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(g.dataset.id); }
  });
  if (types.length) show(types.includes('master') ? 'master' : types[0]);

  const tragedy = ['rarely', 'sometimes', 'often', 'very often', 'constantly'][Math.min(4, Math.round(a.tragedy / 25))];
  return h('div', { class: 'pv pv-rel' },
    wrap, panel,
    h('p', { class: 'pv-note' },
      `Gold = bonds, red dashed = hostility. Loved ones die ${tragedy}; betrayal odds ~${Math.round(a.betrayal / 4)}% per close bond per decade. Romance: ${a.romance}.`));
}

function meter(label, v, cls) {
  return h('div', { class: 'bar-row' }, h('span', {}, label), h('span', { class: `bar ${cls}` }, h('i', { style: `width:${v}%` })));
}
