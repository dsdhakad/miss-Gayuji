/**
 * Visual FX, Floating Petals, Glowing Guide Orb, and Level Transitions
 */
import { CONFIG } from './config.js';

export class MotionManager {
  constructor(audioController) {
    this.audioController = audioController;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.currentLevel = 1;
    this.totalLevels = CONFIG.visuals.totalLevels || 6;
    
    // Canvas Petals
    this.petalsCanvas = document.getElementById('petals-canvas');
    this.petalsCtx = this.petalsCanvas ? this.petalsCanvas.getContext('2d') : null;
    this.petals = [];

    // Floating Guide Orb
    this.guideOrb = document.getElementById('guide-orb');

    // Progress Elements
    this.progressText = document.getElementById('journey-progress-text');
    this.progressBar = document.getElementById('journey-progress-fill');

    this.init();
  }

  init() {
    this.setupPetals();
    this.updateProgress(1);
  }

  setupPetals() {
    if (!this.petalsCanvas || !this.petalsCtx || this.reducedMotion) return;

    const resize = () => {
      this.petalsCanvas.width = window.innerWidth;
      this.petalsCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const count = CONFIG.visuals.petalCount || 16;
    this.petals = Array.from({ length: count }, () => this.createPetal(true));

    const render = () => {
      this.petalsCtx.clearRect(0, 0, this.petalsCanvas.width, this.petalsCanvas.height);

      this.petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * p.speedX;
        p.angle += p.angularSpeed;
        p.rotation += p.rotationSpeed;

        if (p.y > this.petalsCanvas.height + 20) {
          Object.assign(p, this.createPetal(false));
        }

        this.petalsCtx.save();
        this.petalsCtx.translate(p.x, p.y);
        this.petalsCtx.rotate(p.rotation);
        this.petalsCtx.globalAlpha = p.opacity;

        this.petalsCtx.beginPath();
        this.petalsCtx.moveTo(0, 0);
        this.petalsCtx.bezierCurveTo(p.size * 0.5, -p.size * 0.7, p.size * 0.8, -p.size * 0.2, 0, p.size);
        this.petalsCtx.bezierCurveTo(-p.size * 0.8, -p.size * 0.2, -p.size * 0.5, -p.size * 0.7, 0, 0);
        this.petalsCtx.fillStyle = p.color;
        this.petalsCtx.fill();
        this.petalsCtx.restore();
      });

      requestAnimationFrame(render);
    };

    render();
  }

  createPetal(isInitial) {
    const isBlue = Math.random() > 0.45;
    return {
      x: Math.random() * (this.petalsCanvas?.width || window.innerWidth),
      y: isInitial ? Math.random() * (this.petalsCanvas?.height || window.innerHeight) : -20,
      size: 5 + Math.random() * 8,
      speedY: 0.35 + Math.random() * 0.45,
      speedX: 0.25 + Math.random() * 0.4,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: 0.01 + Math.random() * 0.015,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.15 + Math.random() * 0.3,
      color: isBlue ? 'rgba(105, 166, 255, 0.45)' : 'rgba(246, 248, 252, 0.4)'
    };
  }

  updateProgress(levelNumber) {
    this.currentLevel = levelNumber;
    if (this.progressText) {
      const padded = levelNumber < 10 ? `0${levelNumber}` : levelNumber;
      this.progressText.textContent = `${padded} / 0${this.totalLevels}`;
    }
    if (this.progressBar) {
      const percent = (levelNumber / this.totalLevels) * 100;
      this.progressBar.style.width = `${percent}%`;
    }

    // Move guide orb position according to level
    if (this.guideOrb && !this.reducedMotion) {
      const offsets = [
        { x: '50%', y: '28%' },
        { x: '45%', y: '22%' },
        { x: '55%', y: '32%' },
        { x: '50%', y: '26%' },
        { x: '48%', y: '30%' },
        { x: '50%', y: '35%' }
      ];
      const target = offsets[levelNumber - 1] || { x: '50%', y: '30%' };
      this.guideOrb.style.left = target.x;
      this.guideOrb.style.top = target.y;
    }
  }

  transitionToLevel(nextLevelId, levelNumber) {
    const currentScene = document.querySelector('.scene.active');
    const nextScene = document.getElementById(nextLevelId);
    if (!nextScene) return;

    // Handle music ducking on Level 5 and Level 6
    if (levelNumber === 5 || levelNumber === 6) {
      this.audioController.duck();
    } else {
      this.audioController.restoreVolume();
    }

    if (currentScene) {
      currentScene.classList.add('scene-exit-3d');
      setTimeout(() => {
        currentScene.classList.remove('active', 'scene-exit-3d');
        currentScene.style.display = 'none';

        nextScene.style.display = 'flex';
        void nextScene.offsetWidth; // force reflow
        nextScene.classList.add('active', 'scene-enter-3d');

        setTimeout(() => {
          nextScene.classList.remove('scene-enter-3d');
        }, 550);

        if (levelNumber) {
          this.updateProgress(levelNumber);
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 400);
    } else {
      nextScene.style.display = 'flex';
      nextScene.classList.add('active');
      if (levelNumber) this.updateProgress(levelNumber);
    }
  }
}
