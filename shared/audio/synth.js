// All sound is synthesized here with the Web Audio API. No audio files anywhere.
// Instruments: plucked zither (Karplus-Strong), bamboo flute, bowed fiddle, gong, temple bell,
// barrel drum, woodblock, metallic clash, sword swish, drones; plus ambient beds and a theme generator.
// Tiny seeded PRNG (mulberry32) so generated themes are repeatable.
function rng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return next;
}

let ctx = null;
let bus = null;       // instruments -> bus -> (dry + reverb) -> master
let busNode = null;
let routeOverride = null; // sfx temporarily route instruments into the sfx channel
const route = () => routeOverride || bus;
let master = null;
let analyser = null;
let noiseBuf = null;
const channels = {};
const settings = { sfx: true, volume: 0.7, channels: { music: 0.6, ambience: 0.5, sfx: 0.8 } };
const ksCache = new Map();

export function configure({ sound, volume }) {
  if (typeof sound === 'boolean') settings.sfx = sound;
  if (typeof volume === 'number') {
    settings.volume = volume;
    if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  }
}

export function supported() {
  return !!(window.AudioContext || window.webkitAudioContext);
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = settings.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    bus = ctx.createGain();
    busNode = bus;
    const verb = ctx.createConvolver();
    verb.buffer = impulse(2.8, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    bus.connect(comp);
    bus.connect(verb);
    verb.connect(wet);
    wet.connect(comp);
    comp.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);
    noiseBuf = makeNoise(2);
    for (const name of ['music', 'ambience', 'sfx']) {
      channels[name] = ctx.createGain();
      channels[name].gain.value = settings.channels[name];
      channels[name].connect(bus);
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const getAnalyser = () => analyser;

// Separate volume channels (music / ambience / sfx). The design tool ignores them; the game uses them.
export function channel(name) { return ac() ? channels[name] : null; }
export function setChannelVolume(name, v, ramp = 0.1) {
  settings.channels[name] = v;
  if (channels[name]) channels[name].gain.setTargetAtTime(v, ctx.currentTime, ramp);
}
export function resume() { return ac(); }
export const now = () => (ac() ? ctx.currentTime : 0);

// ── Building blocks ────────────────────────────────────────────────
function impulse(seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function makeNoise(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function noise(loop = false) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuf;
  n.loop = loop;
  if (loop) n.loopStart = Math.random();
  return n;
}

function gainNode(v = 0) {
  const g = ctx.createGain();
  g.gain.value = v;
  return g;
}

function filter(type, freq, q = 1) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function osc(type, freq) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  return o;
}

// Exponential-ish envelope: attack to peak, decay to near-silence by `end`.
function envelope(param, t, peak, attack, end) {
  param.cancelScheduledValues(t);
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  param.exponentialRampToValueAtTime(0.0001, end);
}

function vibrato(target, rate, depth, t, delay, end) {
  const lfo = osc('sine', rate);
  const g = gainNode(0);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0, t + delay);
  g.gain.linearRampToValueAtTime(depth, t + delay + 0.35);
  lfo.connect(g);
  g.connect(target);
  lfo.start(t);
  lfo.stop(end);
}

// Karplus-Strong plucked string rendered into a cached buffer.
function ksBuffer(freq, seconds, bright) {
  const key = `${Math.round(freq * 10)}|${seconds}|${bright}`;
  if (ksCache.has(key)) return ksCache.get(key);
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const N = Math.max(2, Math.round(sr / freq));
  const line = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    lp += bright * ((Math.random() * 2 - 1) - lp); // soften the excitation
    line[i] = lp;
  }
  // Longer sustain for low strings, like a real zither.
  const decay = 0.9985 - Math.min(0.006, freq / 400000);
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = line[idx];
    const nxt = line[(idx + 1) % N];
    line[idx] = decay * 0.5 * (cur + nxt);
    d[i] = cur;
    idx = (idx + 1) % N;
  }
  if (ksCache.size > 200) ksCache.clear();
  ksCache.set(key, buf);
  return buf;
}

