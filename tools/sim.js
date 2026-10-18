// Headless life simulator: plays many lives with a random-but-sensible policy using the real engine.
// Reports crashes, lifespans, realms, causes of death, event coverage and an estimate of play time.
//   node tools/sim.js [--lives 300] [--seed 1] [--loops 3] [--verbose]
import { startWheel } from '../game/js/engine/index.js';
import { EVENTS, stats } from '../game/js/engine/registry.js';
import { ORIGINS } from '../game/js/content/life.js';
import { SECTS } from '../game/js/content/world.js';
import { Rng } from '../game/js/core/rng.js';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith('--') ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true] : null).filter(Boolean));
const LIVES = Number(args.lives || 200);
const LOOPS = Number(args.loops || 3);
const SEED = Number(args.seed || 1);
const VERBOSE = !!args.verbose;
const policy = new Rng({ s: SEED * 7919 });

const origins = Object.keys(ORIGINS);
const out = { lives: 0, crashes: [], ages: [], realms: [], causes: {}, seen: new Set(), turns: 0, choices: 0, combats: 0, actions: 0, averted: 0, sects: {}, slow: 0, maxLog: 0 };

function act(g) {
  const L = g.life;
  // Spend actions on a plausible mix.
  let guard = 0;
  while (L.actions > 0 && !L.pending && !L.dead && guard++ < 6) {
    const acts = g.availableActivities().map(([id]) => id).filter((id) => id !== 'seclusion' && id !== 'journal');
    if (!acts.length) break;
    if (g.canBreakthrough() && policy.chance(0.7)) { g.attemptBreakthrough(); out.actions++; continue; }
    const weights = { meditate: 4, train: 4, work: 2, study: 1.5, wander: 1.5, tavern: 1, doctor: L.stats.health < 50 ? 4 : 0.2, gamble: 0.3, play: 3 };
    const id = policy.weighted(acts, (a) => weights[a] ?? 1);
    g.doActivity(id, id === 'gamble' ? { bet: 3, guess: policy.chance(0.5) ? 'big' : 'small' } : {});
    out.actions++;
  }
  // Occasionally seek a sect, a career, travel, seclusion, or talk to people.
  if (!L.pending && !L.dead) {
    if (!L.sect && g.age >= 6 && g.age <= 16 && policy.chance(0.15)) {
      const here = Object.entries(SECTS).find(([id]) => g.canSeekAdmission(id));
      if (here) g.seekAdmission(here[0]);
      else if (g.canTravel() && policy.chance(0.3)) g.travel(policy.pick(['mounthua', 'songshan', 'wudang', 'luoyang']));
    }
    if (!L.pending && !L.career && g.age >= 15 && policy.chance(0.1)) {
      const c = g.availableCareers();
      if (c.length) g.takeCareer(policy.pick(c)[0]);
    }
    if (!L.pending && g.age >= 20 && policy.chance(0.01) && g.canAdvance()) { g.seclusion(policy.int(1, 5)); }
    if (!L.pending && !L.dead && policy.chance(0.25)) {
      const people = Object.values(L.npcs).filter((n) => n.met && !n.dead);
      if (people.length) {
        const n = policy.pick(people);
        const opts = g.availableInteractions(n).filter((a) => a !== 'kill' && a !== 'duel');
        if (opts.length) g.interact(n.id, policy.pick(opts));
      }
    }
    if (!L.pending && g.canTravel() && policy.chance(0.01)) g.travel(policy.pick(Object.keys(g.destinations().reduce((o, d) => (o[d.id] = 1, o), {}))));
  }
}

function resolvePending(g) {
  const p = g.life.pending;
  if (!p) return;
  if (p.kind === 'event') {
    const ok = p.choices.map((c, i) => [c, i]).filter(([c]) => !c.locked);
    const [, i] = policy.pick(ok);
    out.choices++;
    g.choose(i, p.game ? policy.next() : null);
  } else if (p.kind === 'combat') {
    out.combats++;
    let guard = 0;
    while (g.life.pending === p && !p.done && guard++ < 30) {
      const exits = g.combatExits();
      if (exits.some((e) => e.id === 'auto') && policy.chance(0.5)) { g.combatAct('auto'); continue; }
      if (policy.chance(0.05)) { g.combatAct(policy.pick(exits).id); continue; }
      const opts = g.combatOptions().filter((o) => o.affordable);
      g.combatAct(policy.weighted(opts, (o) => (o.kind === 'heavy' ? 2 : o.kind === 'strike' ? 3 : 1)).id);
    }
    if (g.life.pending === p && p.mercy) g.mercy(policy.pick(g.mercyOptions()).id);
  }
}

