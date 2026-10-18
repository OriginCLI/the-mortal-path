// Content linter: validates every event, template instance and timeline entry against the engine's
// schema, checks every cross-reference, enforces the spec's style rules, and reports the event counts.
//   node tools/lint.js [--quiet]
import '../game/js/engine/index.js';
import { EVENTS, CODEX, TEMPLATES, CATEGORIES, stats } from '../game/js/engine/registry.js';
import { COND_KEYS } from '../game/js/engine/cond.js';
import { FX_KEYS } from '../game/js/engine/fx.js';
import { TIMELINE } from '../game/js/content/timeline.js';
import { ROSTER } from '../game/js/content/npcs.js';
import { ITEMS, RECIPES, CAREERS, ORIGINS, CONSTITUTIONS } from '../game/js/content/life.js';
import { MANUALS } from '../game/js/content/martial.js';
import { SECTS, LOCATIONS, FACTIONS, REGIONS } from '../game/js/content/world.js';
import { ACHIEVEMENTS } from '../game/js/content/achievements.js';
import { ACTIVITIES } from '../game/js/systems/life.js';
import { GAMES } from '../game/js/content/minigames.js';

const quiet = process.argv.includes('--quiet');
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const EVENT_KEYS = new Set(['id', 'cat', 'w', 'once', 'cd', 'if', 'on', 'title', 'text', 'art', 'fmt', 'from', 'game', 'bind', 'fx', 'choices', 'source', 'tpl', 'danger', 'mood']);
const CHOICE_KEYS = new Set(['t', 'hint', 'req', 'show', 'p', 'roll', 'r', 'ok', 'no', 'fx', 'pass']);
const COMBAT_KEYS = new Set(['foe', 'context', 'important', 'lethal', 'title', 'text', 'win', 'lose', 'flee', 'yield', 'spare', 'kill', 'talk', 'draw', 'max']);
const ON_OK = new Set([...Object.keys(ACTIVITIES), 'road', 'arrive', 'scheduled', 'talk']);
const STATS = ['health', 'body', 'qi', 'insight', 'charm', 'fame', 'infamy', 'wealth', 'sanity', 'age', 'realm', 'power'];
const CJK = /[぀-ヿ㐀-鿿가-힯]/;
const KNOWN_TIMELINE = new Set(TIMELINE.map((t) => t.id));
const ARTS = new Set(['flood', 'night', 'tournament', 'fire', 'city', 'plague', 'palace', 'estate', 'demonic', 'war', 'cave', 'mountain', 'temple', 'river', 'forest', 'snow', 'desert', 'wedding', 'grave', 'moon', 'market', 'inn', 'duel', 'meditation', 'scroll', 'wheel', 'birth', 'letter', 'road', 'storm', 'lake', 'garden', 'prison', 'feast', 'shrine', 'blossom', 'library', 'forge', 'ship', 'battlefield']);

function npcRef(where, who) {
  if (typeof who !== 'string') return;
  if (who.startsWith('@')) { if (!ROSTER[who.slice(1)]) err(where, `unknown named NPC "${who}"`); }
}

function memRef(where, id) {
  if (CODEX.has(id)) return;
  const [kind, ...rest] = id.split('.');
  const key = rest.join('.');
  const ok = (kind === 'theory' && MANUALS[key]) || (kind === 'timeline' && KNOWN_TIMELINE.has(key)) || (kind === 'people' && ROSTER[key])
    || (kind === 'foe' && (ROSTER[key] || key)) || (kind === 'recipe' && RECIPES[key]) || id === 'self.constitution';
  if (!ok) err(where, `memory "${id}" is never defined`);
}

