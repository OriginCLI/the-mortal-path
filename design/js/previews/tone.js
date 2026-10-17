// Tone preview: three sample life-log entries rewritten live from the chosen voice, mood, density,
// humor, terminology, log format and rating.
import { h } from '../dom.js';
import { filler, numberWord, ordinal, cycleYear, termsFor } from './lore.js';

// Each event: per mood level (0 grim, 1 bittersweet, 2 hopeful) a core line, a detail, a flourish.
// A string may be { teen, mature }.
const EVENTS = [
  {
    age: 6,
    core: [
      'A filthy beggar seized {p} wrist in the market square and pressed his thumb into the bone until {s} cried out.',
      'An old beggar caught {p} wrist in the market and went very still, as if listening to something inside the bone.',
      'A cheerful old beggar tugged {p} sleeve in the market, peered at {p} hands, and broke into a gap-toothed grin.',
    ],
    detail: [
      '“Wasted,” he muttered. “Wasted on a farmer’s brat who will die in a ditch.” He spat and was gone.',
      '“A pity,” he said softly. “Such meridians, and no one to open them.” He pressed a cold copper coin into {p} palm and limped away.',
      '“Ho! Bones like a young dragon,” he crowed. “Eat well, little one. Heaven has plans.” He shared his steamed bun before he left.',
    ],
    flourish: [
      'The bruise lasted a month, a ring the color of a rotten plum, and the village dogs would not come near {o} after.',
      'For years afterward {s} kept the coin beneath {p} pillow, turning it in the dark, wondering what door it was meant to open.',
      'Long after he vanished into the crowd, {s} felt a faint warmth below the navel, like a coal someone had breathed upon.',
    ],
    aside: '(He also stole {p} other shoe. Masters of the {world} are like that.)',
  },
  {
    age: 19,
    core: [
      'At the Red Lantern Inn, a young master of the {Namgung} family kicked {p} table over because {s} had not stood when he entered.',
      'At the Red Lantern Inn, a young master of the {Namgung} family took {p} seat by the window and dared {o} to object.',
      'At the Red Lantern Inn, a young master of the {Namgung} family demanded {p} table, and {s} offered it with a bow so deep it was almost mockery.',
    ],
    detail: [
      'His guards broke two of {p} fingers to teach the lesson properly. No one in the room looked up from their wine.',
      '{S} swallowed the insult, paid for a tea that went untouched, and left with the whole room’s laughter at {p} back.',
      'The innkeeper’s daughter slipped {o} a free dumpling. “He does that to everyone,” she whispered. “Nobody ever bowed back so prettily.”',
    ],
    flourish: [
      'The fingers healed crooked. Every time {s} gripped a sword after that, they ached with the memory of his smile.',
      'On the road home the rain came down in silver threads, and {s} made a promise to the grey sky that could not yet be kept.',
      '{S} walked out into the spring evening laughing, the young master’s glare warm on {p} back like sunlight.',
    ],
    aside: 'The young master later slipped on spilled soup in front of everyone. Heaven, it seemed, had been watching.',
  },
  {
    age: 34,
    death: true,
    core: [
      { teen: 'The {cheonma}’s vanguard came over the walls of {Hwasan} at midnight. {S} died on the third step of the main hall with a spear through the chest.',
        mature: 'The {cheonma}’s vanguard came over the walls of {Hwasan} at midnight. {S} died on the third step of the main hall, a spear through the lung, drowning in {p} own blood.' },
      'When the {cheonma}’s army broke the gates of {Hwasan}, {s} held the third step of the main hall until the spear found {o}.',
      'When the {cheonma}’s army broke the gates of {Hwasan}, {s} fell defending the main hall, but only after buying the younger disciples time to flee.',
    ],
    detail: [
      { teen: 'The last thing {s} saw was {p} {senior} falling, still reaching for a sword that was no longer there.',
        mature: 'The last thing {s} saw was {p} {senior}’s head rolling down the steps like a dropped melon.' },
      'It did not hurt as much as {s} had feared. It mostly felt like being very, very tired.',
      'Somewhere beyond the smoke, {s} knew, they were still running. That was enough.',
    ],
    flourish: [
      'Then darkness, and then, impossibly, the smell of {p} mother’s millet porridge. {S} {was} {back}, and every scream was still ringing in {p} ears.',
      '{S} closed {p} eyes on a burning sky and opened them on a thatched ceiling: small hands, {back}, a morning that had already happened once. {S} remembered everything.',
      'And then birdsong. A thatched roof. {P} mother calling {o} to breakfast. {S} {was} {back}. Heaven had turned the wheel back, and this time {s} knew what was coming.',
    ],
    aside: '{P} first thought on waking was not of vengeance, but that {s} would have to learn to read all over again.',
  },
];

