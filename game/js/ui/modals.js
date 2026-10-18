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
import { RIDDLES, EXAMS } from '../content/minigames.js';
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
  if (p.cat === 'fortune') director.moment('wonder');
  else if (p.cat === 'war' || (p.cat === 'timeline' && p.art && ['fire', 'war', 'battlefield', 'flood', 'plague'].includes(p.art))) director.moment('tension');
  const season = g.life.turn % 4;
  const choose = (i) => {
    const c = p.choices[i];
    if (!c || c.locked) return;
    director.sfx('select');
    if (p.game && (c.rolled ?? true)) { runMinigame(p.game, (score) => { closeModal(); g.choose(i, score); afterEvent(ui); }, g); return; }
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

// Mini-games (see content/minigames.js). Each calls done(score) with a score from 0 to 1.
function runMinigame(kind, done, g) {
  if (kind === 'riddle') return runRiddles(done);
  if (kind === 'exam') return runExam(done, g);
  if (kind === 'dice') return runDiceGame(done);
  return runTiming(kind, done);
}

// Timing: meditation (a light circling to the dantian) or forging (steel heating to white).
function runTiming(kind, done) {
  const forge = kind === 'forge';
  let hits = 0;
  let tries = 0;
  let t = 0;
  let raf = 0;
  const canvas = h('canvas', { width: 480, height: 480, 'aria-hidden': 'true' });
  const msg = h('p', { 'aria-live': 'polite' }, forge ? 'Strike when the steel glows white.' : 'Press when the light reaches the golden mark.');
  const meditatePhase = () => (((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
  const heat = () => (Math.sin(t * 1.3) + 1) / 2; // 0 cold … 1 white-hot
  const press = () => {
    if (tries >= 3) return;
    tries += 1;
    const good = forge ? heat() > 0.88 : Math.abs(meditatePhase() - Math.PI * 1.5) < 0.35;
    if (good) { hits += 1; director.sfx(forge ? 'clash' : 'qi'); msg.textContent = forge ? 'The steel rang true.' : 'Good.'; }
    else { director.sfx('click'); msg.textContent = forge ? 'A dull note. The steel was not ready.' : 'Missed.'; }
    if (tries >= 3) { cancelAnimationFrame(raf); setTimeout(() => done(hits / 3), 500); }
  };
  const draw = () => {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, 480, 480);
    if (forge) {
      const k = heat();
      // Embers' glow behind the work, soft at the edges.
      const glow = c.createRadialGradient(220, 300, 0, 220, 300, 170);
      glow.addColorStop(0, `rgba(255,${Math.round(140 + k * 100)},70,${0.08 + k * 0.4})`); glow.addColorStop(1, 'rgba(255,160,70,0)');
      c.fillStyle = glow; c.fillRect(0, 100, 440, 380);
      c.fillStyle = '#2a2420'; c.beginPath(); c.moveTo(60, 330); c.lineTo(380, 330); c.lineTo(350, 370); c.lineTo(90, 370); c.closePath(); c.fill(); // anvil face
      c.fillRect(185, 370, 70, 60); c.fillRect(150, 430, 140, 18);
      const r = Math.round(110 + k * 145); const gg = Math.round(40 + k * 205); const b = Math.round(25 + k * 200);
      const steel = c.createLinearGradient(80, 0, 360, 0);
      steel.addColorStop(0, '#4a403a'); steel.addColorStop(0.25, `rgb(${r},${gg},${b})`); steel.addColorStop(0.75, `rgb(${r},${gg},${b})`); steel.addColorStop(1, '#4a403a');
      c.fillStyle = steel; c.beginPath(); c.moveTo(80, 312); c.lineTo(340, 306); c.lineTo(366, 316); c.lineTo(340, 326); c.lineTo(80, 322); c.closePath(); c.fill();
      // Heat gauge: strike in the gold band.
      c.fillStyle = 'rgba(42,36,32,0.15)'; c.fillRect(420, 120, 22, 300);
      c.fillStyle = '#b5873a'; c.fillRect(416, 120, 30, 36);
      c.fillStyle = `rgb(${r},${gg},${b})`; c.fillRect(420, 420 - k * 300, 22, k * 300);
      c.strokeStyle = '#2a2420'; c.lineWidth = 2; c.strokeRect(420, 120, 22, 300);
      for (let i = 0; i < 3; i++) { c.fillStyle = i < hits ? '#b5873a' : 'rgba(42,36,32,0.2)'; c.beginPath(); c.arc(180 + i * 40, 80, 11, 0, Math.PI * 2); c.fill(); }
      t += 0.05 + tries * 0.012;
    } else {
      c.strokeStyle = '#2a2420'; c.lineWidth = 6; c.beginPath(); c.arc(240, 240, 160, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#b5873a'; c.lineWidth = 18; c.beginPath(); c.arc(240, 240, 160, Math.PI * 1.5 - 0.35, Math.PI * 1.5 + 0.35); c.stroke();
      const x = 240 + Math.cos(t) * 160;
      const y = 240 + Math.sin(t) * 160;
      const gr = c.createRadialGradient(x, y, 0, x, y, 30);
      gr.addColorStop(0, 'rgba(216,169,74,1)'); gr.addColorStop(1, 'rgba(216,169,74,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill();
      t += 0.045 + tries * 0.015;
    }
    raf = requestAnimationFrame(draw);
  };
  showModal([h('div', { class: 'modal-body minigame' }, h('h2', {}, forge ? 'At the anvil' : 'Circulate your qi'), canvas, msg,
    h('button', { class: 'btn primary', onclick: press }, forge ? 'Strike' : 'Press'))], { label: 'Mini-game', onKey: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); } } });
  draw();
}

// A question-and-answer game: three rounds, pick one of the offered answers.
function runRounds({ title, label, rounds, render, finish }) {
  let i = 0;
  let total = 0;
  const body = h('div', { class: 'modal-body minigame rounds' });
  const step = () => {
    if (i >= rounds.length) { finish(total); return; }
    const r = rounds[i];
    body.replaceChildren(
      h('div', { class: 'cat' }, h('span', {}, label), h('span', {}, `${i + 1} of ${rounds.length}`)),
      h('h2', {}, title), ...render(r),
      h('div', { class: 'choices', role: 'group', 'aria-label': 'Answers' }, r.options.map((o, k) => h('button', { class: 'choice', onclick: () => {
        total += o.score;
        director.sfx(o.score > 0 ? 'select' : 'click');
        i += 1;
        step();
      } }, h('span', {}, `${k + 1}. ${o.text}`)))));
    requestAnimationFrame(() => body.querySelector('.choice')?.focus());
  };
  showModal([body], { label, onKey: (e) => { const n = Number(e.key); const b = body.querySelectorAll('.choice')[n - 1]; if (b) b.click(); } });
  step();
}

function runRiddles(done) {
  const pool = [...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 3);
  runRounds({ title: 'Riddles', label: 'A test of wit', rounds: pool.map((r) => ({ q: r.q, options: r.a.map((a, k) => ({ text: a, score: k === r.ok ? 1 : 0 })) })),
    render: (r) => [h('p', { class: 'text riddle' }, `“${r.q}”`)], finish: (n) => { closeModal(); done(n / 3); } });
}

function runExam(done, g) {
  const ex = EXAMS[Math.floor(Math.random() * EXAMS.length)];
  // Insight lets you sense the best line (a small mark), as a scholar would.
  const sharp = (g?.life.stats.insight || 0) >= 45;
  runRounds({ title: 'The examination hall', label: 'Compose your essay', rounds: ex.parts.map((part) => ({ options: [...part].sort(() => Math.random() - 0.5).map(([text, score]) => ({ text: sharp && score === 2 ? `${text} ✓` : text, score })) })),
    render: () => [h('p', { class: 'text' }, `Topic: ${ex.topic}.`), sharp ? h('p', { class: 'muted small' }, 'Your studies let you sense which line rings truest.') : null].filter(Boolean),
    finish: (n) => { closeModal(); done(n / 6); } });
}

// Three throws of big-or-small; the score is the share you called right.
function runDiceGame(done) {
  let i = 0;
  let wins = 0;
  const dice = h('div', { class: 'dice', 'aria-live': 'polite' }, [1, 2, 3].map(() => h('span', { class: 'die' }, '?')));
  const msg = h('p', {}, 'Three throws. Call big or small.');
  const call = (guess) => {
    if (i >= 3) return;
    const r = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6));
    const sum = r[0] + r[1] + r[2];
    const result = sum >= 11 ? 'big' : 'small';
    [...dice.children].forEach((d, k) => { d.classList.remove('roll'); void d.offsetWidth; d.classList.add('roll'); d.textContent = r[k]; });
    i += 1;
    if (result === guess) wins += 1;
    msg.textContent = `${sum}, ${result}. ${result === guess ? 'You called it.' : 'Wrong.'} (${i} of 3)`;
    director.sfx(result === guess ? 'select' : 'click');
    if (i >= 3) setTimeout(() => { closeModal(); done(wins / 3); }, 700);
  };
  showModal([h('div', { class: 'modal-body minigame' }, h('h2', {}, 'Big or small?'), msg, dice,
    h('div', { class: 'choices' }, h('button', { class: 'choice', onclick: () => call('small') }, 'Small'), h('button', { class: 'choice', onclick: () => call('big') }, 'Big')))], { label: 'Dice' });
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
