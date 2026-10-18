// Everyday life: the yearly and seasonal upkeep, health, illness, aging and death, the activities menu,
// the market, elixirs and crafting.
import { clamp } from '../core/util.js';
import { LOCATIONS } from '../content/world.js';
import { ITEMS, RECIPES, CAREERS } from '../content/life.js';
import { REALMS, BASE_LIFESPAN } from '../content/realms.js';
import { MANUALS } from '../content/martial.js';

// The activities menu (spec: ten activities). Ages 3–7 also get "play".
export const ACTIVITIES = {
  play: { name: 'Play', minAge: 3, maxAge: 9, desc: 'Run, climb, get into trouble.' },
  train: { name: 'Train body', minAge: 6, desc: 'Drill your arts and harden your body.' },
  meditate: { name: 'Meditate', minAge: 6, desc: 'Gather qi in your dantian.' },
  seclusion: { name: 'Enter seclusion', minAge: 14, desc: 'Close the door for years. The world will not wait.' },
  wander: { name: 'Wander the Gangho', minAge: 9, desc: 'See what the road brings.' },
  work: { name: 'Work', minAge: 10, desc: 'Earn your rice.' },
  study: { name: 'Study classics', minAge: 5, desc: 'Read, copy, memorise.' },
  doctor: { name: 'Visit a physician', minAge: 0, desc: 'Treat wounds and illness (5 taels).' },
  gamble: { name: 'Gamble', minAge: 14, desc: 'Big or small?' },
  tavern: { name: 'Tavern rumors', minAge: 12, desc: 'Buy a cup and listen (1 tael).' },
  journal: { name: 'Read memory journal', minAge: 5, desc: 'Revisit what past lives taught you.' },
};

const LINES = {
  play: ['You spent the season chasing dragonflies along the creek.', 'You climbed the old persimmon tree higher than anyone dared, and fell out of it.', 'You and the other children played sects and demons until dark. You insisted on being the demon.', 'You built a fortress of river stones. The river disagreed.'],
  train: ['You drilled until your arms shook, then drilled again.', 'You trained at dawn while frost still sat on the grass.', 'You practised the same form ten thousand times. On the last one, something clicked.', 'You trained until your shadow learned the forms too.'],
  trainChild: ['You copied the stances you had seen the grown-ups use. Badly, but with feeling.', 'You ran up the hill and back until your lungs burned.'],
  study: ['You copied the Analects by lamplight until the characters swam.', 'You read a treatise on the meridians twice, and understood it the second time.', 'You argued with a dead philosopher in the margins of his book. You won.', 'You memorised a page of medicine and a page of poetry. Both will be useful, eventually.'],
  doctor: ['The physician pressed two fingers to your wrist and frowned, then smiled, then prescribed something bitter.', 'A physician set what needed setting and charged twice what it was worth.'],
  oddJob: ['You carried rice sacks at the market for a few coppers.', 'You mucked out stables for a merchant who did not learn your name.', 'You wrote letters for illiterate soldiers at two coppers a page.'],
  tavernNothing: ['The tavern was full of drunk men lying about duels. You learned nothing useful.', 'A storyteller told the tale of the Sword Saint. He got most of it wrong.', 'Someone swore the Cult eats children. Someone else swore they eat only the bad ones.'],
};

