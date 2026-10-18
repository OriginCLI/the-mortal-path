// Registries for events, templates and codex (memory) entries, plus the category weights from the spec.
//
// Event shape (all optional except id/cat):
//   id, cat, w (weight, default 1), once (default true), cd (cooldown years when repeatable),
//   if (conditions), on (activity id, 'road', 'seclusion' or 'scheduled'), title, text (string | variants),
//   art (vignette id), fmt ('letter' | 'game'), from (npc for letters), game (mini-game id),
//   bind ({ role: spec } for generated or existing NPCs), fx (log-only outcome),
//   choices: [{ t, hint, req, show, p, roll: { stat, dc }, r, ok, no }]
// Outcome shape: any effect keys from fx.js plus text.

export const EVENTS = new Map();
export const CODEX = new Map();
export const TEMPLATES = new Map();

// Deck weight per category, from the spec ranking (Daily life highest).
export const CAT_WEIGHT = {
  daily: 25, fortune: 17, sect: 13, bonds: 11, tournament: 9, jianghu: 8, timeline: 7, war: 6, crime: 5,
};
export const CATEGORIES = Object.keys(CAT_WEIGHT);
export const CAT_LABEL = {
  daily: 'Daily life', fortune: 'Fortuitous encounter', sect: 'Sect life', bonds: 'Bonds', tournament: 'Tournament',
  jianghu: 'The Gangho', timeline: 'History', war: 'War', crime: 'The dark path',
};

// Codex categories match the spec's "what carries over".
export const CODEX_CATS = {
  timeline: 'Timeline', secrets: 'Secrets & places', people: 'People', theory: 'Martial theory', recipes: 'Recipes & crafts',
};

export function defineCodex(entry) {
  if (!entry || !entry.id) throw new Error('Codex entry needs an id');
  const prev = CODEX.get(entry.id);
  if (prev && (prev.title !== entry.title || prev.text !== entry.text)) {
    throw new Error(`Codex entry "${entry.id}" defined twice with different text`);
  }
  CODEX.set(entry.id, { cat: 'secrets', ...entry });
}

// Walk an event and register any inline codex definitions ({ codex: { id, cat, title, text } }).
function harvestCodex(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach(harvestCodex); return; }
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'codex') {
      for (const c of Array.isArray(v) ? v : [v]) if (c && typeof c === 'object') defineCodex(c);
    } else if (typeof v === 'object' && typeof v !== 'function') harvestCodex(v);
  }
}

export function defineEvent(ev, source = '') {
  if (!ev.id) throw new Error(`Event without id in ${source}`);
  if (EVENTS.has(ev.id)) throw new Error(`Duplicate event id "${ev.id}" (${source})`);
  const e = { w: 1, once: true, ...ev, source };
  EVENTS.set(e.id, e);
  harvestCodex(e);
  return e;
}

export function defineEvents(list, source = '') {
  list.forEach((ev) => defineEvent(ev, source));
}

// A template is hand-written once and instantiated per row. Each row must give the instance its own
// outcome logic (different stakes, enemies, factions, rewards); the linter checks rows differ.
export function template(id, rows, build) {
  TEMPLATES.set(id, { id, rows: rows.length });
  return rows.map((row) => ({ ...build(row), id: `${id}.${row.key}`, tpl: id }));
}

export function stats() {
  const byCat = {};
  let bespoke = 0;
  let templated = 0;
  for (const e of EVENTS.values()) {
    byCat[e.cat] = (byCat[e.cat] || 0) + 1;
    if (e.tpl) templated++; else bespoke++;
  }
  return { total: EVENTS.size, bespoke, templated, templates: TEMPLATES.size, byCat, codex: CODEX.size };
}
