// Seeded, serializable PRNG (mulberry32). The state lives in a plain object ({ s }) inside the save,
// so a life can be saved and resumed mid-season with identical results.

export function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const str = String(p);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    h ^= 0x9e3779b9;
  }
  return h >>> 0;
}

export class Rng {
  constructor(holder) {
    this.h = holder; // { s: uint32 }
  }

  static from(seed) {
    return new Rng({ s: seed >>> 0 });
  }

  next() {
    this.h.s = (this.h.s + 0x6d2b79f5) >>> 0;
    let t = this.h.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  chance(p) { return this.next() < p; }
  range(lo, hi) { return lo + this.next() * (hi - lo); }
  int(lo, hi) { return Math.floor(lo + this.next() * (hi - lo + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }

  // Weighted pick: items with a numeric weight, or a weight function.
  weighted(items, w = (x) => x.w) {
    let total = 0;
    for (const it of items) total += Math.max(0, w(it));
    if (total <= 0) return undefined;
    let r = this.next() * total;
    for (const it of items) {
      r -= Math.max(0, w(it));
      if (r < 0) return it;
    }
    return items[items.length - 1];
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