function checkCond(where, c) {
  if (!c) return;
  if (typeof c !== 'object') { err(where, 'condition must be an object'); return; }
  for (const [k, v] of Object.entries(c)) {
    if (!COND_KEYS.has(k)) { err(where, `unknown condition "${k}"`); continue; }
    if (k === 'or') v.forEach((x, i) => checkCond(`${where}.or[${i}]`, x));
    if (k === 'stat') for (const s of Object.keys(v)) if (!STATS.includes(s)) err(where, `unknown stat "${s}"`);
    if (k === 'rep') for (const f of Object.keys(v)) if (!FACTIONS[f]) err(where, `unknown faction "${f}"`);
    if (k === 'mem' || k === 'noMem') [].concat(v).forEach((m) => memRef(where, m));
    if (['loc', 'notLoc'].includes(k)) [].concat(v).forEach((l) => { if (!LOCATIONS[l]) err(where, `unknown location "${l}"`); });
    if (k === 'region') [].concat(v).forEach((r) => { if (!REGIONS[r]) err(where, `unknown region "${r}"`); });
    if (['sect', 'notSect'].includes(k) && v) [].concat(v).forEach((s) => { if (s !== 'none' && !SECTS[s]) err(where, `unknown sect "${s}"`); });
    if (k === 'faction' && v) [].concat(v).forEach((f) => { if (f !== 'none' && !FACTIONS[f]) err(where, `unknown faction "${f}"`); });
    if (k === 'career' && v) [].concat(v).forEach((s) => { if (s !== 'none' && !CAREERS[s]) err(where, `unknown career "${s}"`); });
    if (k === 'origin') [].concat(v).forEach((o) => { if (!ORIGINS[o]) err(where, `unknown origin "${o}"`); });
    if (k === 'constitution') [].concat(v).forEach((o) => { if (!CONSTITUTIONS[o]) err(where, `unknown constitution "${o}"`); });
    if (['manual', 'noManual', 'method'].includes(k)) [].concat(v).forEach((m) => { if (!MANUALS[m]) err(where, `unknown manual "${m}"`); });
    if (['item', 'noItem'].includes(k)) [].concat(v).forEach((m) => { if (!ITEMS[m]) err(where, `unknown item "${m}"`); });
    if (['met', 'notMet', 'alive', 'dead'].includes(k)) [].concat(v).forEach((m) => { if (!ROSTER[m]) err(where, `"${k}" expects a named NPC id, got "${m}"`); });
    if (k === 'npc') Object.keys(v).forEach((m) => npcRef(where, m));
    if (['averted', 'happened'].includes(k)) [].concat(v).forEach((t) => { if (!KNOWN_TIMELINE.has(t)) err(where, `unknown timeline entry "${t}"`); });
    if (k === 'timeline') Object.keys(v).forEach((t) => { if (!KNOWN_TIMELINE.has(t)) err(where, `unknown timeline entry "${t}"`); });
    if (k === 'age' && Array.isArray(v) && v[0] > v[1]) err(where, 'age range is backwards');
  }
}

function checkFx(where, fx, inCombat = false) {
  if (!fx) return;
  for (const [k, v] of Object.entries(fx)) {
    if (k === 'deathText') continue;
    if (!FX_KEYS.has(k)) { err(where, `unknown effect "${k}"`); continue; }
    if (typeof v === 'function' && k !== 'fn') err(where, `effect "${k}" must not be a function`);
    if (k === 'fn' && inCombat) err(where, 'combat outcomes must not use fn (they are saved mid-fight)');
    if (k === 'text') checkText(where, v);
    if (k === 'next') [].concat(v).forEach((n) => { const id = typeof n === 'string' ? n : n.id; if (!EVENTS.has(id)) err(where, `next → unknown event "${id}"`); });
    if (k === 'item' || k === 'take') Object.keys(v).forEach((i) => { if (!ITEMS[i]) err(where, `unknown item "${i}"`); });
    if (k === 'manual') [].concat(v).forEach((m) => { if (!MANUALS[m]) err(where, `unknown manual "${m}"`); });
    if (k === 'method' && !MANUALS[v]) err(where, `unknown manual "${v}"`);
    if (k === 'mastery') Object.keys(v).forEach((m) => { if (!MANUALS[m]) err(where, `unknown manual "${m}"`); });
    if (k === 'rep') Object.keys(v).forEach((f) => { if (!FACTIONS[f]) err(where, `unknown faction "${f}"`); });
    if (k === 'travel' && !LOCATIONS[v]) err(where, `unknown location "${v}"`);
    if (k === 'join') { const s = typeof v === 'string' ? v : v.sect; if (!SECTS[s]) err(where, `unknown sect "${s}"`); }
    if (k === 'career' && v !== null && !CAREERS[v]) err(where, `unknown career "${v}"`);
    if (k === 'achieve') [].concat(v).forEach((a) => { if (!ACHIEVEMENTS[a]) err(where, `unknown achievement "${a}"`); });
    if (k === 'avert' || k === 'happen') [].concat(v).forEach((t) => { if (!KNOWN_TIMELINE.has(t)) err(where, `unknown timeline entry "${t}"`); });
    if (k === 'recipe') [].concat(v).forEach((r) => { if (!RECIPES[r]) err(where, `unknown recipe "${r}"`); });
    if (k === 'codex') [].concat(v).forEach((c) => { if (typeof c === 'string') memRef(where, c); else if (!c.title || !c.text || !c.cat) err(where, `codex "${c.id}" needs cat, title and text`); else checkText(where, c.title + c.text); });
    if (['rel', 'role', 'npcFlag', 'npcRealm'].includes(k)) Object.keys(v).forEach((who) => npcRef(where, who));
    if (['meet', 'kill', 'marry'].includes(k)) [].concat(v).forEach((who) => npcRef(where, who));
    if (k === 'combat') checkCombat(`${where}.combat`, v);
  }
}

