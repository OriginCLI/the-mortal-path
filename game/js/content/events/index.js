// Registers every event file. Add new files here.
import { defineEvents } from '../../engine/registry.js';
import witness from './witness.js';
import childhood from './childhood.js';
import sect from './sect.js';
import fortune from './fortune.js';
import mysteries from './mysteries.js';
import bonds from './bonds.js';
import jianghu from './jianghu.js';
import work from './work.js';
import life from './life.js';
import cultivation from './cultivation.js';
import tournament from './tournament.js';
import war from './war.js';
import crime from './crime.js';
import fortune2 from './fortune2.js';
import sect2 from './sect2.js';
import bonds2 from './bonds2.js';
import jianghu2 from './jianghu2.js';
import trials from './trials.js';

const FILES = { witness, childhood, sect, fortune, mysteries, bonds, jianghu, work, life, cultivation, tournament, war, crime, fortune2, sect2, bonds2, jianghu2, trials };

let done = false;
export function registerAllEvents() {
  if (done) return;
  done = true;
  for (const [name, list] of Object.entries(FILES)) defineEvents(list, name);
}
