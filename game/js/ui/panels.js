// The five tab panels, shown as bottom sheets over the chronicle.
import { h, toast } from './dom.js';
import { icon, portraitSVG, mapSVG } from './art.js';
import { director } from './sound.js';
import { openSeclusion, openDice } from './modals.js';
import { ACTIVITIES } from '../systems/life.js';
import { INTERACTIONS } from '../systems/bonds.js';
import { MANUALS, TECHS, RARITY_LABEL, MASTERY_UNLOCK } from '../content/martial.js';
import { ITEMS, RECIPES, CAREERS } from '../content/life.js';
import { LOCATIONS, SECTS, FACTIONS, REGIONS, RANK_MERIT, RANK_REALM } from '../content/world.js';
import { REALMS } from '../content/realms.js';
import { ROSTER } from '../content/npcs.js';
import { CODEX_CATS } from '../engine/registry.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { hashSeed } from '../core/rng.js';

let current = null;

export function closePanel() {
  if (!current) return;
  const { sheet, back, onClose } = current;
  sheet.classList.remove('open');
  back.classList.remove('open');
  setTimeout(() => { sheet.remove(); back.remove(); }, 260);
  current = null;
  onClose?.();
}

const TITLES = { activities: 'Activities', cultivate: 'Cultivation', bonds: 'Bonds', world: 'The World', journal: 'Memory Journal' };

export function openPanel(id, ui, sub) {
  if (current?.id === id) { closePanel(); return; }
  closePanel();
  const body = h('div', { class: 'sheet-body' });
  const back = h('div', { class: 'sheet-back', onclick: closePanel });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': TITLES[id] },
    h('div', { class: 'sheet-grab', 'aria-hidden': 'true' }),
    h('div', { class: 'sheet-head' }, h('h2', {}, TITLES[id]), h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: closePanel, html: icon('close') })),
    body);
  document.body.append(back, sheet);
  const prevFocus = document.activeElement;
  const onEsc = (e) => { if (e.key === 'Escape' && !document.querySelector('.modal-back')) closePanel(); };
  window.addEventListener('keydown', onEsc);
  current = { id, sheet, back, body, ui, sub, onClose: () => { window.removeEventListener('keydown', onEsc); prevFocus?.focus?.(); } };
  requestAnimationFrame(() => { sheet.classList.add('open'); back.classList.add('open'); });
  ui.tabs.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.tab === id)));
  render();
  sheet.querySelector('.sheet-head .icon-btn').focus();
}

export function refreshPanel() { if (current) render(); }

function render() {
  const { id, body, ui } = current;
  const fn = { activities: activitiesPanel, cultivate: cultivatePanel, bonds: bondsPanel, world: worldPanel, journal: journalPanel }[id];
  const scroll = body.scrollTop;
  body.replaceChildren(...[].concat(fn(ui.g, ui)));
  body.scrollTop = scroll;
}

// After any action: refresh, and close the sheet if an event or fight needs attention.
function after(ui) {
  if (ui.g.life.pending || ui.g.life.dead) { closePanel(); return; }
  ui.refresh();
  render();
}

function subtabs(names, key) {
  const cur = current.sub?.[key] || names[0][0];
  return { cur, el: h('div', { class: 'subtabs', role: 'group' }, names.map(([id, label]) => h('button', { 'aria-pressed': String(cur === id), onclick: () => { current.sub = { ...(current.sub || {}), [key]: id }; render(); } }, label))) };
}

