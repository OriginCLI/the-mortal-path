// Birth origins, constitutions, careers and items.

export const ORIGINS = {
  peasant: {
    name: 'Peasant farmer’s child', home: 'willow', wealth: 2, stats: { body: 14, health: 70, insight: 8, charm: 8 },
    birth: 'You were born in a leaking farmhouse in Willow Creek Village, the youngest child of rice farmers, under the shadow of Mount Hua.',
    family: { father: 'farmer', mother: 'farmer', siblings: [1, 3] },
  },
  merchant: {
    name: 'Merchant family', home: 'hangzhou', wealth: 60, stats: { body: 8, health: 70, insight: 12, charm: 12 },
    birth: 'You were born above a silk shop in Hangzhou, into a family that counted coins before it counted blessings.',
    family: { father: 'merchant', mother: 'merchant', siblings: [0, 2] },
  },
  orphan: {
    name: 'Orphan beggar', home: 'luoyang', wealth: 0, stats: { body: 10, health: 55, insight: 10, charm: 6 },
    birth: 'You were found as a newborn on the steps of a ruined shrine in Luoyang, wrapped in a beggar’s coat. No one ever came back for you.',
    family: { father: null, mother: null, siblings: [0, 0], guardian: 'beggar' },
  },
  branch: {
    name: 'Branch of a Great Family', home: 'namgung', wealth: 30, stats: { body: 10, health: 70, insight: 11, charm: 11 },
    birth: 'You were born into a minor branch of the Namgung family: a noble name, a cold courtyard, and no inheritance worth mentioning.',
    family: { father: 'namgung_branch', mother: 'namgung_branch', siblings: [0, 2] }, sect: 'namgung',
  },
  sectborn: {
    name: 'Born inside a sect', home: 'mounthua', wealth: 5, stats: { body: 11, health: 65, insight: 12, charm: 9 },
    birth: 'You were born within the walls of the Mount Hua Sect, to a disciple who died the same night. The sect raised you among plum trees and debts.',
    family: { father: 'disciple', mother: null, siblings: [0, 0] }, sect: 'mounthua',
  },
  cultborn: {
    name: 'Child of the Demonic Cult', home: 'tenthousand', wealth: 10, stats: { body: 13, health: 65, insight: 10, charm: 8 },
    birth: 'You were born in the Ten Thousand Mountains under the red banners of the Heavenly Demon Divine Cult, where children are counted as future soldiers.',
    family: { father: 'cultist', mother: 'cultist', siblings: [0, 1] }, sect: 'cult',
  },
  official: {
    name: 'Minor official’s house', home: 'capital', wealth: 40, stats: { body: 7, health: 70, insight: 14, charm: 11 },
    birth: 'You were born in a magistrate’s house in the Imperial Capital, already expected to pass the imperial examinations.',
    family: { father: 'official', mother: 'gentry', siblings: [0, 2] },
  },
};

// w = rarity weight. talent multiplies cultivation; other fields are special rules handled by systems.
export const CONSTITUTIONS = {
  ordinary: { name: 'Ordinary meridians', w: 60, talent: 1.0, desc: 'Like ninety-nine children in a hundred.' },
  clear_mind: { name: 'Clear Mind Body', w: 7, talent: 1.1, insight: 18, desc: 'You understand things a moment before others do.' },
  iron_bones: { name: 'Iron Bones', w: 7, talent: 1.0, body: 1.5, desc: 'Your bones are dense as temple bronze. External arts come easily.' },
  sword_bone: { name: 'Sword Bone', w: 5, talent: 1.1, sword: 2.0, desc: 'Born to hold a sword. Sword arts master themselves in your hands.' },
  frail: { name: 'Frail Meridians', w: 6, talent: 0.7, health: -15, desc: 'Narrow, brittle meridians. Every breakthrough is a gamble.' },
  pure_yang: { name: 'Pure Yang Body', w: 4, talent: 1.35, heart: -10, desc: 'Fire in the blood. Fast cultivation and a short temper.' },
  poison_body: { name: 'Hundred-Poison Body', w: 3, talent: 1.0, poisonImmune: true, poison: 1.6, desc: 'Poisons do not take hold in you, and poison arts open like flowers.' },
  heaven_spurned: { name: 'Heaven-Spurned Body', w: 3, talent: 0.6, noMadness: true, desc: 'Heaven gave you nothing. At least it cannot take your mind.' },
  heavenly_body: { name: 'Heavenly Body', w: 2, talent: 1.6, desc: 'Once in a generation. Every sect would kill to have you.' },
  nine_yin: { name: 'Nine Yin Absolute Meridians', w: 3, talent: 2.0, curse: 'cold', desc: 'Your meridians are ice. Talent beyond compare, and a cold that will kill you by twenty unless cured.' },
  demon_seed: { name: 'Demon Seed Body', w: 2, talent: 1.3, demonic: 1.6, heart: -15, desc: 'Demonic qi feels like home. Something in you hungers.' },
  ox_strength: { name: 'Ox-Blood Vitality', w: 6, talent: 0.95, health: 15, desc: 'You will outlive fevers that kill others.' },
};

