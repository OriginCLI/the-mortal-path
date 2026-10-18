// The music director: adaptive, generated music (spec: Yu mode, 76 BPM, all five instruments),
// ambience chosen by place, season and weather, cinematic sound effects, and restraint while reading.
import * as synth from '../../../shared/audio/synth.js';
import { settings } from './settings.js';

const INSTRUMENTS = ['pluck', 'flute', 'bowed', 'bells', 'drums'];
const MOODS = {
  calm: { music: 'ensemble', scale: 'yu', tempo: 76 },
  childhood: { music: 'sparse', scale: 'pyeongjo', tempo: 72 },
  wonder: { music: 'sparse', scale: 'gung', tempo: 70 },
  tension: { music: 'adaptive', scale: 'yu', tempo: 80 },
  danger: { music: 'battle', scale: 'yu', tempo: 100 },
  sorrow: { music: 'sparse', scale: 'gyemyeonjo', tempo: 58 },
  triumph: { music: 'ensemble', scale: 'gung', tempo: 92 },
  ambient: { music: 'ambient', scale: 'yu', tempo: 60 },
};

class Director {
  constructor() {
    this.started = false;
    this.mood = 'calm';
    this.theme = null;
    this.timer = 0;
    this.seed = Math.floor(Math.random() * 10000);
    this.beds = new Map();
    this.wantBeds = [];
    this.ducked = false;
    this.restMood = 'calm';
    this.inMoment = false;
  }

  // Browsers need a gesture first; the app calls this on the first tap (spec: on after first tap).
  unlock() {
    if (this.started || !synth.supported()) return;
    this.started = true;
    synth.resume();
    this.apply();
    this.playNext();
    this.syncBeds();
  }

  apply() {
    synth.configure({ sound: settings.sound, volume: settings.sound ? settings.master : 0 });
    synth.setChannelVolume('music', this.ducked ? settings.music * 0.35 : settings.music, 0.4);
    synth.setChannelVolume('ambience', settings.ambience, 0.4);
    synth.setChannelVolume('sfx', settings.sfx, 0.1);
  }

  setMood(m) {
    if (!MOODS[m] || m === this.mood) return;
    this.mood = m;
    if (!this.started) return;
    if (this.theme) this.theme.stop(m === 'danger' ? 0.3 : 1.2);
    this.theme = null;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.playNext(), m === 'danger' ? 200 : 1600);
  }

  // The resting mood follows the state of the life (childhood, calm, tension, sorrow).
  rest(m) { if (!MOODS[m]) return; this.restMood = m; if (this.mood !== 'danger' && !this.inMoment) this.setMood(m); }

  // A moment (triumph, wonder, sorrow) plays one theme, then the music returns to the resting mood.
  moment(m) {
    if (!MOODS[m] || this.mood === 'danger') return;
    this.inMoment = true;
    if (this.mood === m) return;
    this.setMood(m);
  }

  // Leaving combat: back to whatever the life is like now.
  calm() { this.inMoment = false; if (this.mood === 'danger') { this.mood = ''; this.setMood(this.restMood); } }

  playNext() {
    if (!this.started || !settings.sound) { this.timer = setTimeout(() => this.playNext(), 3000); return; }
    if (this.momentPlayed) { this.momentPlayed = false; this.inMoment = false; this.mood = this.restMood; }
    const p = MOODS[this.mood];
    if (this.inMoment) this.momentPlayed = true;
    this.seed = (this.seed * 31 + 7) % 10007;
    this.theme = synth.playTheme({ instruments: INSTRUMENTS, music: p.music, scale: p.scale, tempo: p.tempo, seed: this.seed, dest: synth.channel('music'), gain: 0.9 });
    // A breath of silence between themes keeps the music from becoming wallpaper.
    const gap = this.mood === 'danger' ? 0 : 4000 + Math.random() * 6000;
    this.timer = setTimeout(() => this.playNext(), this.theme.duration * 1000 + gap);
  }

  // Spec "silence while reading": duck the music while an event is open.
  duck(on) { this.ducked = on; if (this.started) this.apply(); }

  setAmbience(scene, season, weather, travelling) {
    const beds = [];
    if (weather === 'rain') beds.push('rain');
    if (['lake', 'river'].includes(scene)) beds.push('water');
    if (['city', 'palace'].includes(scene) && !travelling) beds.push('crowd');
    if (['temple'].includes(scene)) beds.push('temple');
    if (['peaks', 'snow', 'desert', 'demonic'].includes(scene) || season === 3) beds.push('wind');
    if (['village', 'forest', 'lake', 'river', 'estate'].includes(scene) && weather !== 'rain') beds.push(season === 1 || season === 2 ? 'insects' : 'birds');
    if (travelling || scene === 'demonic') beds.push('fire');
    if (!beds.length) beds.push('wind');
    this.wantBeds = beds.slice(0, 2);
    this.syncBeds();
  }

  syncBeds() {
    if (!this.started) return;
    for (const [k, stop] of this.beds) if (!this.wantBeds.includes(k)) { stop(); this.beds.delete(k); }
    for (const k of this.wantBeds) if (!this.beds.has(k)) this.beds.set(k, synth.ambience(k, { birds: 0.5, insects: 0.35, crowd: 0.5 }[k] ?? 0.6, synth.channel('ambience')));
  }

  sfx(name) { if (this.started && settings.sound) synth.sfx(name, { intensity: 1 }); }
}

export const director = new Director();
