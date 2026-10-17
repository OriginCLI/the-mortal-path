// Answer defaults, validation and persistence (localStorage, guarded).
import { TRIALS } from './trials.js';

const KEY = 'mortal-path.design.v1';
export const STATE_VERSION = 1;

export function defaultAnswers(trial) {
  const a = { notes: '' };
  for (const q of trial.questions) a[q.id] = structuredClone(q.default);
  return a;
}

export function freshState() {
  const answers = {};
  for (const t of TRIALS) answers[t.id] = defaultAnswers(t);
  return { version: STATE_VERSION, answers, sealed: {}, settings: { sound: true, volume: 0.7 } };
}

// Coerce a possibly stale or hand-edited value into something valid for this question.
export function sanitize(q, v) {
  switch (q.type) {
    case 'cards': {
      const ids = new Set(q.options.map((o) => o.id));
      if (q.multi) {
        if (!Array.isArray(v)) return structuredClone(q.default);
        return [...new Set(v.filter((x) => ids.has(x)))];
      }
      return ids.has(v) ? v : q.default;
    }
    case 'slider': {
      const n = Number(v);
      if (!Number.isFinite(n)) return q.default;
      return Math.min(q.max, Math.max(q.min, n));
    }
    case 'rank': {
      const ids = q.items.map((i) => i.id);
      if (!Array.isArray(v)) return [...q.default];
      const kept = v.filter((x, i) => ids.includes(x) && v.indexOf(x) === i);
      return [...kept, ...q.default.filter((x) => !kept.includes(x))];
    }
    case 'text':
      return typeof v === 'string' ? v.slice(0, 200) : q.default;
    default:
      return v;
  }
}

// Merge arbitrary saved/imported data onto fresh defaults.
export function hydrate(raw) {
  const s = freshState();
  if (!raw || typeof raw !== 'object') return s;
  for (const t of TRIALS) {
    const src = raw.answers && raw.answers[t.id];
    if (src && typeof src === 'object') {
      for (const q of t.questions) if (q.id in src) s.answers[t.id][q.id] = sanitize(q, src[q.id]);
      if (typeof src.notes === 'string') s.answers[t.id].notes = src.notes.slice(0, 4000);
    }
    if (raw.sealed && raw.sealed[t.id]) s.sealed[t.id] = true;
  }
  if (raw.settings && typeof raw.settings === 'object') {
    if (typeof raw.settings.sound === 'boolean') s.settings.sound = raw.settings.sound;
    const vol = Number(raw.settings.volume);
    if (Number.isFinite(vol)) s.settings.volume = Math.min(1, Math.max(0, vol));
  }
  return s;
}

export function load() {
  try {
    const txt = localStorage.getItem(KEY);
    return hydrate(txt ? JSON.parse(txt) : null);
  } catch {
    return freshState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSaved() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