export const CAREERS = {
  farmer: { name: 'Farmer', ranks: ['Field Hand', 'Tenant Farmer', 'Landholder'], pay: [2, 4, 8], minAge: 10, stat: 'body', desc: 'Planting, harvest, taxes, repeat.' },
  escort: { name: 'Escort Guard', ranks: ['Porter', 'Escort Guard', 'Escort Captain', 'Chief Escort'], pay: [3, 7, 14, 30], minAge: 15, stat: 'body', minRealm: 0, faction: 'merchants', desc: 'Guard caravans on dangerous roads.' },
  merchant: { name: 'Merchant', ranks: ['Peddler', 'Shopkeeper', 'Trader', 'Merchant Prince'], pay: [3, 8, 18, 45], minAge: 14, stat: 'charm', faction: 'merchants', desc: 'Buy cheap, sell dear, bribe as needed.' },
  physician: { name: 'Physician', ranks: ['Herb Gatherer', 'Apprentice Physician', 'Physician', 'Divine Physician'], pay: [2, 5, 12, 30], minAge: 12, stat: 'insight', desc: 'Heal the sick. Learn which herbs kill.' },
  smith: { name: 'Blacksmith', ranks: ['Bellows Boy', 'Journeyman Smith', 'Master Smith', 'Legendary Swordsmith'], pay: [2, 5, 11, 26], minAge: 12, stat: 'body', desc: 'Swords for the murim, ploughs for everyone else.' },
  scholar: { name: 'Scholar-Official', ranks: ['Student', 'Licentiate', 'Magistrate', 'Minister'], pay: [0, 6, 16, 40], minAge: 12, stat: 'insight', faction: 'court', exam: true, desc: 'Pass the examinations, serve the throne.' },
  bandit: { name: 'Bandit', ranks: ['Lookout', 'Bandit', 'Bandit Captain', 'Bandit King'], pay: [3, 7, 15, 35], minAge: 14, stat: 'body', faction: 'unorthodox', infamy: true, desc: 'The roads belong to whoever holds them.' },
  assassin: { name: 'Assassin', ranks: ['Errand Knife', 'Assassin', 'Silent Blade', 'Nameless'], pay: [5, 12, 28, 60], minAge: 15, stat: 'body', minRealm: 1, faction: 'unorthodox', infamy: true, desc: 'Contracts, poison and patience.' },
  informant: { name: 'Information Broker', ranks: ['Street Ears', 'Informant', 'Broker', 'Spymaster'], pay: [2, 6, 14, 32], minAge: 12, stat: 'charm', faction: 'merchants', desc: 'Everything has a price, especially secrets.' },
};

