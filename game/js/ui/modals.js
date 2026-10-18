// Modal dialogs: events (with letters and mini-games), combat, seclusion, dice, death and the turn of
// the wheel, the breakthrough ceremony, settings and save slots.
import { h, toast, trapFocus, download } from './dom.js';
import { vignetteSVG, sealSVG, wheelSVG, icon } from './art.js';
import { director } from './sound.js';
import { settings, setSetting, applySettings } from './settings.js';
import { refreshPanel } from './panels.js';
import { CAT_LABEL } from '../engine/registry.js';
import { REALMS } from '../content/realms.js';
import { TECHS } from '../content/martial.js';
import { slotSummaries, saveSlot, loadSlot, clearSlot, exportAll, importAll, clearActive } from '../core/store.js';

let open = null;

export function closeModal() {
  if (!open) return;
  open.release?.();
  open.el.remove();
  const prev = open.prev;
  open = null;
  director.duck(false);
  prev?.focus?.();
}

function showModal(content, { cls = '', label = 'Dialog', onKey } = {}) {
  closeModal();
  const modal = h('div', { class: `modal ${cls}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, content);
  const el = h('div', { class: 'modal-back' }, modal);
  document.body.append(el);
  open = { el, modal, prev: document.activeElement, release: trapFocus(modal), onKey };
  el.addEventListener('keydown', (e) => onKey?.(e));
  requestAnimationFrame(() => (modal.querySelector('.choice:not([disabled]), .tech:not([disabled]), button:not([disabled])') || modal).focus());
  return modal;
}

// ── Events ────────────────────────────────────────────────────
export function openEventModal(ui, p) {
  const g = ui.g;
  director.duck(true);
  const season = g.life.turn % 4;
  const choose = (i) => {
    const c = p.choices[i];
    if (!c || c.locked) return;
    director.sfx('select');
    if (p.game) { runMinigame(p.game, (score) => { closeModal(); g.choose(i, score); afterEvent(ui); }); return; }
    closeModal();
    g.choose(i);
    afterEvent(ui);
  };
  const letter = p.fmt === 'letter';
  const content = [
    p.art ? h('div', { class: 'modal-vig', html: vignetteSVG(p.art, season, g.life.turn) }) : null,
    h('div', { class: 'modal-body' },
      h('div', { class: 'cat' }, h('span', {}, letter ? 'A letter' : CAT_LABEL[p.cat] || ''), h('span', {}, `Age ${g.age}`)),
      p.title ? h('h2', {}, p.title) : null,
      letter && p.from ? h('p', { class: 'from' }, `From ${p.from}`) : null,
      h('p', { class: 'text' }, p.text),
      h('div', { class: 'choices', role: 'group', 'aria-label': 'Choices' }, p.choices.map((c, i) => h('button', {
        class: `choice${c.memory ? ' memory' : ''}`, disabled: c.locked ? true : null, onclick: () => choose(i),
        'aria-describedby': c.hint || c.need ? `hint-${i}` : null,
      }, h('span', {}, c.label), (c.hint || c.need || c.memory) ? h('small', { id: `hint-${i}` }, [c.memory ? '⟲ from a past life' : null, c.locked ? `requires ${c.need}` : c.hint].filter(Boolean).join(' · ')) : null)))),
  ];
  showModal(content, { cls: letter ? 'letter' : '', label: p.title || 'Event', onKey: (e) => { const n = Number(e.key); if (n >= 1 && n <= 9) choose(n - 1); } });
}

function afterEvent(ui) {
  ui.refresh();
  refreshPanel();
}

// A simple qi-circulation timing game: press when the light reaches the dantian, three times.
function runMinigame(kind, done) {
  let hits = 0;
  let tries = 0;
  let angle = 0;
  let raf = 0;
  const canvas = h('canvas', { width: 480, height: 480, 'aria-hidden': 'true' });
  const msg = h('p', { 'aria-live': 'polite' }, kind === 'forge' ? 'Strike when the steel glows brightest.' : 'Press when the light reaches the golden mark.');
  const press = () => {
    tries += 1;
    const d = Math.abs(((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI * 1.5);
    if (d < 0.35) { hits += 1; director.sfx('qi'); msg.textContent = 'Good.'; } else { director.sfx('click'); msg.textContent = 'Missed.'; }
    if (tries >= 3) { cancelAnimationFrame(raf); setTimeout(() => done(hits / 3), 400); }
  };
  const draw = () => {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, 480, 480);
    c.strokeStyle = '#2a2420'; c.lineWidth = 6; c.beginPath(); c.arc(240, 240, 160, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#b5873a'; c.lineWidth = 18; c.beginPath(); c.arc(240, 240, 160, Math.PI * 1.5 - 0.35, Math.PI * 1.5 + 0.35); c.stroke();
    const x = 240 + Math.cos(angle) * 160;
    const y = 240 + Math.sin(angle) * 160;
    const gr = c.createRadialGradient(x, y, 0, x, y, 30);
    gr.addColorStop(0, 'rgba(216,169,74,1)'); gr.addColorStop(1, 'rgba(216,169,74,0)');
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill();
    angle += 0.045 + tries * 0.015;
    raf = requestAnimationFrame(draw);
  };
  showModal([h('div', { class: 'modal-body minigame' }, h('h2', {}, kind === 'forge' ? 'At the anvil' : 'Circulate your qi'), canvas, msg,
    h('button', { class: 'btn primary', onclick: press }, kind === 'forge' ? 'Strike' : 'Press'))], { label: 'Mini-game', onKey: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); } } });
  draw();
}

// ── Combat ────────────────────────────────────────────────────
export function openCombatModal(ui, p) {
  director.setMood('danger');
  const body = h('div', { class: 'modal-body' });
  showModal([body], { cls: 'combat-modal', label: 'Combat' });
  open.combat = { body, ui };
  drawCombat(ui);
}

export function updateCombatModal(ui, data) {
  if (!open?.combat) return;
  if (data?.sfx) data.sfx.forEach((s, i) => setTimeout(() => director.sfx(s), i * 160));
  drawCombat(ui);
}

function drawCombat(ui) {
  const g = ui.g;
  const p = g.life.pending;
  const { body } = open.combat;
  if (!p || p.kind !== 'combat') { closeModal(); return; }
  const me = g.myCombatHp();
  const bar = (cls, v, label) => h('span', { class: `bar ${cls}`, role: 'meter', 'aria-label': label, 'aria-valuenow': Math.round(v), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${Math.max(0, Math.min(100, v))}%` }));
  const log = h('div', { class: 'duel-log', 'aria-live': 'polite' }, p.lines.map((l) => h('p', { class: l.ex ? 'ex' : '' }, l.text)));
  if (p.done) log.append(h('p', { class: 'end' }, p.outcomeText || ''));
  const parts = [
    h('div', { class: 'cat' }, h('span', {}, p.context === 'spar' ? 'Sparring' : p.context === 'tournament' ? 'Tournament' : 'Combat'), h('span', {}, `Exchange ${Math.min(p.ex + 1, p.max)} of ${p.max}`)),
    h('h2', {}, p.title),
    h('div', { class: 'fighters' },
      h('div', { class: 'fighter' }, h('strong', {}, 'You'), bar('hp', me, 'Your health'), bar('cq', (p.you.qi / p.you.maxQi) * 100, 'Your qi')),
      h('div', { class: 'fighter foe' }, h('strong', {}, p.foe.name), bar('foe', p.foe.hp, 'Their health'), h('small', {}, REALMS[p.foe.realm].name))),
    log,
  ];
  if (p.mercy) {
    parts.push(h('p', {}, 'Their life is in your hands.'), h('div', { class: 'techs' }, g.mercyOptions().map((o) => h('button', { class: 'tech', onclick: () => { g.mercy(o.id); finishCombatUi(ui); } }, o.label))));
  } else if (p.done) {
    parts.push(h('button', { class: 'btn primary', style: 'margin-top:12px;width:100%', onclick: () => finishCombatUi(ui) }, 'Continue'));
  } else {
    parts.push(h('div', { class: 'techs', role: 'group', 'aria-label': 'Techniques' }, g.combatOptions().map((t) => h('button', {
      class: 'tech', disabled: t.affordable ? null : true, onclick: () => { g.combatAct(t.id); },
    }, h('span', {}, cap(t.name)), h('small', {}, `${t.kind}${t.self ? ', hurts you too' : ''}`), t.cost ? h('span', { class: 'pips', 'aria-label': `qi cost ${t.cost}` }, Array.from({ length: Math.ceil(t.cost / 4) }, () => h('i'))) : null))));
    parts.push(h('div', { class: 'exits' }, g.combatExits().map((x) => h('button', { class: x.id === 'memory' ? 'memory' : '', disabled: x.used ? true : null, onclick: () => g.combatAct(x.id) }, x.label))));
  }
  body.replaceChildren(...parts);
  log.scrollTop = log.scrollHeight;
  const first = body.querySelector('.tech:not([disabled]), .btn.primary');
  if (first && !body.contains(document.activeElement)) first.focus();
}

