import { SOUNDS } from './config.js';
import { gameState } from './state.js';

export class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.muted = false;
    this.initializeSounds();
  }

  initializeSounds() {
    Object.entries(SOUNDS).forEach(([name, { src, volume }]) => {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.load();
      this.sounds.set(name, audio);
    });
  }

  play(name) {
    if (this.muted || !gameState.settings.sound) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.warn(`Could not play sound ${name}:`, e));
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return !this.muted;
  }

  setVolume(volume) {
    this.sounds.forEach(sound => {
      sound.volume = volume;
    });
  }

  preload() {
    // Preload all sounds
    this.sounds.forEach(sound => {
      sound.load();
    });
  }
}

export const soundManager = new SoundManager();
