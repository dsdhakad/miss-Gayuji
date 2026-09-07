/**
 * Main Story App State Orchestrator
 * Coordinates scene progression (1-8), memory tabs, and WhatsApp decision outcomes.
 */

class StoryApp {
  constructor() {
    this.currentScene = 1;
    this.totalScenes = 8;
    this.audioContext = null;

    // DOM Elements
    this.sceneIndicatorText = document.getElementById('sceneCounterText');
    this.sceneDotsContainer = document.getElementById('sceneDots');
    this.scenePanes = document.querySelectorAll('.scene-pane');

    this.init();
  }

  init() {
    this.buildSceneDots();
    this.setupSceneEvents();
    this.setupMemoryTabs();
    this.setupDecisionFlows();
    this.updateSceneView(1);
  }

  buildSceneDots() {
    if (!this.sceneDotsContainer) return;
    this.sceneDotsContainer.innerHTML = '';
    for (let i = 1; i <= this.totalScenes; i++) {
      const dot = document.createElement('div');
      dot.className = `step-dot ${i === 1 ? 'active' : ''}`;
      this.sceneDotsContainer.appendChild(dot);
    }
  }

  playSubtleChime(freq = 520, type = 'sine', duration = 0.35) {
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioContext = new AudioContext();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      if (!this.audioContext) return;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.audioContext.currentTime + duration);

      gain.gain.setValueAtTime(0.06, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {}
  }

  setupSceneEvents() {
    document.querySelectorAll('[data-action="next-scene"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.playSubtleChime(580, 'sine', 0.25);
        this.goToNextScene();
      });
    });
  }

  setupMemoryTabs() {
    const chips = document.querySelectorAll('.memory-chip');
    const paneGhagra = document.getElementById('paneGhagra');
    const panePixel = document.getElementById('panePixel');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.playSubtleChime(620, 'sine', 0.2);
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const target = chip.dataset.target;
        if (target === 'ghagra') {
          if (paneGhagra) paneGhagra.style.display = 'block';
          if (panePixel) panePixel.style.display = 'none';
          if (window.story3D) {
            window.story3D.pixelPhone.visible = false;
            window.story3D.femaleCharacter.visible = true;
          }
        } else {
          if (paneGhagra) paneGhagra.style.display = 'none';
          if (panePixel) panePixel.style.display = 'block';
          if (window.story3D) {
            window.story3D.pixelPhone.visible = true;
          }
        }
      });
    });
  }

  setupDecisionFlows() {
    const yesBtn = document.getElementById('decisionYesBtn');
    const needTimeBtn = document.getElementById('decisionNeedTimeBtn');

    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        this.playSubtleChime(880, 'sine', 0.5);
        this.showOutcomeScene(9);
      });
    }

    if (needTimeBtn) {
      needTimeBtn.addEventListener('click', () => {
        this.playSubtleChime(440, 'sine', 0.4);
        this.showOutcomeScene(10);
      });
    }
  }

  goToNextScene() {
    if (this.currentScene < this.totalScenes) {
      this.updateSceneView(this.currentScene + 1);
    }
  }

  updateSceneView(sceneNum) {
    const prevScene = this.currentScene;
    this.currentScene = sceneNum;

    // Counter (e.g. 01 / 08)
    if (this.sceneIndicatorText) {
      const padNum = sceneNum < 10 ? `0${sceneNum}` : sceneNum;
      const padTotal = this.totalScenes < 10 ? `0${this.totalScenes}` : this.totalScenes;
      this.sceneIndicatorText.textContent = `${padNum} / ${padTotal}`;
    }

    // Dots
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
      if (idx + 1 === sceneNum) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Panes
    const oldPane = document.getElementById(`scene-pane-${prevScene}`);
    if (oldPane && prevScene !== sceneNum) {
      oldPane.classList.remove('active');
      setTimeout(() => {
        oldPane.style.display = 'none';
      }, 300);
    }

    const newPane = document.getElementById(`scene-pane-${sceneNum}`);
    if (newPane) {
      setTimeout(() => {
        newPane.style.display = 'block';
        requestAnimationFrame(() => {
          newPane.classList.add('active');
        });
      }, prevScene !== sceneNum ? 150 : 0);
    }

    // 3D Scene View
    if (window.story3D) {
      window.story3D.setScene(sceneNum);
    }
  }

  showOutcomeScene(outcomeId) {
    const scene8 = document.getElementById('scene-pane-8');
    if (scene8) {
      scene8.classList.remove('active');
      scene8.style.display = 'none';
    }

    if (outcomeId === 9) {
      const yesPane = document.getElementById('outcome-pane-yes');
      if (yesPane) {
        yesPane.style.display = 'block';
        requestAnimationFrame(() => yesPane.classList.add('active'));
      }
      if (window.story3D) window.story3D.setScene(9);
    } else if (outcomeId === 10) {
      const timePane = document.getElementById('outcome-pane-time');
      if (timePane) {
        timePane.style.display = 'block';
        requestAnimationFrame(() => timePane.classList.add('active'));
      }
      if (window.story3D) window.story3D.setScene(10);
    }
  }
}

// Global App Instance
window.storyApp = null;
document.addEventListener('DOMContentLoaded', () => {
  window.storyApp = new StoryApp();
});
