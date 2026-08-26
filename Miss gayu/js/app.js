/**
 * App Controller
 * Manages 6-level story-driven journey, interactive statement reveals,
 * audio initiation, and WhatsApp actions.
 */
import { CONFIG } from './config.js';
import { AudioController } from './audio.js';
import { MotionManager } from './motion.js';

class App {
  constructor() {
    this.audio = new AudioController();
    this.motion = new MotionManager(this.audio);
    this.init();
  }

  init() {
    this.setupLevel1Opening();
    this.setupLevelNavigation();
    this.setupLevel5Cards();
    this.setupOutcomes();
  }

  setupLevel1Opening() {
    const btnMusic = document.getElementById('btn-sound-mode');
    const btnSilent = document.getElementById('btn-silent-mode');
    const btnOpenThis = document.getElementById('btn-open-this');

    btnMusic?.addEventListener('click', () => {
      btnMusic.classList.add('selected');
      btnSilent?.classList.remove('selected');
      this.audio.startSoundtrack();
    });

    btnSilent?.addEventListener('click', () => {
      btnSilent.classList.add('selected');
      btnMusic?.classList.remove('selected');
      this.audio.mute();
    });

    btnOpenThis?.addEventListener('click', () => {
      this.motion.transitionToLevel('level-02', 2);
    });
  }

  setupLevelNavigation() {
    // Level 2 -> Level 3
    document.getElementById('btn-to-03')?.addEventListener('click', () => {
      this.motion.transitionToLevel('level-03', 3);
    });

    // Level 3 -> Level 4
    document.getElementById('btn-to-04')?.addEventListener('click', () => {
      this.motion.transitionToLevel('level-04', 4);
    });

    // Level 4 -> Level 5
    document.getElementById('btn-to-05')?.addEventListener('click', () => {
      this.motion.transitionToLevel('level-05', 5);
    });

    // Level 5 -> Level 6 (Main Request)
    document.getElementById('btn-to-06')?.addEventListener('click', () => {
      this.motion.transitionToLevel('level-06', 6);
    });
  }

  setupLevel5Cards() {
    const cards = document.querySelectorAll('.statement-glass-card');
    const climaxNotice = document.getElementById('level5-climax-box');
    const btnTellMe = document.getElementById('btn-to-06');
    let revealedCount = 0;

    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (!card.classList.contains('is-revealed')) {
          card.classList.add('is-revealed');
          revealedCount++;

          // Auto-reveal next card or trigger final statement
          if (revealedCount < cards.length) {
            cards[revealedCount].classList.remove('is-hidden-card');
          } else {
            if (climaxNotice) {
              climaxNotice.classList.remove('is-hidden-card');
              climaxNotice.classList.add('is-revealed');
            }
            if (btnTellMe) {
              btnTellMe.classList.remove('is-hidden-card');
            }
          }
        }
      });
    });
  }

  setupOutcomes() {
    const btnYes = document.getElementById('btn-choice-yes');
    const btnTime = document.getElementById('btn-choice-time');

    const linkYesWa = document.getElementById('link-wa-yes');
    const linkTimeWa = document.getElementById('link-wa-time');

    // Build verified WhatsApp URLs
    const yesEncoded = encodeURIComponent(CONFIG.whatsapp.yesMessage);
    const timeEncoded = encodeURIComponent(CONFIG.whatsapp.timeMessage);

    if (linkYesWa) {
      linkYesWa.href = `https://wa.me/${CONFIG.phone}?text=${yesEncoded}`;
    }
    if (linkTimeWa) {
      linkTimeWa.href = `https://wa.me/${CONFIG.phone}?text=${timeEncoded}`;
    }

    // YES Choice
    btnYes?.addEventListener('click', () => {
      this.motion.transitionToLevel('outcome-yes');
    });

    // NEED TIME Choice
    btnTime?.addEventListener('click', () => {
      this.motion.transitionToLevel('outcome-time');
    });
  }
}

// Initialize on DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
