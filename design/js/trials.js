// The twelve design trials, expressed purely as data.
// Question types: cards (single or multi), slider, rank, text. Every trial also gets a free-text notes field.
// Defaults are pre-filled from the original game brief.

// Realms the designer climbs by sealing trials (threshold = trials sealed).
export const REALMS = [
  { at: 0, en: 'Mortal', ko: '필부', hanja: '凡人', blurb: 'An ordinary soul at the foot of the mountain.' },
  { at: 1, en: 'Third-Rate Warrior', ko: '삼류', hanja: '三流', blurb: 'Qi stirs in the dantian for the first time.' },
  { at: 2, en: 'Second-Rate Warrior', ko: '이류', hanja: '二流', blurb: 'Your stance is firm; the basics are yours.' },
  { at: 4, en: 'First-Rate Master', ko: '일류', hanja: '一流', blurb: 'Your sword draws the eye of the sects.' },
  { at: 6, en: 'Peak Realm', ko: '절정', hanja: '絶頂', blurb: 'Sword qi leaves the blade. Few stand here.' },
  { at: 8, en: 'Transcendent Realm', ko: '초절정', hanja: '超絶頂', blurb: 'You move before intention forms.' },
  { at: 10, en: 'Harmony Realm', ko: '화경', hanja: '化境', blurb: 'Body and qi are one; age loosens its grip.' },
  { at: 11, en: 'Mystic Realm', ko: '현경', hanja: '玄境', blurb: 'You glimpse the shape of Heaven itself.' },
  { at: 12, en: 'Realm of Life and Death', ko: '생사경', hanja: '生死境', blurb: 'Life and death are a door you may walk through. The Scroll opens.' },
];

export function realmFor(sealedCount) {
  let idx = 0;
  REALMS.forEach((r, i) => { if (sealedCount >= r.at) idx = i; });
  const cur = REALMS[idx];
  const next = REALMS[idx + 1];
  const progress = next ? (sealedCount - cur.at) / (next.at - cur.at) : 1;
  return { idx, cur, next, progress };
}

