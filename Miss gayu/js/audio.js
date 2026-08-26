/**
 * Romantic Audio Controller
 * Handles background music, Web Audio procedural felt-piano fallback,
 * smooth volume ramping, ducking for emotional climaxes, and mute UI.
 */
import { CONFIG } from './config.js';

export class AudioController {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'none';
    this.audioElement.loop = true;
    this.audioElement.volume = 0;

    this.isPlaying = false;
    this.isMuted = false;
    this.hasUserInitiated = false;
    this.fadeInterval = null;
    this.isUsingProceduralFallback = false;

    // Web Audio Fallback
    this.audioCtx = null;
    this.masterGain = null;
    this.synthInterval = null;

    this.toggleButton = document.getElementById('audio-toggle');
    this.setupListeners();
  }

  setupListeners() {
    this.audioElement.addEventListener('error', () => {
      this.isUsingProceduralFallback = true;
      if (this.isPlaying && !this.isMuted) {
        this.startProceduralWarmth();
      }
    });

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggleMute());
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.isPlaying && !this.isMuted) this.fadeVolume(0, 400);
      } else {
        if (this.isPlaying && !this.isMuted) this.fadeVolume(CONFIG.audio.targetVolume, 800);
      }
    });
  }

  startSoundtrack() {
    this.hasUserInitiated = true;
    this.isPlaying = true;
    this.isMuted = false;
    this.updateButtonUI();

    try {
      this.audioElement.src = CONFIG.audio.src;
      this.audioElement.volume = 0;
      const promise = this.audioElement.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            this.fadeVolume(CONFIG.audio.targetVolume, CONFIG.audio.fadeDurationMs);
          })
          .catch(() => {
            this.isUsingProceduralFallback = true;
            this.startProceduralWarmth();
          });
      }
    } catch {
      this.isUsingProceduralFallback = true;
      this.startProceduralWarmth();
    }
  }

  startProceduralWarmth() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (!this.masterGain) {
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }

      this.masterGain.gain.linearRampToValueAtTime(0.09, this.audioCtx.currentTime + 2);

      // Intimate felt piano & strings frequencies
      const chordSets = [
        [146.83, 220.0, 293.66, 369.99, 440.0],  // D major
        [123.47, 185.0, 246.94, 293.66, 369.99],  // B minor
        [164.81, 246.94, 329.63, 392.0, 493.88],  // G major
        [110.0, 164.81, 220.0, 277.18, 329.63]    // A major
      ];

      let chordIdx = 0;
      const playNote = () => {
        if (!this.isPlaying || this.isMuted || !this.audioCtx) return;

        const currentNotes = chordSets[chordIdx % chordSets.length];
        chordIdx++;

        const note1 = currentNotes[Math.floor(Math.random() * currentNotes.length)];
        const note2 = currentNotes[Math.floor(Math.random() * currentNotes.length)];

        [note1, note2].forEach((freq, offsetIdx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const filter = this.audioCtx.createBiquadFilter();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(420 + Math.random() * 160, this.audioCtx.currentTime);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

          const now = this.audioCtx.currentTime + offsetIdx * 0.35;
          const duration = 4.0 + Math.random() * 2;

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 1.0);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + duration);
        });
      };

      if (!this.synthInterval) {
        playNote();
        this.synthInterval = setInterval(playNote, 3200);
      }
    } catch (err) {
      console.warn('Web Audio synthesis not available', err);
    }
  }

  stopProceduralWarmth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.6);
    }
  }

  toggleMute() {
    if (!this.hasUserInitiated) return;
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  mute() {
    this.isMuted = true;
    this.fadeVolume(0, 400, () => {
      this.audioElement.pause();
      if (this.isUsingProceduralFallback) this.stopProceduralWarmth();
    });
    this.updateButtonUI();
  }

  unmute() {
    this.isMuted = false;
    if (this.isUsingProceduralFallback) {
      this.startProceduralWarmth();
    } else {
      this.audioElement.play().catch(() => {});
      this.fadeVolume(CONFIG.audio.targetVolume, 600);
    }
    this.updateButtonUI();
  }

  duck() {
    if (!this.isPlaying || this.isMuted) return;
    this.fadeVolume(CONFIG.audio.duckVolume, 1000);
  }

  restoreVolume() {
    if (!this.isPlaying || this.isMuted) return;
    this.fadeVolume(CONFIG.audio.targetVolume, 1200);
  }

  fadeVolume(targetVol, durationMs, onComplete) {
    if (this.isUsingProceduralFallback) {
      if (this.masterGain && this.audioCtx) {
        const timeSec = Math.max(0.1, durationMs / 1000);
        this.masterGain.gain.linearRampToValueAtTime(targetVol * 0.14, this.audioCtx.currentTime + timeSec);
      }
      if (onComplete) setTimeout(onComplete, durationMs);
      return;
    }

    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const startVol = this.audioElement.volume;
    const diff = targetVol - startVol;
    if (Math.abs(diff) < 0.01) {
      this.audioElement.volume = targetVol;
      if (onComplete) onComplete();
      return;
    }

    const steps = 20;
    const stepInterval = durationMs / steps;
    let step = 0;

    this.fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      this.audioElement.volume = Math.min(1, Math.max(0, startVol + diff * eased));

      if (step >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.audioElement.volume = targetVol;
        if (onComplete) onComplete();
      }
    }, stepInterval);
  }

  updateButtonUI() {
    if (!this.toggleButton) return;
    if (!this.hasUserInitiated) {
      this.toggleButton.classList.add('is-hidden');
      return;
    }

    this.toggleButton.classList.remove('is-hidden');
    if (this.isMuted) {
      this.toggleButton.setAttribute('aria-label', 'Music muted. Tap to turn sound on.');
      this.toggleButton.innerHTML = `<span class="sound-icon">♪̸</span><span class="sound-label">Muted</span>`;
      this.toggleButton.classList.add('muted');
    } else {
      this.toggleButton.setAttribute('aria-label', 'Music playing. Tap to mute.');
      this.toggleButton.innerHTML = `<span class="sound-icon">♪</span><span class="sound-label">Music</span>`;
      this.toggleButton.classList.remove('muted');
    }
  }
}
