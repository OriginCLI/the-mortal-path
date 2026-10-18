// App shell: title screen, new wheel (character creation), loading, and handing off to the game screen.
import { h, toast, download } from './dom.js';
import { startWheel, loadGame } from '../engine/index.js';
import { loadActive, saveActive, clearActive, exportAll, importAll, storageAvailable, loadSlot } from '../core/store.js';
import { ORIGINS } from '../content/life.js';
import { FAMILY_NAMES, givenName } from '../content/names.js';
import { Rng } from '../core/rng.js';
import { backdropSVG, sealSVG } from './art.js';
import { settings, applySettings } from './settings.js';
import { director } from './sound.js';
import { mountGame } from './game-screen.js';
import { openSettings, openSaves } from './modals.js';

const app = document.getElementById('app');
applySettings();

// Sound starts after the first tap anywhere (spec: on after first tap).
const unlock = () => { director.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
window.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

let warnedStorage = false;
export function persist(save) {
  if (!saveActive(save) && !warnedStorage) {
    warnedStorage = true;
    toast('Your browser is blocking storage. This life will not survive closing the tab; export your save from the menu.');
  }
}

export function showTitle() {
  director.rest('ambient');
  const saved = loadActive();
  const hasSave = !!(saved && saved.meta && saved.life && !saved.meta.over);
  const r = Rng.from(Date.now() & 0xffff);
  const fileIn = h('input', {
    type: 'file', accept: '.json,application/json', class: 'sr', id: 'import-save',
    onchange: async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try { importAll(await f.text()); toast('Save imported.'); showTitle(); } catch (err) { toast(`Import failed: ${err.message}`); }
    },
  });
  app.replaceChildren(h('div', { class: 'title' },
    h('div', { class: 'title-art', html: backdropSVG('peaks', r.int(0, 3), r.int(1, 999), 600, 320) }),
    h('div', { class: 'seal-mark', html: sealSVG('Mortal Path', 64) }),
    h('h1', {}, 'The Mortal Path'),
    h('p', { class: 'tag' }, 'Live. Die. Remember. Walk the path again.'),
    h('div', { class: 'title-menu' },
      hasSave ? h('button', { class: 'btn primary', onclick: () => continueGame(saved) }, `Continue: ${saved.life.family} ${saved.life.name}, ${Math.floor(saved.life.turn / 4)} years old${saved.meta.loop > 1 ? `, life ${saved.meta.loop}` : ''}`) : null,
      h('button', { class: `btn ${hasSave ? '' : 'primary'}`, onclick: () => showNewWheel(hasSave) }, 'Begin a new wheel'),
      h('button', { class: 'btn', onclick: () => openSaves(null, (save) => continueGame(save)) }, 'Load a saved slot'),
      h('button', { class: 'btn ghost', onclick: () => openSettings(null) }, 'Settings'),
      h('label', { class: 'btn ghost', for: 'import-save' }, 'Import save file'), fileIn,
      hasSave ? h('button', { class: 'btn ghost small', onclick: () => download('the-mortal-path-save.json', exportAll()) }, 'Export save file') : null),
    h('div', { class: 'title-foot' },
      h('p', {}, 'Every image and sound in this game is drawn and synthesized in code.'),
      h('p', {}, h('a', { href: 'design/' }, 'The Design Trials'), ' · ', h('a', { href: 'docs/design-spec.md' }, 'Design spec')),
      !storageAvailable() ? h('p', { class: 'chip red' }, 'Storage is blocked in this browser: export your save to keep it.') : null)));
  app.querySelector('h1').focus?.();
}

function continueGame(save) {
  const game = loadGame(save, { onSave: persist, settings });
  mountGame(app, game, { onQuit: showTitle, onNewWheel: () => showNewWheel(false), onLoad: continueGame });
}