// ── Activities ────────────────────────────────────────────────
function activitiesPanel(g, ui) {
  const L = g.life;
  const avail = new Set(g.availableActivities().map(([id]) => id));
  const out = [];
  out.push(h('p', { class: 'note-box' }, L.actions > 0 ? `You have ${L.actions} action${L.actions === 1 ? '' : 's'} left this season. People in Bonds can be approached once a season for free.` : 'No actions left this season. Press Next Season when you are ready.'));
  if (L.travel) out.push(h('p', { class: 'note-box' }, `You are on the road to ${LOCATIONS[L.travel.dest].name}. Only meditation, training and study are possible on the road.`));
  const grid = h('div', { class: 'act-grid' });
  for (const [id, a] of Object.entries(ACTIVITIES)) {
    if (!avail.has(id) && !(g.age >= a.minAge - 2 && g.age <= (a.maxAge ?? 999))) continue;
    const blockedRoad = L.travel && !['meditate', 'train', 'study', 'journal'].includes(id);
    const disabled = !avail.has(id) || L.actions <= 0 || !g.canAdvance() || blockedRoad;
    grid.append(h('button', {
      class: 'act-btn', disabled: disabled ? true : null,
      onclick: () => {
        if (id === 'seclusion') { openSeclusion(ui); return; }
        if (id === 'gamble') { openDice(ui); return; }
        g.doActivity(id);
        after(ui);
      },
    }, h('strong', {}, h('span', { html: icon(id) }), a.name), h('small', {}, avail.has(id) ? a.desc : `From age ${a.minAge}.`)));
  }
  out.push(grid);
  return out;
}

// ── Cultivation ───────────────────────────────────────────────
function cultivatePanel(g, ui) {
  const L = g.life;
  const out = [];
  const m = g.method();
  out.push(h('dl', { class: 'kv' },
    h('dt', {}, 'Realm'), h('dd', {}, g.stageLabel()),
    h('dt', {}, 'Heart method'), h('dd', {}, m ? `${m.name} (to ${REALMS[m.cap ?? 0].name})` : 'None. Find a teacher or a manual.'),
    h('dt', {}, 'Path'), h('dd', {}, g.path ? cap(g.path) : 'Undecided'),
    h('dt', {}, 'Lifespan'), h('dd', {}, `About ${Math.round(g.lifespan())} years`)));
  out.push(h('div', { class: 'stat', style: 'margin:8px 0' }, h('span', {}, 'Qi'), h('span', { class: 'bar qi' }, h('i', { style: `width:${L.stats.qi}%` }))));
  if (L.crippled) out.push(h('p', { class: 'note-box' }, 'Your meridians are crippled. Orthodox methods will not move qi; body arts and poison arts use other channels. Some elixirs, and some people, can mend meridians.'));
  if (L.bottleneck) {
    const can = g.canBreakthrough();
    out.push(h('div', { class: 'note-box' },
      h('p', { style: 'margin:0 0 8px' }, (L.realm >= (m?.cap ?? 0) && L.realm < 8) ? `Your heart method cannot take you past ${REALMS[L.realm].name}.` : `You stand at the threshold of the ${REALMS[L.realm + 1]?.name || ''} realm. ${g.oddsWord(g.breakthroughOdds())}`),
      h('button', { class: 'btn primary', disabled: can ? null : true, onclick: () => { director.sfx('qi'); g.attemptBreakthrough(); after(ui); } }, 'Attempt breakthrough'),
      L.foundation ? h('small', { style: 'display:block;margin-top:6px' }, 'An elixir has steadied your foundation.') : null));
  }
  // Heart methods.
  const hearts = Object.keys(L.manuals).filter((id) => MANUALS[id].type === 'heart');
  if (hearts.length > 1) {
    out.push(h('h3', {}, 'Heart methods'));
    out.push(h('div', { class: 'list' }, hearts.map((id) => h('button', {
      class: 'item', disabled: L.method === id ? true : null, onclick: () => { g.setMethod(id); g.save(); after(ui); toast(`You now cultivate the ${MANUALS[id].name}.`); },
    }, h('span', { class: 'mark', html: icon('cultivate') }), h('span', { class: 'txt' }, h('strong', {}, MANUALS[id].name), h('small', {}, `${RARITY_LABEL[MANUALS[id].rarity]} · up to ${REALMS[MANUALS[id].cap ?? 0].name}${L.method === id ? ' · current' : ' · switching costs some qi'}`))))));
  }
  // Martial arts and techniques.
  const arts = Object.keys(L.manuals).filter((id) => MANUALS[id].type === 'art');
  out.push(h('h3', {}, 'Martial arts'));
  if (!arts.length) out.push(h('p', { class: 'note-box' }, 'You know no martial arts yet.'));
  else out.push(h('div', { class: 'list' }, arts.map((id) => {
    const mm = MANUALS[id];
    const techs = mm.techs.map((t, i) => `${TECHS[t].name}${L.manuals[id] >= MASTERY_UNLOCK[i] ? '' : ` (at ${MASTERY_UNLOCK[i]}%)`}`).join('; ');
    const focus = g.trainingFocus() === id;
    return h('button', { class: 'item', onclick: () => { L.focus = id; g.save(); render(); toast(`Training focus: ${mm.name}.`); } },
      h('span', { class: 'mark', html: icon('sword') }),
      h('span', { class: 'txt' }, h('strong', {}, `${mm.name}${focus ? ' · training focus' : ''}`), h('small', {}, techs)),
      h('span', { class: 'end' }, `${Math.floor(L.manuals[id])}%`));
  })));
  // Recall from past lives.
  const recall = g.recallable();
  if (recall.length) {
    out.push(h('h3', {}, 'Rebuild from memory'));
    out.push(h('p', { class: 'note-box' }, 'Martial theory from past lives. You remember the forms; your body has to learn them again. Uses an action.'));
    out.push(h('div', { class: 'list' }, recall.map((id) => h('button', {
      class: 'item', disabled: L.actions <= 0 || g.age < 8 ? true : null, onclick: () => { g.recallManual(id); after(ui); },
    }, h('span', { class: 'mark', html: icon('scroll') }), h('span', { class: 'txt' }, h('strong', {}, MANUALS[id].name), h('small', {}, `${RARITY_LABEL[MANUALS[id].rarity]} · best mastery in any life ${g.meta.theory.manuals[id] || 0}%`))))));
  }
  // Elixirs and crafting.
  const elixirs = Object.entries(L.items).filter(([id]) => ITEMS[id].kind === 'elixir');
  if (elixirs.length) {
    out.push(h('h3', {}, 'Elixirs'));
    out.push(h('div', { class: 'list' }, elixirs.map(([id, n]) => h('button', { class: 'item', onclick: () => { g.useItem(id); after(ui); } },
      h('span', { class: 'mark', html: icon('doctor') }), h('span', { class: 'txt' }, h('strong', {}, `${ITEMS[id].name} ×${n}`), h('small', {}, ITEMS[id].desc)), h('span', { class: 'end' }, 'Take')))));
  }
  const recipes = g.craftable();
  if (recipes.length) {
    out.push(h('h3', {}, 'Furnace'));
    out.push(h('div', { class: 'list' }, recipes.map(([id, r]) => h('button', { class: 'item', disabled: g.canCraft(id) ? null : true, onclick: () => { g.craft(id); after(ui); } },
      h('span', { class: 'mark', html: icon('doctor') }), h('span', { class: 'txt' }, h('strong', {}, r.name), h('small', {}, `${Object.keys(r.needs).length ? `${Object.keys(r.needs).map((k) => ITEMS[k].name).join(', ')}, ` : ''}${r.cost} taels, Insight ${r.insight}`))))));
  }
  return out;
}