// ── Instruments (t = start time, f = Hz) ───────────────────────────
export const inst = {
  pluck(t, f, dur = 2.4, vel = 0.6, out = route(), { bend = 0, vib = 0.004 } = {}) {
    const src = ctx.createBufferSource();
    src.buffer = ksBuffer(f, Math.min(4, Math.max(1.2, dur + 0.8)), 0.55);
    if (bend) {
      // Gayageum-style press bend after the attack.
      src.playbackRate.setValueAtTime(1, t);
      src.playbackRate.linearRampToValueAtTime(1, t + 0.18);
      src.playbackRate.linearRampToValueAtTime(Math.pow(2, bend / 12), t + 0.42);
    }
    if (vib) vibrato(src.playbackRate, 5.2, vib, t, 0.35, t + dur + 1);
    const body = filter('peaking', 420, 1.2);
    body.gain.value = 5;
    const lp = filter('lowpass', 3800, 0.6);
    const g = gainNode(vel * 1.4);
    src.connect(body).connect(lp).connect(g).connect(out);
    src.start(t);
    src.stop(t + dur + 1);
  },

  flute(t, f, dur = 1, vel = 0.5, out = route(), { vib = 0.012, fall = 0 } = {}) {
    const end = t + dur + 0.3;
    const o = osc('sine', f);
    const o2 = osc('triangle', f * 2);
    const g2 = gainNode(0.12);
    o.frequency.setValueAtTime(f * 0.965, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
    o2.frequency.setValueAtTime(f * 1.93, t);
    o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.09);
    if (fall) {
      o.frequency.setValueAtTime(f, t + dur * 0.7);
      o.frequency.exponentialRampToValueAtTime(f * Math.pow(2, -fall / 12), t + dur);
      o2.frequency.setValueAtTime(f * 2, t + dur * 0.7);
      o2.frequency.exponentialRampToValueAtTime(f * 2 * Math.pow(2, -fall / 12), t + dur);
    }
    vibrato(o.frequency, 5.4, f * vib, t, 0.25, end);
    vibrato(o2.frequency, 5.4, f * 2 * vib, t, 0.25, end);
    const env = gainNode(0);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vel * 0.32, t + 0.09);
    env.gain.setTargetAtTime(vel * 0.26, t + 0.12, 0.3);
    env.gain.setTargetAtTime(0.0001, t + dur, 0.09);
    // Breath and the daegeum membrane buzz.
    const n = noise(true);
    const bp = filter('bandpass', f * 2, 3);
    const ng = gainNode(vel * 0.05);
    const chiff = gainNode(0);
    envelope(chiff.gain, t, vel * 0.18, 0.01, t + 0.09);
    n.connect(bp).connect(ng).connect(env);
    n.connect(chiff).connect(out);
    o.connect(env);
    o2.connect(g2).connect(env);
    env.connect(out);
    [o, o2, n].forEach((x) => { x.start(t); x.stop(end + 0.5); });
  },

  bowed(t, f, dur = 1.2, vel = 0.5, out = route(), { vib = 0.011, slide = 1 } = {}) {
    const end = t + dur + 0.4;
    const env = gainNode(0);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vel * 0.2, t + 0.16);
    env.gain.setTargetAtTime(vel * 0.17, t + 0.2, 0.4);
    env.gain.setTargetAtTime(0.0001, t + dur, 0.12);
    const lp = filter('lowpass', 1700, 0.8);
    const nasal = filter('peaking', 1100, 2.5);
    nasal.gain.value = 7;
    for (const det of [0, 4]) {
      const o = osc('sawtooth', f);
      o.detune.value = det;
      o.frequency.setValueAtTime(f * Math.pow(2, -slide / 12), t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.14);
      vibrato(o.frequency, 5.8, f * vib, t, 0.3, end);
      o.connect(lp);
      o.start(t);
      o.stop(end + 0.5);
    }
    lp.connect(nasal).connect(env).connect(out);
  },

  gong(t, f = 98, vel = 0.7, out = route(), length = 1) {
    const ratios = [1, 1.52, 2.03, 2.66, 3.21, 4.07, 5.11, 6.3];
    const amps = [1, 0.6, 0.48, 0.36, 0.26, 0.2, 0.13, 0.08];
    const decays = [6.5, 5, 4, 3, 2.4, 1.8, 1.3, 0.9];
    ratios.forEach((r, i) => {
      const o = osc('sine', f * r * (1 + (Math.random() - 0.5) * 0.004));
      o.frequency.setValueAtTime(f * r * 0.985, t);
      o.frequency.exponentialRampToValueAtTime(f * r, t + 0.6);
      const g = gainNode(0);
      const end = t + decays[i] * length;
      envelope(g.gain, t, vel * amps[i] * 0.22, 0.012 + i * 0.01, end);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(end + 0.1);
    });
    const n = noise();
    const lp = filter('lowpass', 900, 0.7);
    const ng = gainNode(0);
    envelope(ng.gain, t, vel * 0.35, 0.005, t + 0.35);
    n.connect(lp).connect(ng).connect(out);
    n.start(t);
    n.stop(t + 0.5);
  },

  bell(t, f = 196, vel = 0.6, out = route(), length = 1) {
    const ratios = [0.5, 1, 1.183, 1.506, 2, 2.514, 2.662, 3.011, 4.166];
    const amps = [0.5, 1, 0.55, 0.35, 0.45, 0.25, 0.22, 0.18, 0.1];
    ratios.forEach((r, i) => {
      const o = osc('sine', f * r);
      const g = gainNode(0);
      const end = t + (i === 0 ? 8 : 6 / (1 + i * 0.35)) * length;
      envelope(g.gain, t, vel * amps[i] * 0.16, 0.004, end);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(end + 0.1);
    });
  },

  drum(t, vel = 0.8, out = route(), pitch = 1) {
    const o = osc('sine', 150 * pitch);
    o.frequency.setValueAtTime(150 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(48 * pitch, t + 0.28);
    const g = gainNode(0);
    envelope(g.gain, t, vel * 0.9, 0.004, t + 0.75);
    const skin = osc('triangle', 240 * pitch);
    skin.frequency.setValueAtTime(240 * pitch, t);
    skin.frequency.exponentialRampToValueAtTime(110 * pitch, t + 0.12);
    const sg = gainNode(0);
    envelope(sg.gain, t, vel * 0.25, 0.002, t + 0.16);
    const n = noise();
    const lp = filter('lowpass', 700, 0.8);
    const ng = gainNode(0);
    envelope(ng.gain, t, vel * 0.4, 0.002, t + 0.09);
    o.connect(g).connect(out);
    skin.connect(sg).connect(out);
    n.connect(lp).connect(ng).connect(out);
    [o, skin, n].forEach((x) => { x.start(t); x.stop(t + 0.9); });
  },

  woodblock(t, vel = 0.4, out = route(), f = 640) {
    const o = osc('sine', f);
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.88, t + 0.08);
    const g = gainNode(0);
    envelope(g.gain, t, vel * 0.5, 0.002, t + 0.13);
    const o2 = osc('sine', f * 2.7);
    const g2 = gainNode(0);
    envelope(g2.gain, t, vel * 0.12, 0.001, t + 0.04);
    o.connect(g).connect(out);
    o2.connect(g2).connect(out);
    [o, o2].forEach((x) => { x.start(t); x.stop(t + 0.2); });
  },

  clash(t, vel = 0.6, out = route()) {
    const n = noise();
    const hp = filter('highpass', 2800, 0.7);
    const ng = gainNode(0);
    envelope(ng.gain, t, vel * 0.45, 0.002, t + 0.3);
    n.connect(hp).connect(ng).connect(out);
    n.start(t);
    n.stop(t + 0.4);
    [2410, 3170, 4330, 5620, 7020].forEach((f, i) => {
      const o = osc('sine', f * (0.98 + Math.random() * 0.04));
      const g = gainNode(0);
      envelope(g.gain, t, vel * 0.09 / (1 + i * 0.3), 0.001, t + 0.9 - i * 0.12);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 1);
    });
  },

  swish(t, vel = 0.5, out = route(), up = true) {
    const n = noise();
    const bp = filter('bandpass', up ? 500 : 3200, 1.4);
    bp.frequency.setValueAtTime(up ? 500 : 3200, t);
    bp.frequency.exponentialRampToValueAtTime(up ? 3600 : 450, t + 0.2);
    const g = gainNode(0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel * 0.5, t + 0.09);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    n.connect(bp).connect(g).connect(out);
    n.start(t);
    n.stop(t + 0.3);
  },

  drone(t, f, dur, vel = 0.3, out = route()) {
    const lp = filter('lowpass', 420, 0.5);
    const lfo = osc('sine', 0.09);
    const lg = gainNode(160);
    lfo.connect(lg).connect(lp.frequency);
    const g = gainNode(0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel * 0.12, t + 1.5);
    g.gain.setValueAtTime(vel * 0.12, t + Math.max(1.6, dur - 2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [r, det] of [[1, 0], [1, 7], [1.5, -5], [0.5, 3]]) {
      const o = osc(r === 0.5 ? 'triangle' : 'sawtooth', f * r);
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
    lp.connect(g).connect(out);
  },
};

// ── Sound effects (respect the UI sound toggle unless forced) ─────
const A4 = 440;
const hz = (semi, base = A4) => base * Math.pow(2, semi / 12);

export function sfx(name, opts = {}) {
  if (!opts.force && !settings.sfx) return;
  if (!ac()) return;
  routeOverride = channels.sfx || null;
  try { sfxInner(name, opts); } finally { routeOverride = null; }
}

function sfxInner(name, { intensity = 0.6 } = {}) {
  const bus = route();
  const t = ctx.currentTime + 0.01;
  const rich = intensity > 0.45;
  const lush = intensity > 0.75;
  const v = 0.45 + intensity * 0.5;
  switch (name) {
    case 'click':
      inst.woodblock(t, 0.25 + intensity * 0.15, bus, 720);
      break;
    case 'select':
      inst.pluck(t, hz(7, 440), 0.6, 0.18 + intensity * 0.12, bus, { vib: 0 });
      break;
    case 'ageUp':
      inst.pluck(t, hz(0, 440), 1.2, 0.3 * v);
      inst.pluck(t + 0.12, hz(7, 440), 1.6, 0.32 * v);
      if (rich) inst.woodblock(t, 0.2);
      if (lush) inst.pluck(t + 0.24, hz(12, 440), 2, 0.25 * v, bus, { bend: 1 });
      break;
    case 'seal':
      inst.drum(t, 0.5 * v, bus, 1.3);
      inst.woodblock(t + 0.02, 0.35);
      if (rich) inst.bell(t + 0.05, 392, 0.25 * v, bus, 0.5);
      break;
    case 'breakthrough': {
      inst.gong(t, 98, 0.8 * v);
      const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
      const n = rich ? scale.length : 5;
      for (let i = 0; i < n; i++) inst.pluck(t + 0.25 + i * 0.07, hz(scale[i], 220), 2.2, 0.28 * v, bus, { vib: 0.003 });
      if (lush) {
        inst.bell(t + 0.9, 523.25, 0.4, bus, 1.2);
        inst.drone(t, 110, 4.5, 0.6);
      }
      break;
    }
    case 'qi':
      for (let i = 0; i < 3; i++) inst.pluck(t + i * 0.09, hz([0, 4, 7][i], 660), 1.4, 0.18 * v, bus, { vib: 0.005 });
      break;
    case 'deviation': {
      for (const s of [0, 1, 6]) inst.bowed(t, hz(s - 12, 440), 1.4, 0.45 * v, bus, { slide: -3, vib: 0.03 });
      inst.drum(t + 0.1, 0.7 * v, bus, 0.7);
      if (rich) inst.clash(t + 0.05, 0.25);
      break;
    }
    case 'death':
      inst.bell(t, 130.8, 0.7 * v, bus, 1.4);
      if (rich) inst.drum(t, 0.6 * v, bus, 0.6);
      if (lush) inst.flute(t + 0.8, hz(-9, 440), 2.4, 0.3, bus, { fall: 2 });
      break;
    case 'clash':
      inst.clash(t, 0.55 * v);
      if (rich) inst.swish(t - 0.005, 0.3, bus, false);
      break;
    case 'swish':
      inst.swish(t, 0.5 * v);
      break;
    case 'hit':
      inst.swish(t, 0.4 * v);
      inst.drum(t + 0.06, 0.55 * v, bus, 1.6);
      if (rich) inst.clash(t + 0.06, 0.2);
      break;
    case 'ascend': {
      inst.gong(t, 73.4, 0.9, bus, 1.3);
      inst.bell(t + 0.6, 293.7, 0.5, bus, 1.4);
      const arp = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];
      arp.forEach((s, i) => inst.pluck(t + 0.4 + i * 0.09, hz(s, 293.66), 2.4, 0.3, bus, { vib: 0.004 }));
      inst.flute(t + 1.7, hz(12, 293.66), 2.6, 0.4);
      inst.drone(t, 73.4, 6, 0.7);
      break;
    }
    default:
      break;
  }
}

