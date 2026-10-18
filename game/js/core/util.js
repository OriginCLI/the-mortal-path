// Small shared helpers. No DOM here: core/engine/content must run headless in Node.

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
export const deepClone = (x) => JSON.parse(JSON.stringify(x));

// "name>=3" / "name" style comparisons used by conditions.
const CMP = /^(.*?)(>=|<=|==|!=|>|<)(-?\d+(?:\.\d+)?)$/;
export function parseCmp(str) {
  const m = String(str).match(CMP);
  if (!m) return { key: String(str), op: '>=', val: 1 };
  return { key: m[1].trim(), op: m[2], val: Number(m[3]) };
}
export function compare(a, op, b) {
  switch (op) {
    case '>=': return a >= b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '<': return a < b;
    case '==': return a === b;
    case '!=': return a !== b;
    default: return false;
  }
}
// Compare a value with "'>=30'", "30" (means >=), or [min, max].
export function test(value, spec) {
  if (Array.isArray(spec)) return value >= spec[0] && value <= (spec[1] ?? Infinity);
  if (typeof spec === 'number') return value >= spec;
  const m = String(spec).match(/^(>=|<=|==|!=|>|<)?\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return false;
  return compare(value, m[1] || '>=', Number(m[2]));
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const numberWord = (n) => WORDS[n] ?? String(n);
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export function plural(n, one, many = `${one}s`) { return `${n} ${n === 1 ? one : many}`; }
