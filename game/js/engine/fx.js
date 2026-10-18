// Effects: what an event outcome does to the world. Like conditions, unknown keys throw.
import { asArray } from '../core/util.js';

const STATS = ['health', 'body', 'qi', 'insight', 'charm', 'fame', 'infamy', 'wealth', 'sanity'];

const HANDLERS = {
  flag: (g, v) => asArray(v).forEach((f) => g.setFlag(f)),
  unflag: (g, v) => asArray(v).forEach((f) => { delete g.life.flags[f]; }),
  rep: (g, v) => Object.entries(v).forEach(([f, n]) => g.addRep(f, n)),
  merit: (g, v) => g.addMerit(v),
  rel: (g, v, ctx) => Object.entries(v).forEach(([who, d]) => {
    const npc = g.resolveNpc(who, ctx);
    if (!npc) return;
    if (typeof d === 'number') g.changeRel(npc, { aff: d });
    else g.changeRel(npc, d);
  }),
  meet: (g, v, ctx) => asArray(v).forEach((who) => g.meetNpc(g.resolveNpc(who, ctx))),
  role: (g, v, ctx) => Object.entries(v).forEach(([who, role]) => g.setRole(g.resolveNpc(who, ctx), role)),
  npcFlag: (g, v, ctx) => Object.entries(v).forEach(([who, f]) => {
    const npc = g.resolveNpc(who, ctx);
    if (npc) asArray(f).forEach((x) => { npc.flags = npc.flags || {}; npc.flags[x] = 1; });
  }),
  npcRealm: (g, v, ctx) => Object.entries(v).forEach(([who, n]) => {
    const npc = g.resolveNpc(who, ctx);
    if (npc) npc.realm = Math.max(0, Math.min(8, npc.realm + n));
  }),
  kill: (g, v, ctx) => asArray(v).forEach((who) => g.killNpc(g.resolveNpc(who, ctx), 'killed')),
  item: (g, v) => Object.entries(v).forEach(([id, n]) => g.addItem(id, n)),
  take: (g, v) => Object.entries(v).forEach(([id, n]) => g.addItem(id, -n)),
  manual: (g, v) => asArray(v).forEach((m) => g.learnManual(m)),
  mastery: (g, v) => Object.entries(v).forEach(([m, n]) => g.addMastery(m, n)),
  codex: (g, v) => asArray(v).forEach((c) => g.remember(typeof c === 'string' ? c : c.id)),
  recipe: (g, v) => asArray(v).forEach((r) => g.remember(`recipe.${r}`)),
  next: (g, v, ctx) => asArray(v).forEach((n) => {
    const spec = typeof n === 'string' ? { id: n } : n;
    g.schedule(spec.id, spec.in || 0, ctx.bind);
  }),
  combat: (g, v, ctx) => g.startCombat(v, ctx),
  travel: (g, v) => g.moveTo(v, true),
  join: (g, v) => g.joinSect(typeof v === 'string' ? v : v.sect, typeof v === 'string' ? 0 : v.rank || 0),
  rank: (g, v) => g.changeRank(v),
  leave: (g, v) => { if (v) g.leaveSect(false); },
  expel: (g, v) => { if (v) g.leaveSect(true); },
  career: (g, v) => g.setCareer(v),
  careerUp: (g, v) => g.careerXp(v),
  injury: (g, v) => g.injure(v),
  cripple: (g, v) => g.setCrippled(v),
  cure: (g, v) => asArray(v).forEach((x) => g.cure(x)),
  heal: (g, v) => { if (v) g.healFully(); },
  qiFill: (g, v) => g.addQi(v),
  realmUp: (g, v) => { if (v) g.forceBreakthrough(); },
  method: (g, v) => g.setMethod(v),
  path: (g, v) => { g.life.path = v; },
  die: (g, v) => g.die(v),
  achieve: (g, v) => asArray(v).forEach((a) => g.achieve(a)),
  gaze: (g, v) => g.addGaze(v),
  burden: (g, v) => { g.meta.burden = Math.max(0, Math.min(10, g.meta.burden + v)); },
  rival: (g, v) => { g.meta.rival = Math.max(g.meta.rival, v); },
  avert: (g, v) => asArray(v).forEach((id) => g.avertTimeline(id)),
  happen: (g, v) => asArray(v).forEach((id) => g.letHappen(id)),
  marry: (g, v, ctx) => g.marry(g.resolveNpc(v, ctx)),
  child: (g, v) => g.haveChild(v === true ? {} : v),
  seclude: (g, v) => g.forceSeclusion(v),
  log: (g, v) => g.log(g.fill(v), 'note'),
  mood: (g, v) => g.emit('mood', v),
  sfx: (g, v) => g.emit('sfx', v),
  fn: (g, v, ctx) => v(g, ctx),
};
for (const s of STATS) HANDLERS[s] = (g, v) => g.addStat(s, v);
HANDLERS.qi = (g, v) => g.addQi(v > 0 ? g.scaledQi(v) : v);

// Keys an outcome object may carry that are not effects.
const META_KEYS = new Set(['text', 'title', 'art', 'if']);
export const FX_KEYS = new Set([...Object.keys(HANDLERS), ...META_KEYS]);

export function apply(g, fx, ctx = {}) {
  if (!fx) return;
  for (const [k, v] of Object.entries(fx)) {
    if (META_KEYS.has(k)) continue;
    const h = HANDLERS[k];
    if (!h) throw new Error(`Unknown effect "${k}"`);
    h(g, v, ctx);
    if (g.life.dead) return;
  }
}
