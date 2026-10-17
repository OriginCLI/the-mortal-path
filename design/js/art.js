// Code-drawn art: ink-wash backdrop, mountain path map, seals, portraits, qi field.
import { esc, rng, reducedMotion } from './dom.js';

// Layered ink-wash mountains for the page background.
export function backdropSVG() {
  const r = rng(42);
  const layers = [
    { y: 0.42, amp: 0.2, fill: '#1f1914', op: 0.9 },
    { y: 0.56, amp: 0.16, fill: '#1a1511', op: 0.95 },
    { y: 0.7, amp: 0.12, fill: '#14100d', op: 1 },
    { y: 0.84, amp: 0.07, fill: '#100d0b', op: 1 },
  ];
  const W = 1600;
  const H = 900;
  const paths = layers.map((L, li) => {
    let d = `M0 ${H}`;
    const peaks = 7 + li * 2;
    for (let i = 0; i <= peaks * 4; i++) {
      const x = (i / (peaks * 4)) * W;
      const ph = i / 4;
      const peak = Math.abs(Math.sin(ph * Math.PI * 0.5 + li)) * (0.6 + r() * 0.4);
      const y = H * (L.y - L.amp * peak) + r() * 8;
      d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    d += ` L${W} ${H} Z`;
    return `<path d="${d}" fill="${L.fill}" opacity="${L.op}"/>`;
  });
  const mist = [0.5, 0.64, 0.78].map((y, i) =>
    `<rect x="0" y="${H * y - 30}" width="${W}" height="70" fill="url(#mist)" opacity="${0.35 - i * 0.08}"/>`);
  const out = [];
  paths.forEach((p, i) => { out.push(p); if (mist[i]) out.push(mist[i]); });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0d0b0a"/><stop offset="0.6" stop-color="#1b1511"/><stop offset="1" stop-color="#0f0d0c"/>
      </linearGradient>
      <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d9c9a8" stop-opacity="0"/><stop offset="0.5" stop-color="#d9c9a8" stop-opacity="0.12"/><stop offset="1" stop-color="#d9c9a8" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="moon" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#f3e3c0" stop-opacity="0.9"/><stop offset="0.6" stop-color="#e9cf98" stop-opacity="0.25"/><stop offset="1" stop-color="#e9cf98" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="${W * 0.78}" cy="${H * 0.2}" r="140" fill="url(#moon)"/>
    <circle cx="${W * 0.78}" cy="${H * 0.2}" r="38" fill="#efdcb4" opacity="0.75"/>
    ${out.join('')}
  </svg>`;
}

// Points of the winding path up the mountain (index 0 = foot, last = summit).
export function pathPoints(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const y = 600 - t * 530;
    const x = 200 + Math.sin(i * 1.15 + 0.4) * 120 * (1 - t * 0.55);
    pts.push([x, y]);
  }
  return pts;
}

function smoothPath(pts) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

// The trial map: a mountain with a path of stations and the Heavenly Scroll at the summit.
export function pathMapSVG(trials, sealed, currentId) {
  const stations = [...trials.map((t) => ({ id: t.id, hanja: t.hanja, title: t.title, topic: t.topic })),
    { id: 'scroll', hanja: '天', title: 'The Heavenly Scroll', topic: 'Your design spec' }];
  const pts = pathPoints(stations.length);
  const sealedCount = trials.filter((t) => sealed[t.id]).length;
  // Path is lit up to the last consecutive sealed station.
  let lit = 0;
  while (lit < trials.length && sealed[trials[lit].id]) lit++;
  const litPts = pts.slice(0, Math.max(1, lit + 1));

  const nodes = stations.map((s, i) => {
    const [x, y] = pts[i];
    const isScroll = s.id === 'scroll';
    const done = !isScroll && sealed[s.id];
    const cur = s.id === currentId;
    const right = x < 200;
    const lx = right ? x + 30 : x - 30;
    const anchor = right ? 'start' : 'end';
    const label = isScroll ? s.title : `${i + 1}. ${s.title}`;
    const status = isScroll ? (sealedCount === trials.length ? 'ready' : 'awaits') : done ? 'sealed' : 'unsealed';
    return `<g class="station${done ? ' done' : ''}${cur ? ' cur' : ''}${isScroll ? ' summit' : ''}" data-go="${s.id}"
        tabindex="0" role="link" aria-label="${esc(label)}, ${esc(s.topic)}, ${status}">
      ${cur ? `<circle cx="${x}" cy="${y}" r="27" class="halo"/>` : ''}
      <circle cx="${x}" cy="${y}" r="${isScroll ? 22 : 19}" class="disc"/>
      <text x="${x}" y="${y + 6.5}" text-anchor="middle" class="hz">${s.hanja}</text>
      <text x="${lx}" y="${y - 3}" text-anchor="${anchor}" class="lbl">${esc(label)}</text>
      <text x="${lx}" y="${y + 13}" text-anchor="${anchor}" class="sub">${esc(s.topic)}</text>
    </g>`;
  });

  return `<svg class="pathmap" viewBox="0 0 400 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The path of trials up the mountain">
    <defs>
      <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a2f25"/><stop offset="1" stop-color="#16120e"/>
      </linearGradient>
    </defs>
    <path d="M-20 640 L60 420 L110 450 L170 230 L200 40 L235 210 L280 170 L330 380 L370 350 L420 640 Z" fill="url(#mt)" opacity="0.85"/>
    <path d="M200 40 L185 110 L200 95 L214 130 L235 210" fill="none" stroke="#efe4cf" stroke-opacity="0.25" stroke-width="2"/>
    <path d="${smoothPath(pts)}" class="trail"/>
    <path d="${smoothPath(litPts)}" class="trail lit"/>
    ${nodes.join('')}
  </svg>`;
}

// A red seal stamp.
export function sealSVG(text, size = 64, color = '#b8352a') {
  const chars = [...text];
  const fs = chars.length > 2 ? 18 : chars.length === 2 ? 22 : 34;
  const lines = chars.length > 2
    ? [chars.slice(0, Math.ceil(chars.length / 2)).join(''), chars.slice(Math.ceil(chars.length / 2)).join('')]
    : [chars.join('')];
  const tx = lines.map((l, i) =>
    `<text x="32" y="${lines.length === 1 ? 32 + fs * 0.36 : 28 + i * 20}" text-anchor="middle" font-size="${fs}" class="seal-t">${esc(l)}</text>`).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <rect x="3" y="3" width="58" height="58" rx="6" fill="${color}"/>
    <rect x="7" y="7" width="50" height="50" rx="3" fill="none" stroke="#f6e7cd" stroke-width="1.6" opacity="0.85"/>
    ${tx}
  </svg>`;
}

// Simple seeded portrait. `age` greys the hair; `colors` = { skin, robe, trim }.
export function portraitSVG(seed = 3, age = 17, colors = {}) {
  const r = rng(seed);
  const skin = colors.skin || r.pick(['#e7c4a0', '#d9b08a', '#efd3b4', '#c99a74']);
  const robe = colors.robe || '#3d5a4a';
  const trim = colors.trim || '#9c2a1c';
  const hair = age > 55 ? '#d8d4cc' : age > 40 ? '#6b6560' : '#1d1814';
  const eyeY = 46 + r() * 2;
  const brow = r.pick(['M33 41 Q38 38 43 41', 'M33 42 L43 39', 'M33 40 Q38 41 43 40']);
  const brow2 = brow.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (_, x, y) => `${100 - Number(x)} ${y}`);
  const beard = age > 30 && r() < 0.6
    ? `<path d="M40 66 Q50 ${age > 50 ? 86 : 76} 60 66" fill="${hair}" opacity="0.9"/>` : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M14 100 Q16 76 50 72 Q84 76 86 100 Z" fill="${robe}"/>
    <path d="M38 74 L50 92 L62 74" fill="none" stroke="${trim}" stroke-width="5"/>
    <rect x="43" y="58" width="14" height="16" fill="${skin}"/>
    <ellipse cx="50" cy="46" rx="20" ry="23" fill="${skin}"/>
    <path d="M29 44 Q28 20 50 20 Q72 20 71 44 Q66 30 50 29 Q34 30 29 44Z" fill="${hair}"/>
    <ellipse cx="50" cy="16" rx="8" ry="7" fill="${hair}"/>
    <rect x="44" y="18" width="12" height="3" fill="${trim}"/>
    <path d="${brow}" stroke="${hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="${brow2}" stroke="${hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M34 ${eyeY} Q38 ${eyeY - 2.5} 43 ${eyeY}" stroke="#1d1814" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M57 ${eyeY} Q62 ${eyeY - 2.5} 66 ${eyeY}" stroke="#1d1814" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M50 49 L48 56 L51 56" stroke="#00000033" stroke-width="1.5" fill="none"/>
    <path d="M45 61 Q50 ${63 + r() * 2} 55 61" stroke="#7a3b2e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${beard}
  </svg>`;
}

// Drifting qi motes on a full-page canvas. Density follows the designer's realm.
export function startQiField(canvas, getLevel) {
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) return { burst() {} };
  let W = 0;
  let H = 0;
  let dpr = 1;
  const motes = [];
  const bursts = [];
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  };
  resize();
  window.addEventListener('resize', resize);
  const spawn = (y) => ({
    x: Math.random() * W, y: y ?? Math.random() * H, r: (0.6 + Math.random() * 1.8) * dpr,
    vy: -(0.15 + Math.random() * 0.45) * dpr, vx: (Math.random() - 0.5) * 0.2 * dpr,
    a: 0.2 + Math.random() * 0.6, ph: Math.random() * Math.PI * 2,
  });
  const still = reducedMotion();

  const draw = () => {
    const want = 18 + getLevel() * 14;
    while (motes.length < want) motes.push(spawn());
    while (motes.length > want) motes.pop();
    ctx2.clearRect(0, 0, W, H);
    for (const m of motes) {
      if (!still) {
        m.y += m.vy;
        m.x += m.vx + Math.sin((m.y / dpr) * 0.01 + m.ph) * 0.15 * dpr;
        if (m.y < -10) Object.assign(m, spawn(H + 10));
      }
      const g = ctx2.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, `rgba(240, 200, 120, ${m.a})`);
      g.addColorStop(1, 'rgba(240, 200, 120, 0)');
      ctx2.fillStyle = g;
      ctx2.beginPath();
      ctx2.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
      ctx2.fill();
    }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy = p.vy * 0.97 - 0.02 * dpr;
      p.life -= 1;
      ctx2.fillStyle = `rgba(255, ${190 + Math.floor(Math.random() * 50)}, 120, ${Math.max(0, p.life / 90)})`;
      ctx2.beginPath();
      ctx2.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx2.fill();
      if (p.life <= 0) bursts.splice(i, 1);
    }
  };

  let raf = 0;
  const loop = () => {
    draw();
    raf = requestAnimationFrame(loop);
  };
  if (still) {
    draw();
    window.addEventListener('resize', draw);
  } else {
    loop();
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) loop();
    });
  }

  return {
    redraw: draw,
    burst(cx = window.innerWidth / 2, cy = window.innerHeight / 2, n = 160) {
      if (still) return;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (1 + Math.random() * 6) * dpr;
        bursts.push({ x: cx * dpr, y: cy * dpr, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: (1 + Math.random() * 2.2) * dpr, life: 60 + Math.random() * 40 });
      }
    },
  };
}
