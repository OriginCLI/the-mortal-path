// The main game screen: ink-wash header with portrait and realm seal, stat bars, the chronicle log,
// the five tabs and the Age Up (Next Season) button.
import { h, toast, announce } from './dom.js';
import { backdropSVG, portraitSVG, sealSVG, vignetteSVG, icon, startWeather, startQi } from './art.js';
import { director } from './sound.js';
import { settings, motion } from './settings.js';
import { openPanel, closePanel } from './panels.js';
import { openEventModal, openCombatModal, updateCombatModal, openDeath, openCeremony, wheelTurn, openSettings, openMontage, closeModal } from './modals.js';
import { LOCATIONS, SECTS, FACTIONS } from '../content/world.js';
import { REALMS } from '../content/realms.js';
import { CAREERS } from '../content/life.js';
import { SEASONS, cycleName } from '../core/text.js';
import { ordinal } from '../core/util.js';
import { hashSeed } from '../core/rng.js';

const FACTION_ROBE = { orthodox: '#2f4f6b', families: '#6b4c3a', unorthodox: '#3d4a3a', cult: '#5a1a12', court: '#4a3a60', merchants: '#7a5a2a' };
const LOG_WINDOW = 400;

export function mountGame(root, game, opts = {}) {
  const ui = new GameScreen(root, game, opts);
  ui.mount();
  if (/[?&]debug\b/.test(location.search)) window.mortalPath = { game, ui }; // for browser tests
  return ui;
}

class GameScreen {
  constructor(root, game, opts) {
    this.root = root;
    this.g = game;
    this.opts = opts;
    this.lastSeason = null;
    this.lastScene = null;
    this.window = LOG_WINDOW;
  }

  mount() {
    const g = this.g;
    this.bg = h('div', { class: 'hdr-bg' });
    this.weatherCanvas = h('canvas', { class: 'hdr-weather', 'aria-hidden': 'true' });
    this.qiCanvas = h('canvas', { class: 'qi-canvas', 'aria-hidden': 'true' });
    this.portrait = h('div', { class: 'portrait', role: 'img' });
    this.idBox = h('div', { class: 'hdr-id' });
    this.seal = h('div', { class: 'hdr-seal' });
    this.stats = h('section', { class: `stats${settings.statsCollapsed ? ' collapsed' : ''}`, 'aria-label': 'Your stats' });
    this.logEl = h('div', { class: 'log', role: 'log', 'aria-label': 'Life chronicle', tabindex: '0' });
    this.actionsLeft = h('div', { class: 'actions-left', 'aria-live': 'polite' });
    this.ageBtn = h('button', { class: 'age-up', onclick: () => this.advance() });
    this.tabs = h('nav', { class: 'tabs', 'aria-label': 'Menus' }, [['activities', 'Activities'], ['cultivate', 'Cultivate'], ['bonds', 'Bonds'], ['world', 'World'], ['journal', 'Journal']]
      .map(([id, label]) => h('button', { class: 'tab', 'data-tab': id, onclick: () => this.openTab(id) }, h('span', { html: icon(id) }), label)));

    this.root.replaceChildren(h('div', { class: 'game' },
      h('header', { class: 'hdr' }, this.bg, this.weatherCanvas,
        h('div', { class: 'hdr-body' }, h('div', { style: 'position:relative' }, this.qiCanvas, this.portrait), this.idBox, this.seal),
        h('div', { class: 'hdr-menu' },
          h('button', { class: 'icon-btn', 'aria-label': 'Settings and saves', onclick: () => openSettings(this), html: icon('menu') }))),
      this.stats,
      h('div', { class: 'logwrap' }, h('div', { class: 'rod', 'aria-hidden': 'true' }), this.logEl, h('div', { class: 'rod', 'aria-hidden': 'true' })),
      h('footer', { class: 'dock' }, this.actionsLeft, this.tabs, this.ageBtn)));

    this.weather = startWeather(this.weatherCanvas, () => this.weatherKind(), motion);
    this.qi = startQi(this.qiCanvas, () => this.g.life.realm, motion);
    this.unsub = g.on((type, data) => this.onGame(type, data));
    this.keys = (e) => this.onKey(e);
    window.addEventListener('keydown', this.keys);
    this.renderLog();
    this.refresh();
    this.resume();
  }