// ── Bonds ─────────────────────────────────────────────────────
const GROUPS = [
  ['Family', ['mother', 'father', 'guardian', 'sibling', 'spouse', 'child']],
  ['Love', ['lover']],
  ['Master and disciples', ['master', 'disciple']],
  ['Sworn and friends', ['sworn', 'friend']],
  ['Your sect', ['senior', 'junior']],
  ['Rivals and enemies', ['rival', 'nemesis', 'enemy']],
  ['Acquaintances', ['acquaintance']],
];

function bondsPanel(g, ui) {
  const L = g.life;
  if (current.sub?.person) return personSheet(g, ui, L.npcs[current.sub.person]);
  const people = Object.values(L.npcs).filter((n) => n.met);
  const out = [];
  if (!people.length) return [h('p', { class: 'note-box' }, 'You know no one yet.')];
  for (const [label, roles] of GROUPS) {
    const list = people.filter((n) => !n.dead && roles.includes(n.role));
    if (!list.length) continue;
    out.push(h('h3', {}, label));
    out.push(h('div', { class: 'list' }, list.map((n) => personRow(g, n))));
  }
  const dead = people.filter((n) => n.dead);
  if (dead.length) {
    out.push(h('h3', {}, 'The dead'));
    out.push(h('div', { class: 'list' }, dead.map((n) => personRow(g, n))));
  }
  return out;
}

