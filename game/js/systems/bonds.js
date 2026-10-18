// The interaction menu (spec: share tea, spar, gift, ask for teaching, provoke, challenge to a duel,
// swear brotherhood, confess feelings, warn of the future, assassinate) plus a few contextual actions.
// Each person can be approached once per season; it does not cost an activity.
import { clamp } from '../core/util.js';
import { ROSTER } from '../content/npcs.js';
import { REALMS } from '../content/realms.js';
import { SECTS } from '../content/world.js';
import { MANUALS } from '../content/martial.js';
import { ITEMS } from '../content/life.js';

const GIFT_VALUE = { rice_wine: 4, tea_brick: 7, jade_pendant: 14 };
const FAMILY = ['mother', 'father', 'sibling', 'spouse', 'child', 'guardian'];

export const INTERACTIONS = {
  talk: 'Share tea', spar: 'Spar', gift: 'Give a gift', learn: 'Ask for teaching', provoke: 'Provoke', duel: 'Challenge to a duel',
  oath: 'Swear brotherhood', confess: 'Confess feelings', propose: 'Propose marriage', warn: 'Warn of the future', kill: 'Assassinate',
  teach: 'Teach', disciple: 'Take as disciple',
};

const LINES = {
  talk: ['You and {x} talked until the tea went cold.', '{x} told you a story about {x.his} childhood you had never heard.', 'You shared tea with {x}. Nothing important was said, which was the point.', '{x} laughed at something you said, the real kind of laugh.'],
  talkCold: ['{x} answered in single words and watched the door.', 'Tea with {x} was polite, and short.'],
  sparWin: ['You and {x} crossed wooden swords. You won, narrowly, and {x.he} demanded a rematch.', 'You read {x}’s footwork two moves ahead and tapped {x.his} shoulder with your practice blade.'],
  sparLose: ['{x} disarmed you three times in a row, kindly.', 'You lost to {x}, and learned more from it than from a month of drills.'],
  gift: ['{x} turned the {item} over in {x.his} hands and smiled.', '{x} accepted the {item} with a bow that was not entirely formal.'],
  learnYes: ['{x} sighed, then corrected your stance for an hour.', '{x} showed you a single movement, over and over, until it was yours.'],
  learnNo: ['{x} looked at you for a long moment. "Not yet."', '{x} said {x.he} had nothing to teach someone who would not listen. You were not sure what that meant.'],
  provoke: ['You said something about {x}’s family. {x.His} eyes narrowed.', 'You mocked {x}’s technique in front of others. That will be remembered.'],
  oathYes: ['Under the peach trees, you and {x} cut your palms and swore to live and die as one.'],
  oathNo: ['{x} smiled, but shook {x.his} head. "Ask me again when we have bled together."'],
  confessYes: ['{x} looked away, then back. "…Took you long enough."', 'For once {x} had nothing clever to say. {x.He} just took your hand.'],
  confessNo: ['{x} was kind about it, which made it worse.', '{x} said {x.he} thought of you as a friend. The word landed like a stone.'],
  proposeYes: ['{x} said yes before you finished asking.'],
  proposeNo: ['{x} said {x.he} needed time. You gave {x.him} time.'],
  warnYes: ['{x} went very still as you spoke. "How could you possibly know that?" But {x.he} believed you.'],
  warnNo: ['{x} laughed. "And how would a {boy} like you know a thing like that?"', '{x} thanked you politely, the way one thanks a madman.'],
  teach: ['You walked {x} through the forms until {x.his} feet stopped arguing with {x.his} hands.', 'You taught {x} to breathe the way you were taught. {x.He} will be better than you, one day.'],
  disciple: ['{x} knelt and touched {x.his} head to the ground three times. You have a disciple.'],
};

