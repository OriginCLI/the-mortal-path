// Combat (spec: technique menu, up to 8 exchanges, lethality 57, bars without numbers, poetic names,
// exits: flee / yield / talk / dirty tricks / foreknowledge). Fights live in life.pending so a save
// mid-duel resumes mid-duel. Your health is your real health: wounds carry out of the fight.
import { clamp } from '../core/util.js';
import { REALMS } from '../content/realms.js';
import { MANUALS, TECHS } from '../content/martial.js';
import { SECTS } from '../content/world.js';
import { nickname } from '../content/names.js';
import { apply } from '../engine/fx.js';

const LETHALITY = 57;
const MAX_EXCHANGES = 8;
const ATTACKS = new Set(['strike', 'heavy', 'hidden', 'poison']);
const CONTEXT_LETHAL = { spar: 0, duel: 0.12, tournament: 0.04, ambush: 0.6, war: 0.55, assassination: 0.8, beast: 0.5, nemesis: 0.9 };

// Techniques for foes with no manuals (bandits, beasts, soldiers).
const FOE_TECHS = {
  bandit: [['a wild saber chop', 'strike', 1.1], ['a two-handed overhead cleave', 'heavy', 1.8], ['a raised saber', 'guard', 0.5]],
  beast: [['a raking claw', 'strike', 1.2], ['a lunging bite', 'heavy', 1.9], ['a wary crouch', 'step', 0.6]],
  soldier: [['a disciplined thrust', 'strike', 1.0], ['a shield wall', 'guard', 0.7], ['a spear charge', 'heavy', 1.7]],
  assassin: [['a needle from the sleeve', 'hidden', 1.2], ['a poisoned blade', 'poison', 1.1], ['a vanishing step', 'step', 0.8]],
  cultist: [['Demon Palm: Black Sun', 'strike', 1.35], ['Demon Palm: Hell Opens', 'heavy', 2.2], ['Shadow Demon Step', 'step', 0.85]],
  brawler: [['a haymaker', 'strike', 1.0], ['a headbutt', 'heavy', 1.5], ['raised fists', 'guard', 0.4]],
};

const L_ = {
  youHit: {
    strike: ['You flowed into {tech}. {Foe} was a heartbeat late, and you {wound}.', '{Tech}! Your strike slipped past {foe}’s guard and you {wound}.', 'You feinted high and struck low with {tech}; {foe} staggered as you {wound}.'],
    heavy: ['You gathered your qi and unleashed {tech}. The air itself bent, and {foe} was thrown back as you {wound}.', '{Tech}! The ground cracked under your feet and {foe} could not stand against it; you {wound}.', 'For an instant the world went silent around {tech}. Then {foe} cried out as you {wound}.'],
    hidden: ['Your sleeve flicked: {tech}. {Foe} twisted, too late, and you {wound}.', '{Tech}, three glints in the light. Two missed. The third did not, and you {wound}.'],
    poison: ['{Tech} brushed {foe} only lightly, but the poison was already in the blood.', 'You struck with {tech}, and a grey stain spread under {foe}’s skin.'],
  },
  youMiss: {
    strike: ['{Tech} cut only air; {foe} was already elsewhere.', '{Foe} turned your {tech} aside with insulting ease.'],
    heavy: ['{Tech} split the ground where {foe} had been standing a breath ago.', 'You poured everything into {tech}, and {foe} simply was not there.'],
    hidden: ['{Tech} rattled harmlessly off a post.', '{Foe} plucked your {tech} out of the air.'],
    poison: ['{Foe} held their breath and stepped out of {tech}.'],
  },
  foeHit: {
    strike: ['{Foe} answered with {ftech}. You were too slow; {hurt}.', '{Ftech}! {Foe}’s blow slid past your guard and {hurt}.', '{Foe} pressed in with {ftech}, and {hurt}.'],
    heavy: ['{Ftech}! Thunder seemed to fall from a clear sky, and {hurt}.', '{Foe} roared and brought {ftech} down like a falling mountain; {hurt}.'],
    hidden: ['Something glinted in {foe}’s hand: {ftech}. {Hurt}.', '{Ftech} from nowhere. {Hurt}.'],
    poison: ['{Foe} touched you with {ftech}. A cold numbness began to spread.', '{Ftech} grazed you. The wound burned green.'],
  },
  foeMiss: ['{Foe}’s {ftech} passed so close you felt the wind of it.', 'You read {ftech} a moment before it came and slipped aside.', '{Ftech} rang off your guard.'],
  guarded: ['Your {tech} met {ftech} head on; the shock rattled your teeth, but held.', 'You turned {ftech} aside with {tech}.'],
  stepped: ['You flowed out of the path of {ftech} with {tech}.', '{Tech} carried you clear; {ftech} found nothing.'],
  foeGuarded: ['{Foe} caught your {tech} on {ftech}. Neither gave an inch.', 'Your {tech} broke against {foe}’s {ftech} like a wave on rock.'],
  foeStepped: ['{Foe} slid away from {tech} with {ftech}.'],
  countered: ['{Foe} was waiting: {ftech} turned your own force back on you, and {hurt}.'],
  youCountered: ['You were waiting for it: {tech} turned {foe}’s force back on them, and you {wound}.'],
  standoff: ['You circled each other, each waiting for the other to break.', 'Neither of you committed. The silence stretched like a bowstring.'],
};
const WOUND = ['opened a shallow cut along their arm', 'drew a line of red across their ribs', 'drove the breath from their lungs', 'sent them reeling, blood at their lips', 'struck deep and true'];
const HURT = ['a line of fire opened along your arm', 'something cracked in your side', 'the breath left your lungs in a rush', 'you tasted blood', 'the world went white for a moment'];

