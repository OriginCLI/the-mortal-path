// The wheel: memory (codex + notes, fading), karmic burden, Heaven's gaze, the fixed timeline of world
// history, achievements, the Hall of Lives, and regression itself.
import { clamp } from '../core/util.js';
import { Rng } from '../core/rng.js';
import { CODEX } from '../engine/registry.js';
import { apply } from '../engine/fx.js';
import { check } from '../engine/cond.js';
import { TIMELINE } from '../content/timeline.js';
import { ORIGINS, CONSTITUTIONS, RECIPES } from '../content/life.js';
import { SECTS, LOCATIONS } from '../content/world.js';
import { REALMS } from '../content/realms.js';
import { MANUALS } from '../content/martial.js';
import { ROSTER } from '../content/npcs.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { newLife } from '../engine/game.js';

const FADE_LOOPS = 3;
const DYNAMIC = /^(theory|foe|recipe|self|people|timeline)\./;

export const wheelSystem = {
  // ── Memory ─────────────────────────────────────────────────────
  remember(id) {
    if (!CODEX.has(id) && !DYNAMIC.test(id)) throw new Error(`Unknown codex entry "${id}"`);
    const m = this.meta;
    const prev = m.codex[id];
    const isNew = !prev;
    m.codex[id] = { ...(prev || { first: m.loop, firstAge: this.age }), loop: m.loop };
    if (isNew) this.emit('codex', { id, entry: this.codexEntry(id) });
  },

  // A memory is usable unless it has faded (spec cost: memories fade). Notes you wrote never fade, and
  // neither does martial theory or knowledge of your own body.
  remembers(id) {
    const e = this.meta.codex[id];
    return !!e && !this.isFaded(id, e);
  },

  fadeLevel(id, e = this.meta.codex[id]) {
    if (!e) return 0;
    if (e.note || /^(theory|self)\./.test(id)) return 0;
    return clamp(this.meta.loop - e.loop, 0, FADE_LOOPS);
  },

  isFaded(id, e) { return this.fadeLevel(id, e) >= FADE_LOOPS; },

  refreshMemories(n) {
    const hazy = Object.entries(this.meta.codex).filter(([id, e]) => this.fadeLevel(id, e) >= 1)
      .sort((a, b) => a[1].loop - b[1].loop).slice(0, n);
    for (const [, e] of hazy) e.loop = this.meta.loop;
    return hazy.map(([id]) => this.codexEntry(id).title);
  },

  annotate(id, text) {
    const e = this.meta.codex[id];
    if (!e) return;
    e.note = String(text || '').slice(0, 500);
    if (!e.note) delete e.note;
    this.save();
  },

  addNote(text) {
    const t = String(text || '').trim().slice(0, 1000);
    if (!t) return;
    this.meta.notes.push({ text: t, loop: this.meta.loop, age: this.age, year: this.year });
    this.save();
  },

  removeNote(i) { this.meta.notes.splice(i, 1); this.save(); },
  toggleMark(eventId) { if (this.meta.marks[eventId]) delete this.meta.marks[eventId]; else this.meta.marks[eventId] = 1; this.save(); },

  // Resolve any codex id, including dynamic ones, to { cat, title, text }.
  codexEntry(id) {
    if (CODEX.has(id)) return CODEX.get(id);
    const [kind, ...rest] = id.split('.');
    const key = rest.join('.');
    if (kind === 'theory' && MANUALS[key]) return { cat: 'theory', title: MANUALS[key].name, text: `${MANUALS[key].desc || 'A martial art you once practised.'} Highest mastery in any life: ${this.meta.theory.manuals[key] || 0}%.` };
    if (kind === 'recipe' && RECIPES[key]) {
      const r = RECIPES[key];
      const needs = Object.keys(r.needs).length ? Object.keys(r.needs).join(', ').replace(/_/g, ' ') : 'common herbs';
      return { cat: 'recipes', title: `Recipe: ${r.name}`, text: `Needs ${needs}, ${r.cost} taels and Insight ${r.insight}.` };
    }
    if (kind === 'self') return { cat: 'secrets', title: 'Your own body', text: `${CONSTITUTIONS[this.life.constitution].name}. ${CONSTITUTIONS[this.life.constitution].desc}` };
    if (kind === 'foe') {
      const r = ROSTER[key];
      return { cat: 'people', title: `How ${r ? r.name : 'an old enemy'} fights`, text: 'You have crossed blades before, in this life or another. You know the opening they always leave.' };
    }
    if (kind === 'people' && ROSTER[key]) return { cat: 'people', title: ROSTER[key].name, text: ROSTER[key].desc };
    if (kind === 'timeline') {
      const t = TIMELINE.find((x) => x.id === key);
      if (t) return { cat: 'timeline', title: `Year ${t.year}, ${['spring', 'summer', 'autumn', 'winter'][t.season]}: ${t.title}`, text: t.memory || t.text };
    }
    return { cat: 'secrets', title: id, text: '' };
  },

  metaValue(k) {
    const m = this.meta;
    switch (k) {
      case 'loop': return m.loop;
      case 'rival': return m.rival;
      case 'gaze': return m.gaze;
      case 'burden': return m.burden;
      case 'deaths': return m.stats.deaths;
      case 'codex': return Object.keys(m.codex).length;
      case 'bestRealm': return m.stats.bestRealm;
      default: return m.achievements[k] ? 1 : 0;
    }
  },

  addGaze(n) { this.meta.gaze = clamp(this.meta.gaze + n, 0, 20); },

  achieve(id) {
    if (this.meta.achievements[id] || !ACHIEVEMENTS[id]) return;
    this.meta.achievements[id] = this.meta.loop;
    this.emit('achievement', { id, ...ACHIEVEMENTS[id] });
  },

  // ── Timeline ───────────────────────────────────────────────────
  timelineState(id) {
    const s = this.life.timeline[id];
    if (s === 'witnessing') return this.life.flags[`avert.${id}`] ? 'averted' : 'happened';
    return s || (this.life.flags[`avert.${id}`] ? 'averted' : 'pending');
  },

  // Personal timeline entries resolved by a witness event: mark them happened and apply their effects.
  letHappen(id) {
    const t = TIMELINE.find((x) => x.id === id);
    if (!t || this.life.flags[`avert.${id}`]) return;
    this.life.timeline[id] = 'happened';
    apply(this, t.fx);
    if (t.memorable !== false) this.remember(`timeline.${id}`);
  },

  // Willow Creek burns (Year 15). Your family dies only if you are not there to change it.
  willowRaid() {
    const L = this.life;
    if (L.origin !== 'peasant' || L.flags['family.evacuated']) return;
    for (const n of this.withRole('parent')) this.killNpc(n, 'killed when Willow Creek burned');
    if (this.rng.chance(0.5)) {
      const sib = this.withRole('sibling')[0];
      if (sib) this.killNpc(sib, 'killed when Willow Creek burned');
    }
    this.log('Word reached you that Willow Creek was burned. Your family was there.', 'grief');
  },

  avertTimeline(id) {
    if (this.life.flags[`avert.${id}`]) return;
    this.life.flags[`avert.${id}`] = 1;
    if (this.life.timeline[id] === 'witnessing') this.life.timeline[id] = 'averted';
    const t = TIMELINE.find((x) => x.id === id);
    if (t?.achieve) this.achieve(t.achieve);
    this.life.tally.averted += 1;
    this.addGaze(1);
    this.achieve('changed_history');
  },

  runTimeline(silent = false) {
    const L = this.life;
    const out = [];
    for (const t of TIMELINE) {
      if (t.year !== this.year || t.season !== this.season || L.timeline[t.id]) continue;
      if (t.if && !check(this, t.if)) { L.timeline[t.id] = 'skipped'; continue; }
      if (L.flags[`avert.${t.id}`] || (t.unless && check(this, t.unless))) {
        L.timeline[t.id] = 'averted';
        if (t.achieve) this.achieve(t.achieve);
        if (t.avertedText) this.log(this.fill(t.avertedText), 'news', { tl: t.id });
        continue;
      }
      // Personal history: if you are there, your choices in the witness event decide what happens.
      const present = !t.loc || t.loc === L.loc || (t.region && LOCATIONS[L.loc].region === t.region);
      if (t.personal && present && !silent && t.witness) {
        L.timeline[t.id] = 'witnessing';
        this.schedule(t.witness, 0);
        out.push({ title: t.title, interrupt: true });
        continue;
      }
      L.timeline[t.id] = 'happened';
      apply(this, t.fx);
      // Determinism 25: history mostly repeats, but the world wobbles a little each loop.
      const text = Array.isArray(t.text) ? t.text[this.rng.int(0, t.text.length - 1)] : t.text;
      if (!silent || t.major) this.log(this.fill(text), 'news', { tl: t.id, title: t.title });
      if (t.memorable !== false) this.remember(`timeline.${t.id}`);
      if (t.witness && !silent && present) this.schedule(t.witness, 0);
      out.push({ title: t.title, interrupt: !!(t.loc && t.loc === L.loc && t.major) });
      if (L.dead) break;
    }
    return out;
  },

  timelineRumor() {
    const soon = TIMELINE.filter((t) => t.rumor && t.year > this.year && t.year <= this.year + 3 && !this.life.timeline[t.id]
      && (!t.region || t.region === this.loc.region || t.major));
    if (!soon.length) return null;
    const t = this.rng.pick(soon);
    return this.fill(t.rumor);
  },

  // ── End of a life, and the turn of the wheel ──────────────────
  lifeTitle() {
    const L = this.life;
    const sect = L.sect ? SECTS[L.sect] : null;
    if (L.realm >= 6) return `the ${REALMS[L.realm].name} Master${sect ? ` of the ${sect.name}` : ''}`;
    if (L.sect && L.rank >= 3) return `${sect.ranks[L.rank]} of the ${sect.name}`;
    if (L.stats.infamy > 60) return 'a name mothers used to frighten children';
    if (L.stats.fame > 60) return 'a hero of the Gangho';
    if (L.career && L.career.rank >= 2) return `a ${['respected', 'renowned'][L.career.rank - 2] || 'respected'} ${['farmer', 'escort', 'merchant'].includes(L.career.id) ? L.career.id : L.career.id}`;
    if (L.realm >= 3) return `a ${REALMS[L.realm].name} swordsman`;
    if (this.age < 12) return 'a child';
    return 'an ordinary mortal';
  },

  epitaph() {
    const L = this.life;
    const parts = [];
    if (L.tally.averted) parts.push(`changed history ${L.tally.averted === 1 ? 'once' : `${L.tally.averted} times`}`);
    if (L.tally.children) parts.push(`raised ${L.tally.children === 1 ? 'a child' : `${L.tally.children} children`}`);
    if (L.tally.kills) parts.push(`killed ${L.tally.kills}`);
    if (L.tally.breakthroughs) parts.push(`broke through ${L.tally.breakthroughs} time${L.tally.breakthroughs > 1 ? 's' : ''}`);
    const spouse = Object.values(L.npcs).find((n) => n.role === 'spouse');
    if (spouse) parts.push(`loved ${spouse.name}`);
    return parts.length ? `${parts.join(', ')}.` : 'Lived, and died, and remembered.';
  },

  endLife() {
    const L = this.life;
    if (!L.dead || L.ended) return null;
    L.ended = true;
    const m = this.meta;
    const entry = {
      loop: m.loop, name: `${L.family} ${L.name}`, age: L.dead.age, cause: L.dead.cause, kind: L.dead.kind,
      realm: L.realm, stage: L.stage, title: this.lifeTitle(), epitaph: this.epitaph(),
      sect: L.sect, fame: Math.round(L.stats.fame), infamy: Math.round(L.stats.infamy), year: L.dead.year,
      averted: L.tally.averted, children: L.tally.children, kills: L.tally.kills,
    };
    m.hall.push(entry);
    m.stats.deaths += 1;
    // Spec costs: karmic burden and Heaven's notice.
    m.burden = clamp(m.burden + 1, 0, 10);
    this.addGaze(0.5);
    if (L.dead.age >= 80) this.achieve('long_life');
    if (m.hall.length >= 10) this.achieve('ten_lives');
    this.save();
    return entry;
  },

  canRegress() { return this.meta.wheel.mode !== 'ironman'; },

  regress() {
    if (!this.life.dead) return;
    if (!this.life.ended) this.endLife();
    if (!this.canRegress()) { this.meta.over = true; this.save(); return false; }
    this.meta.loop += 1;
    this.life = newLife(this.meta);
    this.rng = new Rng(this.life.rng);
    this.initLife(true);
    this.emit('regressed', this.meta.loop);
    this.pump();
    return true;
  },

  // Set up a fresh life (first or after regression).
  initLife(regressed = false) {
    const L = this.life;
    this.initNpcs();
    const o = ORIGINS[L.origin];
    if (o.sect) { L.sect = o.sect; L.rank = 0; }
    if (regressed) {
      this.log(this.rng.pick([
        'The wheel turned. You opened your eyes on the same morning, in the same small body, and every memory came with you.',
        'Darkness, then light. A newborn’s cry, which was yours. You remembered everything.',
        'You died. And then, impossibly, you were born again, on the same day, to the same mother, remembering.',
      ]), 'wheel');
      this.remember('self.constitution');
    }
    this.log(o.birth, 'birth');
    if (L.constitution !== 'ordinary' && regressed) this.log(`You already know what your body is: ${CONSTITUTIONS[L.constitution].name}.`, 'note');
  },
};