// ── Instrument demo phrases ────────────────────────────────────────
export function demo(name) {
  if (!ac()) return;
  const t = ctx.currentTime + 0.03;
  const D = 293.66;
  const yu = [0, 3, 5, 7, 10, 12];
  switch (name) {
    case 'pluck':
      [0, 7, 12, 10, 7].forEach((s, i) => inst.pluck(t + i * 0.32, hz(s, D / 2), 2.4, 0.5, bus, { bend: i === 4 ? 2 : 0 }));
      break;
    case 'flute':
      [[7, 0.6], [10, 0.4], [12, 1.4], [10, 0.5], [7, 1.6]].reduce((at, [s, d]) => {
        inst.flute(at, hz(s, D), d, 0.55, bus, { fall: d > 1.5 ? 1 : 0 });
        return at + d;
      }, t);
      break;
    case 'bowed':
      [[0, 0.9], [3, 0.6], [5, 1.5], [3, 0.5], [0, 1.6]].reduce((at, [s, d]) => {
        inst.bowed(at, hz(s, D), d, 0.6);
        return at + d;
      }, t);
      break;
    case 'bells':
      inst.gong(t, 98, 0.7);
      inst.bell(t + 1.6, 233, 0.55);
      break;
    case 'drums':
      [0, 0.5, 0.75, 1.0, 1.5, 1.75, 2.0, 2.25].forEach((b, i) =>
        inst.drum(t + b * 0.75, i % 4 === 0 ? 0.9 : 0.55, bus, i % 2 ? 1.2 : 1));
      inst.woodblock(t + 0.75 * 0.5, 0.3);
      inst.woodblock(t + 0.75 * 1.5, 0.3);
      break;
    default:
      yu.forEach((s, i) => inst.pluck(t + i * 0.2, hz(s, D), 1.5, 0.4));
  }
}

