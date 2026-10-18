// Persistence. The active wheel (meta + current life) autosaves; five manual slots hold snapshots;
// settings are separate. All of it can be exported to, and imported from, one JSON file.
// Every storage access is guarded: private windows and blocked storage fall back to memory.

export const SAVE_VERSION = 1;
const PREFIX = 'mortal-path.';
const KEYS = { active: 'active', settings: 'settings', slot: (n) => `slot.${n}` };
export const SLOT_COUNT = 5;

const memory = new Map();
let storageOk = null;

function backend() {
  if (storageOk === null) {
    try {
      const k = `${PREFIX}probe`;
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      storageOk = true;
    } catch {
      storageOk = false;
    }
  }
  return storageOk ? localStorage : null;
}

export const storageAvailable = () => !!backend();

function read(key) {
  const b = backend();
  try {
    const txt = b ? b.getItem(PREFIX + key) : memory.get(key);
    return txt ? JSON.parse(txt) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  const txt = JSON.stringify(value);
  const b = backend();
  try {
    if (b) b.setItem(PREFIX + key, txt);
    else memory.set(key, txt);
    return true;
  } catch {
    memory.set(key, txt);
    return false;
  }
}

function remove(key) {
  const b = backend();
  try { if (b) b.removeItem(PREFIX + key); } catch { /* ignore */ }
  memory.delete(key);
}

// Migrations: bump SAVE_VERSION and add a step when the save shape changes.
const MIGRATIONS = {};
export function migrate(save) {
  if (!save || typeof save !== 'object') return null;
  let v = save.v || 1;
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (step) save = step(save);
    v += 1;
    save.v = v;
  }
  return save;
}

export const loadActive = () => migrate(read(KEYS.active));
export const saveActive = (save) => write(KEYS.active, { ...save, v: SAVE_VERSION, savedAt: Date.now() });
export const clearActive = () => remove(KEYS.active);

export const loadSlot = (n) => migrate(read(KEYS.slot(n)));
export const saveSlot = (n, save, label) => write(KEYS.slot(n), { ...save, v: SAVE_VERSION, savedAt: Date.now(), label });
export const clearSlot = (n) => remove(KEYS.slot(n));
export function slotSummaries() {
  const out = [];
  for (let n = 1; n <= SLOT_COUNT; n++) {
    const s = read(KEYS.slot(n));
    out.push(s ? { n, label: s.label, savedAt: s.savedAt } : { n, empty: true });
  }
  return out;
}

export const loadSettings = () => read(KEYS.settings);
export const saveSettings = (s) => write(KEYS.settings, s);

export function exportAll() {
  const slots = {};
  for (let n = 1; n <= SLOT_COUNT; n++) {
    const s = read(KEYS.slot(n));
    if (s) slots[n] = s;
  }
  return JSON.stringify({
    format: 'the-mortal-path/save', v: SAVE_VERSION, exportedAt: new Date().toISOString(),
    active: read(KEYS.active), slots, settings: read(KEYS.settings),
  });
}

export function importAll(text) {
  const data = JSON.parse(text);
  if (!data || data.format !== 'the-mortal-path/save') throw new Error('That file is not a Mortal Path save.');
  if (data.active) write(KEYS.active, migrate(data.active));
  for (let n = 1; n <= SLOT_COUNT; n++) {
    if (data.slots && data.slots[n]) write(KEYS.slot(n), migrate(data.slots[n]));
  }
  if (data.settings) write(KEYS.settings, data.settings);
  return true;
}