function finishCombatUi(ui) {
  const p = ui.g.life.pending;
  closeModal();
  if (p?.kind === 'combat' && p.done && !p.mercy) ui.g.finishCombat();
  ui.refresh();
  refreshPanel();
}

// ── Seclusion and dice ────────────────────────────────────────
export function openSeclusion(ui) {
  const g = ui.g;
  let years = 3;
  const out = h('output', {}, '3 years');
  const range = h('input', { type: 'range', min: 1, max: 30, value: 3, 'aria-label': 'Years in seclusion', oninput: (e) => { years = Number(e.target.value); out.textContent = `${years} year${years === 1 ? '' : 's'}`; } });
  showModal([h('div', { class: 'modal-body' },
    h('div', { class: 'cat' }, h('span', {}, 'Seclusion'), h('span', {}, `Age ${g.age}`)),
    h('h2', {}, 'Close the door'),
    h('p', {}, 'Cultivate in closed-door seclusion. You will break through on your own when ready, but the world will go on without you: people age, history moves, and you will hear of it only afterwards.'),
    h('div', { class: 'slider-row' }, range, out),
    h('div', { class: 'choices', style: 'margin-top:12px' },
      h('button', { class: 'choice', onclick: () => { closeModal(); director.sfx('seal'); g.doActivity('seclusion', { years }); ui.refresh(); refreshPanel(); } }, 'Enter seclusion'),
      h('button', { class: 'choice', onclick: closeModal }, 'Not yet')))], { label: 'Seclusion' });
}

