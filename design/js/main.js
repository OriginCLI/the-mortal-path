// Design Trials app shell: routing, the realm header, the three views (gate, trial, scroll),
// sealing trials and the breakthrough ceremony.
import { h, download, copyText } from './dom.js';
import { TRIALS, realmFor, trialById } from './trials.js';
import { load, save, freshState, defaultAnswers } from './state.js';
import { renderQuestion, renderNotes } from './widgets.js';
import { PREVIEWS } from './previews/index.js';
import * as audio from '../../shared/audio/synth.js';
import { backdropSVG, pathMapSVG, sealSVG, startQiField } from './art.js';
import { buildMarkdown, buildJSON, parseImport, rawExport } from './spec.js';

let state = load();
audio.configure(state.settings);

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');
const overlay = document.getElementById('overlay');
const toastEl = document.getElementById('toast');
document.getElementById('backdrop').innerHTML = backdropSVG();

const sealedCount = () => TRIALS.filter((t) => state.sealed[t.id]).length;
const qi = startQiField(document.getElementById('qi-field'), () => realmFor(sealedCount()).idx);

let warnedStorage = false;
function persist() {
  if (!save(state) && !warnedStorage) {
    warnedStorage = true;
    toast('Your browser blocked storage. Answers last only for this visit, so export them from the Scroll.');
  }
}

// ── Lifecycle hooks for previews ───────────────────────────────────
let cleanups = [];
const leaveFns = new Set();
function runCleanups() { cleanups.forEach((f) => f()); cleanups = []; }
function leaveView() {
  runCleanups();
  leaveFns.forEach((f) => f());
  leaveFns.clear();
}

// ── Header ─────────────────────────────────────────────────────────
function renderHeader() {
  const n = sealedCount();
  const { cur, next, progress } = realmFor(n);
  const soundBtn = h('button', {
    type: 'button', class: 'icon-btn', 'aria-pressed': String(state.settings.sound),
    'aria-label': state.settings.sound ? 'Mute interface sounds' : 'Unmute interface sounds',
    title: 'Interface sounds',
    onclick: () => {
      state.settings.sound = !state.settings.sound;
      audio.configure(state.settings);
      persist();
      renderHeader();
      audio.sfx('click');
    },
  }, h('span', { 'aria-hidden': 'true', html: state.settings.sound ? speakerOn : speakerOff }));
  const vol = h('input', {
    type: 'range', min: 0, max: 100, value: Math.round(state.settings.volume * 100), class: 'vol', 'aria-label': 'Volume',
    oninput: (e) => { state.settings.volume = Number(e.target.value) / 100; audio.configure(state.settings); },
    onchange: () => { persist(); audio.sfx('click', { force: true }); },
  });
  topbar.replaceChildren(
    h('a', { href: '#/', class: 'brand', 'aria-label': 'The Mortal Path: back to the trial map' },
      h('span', { class: 'brand-seal', html: sealSVG('道', 30) }),
      h('span', { class: 'brand-text' }, h('strong', {}, 'The Mortal Path'), h('small', {}, 'Design Trials'))),
    h('div', { class: 'realm', title: cur.blurb },
      h('span', { class: 'realm-hz', 'aria-hidden': 'true' }, cur.hanja),
      h('div', { class: 'realm-info' },
        h('strong', {}, cur.en),
        h('small', {}, `${cur.ko} · ${n}/${TRIALS.length} sealed${next ? ` · next: ${next.en}` : ''}`),
        h('div', {
          class: 'qi-bar', role: 'progressbar', 'aria-label': 'Progress to next realm',
          'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(progress * 100),
        }, h('i', { style: `width:${progress * 100}%` })))),
    h('div', { class: 'top-actions' },
      h('a', { href: '#/scroll', class: 'top-link' }, 'Scroll'),
      vol, soundBtn));
}
const speakerOn = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const speakerOff = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// ── Routing ────────────────────────────────────────────────────────
function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('trial/') && trialById[hash.slice(6)]) return { view: 'trial', id: hash.slice(6) };
  if (hash === 'scroll') return { view: 'scroll' };
  return { view: 'gate' };
}
const go = (id) => { location.hash = id === 'scroll' ? '#/scroll' : id === 'gate' ? '#/' : `#/trial/${id}`; };

