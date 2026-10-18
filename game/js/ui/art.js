// All game art, drawn in code: ink-wash backdrops (per place and season), aging portraits, event
// vignettes, English seal stamps, icons, weather and qi particles. No image files.
import { Rng, hashSeed } from '../core/rng.js';

const INK = '#2a2420';
const SEAL = '#9c2a1c';
const PAPER = '#efe6d2';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Primitives ──────────────────────────────────────────────
function ridge(r, y, amp, n, w = 300, rough = 0.5) {
  let d = `M0 ${y}`;
  const pts = n * 4;
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * w;
    const ph = i / 4;
    const peak = Math.abs(Math.sin(ph * Math.PI * 0.5 + r.next() * rough)) * (0.5 + r.next() * 0.5);
    d += ` L${x.toFixed(1)} ${(y - amp * peak).toFixed(1)}`;
  }
  return d;
}
const mountains = (r, y, amp, n, fill, op, w = 300, h = 150) => `<path d="${ridge(r, y, amp, n, w)} L${w} ${h} L0 ${h}Z" fill="${fill}" opacity="${op}"/>`;
const sharpPeaks = (r, y, amp, n, fill, op, w = 300, h = 150) => {
  let d = `M0 ${h} L0 ${y}`;
  for (let i = 0; i < n; i++) {
    const x0 = (i / n) * w;
    const x1 = ((i + 0.5) / n) * w + r.range(-8, 8);
    d += ` L${x0.toFixed(1)} ${(y - r.range(0, amp * 0.3)).toFixed(1)} L${x1.toFixed(1)} ${(y - amp * r.range(0.6, 1)).toFixed(1)}`;
  }
  d += ` L${w} ${y} L${w} ${h}Z`;
  return `<path d="${d}" fill="${fill}" opacity="${op}"/>`;
};
const pine = (x, y, s = 1, c = INK, op = 0.8) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><path d="M0 0v-6" stroke="${c}" stroke-width="1.4"/><path d="M-7 -5 L0 -13 L7 -5Z M-6 -10 L0 -18 L6 -10Z M-4 -15 L0 -22 L4 -15Z" fill="${c}"/></g>`;
const house = (x, y, w = 22, c = INK, op = 0.85) => `<g opacity="${op}"><path d="M${x - 3} ${y - w * 0.45} Q${x + w / 2} ${y - w * 0.85} ${x + w + 3} ${y - w * 0.45}Z" fill="${c}"/><rect x="${x}" y="${y - w * 0.45}" width="${w}" height="${w * 0.45}" fill="${c}" opacity="0.7"/></g>`;
const pagoda = (x, y, s = 1, c = INK, op = 0.85) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}" fill="${c}">${[0, 1, 2, 3, 4].map((i) => `<path d="M${-12 + i * 1.6} ${-i * 11 - 6} Q0 ${-i * 11 - 12} ${12 - i * 1.6} ${-i * 11 - 6}Z"/><rect x="${-7 + i * 1.2}" y="${-i * 11 - 6}" width="${14 - i * 2.4}" height="6" opacity="0.7"/>`).join('')}<path d="M0 -60v-8" stroke="${c}" stroke-width="1.4"/></g>`;
const wall = (x, y, w, c = INK, op = 0.7) => `<g opacity="${op}" fill="${c}"><rect x="${x}" y="${y - 10}" width="${w}" height="10"/>${Array.from({ length: Math.floor(w / 8) }, (_, i) => `<rect x="${x + i * 8}" y="${y - 13}" width="5" height="3"/>`).join('')}</g>`;
const temple = (x, y, s = 1, c = INK, op = 0.85) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}" fill="${c}"><path d="M-30 -18 Q0 -34 30 -18Z"/><rect x="-22" y="-18" width="44" height="14" opacity="0.75"/><path d="M-20 -32 Q0 -44 20 -32Z"/><rect x="-14" y="-32" width="28" height="10" opacity="0.7"/><rect x="-34" y="-4" width="68" height="4"/></g>`;
const moon = (x, y, r = 12, c = '#f3e3c0') => `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="${c}" opacity="0.18"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="0.85"/>`;
const sun = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SEAL}" opacity="0.75"/>`;
const water = (y, w = 300, c = '#5f7f8f') => `<rect x="0" y="${y}" width="${w}" height="${150 - y}" fill="${c}" opacity="0.25"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${20 + i * 48} ${y + 8 + (i % 3) * 9} q8 -3 16 0 t16 0" fill="none" stroke="${INK}" stroke-width="0.8" opacity="0.35"/>`).join('')}`;
const fire = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C-12 -8 -6 -22 0 -30 C2 -20 12 -18 8 -6 C14 -12 14 -2 10 2Z" fill="${SEAL}" opacity="0.85"/><path d="M0 0 C-5 -6 -2 -14 1 -18 C2 -12 7 -10 4 -2Z" fill="#e0a040"/></g>`;
const smoke = (x, y) => `<path d="M${x} ${y} c-8 -10 8 -16 0 -28 c-8 -12 10 -16 2 -30" fill="none" stroke="${INK}" stroke-width="5" opacity="0.18" stroke-linecap="round"/>`;
const banner = (x, y, c = SEAL, h = 26) => `<path d="M${x} ${y}v-${h + 10}" stroke="${INK}" stroke-width="1.4"/><path d="M${x} ${y - h - 10} h14 l-4 ${h / 2} l4 ${h / 2} h-14Z" fill="${c}" opacity="0.9"/>`;
// A small ink figure. pose: stand | sword | kneel | fall | sit | walk
function figure(x, y, s = 1, pose = 'stand', c = INK) {
  const head = `<circle cx="0" cy="-26" r="4.2" fill="${c}"/><path d="M-2 -30 l2 -4 l2 4" fill="${c}"/>`;
  const robe = {
    stand: '<path d="M-5 -21 L5 -21 L8 0 L-8 0Z"/>',
    walk: '<path d="M-5 -21 L5 -21 L9 0 L2 -2 L-1 0 L-8 0Z"/>',
    sword: '<path d="M-5 -21 L5 -21 L9 0 L-9 0Z"/><path d="M4 -18 L22 -30" stroke-width="1.6" stroke="currentColor"/>',
    kneel: '<path d="M-5 -15 L5 -15 L9 0 L-9 0Z"/>',
    sit: '<path d="M-4 -15 L4 -15 L12 0 L-12 0Z"/>',
    fall: '<path d="M-14 -3 L8 -6 L10 0 L-16 0Z"/>',
  }[pose] || '';
  const dy = pose === 'kneel' || pose === 'sit' ? 6 : pose === 'fall' ? 22 : 0;
  const hd = pose === 'fall' ? `<circle cx="-18" cy="-3" r="4" fill="${c}"/>` : `<g transform="translate(0 ${dy})">${head}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" stroke="${c}" color="${c}" stroke-width="0">${hd}${robe}</g>`;
}
const sky = (top, bottom) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="300" height="150" fill="url(#sk)"/>`;
const ground = (y = 128, c = INK, op = 0.18) => `<rect x="0" y="${y}" width="300" height="${150 - y}" fill="${c}" opacity="${op}"/>`;
const blossoms = (r, n = 18, c = '#d98aa0') => Array.from({ length: n }, () => `<circle cx="${r.range(0, 300).toFixed(0)}" cy="${r.range(10, 140).toFixed(0)}" r="${r.range(1, 2.4).toFixed(1)}" fill="${c}" opacity="0.7"/>`).join('');
const snowDots = (r, n = 40) => Array.from({ length: n }, () => `<circle cx="${r.range(0, 300).toFixed(0)}" cy="${r.range(0, 150).toFixed(0)}" r="${r.range(0.8, 1.8).toFixed(1)}" fill="#fff" opacity="0.85"/>`).join('');
const rainLines = (r, n = 50) => Array.from({ length: n }, () => { const x = r.range(0, 300); const y = r.range(0, 150); return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l-4 12" stroke="${INK}" stroke-width="0.7" opacity="0.35"/>`; }).join('');

