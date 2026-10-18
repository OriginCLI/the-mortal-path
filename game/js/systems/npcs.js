// People: named fate-bound characters (same in every loop), your family (same in every loop), and
// characters generated as life goes on. Relationship meters: Affection and Respect (0–100).
import { Rng, hashSeed } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { check } from '../engine/cond.js';
import { FAMILY_NAMES, givenName, nickname } from '../content/names.js';
import { ROSTER } from '../content/npcs.js';
import { ORIGINS } from '../content/life.js';
import { LOCATIONS } from '../content/world.js';

const FAMILY_ROLES = ['mother', 'father', 'sibling', 'spouse', 'child'];
const CLOSE_ROLES = ['mother', 'father', 'sibling', 'spouse', 'child', 'lover', 'sworn', 'master', 'disciple', 'friend'];
export const ROLE_TITLE = {
  mother: 'your mother', father: 'your father', sibling: 'your sibling', spouse: 'your spouse', child: 'your child',
  lover: 'your beloved', sworn: 'your sworn sibling', master: 'your master', disciple: 'your disciple', friend: 'your friend',
  rival: 'your rival', nemesis: 'your nemesis', senior: 'your senior', junior: 'your junior', acquaintance: 'an acquaintance',
  guardian: 'your guardian', enemy: 'your enemy',
};