// Items. kind: elixir (consumed), material (recipes), weapon, treasure.
export const ITEMS = {
  rice_wine: { name: 'Jar of rice wine', kind: 'gift', price: 2, desc: 'Good for gifts and bad decisions.' },
  jade_pendant: { name: 'Jade pendant', kind: 'gift', price: 12, desc: 'A fine gift for someone you want to impress.' },
  tea_brick: { name: 'Pu’er tea brick', kind: 'gift', price: 5, desc: 'Aged tea, beloved of elders.' },
  qi_pill: { name: 'Qi-Gathering Pill', kind: 'elixir', price: 15, qi: 15, desc: 'Adds a little qi to your dantian.' },
  marrow_pill: { name: 'Marrow-Cleansing Pill', kind: 'elixir', price: 60, qi: 30, body: 3, desc: 'Purges impurities; strengthens the body.' },
  foundation_pill: { name: 'Foundation-Settling Pill', kind: 'elixir', price: 90, breakthrough: 12, desc: 'Steadies the dantian for a breakthrough attempt.' },
  heart_calming: { name: 'Heart-Calming Incense', kind: 'elixir', price: 20, heart: 15, desc: 'Quiets the heart-demon for a time.' },
  healing_salve: { name: 'Golden Wound Salve', kind: 'elixir', price: 10, health: 20, desc: 'Closes cuts and sets minds at ease.' },
  reincarnation_pill: { name: 'Small Reincarnation Pill', kind: 'elixir', price: 400, qi: 100, breakthrough: 20, health: 40, desc: 'Shaolin’s treasure. A decade of cultivation in one swallow.' },
  spirit_ginseng: { name: 'Thousand-Year Spirit Ginseng', kind: 'material', price: 300, desc: 'Grown where qi pools in the mountains.' },
  snow_lotus: { name: 'Heavenly Mountain Snow Lotus', kind: 'material', price: 250, desc: 'Blooms once a decade on Kunlun’s ice.' },
  red_fruit: { name: 'Vermilion Fire Fruit', kind: 'material', price: 200, desc: 'Burns going down; warms the coldest meridians.' },
  serpent_gall: { name: 'Golden Serpent Gall', kind: 'material', price: 120, desc: 'From a serpent older than most dynasties.' },
  lime_powder: { name: 'Pouch of lime powder', kind: 'tool', price: 1, desc: 'Thrown in the eyes. Not honorable. Effective.' },
  fine_sword: { name: 'Fine steel sword', kind: 'weapon', price: 40, power: 4, weapon: 'sword', desc: 'A good blade, well balanced.' },
  famous_sword: { name: 'Autumn Water, a famous sword', kind: 'weapon', price: 900, power: 12, weapon: 'sword', desc: 'It cuts hair blown against its edge.' },
  heavy_saber: { name: 'Heavy saber', kind: 'weapon', price: 35, power: 4, weapon: 'saber', desc: 'More cleaver than art.' },
  wooden_sword: { name: 'Wooden practice sword', kind: 'weapon', price: 1, power: 1, weapon: 'sword', desc: 'Every master started with one.' },
  wheel_bead: { name: 'A cracked black bead', kind: 'treasure', price: 0, desc: 'It is warm, and it should not be. You have seen it before. You are sure of it.' },
};

// Recipes are learned (they carry across lives as memories) and compounded with the craft action.
export const RECIPES = {
  qi_pill: { name: 'Qi-Gathering Pill', makes: 'qi_pill', needs: {}, cost: 6, insight: 15 },
  healing_salve: { name: 'Golden Wound Salve', makes: 'healing_salve', needs: {}, cost: 3, insight: 10 },
  heart_calming: { name: 'Heart-Calming Incense', makes: 'heart_calming', needs: {}, cost: 8, insight: 20 },
  foundation_pill: { name: 'Foundation-Settling Pill', makes: 'foundation_pill', needs: { serpent_gall: 1 }, cost: 20, insight: 35 },
  marrow_pill: { name: 'Marrow-Cleansing Pill', makes: 'marrow_pill', needs: { spirit_ginseng: 1 }, cost: 20, insight: 40 },
  reincarnation_pill: { name: 'Small Reincarnation Pill', makes: 'reincarnation_pill', needs: { spirit_ginseng: 1, snow_lotus: 1 }, cost: 50, insight: 60 },
  yang_cure: { name: 'Nine Suns Decoction', makes: null, cures: 'nine_yin', needs: { red_fruit: 1, snow_lotus: 1 }, cost: 30, insight: 45 },
};