function render() {
  leaveView();
  closeOverlay(false);
  renderHeader();
  const r = parseRoute();
  if (r.view === 'trial') renderTrial(trialById[r.id]);
  else if (r.view === 'scroll') renderScroll();
  else renderGate();
  window.scrollTo({ top: 0 });
  const h1 = app.querySelector('h1');
  if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
}
window.addEventListener('hashchange', render);

function firstUnsealed(after = -1) {
  for (let i = after + 1; i < TRIALS.length; i++) if (!state.sealed[TRIALS[i].id]) return TRIALS[i].id;
  for (let i = 0; i <= after && i < TRIALS.length; i++) if (!state.sealed[TRIALS[i].id]) return TRIALS[i].id;
  return 'scroll';
}

// ── Gate: the mountain map ────────────────────────────────────────
function renderGate() {
  document.title = 'Design Trials · The Mortal Path';
  const n = sealedCount();
  const map = h('div', { class: 'map-box', html: pathMapSVG(TRIALS, state.sealed, null) });
  const activate = (e) => {
    const g = e.target.closest('[data-go]');
    if (!g) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    audio.sfx('click');
    go(g.dataset.go);
  };
  map.addEventListener('click', activate);
  map.addEventListener('keydown', activate);
  const nextId = firstUnsealed();

  app.replaceChildren(h('div', { class: 'gate' },
    h('section', { class: 'gate-text' },
      h('p', { class: 'eyebrow' }, 'A design journey in twelve trials'),
      h('h1', {}, 'The Path of Trials'),
      h('p', { class: 'lede' },
        'At the foot of the mountain stands a mortal with a game in mind. Twelve trials wind up the path, one for each question a designer must answer.'),
      h('p', {},
        'In each trial you pick cards, move sliders, rank priorities and leave notes, and the live previews answer back: event text in your chosen tone, palettes drawn as game screens, synthesized music, playable duels, a thousand simulated lives. ',
        'Seal a trial and your qi grows. Seal all twelve to reach the ', h('em', {}, 'Realm of Life and Death'),
        ' and open the Heavenly Scroll at the summit: your design spec in Markdown and JSON.'),
      h('p', { class: 'hint' }, 'Every answer is pre-filled from the original brief, so change only what you care about. Progress saves automatically in this browser.'),
      h('div', { class: 'gate-actions' },
        h('button', { type: 'button', class: 'btn primary', onclick: () => { audio.sfx('select'); go(nextId); } },
          n === 0 ? 'Begin the first trial' : nextId === 'scroll' ? 'Open the Heavenly Scroll' : 'Continue the climb'),
        n > 0 && nextId !== 'scroll' ? h('a', { class: 'btn ghost', href: '#/scroll' }, 'Skip to the Scroll') : null),
      h('ol', { class: 'gate-list' }, TRIALS.map((t, i) => h('li', { class: state.sealed[t.id] ? 'done' : '' },
        h('a', { href: `#/trial/${t.id}` },
          h('span', { class: 'gl-hz', 'aria-hidden': 'true' }, t.hanja),
          h('span', {}, h('strong', {}, `${i + 1}. ${t.topic}`), h('small', {}, t.title)),
          state.sealed[t.id] ? h('span', { class: 'gl-tick', 'aria-label': 'sealed' }, '✓') : null))))),
    h('section', { class: 'gate-map', 'aria-label': 'Trial map' }, map)));
}