function checkCombat(where, c) {
  for (const k of Object.keys(c)) if (!COMBAT_KEYS.has(k)) err(where, `unknown combat key "${k}"`);
  if (!c.foe) err(where, 'combat needs a foe');
  if (typeof c.foe === 'string') npcRef(where, c.foe);
  for (const k of ['win', 'lose', 'flee', 'yield', 'spare', 'kill', 'talk', 'draw']) if (c[k]) checkFx(`${where}.${k}`, c[k], true);
  if (c.text) checkText(where, c.text);
}

function checkText(where, t) {
  for (const s of [].concat(t)) {
    if (typeof s !== 'string') { err(where, 'text must be a string'); continue; }
    if (CJK.test(s)) err(where, `text contains Hanja/Hangul (spec: English only): "${s.slice(0, 40)}"`);
    if (/\bI\b/.test(s.replace(/[“"][^”"]*[”"]/g, ''))) warn(where, `first-person "I" outside dialogue (spec: second person): "${s.slice(0, 60)}"`);
    if (s.length > 900) warn(where, `long text (${s.length} chars)`);
    if (/\{[^}]*$/.test(s)) err(where, 'unclosed {token}');
  }
}

for (const ev of EVENTS.values()) {
  const w = ev.id;
  for (const k of Object.keys(ev)) if (!EVENT_KEYS.has(k)) err(w, `unknown event key "${k}"`);
  if (!CATEGORIES.includes(ev.cat)) err(w, `unknown category "${ev.cat}"`);
  if (ev.on) [].concat(ev.on).forEach((o) => { if (!ON_OK.has(o) && !String(o).startsWith('talk.')) err(w, `unknown trigger on: "${o}"`); });
  if (ev.art && !ARTS.has(ev.art)) err(w, `unknown art "${ev.art}"`);
  if (ev.game && !GAMES.includes(ev.game)) err(w, `unknown mini-game "${ev.game}"`);
  if (ev.game && !(ev.choices || []).some((c) => c.ok)) err(w, 'a mini-game needs at least one rolled choice (P or R) for its score to decide');
  if (!ev.text) err(w, 'missing text');
  checkText(w, ev.text);
  if (ev.title) checkText(w, ev.title);
  checkCond(`${w}.if`, ev.if);
  if (ev.bind) for (const [role, spec] of Object.entries(ev.bind)) if (typeof spec === 'string' && spec.startsWith('@')) err(w, `bind "${role}" should reference named NPCs with @ in text, not bind`);
  if (ev.fx) checkFx(`${w}.fx`, ev.fx);
  if (!ev.choices && !ev.fx) warn(w, 'no choices and no effects (pure flavour)');
  (ev.choices || []).forEach((c, i) => {
    const cw = `${w}.choices[${i}]`;
    for (const k of Object.keys(c)) if (!CHOICE_KEYS.has(k)) err(cw, `unknown choice key "${k}"`);
    if (!c.t) err(cw, 'missing label t');
    checkText(cw, c.t);
    checkCond(`${cw}.req`, c.req);
    checkCond(`${cw}.show`, c.show);
    const rolled = c.p != null || c.roll;
    if (rolled && (!c.ok || !c.no)) err(cw, 'rolled choice needs ok and no outcomes');
    if (!rolled && c.ok) err(cw, 'ok/no outcomes need p or roll');
    if (c.roll && !STATS.includes(c.roll.stat)) err(cw, `unknown roll stat "${c.roll.stat}"`);
    if (c.fx) checkFx(`${cw}.fx`, c.fx);
    for (const k of ['r', 'ok', 'no']) if (c[k]) checkFx(`${cw}.${k}`, c[k]);
  });
}

// Template instances must differ in outcome logic, not just in words.
const strip = (o) => JSON.stringify(o, (k, v) => (k === 'text' || k === 't' || k === 'title' || k === 'id' || k === 'tpl' || k === 'source' ? undefined : typeof v === 'function' ? v.toString() : v));
for (const tpl of TEMPLATES.values()) {
  const inst = [...EVENTS.values()].filter((e) => e.tpl === tpl.id);
  const sigs = new Map();
  for (const e of inst) {
    const sig = strip({ choices: e.choices, fx: e.fx, if: e.if, bind: e.bind });
    if (sigs.has(sig)) err(e.id, `template instance has the same outcome logic as ${sigs.get(sig)} (counts only with its own logic)`);
    else sigs.set(sig, e.id);
  }
}

for (const t of TIMELINE) {
  const w = `timeline.${t.id}`;
  if (t.witness && !EVENTS.has(t.witness)) err(w, `witness → unknown event "${t.witness}"`);
  checkCond(`${w}.if`, t.if);
  checkCond(`${w}.unless`, t.unless);
  if (t.fx) checkFx(`${w}.fx`, t.fx);
  checkText(w, [t.text, t.memory || '', t.rumor || '', t.avertedText || ''].flat());
  if (t.loc && !LOCATIONS[t.loc]) err(w, `unknown location "${t.loc}"`);
  if (t.achieve && !ACHIEVEMENTS[t.achieve]) err(w, `unknown achievement "${t.achieve}"`);
}
for (const [id, r] of Object.entries(ROSTER)) {
  if (r.sect && !SECTS[r.sect]) err(`npc.${id}`, `unknown sect "${r.sect}"`);
  if (r.warn) memRef(`npc.${id}`, r.warn);
  if (r.dies?.unless) checkCond(`npc.${id}.dies.unless`, r.dies.unless);
}

// Every event that is only reachable by `next` must be pointed at by something.
const targets = new Set();
const walk = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk); for (const [k, v] of Object.entries(o)) { if (k === 'next') [].concat(v).forEach((n) => targets.add(typeof n === 'string' ? n : n.id)); else walk(v); } };
for (const e of EVENTS.values()) walk(e);
TIMELINE.forEach((t) => t.witness && targets.add(t.witness));
for (const e of EVENTS.values()) if (e.on === 'scheduled' && !targets.has(e.id)) warn(e.id, 'scheduled-only event is never scheduled');

const st = stats();
if (!quiet) {
  console.log(`Events: ${st.total} (${st.bespoke} hand-written + ${st.templated} from ${st.templates} templates), codex entries: ${st.codex}`);
  console.log(`By category: ${CATEGORIES.map((c) => `${c} ${st.byCat[c] || 0}`).join(', ')}`);
  for (const w of warnings.slice(0, 40)) console.log(`warn  ${w}`);
  if (warnings.length > 40) console.log(`… and ${warnings.length - 40} more warnings`);
}
for (const e of errors.slice(0, 80)) console.log(`ERROR ${e}`);
if (errors.length) { console.log(`${errors.length} error(s)`); process.exit(1); }
console.log('Lint passed.');