// ── Ambient beds (return a stop function) ──────────────────────────
export function ambience(kind, level = 0.6, dest = null) {
  if (!ac()) return () => {};
  const t = ctx.currentTime;
  const out = gainNode(0);
  out.gain.setTargetAtTime(level, t, 0.6);
  out.connect(dest || bus);
  const nodes = [];
  const timers = [];
  const add = (...n) => nodes.push(...n);

  if (kind === 'wind' || kind === 'temple') {
    const n = noise(true);
    const bp = filter('bandpass', 420, 0.9);
    const lfo = osc('sine', 0.07);
    const lg = gainNode(260);
    lfo.connect(lg).connect(bp.frequency);
    const amp = gainNode(kind === 'temple' ? 0.12 : 0.28);
    const alfo = osc('sine', 0.13);
    const alg = gainNode(0.12);
    alfo.connect(alg).connect(amp.gain);
    n.connect(bp).connect(amp).connect(out);
    [n, lfo, alfo].forEach((x) => x.start(t));
    add(n, lfo, alfo);
  }
  if (kind === 'temple') {
    const ring = () => {
      inst.bell(ctx.currentTime + 0.05, 164.8, 0.6, out, 1.6);
      if (Math.random() < 0.5) inst.woodblock(ctx.currentTime + 2.5, 0.3, out, 520);
    };
    ring();
    timers.push(setInterval(ring, 6500));
  }
  if (kind === 'rain') {
    const n = noise(true);
    const hp = filter('highpass', 900, 0.5);
    const lp = filter('lowpass', 7000, 0.5);
    const g = gainNode(0.22);
    n.connect(hp).connect(lp).connect(g).connect(out);
    n.start(t);
    add(n);
    timers.push(setInterval(() => {
      const at = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const d = at + Math.random() * 0.12;
        const o = osc('sine', 1800 + Math.random() * 3500);
        o.frequency.setValueAtTime(o.frequency.value, d);
        o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 600, d + 0.03);
        const dg = gainNode(0);
        envelope(dg.gain, d, 0.05 + Math.random() * 0.05, 0.001, d + 0.05);
        o.connect(dg).connect(out);
        o.start(d);
        o.stop(d + 0.07);
      }
    }, 140));
  }
  if (kind === 'birds') {
    const chirp = () => {
      const at = ctx.currentTime + 0.02;
      const base = 2400 + Math.random() * 1800;
      const count = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const s = at + i * (0.09 + Math.random() * 0.05);
        const o = osc('sine', base);
        o.frequency.setValueAtTime(base * 0.8, s);
        o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), s + 0.05);
        o.frequency.exponentialRampToValueAtTime(base * 0.9, s + 0.08);
        const fm = osc('sine', 60 + Math.random() * 40);
        const fg = gainNode(base * 0.04);
        fm.connect(fg).connect(o.frequency);
        const g = gainNode(0);
        envelope(g.gain, s, 0.26, 0.01, s + 0.09);
        o.connect(g).connect(out);
        [o, fm].forEach((x) => { x.start(s); x.stop(s + 0.12); });
      }
    };
    chirp();
    timers.push(setInterval(() => { if (Math.random() < 0.6) chirp(); }, 900));
    const n = noise(true);
    const bp = filter('bandpass', 300, 0.6);
    const g = gainNode(0.07);
    n.connect(bp).connect(g).connect(out);
    n.start(t);
    add(n);
  }
  if (kind === 'fire') {
    const n = noise(true);
    const lp = filter('lowpass', 260, 0.7);
    const g = gainNode(0.5);
    n.connect(lp).connect(g).connect(out);
    n.start(t);
    add(n);
    timers.push(setInterval(() => {
      const at = ctx.currentTime;
      const pops = Math.random() < 0.3 ? 3 : 1;
      for (let i = 0; i < pops; i++) {
        const s = at + Math.random() * 0.1;
        const c = noise();
        const bp = filter('bandpass', 1500 + Math.random() * 3000, 2);
        const cg = gainNode(0);
        envelope(cg.gain, s, 0.25 + Math.random() * 0.3, 0.001, s + 0.02 + Math.random() * 0.03);
        c.connect(bp).connect(cg).connect(out);
        c.start(s, Math.random());
        c.stop(s + 0.08);
      }
    }, 110));
  }

  return () => {
    timers.forEach(clearInterval);
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    setTimeout(() => {
      nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
      out.disconnect();
    }, 1500);
  };
}

