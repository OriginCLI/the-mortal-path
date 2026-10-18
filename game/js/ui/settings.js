// Player settings (separate from saves): audio channels, motion, text size, contrast, childhood montage.
import { loadSettings, saveSettings } from '../core/store.js';

export const DEFAULTS = {
  sound: true, master: 0.8, music: 0.55, ambience: 0.5, sfx: 0.8,
  motion: 'full', text: 'm', contrast: 'normal', montage: true, autoFight: false,
};

export const settings = { ...DEFAULTS, ...(loadSettings() || {}) };

export function applySettings() {
  const root = document.documentElement;
  const osReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = settings.motion === 'full' && osReduced && !settings.motionOverride ? 'reduced' : settings.motion;
  root.dataset.text = settings.text;
  root.dataset.contrast = settings.contrast;
}

export function setSetting(k, v) {
  settings[k] = v;
  saveSettings(settings);
  applySettings();
}

export const motion = () => document.documentElement.dataset.motion || 'full';