function personRow(g, n) {
  const talked = g.life.talked[n.id];
  return h('button', { class: `item person${n.dead ? ' dead' : ''}`, onclick: () => { current.sub = { person: n.id }; render(); } },
    h('span', { class: 'mark', html: portraitSVG({ seed: hashSeed(n.id, g.meta.wheel.seed), g: n.g, age: g.npcAge(n), realm: n.realm }) }),
    h('span', { class: 'txt' }, h('strong', {}, n.name), h('small', {}, n.dead ? `Died: ${n.deathCause || 'unknown'}` : `${cap(g.roleTitle(n))} · ${g.npcAge(n)} · ${REALMS[n.realm].name}${talked ? ' · seen this season' : ''}`)),
    n.dead ? null : h('span', { class: 'end' }, heartWord(n.aff)));
}

function personSheet(g, ui, n) {
  const L = g.life;
  const r = ROSTER[n.id];
  const out = [h('button', { class: 'link', onclick: () => { current.sub = null; render(); } }, '← Everyone')];
  out.push(h('div', { class: 'person-head' },
    h('div', { class: 'portrait', html: portraitSVG({ seed: hashSeed(n.id, g.meta.wheel.seed), g: n.g, age: g.npcAge(n), realm: n.realm }) }),
    h('div', {}, h('h3', {}, n.name), h('p', {}, `${cap(g.roleTitle(n))}${n.nick ? `, ${n.nick}` : ''}`), h('p', {}, `${g.npcAge(n)} years old · ${REALMS[n.realm].name}${n.sect ? ` · ${SECTS[n.sect].name}` : ''}`))));
  if (r?.desc && g.remembers(`people.${n.id}`)) out.push(h('p', { class: 'note-box' }, r.desc));
  out.push(h('div', { class: 'chips' }, n.traits.map((t) => h('span', { class: 'chip' }, t)), n.romance && !n.dead ? h('span', { class: 'chip red' }, 'could be courted') : null));
  if (n.dead) { out.push(h('p', { class: 'note-box' }, `${n.deathCause || 'Dead'}${n.deathYear ? `, in year ${n.deathYear}` : ''}.`)); return out; }
  out.push(h('div', { class: 'meters' },
    h('span', {}, 'Affection'), h('span', { class: 'bar aff', role: 'meter', 'aria-label': 'Affection', 'aria-valuenow': Math.round(n.aff), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${n.aff}%` })),
    h('span', {}, 'Respect'), h('span', { class: 'bar res', role: 'meter', 'aria-label': 'Respect', 'aria-valuenow': Math.round(n.res), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${n.res}%` }))));
  const acts = g.availableInteractions(n);
  if (L.talked[n.id]) out.push(h('p', { class: 'note-box' }, 'You have already spent time with them this season.'));
  out.push(h('div', { class: 'act-grid' }, acts.map((a) => h('button', {
    class: 'act-btn', disabled: L.talked[n.id] || !g.canAdvance() ? true : null,
    onclick: () => {
      if (a === 'kill' && !window.confirm(`Assassinate ${n.name}? There is no taking this back.`)) return;
      const res = g.interact(n.id, a);
      if (res?.text) toast(res.text, '', 5000);
      after(ui);
    },
  }, h('strong', {}, INTERACTIONS[a]), h('small', {}, interactionHint(a, n, g))))));
  return out;
}

function interactionHint(a, n, g) {
  switch (a) {
    case 'talk': return 'Raises affection.';
    case 'spar': return 'Train together; earns respect.';
    case 'gift': return Object.keys(g.life.items).some((i) => ITEMS[i].kind === 'gift') ? 'Give your best gift.' : 'Ten taels, if you have no gift.';
    case 'learn': return n.role === 'master' ? 'Your master may teach you a new art.' : 'They may correct your form.';
    case 'provoke': return 'They may challenge you.';
    case 'duel': return 'A real fight.';
    case 'oath': return 'Needs deep affection and respect.';
    case 'confess': return 'Needs real affection.';
    case 'propose': return 'Needs great affection.';
    case 'warn': return 'Use what you remember. Will they believe you?';
    case 'kill': return 'Infamy, and no way back.';
    case 'teach': return 'Pass your arts on.';
    case 'disciple': return 'Take them as your disciple.';
    default: return '';
  }
}

