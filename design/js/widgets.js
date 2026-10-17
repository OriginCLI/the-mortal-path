// Input widgets: cards, sliders, rankings, text, notes.
import { h } from './dom.js';

export function describeSlider(q, v) {
  if (q.unit) return `${v} ${q.unit}`;
  if (q.stops) {
    const t = (v - q.min) / (q.max - q.min);
    return q.stops[Math.min(q.stops.length - 1, Math.round(t * (q.stops.length - 1)))];
  }
  return `${v}`;
}

export function renderQuestion(q, value, onChange) {
  const body = {
    cards: renderCards, slider: renderSlider, rank: renderRank, text: renderText,
  }[q.type](q, value, onChange);
  return h('section', { class: `q q-${q.type}`, 'data-q': q.id },
    h('div', { class: 'q-head' },
      h('h3', { id: `lbl-${q.id}` }, q.label),
      q.type === 'cards' && q.multi ? h('span', { class: 'q-hint' }, 'choose any') : null,
      q.type === 'rank' ? h('span', { class: 'q-hint' }, 'drag or use arrows') : null),
    q.help ? h('p', { class: 'q-help' }, q.help) : null,
    body);
}

function renderCards(q, value, onChange) {
  const grid = h('div', {
    class: `cards${q.swatches ? ' cards-swatch' : ''}`,
    role: q.multi ? 'group' : 'radiogroup',
    'aria-labelledby': `lbl-${q.id}`,
  });
  let cur = q.multi ? [...value] : value;
  const sync = () => {
    for (const btn of grid.children) {
      const on = q.multi ? cur.includes(btn.dataset.id) : cur === btn.dataset.id;
      btn.classList.toggle('on', on);
      btn.setAttribute(q.multi ? 'aria-pressed' : 'aria-checked', String(on));
    }
  };
  for (const o of q.options) {
    const btn = h('button', {
      type: 'button', class: 'card', 'data-id': o.id, role: q.multi ? null : 'radio',
      onclick: () => {
        if (q.multi) cur = cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id];
        else cur = o.id;
        sync();
        onChange(q.multi ? [...cur] : cur);
      },
    },
    o.colors
      ? h('span', { class: 'swatch', 'aria-hidden': 'true' }, o.colors.map((c) => h('i', { style: `background:${c}` })))
      : h('span', { class: 'glyph', 'aria-hidden': 'true' }, o.glyph || '·'),
    h('span', { class: 'card-text' },
      h('strong', {}, o.label),
      o.desc ? h('small', {}, o.desc) : null),
    h('span', { class: 'tick', 'aria-hidden': 'true' }));
    grid.append(btn);
  }
  sync();
  return grid;
}

function renderSlider(q, value, onChange) {
  const out = h('output', { class: 'slider-val' }, describeSlider(q, value));
  const input = h('input', {
    type: 'range', min: q.min, max: q.max, step: q.step || 1, value,
    'aria-labelledby': `lbl-${q.id}`,
    oninput: (e) => {
      const v = Number(e.target.value);
      out.textContent = describeSlider(q, v);
      paint(v);
      onChange(v);
    },
  });
  const paint = (v) => input.style.setProperty('--fill', `${((v - q.min) / (q.max - q.min)) * 100}%`);
  paint(value);
  return h('div', { class: 'slider' },
    h('div', { class: 'slider-row' }, input, out),
    h('div', { class: 'slider-ends', 'aria-hidden': 'true' }, h('span', {}, q.left), h('span', {}, q.right)));
}

function renderRank(q, value, onChange) {
  let order = [...value];
  const byId = Object.fromEntries(q.items.map((i) => [i.id, i]));
  const list = h('ol', { class: 'rank', 'aria-labelledby': `lbl-${q.id}` });
  let dragFrom = null;

  const move = (from, to) => {
    if (to < 0 || to >= order.length || from === to) return;
    const [x] = order.splice(from, 1);
    order.splice(to, 0, x);
    draw(to);
    onChange([...order]);
  };

  const draw = (focusIdx = null) => {
    list.replaceChildren(...order.map((id, i) => {
      const it = byId[id];
      const li = h('li', {
        draggable: 'true', 'data-i': i,
        ondragstart: (e) => { dragFrom = i; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); },
        ondragend: () => { li.classList.remove('dragging'); dragFrom = null; },
        ondragover: (e) => { e.preventDefault(); li.classList.add('over'); },
        ondragleave: () => li.classList.remove('over'),
        ondrop: (e) => { e.preventDefault(); li.classList.remove('over'); if (dragFrom != null) move(dragFrom, i); },
      },
      h('span', { class: 'rank-n' }, i + 1),
      h('span', { class: 'rank-text' }, h('strong', {}, it.label), it.desc ? h('small', {}, it.desc) : null),
      h('span', { class: 'rank-btns' },
        h('button', { type: 'button', class: 'mini', 'aria-label': `Move ${it.label} up`, disabled: i === 0 ? true : null, onclick: () => move(i, i - 1), 'data-dir': 'up' }, '▲'),
        h('button', { type: 'button', class: 'mini', 'aria-label': `Move ${it.label} down`, disabled: i === order.length - 1 ? true : null, onclick: () => move(i, i + 1), 'data-dir': 'down' }, '▼')));
      return li;
    }));
    if (focusIdx != null) {
      const btn = list.children[focusIdx]?.querySelector('button:not([disabled])');
      btn?.focus();
    }
  };
  draw();
  return list;
}

function renderText(q, value, onChange) {
  return h('input', {
    type: 'text', class: 'text-in', value, placeholder: q.placeholder || '', maxlength: 200,
    'aria-labelledby': `lbl-${q.id}`,
    oninput: (e) => onChange(e.target.value),
  });
}

export function renderNotes(value, onChange) {
  const ta = h('textarea', {
    rows: 4, maxlength: 4000, placeholder: 'Anything the cards don’t capture: references, examples, hard nos…',
    'aria-label': 'Notes for this trial',
    oninput: (e) => onChange(e.target.value),
  });
  ta.value = value;
  return h('section', { class: 'q q-notes' },
    h('div', { class: 'q-head' }, h('h3', {}, 'Notes for the master'), h('span', { class: 'q-hint' }, 'optional')),
    ta);
}