const SEASON_TINT = [
  { top: '#f4ece0', bottom: '#efe0d8', accent: '#d98aa0' }, // spring
  { top: '#e8eedf', bottom: '#efe8d0', accent: '#6e9a5a' }, // summer
  { top: '#f2e4cc', bottom: '#ead4b4', accent: '#c87a3a' }, // autumn
  { top: '#eef0f0', bottom: '#e4e4e0', accent: '#ffffff' }, // winter
];

// ── Backdrops for the header (wide, 600×160) and the title (600×320) ──
export function backdropSVG(scene, season = 0, seed = 1, w = 600, h = 160) {
  const r = Rng.from(hashSeed(scene, seed));
  const t = SEASON_TINT[season] || SEASON_TINT[0];
  const demonic = scene === 'demonic';
  const parts = [];
  parts.push(`<defs><linearGradient id="bg${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${demonic ? '#e8c8b8' : t.top}"/><stop offset="1" stop-color="${demonic ? '#d8a890' : t.bottom}"/></linearGradient></defs>`);
  parts.push(`<rect width="${w}" height="${h}" fill="url(#bg${seed})"/>`);
  if (demonic) parts.push(`<circle cx="${w * 0.75}" cy="${h * 0.3}" r="30" fill="${SEAL}" opacity="0.5"/>`);
  else parts.push(`<circle cx="${w * 0.8}" cy="${h * 0.28}" r="18" fill="${season === 3 ? '#fff' : SEAL}" opacity="${season === 3 ? 0.8 : 0.35}"/>`);
  const peaks = ['peaks', 'snow', 'demonic'].includes(scene);
  const far = peaks ? sharpPeaks(r, h * 0.62, h * 0.5, 7, INK, 0.12, w, h) : mountains(r, h * 0.6, h * 0.3, 5, INK, 0.1, w, h);
  parts.push(far);
  parts.push(peaks ? sharpPeaks(r, h * 0.78, h * 0.42, 5, INK, demonic ? 0.35 : 0.2, w, h) : mountains(r, h * 0.76, h * 0.22, 4, INK, 0.16, w, h));
  if (scene === 'snow' || season === 3) parts.push(`<path d="${ridge(r, h * 0.42, h * 0.1, 6, w)}" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/>`);
  const by = h * 0.92;
  switch (scene) {
    case 'village': for (let i = 0; i < 6; i++) parts.push(house(40 + i * 85 + r.range(-10, 10), by, r.range(18, 26), INK, 0.55)); for (let i = 0; i < 5; i++) parts.push(pine(r.range(0, w), by, r.range(0.8, 1.3), INK, 0.4)); break;
    case 'city': parts.push(wall(0, by, w, INK, 0.45)); parts.push(pagoda(w * 0.3, by - 8, 1, INK, 0.55)); parts.push(house(w * 0.6, by - 8, 40, INK, 0.5)); parts.push(house(w * 0.75, by - 8, 30, INK, 0.45)); break;
    case 'temple': parts.push(temple(w * 0.55, by - 14, 1.1, INK, 0.6)); for (let i = 0; i < 6; i++) parts.push(pine(r.range(0, w), by, r.range(0.9, 1.4), INK, 0.45)); break;
    case 'forest': for (let i = 0; i < 18; i++) parts.push(pine(r.range(0, w), by + r.range(-4, 6), r.range(0.9, 1.6), INK, r.range(0.3, 0.6))); break;
    case 'lake': case 'river': parts.push(`<rect x="0" y="${h * 0.8}" width="${w}" height="${h * 0.2}" fill="#5f7f8f" opacity="0.25"/>`); parts.push(`<path d="M${w * 0.4} ${h * 0.86} q20 6 40 0" fill="none" stroke="${INK}" stroke-width="2" opacity="0.6"/><path d="M${w * 0.42} ${h * 0.86} v-14" stroke="${INK}" stroke-width="1" opacity="0.6"/>`); break;
    case 'estate': parts.push(wall(w * 0.15, by, w * 0.7, INK, 0.45)); parts.push(house(w * 0.35, by - 10, 56, INK, 0.5)); parts.push(house(w * 0.6, by - 10, 40, INK, 0.45)); break;
    case 'palace': parts.push(wall(0, by, w, SEAL, 0.35)); parts.push(temple(w * 0.5, by - 10, 1.8, INK, 0.5)); break;
    case 'desert': parts.push(`<path d="M0 ${h} L0 ${h * 0.85} Q${w * 0.25} ${h * 0.7} ${w * 0.5} ${h * 0.85} T${w} ${h * 0.82} L${w} ${h}Z" fill="#c8a060" opacity="0.35"/>`); parts.push(wall(w * 0.6, by, 80, INK, 0.4)); break;
    case 'demonic': parts.push(banner(w * 0.3, by, SEAL, 30)); parts.push(banner(w * 0.36, by, SEAL, 24)); parts.push(banner(w * 0.7, by, SEAL, 34)); break;
    case 'peaks': case 'snow': for (let i = 0; i < 4; i++) parts.push(pine(r.range(0, w), by, r.range(1, 1.5), INK, 0.4)); break;
    default: break;
  }
  if (season === 0) parts.push(blossomsWide(r, w, h));
  if (season === 2) parts.push(Array.from({ length: 14 }, () => `<path d="M${r.range(0, w).toFixed(0)} ${r.range(0, h).toFixed(0)} q3 -3 6 0 q-3 3 -6 0Z" fill="#c87a3a" opacity="0.6"/>`).join(''));
  parts.push(`<rect y="${h - 26}" width="${w}" height="26" fill="url(#fadeB${seed})"/><defs><linearGradient id="fadeB${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PAPER}" stop-opacity="0"/><stop offset="1" stop-color="${PAPER}"/></linearGradient></defs>`);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${parts.join('')}</svg>`;
}
function blossomsWide(r, w, h) { return Array.from({ length: 20 }, () => `<circle cx="${r.range(0, w).toFixed(0)}" cy="${r.range(0, h).toFixed(0)}" r="${r.range(1, 2.6).toFixed(1)}" fill="#d98aa0" opacity="0.6"/>`).join(''); }

// ── Portraits that age ─────────────────────────────────────
// p: { seed, g, age, robe, trim, realm, scar }
export function portraitSVG(p) {
  const r = Rng.from(hashSeed('face', p.seed));
  const age = p.age ?? 20;
  const f = p.g === 'f';
  const skin = r.pick(['#e9c9a6', '#dcb48e', '#f0d6b8', '#cfa07a']);
  const robe = p.robe || r.pick(['#3d5a4a', '#4a4560', '#6b4c3a', '#2f4f6b', '#7a3a2e']);
  const trim = p.trim || SEAL;
  const grey = age > 64 ? '#e4e0d8' : age > 50 ? '#8a847c' : '#1d1814';
  const hair = age < 3 ? null : grey;
  const scale = age < 3 ? 0.8 : age < 12 ? 0.9 : 1;
  const eyeY = age < 12 ? 50 : 47;
  const browArc = r.pick([3, 2, 1]);
  const parts = [];
  if (p.realm >= 4) parts.push(`<circle cx="50" cy="50" r="48" fill="none" stroke="#d8a94a" stroke-width="${Math.min(6, p.realm - 2)}" opacity="0.5"/>`);
  parts.push(`<rect width="100" height="100" fill="${p.bg || '#e4d8bf'}"/>`);
  parts.push(`<g transform="translate(50 56) scale(${scale}) translate(-50 -56)">`);
  parts.push(`<path d="M12 104 Q14 76 50 72 Q86 76 88 104Z" fill="${robe}"/><path d="M38 74 L50 92 L62 74" fill="none" stroke="${trim}" stroke-width="5"/>`);
  parts.push(`<rect x="43" y="60" width="14" height="14" fill="${skin}"/>`);
  parts.push(`<ellipse cx="50" cy="${age < 12 ? 50 : 47}" rx="${age < 12 ? 22 : 20}" ry="${age < 12 ? 21 : 23}" fill="${skin}"/>`);
  if (hair) {
    if (f) {
      parts.push(`<path d="M28 46 Q26 20 50 20 Q74 20 72 46 Q68 30 50 29 Q32 30 28 46Z" fill="${hair}"/>`);
      if (age >= 14) parts.push(`<ellipse cx="50" cy="16" rx="11" ry="8" fill="${hair}"/><path d="M38 14 L64 18" stroke="${r.pick(['#d8a94a', SEAL, '#5f8a72'])}" stroke-width="2.2"/>`);
      else parts.push(`<circle cx="32" cy="24" r="7" fill="${hair}"/><circle cx="68" cy="24" r="7" fill="${hair}"/>`);
      if (age >= 14) parts.push(`<path d="M28 44 Q24 64 30 76" fill="none" stroke="${hair}" stroke-width="5"/><path d="M72 44 Q76 64 70 76" fill="none" stroke="${hair}" stroke-width="5"/>`);
    } else {
      parts.push(`<path d="M29 44 Q28 21 50 21 Q72 21 71 44 Q66 30 50 29 Q34 30 29 44Z" fill="${hair}"/>`);
      if (age < 12) parts.push(`<circle cx="50" cy="20" r="6" fill="${hair}"/>`);
      else parts.push(`<ellipse cx="50" cy="17" rx="8" ry="7" fill="${hair}"/><rect x="44" y="19" width="12" height="3" fill="${trim}"/>`);
    }
  }
  const brow = (x, dir) => `<path d="M${x} ${eyeY - 6} q${dir * 5} ${-browArc} ${dir * 10} 0" stroke="${hair || '#8a6a50'}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (age >= 3) parts.push(brow(33, 1), brow(67, -1));
  const eye = age < 3 ? (x) => `<path d="M${x - 3} ${eyeY} q3 2 6 0" stroke="${INK}" stroke-width="1.6" fill="none"/>` : (x) => `<path d="M${x - 4} ${eyeY} q4 -2.6 9 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  parts.push(eye(38), eye(62));
  parts.push(`<path d="M50 ${eyeY + 3} l-2 6 l3 0" stroke="rgba(0,0,0,0.25)" stroke-width="1.4" fill="none"/>`);
  parts.push(`<path d="M45 ${eyeY + 14} Q50 ${eyeY + 16 + r.range(0, 2)} 55 ${eyeY + 14}" stroke="#7a3b2e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  if (age > 40) parts.push(`<path d="M33 ${eyeY + 6} q3 1 5 0 M62 ${eyeY + 6} q3 1 5 0" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>`);
  if (age > 58) parts.push(`<path d="M36 34 q14 -4 28 0" stroke="rgba(0,0,0,0.18)" stroke-width="1" fill="none"/>`);
  if (!f && age > 30 && r.chance(0.6)) parts.push(`<path d="M41 ${eyeY + 17} Q50 ${age > 50 ? eyeY + 38 : eyeY + 28} 59 ${eyeY + 17}" fill="${grey}" opacity="0.9"/>`);
  if (p.scar) parts.push(`<path d="M60 38 l8 14" stroke="#a0505a" stroke-width="1.6"/>`);
  parts.push('</g>');
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${parts.join('')}</svg>`;
}

// ── Seal stamp with English text ───────────────────────────
export function sealSVG(text, size = 56, color = SEAL) {
  const words = String(text).toUpperCase().split(/\s+/);
  const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : words;
  const longest = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(15, 52 / Math.max(3, longest) * 1.45);
  const tx = lines.map((l, i) => `<text x="32" y="${32 + (i - (lines.length - 1) / 2) * (fs + 3) + fs * 0.35}" text-anchor="middle" font-size="${fs.toFixed(1)}" font-family="Georgia, serif" font-weight="700" letter-spacing="0.5" fill="#f6e7cd">${esc(l)}</text>`).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><rect x="3" y="3" width="58" height="58" rx="5" fill="${color}"/><rect x="7" y="7" width="50" height="50" rx="3" fill="none" stroke="#f6e7cd" stroke-width="1.5" opacity="0.85"/>${tx}</svg>`;
}

