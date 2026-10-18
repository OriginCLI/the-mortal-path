// Registers every event file. Add new files here.
import { defineEvents } from '../../engine/registry.js';
import witness from './witness.js';
import childhood from './childhood.js';
import sect from './sect.js';
import fortune from './fortune.js';
import mysteries from './mysteries.js';

const FILES = { witness, childhood, sect, fortune, mysteries };

let done = false;
export function registerAllEvents() {
  if (done) return;
  done = true;
  for (const [name, list] of Object.entries(FILES)) defineEvents(list, name);
}