// ── World ─────────────────────────────────────────────────────
function worldPanel(g, ui) {
  const tabs = subtabs([['here', 'Here'], ['map', 'Travel'], ['factions', 'Factions'], ['work', 'Career'], ['market', 'Market']], 'world');
  const out = [tabs.el];
  const L = g.life;
  const loc = LOCATIONS[L.loc];
  if (tabs.cur === 'here') {
    out.push(h('h3', {}, loc.name), h('p', {}, loc.desc), h('p', { class: 'chip' }, REGIONS[loc.region].short));
    const sects = Object.entries(SECTS).filter(([, s]) => s.loc === L.loc);
    for (const [id, s] of sects) {
      const can = g.canSeekAdmission(id);
      out.push(h('div', { class: 'note-box' }, h('strong', {}, s.name), h('p', { style: 'margin:4px 0' }, s.desc),
        L.sect === id ? h('span', { class: 'chip jade' }, `You are ${s.ranks[L.rank]}`)
          : h('button', { class: 'btn small', disabled: can ? null : true, onclick: () => { g.seekAdmission(id); after(ui); } }, can ? 'Seek admission (uses an action)' : admissionBlock(g, id))));
    }
    const locals = Object.values(L.npcs).filter((n) => n.met && !n.dead && n.loc === L.loc && n.role !== 'mother' && n.role !== 'father');
    if (locals.length) out.push(h('h3', {}, 'People here'), h('div', { class: 'list' }, locals.slice(0, 12).map((n) => personRow(g, n))));
  }
  if (tabs.cur === 'map') {
    const map = h('div', { html: mapSVG(LOCATIONS, L.loc, L.travel) });
    const pick = (e) => {
      const el = e.target.closest('[data-loc]');
      if (!el) return;
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      current.sub = { ...(current.sub || {}), dest: el.dataset.loc };
      render();
    };
    map.addEventListener('click', pick);
    map.addEventListener('keydown', pick);
    out.push(map);
    const dest = current.sub?.dest;
    if (dest && dest !== L.loc) {
      const d = g.destinations().find((x) => x.id === dest);
      out.push(h('div', { class: 'note-box' }, h('strong', {}, d.name), h('p', { style: 'margin:4px 0' }, d.desc),
        h('p', { style: 'margin:4px 0' }, `${d.seasons === 1 ? 'One season' : `${d.seasons} seasons`} on the road. Roads are dangerous.`),
        h('button', { class: 'btn primary small', disabled: g.canTravel() ? null : true, onclick: () => { closePanel(); g.travel(dest); ui.refresh(true); } }, g.age < 12 ? 'Too young to travel alone' : 'Set out')));
    } else out.push(h('p', { class: 'note-box' }, 'Tap a place on the map to plan a journey.'));
  }
  if (tabs.cur === 'factions') {
    if (L.sect) {
      const s = SECTS[L.sect];
      const next = L.rank + 1;
      out.push(h('div', { class: 'note-box' }, h('strong', {}, s.name), h('p', { style: 'margin:4px 0' }, `Rank: ${s.ranks[L.rank]}. Merit ${Math.floor(L.merit)}${next <= 3 ? ` (next rank at ${RANK_MERIT[next]} merit and ${REALMS[RANK_REALM[next]].name} realm)` : ''}.`),
        h('button', { class: 'btn small ghost', onclick: () => { if (window.confirm(`Leave the ${s.name}?`)) { g.leaveSect(false); g.save(); after(ui); } } }, 'Leave')));
    }
    out.push(h('div', { class: 'list' }, Object.entries(FACTIONS).map(([id, f]) => h('div', { class: 'item' },
      h('span', { class: 'mark', html: icon('sect'), style: `color:${f.color}` }),
      h('span', { class: 'txt' }, h('strong', {}, f.name), h('small', {}, f.desc)),
      h('span', { class: 'end' }, g.repWord(L.rep[id] || 0))))));
    out.push(h('p', { class: 'note-box' }, `Fame ${Math.floor(L.stats.fame)} · Infamy ${Math.floor(L.stats.infamy)}. Both follow your name wherever you go.`));
  }
  if (tabs.cur === 'work') {
    if (L.career) {
      const c = CAREERS[L.career.id];
      out.push(h('div', { class: 'note-box' }, h('strong', {}, `${c.ranks[L.career.rank]} (${c.name})`), h('p', { style: 'margin:4px 0' }, c.desc),
        h('button', { class: 'btn small ghost', onclick: () => { g.setCareer(null); g.save(); after(ui); } }, 'Quit')));
    }
    const jobs = g.availableCareers();
    if (jobs.length) out.push(h('h3', {}, 'Find work'), h('div', { class: 'list' }, jobs.map(([id, c]) => h('button', { class: 'item', onclick: () => { g.takeCareer(id); after(ui); } },
      h('span', { class: 'mark', html: icon('career') }), h('span', { class: 'txt' }, h('strong', {}, c.name), h('small', {}, c.desc)), h('span', { class: 'end' }, `${c.pay[0]}+ taels`)))));
    else if (!L.career) out.push(h('p', { class: 'note-box' }, 'Nobody will hire you yet.'));
  }
  if (tabs.cur === 'market') {
    const items = g.marketItems();
    if (!items.length) out.push(h('p', { class: 'note-box' }, 'There is nothing to buy here.'));
    else out.push(h('p', { class: 'chip' }, `You have ${Math.floor(L.stats.wealth)} taels`), h('div', { class: 'list' }, items.map((id) => h('button', {
      class: 'item', disabled: L.stats.wealth < g.price(id) ? true : null, onclick: () => { if (g.buy(id)) toast(`Bought: ${ITEMS[id].name}.`); render(); ui.refresh(); },
    }, h('span', { class: 'mark', html: icon('shop') }), h('span', { class: 'txt' }, h('strong', {}, ITEMS[id].name), h('small', {}, ITEMS[id].desc)), h('span', { class: 'end' }, `${g.price(id)} taels`)))));
    const books = g.bookstall();
    if (books.length) out.push(h('h3', {}, 'Bookstall'), h('div', { class: 'list' }, books.map(([id, price]) => h('button', {
      class: 'item', disabled: L.stats.wealth < price || id in L.manuals ? true : null, onclick: () => { g.buyManual(id); after(ui); },
    }, h('span', { class: 'mark', html: icon('scroll') }), h('span', { class: 'txt' }, h('strong', {}, MANUALS[id].name), h('small', {}, MANUALS[id].desc || 'A common manual.')), h('span', { class: 'end' }, id in L.manuals ? 'Known' : `${price} taels`)))));
    const inv = Object.entries(L.items).filter(([id]) => ITEMS[id].kind !== 'elixir');
    if (inv.length) out.push(h('h3', {}, 'You carry'), h('div', { class: 'chips' }, inv.map(([id, n]) => h('span', { class: 'chip' }, `${ITEMS[id].name}${n > 1 ? ` ×${n}` : ''}`))));
  }
  return out;
}

