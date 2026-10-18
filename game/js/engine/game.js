// The Game: owns the wheel (meta) and the current life, runs the season pipeline, presents events and
// resolves choices. Systems are mixed in from ../systems. No DOM access: the UI subscribes via on().
import { Rng, hashSeed } from '../core/rng.js';
import { asArray, clamp, parseCmp } from '../core/util.js';
import { fillText, PRONOUNS, SEASONS, cycleName } from '../core/text.js';
import { EVENTS, CAT_WEIGHT, CATEGORIES } from './registry.js';
import { check, describeReq } from './cond.js';
import { apply } from './fx.js';
import { LOCATIONS, SECTS, FACTIONS, REGIONS } from '../content/world.js';
import { ORIGINS, CONSTITUTIONS, ITEMS } from '../content/life.js';
import { REALMS, realmLabel } from '../content/realms.js';
import { MANUALS } from '../content/martial.js';

export const LOG_LIMIT = 2500;
export const EVENTS_PER_YEAR = 5;

export function createWheel({ name, family, gender, origin, mode = 'standard', seed, constitution }) {
  const s = (seed ?? Math.floor(Math.random() * 2 ** 32)) >>> 0;
  const r = Rng.from(hashSeed(s, 'wheel'));
  const con = constitution || r.weighted(Object.entries(CONSTITUTIONS), ([, c]) => c.w)[0];
  const meta = {
    v: 1,
    wheel: { name, family, gender, origin, constitution: con, seed: s, mode, created: Date.now() },
    loop: 1,
    codex: {}, notes: [], hall: [], achievements: {}, marks: {}, seenEver: {},
    gaze: 0, burden: 0, rival: 0,
    theory: { realm: 0, manuals: {} },
    stats: { deaths: 0, years: 0, bestRealm: 0, oldest: 0 },
  };
  return meta;
}

export function newLife(meta) {
  const w = meta.wheel;
  const o = ORIGINS[w.origin];
  const con = CONSTITUTIONS[w.constitution];
  const seed = hashSeed(w.seed, 'life', meta.loop);
  const base = { health: 70, body: 10, qi: 0, insight: 10, charm: 10, fame: 0, infamy: 0, wealth: 0, sanity: 80, ...o.stats };
  base.wealth = o.wealth;
  base.health = clamp(base.health + (con.health || 0), 20, 100);
  base.insight += con.insight || 0;
  base.sanity = clamp(80 + (con.heart || 0) - meta.burden * 4, 20, 100);
  return {
    loop: meta.loop, seed, rng: { s: seed },
    turn: 0,
    name: w.name, family: w.family, gender: w.gender, origin: w.origin, constitution: w.constitution,
    stats: base,
    realm: 0, stage: 0, bottleneck: false, foundation: 0,
    method: null, manuals: {}, focus: null, path: null,
    injuries: [], crippled: false, poisoned: 0, cured: {},
    loc: o.home, home: o.home,
    sect: null, rank: 0, merit: 0,
    rep: Object.fromEntries(Object.keys(FACTIONS).map((f) => [f, 0])),
    career: null,
    flags: {}, seen: {}, cool: {},
    npcs: {}, nextNpc: 1,
    items: {}, recipes: {},
    actions: 0, talked: {},
    queue: [], pending: null, scheduled: [],
    log: [],
    dead: null,
    timeline: {},
    tally: { kills: 0, fights: 0, wins: 0, events: 0, breakthroughs: 0, deviations: 0, averted: 0, children: 0 },
    montage: meta.loop > 1,
  };
}

export class Game {
  constructor(save, opts = {}) {
    this.meta = save.meta;
    this.life = save.life;
    this.settings = opts.settings || {};
    this.rng = new Rng(this.life.rng);
    this.headless = !!opts.headless;
    this.listeners = new Set();
    this.onSave = opts.onSave || null;
  }

  // ── Events to the UI ───────────────────────────────────────────
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(type, data) { for (const fn of this.listeners) fn(type, data); }
  save() { if (this.onSave) this.onSave(this.toJSON()); }
  toJSON() { return { meta: this.meta, life: this.life }; }