// ── Trial view ────────────────────────────────────────────────────
function renderTrial(t) {
  const idx = TRIALS.indexOf(t);
  document.title = `${t.topic} · Design Trials`;
  const a = state.answers[t.id];
  const pv = PREVIEWS[t.id];
  const pvBody = h('div', { class: 'pv-body' });
  let timer = 0;
  const drawPreview = () => {
    runCleanups();
    const env = {
      trial: t,
      rerender: drawPreview,
      onCleanup: (f) => cleanups.push(f),
      onLeave: (f) => leaveFns.add(f),
    };
    try {
      pvBody.replaceChildren(pv.render(state.answers[t.id], state.answers, env));
    } catch (err) {
      console.error(err);
      pvBody.replaceChildren(h('p', { class: 'pv-note' }, `The preview stumbled: ${err.message}`));
    }
  };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(drawPreview, 90); };

  const onAnswer = (q) => (v) => {
    state.answers[t.id][q.id] = v;
    persist();
    if (q.type === 'cards') audio.sfx('select');
    schedule();
  };

  const questions = t.questions.map((q) => renderQuestion(q, a[q.id], onAnswer(q)));
  const notes = renderNotes(a.notes, (v) => { state.answers[t.id].notes = v; persist(); });
  const sealed = !!state.sealed[t.id];

  const dots = h('nav', { class: 'dots', 'aria-label': 'Trials' }, TRIALS.map((x, i) => h('a', {
    href: `#/trial/${x.id}`, class: `dot${state.sealed[x.id] ? ' done' : ''}${x === t ? ' cur' : ''}`,
    'aria-current': x === t ? 'step' : null, title: `${i + 1}. ${x.topic}`,
  }, h('span', { 'aria-hidden': 'true' }, x.hanja), h('span', { class: 'sr' }, `${i + 1}. ${x.topic}${state.sealed[x.id] ? ' (sealed)' : ''}`))),
  h('a', { href: '#/scroll', class: 'dot scroll', title: 'The Heavenly Scroll' }, h('span', { 'aria-hidden': 'true' }, '天'), h('span', { class: 'sr' }, 'The Heavenly Scroll')));

  const resetBtn = h('button', {
    type: 'button', class: 'link-btn',
    onclick: () => {
      if (!window.confirm(`Reset “${t.title}” to its default answers?`)) return;
      state.answers[t.id] = defaultAnswers(t);
      persist();
      render();
    },
  }, 'Reset this trial');

  const sealBtn = h('button', {
    type: 'button', class: `btn primary seal-btn${sealed ? ' sealed' : ''}`,
    onclick: () => sealTrial(t),
  }, sealed ? 'Sealed ✓ · Onward' : 'Seal this trial');

  app.replaceChildren(h('div', { class: 'trial' },
    dots,
    h('header', { class: 'trial-head' },
      h('div', { class: 'trial-seal', html: sealSVG(t.hanja, 64, sealed ? '#b8352a' : '#5a4733') }),
      h('div', {},
        h('p', { class: 'eyebrow' }, `Trial ${idx + 1} of ${TRIALS.length} · ${t.topic}`),
        h('h1', {}, t.title),
        h('blockquote', { class: 'master' }, t.master))),
    h('div', { class: 'trial-grid' },
      h('div', { class: 'qcol' }, questions, notes),
      h('aside', { class: 'pcol', id: 'preview', 'aria-label': 'Live preview' },
        h('div', { class: 'preview-card' },
          h('div', { class: 'pv-head' }, h('h2', {}, pv.title), h('span', { class: 'live' }, 'Live preview')),
          pvBody))),
    h('footer', { class: 'trial-foot' },
      h('div', { class: 'foot-side' },
        idx > 0 ? h('a', { class: 'btn ghost', href: `#/trial/${TRIALS[idx - 1].id}` }, '← Previous') : h('a', { class: 'btn ghost', href: '#/' }, '← Map'),
        resetBtn),
      sealBtn,
      h('div', { class: 'foot-side right' },
        idx < TRIALS.length - 1 ? h('a', { class: 'btn ghost', href: `#/trial/${TRIALS[idx + 1].id}` }, 'Skip →') : h('a', { class: 'btn ghost', href: '#/scroll' }, 'Scroll →'))),
    h('a', { href: '#preview', class: 'jump-preview', onclick: (e) => { e.preventDefault(); document.getElementById('preview').scrollIntoView({ behavior: 'smooth' }); } }, 'Preview ↓')));
  drawPreview();
}