function admissionBlock(g, id) {
  const s = SECTS[id];
  const L = g.life;
  if (L.flags[`expelled.${id}`]) return 'You were expelled';
  if (s.admit.gender && s.admit.gender !== L.gender) return 'They take only women';
  if (s.admit.origin && !s.admit.origin.includes(L.origin)) return 'Closed to outsiders';
  if (s.admit.age && (g.age < s.admit.age[0] || g.age > s.admit.age[1])) return `Ages ${s.admit.age[0]} to ${s.admit.age[1]} only`;
  if (L.actions <= 0) return 'No actions left this season';
  return 'They will not see you';
}

// ── Journal ───────────────────────────────────────────────────
function journalPanel(g) {
  const tabs = subtabs([['codex', 'Memories'], ['notes', 'Notes'], ['lives', 'Past lives'], ['ach', 'Achievements']], 'journal');
  const out = [tabs.el];
  const m = g.meta;
  if (tabs.cur === 'codex') {
    const ids = Object.keys(m.codex);
    out.push(h('p', { class: 'note-box' }, ids.length
      ? `Life ${m.loop}. What you know carries across death; your body does not. Memories blur after three lives unless you read them again or write a note on them.`
      : 'You remember nothing from other lives. Yet.'));
    for (const [cat, label] of Object.entries(CODEX_CATS)) {
      const inCat = ids.filter((id) => g.codexEntry(id).cat === cat);
      if (!inCat.length) continue;
      out.push(h('h3', {}, `${label} (${inCat.length})`));
      for (const id of inCat.sort((a, b) => (m.codex[b].loop - m.codex[a].loop))) {
        const e = g.codexEntry(id);
        const rec = m.codex[id];
        const fade = g.fadeLevel(id);
        out.push(h('div', { class: `journal-entry fade${fade}` },
          h('h4', {}, e.title),
          h('p', {}, fade >= 3 ? 'The memory has blurred. Something about this mattered.' : e.text),
          h('div', { class: 'meta' }, `First learned in life ${rec.first}${rec.loop !== rec.first ? `, last confirmed in life ${rec.loop}` : ''}${fade ? ` · ${['', 'a little hazy', 'fading', 'faded'][fade]}` : ''}`),
          rec.note ? h('p', { class: 'annot' }, `Your note: ${rec.note}`) : null,
          h('button', { class: 'link', onclick: () => { const t = window.prompt('Your note (notes never fade):', rec.note || ''); if (t != null) { g.annotate(id, t); render(); } } }, rec.note ? 'Edit note' : 'Add a note')));
      }
    }
  }
  if (tabs.cur === 'notes') {
    const ta = h('textarea', { class: 'input', rows: 3, placeholder: 'Write something down for your next life…', 'aria-label': 'New note' });
    out.push(ta, h('button', { class: 'btn small', style: 'margin:6px 0 12px', onclick: () => { g.addNote(ta.value); render(); } }, 'Save note'));
    if (!m.notes.length) out.push(h('p', { class: 'note-box' }, 'Notes you write here are never forgotten.'));
    m.notes.slice().reverse().forEach((n, ri) => {
      const i = m.notes.length - 1 - ri;
      out.push(h('div', { class: 'journal-entry' }, h('p', {}, n.text), h('div', { class: 'meta' }, `Life ${n.loop}, age ${n.age}`), h('button', { class: 'link', onclick: () => { g.removeNote(i); render(); } }, 'Erase')));
    });
  }
  if (tabs.cur === 'lives') {
    out.push(h('p', { class: 'note-box' }, `Life ${m.loop}. Deaths: ${m.stats.deaths}. Karmic burden: ${m.burden}/10. Heaven’s attention: ${heavenWord(m.gaze)}.`));
    if (!m.hall.length) out.push(h('p', {}, 'This is your first life.'));
    m.hall.slice().reverse().forEach((e) => out.push(h('div', { class: 'hall-entry' },
      h('h4', {}, `Life ${e.loop}: ${e.name}, ${e.title}`),
      h('div', { class: 'meta' }, `Died at ${e.age} in year ${e.year} · ${REALMS[e.realm].name}${e.sect ? ` · ${SECTS[e.sect].name}` : ''}`),
      h('p', {}, e.cause), h('p', { style: 'font-style:italic' }, e.epitaph))));
  }
  if (tabs.cur === 'ach') {
    const got = Object.keys(m.achievements).length;
    out.push(h('p', { class: 'note-box' }, `${got} of ${Object.keys(ACHIEVEMENTS).length} achievements.`));
    out.push(h('div', { class: 'ach-grid' }, Object.entries(ACHIEVEMENTS).map(([id, a]) => h('div', { class: `ach${m.achievements[id] ? ' got' : ''}` }, h('strong', {}, m.achievements[id] ? a.name : '???'), m.achievements[id] ? `${a.desc} (life ${m.achievements[id]})` : a.desc))));
  }
  return out;
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const heartWord = (a) => (a >= 85 ? 'devoted' : a >= 65 ? 'warm' : a >= 45 ? 'friendly' : a >= 25 ? 'cool' : 'cold');
const heavenWord = (g) => (g >= 15 ? 'a burning gaze' : g >= 8 ? 'watching closely' : g >= 3 ? 'it has noticed you' : 'indifferent');