const pickRating = (x, rating) => (typeof x === 'string' ? x : x[rating] || x.teen);

export function tonePreview(a, all) {
  const level = a.mood < 30 ? 0 : a.mood < 70 ? 1 : 2;
  const returnAge = all.regression?.returnAge ?? 6;
  const back = returnAge <= 1 ? 'an infant again' : `${numberWord(returnAge)} years old again`;
  const fill = filler(all, { back });
  const asideCount = a.humor < 34 ? 0 : a.humor < 67 ? 1 : 3;
  const asideOrder = [1, 0, 2];
  const T = termsFor(all);

  const entries = EVENTS.map((ev, i) => {
    const parts = [pickRating(ev.core[level], a.rating)];
    if (a.density !== 'terse') parts.push(pickRating(ev.detail[level], a.rating));
    if (a.density === 'ornate') parts.push(pickRating(ev.flourish[level], a.rating));
    else if (ev.death) parts.push(pickRating(ev.flourish[level], a.rating).split('. ').slice(-2).join('. '));
    if (asideOrder.slice(0, asideCount).includes(i)) parts.push(ev.aside);
    const text = fill(parts.join(' '));
    const ageLabel = ev.death ? `Age ${ev.age} → ${returnAge}` : `Age ${ev.age}`;
    if (a.logFormat === 'ages') {
      return h('p', { class: `log-line${ev.death ? ' death' : ''}` }, h('b', {}, `${ageLabel}: `), text);
    }
    if (a.logFormat === 'chronicle') {
      return h('div', { class: `log-chron${ev.death ? ' death' : ''}` },
        h('div', { class: 'log-year' }, `Year of the ${cycleYear(ev.age)} · ${ordinal(ev.age)} year`),
        h('p', {}, text));
    }
    return h('div', { class: `log-para${ev.death ? ' death' : ''}` },
      h('div', { class: 'log-year' }, ev.death ? `Year ${ev.age}, and again` : `Year ${ev.age}`),
      h('p', {}, text));
  });

  const moodName = ['Grim', 'Bittersweet', 'Hopeful'][level];
  return h('div', { class: 'pv pv-tone' },
    h('div', { class: 'pv-chips' },
      chip(moodName), chip(a.density), chip({ second: '2nd person', first: '1st person', third: '3rd person' }[a.voice]),
      chip(`${a.rating === 'mature' ? 'Mature' : 'Teen'}`), asideCount ? chip('asides') : null),
    h('div', { class: `paper log fmt-${a.logFormat}` }, entries),
    h('div', { class: 'pv-sub' }, 'Vocabulary in use'),
    h('div', { class: 'pv-chips' },
      [T.world, T.jianghu, T.senior, T.master, T.cheonma, T.Hwasan, T.mugong].map((t) => chip(t, 'term'))),
    a.tropes.length ? h('div', { class: 'pv-sub' }, `${a.tropes.length} tropes in play`) : null);
}

export function chip(text, cls = '') {
  return h('span', { class: `chip ${cls}` }, text);
}