function sealTrial(t) {
  const idx = TRIALS.indexOf(t);
  const nextId = firstUnsealed(idx);
  if (state.sealed[t.id]) { go(nextId); return; }
  const before = realmFor(sealedCount());
  state.sealed[t.id] = true;
  persist();
  const after = realmFor(sealedCount());
  renderHeader();
  if (after.idx > before.idx) {
    const final = sealedCount() === TRIALS.length;
    ceremony(after.cur, final, () => go(final ? 'scroll' : nextId));
  } else {
    audio.sfx('seal');
    audio.sfx('qi');
    const left = after.next ? after.next.at - sealedCount() : 0;
    toast(`Trial sealed. Qi gathers in your dantian. ${left} more trial${left === 1 ? '' : 's'} to ${after.next.en}.`);
    go(nextId);
  }
}

// ── Breakthrough ceremony ─────────────────────────────────────────
let overlayDone = null;
function ceremony(realm, final, done) {
  audio.sfx(final ? 'ascend' : 'breakthrough', { intensity: 0.8 });
  qi.burst(window.innerWidth / 2, window.innerHeight / 2, final ? 320 : 180);
  overlayDone = done;
  toastEl.classList.remove('show');
  const cont = h('button', { type: 'button', class: 'btn primary', onclick: () => closeOverlay(true) },
    final ? 'Open the Heavenly Scroll' : 'Continue the climb');
  overlay.replaceChildren(h('div', { class: `ceremony${final ? ' final' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cer-title' },
    h('div', { class: 'rings', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
    h('div', { class: 'cer-hz', 'aria-hidden': 'true' }, realm.hanja),
    h('p', { class: 'eyebrow' }, final ? 'Ascension' : 'Breakthrough'),
    h('h2', { id: 'cer-title' }, realm.en),
    h('p', { class: 'cer-ko' }, realm.ko),
    h('p', { class: 'cer-blurb' }, realm.blurb),
    cont));
  overlay.classList.add('open');
  cont.focus();
}
function closeOverlay(runDone) {
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.replaceChildren();
  const f = overlayDone;
  overlayDone = null;
  if (runDone && f) f();
}
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(true); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(true); });

let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
}

// ── The Heavenly Scroll ───────────────────────────────────────────
function renderScroll() {
  document.title = 'The Heavenly Scroll · Design Trials';
  const n = sealedCount();
  const { cur } = realmFor(n);
  let tab = 'md';
  const out = h('pre', { class: 'spec-out', tabindex: '0', 'aria-label': 'Generated spec' });
  const tabs = h('div', { class: 'seg', role: 'tablist' });
  const fileBase = 'design-spec';
  const content = () => (tab === 'md' ? buildMarkdown(state) : JSON.stringify(buildJSON(state), null, 2));
  const draw = () => {
    out.textContent = content();
    tabs.replaceChildren(...[['md', 'Markdown'], ['json', 'JSON']].map(([id, label]) => h('button', {
      type: 'button', role: 'tab', class: tab === id ? 'on' : '', 'aria-selected': String(tab === id),
      onclick: () => { tab = id; audio.sfx('click'); draw(); },
    }, label)));
  };
  draw();

  const fileIn = h('input', {
    type: 'file', accept: '.json,.md,.txt,application/json,text/markdown,text/plain', class: 'sr', id: 'import-file',
    onchange: async (e) => {
      const f = e.target.files[0];
      if (f) doImport(await f.text());
      e.target.value = '';
    },
  });
  const paste = h('textarea', { rows: 3, placeholder: '…or paste a spec / answers file here', 'aria-label': 'Paste spec to import' });

  app.replaceChildren(h('div', { class: 'scroll' },
    h('header', { class: 'scroll-head' },
      h('div', { class: 'trial-seal', html: sealSVG('天', 72, n === TRIALS.length ? '#b8352a' : '#5a4733') }),
      h('div', {},
        h('p', { class: 'eyebrow' }, 'The summit'),
        h('h1', {}, 'The Heavenly Scroll'),
        h('p', { class: 'lede' }, n === TRIALS.length
          ? `All twelve trials sealed. You stand in the ${cur.en} (${cur.ko}). The scroll unrolls.`
          : `${n} of ${TRIALS.length} trials sealed (${cur.en}). Unsealed trials will use their defaults. You can still return and change anything.`))),
    h('div', { class: 'seal-row' }, TRIALS.map((t, i) => h('a', {
      href: `#/trial/${t.id}`, class: `mini-seal${state.sealed[t.id] ? ' done' : ''}`, title: `${i + 1}. ${t.topic}`,
      html: sealSVG(t.hanja, 40, state.sealed[t.id] ? '#b8352a' : '#3a2f25'),
    }))),
    h('section', { class: 'spec-panel' },
      h('div', { class: 'spec-bar' }, tabs,
        h('div', { class: 'spec-actions' },
          h('button', { type: 'button', class: 'btn small', onclick: async () => { const ok = await copyText(content()); toast(ok ? 'Copied to clipboard.' : 'Copy failed. Select the text and copy it by hand.'); audio.sfx('click'); } }, 'Copy'),
          h('button', { type: 'button', class: 'btn small', onclick: () => { download(`${fileBase}.md`, buildMarkdown(state), 'text/markdown'); audio.sfx('seal'); } }, 'Download .md'),
          h('button', { type: 'button', class: 'btn small', onclick: () => { download(`${fileBase}.json`, JSON.stringify(buildJSON(state), null, 2), 'application/json'); audio.sfx('seal'); } }, 'Download .json'))),
      out),
    h('section', { class: 'next-step' },
      h('h2', {}, 'What happens next'),
      h('ol', {},
        h('li', {}, 'Download ', h('code', {}, 'design-spec.md'), '. It contains the readable spec plus the full JSON.'),
        h('li', {}, 'Add it to the repository as ', h('code', {}, 'docs/design-spec.md'), ', or paste it into your chat with Claude.'),
        h('li', {}, 'Claude reads it, proposes a plan for the complete game, and waits for your OK before building.'))),
    h('section', { class: 'answers-io' },
      h('h2', {}, 'Your answers'),
      h('p', { class: 'pv-note' }, 'Answers save automatically in this browser. Export them to keep a copy or move to another device; importing accepts an answers file, the JSON spec, or the Markdown spec.'),
      h('div', { class: 'io-row' },
        h('button', { type: 'button', class: 'btn small', onclick: () => download('mortal-path-answers.json', rawExport(state), 'application/json') }, 'Export answers'),
        h('label', { class: 'btn small', for: 'import-file' }, 'Import file…'), fileIn,
        h('button', {
          type: 'button', class: 'btn small ghost danger',
          onclick: () => {
            if (!window.confirm('Reset every trial to its defaults and unseal them all?')) return;
            const settings = state.settings;
            state = freshState();
            state.settings = settings;
            persist();
            toast('The path is reset. You are a mortal once more.');
            render();
          },
        }, 'Reset everything')),
      h('div', { class: 'io-row' }, paste,
        h('button', { type: 'button', class: 'btn small', onclick: () => { if (paste.value.trim()) doImport(paste.value); } }, 'Import pasted')))));
}

function doImport(text) {
  try {
    const next = parseImport(text);
    next.settings = state.settings;
    state = next;
    persist();
    toast(`Imported. ${sealedCount()} of ${TRIALS.length} trials sealed.`);
    render();
  } catch (err) {
    toast(`Import failed: ${err.message}`);
  }
}

render();