  unmount() {
    this.unsub?.();
    this.weather?.stop();
    this.qi?.stop();
    window.removeEventListener('keydown', this.keys);
    closePanel();
    closeModal();
  }

  // Re-open whatever was pending when the page was closed (an event, a fight, a death).
  resume() {
    const L = this.g.life;
    if (L.dead) { openDeath(this); return; }
    if (L.pending?.kind === 'event') openEventModal(this, L.pending);
    else if (L.pending?.kind === 'combat') openCombatModal(this, L.pending);
    else if (L.montage && this.g.age === 0 && L.turn === 0 && this.g.meta.loop > 1) {
      if (settings.montage) openMontage(this);
      else L.montage = false;
    }
  }

  onKey(e) {
    if (e.target.closest('input, textarea, select') || document.querySelector('.modal-back, .death-screen, .sheet.open, .ceremony')) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); this.advance(); }
    const tab = { 1: 'activities', 2: 'cultivate', 3: 'bonds', 4: 'world', 5: 'journal' }[e.key];
    if (tab) { e.preventDefault(); this.openTab(tab); }
  }

  openTab(id) {
    director.sfx('click');
    openPanel(id, this);
  }

  advance() {
    const g = this.g;
    if (!g.canAdvance()) return;
    if (g.life.travel) { g.continueJourney(); return; }
    if (g.life.montage && g.age < 6 && g.meta.loop > 1 && settings.montage) { g.driftChildhood(); return; }
    director.sfx('ageUp');
    g.nextSeason();
  }

  onGame(type, data) {
    switch (type) {
      case 'log': this.appendEntry(data); break;
      case 'update': this.refresh(); break;
      case 'pending':
        if (data.kind === 'event') openEventModal(this, data);
        else if (data.kind === 'combat') openCombatModal(this, data);
        break;
      case 'combat': updateCombatModal(this, data); break;
      case 'resolved': break;
      case 'death': setTimeout(() => openDeath(this), 600); break;
      case 'breakthrough': openCeremony(this, data); director.sfx('breakthrough'); break;
      case 'codex': if (data.entry.cat !== 'timeline' && data.entry.cat !== 'theory') toast(`<b>You will remember this.</b> ${data.entry.title}`, 'memory', 3200); break;
      case 'achievement': toast(`Achievement: <b>${data.name}</b>. ${data.desc}`, 'ach', 4200); director.sfx('seal'); break;
      case 'sfx': director.sfx(data); break;
      case 'mood': director.setMood(data); if (data !== 'danger') director.rest(data); break;
      case 'regressed': this.onRegressed(); break;
      case 'travel': this.refresh(true); break;
      case 'openJournal': openPanel('journal', this); break;
      case 'met': if (this.g.age > 3) announce(`You met ${data.name}.`); break;
      default: break;
    }
  }

  onRegressed() {
    closePanel();
    wheelTurn(() => {
      this.renderLog();
      this.refresh(true);
      if (settings.montage) openMontage(this);
      else this.g.life.montage = false;
    });
    director.sfx('death');
  }

  // ── Header and stats ───────────────────────────────────────────
  weatherKind() {
    const L = this.g.life;
    const season = L.turn % 4;
    const scene = LOCATIONS[L.loc].scene;
    if (scene === 'desert') return 'none';
    const rain = hashSeed('rain', L.turn) % 5 === 0 && season !== 3;
    if (rain) return 'rain';
    return ['petals', 'none', 'leaves', 'snow'][season];
  }

  refresh(force = false) {
    const g = this.g;
    const L = g.life;
    const season = L.turn % 4;
    const scene = LOCATIONS[L.loc].scene;
    if (force || season !== this.lastSeason || scene !== this.lastScene) {
      this.bg.innerHTML = backdropSVG(scene, season, hashSeed(L.loc) % 997, 600, 160);
      this.lastSeason = season;
      this.lastScene = scene;
      director.setAmbience(scene, season, this.weatherKind(), !!L.travel);
    }
    const robe = L.sect ? FACTION_ROBE[SECTS[L.sect].faction] : undefined;
    this.portrait.innerHTML = portraitSVG({ seed: hashSeed(g.meta.wheel.seed, 'me'), g: L.gender, age: g.age, robe, realm: L.realm });
    this.portrait.setAttribute('aria-label', `Portrait of ${L.family} ${L.name}, age ${g.age}`);
    const where = L.travel ? `On the road to ${LOCATIONS[L.travel.dest].name}` : LOCATIONS[L.loc].name;
    this.idBox.replaceChildren(
      h('h1', {}, `${L.family} ${L.name}`),
      h('div', { class: 'sub' }, `${SEASONS[season]}, ${ordinal(g.age + 1)} year · Age ${g.age}`),
      h('div', { class: 'money' }, `${where} · ${Math.floor(L.stats.wealth)} taels${g.meta.loop > 1 ? ` · Life ${g.meta.loop}` : ''}`));
    this.seal.innerHTML = sealSVG(REALMS[L.realm].sigil, 52, L.realm >= 6 ? '#b5873a' : '#9c2a1c');
    this.seal.title = g.stageLabel();
    this.renderStats();
    this.renderDock();
  }

  renderStats() {
    const g = this.g;
    const L = g.life;
    const s = L.stats;
    const bar = (label, key, v, max = 100) => h('div', { class: 'stat' },
      h('span', {}, label),
      h('span', { class: `bar ${key}${key === 'health' && v < 25 ? ' low' : ''}`, role: 'meter', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': Math.round(v) }, h('i', { style: `width:${Math.max(0, Math.min(100, (v / max) * 100))}%` })));
    const words = [];
    words.push(`${g.stageLabel()}`);
    if (L.bottleneck) words.push('at a bottleneck');
    if (s.fame >= 5) words.push(`Fame: ${fameWord(s.fame)}`);
    if (s.infamy >= 5) words.push(`Infamy: ${fameWord(s.infamy)}`);
    if (L.sect) words.push(`${SECTS[L.sect].ranks[L.rank]}, ${SECTS[L.sect].name}`);
    if (L.career) words.push(CAREERS[L.career.id].ranks[L.career.rank]);
    if (L.injuries.length) words.push(`Injured (${L.injuries.map((i) => i.name).join(', ')})`);
    if (L.crippled) words.push('Crippled meridians');
    if (L.poisoned) words.push('Poisoned');
    const toggle = h('button', {
      class: 'stats-toggle', 'aria-expanded': String(!this.stats.classList.contains('collapsed')),
      onclick: () => { this.stats.classList.toggle('collapsed'); settings.statsCollapsed = this.stats.classList.contains('collapsed'); this.renderStats(); },
    }, this.stats.classList.contains('collapsed') ? '▾ show stats' : '▴ hide stats');
    this.stats.replaceChildren(
      h('div', { class: 'stats-grid' },
        bar('Health', 'health', s.health, g.maxHealth()), bar('Qi', 'qi', s.qi),
        bar('Body', 'body', s.body), bar('Insight', 'insight', s.insight),
        bar('Charm', 'charm', s.charm), bar('Heart', 'sanity', s.sanity)),
      h('div', { class: 'stats-words' }, words.map((w) => h('span', {}, w))),
      toggle);
  }

  renderDock() {
    const g = this.g;
    const L = g.life;
    const season = L.turn % 4;
    const next = SEASONS[(season + 1) % 4];
    let label = 'Next Season';
    let small = `${SEASONS[season]} → ${next}${season === 3 ? ` · turn ${g.age + 1}` : ''}`;
    if (L.travel) { label = 'Continue the journey'; small = `${L.travel.left} season${L.travel.left === 1 ? '' : 's'} to ${LOCATIONS[L.travel.dest].name}`; }
    else if (L.montage && g.age < 6 && g.meta.loop > 1 && settings.montage) { label = 'Drift through childhood'; small = 'Stops for anything new'; }
    else if (season === 3) { label = 'Age Up'; small = `Winter → Spring · you turn ${g.age + 1}`; }
    this.ageBtn.replaceChildren(document.createTextNode(label), h('small', {}, small));
    this.ageBtn.disabled = !g.canAdvance();
    this.ageBtn.classList.toggle('breathe', L.actions === 0 && g.canAdvance() && motion() === 'full');
    const n = L.actions;
    this.actionsLeft.textContent = g.age < 3 ? 'You are too young to do much but grow.' : n > 0 ? `${n} action${n === 1 ? '' : 's'} left this season` : 'No actions left this season';
  }

  // ── The chronicle ──────────────────────────────────────────────
  renderLog() {
    const L = this.g.life;
    this.logEl.replaceChildren();
    this.lastTurnRendered = null;
    const start = Math.max(0, L.log.length - this.window);
    if (start > 0) {
      this.logEl.append(h('button', { class: 'btn small ghost', style: 'display:block;margin:6px auto', onclick: () => { this.window += 400; this.renderLog(); } }, 'Show earlier years'));
    }
    const frag = document.createDocumentFragment();
    for (const e of L.log.slice(start)) frag.append(...this.entryNodes(e, false));
    this.logEl.append(frag);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  appendEntry(e) {
    this.logEl.append(...this.entryNodes(e, true));
    requestAnimationFrame(() => { this.logEl.scrollTop = this.logEl.scrollHeight; });
    if (['event', 'news', 'death', 'breakthrough', 'grief', 'deviation'].includes(e.k)) announce(stripTags(e.x).slice(0, 220));
  }

  entryNodes(e, live) {
    const out = [];
    if (e.k === 'year') {
      out.push(h('div', { class: 'log-year', role: 'heading', 'aria-level': '2' }, `Year of the ${e.x}`, h('small', {}, `Your ${ordinal(e.age + 1)} year · age ${e.age}`)));
      this.lastTurnRendered = e.t;
      return out;
    }
    const season = e.t % 4;
    const showSeason = this.lastTurnRendered !== e.t;
    this.lastTurnRendered = e.t;
    const node = h('p', { class: `entry ${e.k}` });
    if (showSeason && !['wheel', 'birth'].includes(e.k)) node.append(h('span', { class: 'season' }, SEASONS[season]));
    if (e.art && (e.k === 'event' || e.k === 'letter') && live && motion() !== 'off') node.append(h('span', { class: 'vig', html: vignetteSVG(e.art, season, e.t) }));
    if (e.k === 'letter' && e.from) node.append(h('span', { class: 'from' }, `A letter from ${e.from}`));
    if (e.title && ['event', 'news', 'letter'].includes(e.k)) node.append(h('span', { class: 'ev-title' }, e.title), ' ');
    if (e.k === 'combat') {
      node.append(h('span', { class: 'ev-title' }, e.x), ' ', e.r || '');
      if (e.lines?.length) node.append(h('details', {}, h('summary', {}, 'How it went'), e.lines.map((l) => h('p', {}, l))));
    } else {
      node.append(e.x);
    }
    if (e.c) node.append(h('span', { class: 'choice-made' }, '→ ', h('em', {}, e.c), e.r ? h('span', { class: e.ok === false ? 'bad' : e.ok ? 'ok' : '' }, ` ${e.r}`) : null));
    out.push(node);
    return out;
  }
}

function fameWord(v) {
  if (v >= 100) return 'legendary';
  if (v >= 60) return 'renowned';
  if (v >= 30) return 'known across the region';
  if (v >= 12) return 'known locally';
  return 'whispered';
}
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');

export { cycleName, FACTIONS };