export const combatSystem = {
  // spec: { foe, context, important, lethal, title, text, win, lose, flee, yield, spare, kill, talk, max }
  startCombat(spec, ctx = {}) {
    const L = this.life;
    const foe = this.buildFoe(spec.foe, ctx, spec.context);
    const context = spec.context || 'duel';
    const lethal = spec.lethal ?? CONTEXT_LETHAL[context] ?? 0.2;
    L.pending = {
      kind: 'combat', context, important: !!spec.important, lethal,
      title: spec.title ? this.fill(spec.title, ctx) : this.combatTitle(context, foe),
      intro: spec.text ? this.fill(spec.text, ctx) : null,
      foe, ex: 0, max: spec.max || MAX_EXCHANGES,
      you: { qi: this.combatQi(), maxQi: this.combatQi(), start: L.stats.health },
      lines: spec.text ? [{ ex: 0, text: this.fill(spec.text, ctx) }] : [], bind: ctx.bind || {}, spec: stripFns(spec), done: false,
      tricks: { lime: false },
    };
    L.tally.fights += 1;
    this.emit('mood', 'danger');
    this.emit('pending', L.pending);
  },

  // A rough read of a fight before it starts, for choice hints (never numbers).
  fightWord(spec, ctx = {}) {
    let realm = this.life.realm;
    const f = spec.foe;
    if (typeof f === 'string') realm = this.resolveNpc(f, ctx)?.realm ?? (ctx.bind?.[f]?.new?.realm ?? realm);
    else if (f) realm = f.rel != null ? this.life.realm + f.rel : (Array.isArray(f.realm) ? f.realm[0] : f.realm ?? realm);
    realm = Math.max(0, Math.min(8, Math.round(realm)));
    const ratio = this.power() / (REALMS[realm].power * 1.1 + 5);
    const lethal = (spec.lethal ?? CONTEXT_LETHAL[spec.context] ?? 0.2) >= 0.4;
    if (ratio >= 1.35) return lethal ? 'a fight you should win' : 'you should win';
    if (ratio >= 0.85) return lethal ? 'an even fight, to the death' : 'an even fight';
    if (ratio >= 0.6) return lethal ? 'a hard fight, and a deadly one' : 'a hard fight';
    return lethal ? 'a deadly fight' : 'you are badly outmatched';
  },

  combatTitle(context, foe) {
    return { spar: `Sparring with ${foe.name}`, duel: `A duel with ${foe.name}`, tournament: `Tournament bout: ${foe.name}`, ambush: `Ambush! ${foe.name}`,
      war: `Battle: ${foe.name}`, assassination: `Assassin: ${foe.name}`, beast: `${foe.name}`, nemesis: `${foe.name}` }[context] || foe.name;
  },

  combatQi() { return Math.round(30 + this.life.realm * 14 + this.life.stage * 4); },

  buildFoe(f, ctx, context) {
    let npc = null;
    if (typeof f === 'string') npc = this.resolveNpc(f, ctx);
    const spec = typeof f === 'object' ? f : {};
    const base = npc || spec;
    let realm = base.realm ?? this.life.realm;
    if (spec.rel != null) realm = clamp(this.life.realm + spec.rel, 0, 8);
    realm = clamp(Math.round(realm), 0, 8);
    const stage = base.stage ?? this.rng.int(0, 2);
    const kind = spec.kind || (npc?.sect ? 'disciple' : 'brawler');
    const gaze = 1 + this.meta.gaze / 40;
    const power = (spec.power || REALMS[realm].power * (1 + stage * 0.1) + (spec.body ?? 14) * 0.35 + (npc ? 6 : 0)) * gaze * (this.meta.wheel.mode === 'story' ? 0.9 : this.meta.wheel.mode === 'hard' ? 1.12 : 1);
    return {
      id: npc?.id || null,
      key: spec.key || npc?.id || null,
      name: npc ? npc.name : spec.nick ? `${spec.name || 'A stranger'}, ${nickname(this.rng)}` : this.fill(spec.name || 'a stranger', ctx),
      realm, stage, power, hp: 100, qi: 30 + realm * 14, maxQi: 30 + realm * 14,
      techs: this.foeTechs(npc, kind, realm),
      kind, beast: kind === 'beast', g: npc?.g || spec.g || 'm',
    };
  },

  foeTechs(npc, kind, realm) {
    const sect = npc?.sect && SECTS[npc.sect];
    if (sect) {
      const pool = sect.manuals.flat().filter((m) => MANUALS[m]?.type === 'art' && (MANUALS[m].tier <= realm + 1));
      const techs = pool.flatMap((m) => MANUALS[m].techs).map((t) => ({ name: TECHS[t].name, kind: TECHS[t].kind, pow: TECHS[t].pow, cost: TECHS[t].cost }));
      if (techs.length >= 2) return techs;
    }
    return (FOE_TECHS[kind] || FOE_TECHS.brawler).map(([name, k, pow]) => ({ name, kind: k, pow, cost: k === 'heavy' ? 12 : 4 }));
  },

  // Techniques you can use right now, with whether you can afford them.
  combatOptions() {
    const p = this.life.pending;
    if (!p || p.kind !== 'combat') return [];
    const ids = ['basic_strike', 'basic_guard', ...this.knownTechs()];
    return ids.map((id) => ({ id, ...TECHS[id], affordable: TECHS[id].cost <= p.you.qi }));
  },

  combatExits() {
    const p = this.life.pending;
    if (!p || p.kind !== 'combat' || p.done) return [];
    const out = [{ id: 'flee', label: 'Flee' }];
    if (!p.foe.beast) out.push({ id: 'yield', label: 'Yield' });
    if (!p.foe.beast && p.context !== 'war') out.push({ id: 'talk', label: 'Talk it down' });
    out.push({ id: 'trick', label: (this.life.items.lime_powder || 0) > 0 ? 'Throw lime powder' : 'Fight dirty', used: p.tricks.lime });
    if (p.foe.key && this.remembers(`foe.${p.foe.key}`)) out.push({ id: 'memory', label: 'Use what you remember' });
    if (p.ex >= 1 && !p.important) out.push({ id: 'auto', label: 'Let it play out' });
    return out;
  },

  combatAct(action) {
    const p = this.life.pending;
    if (!p || p.kind !== 'combat' || p.done) return;
    if (TECHS[action]) this.exchange(action);
    else this.combatExit(action);
    if (!p.done && this.life.pending === p) this.save();
  },

  foePick(p) {
    const affordable = p.foe.techs.filter((t) => t.cost <= p.foe.qi);
    const pool = affordable.length ? affordable : [{ name: 'a desperate swing', kind: 'strike', pow: 0.8, cost: 0 }];
    const hurt = p.foe.hp < 40;
    return this.rng.weighted(pool, (t) => (t.kind === 'heavy' ? (hurt ? 3 : 1.4) : t.kind === 'guard' || t.kind === 'step' ? (hurt ? 0.8 : 1.2) : 2));
  },

  exchange(techId) {
    const p = this.life.pending;
    const L = this.life;
    const mine = TECHS[techId];
    if (mine.cost > p.you.qi) return;
    p.ex += 1;
    p.you.qi -= mine.cost;
    const ft = this.foePick(p);
    p.foe.qi -= ft.cost || 0;
    const myP = this.power() * (p.tricks.lime ? 1.15 : 1);
    const foeP = p.foe.power * (p.tricks.lime ? 0.8 : 1);
    const ratio = myP / Math.max(1, foeP);
    const lethality = 0.8 + LETHALITY / 200;
    const tok = (s, extra = {}) => this.fill(s, { bind: {} }).replace(/\{Tech\}/g, cap(mine.name)).replace(/\{tech\}/g, mine.name)
      .replace(/\{Ftech\}/g, cap(ft.name)).replace(/\{ftech\}/g, ft.name)
      .replace(/\{Foe\}/g, cap(p.foe.name)).replace(/\{foe\}/g, p.foe.name)
      .replace(/\{wound\}/g, extra.wound || '').replace(/\{Hurt\}/g, cap(extra.hurt || '')).replace(/\{hurt\}/g, extra.hurt || '');
    const lines = [];
    const sfx = [];
    let dealt = 0;
    let taken = 0;

    // My action against theirs.
    if (ATTACKS.has(mine.kind)) {
      let hit = clamp(0.64 + (ratio - 1) * 0.35 + (mine.kind === 'heavy' ? -0.12 : mine.kind === 'hidden' ? 0.08 : 0), 0.1, 0.95);
      if (ft.kind === 'step') hit -= ft.pow * 0.4;
      if (this.rng.chance(hit)) {
        let dmg = 13 * mine.pow * Math.pow(ratio, 0.75) * this.rng.range(0.8, 1.2) * lethality;
        if (ft.kind === 'guard') { dmg *= 1 - Math.min(0.8, ft.pow * 0.9); lines.push(tok(this.rng.pick(L_.foeGuarded))); sfx.push('clash'); }
        else if (ft.kind === 'counter' && mine.kind !== 'hidden' && this.rng.chance(0.55)) {
          const back = 11 * ft.pow * Math.pow(1 / ratio, 0.7) * this.rng.range(0.8, 1.2) * lethality;
          taken += back;
          dmg *= 0.4;
          lines.push(tok(this.rng.pick(L_.countered), { hurt: hurtWord(back, this.rng) }));
          sfx.push('hit');
        } else {
          lines.push(tok(this.rng.pick(L_.youHit[mine.kind]), { wound: woundWord(dmg, this.rng) }));
          sfx.push(mine.kind === 'heavy' ? 'clash' : 'hit');
        }
        if (mine.kind === 'poison') p.foe.poison = (p.foe.poison || 0) + 4 * mine.pow;
        if (mine.drain) { p.you.qi = Math.min(p.you.maxQi, p.you.qi + 8); }
        dealt += dmg;
      } else {
        lines.push(tok(this.rng.pick(ft.kind === 'step' ? L_.foeStepped : L_.youMiss[mine.kind])));
        sfx.push('swish');
      }
    }

    // Their action against mine.
    if (ATTACKS.has(ft.kind)) {
      let hit = clamp(0.62 + (1 / ratio - 1) * 0.35 + (ft.kind === 'heavy' ? -0.12 : 0), 0.1, 0.95);
      if (mine.kind === 'step') hit -= mine.pow * 0.45;
      if (this.rng.chance(hit)) {
        let dmg = 13 * ft.pow * Math.pow(1 / ratio, 0.75) * this.rng.range(0.8, 1.2) * lethality;
        if (mine.kind === 'guard') { dmg *= 1 - Math.min(0.8, mine.pow * 0.9); lines.push(tok(this.rng.pick(L_.guarded))); sfx.push('clash'); }
        else if (mine.kind === 'counter' && ft.kind !== 'hidden' && this.rng.chance(0.55)) {
          const back = 12 * mine.pow * Math.pow(ratio, 0.7) * this.rng.range(0.8, 1.2) * lethality;
          dealt += back;
          dmg *= 0.4;
          lines.push(tok(this.rng.pick(L_.youCountered), { wound: woundWord(back, this.rng) }));
          sfx.push('hit');
        } else {
          lines.push(tok(this.rng.pick(L_.foeHit[ft.kind]), { hurt: hurtWord(dmg, this.rng) }));
          sfx.push('hit');
        }
        if (ft.kind === 'poison' && !this.con.poisonImmune) L.poisoned = (L.poisoned || 0) + 2;
        taken += dmg;
      } else if (!ATTACKS.has(mine.kind) || this.rng.chance(0.5)) {
        lines.push(tok(this.rng.pick(mine.kind === 'step' ? L_.stepped : L_.foeMiss)));
      }
    } else if (!ATTACKS.has(mine.kind)) {
      lines.push(tok(this.rng.pick(L_.standoff)));
    }

    if (mine.self) taken += mine.self;
    if (p.foe.poison) { dealt += p.foe.poison; p.foe.poison *= 0.6; }
    p.foe.hp = Math.max(0, p.foe.hp - dealt);
    // Sparring and tournaments pull their blows; your real health takes less of the damage.
    const realScale = p.context === 'spar' ? 0.25 : p.context === 'tournament' ? 0.5 : 1;
    this.addStat('health', -taken * realScale);
    L.lastHarm = `${p.foe.name} killed you.`;
    p.you.qi = Math.min(p.you.maxQi, p.you.qi + 3);
    p.foe.qi = Math.min(p.foe.maxQi, p.foe.qi + 3);
    p.lines.push({ ex: p.ex, text: lines.join(' ') });
    this.emit('combat', { lines, sfx });
    this.checkCombatEnd();
  },

  // Your "hit points" in a fight are your health relative to where it started.
  myCombatHp() {
    const p = this.life.pending;
    const start = Math.max(1, p.you.start);
    return clamp((this.life.stats.health / start) * 100, 0, 100);
  },

  checkCombatEnd() {
    const p = this.life.pending;
    const me = this.myCombatHp();
    const lowLine = p.context === 'spar' ? 35 : 12;
    if (this.life.stats.health <= 0 || me <= lowLine) { this.endCombat('lose'); return; }
    if (p.foe.hp <= (p.context === 'spar' ? 30 : 0)) { this.endCombat('win'); return; }
    if (p.ex >= p.max) {
      const diff = me - p.foe.hp;
      this.endCombat(diff > 12 ? 'win' : diff < -12 ? 'lose' : 'draw');
    }
  },

  combatExit(id) {
    const p = this.life.pending;
    const L = this.life;
    const ratio = this.power() / Math.max(1, p.foe.power);
    switch (id) {
      case 'auto': {
        let guard = 0;
        while (!p.done && guard++ < 20) {
          const opts = this.combatOptions().filter((o) => o.affordable);
          const t = this.rng.weighted(opts, (o) => (o.kind === 'heavy' ? 2 : o.kind === 'strike' ? 3 : 1));
          this.exchange(t.id);
        }
        break;
      }
      case 'flee': {
        const stepM = Math.max(0, ...Object.entries(L.manuals).filter(([m]) => MANUALS[m].weapon === 'step').map(([, v]) => v));
        const chance = clamp(0.45 + (ratio - 1) * 0.3 + stepM / 300 + L.stats.body / 400, 0.1, 0.92);
        if (this.rng.chance(chance)) this.endCombat('flee');
        else {
          p.lines.push({ ex: p.ex, text: `You tried to break away, but ${p.foe.name} cut off your escape.` });
          this.addStat('health', -6);
          this.emit('combat', { lines: [p.lines.at(-1).text], sfx: ['hit'] });
          this.checkCombatEnd();
        }
        break;
      }
      case 'yield': {
        const accept = p.lethal < 0.5 || this.rng.chance(0.4);
        if (accept) this.endCombat('yield');
        else {
          p.lines.push({ ex: p.ex, text: `${cap(p.foe.name)} laughed at your surrender and kept coming.` });
          this.emit('combat', { lines: [p.lines.at(-1).text], sfx: [] });
        }
        break;
      }
      case 'talk': {
        if (p.talked) return;
        p.talked = true;
        const chance = clamp(0.2 + (L.stats.charm + L.stats.insight) / 250 + (ratio - 1) * 0.2 + L.stats.fame / 400 - p.lethal * 0.2, 0.05, 0.85);
        if (this.rng.chance(chance)) this.endCombat('talk');
        else {
          p.lines.push({ ex: p.ex, text: this.rng.pick(['“You talk too much,” they said, and attacked.', 'Your words bounced off like arrows off a wall.']) });
          this.emit('combat', { lines: [p.lines.at(-1).text], sfx: [] });
        }
        break;
      }
      case 'trick': {
        if (p.tricks.lime) return;
        p.tricks.lime = true;
        if ((L.items.lime_powder || 0) > 0) this.addItem('lime_powder', -1);
        this.addStat('infamy', 5);
        p.foe.hp = Math.max(0, p.foe.hp - 12);
        p.lines.push({ ex: p.ex, text: `You flung a fistful of lime into ${p.foe.name}’s eyes. Not honorable. Very effective.` });
        this.emit('combat', { lines: [p.lines.at(-1).text], sfx: ['swish'] });
        this.checkCombatEnd();
        break;
      }
      case 'memory': {
        p.lines.push({ ex: p.ex, text: `In another life you watched ${p.foe.name} fight. You know the opening they always leave. You take it.` });
        p.foe.hp = Math.max(0, p.foe.hp - (ratio > 0.6 ? 100 : 45));
        this.emit('combat', { lines: [p.lines.at(-1).text], sfx: ['clash'] });
        this.checkCombatEnd();
        break;
      }
      default: break;
    }
  },

  endCombat(result) {
    const p = this.life.pending;
    const L = this.life;
    p.done = true;
    p.result = result;
    const spec = p.spec;
    const ctx = { bind: p.bind };
    let text = '';
    let fx = null;
    if (result === 'win') {
      L.tally.wins += 1;
      this.addStat('fame', p.context === 'spar' ? 0.5 : 2 + p.foe.realm);
      fx = spec.win;
      text = fx?.text || `${cap(p.foe.name)} went down and stayed down.`;
      if (p.foe.id && p.context !== 'spar') this.changeRel(L.npcs[p.foe.id], { res: 10 });
      if (p.foe.key) this.remember(`foe.${p.foe.key}`);
      // A lethal fight you win leaves their life in your hands.
      if (p.lethal >= 0.4 && !p.foe.beast) p.mercy = true;
    } else if (result === 'lose') {
      fx = spec.lose;
      // Fail forward: in a fight that is not meant to kill, a beaten fighter usually lives, even bled white.
      // Judges stop tournament bouts and sparring partners pull their blows.
      const deadly = p.context === 'spar' || p.context === 'tournament' ? 0 : p.lethal * (0.3 + LETHALITY / 200) * this.difficulty();
      const bled = L.stats.health <= 0;
      if ((bled && deadly > 0 && (p.lethal >= 0.3 || this.rng.chance(p.lethal * 2))) || this.rng.chance(deadly)) {
        text = fx?.deathText || `${cap(p.foe.name)} did not stop.`;
        p.died = true;
      } else {
        text = fx?.text || (p.context === 'spar' ? `${cap(p.foe.name)} tapped your chest with two fingers. You lost.` : `You were beaten. ${cap(p.foe.name)} left you in the dirt.`);
        if (bled) { L.stats.health = 4; text += ' You lived. Barely.'; }
        if (p.context !== 'spar' && p.context !== 'tournament') this.injure({ name: this.rng.pick(['broken ribs', 'deep cut', 'cracked arm', 'internal bruising']), seasons: this.rng.int(2, 5), sev: 0 });
      }
      if (p.foe.key) this.remember(`foe.${p.foe.key}`);
    } else if (result === 'draw') {
      fx = spec.draw || spec.lose;
      text = spec.draw?.text || 'Neither of you could finish it. You parted, both bleeding, both thinking.';
    } else if (result === 'flee') {
      fx = spec.flee;
      text = fx?.text || 'You ran, and lived. Face can be regained; heads cannot be reattached.';
      this.addStat('fame', -1);
    } else if (result === 'yield') {
      fx = spec.yield || spec.lose;
      text = spec.yield?.text || `You yielded. ${cap(p.foe.name)} accepted, with a look you will remember.`;
      this.addStat('fame', -2);
    } else if (result === 'talk') {
      fx = spec.talk || spec.flee;
      text = spec.talk?.text || 'You talked. Somehow, it worked. Blades went back into sheaths.';
    }
    p.outcomeText = this.fill(text, ctx);
    p.outcomeFx = fx ? stripText(fx) : null;
    this.emit('combat', { end: result });
  },

  // After a lethal win you choose: spare, kill, or (demonic) absorb their qi.
  mercyOptions() {
    const p = this.life.pending;
    if (!p?.mercy) return [];
    const out = [{ id: 'spare', label: 'Spare them' }, { id: 'kill', label: 'Finish it' }];
    const absorb = Object.keys(this.life.manuals).some((m) => MANUALS[m].absorb) || this.path === 'demonic';
    if (absorb) out.push({ id: 'absorb', label: 'Drink their qi' });
    return out;
  },

  mercy(choice) {
    const p = this.life.pending;
    if (!p?.mercy) return;
    const L = this.life;
    const npc = p.foe.id ? L.npcs[p.foe.id] : null;
    const ctx = { bind: p.bind };
    if (choice === 'spare') {
      this.addStat('fame', 2);
      this.addRep('orthodox', 2);
      if (npc) this.changeRel(npc, { res: 10, aff: 5 });
      p.outcomeText += ' You let them live.';
      if (p.spec.spare) apply(this, p.spec.spare, ctx);
    } else {
      L.tally.kills += 1;
      this.addStat('infamy', npc ? 6 : 2);
      if (npc) this.killNpc(npc, `killed by ${L.family} ${L.name}`);
      if (choice === 'absorb') {
        this.addQi(this.scaledQi(20 + p.foe.realm * 18));
        this.addStat('sanity', -12);
        this.addStat('infamy', 8);
        this.addRep('orthodox', -10);
        this.addRep('cult', 3);
        p.outcomeText += ' You laid your palm on their dantian and drank. Their qi went down like hot wine. Something in you smiled.';
        this.emit('sfx', 'deviation');
      } else {
        p.outcomeText += ' You finished it.';
      }
      if (p.spec.kill) apply(this, p.spec.kill, ctx);
    }
    p.mercy = false;
    this.finishCombat();
  },

  finishCombat() {
    const p = this.life.pending;
    const ctx = { bind: p.bind };
    const summary = p.lines.map((l) => l.text).join(' ');
    this.log(p.title, 'combat', { lines: p.lines.map((l) => l.text), r: p.outcomeText, ok: p.result === 'win', summary: summary.slice(0, 2000) });
    this.life.pending = null;
    if (p.died) {
      if (p.outcomeFx) apply(this, p.outcomeFx, ctx);
      if (!this.life.dead) this.die(`${p.outcomeText} You died at ${this.age}.`, 'combat');
    } else if (p.outcomeFx) apply(this, p.outcomeFx, ctx);
    this.emit('mood', 'calm');
    this.pump();
  },
};

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function woundWord(dmg, rng) { return WOUND[Math.min(WOUND.length - 1, Math.floor(dmg / 7))] || rng.pick(WOUND); }
function hurtWord(dmg, rng) { return HURT[Math.min(HURT.length - 1, Math.floor(dmg / 7))] || rng.pick(HURT); }
function stripText(fx) { const o = { ...fx }; delete o.text; delete o.deathText; return o; }
function stripFns(spec) {
  // Outcome objects may hold functions (fn effects); keep them, but drop the foe object reference.
  const o = { ...spec };
  return o;
}
