// Text templating: "[a|b|c]" picks a variant, "{token}" asks a resolver.
// A capitalised token ("{Master}") falls back to the lower-case token and capitalises the result.
import { cap } from './util.js';

export function fillText(str, resolve, rng) {
  if (!str) return '';
  let out = String(str);
  // Variants first (non-nested). Use the game RNG so text is reproducible.
  out = out.replace(/\[([^\[\]]*\|[^\[\]]*)\]/g, (_, body) => {
    const opts = body.split('|');
    return opts[Math.floor((rng ? rng.next() : Math.random()) * opts.length)];
  });
  out = out.replace(/\{(@?[A-Za-z_$][\w.$-]*)\}/g, (m, key) => {
    let v = resolve(key);
    if (v == null && /^[A-Z]/.test(key)) {
      const low = key[0].toLowerCase() + key.slice(1);
      v = resolve(low);
      if (v != null) v = cap(String(v));
    }
    return v == null ? m : String(v);
  });
  return out;
}

// Pronoun sets for NPCs (the player is always "you").
export const PRONOUNS = {
  m: { he: 'he', him: 'him', his: 'his', himself: 'himself', man: 'man', son: 'son', boy: 'boy', brother: 'brother', master: 'master', sir: 'sir', husband: 'husband', father: 'father' },
  f: { he: 'she', him: 'her', his: 'her', himself: 'herself', man: 'woman', son: 'daughter', boy: 'girl', brother: 'sister', master: 'mistress', sir: 'madam', husband: 'wife', father: 'mother' },
};

export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const STEMS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

// World year 1 is the year the player is born, in every loop. Year 1 is a Fire Horse year.
export function cycleName(worldYear) {
  const c = (41 + worldYear) % 60;
  return `${STEMS[Math.floor((c % 10) / 2)]} ${ANIMALS[c % 12]}`;
}