  // ── Derived values ─────────────────────────────────────────────
  get age() { return Math.floor(this.life.turn / 4); }
  get season() { return this.life.turn % 4; }
  get year() { return 1 + this.age; }
  get faction() { return this.life.sect ? SECTS[this.life.sect].faction : null; }
  get path() { return this.life.path || (this.life.method ? MANUALS[this.life.method].path : null); }
  get loc() { return LOCATIONS[this.life.loc]; }
  get con() { return CONSTITUTIONS[this.life.constitution]; }

  stat(k) {
    if (k === 'age') return this.age;
    if (k === 'realm') return this.life.realm;
    return this.life.stats[k] ?? 0;
  }

  addStat(k, v) {
    const s = this.life.stats;
    if (k === 'qi') { this.addQi(v); return; }
    const before = s[k] ?? 0;
    let after = before + v;
    if (k === 'health') after = clamp(after, -100, this.maxHealth());
    else if (k === 'sanity') after = clamp(after, 0, 100);
    else if (k === 'wealth' || k === 'fame' || k === 'infamy') after = Math.max(0, after);
    else after = clamp(after, 0, 100);
    s[k] = Math.round(after * 10) / 10;
    if (k === 'health' && v < 0) this.life.lastHarm = this.life.lastHarm || 'wounds';
  }

  setFlag(f) {
    const m = String(f).match(/^(.*?)([+-]=?|=)(-?\d+)$/);
    if (!m) { this.life.flags[f] = 1; return; }
    const key = m[1];
    const n = Number(m[3]);
    if (m[2] === '=') this.life.flags[key] = n;
    else if (m[2].startsWith('+')) this.life.flags[key] = (this.life.flags[key] || 0) + n;
    else this.life.flags[key] = (this.life.flags[key] || 0) - n;
  }
  flag(f) { const { key } = parseCmp(f); return this.life.flags[key] || 0; }

  realmName(r = this.life.realm) { return REALMS[clamp(r, 0, REALMS.length - 1)].name; }
  realmLabel() { return realmLabel(this.life.realm, this.life.stage); }
  itemName(id) { return ITEMS[id]?.name || id; }
  factionShort(f) { return FACTIONS[f]?.short || f; }
  seasonName() { return SEASONS[this.season]; }

  // ── Text ───────────────────────────────────────────────────────
  fill(str, ctx = {}) {
    return fillText(str, (key) => this.token(key, ctx), this.rng);
  }

  token(key, ctx) {
    const L = this.life;
    const g = L.gender === 'f';
    switch (key) {
      case 'name': return L.name;
      case 'family': return L.family;
      case 'fullname': return `${L.family} ${L.name}`;
      case 'son': return g ? 'daughter' : 'son';
      case 'boy': return g ? 'girl' : 'boy';
      case 'brother': return g ? 'sister' : 'brother';
      case 'youngmaster': return g ? 'young lady' : 'young master';
      case 'man': return g ? 'woman' : 'man';
      case 'sir': return g ? 'miss' : 'sir';
      case 'loc': return this.loc.name;
      case 'home': return LOCATIONS[L.home].name;
      case 'region': return REGIONS[this.loc.region].name;
      case 'season': return this.seasonName().toLowerCase();
      case 'year': return `the Year of the ${cycleName(this.year)}`;
      case 'age': return String(this.age);
      case 'realm': return this.realmName();
      case 'sect': return L.sect ? SECTS[L.sect].name : 'the sect';
      case 'rank': return L.sect ? SECTS[L.sect].ranks[L.rank] : 'nobody';
      case 'money': return `${Math.floor(L.stats.wealth)} taels`;
      default: break;
    }
    // Role tokens: {x}, {x.he}, {x.His}, {x.title}… and named NPCs: {@id}, {@id.he}
    const [who, field] = key.split('.');
    const npc = this.resolveNpc(who, ctx);
    if (!npc) return undefined;
    if (!field) return npc.name;
    const P = PRONOUNS[npc.g] || PRONOUNS.m;
    if (field in P) return P[field];
    const low = field[0].toLowerCase() + field.slice(1);
    if (low in P) return P[low][0].toUpperCase() + P[low].slice(1);
    if (field === 'title') return this.roleTitle(npc);
    if (field === 'realm') return this.realmName(npc.realm);
    if (field === 'nick') return npc.nick || npc.name;
    if (field === 'first') return npc.name.split(' ').slice(1).join(' ') || npc.name;
    return undefined;
  }

