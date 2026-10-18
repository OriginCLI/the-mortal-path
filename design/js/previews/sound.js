// Audio preview: instrument samples, a generated theme, ambient beds and UI sound effects,
// all synthesized live, with an oscilloscope drawn from the output.
import { h, reducedMotion } from '../dom.js';
import * as audio from '../../../shared/audio/synth.js';

const INST = { pluck: 'Zither', flute: 'Flute', bowed: 'Fiddle', bells: 'Gong & bell', drums: 'Drums' };
const AMB = { wind: 'Wind', rain: 'Rain', birds: 'Birds', fire: 'Fire', temple: 'Temple' };
const SFX = [
  ['click', 'UI tap'], ['ageUp', 'Age up'], ['seal', 'Seal stamp'], ['qi', 'Qi gathers'],
  ['breakthrough', 'Breakthrough'], ['deviation', 'Qi deviation'], ['clash', 'Sword clash'], ['hit', 'Hit'], ['death', 'Death bell'],
];

let theme = null;
let themeTimer = 0;
let seed = 7;
const beds = new Map();

function stopAll() {
  if (theme) theme.stop();
  theme = null;
  clearTimeout(themeTimer);
  for (const stop of beds.values()) stop();
  beds.clear();
}

export function soundPreview(a, all, env) {
  if (!audio.supported()) {
    return h('div', { class: 'pv' }, h('p', { class: 'pv-note' }, 'This browser does not support the Web Audio API.'));
  }
  const status = h('p', { class: 'pv-note', 'aria-live': 'polite' }, 'Every sound here is synthesized in your browser. Nothing is a recording.');
  const playBtn = h('button', { type: 'button', class: 'btn' });
  const setPlaying = (on) => {
    playBtn.textContent = on ? '■ Stop theme' : '▶ Play theme';
    playBtn.setAttribute('aria-pressed', String(on));
  };
  const startTheme = () => {
    if (theme) { theme.stop(); theme = null; }
    clearTimeout(themeTimer);
    theme = audio.playTheme({ instruments: a.instruments, music: a.music, scale: a.scale, tempo: a.tempo, seed });
    setPlaying(true);
    status.textContent = a.music === 'adaptive'
      ? 'Adaptive: four calm bars, then danger. Drums swell, the gong sounds.'
      : `Playing a ${a.music} theme in ${a.scale} at ${a.tempo} BPM.`;
    themeTimer = setTimeout(() => { theme = null; setPlaying(false); }, theme.duration * 1000);
  };
  playBtn.onclick = () => {
    if (theme) { theme.stop(); theme = null; clearTimeout(themeTimer); setPlaying(false); } else startTheme();
  };
  setPlaying(!!theme);

  const instBtns = a.instruments.map((id) => h('button', {
    type: 'button', class: 'chip-btn', onclick: () => audio.demo(id),
  }, `♪ ${INST[id]}`));

  const ambBtns = a.ambience.map((id) => {
    const b = h('button', {
      type: 'button', class: `chip-btn${beds.has(id) ? ' on' : ''}`, 'aria-pressed': String(beds.has(id)),
      onclick: () => {
        if (beds.has(id)) { beds.get(id)(); beds.delete(id); } else beds.set(id, audio.ambience(id, 0.7));
        b.classList.toggle('on', beds.has(id));
        b.setAttribute('aria-pressed', String(beds.has(id)));
      },
    }, AMB[id]);
    return b;
  });

  const intensity = a.sfx / 100;
  const sfxBtns = SFX.map(([id, label]) => h('button', {
    type: 'button', class: 'chip-btn', onclick: () => audio.sfx(id, { intensity, force: true }),
  }, label));

  const canvas = h('canvas', { class: 'scope', width: 600, height: 120, 'aria-hidden': 'true' });
  let raf = 0;
  const draw = () => {
    const an = audio.getAnalyser();
    const c = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    c.clearRect(0, 0, W, H);
    c.strokeStyle = 'rgba(216,169,74,0.18)';
    c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
    if (an) {
      const data = new Uint8Array(an.fftSize);
      an.getByteTimeDomainData(data);
      c.strokeStyle = '#d8a94a';
      c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * W;
        const y = (data[i] / 255) * H;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.stroke();
    }
    if (!reducedMotion()) raf = requestAnimationFrame(draw);
  };
  draw();
  env.onCleanup(() => cancelAnimationFrame(raf));
  env.onLeave(stopAll);

  return h('div', { class: 'pv pv-sound' },
    canvas,
    h('div', { class: 'theme-row' }, playBtn,
      h('button', { type: 'button', class: 'link-btn', onclick: () => { seed = (seed * 31 + 7) % 10007; startTheme(); } }, '↻ New melody')),
    status,
    h('div', { class: 'pv-sub' }, 'Instruments'), h('div', { class: 'chip-row' }, instBtns.length ? instBtns : h('span', { class: 'pv-note' }, 'No instruments selected.')),
    h('div', { class: 'pv-sub' }, 'Ambience (toggle; layer them)'), h('div', { class: 'chip-row' }, ambBtns),
    h('div', { class: 'pv-sub' }, `Sound effects at “${['minimal', 'light', 'balanced', 'rich', 'cinematic'][Math.min(4, Math.round(a.sfx / 25))]}” richness`),
    h('div', { class: 'chip-row' }, sfxBtns),
    h('p', { class: 'pv-note' }, `Default: sound ${a.defaultOn === 'on' ? 'on after the first tap' : 'off until enabled'}. After changing an answer, press play again to hear it.`));
}