export const TRIALS = [
  // 1 ─────────────────────────────────────────────────────────────
  {
    id: 'tone', hanja: '筆', title: 'The Brush and the Ink', topic: 'Tone & Writing Style',
    master: 'Before a sword is drawn, a story is told. Tell me how yours should sound, and I will read it back to you.',
    questions: [
      {
        id: 'voice', type: 'cards', label: 'Narrative voice', help: 'Who narrates each year of the life log?',
        options: [
          { id: 'second', glyph: '汝', label: 'Second person', desc: '"You were born under a falling star."' },
          { id: 'first', glyph: '我', label: 'First person', desc: '"I was born under a falling star." (BitLife style)' },
          { id: 'third', glyph: '彼', label: 'Third person', desc: '"Baek Ryu was born under a falling star."' },
        ],
        default: 'second',
      },
      {
        id: 'mood', type: 'slider', label: 'Mood', help: 'How cruel is the world on the page?',
        min: 0, max: 100, default: 40, left: 'Grim & brutal', right: 'Hopeful & warm',
        stops: ['Merciless', 'Grim', 'Bittersweet', 'Warm', 'Hopeful'],
      },
      {
        id: 'density', type: 'cards', label: 'Prose density', help: 'How much is written per event.',
        options: [
          { id: 'terse', glyph: '簡', label: 'Terse', desc: 'One sharp line per beat. Fast to read, BitLife-like.' },
          { id: 'standard', glyph: '中', label: 'Standard', desc: 'Two or three sentences with one vivid detail.' },
          { id: 'ornate', glyph: '華', label: 'Ornate', desc: 'Lyrical, novel-like passages with imagery.' },
        ],
        default: 'standard',
      },
      {
        id: 'humor', type: 'slider', label: 'Humor', help: 'Murim novels love a deadpan aside.',
        min: 0, max: 100, default: 40, left: 'Deadly serious', right: 'Comedic',
        stops: ['Solemn', 'Dry', 'Wry asides', 'Playful', 'Slapstick'],
      },
      {
        id: 'terms', type: 'cards', label: 'Terminology', help: 'Which vocabulary the world speaks in.',
        options: [
          { id: 'korean', glyph: '韓', label: 'Korean murim', desc: 'Murim, Gangho, sahyung, sabu, Cheonma, Hwasan, Namgung.' },
          { id: 'chinese', glyph: '中', label: 'Chinese wuxia', desc: 'Wulin, Jianghu, shixiong, shifu, Huashan, Nangong.' },
          { id: 'english', glyph: '英', label: 'Translated English', desc: 'Martial world, senior brother, master, Mount Hua.' },
        ],
        default: 'korean',
      },
      {
        id: 'logFormat', type: 'cards', label: 'Life log format',
        options: [
          { id: 'ages', glyph: '歲', label: 'Age-stamped lines', desc: '"Age 6: …" Classic BitLife scroll.' },
          { id: 'paragraphs', glyph: '段', label: 'Year paragraphs', desc: 'A small heading per year, then prose.' },
          { id: 'chronicle', glyph: '史', label: 'Chronicle', desc: 'Year names from the sixty-year cycle, like a historian’s record.' },
        ],
        default: 'ages',
      },
      {
        id: 'rating', type: 'cards', label: 'Content rating',
        options: [
          { id: 'teen', glyph: '十', label: 'Teen', desc: 'Violence is sharp but not lingering. Romance fades to black.' },
          { id: 'mature', glyph: '血', label: 'Mature', desc: 'Blood, cruelty and consequence on the page.' },
        ],
        default: 'teen',
      },
      {
        id: 'tropes', type: 'cards', multi: true, label: 'Genre tropes to lean into',
        options: [
          { id: 'youngMasters', glyph: '傲', label: 'Arrogant young masters', desc: 'Face-slapping is a sacred tradition.' },
          { id: 'hiddenExperts', glyph: '隱', label: 'Hidden experts', desc: 'The sweeping monk, the drunk beggar.' },
          { id: 'fortune', glyph: '緣', label: 'Fortuitous encounters', desc: 'Cliffs, caves, dying masters, secret manuals.' },
          { id: 'face', glyph: '面', label: 'Face & honor', desc: 'Insults demand answers.' },
          { id: 'revenge', glyph: '仇', label: 'Revenge', desc: 'Blood debts paid across lifetimes.' },
          { id: 'hypocrisy', glyph: '僞', label: 'Hypocritical orthodoxy', desc: 'The righteous are not always right.' },
          { id: 'tournament', glyph: '武', label: 'Tournament arcs', desc: 'The Martial Assembly every few years.' },
          { id: 'returnee', glyph: '回', label: 'Regressor knowingness', desc: 'Smug foreknowledge, quiet dread.' },
        ],
        default: ['youngMasters', 'hiddenExperts', 'fortune', 'face', 'revenge', 'hypocrisy', 'tournament', 'returnee'],
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank what the writing should deliver',
        items: [
          { id: 'weight', label: 'Emotional weight', desc: 'Deaths and partings that hurt.' },
          { id: 'mystery', label: 'Mystery & foreshadowing', desc: 'Clues that pay off in later lives.' },
          { id: 'spectacle', label: 'Martial spectacle', desc: 'Techniques that sound incredible.' },
          { id: 'readability', label: 'Brevity & readability', desc: 'Scannable at a glance.' },
          { id: 'wit', label: 'Wit', desc: 'Lines worth screenshotting.' },
        ],
        default: ['weight', 'mystery', 'readability', 'spectacle', 'wit'],
      },
    ],
  },

  // 2 ─────────────────────────────────────────────────────────────
  {
    id: 'setting', hanja: '圖', title: 'Map of the Gangho', topic: 'Setting & Factions',
    master: 'The rivers and lakes are wide, and every shore belongs to someone. Draw me the world you wish to wander.',
    questions: [
      {
        id: 'basis', type: 'cards', label: 'World basis',
        options: [
          { id: 'koreanMurim', glyph: '武', label: 'Korean murim conventions', desc: 'Central Plains setting seen through Korean web-novel tropes (Return of the Mount Hua Sect, Legend of the Northern Blade).' },
          { id: 'classicWuxia', glyph: '俠', label: 'Classic wuxia', desc: 'Jin Yong-style Jianghu with historical texture.' },
          { id: 'original', glyph: '新', label: 'Original world', desc: 'Murim-inspired, but with invented geography and history.' },
        ],
        default: 'koreanMurim',
      },
      {
        id: 'factions', type: 'cards', multi: true, label: 'Factions that exist',
        help: 'Pick everyone who has a seat at the table.',
        options: [
          { id: 'orthodox', glyph: '正', label: 'Orthodox sects', desc: 'Nine Great Sects & the Murim Alliance: Shaolin, Wudang, Mount Hua, Emei, Kunlun, the Beggars…' },
          { id: 'families', glyph: '家', label: 'Five Great Families', desc: 'Namgung, Moyong, Paeng, Dang, Jegal: wealth, bloodline arts, politics.' },
          { id: 'unorthodox', glyph: '邪', label: 'Unorthodox factions', desc: 'Black Path, Green Forest bandits, Water Fortresses, assassins.' },
          { id: 'cult', glyph: '魔', label: 'Demonic Cult', desc: 'The Heavenly Demon Divine Cult beyond the western mountains.' },
          { id: 'court', glyph: '皇', label: 'Imperial Court', desc: 'Eunuch spies, generals, and laws the murim ignores at its peril.' },
          { id: 'merchants', glyph: '商', label: 'Merchant guilds', desc: 'Escort agencies, information guilds, money that buys swords.' },
          { id: 'frontier', glyph: '塞', label: 'Frontier powers', desc: 'Northern Sea Ice Palace, Southern Barbarian Wild Palace, Tibetan Palace.' },
        ],
        default: ['orthodox', 'families', 'unorthodox', 'cult', 'court', 'merchants'],
      },
      {
        id: 'importance', type: 'rank', label: 'Rank factions by narrative importance',
        help: 'Top factions get more events, characters and map space.',
        items: [
          { id: 'orthodox', label: 'Orthodox sects' },
          { id: 'cult', label: 'Demonic Cult' },
          { id: 'families', label: 'Five Great Families' },
          { id: 'unorthodox', label: 'Unorthodox factions' },
          { id: 'court', label: 'Imperial Court' },
          { id: 'merchants', label: 'Merchant guilds' },
          { id: 'frontier', label: 'Frontier powers' },
        ],
        default: ['orthodox', 'cult', 'families', 'unorthodox', 'court', 'merchants', 'frontier'],
      },
      {
        id: 'morality', type: 'slider', label: 'Moral complexity',
        min: 0, max: 100, default: 70, left: 'Clear good vs. evil', right: 'Everyone is gray',
        stops: ['Black & white', 'Mostly clear', 'Mixed', 'Murky', 'All gray'],
      },
      {
        id: 'cult', type: 'cards', label: 'Demonic Cult portrayal',
        options: [
          { id: 'evil', glyph: '惡', label: 'Pure menace', desc: 'An apocalyptic force; their invasion is the timeline’s great catastrophe.' },
          { id: 'complex', glyph: '複', label: 'Complex faction', desc: 'Cruel but coherent, with factions, believers and reasons.' },
          { id: 'misunderstood', glyph: '誤', label: 'Misunderstood', desc: 'The orthodox histories lie; the truth is a regression secret.' },
        ],
        default: 'complex',
      },
      {
        id: 'joinable', type: 'cards', multi: true, label: 'Who can the player join?',
        options: [
          { id: 'orthodox', glyph: '正', label: 'Orthodox sects', desc: 'Entrance exams, strict seniority.' },
          { id: 'families', glyph: '家', label: 'Great Families', desc: 'Marriage, adoption, or service.' },
          { id: 'unorthodox', glyph: '邪', label: 'Unorthodox', desc: 'Bandit lords, assassins’ guilds.' },
          { id: 'cult', glyph: '魔', label: 'Demonic Cult', desc: 'The forbidden path.' },
          { id: 'court', glyph: '皇', label: 'Imperial Court', desc: 'Officials and the Eastern Depot.' },
          { id: 'none', glyph: '浪', label: 'Lone wanderer', desc: 'Answer to no one.' },
        ],
        default: ['orthodox', 'families', 'unorthodox', 'cult', 'none'],
      },
      {
        id: 'reputation', type: 'cards', label: 'Reputation model',
        options: [
          { id: 'axis', glyph: '名', label: 'Single fame axis', desc: 'One Orthodox ↔ Unorthodox standing.' },
          { id: 'perFaction', glyph: '派', label: 'Per-faction standing', desc: 'Each faction tracks its own opinion of you.' },
          { id: 'both', glyph: '雙', label: 'Per-faction + fame/infamy', desc: 'Faction standing, plus separate Fame and Infamy that travel with your name.' },
        ],
        default: 'both',
      },
      {
        id: 'power', type: 'slider', label: 'Supernatural power level',
        min: 0, max: 100, default: 55, left: 'Grounded martial arts', right: 'Mountain-splitting',
        stops: ['Grounded', 'Light wuxia', 'Sword qi', 'Heaven-shaking', 'Mythic'],
      },
      {
        id: 'era', type: 'cards', label: 'Historical anchor',
        options: [
          { id: 'fictional', glyph: '虛', label: 'Fictional dynasty', desc: 'Freedom to write history that regression can change.' },
          { id: 'ming', glyph: '明', label: 'Ming-era flavor', desc: 'Loosely historical: eunuchs, guards, the Great Wall.' },
        ],
        default: 'fictional',
      },
    ],
  },

  // 3 ─────────────────────────────────────────────────────────────
  {
    id: 'cultivation', hanja: '丹', title: 'The Dantian Awakens', topic: 'Cultivation & Realms',
    master: 'Breathe in. Feel the warmth below your navel. Now tell me how high you wish to climb, and what you will risk to do it.',
    questions: [
      {
        id: 'ladder', type: 'cards', label: 'Realm ladder',
        options: [
          { id: 'murim', glyph: '流', label: 'Murim ranks', desc: 'Third-Rate → Second → First → Peak → Transcendent → Harmony → Mystic → Life & Death.' },
          { id: 'xianxia', glyph: '仙', label: 'Xianxia stages', desc: 'Qi Condensation → Foundation → Core → Nascent Soul… (more immortal).' },
          { id: 'simple', glyph: '級', label: 'Plain tiers', desc: 'Novice → Adept → Expert → Master → Grandmaster… (approachable).' },
        ],
        default: 'murim',
      },
      {
        id: 'substages', type: 'cards', label: 'Sub-stages within a realm',
        options: [
          { id: 'none', glyph: '一', label: 'None', desc: 'Each realm is one step.' },
          { id: 'three', glyph: '三', label: 'Early / Mid / Late', desc: 'Three steps per realm; the last is a bottleneck.' },
          { id: 'nine', glyph: '九', label: 'Nine layers', desc: 'Fine-grained progress, xianxia style.' },
        ],
        default: 'three',
      },
      {
        id: 'speed', type: 'slider', label: 'Pace of cultivation',
        min: 0, max: 100, default: 40, left: 'A lifetime to reach Peak', right: 'Prodigy in a decade',
        stops: ['Glacial', 'Slow', 'Measured', 'Fast', 'Meteoric'],
      },
      {
        id: 'risk', type: 'slider', label: 'Breakthrough danger',
        min: 0, max: 100, default: 55, left: 'Safe', right: 'Every attempt could kill',
        stops: ['Safe', 'Mild', 'Tense', 'Perilous', 'Deadly'],
      },
      {
        id: 'deviation', type: 'cards', multi: true, label: 'Qi deviation outcomes',
        help: 'What can happen when a breakthrough goes wrong.',
        options: [
          { id: 'injury', glyph: '傷', label: 'Internal injury', desc: 'Years of recovery, blocked progress.' },
          { id: 'crippled', glyph: '廢', label: 'Crippled meridians', desc: 'Cultivation sealed, unless a cure is found.' },
          { id: 'madness', glyph: '狂', label: 'Madness', desc: 'Fall toward the demonic path; personality shifts.' },
          { id: 'death', glyph: '死', label: 'Death', desc: 'Qi burns you from the inside out, and regression begins.' },
          { id: 'insight', glyph: '悟', label: 'Twisted insight', desc: 'Rarely, failure reveals a strange new technique.' },
        ],
        default: ['injury', 'crippled', 'madness', 'death', 'insight'],
      },
      {
        id: 'resources', type: 'cards', multi: true, label: 'Sources of progress',
        options: [
          { id: 'manuals', glyph: '書', label: 'Martial manuals', desc: 'Sect arts and lost scriptures, memorized across lives.' },
          { id: 'elixirs', glyph: '藥', label: 'Elixirs & herbs', desc: 'Spirit ginseng, Small Reincarnation Pills.' },
          { id: 'masters', glyph: '師', label: 'Masters', desc: 'Teaching speeds progress and unlocks arts.' },
          { id: 'seclusion', glyph: '關', label: 'Seclusion', desc: 'Skip years in closed-door training.' },
          { id: 'enlightenment', glyph: '覺', label: 'Enlightenment', desc: 'Sudden insights from events, battles, loss.' },
          { id: 'absorption', glyph: '吸', label: 'Qi absorption', desc: 'Forbidden arts that steal others’ cultivation.' },
        ],
        default: ['manuals', 'elixirs', 'masters', 'seclusion', 'enlightenment', 'absorption'],
      },
      {
        id: 'talent', type: 'cards', label: 'Innate talent',
        options: [
          { id: 'constitutions', glyph: '體', label: 'Rare constitutions', desc: 'Nine Yin Meridians, Heavenly Body… Rolled at birth, some cursed.' },
          { id: 'stat', glyph: '才', label: 'Talent stat', desc: 'A single Talent number shapes growth.' },
          { id: 'effort', glyph: '勤', label: 'Effort only', desc: 'No innate gifts. Choices and knowledge decide everything.' },
        ],
        default: 'constitutions',
      },
      {
        id: 'paths', type: 'cards', multi: true, label: 'Cultivation paths available',
        options: [
          { id: 'orthodox', glyph: '正', label: 'Orthodox internal arts', desc: 'Slow, stable, honorable.' },
          { id: 'unorthodox', glyph: '邪', label: 'Unorthodox shortcuts', desc: 'Faster, painful, reputation costs.' },
          { id: 'demonic', glyph: '魔', label: 'Demonic arts', desc: 'Fastest and corrupting. Madness lurks.' },
          { id: 'external', glyph: '鐵', label: 'External body arts', desc: 'Iron body and hard qigong.' },
          { id: 'poison', glyph: '毒', label: 'Medicine & poison', desc: 'The Dang family way; heal or kill.' },
        ],
        default: ['orthodox', 'unorthodox', 'demonic', 'external', 'poison'],
      },
      {
        id: 'seclusionLength', type: 'cards', label: 'Seclusion controls',
        options: [
          { id: 'fixed', glyph: '定', label: 'Fixed choices', desc: '1, 3 or 10 years.' },
          { id: 'any', glyph: '任', label: 'Any length', desc: 'Pick 1 to 30 years.' },
          { id: 'until', glyph: '破', label: 'Until breakthrough', desc: 'Emerge when you break through, or when the world interrupts.' },
        ],
        default: 'fixed',
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank what cultivation should feel like',
        items: [
          { id: 'tension', label: 'Breakthrough tension', desc: 'Every attempt is a held breath.' },
          { id: 'knowledge', label: 'Knowledge pays off', desc: 'Knowing where the manuals are, life after life.' },
          { id: 'growth', label: 'Steady growth', desc: 'Visible progress every year.' },
          { id: 'timeskip', label: 'Seclusion time-skips', desc: 'Emerge to a changed world.' },
          { id: 'choice', label: 'Path choice', desc: 'Orthodox, unorthodox, demonic.' },
        ],
        default: ['tension', 'knowledge', 'choice', 'timeskip', 'growth'],
      },
    ],
  },

  // 4 ─────────────────────────────────────────────────────────────
  {
    id: 'combat', hanja: '劍', title: 'Crossing Blades', topic: 'Combat',
    master: 'Words are wind until steel meets steel. Show me how a duel should read. Better yet, fight one.',
    questions: [
      {
        id: 'system', type: 'cards', label: 'Combat system',
        options: [
          { id: 'stance', glyph: '勢', label: 'Stance duel', desc: 'Each exchange pick Strike, Guard or Feint. Read the opponent’s tells.' },
          { id: 'technique', glyph: '招', label: 'Technique menu', desc: 'Choose techniques that cost qi. Turn-based, more tactical.' },
          { id: 'auto', glyph: '觀', label: 'Narrated auto-battle', desc: 'Stats decide; the prose tells the story. Fast.' },
          { id: 'decisive', glyph: '決', label: 'One decisive choice', desc: 'BitLife-style: pick an approach, see the odds, read the outcome.' },
        ],
        default: 'stance',
      },
      {
        id: 'length', type: 'slider', label: 'Exchanges per fight',
        min: 1, max: 8, step: 1, default: 3, left: 'One blow', right: 'Long duel', unit: 'exchanges',
      },
      {
        id: 'lethality', type: 'slider', label: 'Lethality',
        min: 0, max: 100, default: 55, left: 'Bruises & lessons', right: 'Every duel may be your last',
        stops: ['Sparring', 'Bloody', 'Dangerous', 'Lethal', 'Brutal'],
      },
      {
        id: 'display', type: 'cards', label: 'Information shown',
        options: [
          { id: 'prose', glyph: '文', label: 'Prose only', desc: 'No numbers; you feel the fight through words.' },
          { id: 'bars', glyph: '條', label: 'Health & qi bars', desc: 'Bars without numbers.' },
          { id: 'numbers', glyph: '數', label: 'Full numbers', desc: 'Damage, HP, qi costs, odds.' },
        ],
        default: 'bars',
      },
      {
        id: 'naming', type: 'cards', label: 'Technique names',
        options: [
          { id: 'poetic', glyph: '詩', label: 'Poetic', desc: '“Plum Blossom Sword: Twenty-Four Falling Petals.”' },
          { id: 'literal', glyph: '直', label: 'Literal', desc: '“Rising Slash.” Clear and functional.' },
        ],
        default: 'poetic',
      },
      {
        id: 'frequency', type: 'slider', label: 'How often fights happen',
        min: 0, max: 100, default: 40, left: 'Rare & meaningful', right: 'Constant',
        stops: ['Rare', 'Occasional', 'Regular', 'Frequent', 'Constant'],
      },
      {
        id: 'contexts', type: 'cards', multi: true, label: 'Kinds of fights',
        options: [
          { id: 'duel', glyph: '鬪', label: 'Honor duels' },
          { id: 'ambush', glyph: '伏', label: 'Ambushes' },
          { id: 'tournament', glyph: '台', label: 'Tournaments' },
          { id: 'spar', glyph: '練', label: 'Sparring' },
          { id: 'war', glyph: '戰', label: 'Sect wars' },
          { id: 'beast', glyph: '獸', label: 'Beasts' },
          { id: 'assassination', glyph: '刺', label: 'Assassinations' },
        ],
        default: ['duel', 'ambush', 'tournament', 'spar', 'war', 'assassination'],
      },
      {
        id: 'alternatives', type: 'cards', multi: true, label: 'Ways out of a fight',
        options: [
          { id: 'flee', glyph: '逃', label: 'Flee', desc: 'Lightness skill check.' },
          { id: 'yield', glyph: '降', label: 'Yield', desc: 'Lose face, keep life.' },
          { id: 'talk', glyph: '言', label: 'Talk it down', desc: 'Charm, threats, or the truth.' },
          { id: 'trick', glyph: '詐', label: 'Dirty tricks', desc: 'Lime powder, poison, hidden weapons.' },
          { id: 'foreknowledge', glyph: '知', label: 'Foreknowledge', desc: 'Use a past life’s memory of this enemy.' },
        ],
        default: ['flee', 'yield', 'talk', 'trick', 'foreknowledge'],
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank what combat should be',
        items: [
          { id: 'cinematic', label: 'Cinematic text' },
          { id: 'tactics', label: 'Tactical depth' },
          { id: 'speed', label: 'Quick to resolve' },
          { id: 'readable', label: 'Readable outcomes' },
          { id: 'stakes', label: 'Real stakes' },
        ],
        default: ['stakes', 'cinematic', 'readable', 'tactics', 'speed'],
      },
    ],
  },

  // 5 ─────────────────────────────────────────────────────────────
  {
    id: 'regression', hanja: '回', title: 'The Wheel Turns Back', topic: 'Regression Rules',
    master: 'Death is a teacher who repeats the lesson until you learn it. Decide the rules of the wheel.',
    questions: [
      {
        id: 'trigger', type: 'cards', label: 'When does regression happen?',
        options: [
          { id: 'always', glyph: '輪', label: 'Every death', desc: 'Die in any way and you wake as a child.' },
          { id: 'unjust', glyph: '冤', label: 'Only premature deaths', desc: 'Dying old and content ends the run; a "good death" is an ending.' },
          { id: 'artifact', glyph: '珠', label: 'A cursed artifact', desc: 'A bead with limited charges. Finding more is a quest.' },
        ],
        default: 'always',
      },
      {
        id: 'returnAge', type: 'slider', label: 'Age you return to',
        min: 0, max: 20, step: 1, default: 6, left: 'Infancy', right: 'Young adult', unit: 'years old',
      },
      {
        id: 'variance', type: 'cards', label: 'Return point',
        options: [
          { id: 'fixed', glyph: '定', label: 'Always the same day', desc: 'A familiar morning, every time.' },
          { id: 'drift', glyph: '移', label: 'Drifts', desc: 'Each loop starts slightly later, so time runs out.' },
          { id: 'random', glyph: '亂', label: 'Random window', desc: 'Somewhere in childhood. Disorienting.' },
        ],
        default: 'fixed',
      },
      {
        id: 'carry', type: 'cards', multi: true, label: 'What carries over',
        help: 'The core hook: knowledge, not stats.',
        options: [
          { id: 'timeline', glyph: '史', label: 'Timeline knowledge', desc: 'Dates of wars, deaths, disasters, tournaments.' },
          { id: 'secrets', glyph: '秘', label: 'Secrets & locations', desc: 'Where manuals are hidden, who the traitor is.' },
          { id: 'theory', glyph: '理', label: 'Martial theory', desc: 'You remember techniques, but must retrain the body.' },
          { id: 'people', glyph: '人', label: 'Knowledge of people', desc: 'Names, desires, weaknesses of NPCs.' },
          { id: 'recipes', glyph: '方', label: 'Recipes & crafts', desc: 'Elixir formulas, poisons, smithing.' },
          { id: 'echo', glyph: '影', label: 'Small stat echo', desc: 'A tiny bonus each loop. Breaks the pure-knowledge rule!' },
        ],
        default: ['timeline', 'secrets', 'theory', 'people', 'recipes'],
      },
      {
        id: 'determinism', type: 'slider', label: 'How fixed is history?',
        min: 0, max: 100, default: 25, left: 'Fixed timeline', right: 'Chaotic',
        stops: ['Clockwork', 'Mostly fixed', 'Wobbly', 'Unstable', 'Chaotic'],
      },
      {
        id: 'butterfly', type: 'slider', label: 'How much you can change it',
        min: 0, max: 100, default: 65, left: 'Fate resists you', right: 'You rewrite history',
        stops: ['Fate wins', 'Small ripples', 'Real change', 'Big change', 'Total freedom'],
      },
      {
        id: 'npcMemory', type: 'cards', label: 'Do others remember?',
        options: [
          { id: 'none', glyph: '無', label: 'No one', desc: 'You are utterly alone with your memories.' },
          { id: 'dejavu', glyph: '夢', label: 'Fated few feel déjà vu', desc: 'Some souls are tied to yours.' },
          { id: 'rival', glyph: '敵', label: 'Another regressor', desc: 'Someone else is also turning the wheel.' },
        ],
        default: 'rival',
      },
      {
        id: 'costs', type: 'cards', multi: true, label: 'Costs of regression',
        options: [
          { id: 'none', glyph: '空', label: 'No cost', desc: 'Death is only a setback.' },
          { id: 'fade', glyph: '褪', label: 'Memories fade', desc: 'Older loops blur; record what matters.' },
          { id: 'burden', glyph: '業', label: 'Karmic burden', desc: 'Each death weighs on your sanity.' },
          { id: 'harsher', glyph: '劫', label: 'Heaven notices', desc: 'The world grows harsher each loop.' },
        ],
        default: ['fade', 'burden'],
      },
      {
        id: 'journal', type: 'cards', label: 'Memory journal',
        options: [
          { id: 'auto', glyph: '錄', label: 'Automatic codex', desc: 'Discoveries are logged for you.' },
          { id: 'manual', glyph: '記', label: 'Write it yourself', desc: 'Only what you note down survives.' },
          { id: 'both', glyph: '雙', label: 'Codex + personal notes', desc: 'Auto entries, plus your own annotations.' },
        ],
        default: 'both',
      },
      {
        id: 'ending', type: 'cards', label: 'Is there an end?',
        options: [
          { id: 'endless', glyph: '環', label: 'Endless wheel', desc: 'Play forever; no final ending.' },
          { id: 'true', glyph: '真', label: 'One true ending', desc: 'Uncover why the wheel turns, and break it.' },
          { id: 'multiple', glyph: '多', label: 'Multiple endings', desc: 'Ascend, rule, die content, become the Demon… or break the wheel.' },
        ],
        default: 'multiple',
      },
    ],
  },

  // 6 ─────────────────────────────────────────────────────────────
  {
    id: 'relationships', hanja: '緣', title: 'Bonds of Blood and Oath', topic: 'Relationships',
    master: 'A blade is forged alone, but a life is woven with others. Who walks beside you, and who waits in ambush?',
    questions: [
      {
        id: 'types', type: 'cards', multi: true, label: 'Relationship types',
        options: [
          { id: 'family', glyph: '親', label: 'Family', desc: 'Parents and siblings.' },
          { id: 'master', glyph: '師', label: 'Masters', desc: 'Teachers who shape your arts.' },
          { id: 'disciple', glyph: '徒', label: 'Disciples', desc: 'Pass your arts on.' },
          { id: 'sect', glyph: '門', label: 'Sect siblings', desc: 'Sahyung, sajae, samae.' },
          { id: 'rival', glyph: '競', label: 'Rivals', desc: 'Grow together through hatred or respect.' },
          { id: 'sworn', glyph: '義', label: 'Sworn siblings', desc: 'Oaths under the peach trees.' },
          { id: 'lover', glyph: '戀', label: 'Lovers & spouses', desc: 'Courtship, marriage.' },
          { id: 'child', glyph: '子', label: 'Children', desc: 'Raise heirs.' },
          { id: 'enemy', glyph: '仇', label: 'Nemeses', desc: 'Blood feuds that persist across loops.' },
        ],
        default: ['family', 'master', 'disciple', 'sect', 'rival', 'sworn', 'lover', 'child', 'enemy'],
      },
      {
        id: 'romance', type: 'cards', label: 'Romance',
        options: [
          { id: 'none', glyph: '無', label: 'None', desc: 'Focus on martial bonds.' },
          { id: 'subtle', glyph: '淡', label: 'Subtle', desc: 'Longing glances; optional marriage.' },
          { id: 'full', glyph: '濃', label: 'Full', desc: 'Courtship, marriage, children, heartbreak.' },
        ],
        default: 'full',
      },
      {
        id: 'depth', type: 'slider', label: 'Relationship depth',
        min: 0, max: 100, default: 60, left: 'Simple meters', right: 'Personal storylines',
        stops: ['Meters', 'Light', 'Characterful', 'Storied', 'Deep arcs'],
      },
      {
        id: 'meters', type: 'cards', label: 'Relationship meters',
        options: [
          { id: 'one', glyph: '一', label: 'Affection only', desc: 'One bar per person.' },
          { id: 'two', glyph: '二', label: 'Affection + Respect', desc: 'They can love you and despise your sword, or the reverse.' },
          { id: 'hidden', glyph: '隱', label: 'Hidden', desc: 'Read people through words, not bars.' },
        ],
        default: 'two',
      },
      {
        id: 'tragedy', type: 'slider', label: 'How often loved ones die',
        min: 0, max: 100, default: 50, left: 'Rarely', right: 'Constantly',
        stops: ['Rare', 'Sometimes', 'Often', 'Very often', 'Murim-standard'],
      },
      {
        id: 'betrayal', type: 'slider', label: 'Betrayal frequency',
        min: 0, max: 100, default: 40, left: 'Loyal world', right: 'Trust no one',
      },
      {
        id: 'interactions', type: 'cards', multi: true, label: 'Interaction menu',
        options: [
          { id: 'talk', glyph: '談', label: 'Share tea' },
          { id: 'spar', glyph: '練', label: 'Spar' },
          { id: 'gift', glyph: '贈', label: 'Give a gift' },
          { id: 'learn', glyph: '學', label: 'Ask for teaching' },
          { id: 'provoke', glyph: '挑', label: 'Provoke' },
          { id: 'duel', glyph: '鬪', label: 'Challenge to duel' },
          { id: 'oath', glyph: '義', label: 'Swear brotherhood' },
          { id: 'confess', glyph: '心', label: 'Confess feelings' },
          { id: 'warn', glyph: '警', label: 'Warn of the future' },
          { id: 'kill', glyph: '殺', label: 'Assassinate' },
        ],
        default: ['talk', 'spar', 'gift', 'learn', 'provoke', 'duel', 'oath', 'confess', 'warn', 'kill'],
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank the bonds that matter most',
        items: [
          { id: 'master', label: 'Master & disciple' },
          { id: 'rival', label: 'Rivalries' },
          { id: 'sworn', label: 'Sworn brotherhood' },
          { id: 'romance', label: 'Romance' },
          { id: 'family', label: 'Family legacy' },
          { id: 'enemy', label: 'Nemeses' },
        ],
        default: ['master', 'rival', 'sworn', 'enemy', 'family', 'romance'],
      },
    ],
  },

  // 7 ─────────────────────────────────────────────────────────────
  {
    id: 'events', hanja: '運', title: 'Ten Thousand Fates', topic: 'Event Types',
    master: 'Every year, Heaven deals new cards. Tell me which cards are in the deck and how they chain together.',
    questions: [
      {
        id: 'categories', type: 'rank', label: 'Rank event categories by weight',
        help: 'Higher = appears more often in the deck.',
        items: [
          { id: 'fortune', label: 'Fortuitous encounters (기연)', desc: 'Caves, cliffs, hermits, inheritances.' },
          { id: 'sect', label: 'Sect life & politics', desc: 'Exams, seniority, succession.' },
          { id: 'jianghu', label: 'Wandering the Gangho', desc: 'Inns, roads, escorts, strangers.' },
          { id: 'timeline', label: 'Timeline mysteries', desc: 'Regression-linked secrets and fixed history.' },
          { id: 'bonds', label: 'Bonds & romance', desc: 'Meetings, quarrels, weddings, funerals.' },
          { id: 'war', label: 'War & catastrophe', desc: 'Cult invasions, plague, famine.' },
          { id: 'tournament', label: 'Tournaments', desc: 'Martial assemblies, ranking battles.' },
          { id: 'daily', label: 'Daily life', desc: 'Harvests, illnesses, small joys.' },
          { id: 'crime', label: 'Crime & the dark path', desc: 'Theft, assassination, smuggling.' },
        ],
        default: ['timeline', 'fortune', 'jianghu', 'sect', 'bonds', 'war', 'tournament', 'daily', 'crime'],
      },
      {
        id: 'perYear', type: 'slider', label: 'Events per year (average)',
        min: 1, max: 5, step: 1, default: 2, left: 'Quiet years', right: 'Eventful', unit: 'per year',
      },
      {
        id: 'chains', type: 'slider', label: 'Story chaining',
        min: 0, max: 100, default: 70, left: 'One-off vignettes', right: 'Long multi-year arcs',
        stops: ['Vignettes', 'Short pairs', 'Mini-arcs', 'Long arcs', 'Sagas'],
      },
      {
        id: 'choices', type: 'cards', label: 'Choices per event',
        options: [
          { id: '2', glyph: '二', label: 'Two', desc: 'Sharp dilemmas.' },
          { id: '3', glyph: '三', label: 'Three', desc: 'The classic.' },
          { id: '4', glyph: '四', label: 'Four', desc: 'More nuance.' },
          { id: 'varies', glyph: '變', label: 'Varies', desc: '2 to 4, plus options unlocked by stats, flags and memories.' },
        ],
        default: 'varies',
      },
      {
        id: 'odds', type: 'cards', label: 'Showing the odds',
        options: [
          { id: 'hidden', glyph: '隱', label: 'Hidden', desc: 'No hints. Pure intuition.' },
          { id: 'hinted', glyph: '暗', label: 'Hinted', desc: '“(risky)”, “(requires Insight)”.' },
          { id: 'shown', glyph: '明', label: 'Percentages', desc: '“(35%)”: transparent gambling.' },
        ],
        default: 'hinted',
      },
      {
        id: 'formats', type: 'cards', multi: true, label: 'Event formats',
        options: [
          { id: 'choice', glyph: '擇', label: 'Choice prompts', desc: 'Modal with options.' },
          { id: 'log', glyph: '錄', label: 'Log-only beats', desc: 'Things that just happen.' },
          { id: 'vignette', glyph: '畫', label: 'Illustrated vignettes', desc: 'Big moments get a code-drawn scene.' },
          { id: 'letters', glyph: '信', label: 'Letters & messages', desc: 'Correspondence from NPCs.' },
          { id: 'minigame', glyph: '戲', label: 'Mini-games', desc: 'Meditation timing, gambling, riddles.' },
        ],
        default: ['choice', 'log', 'vignette', 'letters', 'minigame'],
      },
      {
        id: 'triggers', type: 'cards', multi: true, label: 'What can trigger events',
        options: [
          { id: 'age', glyph: '歲', label: 'Age ranges' },
          { id: 'stats', glyph: '力', label: 'Stats' },
          { id: 'flags', glyph: '旗', label: 'Story flags' },
          { id: 'year', glyph: '曆', label: 'World year (timeline)' },
          { id: 'location', glyph: '地', label: 'Location' },
          { id: 'faction', glyph: '派', label: 'Faction standing' },
          { id: 'memory', glyph: '憶', label: 'Past-life memories' },
          { id: 'random', glyph: '偶', label: 'Pure chance' },
        ],
        default: ['age', 'stats', 'flags', 'year', 'location', 'faction', 'memory', 'random'],
      },
    ],
  },

  // 8 ─────────────────────────────────────────────────────────────
  {
    id: 'life', hanja: '生', title: 'The Mortal Coil', topic: 'Life Systems, Stats & Activities',
    master: 'Even a sword saint must eat rice and pay the innkeeper. What does an ordinary year hold?',
    questions: [
      {
        id: 'stats', type: 'cards', multi: true, label: 'Core stats',
        options: [
          { id: 'health', glyph: '健', label: 'Health' },
          { id: 'body', glyph: '體', label: 'Body (strength & agility)' },
          { id: 'qi', glyph: '氣', label: 'Qi (internal energy)' },
          { id: 'insight', glyph: '悟', label: 'Insight (comprehension)' },
          { id: 'charm', glyph: '魅', label: 'Charm' },
          { id: 'luck', glyph: '運', label: 'Luck' },
          { id: 'karma', glyph: '業', label: 'Karma (hidden morality)' },
          { id: 'fame', glyph: '名', label: 'Fame / Infamy' },
          { id: 'wealth', glyph: '錢', label: 'Wealth (taels)' },
          { id: 'sanity', glyph: '心', label: 'Sanity / Heart-demon' },
        ],
        default: ['health', 'body', 'qi', 'insight', 'charm', 'karma', 'fame', 'wealth', 'sanity'],
      },
      {
        id: 'origins', type: 'cards', multi: true, label: 'Birth origins',
        options: [
          { id: 'peasant', glyph: '農', label: 'Peasant farmer’s child' },
          { id: 'merchant', glyph: '商', label: 'Merchant family' },
          { id: 'orphan', glyph: '孤', label: 'Orphan beggar' },
          { id: 'branch', glyph: '家', label: 'Branch of a Great Family' },
          { id: 'sectborn', glyph: '門', label: 'Born inside a sect' },
          { id: 'cultborn', glyph: '魔', label: 'Child of the Demonic Cult' },
          { id: 'official', glyph: '官', label: 'Minor official’s house' },
        ],
        default: ['peasant', 'merchant', 'orphan', 'branch', 'sectborn', 'cultborn', 'official'],
      },
      {
        id: 'activities', type: 'cards', multi: true, label: 'Yearly activities menu',
        options: [
          { id: 'train', glyph: '練', label: 'Train body' },
          { id: 'meditate', glyph: '坐', label: 'Meditate' },
          { id: 'seclusion', glyph: '關', label: 'Enter seclusion' },
          { id: 'wander', glyph: '遊', label: 'Wander the Gangho' },
          { id: 'work', glyph: '業', label: 'Work a job' },
          { id: 'study', glyph: '學', label: 'Study classics' },
          { id: 'doctor', glyph: '醫', label: 'Visit a physician' },
          { id: 'gamble', glyph: '賭', label: 'Gamble' },
          { id: 'tavern', glyph: '酒', label: 'Tavern rumors' },
          { id: 'journal', glyph: '錄', label: 'Read memory journal' },
        ],
        default: ['train', 'meditate', 'seclusion', 'wander', 'work', 'study', 'doctor', 'gamble', 'tavern', 'journal'],
      },
      {
        id: 'careers', type: 'cards', multi: true, label: 'Careers',
        options: [
          { id: 'escort', glyph: '鏢', label: 'Escort guard' },
          { id: 'merchant', glyph: '商', label: 'Merchant' },
          { id: 'physician', glyph: '醫', label: 'Physician' },
          { id: 'smith', glyph: '鍛', label: 'Blacksmith' },
          { id: 'scholar', glyph: '儒', label: 'Scholar-official' },
          { id: 'bandit', glyph: '賊', label: 'Bandit' },
          { id: 'assassin', glyph: '刺', label: 'Assassin' },
          { id: 'informant', glyph: '耳', label: 'Information broker' },
          { id: 'farmer', glyph: '田', label: 'Farmer' },
        ],
        default: ['escort', 'merchant', 'physician', 'smith', 'scholar', 'bandit', 'assassin', 'informant', 'farmer'],
      },
      {
        id: 'lifespan', type: 'cards', label: 'Lifespan',
        options: [
          { id: 'mortal', glyph: '凡', label: 'Mortal limits', desc: 'Even masters rarely pass 90.' },
          { id: 'realm', glyph: '延', label: 'Extended by realm', desc: 'Each realm adds years; legends live centuries.' },
        ],
        default: 'realm',
      },
      {
        id: 'granularity', type: 'cards', label: 'Time step',
        options: [
          { id: 'year', glyph: '年', label: 'One year per Age Up', desc: 'Classic BitLife pacing.' },
          { id: 'season', glyph: '季', label: 'Seasons', desc: 'Four turns per year; slower, richer.' },
        ],
        default: 'year',
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank the everyday loop',
        items: [
          { id: 'activities', label: 'Choosing activities' },
          { id: 'events', label: 'Reacting to events' },
          { id: 'careers', label: 'Careers & money' },
          { id: 'growth', label: 'Watching stats grow' },
          { id: 'exploration', label: 'Exploring places' },
        ],
        default: ['events', 'activities', 'growth', 'exploration', 'careers'],
      },
    ],
  },

  // 9 ─────────────────────────────────────────────────────────────
  {
    id: 'ui', hanja: '彩', title: 'Silk and Lacquer', topic: 'UI & Visual Style',
    master: 'A scroll is judged first by its silk. Choose the colors and the brush, and I will paint you the screen.',
    questions: [
      {
        id: 'palette', type: 'cards', label: 'Color palette', swatches: true,
        options: [
          { id: 'ink', label: 'Ink & Parchment', desc: 'Warm paper, black ink, seal red.', colors: ['#efe6d2', '#f8f2e3', '#2a2420', '#9c2a1c', '#3d5a4a'] },
          { id: 'lacquer', label: 'Crimson Lacquer', desc: 'Dark red-black with gold.', colors: ['#1c0d0c', '#2b1412', '#f2e3cf', '#c8372d', '#d9a441'] },
          { id: 'jade', label: 'Jade Mist', desc: 'Pale greens, calm and airy.', colors: ['#e3ece6', '#f4f8f4', '#1f3a33', '#2f7d67', '#b5873a'] },
          { id: 'night', label: 'Night Blade', desc: 'Moonlit steel and blood.', colors: ['#0e1116', '#171c24', '#d8dee8', '#6fa8dc', '#c94f4f'] },
          { id: 'plum', label: 'Plum & Gold', desc: 'Court silks at dusk.', colors: ['#241726', '#33203a', '#f3e7d8', '#e0b35a', '#c25b7a'] },
          { id: 'ember', label: 'Demonic Ember', desc: 'Smoke, embers, menace.', colors: ['#120808', '#1e0f0d', '#f0d7c4', '#ff5a36', '#8f2a1f'] },
        ],
        default: 'ink',
      },
      {
        id: 'layout', type: 'cards', label: 'Layout',
        options: [
          { id: 'mobile', glyph: '豎', label: 'Phone-first column', desc: 'BitLife-like; desktop shows a centered column.' },
          { id: 'panels', glyph: '橫', label: 'Responsive panels', desc: 'Phone column; on desktop, log + stats + menus side by side.' },
        ],
        default: 'panels',
      },
      {
        id: 'type', type: 'cards', label: 'Typography',
        options: [
          { id: 'serif', glyph: '明', label: 'Classical serif', desc: 'Book-like and literary.' },
          { id: 'sans', glyph: '黑', label: 'Clean sans', desc: 'Modern and very legible.' },
          { id: 'mixed', glyph: '混', label: 'Serif titles, sans UI', desc: 'Literary story, crisp buttons.' },
        ],
        default: 'mixed',
      },
      {
        id: 'ornament', type: 'slider', label: 'Ornamentation',
        min: 0, max: 100, default: 55, left: 'Minimal', right: 'Ornate',
        stops: ['Bare', 'Clean', 'Tasteful', 'Decorated', 'Lavish'],
      },
      {
        id: 'art', type: 'cards', multi: true, label: 'Code-drawn art elements',
        options: [
          { id: 'backdrops', glyph: '山', label: 'Ink-wash backdrops', desc: 'Mountains that shift with location.' },
          { id: 'seals', glyph: '印', label: 'Seal stamps', desc: 'Red seals for realms and achievements.' },
          { id: 'portraits', glyph: '像', label: 'Generated portraits', desc: 'SVG faces that age with you.' },
          { id: 'particles', glyph: '氣', label: 'Qi particles', desc: 'Drifting motes that thicken with cultivation.' },
          { id: 'weather', glyph: '雨', label: 'Seasons & weather', desc: 'Rain, snow, cherry petals.' },
          { id: 'vignettes', glyph: '畫', label: 'Event vignettes', desc: 'Small scenes for big moments.' },
        ],
        default: ['backdrops', 'seals', 'portraits', 'particles', 'weather', 'vignettes'],
      },
      {
        id: 'motion', type: 'slider', label: 'Animation',
        min: 0, max: 100, default: 45, left: 'Still', right: 'Lively',
        stops: ['Still', 'Subtle', 'Gentle', 'Lively', 'Flashy'],
      },
      {
        id: 'script', type: 'cards', label: 'Hanja / Hangul flourishes',
        options: [
          { id: 'none', glyph: 'A', label: 'None', desc: 'English only.' },
          { id: 'decor', glyph: '飾', label: 'Decorative', desc: 'Characters as ornaments, with English beside them.' },
          { id: 'glossary', glyph: '辭', label: 'With glossary', desc: 'Terms tappable for a definition.' },
        ],
        default: 'glossary',
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank visual priorities',
        items: [
          { id: 'readability', label: 'Readability' },
          { id: 'atmosphere', label: 'Atmosphere' },
          { id: 'mobile', label: 'Thumb-friendly on phones' },
          { id: 'speed', label: 'Snappy & lightweight' },
          { id: 'flair', label: 'Visual flair' },
        ],
        default: ['readability', 'mobile', 'atmosphere', 'speed', 'flair'],
      },
    ],
  },

  // 10 ────────────────────────────────────────────────────────────
  {
    id: 'audio', hanja: '琴', title: 'Voice of the Strings', topic: 'Audio Style',
    master: 'Listen. The wind in the pines has been playing since before the first sect was founded. Choose your instruments; every note here is made from pure math.',
    questions: [
      {
        id: 'instruments', type: 'cards', multi: true, label: 'Instrument palette',
        options: [
          { id: 'pluck', glyph: '琴', label: 'Plucked zither', desc: 'Gayageum / guqin, synthesized string.' },
          { id: 'flute', glyph: '笛', label: 'Bamboo flute', desc: 'Daegeum breathiness and vibrato.' },
          { id: 'bowed', glyph: '弦', label: 'Bowed fiddle', desc: 'Haegeum / erhu, nasal and mournful.' },
          { id: 'bells', glyph: '鐘', label: 'Gongs & temple bells', desc: 'Inharmonic metal, long decays.' },
          { id: 'drums', glyph: '鼓', label: 'War drums', desc: 'Buk barrel drum, low thunder.' },
        ],
        default: ['pluck', 'flute', 'bowed', 'bells', 'drums'],
      },
      {
        id: 'music', type: 'cards', label: 'Music approach',
        options: [
          { id: 'ambient', glyph: '風', label: 'Ambience only', desc: 'Wind, drones, silence. Music is rare.' },
          { id: 'sparse', glyph: '靜', label: 'Sparse meditation', desc: 'A lone zither, long rests.' },
          { id: 'ensemble', glyph: '樂', label: 'Melodic ensemble', desc: 'Lead, accompaniment and percussion loops.' },
          { id: 'adaptive', glyph: '變', label: 'Adaptive', desc: 'Calm in peace, drums swell in danger. Generated live.' },
        ],
        default: 'adaptive',
      },
      {
        id: 'scale', type: 'cards', label: 'Mode / scale',
        options: [
          { id: 'gung', glyph: '宮', label: 'Gong mode', desc: 'Bright major pentatonic: heroic and open.' },
          { id: 'pyeongjo', glyph: '平', label: 'Pyeongjo', desc: 'Korean “peaceful mode”: serene.' },
          { id: 'yu', glyph: '羽', label: 'Yu mode', desc: 'Minor pentatonic: wistful.' },
          { id: 'gyemyeonjo', glyph: '界', label: 'Gyemyeonjo', desc: 'Korean sorrowful mode: deep vibrato, falling bends.' },
        ],
        default: 'yu',
      },
      {
        id: 'tempo', type: 'slider', label: 'Tempo',
        min: 48, max: 132, step: 4, default: 76, left: 'Meditative', right: 'Driving', unit: 'BPM',
      },
      {
        id: 'sfx', type: 'slider', label: 'Sound-effect richness',
        min: 0, max: 100, default: 60, left: 'Minimal clicks', right: 'Layered & cinematic',
        stops: ['Minimal', 'Light', 'Balanced', 'Rich', 'Cinematic'],
      },
      {
        id: 'ambience', type: 'cards', multi: true, label: 'Ambient beds',
        options: [
          { id: 'wind', glyph: '風', label: 'Mountain wind' },
          { id: 'rain', glyph: '雨', label: 'Rain' },
          { id: 'birds', glyph: '鳥', label: 'Birdsong' },
          { id: 'fire', glyph: '火', label: 'Campfire' },
          { id: 'temple', glyph: '寺', label: 'Distant temple' },
        ],
        default: ['wind', 'rain', 'birds', 'fire', 'temple'],
      },
      {
        id: 'defaultOn', type: 'cards', label: 'Sound by default',
        options: [
          { id: 'on', glyph: '開', label: 'On after first tap', desc: 'Browsers require a tap first anyway.' },
          { id: 'off', glyph: '閉', label: 'Off until enabled', desc: 'Polite for playing in public.' },
        ],
        default: 'on',
      },
      {
        id: 'priorities', type: 'rank', label: 'Rank what audio should do',
        items: [
          { id: 'atmosphere', label: 'Atmosphere' },
          { id: 'feedback', label: 'Feedback for actions' },
          { id: 'themes', label: 'Memorable themes' },
          { id: 'restraint', label: 'Silence while reading' },
        ],
        default: ['atmosphere', 'feedback', 'restraint', 'themes'],
      },
    ],
  },

  // 11 ────────────────────────────────────────────────────────────
  {
    id: 'difficulty', hanja: '劫', title: 'Heaven’s Severity', topic: 'Difficulty',
    master: 'Heaven is neither kind nor cruel; it is only indifferent. How indifferent should it be to you?',
    questions: [
      {
        id: 'overall', type: 'slider', label: 'Overall difficulty',
        min: 0, max: 100, default: 60, left: 'Gentle', right: 'Merciless',
        stops: ['Gentle', 'Forgiving', 'Fair', 'Hard', 'Merciless'],
      },
      {
        id: 'mortality', type: 'slider', label: 'How dangerous is the Gangho',
        min: 0, max: 100, default: 55, left: 'Safe roads', right: 'Death on every road',
        stops: ['Peaceful', 'Risky', 'Dangerous', 'Deadly', 'Slaughterhouse'],
      },
      {
        id: 'agency', type: 'slider', label: 'Chance vs. player control',
        min: 0, max: 100, default: 60, left: 'Heaven’s dice', right: 'Your choices decide',
        stops: ['Dice', 'Chancy', 'Balanced', 'Skillful', 'Deterministic'],
      },
      {
        id: 'scarcity', type: 'slider', label: 'Resource scarcity',
        min: 0, max: 100, default: 50, left: 'Elixirs everywhere', right: 'Every pill a treasure',
      },
      {
        id: 'modes', type: 'cards', multi: true, label: 'Difficulty modes offered',
        options: [
          { id: 'story', glyph: '易', label: 'Wanderer (story)', desc: 'Lower death rates, hints on.' },
          { id: 'standard', glyph: '中', label: 'Martial Artist', desc: 'The intended experience.' },
          { id: 'hard', glyph: '難', label: 'Heavenly Tribulation', desc: 'Harsher odds, scarcer pills.' },
          { id: 'ironman', glyph: '鐵', label: 'One Life', desc: 'No regression. A single, final life.' },
        ],
        default: ['story', 'standard', 'hard', 'ironman'],
      },
      {
        id: 'failure', type: 'cards', label: 'Failure philosophy',
        options: [
          { id: 'fair', glyph: '公', label: 'Harsh but fair', desc: 'Failures follow clear rules.' },
          { id: 'forward', glyph: '進', label: 'Fail forward', desc: 'Defeats open new paths: cripple → poison arts.' },
          { id: 'roguelike', glyph: '殘', label: 'Punishing roguelike', desc: 'Death is common; knowledge is the only armor.' },
        ],
        default: 'forward',
      },
      {
        id: 'saves', type: 'cards', label: 'Save model',
        options: [
          { id: 'auto', glyph: '自', label: 'Single autosave', desc: 'Ironman-feeling; no take-backs. Export to back up.' },
          { id: 'slots', glyph: '格', label: 'Autosave + manual slots', desc: 'Freedom to branch lives.' },
        ],
        default: 'auto',
      },
    ],
  },

  // 12 ────────────────────────────────────────────────────────────
  {
    id: 'scope', hanja: '始', title: 'The First Step', topic: 'Scope for the First Playable',
    master: 'A journey of ten thousand li begins with a single step. Choose the first step wisely, so it can bear your weight.',
    questions: [
      {
        id: 'title', type: 'text', label: 'Working title', default: 'The Mortal Path', placeholder: 'The Mortal Path',
      },
      {
        id: 'mustHave', type: 'cards', multi: true, label: 'In the first playable version',
        help: 'What must work in the first version you can actually play?',
        options: [
          { id: 'loop', glyph: '年', label: 'Age-up loop & life log', desc: 'Birth to death, year by year.' },
          { id: 'events', glyph: '運', label: 'Data-driven events', desc: 'Conditions, weights, flags, chains.' },
          { id: 'cultivation', glyph: '丹', label: 'Cultivation & breakthroughs' },
          { id: 'combat', glyph: '劍', label: 'Combat' },
          { id: 'regression', glyph: '回', label: 'Regression & memory journal' },
          { id: 'relationships', glyph: '緣', label: 'Relationships' },
          { id: 'sects', glyph: '門', label: 'Sects & reputation' },
          { id: 'jianghu', glyph: '遊', label: 'Gangho travel / map' },
          { id: 'seclusion', glyph: '關', label: 'Seclusion time-skips' },
          { id: 'audio', glyph: '琴', label: 'Music & sound' },
          { id: 'art', glyph: '畫', label: 'Code-drawn art polish' },
          { id: 'saves', glyph: '存', label: 'Save / export / import' },
        ],
        default: ['loop', 'events', 'cultivation', 'combat', 'regression', 'relationships', 'sects', 'seclusion', 'saves'],
      },
      {
        id: 'order', type: 'rank', label: 'Build order (top = first)',
        items: [
          { id: 'loop', label: 'Age-up loop & life log' },
          { id: 'events', label: 'Event engine' },
          { id: 'regression', label: 'Regression & memory' },
          { id: 'cultivation', label: 'Cultivation' },
          { id: 'combat', label: 'Combat' },
          { id: 'relationships', label: 'Relationships' },
          { id: 'sects', label: 'Sects & reputation' },
          { id: 'audio', label: 'Audio' },
          { id: 'art', label: 'Art polish' },
        ],
        default: ['loop', 'events', 'regression', 'cultivation', 'combat', 'relationships', 'sects', 'audio', 'art'],
      },
      {
        id: 'firstEvents', type: 'slider', label: 'Events in the first playable',
        min: 30, max: 400, step: 10, default: 120, left: 'Lean', right: 'Lavish', unit: 'events',
      },
      {
        id: 'fullEvents', type: 'slider', label: 'Events in the complete game',
        min: 200, max: 2000, step: 50, default: 600, left: 'Focused', right: 'Encyclopedic', unit: 'events',
      },
      {
        id: 'session', type: 'slider', label: 'Typical life length (play time)',
        min: 5, max: 60, step: 5, default: 20, left: 'Snack-sized', right: 'An evening', unit: 'minutes',
      },
      {
        id: 'platform', type: 'cards', label: 'Primary device',
        options: [
          { id: 'mobile', glyph: '手', label: 'Phone first', desc: 'Designed for thumbs.' },
          { id: 'desktop', glyph: '桌', label: 'Desktop first', desc: 'Keyboard and wide screens.' },
          { id: 'both', glyph: '雙', label: 'Equal', desc: 'Both must feel native.' },
        ],
        default: 'both',
      },
      {
        id: 'approach', type: 'cards', label: 'Breadth or polish?',
        options: [
          { id: 'narrow', glyph: '精', label: 'Narrow & polished', desc: 'Fewer systems, each finished.' },
          { id: 'broad', glyph: '廣', label: 'Broad & rough', desc: 'Everything present, refine later.' },
        ],
        default: 'narrow',
      },
      {
        id: 'milestones', type: 'cards', label: 'Delivery',
        options: [
          { id: 'milestones', glyph: '階', label: 'Playable milestones', desc: 'Deploy after each major system so I can test along the way.' },
          { id: 'bigbang', glyph: '全', label: 'One big release', desc: 'Show me when everything is done.' },
        ],
        default: 'milestones',
      },
    ],
  },
];

export const trialById = Object.fromEntries(TRIALS.map((t) => [t.id, t]));