export const bondsSystem = {
  availableInteractions(npc) {
    if (!npc || npc.dead || !npc.met) return [];
    const L = this.life;
    const age = this.age;
    const theirAge = this.npcAge(npc);
    const out = [];
    const family = FAMILY.includes(npc.role);
    if (age >= 3) out.push('talk');
    if (age >= 8 && theirAge >= 6) out.push('spar');
    if (age >= 6) out.push('gift');
    if (age >= 6 && (npc.realm > L.realm || npc.role === 'master' || ROSTER[npc.id]?.master)) out.push('learn');
    if (age >= 10 && !family && npc.role !== 'master') out.push('provoke');
    if (age >= 14 && theirAge >= 14 && !family) out.push('duel');
    if (age >= 12 && theirAge >= 12 && !family && !['lover', 'spouse', 'master', 'disciple', 'sworn'].includes(npc.role)) out.push('oath');
    if (age >= 16 && npc.romance && theirAge >= 16 && !family && npc.role !== 'lover' && npc.role !== 'master') out.push('confess');
    if (npc.role === 'lover' && age >= 16) out.push('propose');
    if (this.canWarn(npc)) out.push('warn');
    if (age >= 14 && npc.role !== 'spouse' && npc.role !== 'child') out.push('kill');
    if ((npc.role === 'disciple' || npc.role === 'child') && L.realm >= 1 && theirAge >= 6) out.push('teach');
    if (L.realm >= 3 && age >= 25 && theirAge <= age - 8 && theirAge >= 6 && !['disciple', 'master', 'spouse', 'lover'].includes(npc.role) && npc.realm < L.realm) out.push('disciple');
    return out;
  },

  // You can warn someone about the future if you remember something relevant to them.
  canWarn(npc) {
    const r = ROSTER[npc.id];
    if (!r?.warn || npc.flags.warned) return false;
    return this.remembers(r.warn);
  },

  interact(npcId, action, opt = {}) {
    const L = this.life;
    const npc = L.npcs[npcId];
    if (!this.canAdvance() || !npc || L.talked[npcId]) return null;
    if (!this.availableInteractions(npc).includes(action)) return null;
    L.talked[npcId] = 1;
    npc.lastTalk = L.turn;
    const ctx = { bind: { x: npc.id } };
    const say = (bank, extra = {}) => {
      let s = this.fill(this.rng.pick(LINES[bank]), ctx);
      for (const [k, v] of Object.entries(extra)) s = s.replace(`{${k}}`, v);
      return s;
    };
    let text = '';
    switch (action) {
      case 'talk': {
        const warm = npc.aff >= 25;
        this.changeRel(npc, { aff: this.rng.int(3, 7) + Math.floor(L.stats.charm / 40) });
        npc.talks = (npc.talks || 0) + 1;
        text = say(warm ? 'talk' : 'talkCold');
        if (ROSTER[npc.id] && npc.talks >= 3) this.remember(`people.${npc.id}`);
        // Sometimes talk leads somewhere (bonds events bound to this person).
        if (this.rng.chance(0.18)) {
          const pick = this.drawEvent(`talk.${npc.id}`) || this.drawEvent('talk');
          if (pick) { pick.bind = { ...(pick.bind || {}), x: npc.id }; L.queue.push(pick); }
        }
        break;
      }
      case 'spar': {
        const theirP = REALMS[npc.realm].power * (1 + (npc.stage || 0) * 0.1) + 6;
        const win = this.rng.chance(clamp(0.5 + (this.power() - theirP) / (this.power() + theirP), 0.05, 0.95));
        this.changeRel(npc, { res: win ? 6 : 2, aff: 2 });
        this.addStat('body', 0.5);
        const f = this.trainingFocus();
        if (f) this.addMastery(f, 2 + (win ? 0 : 2));
        text = say(win ? 'sparWin' : 'sparLose');
        break;
      }
      case 'gift': {
        const item = opt.item || Object.keys(GIFT_VALUE).filter((i) => (L.items[i] || 0) > 0).sort((a, b) => GIFT_VALUE[b] - GIFT_VALUE[a])[0];
        let value;
        let name;
        if (item) { this.addItem(item, -1); value = GIFT_VALUE[item]; name = ITEMS[item].name.toLowerCase(); }
        else if (L.stats.wealth >= 10) { this.addStat('wealth', -10); value = 5; name = 'pouch of silver'; }
        else { L.talked[npcId] = 0; return { text: 'You have nothing worth giving.' }; }
        const likes = npc.traits.includes('greedy') ? 1.5 : 1;
        this.changeRel(npc, { aff: Math.round(value * likes) });
        text = say('gift', { item: name });
        break;
      }
      case 'learn': {
        const p = clamp(0.2 + (npc.aff + npc.res) / 220 + (npc.role === 'master' ? 0.35 : 0) + L.stats.insight / 300, 0.05, 0.95);
        if (this.rng.chance(p)) {
          text = say('learnYes');
          this.changeRel(npc, { res: 2 });
          const taught = this.teachableBy(npc);
          if (taught && (npc.role === 'master' || this.rng.chance(0.35))) {
            this.learnManual(taught);
            text += ` ${npc.name} taught you the ${MANUALS[taught].name}.`;
          } else {
            const f = this.trainingFocus();
            if (f) this.addMastery(f, 8);
            this.addStat('insight', 1.5);
          }
          // Hidden masters take disciples who earn it.
          if (ROSTER[npc.id]?.master && npc.role !== 'master' && npc.aff >= 70 && npc.res >= 50 && (!L.masterId || L.npcs[L.masterId]?.dead)) {
            this.setRole(npc, 'master');
            this.achieve('master_found');
            if (npc.id === 'sword_saint') { this.setFlag('saint.disciple'); this.achieve('saint_disciple'); this.learnManual('lost_sword_saint'); }
            text += ` Then ${npc.name} said, "Kneel." You are ${npc.g === 'f' ? 'her' : 'his'} disciple now.`;
          }
        } else text = say('learnNo');
        break;
      }
      case 'provoke': {
        this.changeRel(npc, { aff: -12, res: this.power() > REALMS[npc.realm].power ? 3 : -3 });
        text = say('provoke');
        if (npc.aff < 25 && !['nemesis', 'rival'].includes(npc.role)) npc.role = 'rival';
        if (this.age >= 14 && this.npcAge(npc) >= 14 && this.rng.chance(0.4)) {
          this.log(text, 'bond', { npc: npc.id });
          this.startCombat({ foe: npc.id, context: 'duel', title: `${npc.name} accepts your provocation` }, ctx);
          this.save();
          return { text, combat: true };
        }
        break;
      }
      case 'duel': {
        this.log(`You challenged ${npc.name} to a duel.`, 'bond', { npc: npc.id });
        this.startCombat({ foe: npc.id, context: npc.role === 'nemesis' ? 'nemesis' : 'duel', important: !!ROSTER[npc.id] }, ctx);
        this.save();
        return { combat: true };
      }
      case 'oath': {
        if (npc.aff >= 75 && npc.res >= 40) {
          this.setRole(npc, 'sworn');
          this.achieve('sworn');
          text = say('oathYes');
        } else { text = say('oathNo'); this.changeRel(npc, { aff: 2 }); }
        break;
      }
      case 'confess': {
        const p = npc.aff >= 65 ? clamp(0.35 + (npc.aff - 65) / 50 + L.stats.charm / 300, 0.1, 0.95) : 0.05;
        if (this.rng.chance(p)) { this.setRole(npc, 'lover'); this.changeRel(npc, { aff: 10 }); text = say('confessYes'); }
        else { this.changeRel(npc, { aff: -4 }); this.addStat('sanity', -3); text = say('confessNo'); }
        break;
      }
      case 'propose': {
        if (npc.aff >= 80 && this.rng.chance(0.85)) { this.marry(npc); text = say('proposeYes'); }
        else { text = say('proposeNo'); this.changeRel(npc, { aff: 2 }); }
        break;
      }
      case 'warn': {
        npc.flags.warned = 1;
        const r = ROSTER[npc.id];
        const p = clamp(0.25 + (npc.aff + npc.res) / 220 + L.stats.fame / 300 + (this.age >= 18 ? 0.15 : 0), 0.05, 0.95);
        if (this.rng.chance(p)) {
          npc.flags.believed = 1;
          this.setFlag(`believed.${npc.id}`);
          if (r.warnAverts) this.avertTimeline(r.warnAverts);
          text = say('warnYes');
        } else { this.changeRel(npc, { res: -5 }); text = say('warnNo'); }
        break;
      }
      case 'kill': {
        const theirP = REALMS[npc.realm].power * 1.1;
        const stealth = clamp(0.35 + (this.power() - theirP) / (this.power() + theirP) * 0.8, 0.03, 0.9);
        this.addStat('infamy', 6);
        if (this.rng.chance(stealth)) {
          this.killNpc(npc, `assassinated by ${L.family} ${L.name}`);
          L.tally.kills += 1;
          this.addStat('infamy', 10);
          this.addStat('sanity', -6);
          if (npc.sect) this.addRep(SECTS[npc.sect].faction, -15);
          text = `You came for ${npc.name} on a moonless night. It was over quickly.`;
          this.log(text, 'bond', { npc: npc.id });
          this.pump();
          return { text };
        }
        this.log(`You came for ${npc.name} in the dark, and ${npc.g === 'f' ? 'she' : 'he'} was awake.`, 'bond', { npc: npc.id });
        npc.role = 'nemesis';
        this.startCombat({ foe: npc.id, context: 'assassination', lethal: 0.5, important: true }, ctx);
        this.save();
        return { combat: true };
      }
      case 'teach': {
        this.changeRel(npc, { aff: 4, res: 3 });
        if (npc.realm < L.realm - 1 && this.rng.chance(0.25)) npc.realm += 1;
        this.addStat('insight', 0.5);
        text = say('teach');
        break;
      }
      case 'disciple': {
        if (npc.aff >= 45 || npc.role === 'child') {
          this.setRole(npc, 'disciple');
          this.achieve('first_disciple');
          text = say('disciple');
        } else text = `${npc.name} bowed, and declined.`;
        break;
      }
      default: return null;
    }
    this.log(text, 'bond', { npc: npc.id });
    this.pump();
    return { text };
  },

  // A manual this person could teach you: from their sect, at a tier you can handle.
  teachableBy(npc) {
    const s = npc.sect && SECTS[npc.sect];
    if (!s) return null;
    const L = this.life;
    const pool = s.manuals.flat().filter((m) => MANUALS[m] && !(m in L.manuals) && MANUALS[m].tier <= L.realm + 1 && MANUALS[m].rarity !== 'legendary');
    return pool.length ? this.rng.pick(pool) : null;
  },
};
