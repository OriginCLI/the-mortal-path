// Registers every event file. Add new files here.
import { defineEvents } from '../../engine/registry.js';
import witness from './witness.js';

const FILES = { witness };

let done = false;
export function registerAllEvents() {
  if (done) return;
  done = true;
  for (const [name, list] of Object.entries(FILES)) defineEvents(list, name);
}