  // ── Log ────────────────────────────────────────────────────────
  log(text, kind = 'beat', extra = {}) {
    if (!text) return;
    const entry = { t: this.life.turn, k: kind, x: text, ...extra };
    this.life.log.push(entry);
    if (this.life.log.length > LOG_LIMIT) this.life.log.splice(0, this.life.log.length - LOG_LIMIT);
    this.emit('log', entry);
  }

  // ── Season pipeline ────────────────────────────────────────────
  canAdvance() { return !this.life.pending && !this.life.dead; }

  nextSeason() {
    if (!this.canAdvance()) return;
    const L = this.life;
    L.turn += 1;
    L.actions = this.actionsPerSeason();
    L.talked = {};
    L.lastHarm = null;
    L.queuedThisTurn = {};
    if (this.season === 0) {
      this.log(`${cycleName(this.year)}`, 'year', { age: this.age });
      this.yearly();
    }
    if (!L.dead) this.seasonal();
    if (!L.dead && L.travel) this.travelTick();
    if (!L.dead) this.runTimeline();
    if (!L.dead) this.queueScheduled();
    if (!L.dead) this.queueDeck();
    this.pump();
  }

  actionsPerSeason() {
    if (this.age < 3) return 0;
    if (this.age < 8) return 1;
    return 2;
  }

  // Process queued events until one needs a decision.
  pump() {
    const L = this.life;
    let guard = 0;
    while (!L.pending && !L.dead && L.queue.length && guard++ < 50) {
      const item = L.queue.shift();
      this.present(item);
    }
    if (!L.pending && !L.dead) this.checkDeath();
    if (L.dead) this.emit('death', L.dead);
    else this.emit('update');
    this.save();
  }

  schedule(id, inSeasons = 0, bind) {
    if (!EVENTS.has(id)) throw new Error(`Scheduled unknown event "${id}"`);
    if (inSeasons <= 0) this.life.queue.unshift({ id, bind, forced: true });
    else this.life.scheduled.push({ id, at: this.life.turn + inSeasons, bind });
  }

  queueScheduled() {
    const L = this.life;
    const due = L.scheduled.filter((s) => s.at <= L.turn);
    L.scheduled = L.scheduled.filter((s) => s.at > L.turn);
    for (const s of due) L.queue.push({ id: s.id, bind: s.bind, forced: true });
  }

  // How many deck events this season: averages EVENTS_PER_YEAR per year (spec: 5).
  deckCount() {
    if (this.age < 1) return this.rng.chance(0.35) ? 1 : 0;
    const per = EVENTS_PER_YEAR / 4;
    const base = Math.floor(per);
    return base + (this.rng.chance(per - base) ? 1 : 0);
  }

  queueDeck() {
    const n = this.deckCount();
    for (let i = 0; i < n; i++) {
      const pick = this.drawEvent();
      if (!pick) break;
      this.life.queue.push(pick);
      this.life.queuedThisTurn[pick.id] = 1;
    }
  }

  // Draw one event: choose a category by the spec weights (among categories with something eligible),
  // then an event by its own weight.
  drawEvent(on = null) {
    const pools = {};
    for (const ev of this.candidates(on)) {
      const ctx = { bind: {} };
      if (!this.eligible(ev, ctx)) continue;
      (pools[ev.cat] = pools[ev.cat] || []).push({ ev, bind: ctx.bind, w: this.eventWeight(ev) });
    }
    const cats = Object.keys(pools);
    if (!cats.length) return null;
    const cat = on ? null : this.rng.weighted(cats, (c) => (CAT_WEIGHT[c] || 5) * this.catBoost(c));
    const pool = on ? Object.values(pools).flat() : pools[cat];
    const pick = this.rng.weighted(pool, (p) => p.w);
    return pick ? { id: pick.ev.id, bind: pick.bind } : null;
  }

  candidates(on) {
    const age = this.age;
    const list = on ? (this.byOn?.get(on) || []) : (this.byAge?.[Math.min(age, 300)] || []);
    return list;
  }