// The wheel of rebirth (used for regression).
export function wheelSVG(color = '#d8a94a') {
  const spokes = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M50 50 L${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40}" stroke="${color}" stroke-width="3"/>`; }).join('');
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="${color}" stroke-width="5"/><circle cx="50" cy="50" r="10" fill="${color}"/>${spokes}<circle cx="50" cy="50" r="47" fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/></svg>`;
}

// ── Event vignettes (300×150) ──────────────────────────────
export function vignetteSVG(id, season = 0, seed = 1) {
  const r = Rng.from(hashSeed('vig', id, seed));
  const t = SEASON_TINT[season] || SEASON_TINT[0];
  const night = ['night', 'moon', 'prison', 'shrine'].includes(id);
  const parts = [];
  parts.push(sky(night ? '#3a3a4a' : t.top, night ? '#5a5260' : t.bottom));
  const S = {
    flood: () => [mountains(r, 80, 30, 4, INK, 0.15), water(70), house(60, 92, 26, INK, 0.5), house(200, 96, 22, INK, 0.4), figure(120, 86, 1, 'stand'), rainLines(r)],
    night: () => [moon(230, 36), mountains(r, 110, 30, 5, '#1a1520', 0.6), house(70, 128, 40, '#1a1520', 0.8), figure(170, 120, 0.9, 'stand', '#1a1520'), figure(190, 122, 0.9, 'sword', '#1a1520')],
    tournament: () => [mountains(r, 90, 24, 4, INK, 0.12), `<rect x="80" y="100" width="140" height="18" fill="${INK}" opacity="0.5"/>`, figure(130, 100, 1, 'sword'), figure(175, 100, 1, 'sword'), banner(70, 118), banner(232, 118), ...Array.from({ length: 16 }, (_, i) => `<circle cx="${10 + i * 19}" cy="138" r="5" fill="${INK}" opacity="0.35"/>`)],
    fire: () => [mountains(r, 90, 24, 4, INK, 0.15), house(70, 125, 40), house(170, 125, 34), fire(90, 105, 1.4), fire(185, 108, 1.2), smoke(90, 80), smoke(185, 84), figure(130, 135, 0.8, 'sword')],
    city: () => [wall(0, 120, 300, INK, 0.45), pagoda(80, 112, 0.9), house(150, 112, 40), house(210, 112, 34), figure(120, 140, 0.8, 'walk')],
    plague: () => [wall(0, 118, 300, INK, 0.35), house(60, 118, 34), `<rect x="150" y="115" width="40" height="12" fill="${INK}" opacity="0.6"/><circle cx="155" cy="130" r="5" fill="${INK}" opacity="0.6"/><circle cx="185" cy="130" r="5" fill="${INK}" opacity="0.6"/>`, figure(210, 128, 0.9, 'walk'), smoke(80, 100)],
    palace: () => [wall(0, 122, 300, SEAL, 0.4), temple(150, 110, 1.8, INK, 0.6), figure(100, 140, 0.8, 'stand'), figure(200, 140, 0.8, 'stand')],
    estate: () => [mountains(r, 85, 20, 4, INK, 0.12), wall(30, 125, 240, INK, 0.45), house(90, 115, 50), house(170, 115, 40), pine(260, 125, 1.3)],
    demonic: () => [`<rect width="300" height="150" fill="${SEAL}" opacity="0.15"/>`, sharpPeaks(r, 120, 80, 5, INK, 0.6), banner(80, 130, SEAL, 30), banner(220, 130, SEAL, 30), figure(150, 132, 1.1, 'stand')],
    war: () => [mountains(r, 90, 20, 4, INK, 0.15), ...Array.from({ length: 7 }, (_, i) => banner(30 + i * 40, 125, i % 2 ? SEAL : INK, 22)), figure(110, 138, 0.9, 'sword'), figure(170, 138, 0.9, 'fall'), smoke(240, 100)],
    battlefield: () => [ground(120), ...Array.from({ length: 6 }, (_, i) => `<path d="M${40 + i * 45} 130 l${r.range(-10, 10)} -40" stroke="${INK}" stroke-width="1.4" opacity="0.6"/>`), figure(150, 132, 1, 'kneel'), smoke(220, 110)],
    cave: () => [mountains(r, 70, 30, 3, INK, 0.25), `<path d="M100 150 Q100 70 150 70 Q200 70 200 150Z" fill="${INK}" opacity="0.85"/>`, figure(240, 140, 0.8, 'stand'), pine(40, 140, 1.4)],
    mountain: () => [sharpPeaks(r, 120, 90, 4, INK, 0.25), sharpPeaks(r, 140, 60, 6, INK, 0.4), pine(60, 140, 1.2), pine(240, 140, 1.4)],
    temple: () => [mountains(r, 95, 30, 4, INK, 0.15), temple(150, 120, 1.4), pine(60, 132, 1.3), pine(250, 132, 1.3), figure(150, 140, 0.7, 'kneel')],
    river: () => [mountains(r, 85, 25, 4, INK, 0.15), water(105), `<path d="M120 112 q30 8 60 0" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.7"/>`, figure(150, 110, 0.7, 'stand')],
    lake: () => [mountains(r, 80, 25, 4, INK, 0.15), water(100), moon(220, 40, 10), `<path d="M80 110 q25 6 50 0" fill="none" stroke="${INK}" stroke-width="2.4"/>`, figure(100, 108, 0.6, 'sit')],
    forest: () => [...Array.from({ length: 16 }, () => pine(r.range(0, 300), r.range(120, 150), r.range(1.2, 2), INK, r.range(0.3, 0.7))), figure(150, 140, 0.8, 'walk')],
    snow: () => [sharpPeaks(r, 120, 80, 5, '#8a96a0', 0.5), snowDots(r, 60), figure(150, 140, 0.8, 'walk')],
    desert: () => [`<path d="M0 150 L0 120 Q75 100 150 120 T300 115 L300 150Z" fill="#c8a060" opacity="0.4"/>`, sun(230, 40), figure(120, 130, 0.8, 'walk'), figure(140, 132, 0.8, 'walk')],
    wedding: () => [`<rect width="300" height="150" fill="${SEAL}" opacity="0.08"/>`, ...[60, 240].map((x) => `<ellipse cx="${x}" cy="40" rx="10" ry="14" fill="${SEAL}" opacity="0.85"/><path d="M${x} 26v-10" stroke="${INK}"/>`), figure(135, 130, 1, 'stand', SEAL), figure(165, 130, 1, 'stand', INK)],
    grave: () => [mountains(r, 90, 22, 4, INK, 0.12), `<path d="M110 135 Q150 95 190 135Z" fill="${INK}" opacity="0.35"/><rect x="146" y="98" width="8" height="22" fill="${INK}" opacity="0.6"/>`, figure(220, 138, 0.8, 'kneel'), pine(60, 138, 1.3)],
    moon: () => [moon(150, 50, 18), mountains(r, 120, 30, 5, '#1a1520', 0.6), figure(150, 135, 0.8, 'sit', '#1a1520')],
    market: () => [...[40, 120, 200].map((x) => `<path d="M${x} 100 h60 l-8 -16 h-44Z" fill="${SEAL}" opacity="0.6"/><rect x="${x + 4}" y="100" width="52" height="24" fill="${INK}" opacity="0.4"/>`), figure(100, 140, 0.8, 'walk'), figure(180, 140, 0.8, 'stand')],
    inn: () => [house(80, 125, 90, INK, 0.6), `<ellipse cx="60" cy="80" rx="7" ry="10" fill="${SEAL}" opacity="0.8"/>`, `<rect x="180" y="118" width="60" height="5" fill="${INK}" opacity="0.6"/>`, figure(195, 118, 0.7, 'sit'), figure(228, 118, 0.7, 'sit')],
    duel: () => [mountains(r, 95, 30, 4, INK, 0.15), ground(125), figure(110, 128, 1.1, 'sword'), `<g transform="translate(400 0) scale(-1 1)">${figure(210, 128, 1.1, 'sword')}</g>`],
    meditation: () => [mountains(r, 100, 30, 4, INK, 0.12), `<circle cx="150" cy="105" r="30" fill="#d8a94a" opacity="0.2"/>`, figure(150, 128, 1.2, 'sit'), pine(50, 135, 1.4)],
    scroll: () => [`<rect x="60" y="40" width="180" height="80" fill="#f8f2e3" stroke="${INK}" stroke-width="1"/><rect x="52" y="34" width="8" height="92" rx="3" fill="#8a5a2c"/><rect x="240" y="34" width="8" height="92" rx="3" fill="#8a5a2c"/>`, ...Array.from({ length: 6 }, (_, i) => `<path d="M${80 + i * 26} 52 v56" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3" opacity="0.5"/>`)],
    wheel: () => [`<rect width="300" height="150" fill="#1a1512"/>`, `<g transform="translate(100 25) scale(1)">${wheelSVG().replace(/<\/?svg[^>]*>/g, '')}</g>`],
    birth: () => [house(100, 125, 100, INK, 0.5), `<circle cx="150" cy="60" r="16" fill="#f3e3c0" opacity="0.6"/>`, figure(150, 125, 1, 'sit')],
    letter: () => [`<rect x="70" y="30" width="160" height="96" fill="#f8f2e3" stroke="${INK}" stroke-width="1" transform="rotate(-3 150 78)"/>`, ...Array.from({ length: 5 }, (_, i) => `<path d="M90 ${52 + i * 14} h${110 - i * 6}" stroke="${INK}" stroke-width="1.2" opacity="0.45"/>`), `<rect x="190" y="98" width="22" height="22" fill="${SEAL}"/>`],
    road: () => [mountains(r, 90, 30, 4, INK, 0.15), `<path d="M150 150 Q140 120 170 100 T200 70" fill="none" stroke="${INK}" stroke-width="10" opacity="0.15"/>`, figure(160, 128, 0.8, 'walk'), pine(60, 140, 1.4)],
    storm: () => [`<rect width="300" height="150" fill="#3a3a44" opacity="0.4"/>`, `<path d="M180 0 l-20 50 l14 0 l-24 50" fill="none" stroke="#f3e3c0" stroke-width="3"/>`, rainLines(r, 70), mountains(r, 120, 30, 4, INK, 0.4)],
    garden: () => [`<path d="M40 140 q20 -60 50 -70" stroke="${INK}" stroke-width="4" fill="none"/>`, blossoms(r, 40), `<path d="M150 135 q40 -10 80 0" stroke="${INK}" stroke-width="2" fill="none" opacity="0.5"/>`, figure(200, 132, 0.8, 'stand')],
    prison: () => [`<rect width="300" height="150" fill="#1a1520" opacity="0.6"/>`, ...Array.from({ length: 9 }, (_, i) => `<rect x="${40 + i * 26}" y="20" width="5" height="120" fill="${INK}"/>`), figure(150, 135, 0.9, 'kneel', '#5a5260')],
    feast: () => [`<rect x="40" y="110" width="220" height="8" fill="${INK}" opacity="0.6"/>`, ...[70, 110, 150, 190, 230].map((x) => figure(x, 110, 0.7, 'sit')), `<ellipse cx="150" cy="40" rx="8" ry="11" fill="${SEAL}"/>`],
    shrine: () => [moon(240, 30, 10), temple(150, 125, 1, INK, 0.7), `<rect x="100" y="125" width="100" height="4" fill="${INK}" opacity="0.5"/>`, `<ellipse cx="120" cy="100" rx="4" ry="6" fill="#e0a040" opacity="0.9"/>`],
    blossom: () => [`<path d="M20 150 q30 -80 90 -100" stroke="${INK}" stroke-width="5" fill="none"/><path d="M60 100 q30 -10 50 -30" stroke="${INK}" stroke-width="3" fill="none"/>`, blossoms(r, 60), figure(220, 140, 0.8, 'stand')],
    library: () => [...Array.from({ length: 4 }, (_, i) => `<rect x="30" y="${30 + i * 26}" width="240" height="4" fill="${INK}" opacity="0.6"/>${Array.from({ length: 12 }, (_, j) => `<rect x="${36 + j * 19}" y="${12 + i * 26}" width="${r.range(8, 14).toFixed(0)}" height="18" fill="${j % 3 ? '#8a5a2c' : SEAL}" opacity="0.6"/>`).join('')}`), figure(150, 145, 0.7, 'stand')],
    forge: () => [`<rect x="120" y="105" width="60" height="14" fill="${INK}" opacity="0.8"/><rect x="140" y="119" width="20" height="20" fill="${INK}" opacity="0.7"/>`, fire(70, 125, 1.3), ...Array.from({ length: 10 }, () => `<circle cx="${r.range(130, 180).toFixed(0)}" cy="${r.range(70, 100).toFixed(0)}" r="1.4" fill="#e0a040"/>`), figure(200, 135, 1, 'stand')],
    ship: () => [water(105), `<path d="M80 105 h140 l-20 18 h-100Z" fill="${INK}" opacity="0.7"/><path d="M150 105 v-60 l40 50Z" fill="#f8f2e3" stroke="${INK}"/>`, mountains(r, 100, 20, 4, INK, 0.1)],
  };
  const fn = S[id] || S.mountain;
  parts.push(...fn());
  if (season === 3 && !night && id !== 'snow') parts.push(snowDots(r, 25));
  if (season === 0 && !night && id !== 'blossom') parts.push(blossoms(r, 8));
  return `<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${parts.join('')}</svg>`;
}

