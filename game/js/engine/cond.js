// Condition evaluation for events, choices and timeline entries. Every key in a condition object must
// pass. Unknown keys throw, so typos in content are caught by the linter rather than silently ignored.
import { asArray, parseCmp, compare, test } from '../core/util.js';
import { LOCATIONS } from '../content/world.js';

const HANDLERS = {
  age: (g, v) => test(g.age, v),
  turn: (g, v) => test(g.life.turn, v),
  season: (g, v) => asArray(v).includes(g.season),
  year: (g, v) => test(g.year, v),
  loc: (g, v) => asArray(v).includes(g.life.loc),
  notLoc: (g, v) => !asArray(v).includes(g.life.loc),
  region: (g, v) => asArray(v).includes(LOCATIONS[g.life.loc].region),
  locType: (g, v) => asArray(v).includes(LOCATIONS[g.life.loc].type),
  home: (g, v) => g.life.loc === g.life.home ? v !== false : v === false,
  flag: (g, v) => asArray(v).every((f) => checkFlag(g, f)),
  any: (g, v) => asArray(v).some((f) => checkFlag(g, f)),
  not: (g, v) => asArray(v).every((f) => !checkFlag(g, f)),
  stat: (g, v) => Object.entries(v).every(([k, spec]) => test(g.stat(k), spec)),
  realm: (g, v) => test(g.life.realm, v),
  stage: (g, v) => test(g.life.stage, v),
  rep: (g, v) => Object.entries(v).every(([k, spec]) => test(g.life.rep[k] ?? 0, spec)),
  faction: (g, v) => (v === null || v === 'none' ? !g.life.sect : asArray(v).includes(g.faction)),
  sect: (g, v) => (v === null || v === 'none' ? !g.life.sect : asArray(v).includes(g.life.sect)),
  notSect: (g, v) => !asArray(v).includes(g.life.sect),
  rank: (g, v) => !!g.life.sect && test(g.life.rank, v),
  career: (g, v) => (v === null || v === 'none' ? !g.life.career : asArray(v).includes(g.life.career?.id)),
  origin: (g, v) => asArray(v).includes(g.life.origin),
  gender: (g, v) => g.life.gender === v,
  constitution: (g, v) => asArray(v).includes(g.life.constitution),
  path: (g, v) => asArray(v).includes(g.path),
  method: (g, v) => asArray(v).includes(g.life.method),
  manual: (g, v) => asArray(v).every((m) => m in g.life.manuals),
  noManual: (g, v) => asArray(v).every((m) => !(m in g.life.manuals)),
  item: (g, v) => asArray(v).every((i) => (g.life.items[i] || 0) > 0),
  noItem: (g, v) => asArray(v).every((i) => !(g.life.items[i] > 0)),
  has: (g, v) => asArray(v).every((role) => g.withRole(role).length > 0),
  hasNot: (g, v) => asArray(v).every((role) => g.withRole(role).length === 0),
  npc: (g, v, ctx) => Object.entries(v).every(([who, spec]) => npcTest(g, g.resolveNpc(who, ctx), spec)),
  met: (g, v) => asArray(v).every((id) => g.life.npcs[id]?.met),
  notMet: (g, v) => asArray(v).every((id) => !g.life.npcs[id]?.met),
  alive: (g, v) => asArray(v).every((id) => g.life.npcs[id] && !g.life.npcs[id].dead),
  dead: (g, v) => asArray(v).every((id) => g.life.npcs[id]?.dead),
  mem: (g, v) => asArray(v).every((id) => g.remembers(id)),
  noMem: (g, v) => asArray(v).every((id) => !g.remembers(id)),
  meta: (g, v) => Object.entries(v).every(([k, spec]) => test(g.metaValue(k), spec)),
  injured: (g, v) => (g.life.injuries.length > 0) === v,
  crippled: (g, v) => !!g.life.crippled === v,
  married: (g, v) => (g.withRole('spouse').length > 0) === v,
  wealth: (g, v) => test(g.life.stats.wealth, v),
  mode: (g, v) => asArray(v).includes(g.meta.wheel.mode),
  timeline: (g, v) => Object.entries(v).every(([id, state]) => g.timelineState(id) === state),
  averted: (g, v) => asArray(v).every((id) => g.timelineState(id) === 'averted'),
  happened: (g, v) => asArray(v).every((id) => g.timelineState(id) === 'happened'),
  bottleneck: (g, v) => !!g.life.bottleneck === v,
  chance: (g, v) => g.rng.chance(v),
  or: (g, v, ctx) => v.some((c) => check(g, c, ctx)),
  fn: (g, v, ctx) => !!v(g, ctx),
};

export const COND_KEYS = new Set(Object.keys(HANDLERS));

function checkFlag(g, f) {
  const { key, op, val } = parseCmp(f);
  return compare(g.life.flags[key] || 0, op, val);
}

function npcTest(g, npc, spec) {
  if (spec === false) return !npc || npc.dead;
  if (!npc) return false;
  if (spec === true) return !npc.dead;
  return Object.entries(spec).every(([k, v]) => {
    switch (k) {
      case 'alive': return !npc.dead === v;
      case 'met': return !!npc.met === v;
      case 'aff': return test(npc.aff, v);
      case 'res': return test(npc.res, v);
      case 'role': return asArray(v).includes(npc.role);
      case 'realm': return test(npc.realm, v);
      case 'age': return test(g.npcAge(npc), v);
      case 'loc': return asArray(v).includes(npc.loc);
      case 'flag': return asArray(v).every((f) => (npc.flags?.[f] || 0) > 0);
      case 'not': return asArray(v).every((f) => !(npc.flags?.[f] > 0));
      case 'gender': return npc.g === v;
      default: throw new Error(`Unknown npc condition "${k}"`);
    }
  });
}

// Returns true if every key in the condition passes. ctx carries role bindings.
export function check(g, cond, ctx = {}) {
  if (!cond) return true;
  for (const [k, v] of Object.entries(cond)) {
    const fn = HANDLERS[k];
    if (!fn) throw new Error(`Unknown condition "${k}"`);
    if (!fn(g, v, ctx)) return false;
  }
  return true;
}

// Human-readable requirement text for locked choices ("Requires Body 30").
const STAT_LABEL = { health: 'Health', body: 'Body', qi: 'Qi', insight: 'Insight', charm: 'Charm', fame: 'Fame', infamy: 'Infamy', wealth: 'taels', sanity: 'Heart' };
export function describeReq(cond, g) {
  if (!cond) return '';
  const parts = [];
  for (const [k, v] of Object.entries(cond)) {
    if (k === 'stat') {
      for (const [s, spec] of Object.entries(v)) {
        const n = String(spec).replace(/^>=?/, '');
        parts.push(s === 'wealth' ? `${n} taels` : `${STAT_LABEL[s] || s} ${n}`);
      }
    } else if (k === 'wealth') parts.push(`${String(v).replace(/^>=?/, '')} taels`);
    else if (k === 'realm') parts.push(`${g.realmName(Array.isArray(v) ? v[0] : Number(String(v).replace(/^>=?/, '')))} realm`);
    else if (k === 'item') parts.push(asArray(v).map((i) => g.itemName(i)).join(', '));
    else if (k === 'rep') parts.push(Object.keys(v).map((f) => `${g.factionShort(f)} standing`).join(', '));
  }
  return parts.join(', ');
}