  // Build lookup tables once per process (events are static).
  static index() {
    if (Game.indexed) return;
    const byAge = Array.from({ length: 301 }, () => []);
    const byOn = new Map();
    for (const ev of EVENTS.values()) {
      if (ev.on) {
        for (const o of asArray(ev.on)) {
          if (!byOn.has(o)) byOn.set(o, []);
          byOn.get(o).push(ev);
        }
        continue;
      }
      if (!CATEGORIES.includes(ev.cat)) continue;
      const a = ev.if?.age;
      let lo = 0;
      let hi = 300;
      if (Array.isArray(a)) { lo = a[0]; hi = a[1] ?? 300; } else if (a != null) {
        const m = String(a).match(/^(>=|<=|>|<)?\s*(\d+)/);
        if (m) {
          const n = Number(m[2]);
          if (!m[1] || m[1] === '>=') lo = n; else if (m[1] === '>') lo = n + 1;
          else if (m[1] === '<=') hi = n; else if (m[1] === '<') hi = n - 1;
        }
      }
      for (let y = Math.max(0, lo); y <= Math.min(300, hi); y++) byAge[y].push(ev);
    }
    Game.prototype.byAge = byAge;
    Game.prototype.byOn = byOn;
    Game.indexed = true;
  }

  eventWeight(ev) {
    let w = typeof ev.w === 'function' ? ev.w(this) : ev.w;
    if (ev.danger) w *= 1 + this.meta.gaze / 12;
    if (this.meta.marks[ev.id]) w *= 2;
    return w;
  }

  catBoost(cat) {
    if (cat === 'war' && this.flag('w.war')) return 3;
    return 1;
  }

  eligible(ev, ctx) {
    const L = this.life;
    if (L.queuedThisTurn?.[ev.id]) return false;
    if (ev.once && L.seen[ev.id]) return false;
    if (!ev.once && L.cool[ev.id] && L.cool[ev.id] > L.turn) return false;
    // Childhood montage in later loops: only what is new to you, or what you marked.
    if (L.montage && this.age < 6 && this.meta.seenEver[ev.id] && !this.meta.marks[ev.id]) return false;
    if (!this.bindRoles(ev, ctx)) return false;
    try {
      return check(this, ev.if, ctx);
    } catch (err) {
      throw new Error(`${ev.id}: ${err.message}`);
    }
  }

  // Resolve role bindings for an event. Existing roles must exist; "new" roles are created on presentation.
  bindRoles(ev, ctx) {
    if (!ev.bind) return true;
    for (const [role, spec] of Object.entries(ev.bind)) {
      if (ctx.bind[role]) continue;
      if (typeof spec === 'object') { ctx.bind[role] = { new: spec }; continue; }
      const pool = this.withRole(spec, true);
      if (!pool.length) return false;
      ctx.bind[role] = this.rng.pick(pool).id;
    }
    return true;
  }

  // Turn "new" bindings into real NPCs (only when an event actually happens).
  realizeBinds(bind) {
    if (!bind) return {};
    for (const [role, v] of Object.entries(bind)) {
      if (v && typeof v === 'object' && v.new) bind[role] = this.generateNpc(v.new).id;
    }
    return bind;
  }

  markSeen(ev) {
    const L = this.life;
    L.seen[ev.id] = (L.seen[ev.id] || 0) + 1;
    if (!ev.once) L.cool[ev.id] = L.turn + (ev.cd ?? 10) * 4;
    this.meta.seenEver[ev.id] = 1;
    L.tally.events += 1;
  }

  present(item) {
    const ev = EVENTS.get(item.id);
    if (!ev) return;
    const ctx = { bind: this.realizeBinds(item.bind ? { ...item.bind } : {}) };
    // Scheduled follow-ups still respect their own conditions (a dead NPC can't send a letter).
    if (item.forced && ev.if) {
      const cond = { ...ev.if };
      delete cond.chance;
      if (!check(this, cond, ctx)) return;
    }
    if (item.forced && ev.bind && !this.bindRoles(ev, ctx)) return;
    this.realizeBinds(ctx.bind);
    this.markSeen(ev);
    const text = this.fill(pickVariant(ev.text, this.rng), ctx);
    const title = ev.title ? this.fill(ev.title, ctx) : null;
    const choices = (ev.choices || [])
      .map((c, idx) => ({ c, idx }))
      .filter(({ c }) => { try { return check(this, c.show, ctx); } catch (e) { throw new Error(`${ev.id}: ${e.message}`); } })
      .map(({ c, idx }) => {
        const locked = c.req ? !check(this, c.req, ctx) : false;
        return {
          idx,
          label: this.fill(c.t, ctx),
          hint: this.hintFor(c, ctx),
          locked,
          need: locked ? describeReq(c.req, this) : '',
          memory: !!(c.show && (c.show.mem || c.show.meta)),
        };
      });
    if (ev.fx?.music || ev.mood) this.emit('mood', ev.mood || ev.fx.music);
    if (!choices.length || choices.every((c) => c.locked)) {
      this.log(text, ev.fmt === 'letter' ? 'letter' : 'event', { id: ev.id, cat: ev.cat, art: ev.art, title, from: ev.from ? this.npcName(ev.from, ctx) : undefined });
      apply(this, ev.fx, ctx);
      if (ev.art) this.emit('art', ev.art);
      return;
    }
    this.life.pending = {
      kind: 'event', id: ev.id, bind: ctx.bind, title, text, art: ev.art || null, cat: ev.cat,
      fmt: ev.fmt || 'choice', game: ev.game || null, from: ev.from ? this.npcName(ev.from, ctx) : null, choices,
    };
    this.emit('pending', this.life.pending);
  }

