/**
 * Official YouTube Playlist Player Engine
 * Target: https://www.youtube.com/watch?v=fOz2MdE8Avw&list=PLI6sJkfOzW9Q
 * Video ID: fOz2MdE8Avw | Playlist ID: PLI6sJkfOzW9Q
 */

class StoryAudioManager {
  constructor() {
    this.videoId = 'fOz2MdE8Avw';
    this.playlistId = 'PLI6sJkfOzW9Q';
    this.isPlaying = false;
    this.isMuted = false;
    this.currentTrackIndex = 0;
    this.ytPlayer = null;
    this.isReady = false;

    // DOM Controls
    this.playPauseBtn = document.getElementById('audioPlayPauseBtn');
    this.prevBtn = document.getElementById('audioPrevBtn');
    this.nextBtn = document.getElementById('audioNextBtn');
    this.muteBtn = document.getElementById('audioMuteBtn');
    this.trackTitleEl = document.getElementById('audioTrackTitle');
    this.playerContainer = document.getElementById('musicPlayerBar');
    this.playlistToggleBtn = document.getElementById('playlistToggleBtn');
    this.playlistDrawer = document.getElementById('playlistDrawer');

    this.init();
  }

  init() {
    this.loadYouTubeIframeAPI();
    this.setupControlButtons();
    this.setupGlobalUnlock();
  }

  loadYouTubeIframeAPI() {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      this.initPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      this.initPlayer();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    }
  }

  initPlayer() {
    try {
      this.ytPlayer = new YT.Player('yt-player-frame', {
        playerVars: {
          autoplay: 1,
          controls: 1,
          loop: 1,
          playlist: this.playlistId,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            this.isReady = true;
            try {
              event.target.setVolume(100);
              event.target.unMute();
            } catch (e) {}
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              this.isPlaying = true;
              this.updateControlsUI(true);
              this.updateTrackTitle();
            } else if (event.data === YT.PlayerState.PAUSED) {
              this.isPlaying = false;
              this.updateControlsUI(false);
            }
          }
        }
      });
    } catch (err) {
      console.warn('YouTube Player initialization error:', err);
    }
  }

  updateTrackTitle() {
    if (this.ytPlayer && typeof this.ytPlayer.getVideoData === 'function') {
      try {
        const data = this.ytPlayer.getVideoData();
        if (data && data.title && this.trackTitleEl) {
          this.trackTitleEl.textContent = data.title;
        }
      } catch (e) {}
    }
  }

  setupControlButtons() {
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlayPause();
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playPrevious();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playNext();
      });
    }

    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }

    if (this.playlistToggleBtn) {
      this.playlistToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlaylistDrawer();
      });
    }

    document.addEventListener('click', (e) => {
      if (this.playlistDrawer && !this.playlistDrawer.contains(e.target) && e.target !== this.playlistToggleBtn) {
        this.playlistDrawer.classList.remove('open');
      }
    });
  }

  setupGlobalUnlock() {
    const unlockAndPlay = () => {
      this.startPlayback();
    };

    // User gesture automatically starts YouTube playback
    window.addEventListener('click', unlockAndPlay, { passive: true, once: true });
    window.addEventListener('touchstart', unlockAndPlay, { passive: true, once: true });
  }

  startPlayback() {
    this.isPlaying = true;
    this.updateControlsUI(true);

    if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(100);
        this.ytPlayer.playVideo();
      } catch (e) {}
    } else {
      const frame = document.getElementById('yt-player-frame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        frame.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      }
    }
  }

  togglePlayPause() {
    const frame = document.getElementById('yt-player-frame');

    if (this.isPlaying) {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      } else if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
      this.isPlaying = false;
      this.updateControlsUI(false);
    } else {
      if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
        try { 
          this.ytPlayer.unMute();
          this.ytPlayer.playVideo(); 
        } catch (e) {}
      } else if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      this.isPlaying = true;
      this.updateControlsUI(true);
    }
  }

  playNext() {
    if (this.ytPlayer && typeof this.ytPlayer.nextVideo === 'function') {
      try { this.ytPlayer.nextVideo(); } catch (e) {}
    } else {
      const frame = document.getElementById('yt-player-frame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage('{"event":"command","func":"nextVideo","args":""}', '*');
      }
    }
    this.isPlaying = true;
    this.updateControlsUI(true);
  }

  playPrevious() {
    if (this.ytPlayer && typeof this.ytPlayer.previousVideo === 'function') {
      try { this.ytPlayer.previousVideo(); } catch (e) {}
    } else {
      const frame = document.getElementById('yt-player-frame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage('{"event":"command","func":"previousVideo","args":""}', '*');
      }
    }
    this.isPlaying = true;
    this.updateControlsUI(true);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const frame = document.getElementById('yt-player-frame');

    if (this.ytPlayer && typeof this.ytPlayer.mute === 'function') {
      try {
        if (this.isMuted) this.ytPlayer.mute();
        else this.ytPlayer.unMute();
      } catch (e) {}
    } else if (frame && frame.contentWindow) {
      const cmd = this.isMuted ? 'mute' : 'unMute';
      frame.contentWindow.postMessage(`{"event":"command","func":"${cmd}","args":""}`, '*');
    }

    if (this.muteBtn) {
      if (this.isMuted) this.muteBtn.classList.add('muted');
      else this.muteBtn.classList.remove('muted');
    }
  }

  togglePlaylistDrawer() {
    if (!this.playlistDrawer) return;
    this.playlistDrawer.classList.toggle('open');
  }

  updateControlsUI(playing) {
    if (this.playPauseBtn) {
      if (playing) {
        this.playPauseBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        `;
        this.playPauseBtn.setAttribute('title', 'Pause Soundtrack');
      } else {
        this.playPauseBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
        `;
        this.playPauseBtn.setAttribute('title', 'Play Soundtrack');
      }
    }

    if (this.playerContainer) {
      if (playing) {
        this.playerContainer.classList.remove('paused');
      } else {
        this.playerContainer.classList.add('paused');
      }
    }
  }
}

// Global Audio Instance
window.storyAudio = null;
document.addEventListener('DOMContentLoaded', () => {
  window.storyAudio = new StoryAudioManager();
});