// ── Icons (24×24, stroke) ──────────────────────────────────
const ICON = {
  activities: '<path d="M4 20 L10 4 L14 14 L17 9 L20 20Z"/>',
  cultivate: '<circle cx="12" cy="12" r="8"/><path d="M12 4a4 4 0 0 1 0 8a4 4 0 0 0 0 8"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="16" r="1"/>',
  bonds: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 20c1-4 4-5 5-5s4 1 5 5M11 20c1-4 4-5 5-5s4 1 5 5"/>',
  world: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  journal: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 5M21 9l-5 5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  train: '<path d="M5 19L19 5M14 5h5v5"/>', meditate: '<circle cx="12" cy="7" r="3"/><path d="M4 19c2-5 14-5 16 0M8 15l-3 4M16 15l3 4"/>',
  seclusion: '<rect x="5" y="4" width="14" height="16" rx="1"/><path d="M15 12h.01"/>', wander: '<path d="M4 20c4-2 4-8 8-10s6-4 8-6"/><circle cx="20" cy="4" r="1.5"/>',
  work: '<rect x="4" y="8" width="16" height="11" rx="1"/><path d="M9 8V5h6v3"/>', study: '<path d="M4 6h7a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H4ZM20 6h-7a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h7Z"/>',
  doctor: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6Z"/>', gamble: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/>',
  tavern: '<path d="M6 4h10v6a5 5 0 0 1-10 0Z"/><path d="M11 15v5M7 20h8"/>', play: '<circle cx="12" cy="12" r="7"/><path d="M5 12h14M12 5c2 2 2 12 0 14"/>',
  shop: '<path d="M4 9h16l-1 11H5Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>', map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2Z"/><path d="M9 4v14M15 6v14"/>',
  sect: '<path d="M3 10 Q12 3 21 10Z"/><rect x="6" y="10" width="12" height="9"/>', career: '<path d="M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1Z"/>',
  scroll: '<rect x="6" y="4" width="12" height="16"/><path d="M4 4h4M16 4h4M4 20h4M16 20h4"/>', heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z"/>',
  sword: '<path d="M4 20l3-3M7 17l10-10 3-3v3l-3 3-10 10M6 14l4 4"/>', save: '<path d="M5 4h11l3 3v13H5Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
};
export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ICON.scroll}</svg>`;
}

// ── Map of the world (for travel) ──────────────────────────
export function mapSVG(locations, here, travel, known = () => true) {
  const pins = Object.entries(locations).map(([id, L]) => {
    const isHere = id === here;
    const dest = travel?.dest === id;
    const k = known(id);
    return `<g class="loc" data-loc="${id}" tabindex="0" role="button" aria-label="${esc(L.name)}${isHere ? ', you are here' : ''}">
      <circle cx="${L.x}" cy="${L.y}" r="${isHere ? 6 : 4.5}" fill="${isHere ? SEAL : dest ? '#d8a94a' : L.type === 'sect' ? '#3d6a8a' : L.type === 'city' ? INK : '#5f8a72'}" stroke="${PAPER}" stroke-width="1.5" opacity="${k ? 1 : 0.6}"/>
      <text x="${L.x + 7}" y="${L.y + 3}" font-size="7.5" font-family="Georgia, serif" fill="${INK}" opacity="${isHere ? 1 : 0.8}">${esc(L.name.replace(/^the /, ''))}</text></g>`;
  }).join('');
  return `<svg class="map-svg" viewBox="0 0 400 300" role="img" aria-label="Map of the world">
    <rect width="400" height="300" fill="#e4d8bf"/>
    <path d="M30 60 C60 20 140 14 200 18 C270 10 340 30 372 56 C392 96 380 150 360 200 C340 250 300 280 240 286 C180 292 110 286 70 254 C34 226 16 180 18 130 C20 100 22 80 30 60Z" fill="#efe6d2" stroke="#7d6f5d" stroke-width="1.5"/>
    <path d="M70 92 C110 70 140 110 180 96 C210 86 214 60 240 64 C262 68 268 100 300 104 C320 106 340 96 358 104" fill="none" stroke="#5f7f8f" stroke-width="2.2" opacity="0.6"/>
    <path d="M60 186 C100 170 130 196 170 190 C210 184 230 200 262 196 C300 192 320 206 362 196" fill="none" stroke="#5f7f8f" stroke-width="2.6" opacity="0.6"/>
    ${travel ? `<path d="M${locations[travel.from]?.x || 0} ${locations[travel.from]?.y || 0} L${locations[travel.dest].x} ${locations[travel.dest].y}" stroke="${SEAL}" stroke-width="1.5" stroke-dasharray="4 3"/>` : ''}
    ${pins}
  </svg>`;
}

// ── Weather on the header canvas: rain, snow, petals, leaves ─
export function startWeather(canvas, getKind, motion) {
  const ctx = canvas.getContext('2d');
  let parts = [];
  let raf = 0;
  const fit = () => { const r = canvas.getBoundingClientRect(); canvas.width = r.width * (window.devicePixelRatio || 1); canvas.height = r.height * (window.devicePixelRatio || 1); };
  fit();
  window.addEventListener('resize', fit);
  const spawn = (kind, w, h, top = false) => ({ kind, x: Math.random() * w, y: top ? -10 : Math.random() * h, v: kind === 'rain' ? 6 + Math.random() * 4 : 0.4 + Math.random() * 0.8, s: 1 + Math.random() * 2, ph: Math.random() * 6 });
  const loop = () => {
    const kind = getKind();
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const want = kind === 'none' ? 0 : kind === 'rain' ? 70 : 34;
    while (parts.length < want) parts.push(spawn(kind, w, h));
    if (parts.length > want) parts.length = want;
    for (const p of parts) {
      if (p.kind !== kind) Object.assign(p, spawn(kind, w, h, true));
      p.y += p.v * (motion() === 'off' ? 0 : 1);
      p.x += kind === 'rain' ? -1.5 : Math.sin(p.y / 30 + p.ph) * 0.6;
      if (p.y > h + 10) Object.assign(p, spawn(kind, w, h, true));
      if (kind === 'rain') { ctx.strokeStyle = 'rgba(42,36,32,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 3, p.y + 10); ctx.stroke(); }
      else { ctx.fillStyle = kind === 'snow' ? 'rgba(255,255,255,0.9)' : kind === 'petals' ? 'rgba(217,138,160,0.75)' : 'rgba(200,122,58,0.7)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.s * 1.6, p.s, p.ph + p.y / 40, 0, Math.PI * 2); ctx.fill(); }
    }
    if (motion() !== 'off') raf = requestAnimationFrame(loop);
  };
  loop();
  return { stop() { cancelAnimationFrame(raf); window.removeEventListener('resize', fit); }, restart() { cancelAnimationFrame(raf); loop(); } };
}

// Qi motes rising around the portrait; density follows realm.
export function startQi(canvas, getRealm, motion) {
  const ctx = canvas.getContext('2d');
  const motes = [];
  let raf = 0;
  const loop = () => {
    const w = (canvas.width = canvas.clientWidth * 2);
    const h = (canvas.height = canvas.clientHeight * 2);
    const want = getRealm() * 5;
    while (motes.length < want) motes.push({ x: Math.random() * w, y: h + Math.random() * h, v: 0.5 + Math.random(), r: 1 + Math.random() * 2.5 });
    motes.length = Math.min(motes.length, want);
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.y -= m.v;
      if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, 'rgba(216,169,74,0.8)');
      g.addColorStop(1, 'rgba(216,169,74,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    if (motion() !== 'off') raf = requestAnimationFrame(loop);
  };
  loop();
  return { stop() { cancelAnimationFrame(raf); } };
}
