/**
 * "Just One Conversation" — Complete Bulletproof Journey Engine
 * Works seamlessly both on web servers and local file:// protocols (Zero CORS issues).
 * Includes 3D Background Engine, Procedural Audio Synthesizer, and Level Routing.
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION
  // =========================================================================
  const CONFIG = {
    phone: "919202797157",
    whatsapp: {
      yesMessage: "Okay, we can meet once.",
      timeMessage: "I read everything. I just need some time."
    },
    audio: {
      src: "assets/audio/letter-theme.mp3",
      fadeDurationMs: 1400,
      targetVolume: 0.55,
      duckVolume: 0.15
    },
    visuals: {
      totalLevels: 6,
      particle3DCount: 45,
      petal3DCount: 22
    }
  };

  // =========================================================================
  // 2. ROMANTIC AUDIO CONTROLLER
  // =========================================================================
  class AudioController {
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

      // Web Audio Synthesizer for Felt Piano & Ambient Strings
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

        // Romantic pentatonic chord arpeggios in D major / B minor
        const chordSets = [
          [146.83, 220.0, 293.66, 369.99, 440.0],
          [123.47, 185.0, 246.94, 293.66, 369.99],
          [164.81, 246.94, 329.63, 392.0, 493.88],
          [110.0, 164.81, 220.0, 277.18, 329.63]
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
            const duration = 4.2 + Math.random() * 2;

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
        console.warn('Web Audio synth unavailable', err);
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

  // =========================================================================
  // 3. 3D BACKGROUND PERSPECTIVE ENGINE (Petals, Starfield & Constellation)
  // =========================================================================
  class Background3DEngine {
    constructor() {
      this.canvas = document.getElementById('petals-canvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.fov = 320;
      
      // 3D Particles & 3D Petals
      this.particles = [];
      this.petals = [];
      
      // Interactive mouse/touch parallax tilt
      this.tiltX = 0;
      this.tiltY = 0;
      this.targetTiltX = 0;
      this.targetTiltY = 0;

      this.init();
    }

    init() {
      if (!this.canvas || !this.ctx || this.reducedMotion) return;

      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Mouse/Touch 3D Parallax
      window.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / this.width) - 0.5;
        const normY = (e.clientY / this.height) - 0.5;
        this.targetTiltX = normX * 0.4;
        this.targetTiltY = normY * 0.4;
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          const normX = (t.clientX / this.width) - 0.5;
          const normY = (t.clientY / this.height) - 0.5;
          this.targetTiltX = normX * 0.35;
          this.targetTiltY = normY * 0.35;
        }
      }, { passive: true });

      // Generate 3D Space Elements
      this.generateElements();
      this.animate();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }

    generateElements() {
      // 3D Star/Constellation Nodes
      const pCount = CONFIG.visuals.particle3DCount || 45;
      this.particles = [];
      for (let i = 0; i < pCount; i++) {
        this.particles.push({
          x: (Math.random() - 0.5) * this.width * 1.5,
          y: (Math.random() - 0.5) * this.height * 1.5,
          z: Math.random() * 800 + 50,
          speedZ: 0.4 + Math.random() * 0.6,
          radius: 1.2 + Math.random() * 1.8,
          color: Math.random() > 0.4 ? 'rgba(105, 166, 255,' : 'rgba(246, 248, 252,'
        });
      }

      // 3D Tumbling Flower Petals
      const petCount = CONFIG.visuals.petal3DCount || 22;
      this.petals = [];
      for (let i = 0; i < petCount; i++) {
        this.petals.push(this.create3DPetal(true));
      }
    }

    create3DPetal(randomZ = false) {
      return {
        x: (Math.random() - 0.5) * this.width * 1.4,
        y: (Math.random() - 0.5) * this.height * 1.4,
        z: randomZ ? Math.random() * 700 + 50 : 750,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: 0.6 + Math.random() * 0.8,
        speedZ: -0.4 - Math.random() * 0.5,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX: 0.015 + Math.random() * 0.02,
        rotSpeedY: 0.01 + Math.random() * 0.02,
        rotSpeedZ: 0.008 + Math.random() * 0.015,
        size: 7 + Math.random() * 9,
        isBlue: Math.random() > 0.4
      };
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Smooth tilt lerp
      this.tiltX += (this.targetTiltX - this.tiltX) * 0.05;
      this.tiltY += (this.targetTiltY - this.tiltY) * 0.05;

      const centerX = this.width / 2;
      const centerY = this.height / 2;

      // 1. Render 3D Background Particle Constellations
      const projectedNodes = [];
      this.particles.forEach((p) => {
        p.z -= p.speedZ;
        if (p.z <= 10) {
          p.z = 800;
          p.x = (Math.random() - 0.5) * this.width * 1.5;
          p.y = (Math.random() - 0.5) * this.height * 1.5;
        }

        // Apply 3D perspective projection with tilt
        const rotX = p.x * Math.cos(this.tiltX) - p.z * Math.sin(this.tiltX);
        const rotZ = p.x * Math.sin(this.tiltX) + p.z * Math.cos(this.tiltX);
        const rotY = p.y + this.tiltY * 120;

        const scale = this.fov / (this.fov + rotZ);
        const projX = centerX + rotX * scale;
        const projY = centerY + rotY * scale;

        if (projX >= 0 && projX <= this.width && projY >= 0 && projY <= this.height) {
          const alpha = Math.min(0.8, Math.max(0.1, (1 - rotZ / 800) * 0.7));
          this.ctx.beginPath();
          this.ctx.arc(projX, projY, p.radius * scale, 0, Math.PI * 2);
          this.ctx.fillStyle = `${p.color} ${alpha})`;
          this.ctx.shadowBlur = 8 * scale;
          this.ctx.shadowColor = '#69A6FF';
          this.ctx.fill();
          this.ctx.shadowBlur = 0;

          projectedNodes.push({ x: projX, y: projY, alpha: alpha });
        }
      });

      // Subtle constellation lines between nearby 3D stars
      this.ctx.strokeStyle = 'rgba(45, 107, 255, 0.12)';
      this.ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].x - projectedNodes[j].x;
          const dy = projectedNodes[i].y - projectedNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            this.ctx.beginPath();
            this.ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y);
            this.ctx.lineTo(projectedNodes[j].x, projectedNodes[j].y);
            this.ctx.stroke();
          }
        }
      }

      // 2. Render 3D Tumbling Flower Petals with full 3D rotation
      this.petals.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX;
        petal.z += petal.speedZ;
        petal.rotX += petal.rotSpeedX;
        petal.rotY += petal.rotSpeedY;
        petal.rotZ += petal.rotSpeedZ;

        if (petal.z <= 10 || petal.y > this.height * 0.8) {
          Object.assign(petal, this.create3DPetal(false));
        }

        const rotX = petal.x * Math.cos(this.tiltX) - petal.z * Math.sin(this.tiltX);
        const rotZ = petal.x * Math.sin(this.tiltX) + petal.z * Math.cos(this.tiltX);
        const rotY = petal.y + this.tiltY * 150;

        const scale = this.fov / (this.fov + Math.max(1, rotZ));
        const projX = centerX + rotX * scale;
        const projY = centerY + rotY * scale;

        const alpha = Math.min(0.65, Math.max(0.12, (1 - rotZ / 750) * 0.6));

        this.ctx.save();
        this.ctx.translate(projX, projY);
        this.ctx.scale(scale * Math.cos(petal.rotY), scale * Math.sin(petal.rotX));
        this.ctx.rotate(petal.rotZ);

        this.ctx.beginPath();
        const s = petal.size;
        this.ctx.moveTo(0, -s);
        this.ctx.bezierCurveTo(s * 0.7, -s * 0.6, s * 0.9, s * 0.3, 0, s);
        this.ctx.bezierCurveTo(-s * 0.9, s * 0.3, -s * 0.7, -s * 0.6, 0, -s);

        this.ctx.fillStyle = petal.isBlue
          ? `rgba(105, 166, 255, ${alpha})`
          : `rgba(246, 248, 252, ${alpha * 0.85})`;
        this.ctx.shadowBlur = 10 * scale;
        this.ctx.shadowColor = petal.isBlue ? '#2D6BFF' : '#ffffff';
        this.ctx.fill();
        this.ctx.restore();
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // =========================================================================
  // 4. MAIN JOURNEY ORCHESTRATOR
  // =========================================================================
  class JourneyApp {
    constructor() {
      this.audio = new AudioController();
      this.bg3D = new Background3DEngine();
      this.currentLevel = 1;
      this.totalLevels = CONFIG.visuals.totalLevels || 6;

      this.progressText = document.getElementById('journey-progress-text');
      this.progressBar = document.getElementById('journey-progress-fill');
      this.guideOrb = document.getElementById('guide-orb');

      this.init();
    }

    init() {
      this.setupLevel1();
      this.setupNavigation();
      this.setupLevel5Statements();
      this.setupOutcomes();
      this.updateProgress(1);
    }

    setupLevel1() {
      const btnMusic = document.getElementById('btn-sound-mode');
      const btnSilent = document.getElementById('btn-silent-mode');
      const btnOpenThis = document.getElementById('btn-open-this');

      btnMusic?.addEventListener('click', (e) => {
        e.preventDefault();
        btnMusic.classList.add('selected');
        btnSilent?.classList.remove('selected');
        this.audio.startSoundtrack();
      });

      btnSilent?.addEventListener('click', (e) => {
        e.preventDefault();
        btnSilent.classList.add('selected');
        btnMusic?.classList.remove('selected');
        this.audio.mute();
      });

      btnOpenThis?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('level-02', 2);
      });
    }

    setupNavigation() {
      // Level 2 -> Level 3
      document.getElementById('btn-to-03')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('level-03', 3);
      });

      // Level 3 -> Level 4
      document.getElementById('btn-to-04')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('level-04', 4);
      });

      // Level 4 -> Level 5
      document.getElementById('btn-to-05')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('level-05', 5);
      });

      // Level 5 -> Level 6 (Main Climax)
      document.getElementById('btn-to-06')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('level-06', 6);
      });
    }

    setupLevel5Statements() {
      const cards = document.querySelectorAll('.statement-glass-card');
      const climaxNotice = document.getElementById('level5-climax-box');
      const btnTellMe = document.getElementById('btn-to-06');
      let revealedCount = 0;

      cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          if (!card.classList.contains('is-revealed')) {
            card.classList.add('is-revealed');
            revealedCount++;

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

      // WhatsApp URLs (encoded safely)
      const yesEncoded = encodeURIComponent(CONFIG.whatsapp.yesMessage);
      const timeEncoded = encodeURIComponent(CONFIG.whatsapp.timeMessage);

      if (linkYesWa) {
        linkYesWa.href = `https://wa.me/${CONFIG.phone}?text=${yesEncoded}`;
      }
      if (linkTimeWa) {
        linkTimeWa.href = `https://wa.me/${CONFIG.phone}?text=${timeEncoded}`;
      }

      // YES selection
      btnYes?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('outcome-yes');
      });

      // NEED TIME selection
      btnTime?.addEventListener('click', (e) => {
        e.preventDefault();
        this.transitionToLevel('outcome-time');
      });
    }

    updateProgress(levelNumber) {
      this.currentLevel = levelNumber;
      if (this.progressText && levelNumber <= this.totalLevels) {
        const padded = levelNumber < 10 ? `0${levelNumber}` : levelNumber;
        this.progressText.textContent = `${padded} / 0${this.totalLevels}`;
      }
      if (this.progressBar && levelNumber <= this.totalLevels) {
        const percent = (levelNumber / this.totalLevels) * 100;
        this.progressBar.style.width = `${percent}%`;
      }

      // Update guide orb coordinates for 3D depth
      if (this.guideOrb) {
        const coords = [
          { x: '50%', y: '28%' },
          { x: '46%', y: '22%' },
          { x: '54%', y: '30%' },
          { x: '50%', y: '25%' },
          { x: '48%', y: '28%' },
          { x: '50%', y: '34%' }
        ];
        const target = coords[levelNumber - 1] || { x: '50%', y: '30%' };
        this.guideOrb.style.left = target.x;
        this.guideOrb.style.top = target.y;
      }
    }

    transitionToLevel(nextLevelId, levelNumber) {
      const currentScene = document.querySelector('.scene.active');
      const nextScene = document.getElementById(nextLevelId);
      if (!nextScene) return;

      // Audio ducking for emotional build-up and climax
      if (levelNumber === 5 || levelNumber === 6) {
        this.audio.duck();
      } else {
        this.audio.restoreVolume();
      }

      if (currentScene) {
        currentScene.classList.add('scene-exit-3d');
        setTimeout(() => {
          currentScene.classList.remove('active', 'scene-exit-3d');
          currentScene.style.display = 'none';

          nextScene.style.display = 'flex';
          void nextScene.offsetWidth; // Trigger reflow for smooth animation
          nextScene.classList.add('active', 'scene-enter-3d');

          setTimeout(() => {
            nextScene.classList.remove('scene-enter-3d');
          }, 550);

          if (levelNumber) {
            this.updateProgress(levelNumber);
          }
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 380);
      } else {
        nextScene.style.display = 'flex';
        nextScene.classList.add('active');
        if (levelNumber) this.updateProgress(levelNumber);
      }
    }
  }

  // Self-execute immediately on DOM readiness
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new JourneyApp());
  } else {
    new JourneyApp();
  }
})();
