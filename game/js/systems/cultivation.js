// Cultivation: qi fills a stage (Early / Mid / Late); a full Late stage is a bottleneck that needs a
// breakthrough. Breakthroughs are tense (risk 48) and failures fail forward. Manuals carry their
// martial theory across lives: you remember the forms, but the body must relearn them.
import { clamp } from '../core/util.js';
import { REALMS, STAGES, MAX_REALM } from '../content/realms.js';
import { MANUALS, TECHS, MASTERY_UNLOCK } from '../content/martial.js';
import { ITEMS } from '../content/life.js';

const RISK = 48; // spec: breakthrough danger

const DEVIATIONS = [
  { id: 'injury', w: 46 },
  { id: 'crippled', w: 12 },
  { id: 'madness', w: 18 },
  { id: 'death', w: 7 },
  { id: 'insight', w: 6 },
];

export const cultivationSystem = {
  method() { return this.life.method ? MANUALS[this.life.method] : null; },

  qiRate() {
    const L = this.life;
    const m = this.method();
    let rate = REALMS[L.realm].qi * (m ? m.qi : 0.3) * this.con.talent * (1 + L.stats.insight / 200);
    if (this.con.demonic && m?.path === 'demonic') rate *= this.con.demonic;
    if (L.sect && this.loc.sect === L.sect) rate *= 1.2;
    if (L.masterId && !L.npcs[L.masterId]?.dead) rate *= 1.15;
    if (L.crippled) rate *= m && (m.path === 'poison' || m.path === 'external') ? 0.6 : 0;
    if (L.constitution === 'nine_yin' && !L.cured.nine_yin && this.age >= 12) rate *= 1.1;
    if (L.stats.sanity < 30) rate *= 0.8;
    return rate;
  },

  stageLabel() { return this.life.realm === 0 ? 'Mortal' : `${STAGES[this.life.stage]} ${REALMS[this.life.realm].name}`; },

  meditate() {
    const L = this.life;
    const before = this.stageLabel();
    const gain = this.qiRate() * this.rng.range(0.85, 1.15);
    this.addStat('sanity', 2);
    this.addQi(gain);
    if (this.maybeOn('meditate', 0.07)) return;
    let line;
    if (!L.method) line = 'You sat and breathed, the way old men do in the village square. Without a heart method, the qi just drifts.';
    else if (L.crippled && gain === 0) line = 'You sat with your crippled meridians and felt nothing move. Nothing at all.';
    else if (L.bottleneck) line = `You stand at the threshold of the ${REALMS[L.realm + 1]?.name || 'unknown'} realm. Meditation alone will not carry you across.`;
    else line = this.rng.pick(['Qi gathered in your dantian like morning dew.', 'You breathed with the mountain until you could not tell which was which.', 'Your qi circulated the Small Heavenly Circuit without a stumble.', 'You meditated through the night. By dawn, the warmth below your navel had grown.']);
    const after = this.stageLabel();
    this.log(before !== after ? `${line} You have reached ${after}.` : line, 'act');
  },

  addQi(v) {
    const L = this.life;
    if (v <= 0 || L.realm >= MAX_REALM && L.stage >= 2 && L.stats.qi >= 100) return;
    L.stats.qi += v;
    while (L.stats.qi >= 100) {
      const cap = this.method()?.cap ?? 1;
      if (L.realm > 0 && L.stage < 2) {
        L.stage += 1;
        L.stats.qi -= 100;
        this.emit('sfx', 'qi');
        continue;
      }
      L.stats.qi = 100;
      if (!L.bottleneck) {
        L.bottleneck = true;
        if (L.realm >= MAX_REALM) this.log('You have reached the end of every road you know. There is nowhere left to climb.', 'note');
        else if (L.realm >= cap) this.log(`Your ${this.method()?.name || 'breathing'} can take you no higher than ${REALMS[L.realm].name}. You need a better heart method.`, 'note');
        else this.log(`A bottleneck. You stand at the threshold of the ${REALMS[L.realm + 1].name} realm.`, 'note');
      }
      break;
    }
  },

  // Hinted odds shown to the player as words, never numbers (spec: bars without numbers, hinted odds).
  breakthroughOdds() {
    const L = this.life;
    let o = REALMS[L.realm].odds;
    o += L.stats.insight * 0.15;
    o += L.foundation || 0;
    if (L.inSeclusion) o += 10;
    if (this.meta.theory.realm > L.realm) o += 12; // you have crossed this threshold before
    if (L.masterId && !L.npcs[L.masterId]?.dead) o += 5;
    o -= (100 - L.stats.sanity) * 0.18;
    o -= (RISK - 40) * 0.6;
    o -= L.injuries.length * 6;
    if (this.con.talent < 0.8) o -= 10;
    if (this.meta.wheel.mode === 'story') o += 10;
    if (this.meta.wheel.mode === 'hard') o -= 8;
    return clamp(o, 5, 95) / 100;
  },

  oddsWord(p) {
    if (p >= 0.85) return 'You feel certain.';
    if (p >= 0.65) return 'Your foundation feels solid.';
    if (p >= 0.45) return 'It could go either way.';
    if (p >= 0.25) return 'Your foundation feels shaky.';
    return 'Every instinct tells you this will go badly.';
  },

  canBreakthrough() {
    const L = this.life;
    const cap = this.method()?.cap ?? 0;
    return L.bottleneck && L.realm < MAX_REALM && L.realm < cap && !L.crippled && L.actions > 0;
  },

  attemptBreakthrough() {
    if (!this.canAdvance() || !this.canBreakthrough()) return false;
    this.life.actions -= 1;
    this.resolveBreakthrough(this.breakthroughOdds());
    this.pump();
    return true;
  },

  resolveBreakthrough(odds) {
    const L = this.life;
    if (this.rng.chance(odds)) { this.forceBreakthrough(); return true; }
    L.tally.deviations += 1;
    L.stats.qi = 50;
    L.bottleneck = false;
    L.foundation = 0;
    this.emit('sfx', 'deviation');
    // Higher realms make death likelier; Heaven-Spurned bodies cannot go mad.
    const pool = DEVIATIONS.filter((d) => !(d.id === 'madness' && this.con.noMadness))
      .map((d) => ({ ...d, w: d.id === 'death' ? d.w * (1 + L.realm * 0.25) * this.difficulty() : d.w }));
    const d = this.rng.weighted(pool);
    switch (d.id) {
      case 'injury':
        this.injure({ name: 'internal injury', seasons: this.rng.int(4, 10), sev: this.rng.int(15, 30) });
        this.log('Qi deviation. Your qi rebounded through the meridians like a struck bell. Internal injury: years of recovery ahead.', 'deviation');
        break;
      case 'crippled':
        this.setCrippled(true);
        this.addStat('health', -25);
        this.log('Qi deviation. A meridian tore with a sound like ripping silk. You are crippled. The orthodox road is closed to you, but the body arts and the poison arts use other channels…', 'deviation');
        this.setFlag('failforward.crippled');
        break;
      case 'madness':
        this.addStat('sanity', -30);
        this.addStat('health', -10);
        this.log('Qi deviation. Red mist filled your vision and something else looked out through your eyes. The heart-demon has a foothold now.', 'deviation');
        this.setFlag('failforward.madness');
        break;
      case 'death':
        this.die('Qi deviation. Your dantian ruptured, and qi burned outward from your navel like a lit fuse.', 'deviation');
        break;
      case 'insight':
        this.learnManual('lost_reversed_step');
        this.addStat('insight', 5);
        this.log('Qi deviation, and yet: through the agony, your qi ran backwards along a path no manual describes. You have discovered the Reversed Meridian Step.', 'deviation');
        break;
      default: break;
    }
    return false;
  },

  forceBreakthrough() {
    const L = this.life;
    if (L.realm >= MAX_REALM) return;
    L.realm += 1;
    L.stage = 0;
    L.stats.qi = 0;
    L.bottleneck = false;
    L.foundation = 0;
    L.tally.breakthroughs += 1;
    this.addStat('body', 3);
    this.addStat('fame', L.realm * 2);
    L.stats.health = this.maxHealth();
    this.meta.theory.realm = Math.max(this.meta.theory.realm, L.realm);
    this.meta.stats.bestRealm = Math.max(this.meta.stats.bestRealm, L.realm);
    this.log(this.breakthroughText(L.realm), 'breakthrough', { realm: L.realm });
    this.emit('breakthrough', L.realm);
    this.achieve(`realm${L.realm}`);
  },

  breakthroughText(r) {
    const name = REALMS[r].name;
    const lines = {
      1: 'The warmth in your dantian became a flame. You can feel qi now, truly feel it. You have entered the Third-Rate realm.',
      2: 'Your qi completed its first full circuit without a stumble. Second-Rate. The basics are yours.',
      3: 'Your blade hummed before you moved it. First-Rate: the sects would notice you now.',
      4: 'Qi left your sword as a pale blade of light, three fingers long. The Peak realm. Few ever stand here.',
      5: 'You moved before the thought of moving had finished. Transcendent. The world has slowed down to wait for you.',
      6: 'Your body and your qi stopped arguing. Harmony. Your hair darkened; your skin smoothed. Age loosened its grip.',
      7: 'You glimpsed the shape of Heaven in a falling leaf. The Mystic realm. Words are no longer quite enough.',
      8: 'Life and death are a door, and you are holding the handle. There is no realm above this one.',
    };
    return lines[r] || `You broke through to the ${name} realm.`;
  },

  setMethod(id) {
    const L = this.life;
    if (!MANUALS[id] || MANUALS[id].type !== 'heart') return;
    if (L.method && L.method !== id) L.stats.qi *= 0.75;
    L.method = id;
    if (!(id in L.manuals)) L.manuals[id] = 0;
    if (L.bottleneck && L.realm < (MANUALS[id].cap ?? 0) && L.stats.qi >= 100) {
      this.log(`With the ${MANUALS[id].name}, the way forward opens again.`, 'note');
    }
  },

  learnManual(id) {
    const L = this.life;
    const m = MANUALS[id];
    if (!m) throw new Error(`Unknown manual "${id}"`);
    if (id in L.manuals) return false;
    L.manuals[id] = 0;
    this.meta.theory.manuals[id] = Math.max(this.meta.theory.manuals[id] || 0, 1);
    this.remember(`theory.${id}`);
    if (m.type === 'heart') {
      const cur = this.method();
      if (!cur || (m.qi > cur.qi && (m.cap ?? 0) >= (cur.cap ?? 0))) this.setMethod(id);
    } else if (!L.focus) L.focus = id;
    if (!L.path && m.path !== 'any') L.path = m.path;
    this.log(`You learned the ${m.name}.`, 'learn', { manual: id });
    this.emit('sfx', 'qi');
    return true;
  },

  trainingFocus() {
    const L = this.life;
    if (L.focus && L.focus in L.manuals) return L.focus;
    const arts = Object.keys(L.manuals).filter((m) => MANUALS[m].type === 'art' && L.manuals[m] < 100);
    return arts[0] || null;
  },

  masteryGain(id) {
    const L = this.life;
    const m = MANUALS[id];
    let g = this.rng.range(3, 6) * (1 + L.stats.insight / 150);
    if (m.weapon === 'sword' && this.con.sword) g *= this.con.sword;
    if (m.path === 'poison' && this.con.poison) g *= this.con.poison;
    if ((L.manuals[id] || 0) < (this.meta.theory.manuals[id] || 0)) g *= 2.5; // your hands remember
    g *= Math.max(0.35, 1 - Math.max(0, m.tier - L.realm) * 0.15);
    return g;
  },

  addMastery(id, n) {
    const L = this.life;
    if (!(id in L.manuals)) return;
    const before = L.manuals[id];
    const after = Math.min(100, before + n);
    L.manuals[id] = after;
    this.meta.theory.manuals[id] = Math.max(this.meta.theory.manuals[id] || 0, Math.floor(after));
    const m = MANUALS[id];
    m.techs.forEach((t, i) => {
      if (before < MASTERY_UNLOCK[i] && after >= MASTERY_UNLOCK[i] && i > 0) {
        this.log(`Mastery deepens: you can now use ${TECHS[t].name}.`, 'learn');
      }
    });
  },

  knownTechs() {
    const L = this.life;
    const out = [];
    for (const [id, mastery] of Object.entries(L.manuals)) {
      const m = MANUALS[id];
      if (m.type !== 'art') continue;
      m.techs.forEach((t, i) => { if (mastery >= MASTERY_UNLOCK[i]) out.push(t); });
    }
    return out;
  },

  // Martial theory from past lives: manuals you can rebuild from memory alone.
  recallable() {
    return Object.keys(this.meta.theory.manuals).filter((id) => !(id in this.life.manuals) && this.remembers(`theory.${id}`)
      && MANUALS[id].tier <= this.life.realm + 2);
  },

  recallManual(id) {
    const L = this.life;
    if (!this.recallable().includes(id) || L.actions <= 0 || this.age < 8) return false;
    L.actions -= 1;
    const m = MANUALS[id];
    const p = clamp(0.35 + L.stats.insight / 100 - m.tier * 0.06 + (m.rarity === 'legendary' ? -0.15 : 0), 0.08, 0.9);
    if (this.rng.chance(p)) {
      this.learnManual(id);
      this.log(`From memory alone you wrote out the ${m.name}, line by line, and began to practise it again.`, 'learn');
    } else {
      this.log(`You tried to rebuild the ${m.name} from memory. Pieces came back; the whole would not. Not yet.`, 'act');
      this.addStat('insight', 0.8);
    }
    this.pump();
    return true;
  },

  power() {
    const L = this.life;
    const weapon = Math.max(0, ...Object.keys(L.items).map((i) => ITEMS[i].power || 0));
    const bestMastery = Math.max(0, ...Object.entries(L.manuals).filter(([m]) => MANUALS[m].type === 'art').map(([, v]) => v));
    let p = REALMS[L.realm].power * (1 + L.stage * 0.1) + L.stats.body * 0.35 + weapon + bestMastery * 0.12;
    if (L.crippled) p *= 0.7;
    if (L.injuries.length) p *= 0.9;
    return p;
  },

  // ── Seclusion: skip years in closed-door training ──────────────
  seclusion(years) {
    const L = this.life;
    if (!this.canAdvance() || this.age < 14) return false;
    years = clamp(Math.round(years), 1, 30);
    L.actions = 0;
    L.inSeclusion = true;
    const startRealm = L.realm;
    const startAge = this.age;
    const news = [];
    this.log(`You sealed the door of your seclusion chamber${years > 1 ? ` for ${years} years` : ' for a year'}.`, 'act');
    for (let i = 0; i < years * 4; i++) {
      L.turn += 1;
      L.queue = [];
      if (this.season === 0) { this.yearly(); }
      if (L.dead) break;
      this.seasonal();
      if (L.dead) break;
      const happened = this.runTimeline(true);
      news.push(...happened);
      // Two meditations a season, deeper than usual.
      this.addQi(this.qiRate() * 2.3);
      this.addStat('sanity', 1);
      if (L.bottleneck && this.method() && L.realm < (this.method().cap ?? 0) && !L.crippled) {
        this.resolveBreakthrough(Math.min(0.95, this.breakthroughOdds()));
        if (L.dead) break;
      }
      const t = this.trainingFocus();
      if (t) this.addMastery(t, this.masteryGain(t));
      if (happened.some((h) => h.interrupt)) { this.log('News reached even your sealed chamber. You broke seclusion early.', 'note'); break; }
    }
    L.inSeclusion = false;
    L.queue = [];
    L.queuedThisTurn = {};
    if (L.dead) { this.pump(); return true; }
    L.actions = this.actionsPerSeason();
    const parts = [`You emerged at ${this.age}, ${this.age - startAge} years older.`];
    if (L.realm > startRealm) parts.push(`You went in ${REALMS[startRealm].name} and came out ${this.stageLabel()}.`);
    else parts.push(`You are ${this.stageLabel()}.`);
    if (news.length) parts.push(`While you were away: ${news.map((n) => n.title).join('; ')}.`);
    this.log(parts.join(' '), 'seclusion');
    this.queueScheduled();
    this.pump();
    return true;
  },

  forceSeclusion(years) { this.seclusion(years); },
};
