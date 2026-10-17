// Shared vocabulary, narrative-voice tokens and realm ladders used by several previews.

export const TERMS = {
  korean: {
    world: 'Murim', jianghu: 'Gangho', senior: 'sahyung', master: 'sabu', cheonma: 'Cheonma',
    Namgung: 'Namgung', Hwasan: 'Hwasan', mugong: 'mugong', name: 'Baek Ryu', rival: 'Namgung Jin',
    qi: 'qi', Sorim: 'Sorim', Mudang: 'Mudang', Gaebang: 'Gaebang', Dang: 'Dang', Paeng: 'Paeng',
    Moyong: 'Moyong', Jegal: 'Jegal', region: 'Jungwon',
  },
  chinese: {
    world: 'Wulin', jianghu: 'Jianghu', senior: 'shixiong', master: 'shifu', cheonma: 'Heavenly Demon',
    Namgung: 'Nangong', Hwasan: 'Huashan', mugong: 'wugong', name: 'Bai Liu', rival: 'Nangong Jin',
    qi: 'qi', Sorim: 'Shaolin', Mudang: 'Wudang', Gaebang: 'Beggars’ Sect', Dang: 'Tang', Paeng: 'Peng',
    Moyong: 'Murong', Jegal: 'Zhuge', region: 'Zhongyuan',
  },
  english: {
    world: 'martial world', jianghu: 'rivers and lakes', senior: 'senior brother', master: 'master',
    cheonma: 'Heavenly Demon', Namgung: 'Namgung', Hwasan: 'Mount Hua', mugong: 'martial arts',
    name: 'Baek Ryu', rival: 'Namgung Jin', qi: 'inner energy', Sorim: 'Shaolin', Mudang: 'Wudang',
    Gaebang: 'Beggars’ Sect', Dang: 'Dang', Paeng: 'Paeng', Moyong: 'Moyong', Jegal: 'Jegal',
    region: 'the Central Plains',
  },
};

export const termsFor = (all) => TERMS[all.tone?.terms] || TERMS.korean;

// {S}/{s} subject, {o} object, {p}/{P} possessive, {was} after {S}, {swas} = subject + was.
export function voiceTokens(voice, name) {
  if (voice === 'first') return { S: 'I', s: 'I', o: 'me', p: 'my', P: 'My', was: 'was', swas: 'I was' };
  if (voice === 'third') {
    return { S: name, s: 'they', o: 'them', p: 'their', P: `${name}’s`, was: 'was', swas: 'they were' };
  }
  return { S: 'You', s: 'you', o: 'you', p: 'your', P: 'Your', was: 'were', swas: 'you were' };
}

export function filler(all, extra = {}) {
  const T = termsFor(all);
  const V = voiceTokens(all.tone?.voice, T.name);
  const dict = { ...T, ...V, ...extra };
  return (tpl) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in dict ? dict[k] : m));
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const numberWord = (n) => WORDS[n] ?? String(n);
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const STEMS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
export function cycleYear(age, birthCycle = 37) {
  const c = (birthCycle + age) % 60;
  return `${STEMS[Math.floor((c % 10) / 2)]} ${ANIMALS[c % 12]}`;
}

export const LADDERS = {
  murim: ['Mortal', 'Third-Rate', 'Second-Rate', 'First-Rate', 'Peak', 'Transcendent', 'Harmony', 'Mystic', 'Life & Death'],
  xianxia: ['Mortal', 'Body Tempering', 'Qi Condensation', 'Foundation', 'Core Formation', 'Nascent Soul', 'Soul Transformation', 'Void Refinement', 'Ascension'],
  simple: ['Untrained', 'Novice', 'Adept', 'Expert', 'Master', 'Grandmaster', 'Sage', 'Saint', 'Legend'],
};
export const ladderFor = (all) => LADDERS[all.cultivation?.ladder] || LADDERS.murim;

// Rough model shared by the cultivation and difficulty previews.
export const BASE_YEARS = [0, 3, 4, 6, 8, 11, 15, 22, 32];
export const LIFE_BONUS = [0, 0, 5, 10, 20, 35, 60, 100, 200];
export function realmAges(speed) {
  const factor = 1.7 - (speed / 100) * 1.35;
  let age = 8;
  return BASE_YEARS.map((y, i) => (i === 0 ? 0 : Math.round((age += y * factor))));
}
export function lifespanAt(all, realm) {
  return all.life?.lifespan === 'mortal' ? 72 + Math.min(18, realm * 2) : 70 + LIFE_BONUS[realm];
}
export function breakthroughOdds(risk, k) {
  return Math.max(5, Math.min(98, Math.round(94 - risk * 0.45 - k * 3.2 * (0.4 + risk / 100))));
}