// ── Generated theme ────────────────────────────────────────────────
const SCALES = {
  gung: [0, 2, 4, 7, 9],
  pyeongjo: [0, 2, 5, 7, 9],
  yu: [0, 3, 5, 7, 10],
  gyemyeonjo: [0, 3, 5, 7, 10],
};
const RHYTHMS = [[2, 1, 1], [1, 1, 2], [3, 1], [1, 1, 1, 1], [2, 2], [1.5, 0.5, 2], [4]];

// Returns { stop, duration }. Instruments and mood come straight from the audio trial's answers.
export function playTheme({ instruments = [], music = 'ensemble', scale = 'yu', tempo = 76, seed = 7, dest = null, startAt = 0, gain = 1 }) {
  if (!ac()) return { stop() {}, duration: 0 };
  const r = rng(seed);
  const out = gainNode(0);
  out.gain.setTargetAtTime(gain, ctx.currentTime, 0.4);
  out.connect(dest || bus);
  const beat = 60 / tempo;
  const t0 = Math.max(ctx.currentTime + 0.1, startAt);
  const steps = SCALES[scale] || SCALES.yu;
  const sorrow = scale === 'gyemyeonjo';
  const root = scale === 'gung' ? 293.66 : 220; // D or A
  const deg = (d) => {
    const oct = Math.floor(d / steps.length);
    return root * Math.pow(2, (steps[((d % steps.length) + steps.length) % steps.length] + 12 * oct) / 12);
  };
  const has = (k) => instruments.includes(k);
  const leadName = has('flute') ? 'flute' : has('bowed') ? 'bowed' : 'pluck';
  const bars = music === 'ambient' ? 6 : 8;
  const sparse = music === 'sparse' || music === 'ambient';

  // Melody: random walk on scale degrees, phrases resolve to the tonic.
  let d = 5;
  let at = t0;
  for (let bar = 0; bar < bars; bar++) {
    const danger = (music === 'adaptive' && bar >= 4) || music === 'battle';
    const pattern = sparse ? r.pick([[4], [2, 2], [3, 1]]) : r.pick(RHYTHMS);
    pattern.forEach((len, i) => {
      const last = (bar === 3 || bar === bars - 1) && i === pattern.length - 1;
      if (last) d = 5;
      else d = Math.max(2, Math.min(9, d + r.pick([-2, -1, -1, 1, 1, 2, 0])));
      const rest = sparse && r() < 0.3 && !last;
      const dur = len * beat;
      if (!rest && music !== 'ambient') {
        const f = deg(d);
        const vib = sorrow ? 0.026 : 0.011;
        const fall = sorrow && len >= 2 ? 1 : 0;
        if (sparse || leadName === 'pluck') inst.pluck(at, f, dur + 0.6, 0.45, out, { bend: fall ? -1 : 0, vib: sorrow ? 0.01 : 0.004 });
        else if (leadName === 'flute') inst.flute(at, f, dur * 0.95, 0.5, out, { vib, fall });
        else inst.bowed(at, f, dur * 0.95, 0.5, out, { vib });
      } else if (music === 'ambient' && r() < 0.5) {
        inst.pluck(at, deg(d + 5), 3, 0.25, out, { vib: 0.006 });
      }
      at += dur;
    });

    const barStart = t0 + bar * 4 * beat;
    // Accompaniment: zither arpeggios, or a fiddle drone if no zither.
    if (!sparse) {
      if (has('pluck') && leadName !== 'pluck') {
        [0, 2, 4, 2].forEach((x, i) => inst.pluck(barStart + i * beat, deg(x), 1.8, 0.22, out, { vib: 0 }));
      } else if (has('bowed') && leadName !== 'bowed') {
        inst.bowed(barStart, deg(0) / 2, 4 * beat, 0.25, out, { vib: 0.004, slide: 0 });
      }
    }
    // Percussion: sparse in peace; in "adaptive" the second half turns to danger.
    if (has('drums') && !sparse) {
      const hits = danger ? [0, 1, 1.5, 2, 3, 3.5] : (music === 'adaptive' ? [0] : [0, 2]);
      hits.forEach((b, i) => inst.drum(barStart + b * beat, danger ? (i === 0 ? 0.9 : 0.55) : 0.4, out, i % 2 ? 1.25 : 1));
    }
    if (has('bells') && bar % 4 === 0) {
      if (danger || bar === 0) inst.gong(barStart, 98, danger ? 0.6 : 0.35, out, 0.8);
      else inst.bell(barStart, deg(5), 0.3, out);
    }
  }
  if (music === 'ambient' || sparse) inst.drone(t0, root / 2, bars * 4 * beat + 2, music === 'ambient' ? 0.8 : 0.4, out);

  const duration = bars * 4 * beat + 2;
  return {
    duration,
    end: t0 + bars * 4 * beat,
    stop(fade = 0.15) {
      out.gain.setTargetAtTime(0, ctx.currentTime, fade);
      setTimeout(() => out.disconnect(), 1200 + fade * 4000);
    },
  };
}