  npcName(who, ctx) { return this.resolveNpc(who, ctx)?.name || who; }

  // Odds hints (spec: "Hinted"). Explicit hint wins; otherwise derived from the roll.
  hintFor(c, ctx) {
    if (c.hint) return c.hint;
    const fight = c.r?.combat || c.fx?.combat;
    if (fight) return this.fightWord(fight, ctx);
    const p = this.choiceOdds(c, ctx);
    if (p == null) return '';
    if (p >= 0.8) return 'likely';
    if (p >= 0.55) return 'fair odds';
    if (p >= 0.3) return 'risky';
    return 'very risky';
  }

  choiceOdds(c, ctx = {}) {
    if (c.p != null) return typeof c.p === 'function' ? c.p(this, ctx) : c.p;
    if (c.roll) {
      const { stat, dc } = c.roll;
      const v = stat === 'power' ? this.power() : stat === 'realm' ? this.life.realm * 12 : this.stat(stat);
      // Agency slider (60) widens the spread: skill matters more than luck.
      const raw = 0.5 + (v - dc) / 40;
      return clamp(raw, 0.05, 0.95);
    }
    return null;
  }

  // Resolve a choice on the pending event. For mini-games, `score` (0..1) is passed by the UI.
  choose(i, score = null) {
    const p = this.life.pending;
    if (!p || p.kind !== 'event') return;
    const ch = p.choices[i];
    if (!ch || ch.locked) return;
    const ev = EVENTS.get(p.id);
    const c = ev.choices[ch.idx];
    const ctx = { bind: p.bind || {} };
    let outcome;
    let success = null;
    const odds = this.choiceOdds(c, ctx);
    if (score != null && (c.ok || c.no)) {
      success = score >= (c.pass ?? 0.5);
      outcome = success ? c.ok : c.no;
    } else if (odds != null) {
      success = this.rng.chance(odds);
      outcome = success ? c.ok : c.no;
    } else {
      outcome = c.r;
    }
    this.life.pending = null;
    const result = outcome?.text ? this.fill(pickVariant(outcome.text, this.rng), ctx) : '';
    this.log(p.text, ev.fmt === 'letter' ? 'letter' : 'event', {
      id: ev.id, cat: p.cat, art: p.art, title: p.title, from: p.from, c: ch.label, r: result, ok: success,
    });
    apply(this, c.fx, ctx);
    if (!this.life.dead) apply(this, outcome, ctx);
    this.emit('resolved', { success });
    this.pump();
  }

  // ── Death check after each step ────────────────────────────────
  checkDeath() {
    const L = this.life;
    if (L.dead) return;
    if (L.stats.health <= 0) this.die(L.lastHarm === 'wounds' ? 'Your wounds proved fatal.' : L.lastHarm || 'Your body gave out.');
  }

  // ── NPC resolution used by conditions, effects and text ───────
  resolveNpc(who, ctx = {}) {
    if (!who) return null;
    if (typeof who === 'object') return who;
    const L = this.life;
    if (who.startsWith('@')) return L.npcs[who.slice(1)] || null;
    const b = ctx.bind?.[who];
    if (b != null && typeof b !== 'object') return L.npcs[b] || null;
    if (L.npcs[who]) return L.npcs[who];
    // Bare role names resolve to the first living NPC with that role ("mother", "master", "spouse").
    const r = this.withRole(who, true);
    return r[0] || null;
  }
}

export function pickVariant(text, rng) {
  if (Array.isArray(text)) return text[Math.floor(rng.next() * text.length)];
  return text;
}