export const npcSystem = {
  // Called once at birth for every life.
  initNpcs() {
    const L = this.life;
    for (const [id, r] of Object.entries(ROSTER)) {
      L.npcs[id] = {
        id, name: r.name, g: r.g, born: r.born, named: true, met: false, role: null,
        aff: r.aff ?? 30, res: r.res ?? 30, realm: realmAtYear(r, 1), stage: 0, sect: r.sect || null,
        loc: r.loc || null, dead: false, romance: !!r.romance, traits: r.traits || [], nick: r.nick || null, flags: {},
      };
    }
    this.buildFamily();
  },

  // Your family is generated from the wheel seed, so the same parents and siblings return every loop.
  buildFamily() {
    const L = this.life;
    const o = ORIGINS[L.origin];
    const r = Rng.from(hashSeed(this.meta.wheel.seed, 'family'));
    const fam = o.family;
    const add = (role, g, age, extra = {}) => {
      const id = `fam_${role}_${Object.keys(L.npcs).length}`;
      const name = role === 'mother' && L.origin !== 'branch'
        ? `${r.pick(FAMILY_NAMES)} ${givenName(r, 'f')}` : `${L.family} ${givenName(r, g)}`;
      L.npcs[id] = {
        id, name, g, born: 1 - age, named: false, met: true, role, aff: role === 'sibling' ? 55 : 75, res: 50,
        realm: extra.realm || 0, stage: 0, sect: extra.sect || null, loc: L.home, dead: false, romance: false,
        traits: extra.traits || [r.pick(['gentle', 'stern', 'proud', 'anxious', 'cheerful', 'quiet'])], flags: {},
        job: extra.job || null,
      };
      return L.npcs[id];
    };
    if (fam.mother) add('mother', 'f', r.int(19, 30), { job: fam.mother });
    if (fam.father) add('father', 'm', r.int(22, 36), { job: fam.father, realm: fam.father === 'disciple' || fam.father === 'cultist' ? 2 : fam.father === 'namgung_branch' ? 1 : 0 });
    if (fam.guardian && L.npcs.oldgu) {
      // The orphan is raised by Old Man Gu, a named character with his own fate.
      Object.assign(L.npcs.oldgu, { role: 'guardian', met: true, aff: 75, res: 40, loc: L.home });
    }
    const [lo, hi] = fam.siblings;
    const n = r.int(lo, hi);
    for (let i = 0; i < n; i++) {
      const s = add('sibling', r.chance(0.5) ? 'm' : 'f', r.int(1, 9));
      s.elder = true;
    }
    // A sect-born child's father is a disciple who died the night you were born.
    if (L.origin === 'sectborn') {
      const f = this.withRole('father', false)[0];
      if (f) { f.dead = true; f.deathCause = 'He died the night you were born.'; }
    }
  },

  generateNpc(spec = {}) {
    const L = this.life;
    const g = spec.g === 'm' || spec.g === 'f' ? spec.g : (this.rng.chance(0.5) ? 'm' : 'f');
    // age: absolute range; ageRel: range relative to your own age.
    const age = spec.ageRel ? Math.max(spec.minAge ?? 12, this.age + this.rng.int(spec.ageRel[0], spec.ageRel[1]))
      : Array.isArray(spec.age) ? this.rng.int(spec.age[0], spec.age[1]) : spec.age ?? this.rng.int(Math.max(12, this.age - 6), this.age + 12);
    const id = `n${L.nextNpc++}`;
    const realm = spec.realm != null
      ? (Array.isArray(spec.realm) ? this.rng.int(spec.realm[0], spec.realm[1]) : spec.realm)
      : clamp(Math.round(this.life.realm + this.rng.range(-1.5, 1)), 0, 8);
    const npc = {
      id, name: spec.name || `${spec.family || this.rng.pick(FAMILY_NAMES)} ${givenName(this.rng, g)}`, g,
      born: this.year - age, named: false, met: spec.met !== false, role: spec.role || 'acquaintance',
      aff: spec.aff ?? 30, res: spec.res ?? 30, realm: clamp(realm, 0, 8), stage: this.rng.int(0, 2), sect: spec.sect || null,
      loc: spec.loc || L.loc, dead: false, romance: spec.romance ?? (Math.abs(age - this.age) <= 8 && this.age >= 15),
      traits: spec.traits || [this.rng.pick(['proud', 'kind', 'greedy', 'honest', 'cunning', 'loyal', 'hot-tempered', 'gentle', 'ambitious', 'cowardly'])],
      flags: {}, nick: spec.nick ? nickname(this.rng) : null, kind: spec.kind || null,
    };
    L.npcs[id] = npc;
    return npc;
  },

  npcAge(npc) { return this.year - npc.born; },

  roleTitle(npc) {
    if (!npc.role) return npc.name;
    if (npc.role === 'sibling') return npc.elder ? `your elder ${npc.g === 'f' ? 'sister' : 'brother'}` : `your younger ${npc.g === 'f' ? 'sister' : 'brother'}`;
    if (npc.role === 'child') return `your ${npc.g === 'f' ? 'daughter' : 'son'}`;
    if (npc.role === 'spouse') return `your ${npc.g === 'f' ? 'wife' : 'husband'}`;
    if (npc.role === 'senior') return `your senior ${npc.g === 'f' ? 'sister' : 'brother'}`;
    if (npc.role === 'junior') return `your junior ${npc.g === 'f' ? 'sister' : 'brother'}`;
    if (npc.role === 'sworn') return `your sworn ${npc.g === 'f' ? 'sister' : 'brother'}`;
    return ROLE_TITLE[npc.role] || npc.name;
  },

  // Living NPCs you know with a role. Special groups: family, close, any, sectmate, romance.
  withRole(role, aliveOnly = true) {
    const key = this.roleCache && `${role}|${aliveOnly}`;
    if (key && this.roleCache.has(key)) return this.roleCache.get(key);
    const out = this.findRole(role, aliveOnly);
    if (key) this.roleCache.set(key, out);
    return out;
  },

  findRole(role, aliveOnly) {
    const out = [];
    for (const n of Object.values(this.life.npcs)) {
      if (aliveOnly && n.dead) continue;
      if (!n.met && role !== 'unmet') continue;
      let ok;
      switch (role) {
        case 'any': ok = true; break;
        case 'family': ok = FAMILY_ROLES.includes(n.role); break;
        case 'parent': ok = n.role === 'mother' || n.role === 'father' || n.role === 'guardian'; break;
        case 'close': ok = CLOSE_ROLES.includes(n.role); break;
        case 'friendly': ok = n.aff >= 50 && !['rival', 'nemesis', 'enemy'].includes(n.role); break;
        case 'sectmate': ok = !!this.life.sect && n.sect === this.life.sect && !FAMILY_ROLES.includes(n.role); break;
        case 'romance': ok = n.romance && !['spouse', 'lover', 'mother', 'father', 'sibling', 'child'].includes(n.role) && Math.abs(this.npcAge(n) - this.age) <= 10 && this.npcAge(n) >= 16; break;
        case 'martial': ok = n.realm >= 1; break;
        case 'hostile': ok = ['rival', 'nemesis', 'enemy'].includes(n.role); break;
        default: ok = n.role === role;
      }
      if (ok) out.push(n);
    }
    return out;
  },

  meetNpc(npc) {
    if (!npc || npc.met) return;
    npc.met = true;
    npc.metTurn = this.life.turn;
    if (!npc.role) npc.role = 'acquaintance';
    this.emit('met', npc);
  },

  setRole(npc, role) {
    if (!npc) return;
    this.meetNpc(npc);
    npc.role = role;
    if (role === 'master') this.life.masterId = npc.id;
  },

  changeRel(npc, d) {
    if (!npc) return;
    this.meetNpc(npc);
    if (d.aff) npc.aff = clamp(npc.aff + d.aff, 0, 100);
    if (d.res) npc.res = clamp(npc.res + d.res, 0, 100);
    if (d.role) this.setRole(npc, d.role);
  },

  killNpc(npc, cause = 'died') {
    if (!npc || npc.dead) return;
    npc.dead = true;
    npc.deathYear = this.year;
    npc.deathCause = cause;
    if (npc.met && ['mother', 'father', 'sibling', 'spouse', 'child', 'lover', 'sworn', 'master', 'disciple', 'guardian'].includes(npc.role)) {
      this.addStat('sanity', -8);
      this.emit('sfx', 'death');
    }
  },

  marry(npc) {
    if (!npc) return;
    for (const n of this.withRole('lover')) if (n !== npc) n.role = 'friend';
    this.setRole(npc, 'spouse');
    npc.aff = Math.max(npc.aff, 70);
    this.life.flags.married = 1;
    this.achieve('married');
  },

  haveChild(spec = {}) {
    const spouse = this.withRole('spouse')[0];
    const g = spec.g || (this.rng.chance(0.5) ? 'm' : 'f');
    const child = this.generateNpc({ g, age: 0, role: 'child', aff: 80, res: 40, realm: 0, family: this.life.family, romance: false, loc: this.life.loc });
    child.parent = spouse?.id || null;
    this.life.tally.children += 1;
    this.achieve('parent');
    return child;
  },

  // Yearly update for everyone: named destinies, aging, illness, growth, betrayal seeds.
  updateNpcs() {
    const L = this.life;
    for (const npc of Object.values(L.npcs)) {
      if (npc.dead) continue;
      const r = ROSTER[npc.id];
      if (r) {
        const target = realmAtYear(r, this.year);
        if (target > npc.realm) npc.realm = target;
        if (r.loc) npc.loc = locAtYear(r, this.year) || npc.loc;
        if (r.dies && r.dies.year === this.year && !(r.dies.unless && check(this, r.dies.unless))) {
          this.killNpc(npc, r.dies.cause);
          if (npc.met) this.log(this.fill(r.dies.text || `News reaches you: ${npc.name} is dead. ${r.dies.cause}`), 'grief', { npc: npc.id });
          continue;
        }
        if (this.npcAge(npc) > (r.lifespan || 70 + npc.realm * 12)) {
          this.killNpc(npc, 'old age');
          if (npc.met) this.log(`${npc.name} passed away of old age.`, 'grief', { npc: npc.id });
        }
        continue;
      }
      // Generated people: mortality rises with age; tragedy slider (34) adds misfortune to the young.
      const age = this.npcAge(npc);
      const old = age > 55 ? Math.exp((age - 70 - npc.realm * 10) / 8) * 0.08 : 0;
      const misfortune = age > 1 ? 0.004 : 0.02;
      if (this.rng.chance(old + misfortune)) {
        this.killNpc(npc, age > 55 ? 'old age' : this.rng.pick(['a fever', 'an accident on the road', 'a sword', 'the river']));
        if (npc.met && npc.role !== 'acquaintance') {
          this.log(this.fill(age > 55 ? `${npc.name}, ${this.roleTitle(npc)}, died of old age at ${age}.` : `${npc.name}, ${this.roleTitle(npc)}, died of ${npc.deathCause}. It was sudden, and senseless.`), 'grief', { npc: npc.id });
        }
        continue;
      }
      if (npc.realm >= 1 && npc.realm < 6 && this.rng.chance(0.06)) npc.realm += 1;
      // Bonds fade without attention.
      if (npc.met && !FAMILY_ROLES.includes(npc.role) && (L.turn - (npc.lastTalk || npc.metTurn || 0)) > 16) {
        npc.aff = Math.max(10, npc.aff - 2);
      }
    }
  },
};

export function realmAtYear(r, year) {
  if (!r.realms) return r.realm || 0;
  let v = 0;
  for (const [y, realm] of r.realms) if (year >= y) v = realm;
  return v;
}

function locAtYear(r, year) {
  if (!r.locs) return r.loc;
  let v = r.loc;
  for (const [y, loc] of r.locs) if (year >= y && LOCATIONS[loc]) v = loc;
  return v;
}
