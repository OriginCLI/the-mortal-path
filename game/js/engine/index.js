// Assembles the Game from its systems and registers all content. The UI and the tools import this.
import { Game, createWheel, newLife } from './game.js';
import { lifeSystem } from '../systems/life.js';
import { cultivationSystem } from '../systems/cultivation.js';
import { combatSystem } from '../systems/combat.js';
import { npcSystem } from '../systems/npcs.js';
import { bondsSystem } from '../systems/bonds.js';
import { worldSystem } from '../systems/world.js';
import { wheelSystem } from '../systems/wheel.js';
import { registerAllEvents } from '../content/events/index.js';

Object.assign(Game.prototype, lifeSystem, cultivationSystem, combatSystem, npcSystem, bondsSystem, worldSystem, wheelSystem);
registerAllEvents();
Game.index();

export { Game };

// Begin a new wheel (a new character). opts: { name, family, gender, origin, mode, seed, constitution }
export function startWheel(opts, gameOpts = {}) {
  const meta = createWheel(opts);
  const life = newLife(meta);
  const g = new Game({ meta, life }, gameOpts);
  g.initLife(false);
  g.save();
  return g;
}

export function loadGame(save, gameOpts = {}) {
  return new Game(save, gameOpts);
}
