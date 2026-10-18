// The murim realm ladder (spec: Murim ranks with Early / Mid / Late sub-stages).
// power: base combat strength. life: lifespan bonus in years. qi: qi gained per meditation at this realm
// (the pace slider was "Measured"). odds: base breakthrough odds out of this realm.
export const REALMS = [
  { name: 'Mortal', power: 10, life: 0, qi: 12, odds: 85, sigil: 'MORTAL' },
  { name: 'Third-Rate', power: 22, life: 0, qi: 8, odds: 80, sigil: 'THIRD' },
  { name: 'Second-Rate', power: 36, life: 4, qi: 5, odds: 72, sigil: 'SECOND' },
  { name: 'First-Rate', power: 55, life: 8, qi: 3, odds: 64, sigil: 'FIRST' },
  { name: 'Peak', power: 80, life: 12, qi: 1.8, odds: 54, sigil: 'PEAK' },
  { name: 'Transcendent', power: 115, life: 18, qi: 1.1, odds: 44, sigil: 'TRANSCENDENT' },
  { name: 'Harmony', power: 160, life: 28, qi: 0.7, odds: 34, sigil: 'HARMONY' },
  { name: 'Mystic', power: 220, life: 42, qi: 0.45, odds: 22, sigil: 'MYSTIC' },
  { name: 'Life and Death', power: 300, life: 70, qi: 0.3, odds: 0, sigil: 'LIFE & DEATH' },
];
export const STAGES = ['Early', 'Mid', 'Late'];
export const MAX_REALM = REALMS.length - 1;
export const BASE_LIFESPAN = 68;

export const realmLabel = (realm, stage) =>
  realm === 0 ? 'Mortal' : `${STAGES[stage]} ${REALMS[realm].name}`;
