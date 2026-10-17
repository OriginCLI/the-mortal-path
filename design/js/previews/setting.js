// Setting preview: a code-drawn map of the Central Plains with faction territories sized by importance.
import { h, esc } from '../dom.js';
import { termsFor } from './lore.js';
import { chip } from './tone.js';

const FACTIONS = {
  orthodox: { name: 'Orthodox Sects', color: '#6fa8dc', center: [190, 150],
    sites: (T) => [[T.Sorim, 215, 138], [T.Mudang, 200, 178], [T.Hwasan, 166, 140], ['Emei', 118, 196], ['Kunlun', 58, 128], [T.Gaebang, 246, 122]] },
  families: { name: 'Five Great Families', color: '#d8a94a', center: [282, 130],
    sites: (T) => [[T.Namgung, 272, 168], [T.Moyong, 336, 62], [T.Paeng, 256, 92], [T.Dang, 138, 214], [T.Jegal, 302, 116]] },
  unorthodox: { name: 'Unorthodox', color: '#5fa58a', center: [232, 228],
    sites: () => [['Green Forest', 226, 214], ['Water Fortress', 290, 200], ['Black Path', 196, 248]] },
  cult: { name: 'Demonic Cult', color: '#d0453a', center: [62, 70],
    sites: () => [['Ten Thousand Mountains', 60, 66]] },
  court: { name: 'Imperial Court', color: '#b98ad9', center: [286, 70],
    sites: () => [['Imperial Capital', 286, 70]] },
  merchants: { name: 'Merchant Guilds', color: '#e0915a', center: [322, 186],
    sites: () => [['Grand Canal Guild', 322, 186], ['Information Pavilion', 318, 244]] },
  frontier: { name: 'Frontier Powers', color: '#9fb3c8', center: [200, 30],
    sites: () => [['North Sea Ice Palace', 210, 26], ['Southern Barbarian Palace', 168, 282], ['Tibetan Palace', 50, 224]] },
};

const POWER = [
  'A Peak master can fight ten trained soldiers. Nobody flies; lightness skill is just very good parkour.',
  'Masters run across rooftops and water, and internal force can stop a heart with one palm strike.',
  'Peak masters project sword qi a few paces, and Transcendents cut through stone walls.',
  'A Transcendent’s sword aura splits boulders; the strongest can cleave a river for a breath.',
  'Legends level mountains and walk on clouds, and a single shout shatters an army’s morale.',
];
const CULT = {
  evil: 'The Cult is the timeline’s great catastrophe. Its invasion is the thing every regressor tries to stop.',
  complex: 'The Cult has factions, faith and grievances. Some elders are worse than any demon; some are kinder than the Alliance.',
  misunderstood: 'Orthodox histories lie. The truth about the Cult is one of the deepest secrets a regressor can uncover.',
};
const MORAL = [
  'Orthodox means good, Demonic means evil.',
  'Mostly clear lines, with a few hypocrites.',
  'Every faction has saints and monsters.',
  'Righteous sects commit atrocities “for the greater good.”',
  'No clean hands anywhere. Only choices and their costs.',
];

export function settingPreview(a, all) {
  const T = termsFor(all);
  const present = a.importance.filter((id) => a.factions.includes(id));
  const n = present.length || 1;
  const regionName = a.basis === 'original' ? 'The Nine Rivers Realm' : T.region;

  const territories = present.map((id, i) => {
    const f = FACTIONS[id];
    const r = 20 + (n - i) * (34 / n) + (i === 0 ? 8 : 0);
    return `<circle cx="${f.center[0]}" cy="${f.center[1]}" r="${r.toFixed(1)}" fill="${f.color}" fill-opacity="0.16" stroke="${f.color}" stroke-opacity="0.55" stroke-dasharray="${a.morality > 55 ? '3 3' : '0'}"/>`;
  }).join('');
  const pins = present.map((id, i) => {
    const f = FACTIONS[id];
    const big = i < 2;
    return f.sites(T).map(([label, x, y]) => `
      <g class="pin"><circle cx="${x}" cy="${y}" r="${big ? 4 : 3}" fill="${f.color}" stroke="#0f0d0c" stroke-width="1.2"/>
      <text x="${x + 6}" y="${y + 3}" font-size="${big ? 8.5 : 7.5}" fill="#efe4cf" fill-opacity="${big ? 0.95 : 0.75}">${esc(label)}</text></g>`).join('');
  }).join('');

  const svg = `<svg viewBox="0 0 400 300" class="map" role="img" aria-label="Faction map">
    <defs><pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#2a2119"/><circle cx="1" cy="1" r=".5" fill="#3a2e22"/></pattern></defs>
    <rect width="400" height="300" fill="#15110d"/>
    <path d="M30 60 C60 20 140 14 200 18 C270 10 340 30 372 56 C392 96 380 150 360 200 C340 250 300 280 240 286 C180 292 110 286 70 254 C34 226 16 180 18 130 C20 100 22 80 30 60Z" fill="url(#paper)" stroke="#5a4733" stroke-width="1.5"/>
    <path d="M70 92 C110 70 140 110 180 96 C210 86 214 60 240 64 C262 68 268 100 300 104 C320 106 340 96 358 104" fill="none" stroke="#5f7f8f" stroke-width="2.2" stroke-opacity="0.7"/>
    <path d="M60 186 C100 170 130 196 170 190 C210 184 230 200 262 196 C300 192 320 206 362 196" fill="none" stroke="#5f7f8f" stroke-width="2.6" stroke-opacity="0.7"/>
    <path d="M40 120 l10 -14 l10 14 M48 150 l10 -14 l10 14 M90 60 l8 -11 l8 11 M226 212 l8 -11 l8 11" fill="none" stroke="#6b5a45" stroke-width="1.2"/>
    ${territories}
    ${pins}
    <text x="200" y="296" text-anchor="middle" font-size="9" fill="#a8987e" letter-spacing="2">${esc(regionName.toUpperCase())}${a.era === 'ming' ? ' · LATE MING' : ''}</text>
  </svg>`;

  const legend = h('ol', { class: 'legend' }, present.map((id, i) => h('li', {},
    h('i', { style: `background:${FACTIONS[id].color}` }),
    FACTIONS[id].name,
    i === 0 ? h('em', {}, ' · central') : null,
    a.joinable.includes(id) ? h('span', { class: 'join' }, 'joinable') : null)));

  const moralIdx = Math.min(4, Math.round(a.morality / 25));
  const powerIdx = Math.min(4, Math.round(a.power / 25));
  return h('div', { class: 'pv pv-setting' },
    h('div', { class: 'map-wrap', html: svg }),
    legend,
    h('dl', { class: 'facts' },
      h('dt', {}, 'Power'), h('dd', {}, POWER[powerIdx]),
      a.factions.includes('cult') ? [h('dt', {}, 'Cult'), h('dd', {}, CULT[a.cult])] : null,
      h('dt', {}, 'Morality'), h('dd', {}, MORAL[moralIdx]),
      h('dt', {}, 'Reputation'), h('dd', {}, {
        axis: 'One standing from Orthodox to Unorthodox.',
        perFaction: 'Each faction keeps its own ledger of you.',
        both: 'Each faction keeps a ledger, and Fame and Infamy follow your name everywhere.',
      }[a.reputation])),
    a.joinable.includes('none') ? h('div', { class: 'pv-chips' }, chip('Lone-wanderer path available')) : null);
}