export function openDice(ui) {
  const g = ui.g;
  let bet = Math.min(5, Math.floor(g.life.stats.wealth));
  const dice = h('div', { class: 'dice', 'aria-live': 'polite' }, [1, 2, 3].map(() => h('span', { class: 'die' }, '?')));
  const msg = h('p', {}, 'Three dice. Four to ten is small, eleven to seventeen is big. Triples, the house wins.');
  const betOut = h('output', {}, `${bet} taels`);
  const range = h('input', { type: 'range', min: 1, max: Math.max(1, Math.min(100, Math.floor(g.life.stats.wealth))), value: Math.max(1, bet), 'aria-label': 'Bet', oninput: (e) => { bet = Number(e.target.value); betOut.textContent = `${bet} taels`; } });
  const play = (guess) => {
    if (g.life.actions <= 0 || g.life.stats.wealth < 1) return;
    director.sfx('click');
    g.doActivity('gamble', { bet, guess });
    const r = g.life.lastDice;
    if (!r) return;
    [...dice.children].forEach((d, i) => { d.classList.remove('roll'); void d.offsetWidth; d.classList.add('roll'); d.textContent = r.dice[i]; });
    msg.textContent = r.won ? `${r.sum}: ${r.result}! You win ${r.stake} taels.` : `${r.sum}${r.result === 'triple' ? ', triples' : `: ${r.result}`}. You lose ${r.stake} taels.`;
    director.sfx(r.won ? 'ageUp' : 'clash');
    ui.refresh();
    if (g.life.pending) { closeModal(); }
  };
  showModal([h('div', { class: 'modal-body' },
    h('div', { class: 'cat' }, h('span', {}, 'Gambling den'), h('span', {}, `${Math.floor(g.life.stats.wealth)} taels`)),
    h('h2', {}, 'Big or small?'), msg, dice,
    h('div', { class: 'slider-row' }, range, betOut),
    h('div', { class: 'choices', style: 'margin-top:12px' },
      h('button', { class: 'choice', onclick: () => play('small') }, 'Small'),
      h('button', { class: 'choice', onclick: () => play('big') }, 'Big'),
      h('button', { class: 'choice', onclick: closeModal }, 'Leave')))], { label: 'Gambling' });
}

