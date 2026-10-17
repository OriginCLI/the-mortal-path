// Maps each trial id to its live preview renderer: (answers, allAnswers, env) => Node.
import { tonePreview } from './tone.js';
import { settingPreview } from './setting.js';
import { cultivationPreview } from './cultivation.js';
import { combatPreview } from './combat.js';
import { regressionPreview } from './regression.js';
import { relationshipsPreview } from './relationships.js';
import { eventsPreview } from './events.js';
import { lifePreview } from './life.js';
import { uiPreview } from './ui.js';
import { soundPreview } from './sound.js';
import { difficultyPreview } from './difficulty.js';
import { scopePreview } from './scope.js';

export const PREVIEWS = {
  tone: { title: 'The life log, as you would write it', render: tonePreview },
  setting: { title: 'Map of the factions', render: settingPreview },
  cultivation: { title: 'The staircase to Heaven', render: cultivationPreview },
  combat: { title: 'A duel at the Red Lantern Inn', render: combatPreview },
  regression: { title: 'The wheel of lives', render: regressionPreview },
  relationships: { title: 'Your web of bonds', render: relationshipsPreview },
  events: { title: 'An event from the deck', render: eventsPreview },
  life: { title: 'A year in a mortal life', render: lifePreview },
  ui: { title: 'The game screen', render: uiPreview },
  audio: { title: 'The sound of the world', render: soundPreview, live: true },
  difficulty: { title: 'Ten thousand lives, simulated', render: difficultyPreview },
  scope: { title: 'The first step', render: scopePreview },
};