export const lifeSystem = {
  lifespan() {
    const L = this.life;
    const conBonus = this.con.health ? this.con.health / 3 : 0;
    return BASE_LIFESPAN + REALMS[L.realm].life + conBonus + (L.flags.longevity || 0);
  },

  maxHealth() {
    const over = this.age - (this.lifespan() - 25);
    return clamp(100 + (this.con.health || 0) - Math.max(0, over) * 2.5 - (this.life.crippled ? 10 : 0), 15, 120);
  },

  // ── Yearly upkeep (first season of each year) ──────────────────
  yearly() {
    const L = this.life;
    this.meta.stats.years += 1;
    // Cost of living: villages are cheap, cities are not.
    const type = this.loc.type;
    const cost = this.age < 14 ? 0 : type === 'city' ? 4 : type === 'village' ? 1 : 2;
    if (cost) {
      if (L.stats.wealth >= cost) this.addStat('wealth', -cost);
      else if (!L.sect && this.age >= 16) { this.addStat('health', -6); this.log('Money ran out before winter did. You went hungry.', 'beat'); }
    }
    if (this.age >= 55) this.addStat('body', -1.5);
    this.payCareer();
    this.sectYearly();
    this.updateNpcs();
    if (this.meta.burden > 0 && this.age >= 60 && this.rng.chance(0.3)) {
      this.meta.burden -= 1;
      this.log('The weight of your past deaths sits a little lighter this year.', 'note');
    }
    // Old age.
    const ls = this.lifespan();
    if (this.age > ls - 12) {
      const p = Math.exp((this.age - ls) / 5) * 0.12;
      if (this.rng.chance(p)) this.die('You died of old age, in your sleep.', 'age');
    }
    this.meta.stats.oldest = Math.max(this.meta.stats.oldest, this.age);
  },

  // ── Seasonal upkeep ─────────────────────────────────────────────
  seasonal() {
    const L = this.life;
    const s = L.stats;
    const mh = this.maxHealth();
    // Recovery.
    if (s.health < mh) this.addStat('health', L.injuries.length ? 2 : 5);
    if (s.health > mh) s.health = mh;
    if (s.sanity < 70) this.addStat('sanity', 1);
    // Injuries heal on schedule.
    const healed = L.injuries.filter((i) => i.until <= L.turn);
    L.injuries = L.injuries.filter((i) => i.until > L.turn);
    for (const i of healed) this.log(`Your ${i.name} has healed.`, 'note');
    // Poison.
    if (L.poisoned > 0) {
      if (this.con.poisonImmune) L.poisoned = 0;
      else { this.addStat('health', -L.poisoned); L.lastHarm = 'Poison finished what it started.'; L.poisoned = Math.max(0, L.poisoned - 2); }
    }
    // Illness: more likely in winter and when frail; difficulty "Fair".
    const winter = this.season === 3 ? 1.8 : 1;
    const frail = s.health < 40 ? 1.6 : 1;
    const youth = this.age < 5 ? 1.5 : this.age > 55 ? 1.6 : 1;
    if (this.age >= 1 && this.rng.chance(0.012 * winter * frail * youth * this.difficulty())) {
      const sev = this.rng.int(8, 26);
      this.addStat('health', -sev);
      L.lastHarm = 'A fever took you.';
      this.log(this.rng.pick([`You fell ill with a ${this.seasonName().toLowerCase()} fever.`, 'A cough settled in your chest and refused to leave.', 'Something you ate disagreed with you, violently.']), 'beat');
    }
    // Nine Yin Absolute Meridians: the cold rises with age unless cured.
    if (L.constitution === 'nine_yin' && !L.cured.nine_yin && this.age >= 12) {
      const bite = this.age >= 18 ? 7 : this.age >= 15 ? 4 : 2;
      this.addStat('health', -bite);
      L.lastHarm = 'The Nine Yin cold reached your heart.';
      if (this.season === 3) this.log(this.age >= 17 ? 'The cold in your meridians is unbearable now. Even summer feels like winter.' : 'Your fingers turn white in the cold, and stay white long after.', 'beat');
    }
    // Passive cultivation if you have a method.
    if (L.method && this.age >= 6) this.addQi(this.qiRate() * 0.15);
    // Madness creeps in when the heart-demon grows.
    if (s.sanity < 15 && !this.con.noMadness && this.rng.chance(0.15)) this.madnessEpisode();
  },

  difficulty() {
    const mode = this.meta.wheel.mode;
    return mode === 'story' ? 0.6 : mode === 'hard' ? 1.35 : 1;
  },

  madnessEpisode() {
    this.log(this.rng.pick([
      'You woke with blood on your hands and no memory of the night.',
      'Voices from your past lives argued in your head all season.',
      'You stared at your reflection until it smiled first.',
    ]), 'beat');
    this.addStat('infamy', 3);
    this.addStat('health', -5);
  },

  injure({ name = 'wound', seasons = 4, sev = 10 } = {}) {
    this.life.injuries.push({ name, until: this.life.turn + seasons, sev });
    this.addStat('health', -sev);
    this.life.lastHarm = `Your ${name} never healed.`;
  },

  cure(what) {
    if (what === 'nine_yin') { this.life.cured.nine_yin = 1; this.log('Warmth floods your meridians for the first time in your life. The cold is gone.', 'note'); }
    if (what === 'poison') this.life.poisoned = 0;
    if (what === 'injuries') this.life.injuries = [];
    if (what === 'crippled') this.life.crippled = false;
  },

  healFully() {
    this.life.injuries = [];
    this.life.poisoned = 0;
    this.life.stats.health = this.maxHealth();
  },

  setCrippled(v) {
    this.life.crippled = !!v;
    if (v) this.log('Your meridians are crippled. Qi will not move in them.', 'note');
  },

  die(cause, kind = 'other') {
    const L = this.life;
    if (L.dead) return;
    L.dead = { cause, kind, age: this.age, turn: L.turn, year: this.year };
    L.queue = [];
    L.pending = null;
    this.log(cause, 'death');
  },

  // ── Activities ──────────────────────────────────────────────────
  availableActivities() {
    return Object.entries(ACTIVITIES).filter(([id, a]) => this.age >= a.minAge && this.age <= (a.maxAge ?? 999)
      && (id !== 'journal' || Object.keys(this.meta.codex).length > 0 || this.meta.notes.length > 0));
  },

  doActivity(id, opts = {}) {
    const L = this.life;
    if (!this.canAdvance()) return false;
    const a = ACTIVITIES[id];
    if (!a || this.age < a.minAge || L.actions <= 0) return false;
    if (id === 'seclusion') { this.seclusion(opts.years || 1); return true; }
    L.actions -= 1;
    switch (id) {
      case 'play': this.actPlay(); break;
      case 'train': this.actTrain(); break;
      case 'meditate': this.meditate(); break;
      case 'wander': this.actWander(); break;
      case 'work': this.actWork(); break;
      case 'study': this.actStudy(); break;
      case 'doctor': this.actDoctor(); break;
      case 'gamble': this.actGamble(opts); break;
      case 'tavern': this.actTavern(); break;
      case 'journal': this.actJournal(); break;
      default: break;
    }
    this.emit('sfx', 'click');
    this.pump();
    return true;
  },

  // Activity-triggered events (events with `on: <activity>`).
  maybeOn(on, p) {
    if (!this.rng.chance(p)) return false;
    const pick = this.drawEvent(on);
    if (pick) { this.life.queue.push(pick); return true; }
    return false;
  },

  actPlay() {
    if (this.maybeOn('play', 0.45)) return;
    this.log(this.rng.pick(LINES.play), 'act');
    this.addStat(this.rng.pick(['body', 'charm', 'insight']), 1);
  },

  actTrain() {
    const L = this.life;
    if (this.age < 10) { this.log(this.rng.pick(LINES.trainChild), 'act'); this.addStat('body', 0.8); return; }
    const conBody = this.con.body || 1;
    const artBody = Math.max(1, ...Object.keys(L.manuals).map((m) => MANUALS[m]?.body || 1));
    const atSect = L.sect && this.loc.sect === L.sect ? 1.25 : 1;
    const gain = this.rng.range(0.8, 1.8) * conBody * (artBody > 1 ? 1 + (artBody - 1) / 2 : 1) * atSect * (L.stats.body > 60 ? 0.6 : 1);
    this.addStat('body', gain);
    const focus = this.trainingFocus();
    let mastery = '';
    if (focus) {
      const g = this.masteryGain(focus);
      this.addMastery(focus, g);
      mastery = ` (${MANUALS[focus].name} ${Math.floor(L.manuals[focus])}%)`;
    }
    if (this.rng.chance(0.03)) { this.injure({ name: 'pulled tendon', seasons: 2, sev: 5 }); this.log('You pushed too hard and tore something in your shoulder.', 'act'); return; }
    if (this.maybeOn('train', 0.1)) return;
    this.log(this.rng.pick(LINES.train) + mastery, 'act');
  },

  actStudy() {
    const gain = this.rng.range(1, 2.4) * (this.con.insight ? 1.3 : 1) * (this.life.method && MANUALS[this.life.method].insight ? MANUALS[this.life.method].insight : 1);
    this.addStat('insight', gain);
    this.setFlag('studied+1');
    if (this.maybeOn('study', 0.15)) return;
    this.log(this.rng.pick(LINES.study), 'act');
  },

  actWander() {
    if (this.maybeOn('wander', 0.8)) return;
    this.log(this.fill(this.rng.pick([
      'You walked the roads around {loc} and saw nothing worth a story.',
      'You wandered as far as your legs would carry you and slept under a pine.',
      'A peddler sold you a "secret manual" that turned out to be a cookbook.',
    ])), 'act');
    this.addStat('insight', 0.5);
  },

  actWork() {
    const L = this.life;
    if (!L.career) {
      const pay = this.rng.int(1, 3);
      this.addStat('wealth', pay);
      this.log(`${this.rng.pick(LINES.oddJob)} (+${pay} taels)`, 'act');
      return;
    }
    const c = CAREERS[L.career.id];
    const pay = Math.ceil(c.pay[L.career.rank] / 2);
    this.addStat('wealth', pay);
    this.careerXp(1);
    if (c.infamy) this.addStat('infamy', 0.5);
    if (this.maybeOn('work', 0.3)) return;
    this.log(`You worked as ${c.ranks[L.career.rank].toLowerCase().startsWith('a') ? 'an' : 'a'} ${c.ranks[L.career.rank].toLowerCase()}. (+${pay} taels)`, 'act');
  },

  actDoctor() {
    const L = this.life;
    const fee = 5;
    if (L.stats.wealth < fee && this.age >= 14) { L.actions += 1; this.log('The physician took one look at your purse and found you perfectly healthy.', 'act'); return; }
    if (this.age >= 14) this.addStat('wealth', -fee);
    this.addStat('health', 25);
    if (L.poisoned) { L.poisoned = 0; }
    L.injuries.forEach((i) => { i.until = Math.max(L.turn + 1, i.until - 2); });
    let extra = '';
    if (!L.flags.knowsBody) {
      L.flags.knowsBody = 1;
      this.remember('self.constitution');
      extra = ` "Your meridians," the physician said slowly, "are unusual. ${this.con.name}." ${this.con.desc}`;
    }
    if (this.maybeOn('doctor', 0.1)) return;
    this.log(this.rng.pick(LINES.doctor) + extra, 'act');
  },

  // Big or Small: three dice, 4–10 small, 11–17 big, triples lose. Stakes in taels.
  actGamble({ bet = 5, guess } = {}) {
    const L = this.life;
    const stake = Math.min(bet, Math.floor(L.stats.wealth));
    if (stake <= 0) { L.actions += 1; this.log('You have nothing to bet but your pride, and the house does not take pride.', 'act'); return; }
    const dice = [this.rng.int(1, 6), this.rng.int(1, 6), this.rng.int(1, 6)];
    const sum = dice[0] + dice[1] + dice[2];
    const triple = dice[0] === dice[1] && dice[1] === dice[2];
    const call = guess || (this.rng.chance(0.5) ? 'big' : 'small');
    const result = triple ? 'triple' : sum >= 11 ? 'big' : 'small';
    const won = result === call;
    this.addStat('wealth', won ? stake : -stake);
    this.addStat('infamy', 0.2);
    L.lastDice = { dice, sum, result, call, won, stake };
    this.emit('dice', L.lastDice);
    if (this.maybeOn('gamble', 0.15)) return;
    this.log(`Dice: ${dice.join(', ')} (${sum}${triple ? ', triples' : ''}). You called ${call} and ${won ? `won ${stake}` : `lost ${stake}`} taels.`, 'act');
  },

  actTavern() {
    if (this.life.stats.wealth >= 1) this.addStat('wealth', -1);
    if (this.maybeOn('tavern', 0.7)) return;
    const rumor = this.timelineRumor();
    this.log(rumor || this.rng.pick(LINES.tavernNothing), 'act');
  },

  actJournal() {
    const refreshed = this.refreshMemories(3);
    this.emit('openJournal');
    this.log(refreshed.length
      ? `You read your journal until the candle guttered. Faded memories sharpened again: ${refreshed.join('; ')}.`
      : 'You read your journal by lamplight. Everything you remember is still clear.', 'act');
    if (this.meta.loop > 3) this.addStat('sanity', -1);
  },

  // ── Market, elixirs and crafting ───────────────────────────────
  marketItems() {
    const t = this.loc.type;
    if (!['city', 'sect', 'estate', 'frontier', 'village'].includes(t)) return [];
    const base = ['rice_wine', 'tea_brick', 'healing_salve', 'lime_powder', 'wooden_sword'];
    if (t === 'village') return base;
    const city = [...base, 'jade_pendant', 'qi_pill', 'heart_calming', 'fine_sword', 'heavy_saber'];
    if (t === 'city') city.push('marrow_pill', 'foundation_pill');
    return city;
  },

  // Bookstalls in cities sell common manuals: the front door to cultivation for commoners.
  bookstall() {
    const t = this.loc.type;
    if (t !== 'city' && t !== 'frontier') return [];
    const out = [['breath_basic', 20], ['fist_basic', 8], ['sword_basic', 10], ['step_basic', 12]];
    if (['luoyang', 'hangzhou', 'kaifeng'].includes(this.life.loc)) out.push(['escort_spear', 60], ['ext_iron_shirt', 45]);
    return out;
  },

  buyManual(id) {
    const offer = this.bookstall().find(([m]) => m === id);
    if (!offer || id in this.life.manuals || this.life.stats.wealth < offer[1]) return false;
    this.addStat('wealth', -offer[1]);
    this.learnManual(id);
    this.pump();
    return true;
  },

  price(id) {
    // Scarcity 50: elixirs cost a premium.
    const it = ITEMS[id];
    return Math.ceil(it.price * (it.kind === 'elixir' ? 1.25 : 1));
  },

  buy(id) {
    const p = this.price(id);
    if (this.life.stats.wealth < p) return false;
    this.addStat('wealth', -p);
    this.addItem(id, 1);
    this.emit('sfx', 'click');
    this.emit('update');
    this.save();
    return true;
  },

  addItem(id, n = 1) {
    if (!ITEMS[id]) throw new Error(`Unknown item "${id}"`);
    const L = this.life;
    L.items[id] = Math.max(0, (L.items[id] || 0) + n);
    if (!L.items[id]) delete L.items[id];
  },

  useItem(id) {
    const L = this.life;
    const it = ITEMS[id];
    if (!it || !(L.items[id] > 0) || it.kind !== 'elixir') return false;
    this.addItem(id, -1);
    if (it.qi) this.addQi(it.qi);
    if (it.health) this.addStat('health', it.health);
    if (it.heart) this.addStat('sanity', it.heart);
    if (it.body) this.addStat('body', it.body);
    if (it.breakthrough) L.foundation = Math.max(L.foundation, it.breakthrough);
    this.log(`You took the ${it.name}. ${it.desc}`, 'act');
    this.emit('sfx', 'qi');
    this.pump();
    return true;
  },

  knowsRecipe(id) {
    return !!this.life.recipes[id] || this.remembers(`recipe.${id}`);
  },

  craftable() {
    return Object.entries(RECIPES).filter(([id]) => this.knowsRecipe(id));
  },

  canCraft(id) {
    const r = RECIPES[id];
    const L = this.life;
    if (!r || !this.knowsRecipe(id) || L.actions <= 0) return false;
    if (L.stats.insight < r.insight || L.stats.wealth < r.cost) return false;
    return Object.entries(r.needs).every(([m, n]) => (L.items[m] || 0) >= n);
  },

  craft(id) {
    if (!this.canCraft(id)) return false;
    const r = RECIPES[id];
    const L = this.life;
    L.actions -= 1;
    this.addStat('wealth', -r.cost);
    for (const [m, n] of Object.entries(r.needs)) this.addItem(m, -n);
    const healer = MANUALS[L.method]?.craft || Object.keys(L.manuals).some((m) => MANUALS[m]?.craft);
    const ok = this.rng.chance(clamp(0.55 + (L.stats.insight - r.insight) / 60 + (healer ? 0.2 : 0), 0.1, 0.97));
    if (!ok) { this.log(`The ${r.name} cracked in the furnace. A fortune in ash.`, 'act'); this.pump(); return true; }
    if (r.makes) this.addItem(r.makes, 1);
    if (r.cures) this.cure(r.cures);
    this.log(`You compounded ${r.name}. The furnace smelled of rain and iron.`, 'act');
    this.achieve('alchemist');
    this.pump();
    return true;
  },
};