const MODES = [
  { id: 'story', name: 'Wanderer', desc: 'A gentler world. Lower death rates, clearer odds.' },
  { id: 'standard', name: 'Martial Artist', desc: 'The intended experience.' },
  { id: 'hard', name: 'Heavenly Tribulation', desc: 'Harsher odds, scarcer pills, more ambushes.' },
  { id: 'ironman', name: 'One Life', desc: 'No regression. When you die, it is over.' },
];

function showNewWheel(overwriting) {
  director.rest('wonder');
  const r = Rng.from(Date.now() & 0xffffff);
  const state = { gender: r.chance(0.5) ? 'm' : 'f', origin: null, mode: 'standard', family: r.pick(FAMILY_NAMES) };
  state.name = givenName(r, state.gender);
  const nameIn = h('input', { class: 'input', value: state.name, 'aria-label': 'Given name', maxlength: 20, oninput: (e) => { state.name = e.target.value; } });
  const famIn = h('input', { class: 'input', value: state.family, 'aria-label': 'Family name', maxlength: 14, oninput: (e) => { state.family = e.target.value; } });
  const reroll = () => { state.name = givenName(r, state.gender); state.family = r.pick(FAMILY_NAMES); nameIn.value = state.name; famIn.value = state.family; };
  const seg = (items, key, onPick) => {
    const box = h('div', { class: 'seg', role: 'group' });
    const draw = () => box.replaceChildren(...items.map(([id, label]) => h('button', { type: 'button', 'aria-pressed': String(state[key] === id), onclick: () => { state[key] = id; draw(); onPick?.(); } }, label)));
    draw();
    return box;
  };
  const cards = (items, key) => {
    const box = h('div', { class: 'choice-grid', role: 'group' });
    const draw = () => box.replaceChildren(...items.map((it) => h('button', {
      type: 'button', class: 'choice-card', 'aria-pressed': String(state[key] === it.id),
      onclick: () => { state[key] = it.id; draw(); director.sfx('click'); },
    }, h('strong', {}, it.name), h('small', {}, it.desc))));
    draw();
    return box;
  };
  const originItems = [{ id: null, name: 'Let fate decide', desc: 'A random birth. Your body is always fate’s choice.' },
    ...Object.entries(ORIGINS).map(([id, o]) => ({ id, name: o.name, desc: o.birth.split('.')[0].replace(/^You were /, '') + '.' }))];
  app.replaceChildren(h('div', { class: 'screen' },
    h('div', { class: 'back-row' }, h('button', { class: 'link', onclick: showTitle }, '← Back'), null),
    h('h2', {}, 'A New Wheel'),
    h('p', { class: 'lede' }, 'Choose who you are born as. Every time you die, you will be born as this person again, on the same morning, remembering.'),
    h('div', { class: 'field' }, h('label', {}, 'Name'), h('div', { class: 'row' }, famIn, nameIn, h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Random name', onclick: reroll, html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v16H4z"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/></svg>' }))),
    h('div', { class: 'field' }, h('label', {}, 'Born a'), seg([['m', 'son'], ['f', 'daughter']], 'gender', reroll)),
    h('h3', {}, 'Origin'), cards(originItems, 'origin'),
    h('h3', {}, 'Difficulty'), cards(MODES, 'mode'),
    overwriting ? h('p', { class: 'note-box' }, 'Starting a new wheel replaces your current autosave. Save it to a slot first if you want to keep it.') : null,
    h('div', { class: 'title-menu', style: 'margin: 20px auto 0' },
      h('button', { class: 'btn primary', onclick: () => {
        const origin = state.origin || r.pick(Object.keys(ORIGINS));
        const game = startWheel({ name: (state.name || 'Ryu').trim(), family: (state.family || 'Baek').trim(), gender: state.gender, origin, mode: state.mode }, { onSave: persist, settings });
        director.sfx('ageUp');
        mountGame(app, game, { onQuit: showTitle, onNewWheel: () => showNewWheel(false), onLoad: continueGame, fresh: true });
      } }, 'Be born'))));
  window.scrollTo(0, 0);
}

export { clearActive, loadSlot };
showTitle();
