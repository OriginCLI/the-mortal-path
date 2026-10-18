// Authoring helpers so events stay compact and consistent.
//   E(id, cat, props)                 an event
//   O(text, fx)                       an outcome: text plus effects
//   C(label, outcome, extra)          a plain choice
//   R(label, stat, dc, ok, no, extra) a choice decided by a stat roll (hinted odds)
//   P(label, p, ok, no, extra)        a choice decided by plain chance
//   M(label, memoryId, outcome, extra) a choice only shown if you remember something (from a past life)
//   Q(label, requirement, outcome, extra) a choice that needs something (shown locked otherwise)
//   L(id, cat, if, text, fx, extra)   a log-only beat (no choice)
export const E = (id, cat, props) => ({ id, cat, ...props });
export const O = (text, fx = {}) => ({ text, ...fx });
export const C = (t, r, extra = {}) => ({ t, r, ...extra });
export const R = (t, stat, dc, ok, no, extra = {}) => ({ t, roll: { stat, dc }, ok, no, ...extra });
export const P = (t, p, ok, no, extra = {}) => ({ t, p, ok, no, ...extra });
export const M = (t, mem, r, extra = {}) => ({ t, show: { mem, ...(extra.show || {}) }, r, ...omit(extra, 'show') });
export const Q = (t, req, r, extra = {}) => ({ t, req, r, ...extra });
export const L = (id, cat, cond, text, fx = {}, extra = {}) => ({ id, cat, if: cond, text, fx, ...extra });

function omit(o, k) { const c = { ...o }; delete c[k]; return c; }

// Common condition fragments.
export const LATER = { meta: { loop: '>=2' } };          // a later life
export const ROOTS = { origin: 'peasant', loc: 'willow' }; // home village childhood