const t0 = Date.now();
for (let i = 0; i < LIVES; i++) {
  const g = startWheel({ name: 'Ryu', family: 'Baek', gender: policy.chance(0.5) ? 'm' : 'f', origin: origins[i % origins.length], mode: 'standard', seed: SEED * 100003 + i }, { headless: true });
  for (let loop = 0; loop < LOOPS; loop++) {
    try {
      let guard = 0;
      while (!g.life.dead && guard++ < 1600) {
        if (g.life.pending) resolvePending(g);
        else { act(g); if (!g.life.pending && !g.life.dead) { g.nextSeason(); out.turns++; } }
      }
      if (!g.life.dead) { out.slow++; g.die('simulation cap', 'cap'); }
    } catch (err) {
      out.crashes.push({ seed: g.meta.wheel.seed, loop, age: g.age, err: err.stack.split('\n').slice(0, 4).join(' | ') });
      break;
    }
    out.lives++;
    out.ages.push(g.life.dead.age);
    out.realms.push(g.life.realm);
    out.causes[g.life.dead.kind] = (out.causes[g.life.dead.kind] || 0) + 1;
    out.averted += g.life.tally.averted;
    if (g.life.sect) out.sects[g.life.sect] = (out.sects[g.life.sect] || 0) + 1;
    out.maxLog = Math.max(out.maxLog, g.life.log.length);
    Object.keys(g.life.seen).forEach((id) => out.seen.add(id));
    if (VERBOSE && i < 2 && loop === 0) for (const e of g.life.log.slice(0, 80)) console.log(`  [${Math.floor(e.t / 4)}] ${e.k}: ${e.x}${e.c ? ` → ${e.c}: ${e.r}` : ''}`);
    try { g.regress(); } catch (err) { out.crashes.push({ seed: g.meta.wheel.seed, loop, err: `regress: ${err.stack.split('\n').slice(0, 3).join(' | ')}` }); break; }
  }
}
const ms = Date.now() - t0;
const avg = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const pct = (n) => `${Math.round((n / Math.max(1, out.lives)) * 100)}%`;
const st = stats();
const realmDist = Array.from({ length: 9 }, (_, r) => out.realms.filter((x) => x === r).length);
console.log(`Simulated ${out.lives} lives (${LIVES} wheels × ${LOOPS} loops) in ${(ms / 1000).toFixed(1)}s`);
console.log(`Events: ${st.total} (${st.bespoke} bespoke, ${st.templated} from ${st.templates} templates); seen in sim: ${out.seen.size} (${Math.round((out.seen.size / Math.max(1, st.total)) * 100)}%)`);
console.log(`Lifespan: avg ${avg(out.ages).toFixed(1)}, died <20: ${pct(out.ages.filter((a) => a < 20).length)}, >80: ${pct(out.ages.filter((a) => a > 80).length)}`);
console.log(`Realms at death: ${realmDist.map((n, r) => `${r}:${n}`).join(' ')}`);
console.log(`Causes: ${Object.entries(out.causes).map(([k, v]) => `${k} ${pct(v)}`).join(', ')}`);
console.log(`Per life: ${(out.turns / Math.max(1, out.lives)).toFixed(0)} seasons, ${(out.choices / Math.max(1, out.lives)).toFixed(0)} choices, ${(out.combats / Math.max(1, out.lives)).toFixed(1)} fights, ${(out.actions / Math.max(1, out.lives)).toFixed(0)} actions; history changed ${(out.averted / Math.max(1, out.lives)).toFixed(2)}×`);
// Rough play-time estimate: 6s per season press, 12s per choice, 30s per fight, 3s per action.
const secs = (out.turns * 6 + out.choices * 12 + out.combats * 30 + out.actions * 3) / Math.max(1, out.lives);
console.log(`Estimated play time per life: ${(secs / 60).toFixed(0)} minutes`);
console.log(`Sects at death: ${Object.entries(out.sects).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}; capped lives: ${out.slow}; max log ${out.maxLog}`);
if (out.crashes.length) {
  console.log(`\nCRASHES (${out.crashes.length}):`);
  for (const c of out.crashes.slice(0, 10)) console.log(` seed ${c.seed} loop ${c.loop} age ${c.age}: ${c.err}`);
  process.exit(1);
}
