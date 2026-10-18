// Factions and sects (membership, rank, merit, reputation), careers, and travel across the map.
import { clamp, test } from '../core/util.js';
import { SECTS, FACTIONS, LOCATIONS, RANK_REALM, RANK_MERIT, travelSeasons, nearby } from '../content/world.js';
import { CAREERS, ORIGINS } from '../content/life.js';
import { REALMS } from '../content/realms.js';
import { MANUALS } from '../content/martial.js';

export const worldSystem = {
  // ── Reputation (spec: per-faction standing + Fame and Infamy) ──
  addRep(f, n) {
    if (!(f in FACTIONS)) throw new Error(`Unknown faction "${f}"`);
    this.life.rep[f] = clamp((this.life.rep[f] || 0) + n, -100, 100);
  },

  repWord(v) {
    if (v >= 60) return 'Revered';
    if (v >= 30) return 'Respected';
    if (v >= 10) return 'Known';
    if (v > -10) return 'Unknown';
    if (v > -30) return 'Distrusted';
    if (v > -60) return 'Hated';
    return 'Sworn enemy';
  },

  // ── Sect membership ────────────────────────────────────────────
  canSeekAdmission(id) {
    const s = SECTS[id];
    const L = this.life;
    if (!s || L.sect === id) return false;
    if (s.admit.gender && s.admit.gender !== L.gender) return false;
    if (s.admit.origin && !s.admit.origin.includes(L.origin)) return false;
    if (s.admit.age && !test(this.age, s.admit.age)) return false;
    if (L.flags[`expelled.${id}`]) return false;
    if (s.faction === 'orthodox' && L.stats.infamy > 40) return false;
    return this.life.loc === s.loc && L.actions > 0;
  },

  admissionOdds(id) {
    const L = this.life;
    const youth = this.age <= 12 ? 0.15 : 0;
    return clamp(0.3 + youth + L.stats.body / 200 + L.stats.insight / 200 + (this.con.talent - 1) * 0.5 + (L.rep[SECTS[id].faction] || 0) / 200 + L.realm * 0.08, 0.05, 0.92);
  },

  seekAdmission(id) {
    if (!this.canAdvance() || !this.canSeekAdmission(id)) return false;
    this.life.actions -= 1;
    const s = SECTS[id];
    if (this.rng.chance(this.admissionOdds(id))) {
      this.joinSect(id, 0);
      this.log(`You knelt at the gate of the ${s.name} for three days. On the fourth, they let you in.`, 'join');
    } else {
      this.setFlag(`rejected.${id}+1`);
      this.log(`The ${s.name} looked you over and sent you away. "Not this year."`, 'act');
    }
    this.pump();
    return true;
  },

  joinSect(id, rank = 0) {
    const L = this.life;
    const s = SECTS[id];
    if (!s) throw new Error(`Unknown sect "${id}"`);
    if (L.sect && L.sect !== id) this.leaveSect(false, true);
    L.sect = id;
    L.rank = rank;
    L.merit = 0;
    L.joinedTurn = L.turn;
    this.addRep(s.faction, 8);
    for (let r = 0; r <= rank; r++) this.grantRankManuals(r);
    // Members of your sect you have met become seniors and juniors.
    for (const n of Object.values(L.npcs)) {
      if (n.met && n.sect === id && (!n.role || n.role === 'acquaintance')) n.role = this.npcAge(n) > this.age ? 'senior' : 'junior';
    }
    this.achieve(`joined.${s.faction}`);
    this.emit('sfx', 'seal');
  },

  grantRankManuals(rank) {
    const L = this.life;
    const s = SECTS[L.sect];
    if (this.age < 6) return;
    for (const m of s.manuals[rank] || []) if (MANUALS[m] && !(m in L.manuals)) this.learnManual(m);
  },

  leaveSect(expelled, quiet = false) {
    const L = this.life;
    if (!L.sect) return;
    const s = SECTS[L.sect];
    if (expelled) {
      L.flags[`expelled.${L.sect}`] = 1;
      this.addRep(s.faction, -25);
      this.addStat('infamy', 8);
      if (!quiet) this.log(`You were expelled from the ${s.name}. Your name was struck from the register.`, 'note');
    } else {
      this.addRep(s.faction, -8);
      if (!quiet) this.log(`You left the ${s.name}.`, 'note');
    }
    L.sect = null;
    L.rank = 0;
    L.merit = 0;
  },

  addMerit(n) {
    if (!this.life.sect) return;
    this.life.merit = Math.max(0, this.life.merit + n);
  },

  changeRank(n) {
    const L = this.life;
    if (!L.sect) return;
    const before = L.rank;
    L.rank = clamp(L.rank + n, 0, 4);
    for (let r = before + 1; r <= L.rank; r++) this.grantRankManuals(r);
    if (L.rank > before) this.log(`You were raised to ${SECTS[L.sect].ranks[L.rank]} of the ${SECTS[L.sect].name}.`, 'rank');
  },

  promotionReady() {
    const L = this.life;
    if (!L.sect || L.rank >= 3) return false;
    const next = L.rank + 1;
    return L.merit >= RANK_MERIT[next] && L.realm >= RANK_REALM[next];
  },

  sectYearly() {
    const L = this.life;
    if (!L.sect || this.age < 6) return;
    const s = SECTS[L.sect];
    if (this.age === 6 || (this.age > 6 && !Object.keys(L.manuals).length)) this.grantRankManuals(0);
    if (this.loc.sect === L.sect) this.addMerit(3 + L.rank);
    if (L.rank >= 1) this.addItem('qi_pill', 1);
    if (L.rank >= 2) this.addStat('wealth', 5 * L.rank);
    if (this.promotionReady()) this.changeRank(1);
    if (L.rank >= 2 && (!L.masterId || L.npcs[L.masterId]?.dead)) this.assignMaster();
    // Orthodox sects do not tolerate notorious members.
    if (s.faction === 'orthodox' && L.stats.infamy > 60 && this.rng.chance(0.4)) this.leaveSect(true);
  },

  assignMaster() {
    const L = this.life;
    const candidates = Object.values(L.npcs).filter((n) => !n.dead && n.sect === L.sect && n.realm >= Math.max(3, L.realm + 1) && this.npcAge(n) > this.age + 10);
    let m = candidates.sort((a, b) => b.realm - a.realm)[0];
    if (!m) m = this.generateNpc({ g: this.rng.chance(0.5) ? 'm' : 'f', age: [45, 70], realm: Math.max(4, L.realm + 1), sect: L.sect, role: 'master', aff: 50, res: 60, romance: false });
    this.setRole(m, 'master');
    this.log(`${m.name}, ${REALMS[m.realm].name} realm, accepted you as a direct disciple.`, 'note', { npc: m.id });
  },

  // ── Careers ────────────────────────────────────────────────────
  availableCareers() {
    return Object.entries(CAREERS).filter(([id, c]) => this.age >= c.minAge && (c.minRealm == null || this.life.realm >= c.minRealm)
      && (!c.infamy || this.life.sect == null || SECTS[this.life.sect].faction !== 'orthodox') && this.life.career?.id !== id);
  },

  setCareer(id) {
    const L = this.life;
    if (id == null) { if (L.career) this.log(`You gave up your work as a ${CAREERS[L.career.id].name.toLowerCase()}.`, 'note'); L.career = null; return; }
    const c = CAREERS[id];
    if (!c) throw new Error(`Unknown career "${id}"`);
    L.career = { id, rank: 0, xp: 0, since: this.year };
    this.log(`You found work as a ${c.ranks[0].toLowerCase()}.`, 'note');
    if (this.headless === false) this.emit('sfx', 'click');
  },

  takeCareer(id) {
    if (!this.canAdvance() || !this.availableCareers().some(([c]) => c === id)) return false;
    this.setCareer(id);
    this.pump();
    return true;
  },

  careerXp(n) {
    const L = this.life;
    if (!L.career) return;
    const c = CAREERS[L.career.id];
    L.career.xp += n;
    const need = (L.career.rank + 1) * 6;
    if (L.career.rank < c.ranks.length - 1 && L.career.xp >= need && this.stat(c.stat) >= 12 + L.career.rank * 14) {
      if (c.exam && L.career.rank === 0 && !L.flags.passedExam) return; // scholars need the examination
      L.career.rank += 1;
      L.career.xp = 0;
      this.log(`You were promoted: ${c.ranks[L.career.rank]}.`, 'rank');
      if (c.faction) this.addRep(c.faction, 3);
    }
  },

  payCareer() {
    const L = this.life;
    if (!L.career) return;
    const c = CAREERS[L.career.id];
    this.addStat('wealth', Math.ceil(c.pay[L.career.rank] * 0.5));
  },

  // ── Travel ─────────────────────────────────────────────────────
  moveTo(loc, silent = false) {
    if (!LOCATIONS[loc]) throw new Error(`Unknown location "${loc}"`);
    this.life.loc = loc;
    this.life.travel = null;
    if (!silent) this.log(`You arrived at ${LOCATIONS[loc].name}. ${LOCATIONS[loc].desc}`, 'travel', { loc });
    this.emit('travel', loc);
  },

  destinations() {
    return Object.keys(LOCATIONS).filter((id) => id !== this.life.loc)
      .map((id) => ({ id, seasons: travelSeasons(this.life.loc, id), ...LOCATIONS[id] }));
  },

  canTravel() { return this.age >= 12 && this.canAdvance() && !this.life.travel; },

  travel(dest) {
    if (!this.canTravel() || !LOCATIONS[dest] || dest === this.life.loc) return false;
    const n = travelSeasons(this.life.loc, dest);
    this.life.travel = { dest, left: n, from: this.life.loc };
    this.log(`You set out from ${this.loc.name} for ${LOCATIONS[dest].name}, ${n === 1 ? 'a season' : `${n} seasons`} on the road.`, 'travel');
    this.continueJourney();
    return true;
  },

  continueJourney() {
    let guard = 0;
    while (this.life.travel && this.canAdvance() && guard++ < 12) this.nextSeason();
  },

  // Called from the season pipeline while on the road.
  travelTick() {
    const L = this.life;
    if (!L.travel) return;
    L.travel.left -= 1;
    L.actions = Math.min(L.actions, 1);
    const danger = 0.35 * (1 + this.meta.gaze / 15) * this.difficulty();
    if (this.rng.chance(danger)) {
      const pick = this.drawEvent('road');
      if (pick) L.queue.push(pick);
    }
    if (L.travel.left <= 0) {
      const dest = L.travel.dest;
      this.moveTo(dest);
      if (this.rng.chance(0.25)) {
        const pick = this.drawEvent('arrive');
        if (pick) L.queue.push(pick);
      }
    }
  },

  nearbyPlaces() { return nearby(this.life.loc); },
  originHome() { return ORIGINS[this.life.origin].home; },
};