// ── Childhood montage prompt (later loops) ────────────────────
export function openMontage(ui) {
  const g = ui.g;
  showModal([h('div', { class: 'modal-body' },
    h('div', { class: 'cat' }, h('span', {}, 'The wheel'), h('span', {}, `Life ${g.meta.loop}`)),
    h('h2', {}, 'A familiar childhood'),
    h('p', {}, 'You have lived these first years before. Drift through them, stopping only for things that are new to you or that you have marked?'),
    h('div', { class: 'choices' },
      h('button', { class: 'choice', onclick: () => { closeModal(); g.driftChildhood(); ui.refresh(); } }, 'Drift to age six'),
      h('button', { class: 'choice', onclick: () => { closeModal(); g.life.montage = false; g.save(); ui.refresh(); } }, 'Live every season again')))], { label: 'Childhood' });
}

// ── Breakthrough ceremony ─────────────────────────────────────
export function openCeremony(ui, realm) {
  const r = REALMS[realm];
  const el = h('div', { class: 'ceremony', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Breakthrough: ${r.name}` },
    h('div', {}, h('div', { class: 'rings', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('div', { class: 'seal-mark', html: sealSVG(r.sigil, 110, realm >= 6 ? '#b5873a' : '#9c2a1c') }),
      h('h2', {}, `${r.name}`),
      h('p', {}, ui.g.breakthroughText(realm)),
      h('button', { class: 'btn primary', onclick: () => el.remove() }, 'Continue')));
  document.body.append(el);
  el.querySelector('button').focus();
}

// ── Death and the turn of the wheel ───────────────────────────
export function openDeath(ui) {
  const g = ui.g;
  if (document.querySelector('.death-screen')) return;
  closeModal();
  director.setMood('sorrow');
  director.sfx('death');
  const entry = g.endLife() || g.meta.hall[g.meta.hall.length - 1];
  const canRegress = g.canRegress();
  const el = h('div', { class: 'death-screen', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'You died' },
    h('div', { class: 'death-card' },
      h('div', { class: 'ink-spread', 'aria-hidden': 'true' }),
      h('h2', {}, `${entry.name}, ${entry.age}`),
      h('p', { class: 'cause' }, entry.cause),
      h('div', { class: 'epitaph' }, h('p', { style: 'margin:0 0 6px' }, `Here lies ${entry.title}.`), h('p', { style: 'margin:0;font-style:italic' }, entry.epitaph)),
      h('p', {}, `${REALMS[entry.realm].name} realm · Life ${entry.loop} · ${g.meta.stats.deaths} death${g.meta.stats.deaths === 1 ? '' : 's'}`),
      canRegress
        ? h('p', { style: 'color:#d8c9a9' }, 'Darkness. And then, impossibly, the smell of your mother’s kitchen…')
        : h('p', { style: 'color:#d8c9a9' }, 'One Life mode. There is no wheel to turn.'),
      canRegress ? h('button', { class: 'btn primary', onclick: () => { el.remove(); g.regress(); } }, 'Turn the wheel') : null,
      h('button', { class: 'btn', onclick: () => { el.remove(); ui.unmount(); clearActive(); ui.opts.onNewWheel?.(); } }, 'Begin a new wheel'),
      h('button', { class: 'btn ghost', onclick: () => { el.remove(); ui.unmount(); ui.opts.onQuit?.(); } }, 'Title screen')));
  document.body.append(el);
  el.querySelector('button').focus();
}

export function wheelTurn(then) {
  const el = h('div', { class: 'wheel-turn', 'aria-hidden': 'true', html: wheelSVG() });
  document.body.append(el);
  director.sfx('ascend');
  setTimeout(() => { el.remove(); then?.(); }, document.documentElement.dataset.motion === 'off' ? 50 : 2700);
}

// ── Settings and saves ────────────────────────────────────────
export function openSettings(ui) {
  const g = ui?.g;
  const slider = (key, label) => h('div', { class: 'field' }, h('label', {}, label), h('input', {
    type: 'range', min: 0, max: 100, value: Math.round(settings[key] * 100), 'aria-label': label,
    oninput: (e) => { setSetting(key, Number(e.target.value) / 100); director.apply(); },
  }));
  const seg = (key, label, items) => {
    const box = h('div', { class: 'seg', role: 'group', 'aria-label': label });
    const draw = () => box.replaceChildren(...items.map(([v, l]) => h('button', { 'aria-pressed': String(settings[key] === v), onclick: () => { setSetting(key, v); if (key === 'motion') settings.motionOverride = v === 'full'; applySettings(); director.apply(); draw(); } }, l)));
    draw();
    return h('div', { class: 'field' }, h('label', {}, label), box);
  };
  showModal([h('div', { class: 'modal-body' },
    h('div', { class: 'back-row' }, h('h2', { style: 'margin:0' }, 'Settings'), h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: closeModal, html: icon('close') })),
    seg('sound', 'Sound', [[true, 'On'], [false, 'Off']]),
    slider('master', 'Master volume'), slider('music', 'Music'), slider('ambience', 'Ambience'), slider('sfx', 'Sound effects'),
    seg('motion', 'Animation', [['full', 'Full'], ['reduced', 'Reduced'], ['off', 'Off']]),
    seg('text', 'Text size', [['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']]),
    seg('contrast', 'Contrast', [['normal', 'Normal'], ['high', 'High']]),
    seg('montage', 'Childhood in later lives', [[true, 'Drift'], [false, 'Live it']]),
    h('div', { class: 'divider' }),
    g ? h('div', { class: 'choices' },
      h('button', { class: 'choice', onclick: () => openSaves(ui) }, 'Save to a slot / load a slot'),
      h('button', { class: 'choice', onclick: () => download('the-mortal-path-save.json', exportAll()) }, 'Export everything to a file'),
      h('button', { class: 'choice', onclick: () => { closeModal(); ui.unmount(); ui.opts.onQuit?.(); } }, 'Return to the title screen')) : null,
    h('p', { style: 'font-size:0.85em;color:var(--muted);margin-top:14px' }, 'Keyboard: N next season, 1–5 open tabs, 1–9 pick a choice. The game saves after every action.'))], { label: 'Settings' });
}

export function openSaves(ui, onLoad) {
  const g = ui?.g;
  const draw = () => {
    const slots = slotSummaries();
    return h('div', { class: 'modal-body' },
      h('div', { class: 'back-row' }, h('h2', { style: 'margin:0' }, 'Save slots'), h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: closeModal, html: icon('close') })),
      h('p', {}, 'The game autosaves constantly. Slots let you keep a snapshot of the whole wheel, to branch lives or keep a backup.'),
      h('div', { class: 'list' }, slots.map((s) => h('div', { class: 'item' },
        h('span', { class: 'mark', html: icon('save') }),
        h('span', { class: 'txt' }, h('strong', {}, `Slot ${s.n}`), h('small', {}, s.empty ? 'Empty' : `${s.label} · ${new Date(s.savedAt).toLocaleString()}`)),
        h('span', { class: 'end' },
          g ? h('button', { class: 'btn small', onclick: () => { if (s.empty || window.confirm('Overwrite this slot?')) { saveSlot(s.n, g.toJSON(), `${g.life.family} ${g.life.name}, age ${g.age}, life ${g.meta.loop}`); toast('Saved.'); modal.replaceChildren(draw()); } } }, 'Save') : null,
          !s.empty ? h('button', { class: 'btn small', onclick: () => { const save = loadSlot(s.n); if (!save) return; closeModal(); if (ui) { ui.unmount(); } (onLoad || ui?.opts.onLoad)?.(save); } }, 'Load') : null,
          !s.empty ? h('button', { class: 'link', onclick: () => { if (window.confirm('Erase this slot?')) { clearSlot(s.n); modal.replaceChildren(draw()); } } }, 'Erase') : null)))),
      h('div', { class: 'field' }, h('label', {}, 'Import a save file'), h('input', { type: 'file', accept: '.json,application/json', onchange: async (e) => { const f = e.target.files[0]; if (!f) return; try { importAll(await f.text()); toast('Imported.'); modal.replaceChildren(draw()); } catch (err) { toast(`Import failed: ${err.message}`); } } })));
  };
  const modal = showModal([draw()], { label: 'Save slots' });
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export { TECHS };
