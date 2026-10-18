// Data for the mini-games an event can open with `game:` (spec: meditation timing, gambling dice,
// riddles, exam essays, forging). The score (0–1) decides rolled choices against their `pass` mark.
//   meditate  press as the light reaches the dantian, three times
//   forge     strike when the steel is brightest, three times
//   dice      call big or small on three throws
//   riddle    answer three riddles
//   exam      compose a three-part essay from offered lines
export const GAMES = ['meditate', 'forge', 'dice', 'riddle', 'exam'];

export const RIDDLES = [
  { q: 'It has a mouth but never eats, a bed but never sleeps, and it runs without legs.', a: ['A river', 'A sect elder', 'A road'], ok: 0 },
  { q: 'The more of it you take, the more you leave behind.', a: ['Qi', 'Footsteps', 'Silver'], ok: 1 },
  { q: 'It is cut, yet never bleeds; it is bound, yet never struggles; it feeds the sect and the beggar alike.', a: ['A disciple', 'Rice', 'A rope'], ok: 1 },
  { q: 'A sword that cannot be drawn, a wall that cannot be climbed, a master that cannot be fooled.', a: ['Time', 'The Heavenly Demon', 'The Abbot'], ok: 0 },
  { q: 'It is heavier than a mountain when carried alone, and lighter than a feather when shared.', a: ['A secret', 'A grudge', 'A coffin'], ok: 0 },
  { q: 'Break it and it is better; set it and it is harder to break.', a: ['A record', 'A bone', 'A vow'], ok: 1 },
  { q: 'It speaks every tongue in the Central Plains, and has never been taught a word.', a: ['An echo', 'A merchant', 'Money'], ok: 0 },
  { q: 'What does a swordsman hold most tightly when he finally lets go?', a: ['His sword', 'His breath', 'His name'], ok: 1 },
  { q: 'It walks on four legs at dawn, two at noon, and three at dusk.', a: ['A crane', 'A person', 'A shadow'], ok: 1 },
  { q: 'It grows when it eats and dies when it drinks.', a: ['Fire', 'A heart-demon', 'A rumour'], ok: 0 },
  { q: 'The poor have it, the rich need it, and if a martial artist eats it, he dies.', a: ['Poison', 'Nothing', 'Pride'], ok: 1 },
  { q: 'It has roots nobody sees, it is taller than the trees, and it never grows.', a: ['A mountain', 'An old grudge', 'A pagoda'], ok: 0 },
  { q: 'A hundred disciples bow before it every morning, and it never bows back.', a: ['The founder’s tablet', 'The sect leader', 'The sun'], ok: 0 },
  { q: 'It is always coming and never arrives.', a: ['Tomorrow', 'The rainy season', 'A promised manual'], ok: 0 },
  { q: 'Two brothers who live on either side of a hill and never see each other.', a: ['Eyes', 'Rival sects', 'Sun and moon'], ok: 0 },
  { q: 'It is given freely, kept carefully, broken easily, and mended rarely.', a: ['A blade', 'Trust', 'A meridian'], ok: 1 },
  { q: 'What fills a room but takes up no space?', a: ['Qi', 'Light', 'Incense smoke'], ok: 1 },
  { q: 'The one who makes it sells it; the one who buys it never uses it; the one who uses it never knows.', a: ['A coffin', 'A sword', 'A poison'], ok: 0 },
  { q: 'It answers without being asked, and is gone before you can thank it.', a: ['An echo', 'A beggar', 'A hidden master'], ok: 0 },
  { q: 'Feed it and it lives; give it water and it dies; Mount Hua’s sword-dancers gather round it in winter.', a: ['Plum blossom', 'Fire', 'Snow'], ok: 1 },
];

// Each exam topic has three parts; in each, one line is excellent (2), one adequate (1), one a disaster (0).
export const EXAMS = [
  { topic: 'On whether a ruler should govern by law or by virtue', parts: [
    [['Law is the dyke; virtue is the river it keeps.', 2], ['Both law and virtue have their uses.', 1], ['The ruler should do whatever the examiners prefer.', 0]],
    [['When the people fear punishment, they obey for a season; when they love goodness, they obey for a dynasty.', 2], ['Punishment is effective but unpopular.', 1], ['Strict laws keep peasants from getting ideas.', 0]],
    [['Therefore the wise ruler writes laws as a father writes letters: rarely, and with care.', 2], ['Therefore both should be balanced.', 1], ['Therefore the examiner should pass this essay.', 0]],
  ] },
  { topic: 'On the martial clans and the peace of the realm', parts: [
    [['A sword in the hand of a righteous man is a lamp; in the hand of a proud one, a fire.', 2], ['Martial artists are sometimes useful.', 1], ['Martial artists should all be arrested.', 0]],
    [['The court need not break the sects, only give them reasons to keep their oaths.', 2], ['The court should keep an eye on the sects.', 1], ['The sects are stronger than the court, so let them rule.', 0]],
    [['Let the Gangho keep its own laws, so long as it keeps the empire’s roads.', 2], ['Some cooperation would be good.', 1], ['Honestly, nobody knows what to do about them.', 0]],
  ] },
  { topic: 'On famine and the granaries', parts: [
    [['A granary full in a good year is a wall built before the flood.', 2], ['Granaries store grain.', 1], ['Famine is the will of Heaven and cannot be helped.', 0]],
    [['The magistrate who sells the reserve for profit has sold the people with it.', 2], ['Corruption in granaries is a problem.', 1], ['Officials deserve some extra income.', 0]],
    [['Open the granaries before the people open them for you.', 2], ['Grain should be distributed fairly.', 1], ['Let the merchants decide the price of rice.', 0]],
  ] },
  { topic: 'On filial piety and loyalty to the throne', parts: [
    [['The root of loyalty to the throne is the habit of loyalty at home.', 2], ['Family and state both matter.', 1], ['A man’s father matters more than his emperor, always.', 0]],
    [['When the two conflict, the superior man carries his grief to the court and his duty to the field.', 2], ['Conflicts should be avoided.', 1], ['One should simply pick whichever is more profitable.', 0]],
    [['A son who serves the realm honours his father’s name in every province.', 2], ['Filial sons make good officials.', 1], ['Parents are mostly a burden on ambitious men.', 0]],
  ] },
  { topic: 'On the frontier and the cost of war', parts: [
    [['A general who wins every battle may still lose the war in the granaries at home.', 2], ['War is expensive.', 1], ['The frontier should be abandoned to save money.', 0]],
    [['Walls hold for a generation; trade holds for a century.', 2], ['Diplomacy should be tried first.', 1], ['Peace is for cowards.', 0]],
    [['Let the soldier be paid on time, and the border will guard itself.', 2], ['Soldiers should be paid.', 1], ['Soldiers can be paid in honour.', 0]],
  ] },
  { topic: 'On the education of the young', parts: [
    [['A child taught only to obey grows into an official who cannot think.', 2], ['Education is important.', 1], ['Children should be beaten until they memorise.', 0]],
    [['Let the village school teach the classics in the morning and the plough in the afternoon.', 2], ['Practical skills also matter.', 1], ['Peasants do not need to read.', 0]],
    [['A realm that reads its own history will not repeat its worst chapters.', 2], ['History is worth studying.', 1], ['The past is over, so why read about it?', 0]],
  ] },
];
