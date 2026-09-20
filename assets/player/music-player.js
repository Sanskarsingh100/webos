class LeafMusicPlayer {
  constructor() {
    this.playerEl = document.getElementById('musicPlayer');
    this.audioEl = document.getElementById('musicAudio');
    this.playBtn = document.getElementById('musicPlayBtn');
    this.prevBtn = document.getElementById('musicPrevBtn');
    this.nextBtn = document.getElementById('musicNextBtn');
    this.expandBtn = document.getElementById('musicExpandBtn');
    this.titleEl = document.getElementById('musicTitle');
    this.statusEl = document.getElementById('musicStatus');
    this.volumeEl = document.getElementById('musicVolume');
    this.searchInput = document.getElementById('musicSearch');
    this.musicListEl = document.getElementById('musicList');
    this.ambientButtons = Array.from(document.querySelectorAll('.ambient-chip'));

    this.tracks = [
      { name: 'Night Drift', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { name: 'Cloud Echo', artist: 'Lofi', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { name: 'Cozy Static', artist: 'Study', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { name: 'Blue Haze', artist: 'Chill', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { name: 'Moonline', artist: 'Focus', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    ];

    this.currentIndex = 0;
    this.isExpanded = false;
    this.searchTerm = '';
  }

  init() {
    if (!this.audioEl || !this.playBtn || !this.titleEl || !this.statusEl || !this.musicListEl) {
      return;
    }

    this.audioEl.volume = Number(this.volumeEl?.value ?? 0.7);
    this.audioEl.preload = 'auto';

    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn?.addEventListener('click', () => this.previousTrack());
    this.nextBtn?.addEventListener('click', () => this.nextTrack());
    this.expandBtn?.addEventListener('click', () => this.togglePanel());

    this.audioEl.addEventListener('play', () => this.updatePlayButton(true));
    this.audioEl.addEventListener('pause', () => this.updatePlayButton(false));
    this.audioEl.addEventListener('ended', () => this.nextTrack());
    this.audioEl.addEventListener('error', () => this.setStatus('Track failed to load'));

    this.volumeEl?.addEventListener('input', (event) => {
      const nextVolume = Number(event.target.value);
      this.audioEl.volume = nextVolume;
      this.setStatus(`Volume ${nextVolume.toFixed(2)}`);
    });

    this.searchInput?.addEventListener('input', (event) => {
      this.searchTerm = String(event.target.value || '').trim().toLowerCase();
      this.renderTrackList();
    });

    this.ambientButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const name = button.dataset.ambient || 'Ambience';
        this.ambientButtons.forEach((chip) => chip.classList.toggle('active', chip === button));
        this.setStatus(`${name[0].toUpperCase()}${name.slice(1)} ambience`);
      });
    });

    this.renderTrackList();
    this.loadTrack(this.currentIndex, false);
    this.updatePlayButton(false);
  }

  togglePanel() {
    if (!this.playerEl) return;

    this.isExpanded = !this.isExpanded;
    this.playerEl.classList.toggle('expanded', this.isExpanded);
    this.expandBtn?.setAttribute('aria-expanded', String(this.isExpanded));
    this.expandBtn.textContent = this.isExpanded ? '▾' : '▴';
  }

  setStatus(message) {
    if (this.statusEl) {
      this.statusEl.textContent = message;
    }
  }

  updatePlayButton(isPlaying) {
    if (this.playBtn) {
      this.playBtn.textContent = isPlaying ? '❚❚' : '▶';
      this.playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
      this.playBtn.title = isPlaying ? 'Pause' : 'Play';
    }

    if (this.playerEl) {
      this.playerEl.classList.toggle('is-playing', isPlaying);
    }
  }

  getFilteredTracks() {
    if (!this.searchTerm) {
      return this.tracks;
    }

    return this.tracks.filter((track) => {
      return `${track.name} ${track.artist}`.toLowerCase().includes(this.searchTerm);
    });
  }

  renderTrackList() {
    if (!this.musicListEl) return;

    const filtered = this.getFilteredTracks();

    if (!filtered.length) {
      this.musicListEl.innerHTML = '<div class="music-track"><span class="music-track-name">No tracks found</span><span class="music-track-tags">Try another search</span></div>';
      return;
    }

    this.musicListEl.innerHTML = filtered
      .map((track, index) => {
        const absoluteIndex = this.tracks.findIndex((item) => item.src === track.src);
        const activeClass = absoluteIndex === this.currentIndex ? 'active' : '';
        return `
          <button type="button" class="music-track ${activeClass}" data-track-index="${absoluteIndex}">
            <span class="music-track-name">${track.name}</span>
            <span class="music-track-tags">${track.artist}</span>
          </button>
        `;
      })
      .join('');

    this.musicListEl.querySelectorAll('.music-track').forEach((button) => {
      button.addEventListener('click', () => {
        const nextIndex = Number(button.dataset.trackIndex);
        if (Number.isInteger(nextIndex)) {
          this.loadTrack(nextIndex, true);
        }
      });
    });
  }

  async loadTrack(index, autoplay) {
    if (!this.tracks[index]) return;

    this.currentIndex = index;
    const track = this.tracks[index];
    this.titleEl.textContent = track.name;
    this.statusEl.textContent = autoplay ? 'Loading...' : 'Ready';

    this.audioEl.src = track.src;
    this.audioEl.load();

    this.renderTrackList();

    try {
      if (autoplay) {
        await this.audioEl.play();
        this.setStatus(`${track.name} playing`);
        this.updatePlayButton(true);
      } else {
        this.setStatus('Ready');
        this.updatePlayButton(false);
      }
    } catch (error) {
      this.setStatus('Click play to start');
      this.updatePlayButton(false);
    }
  }

  async togglePlay() {
    if (!this.audioEl) return;

    if (this.audioEl.paused) {
      try {
        await this.audioEl.play();
        this.setStatus(`${this.tracks[this.currentIndex]?.name || 'Track'} playing`);
        this.updatePlayButton(true);
      } catch (error) {
        this.setStatus('Playback blocked — tap play again');
      }
      return;
    }

    this.audioEl.pause();
    this.setStatus('Paused');
    this.updatePlayButton(false);
  }

  previousTrack() {
    const previousIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(previousIndex, true);
  }

  nextTrack() {
    const nextIndex = (this.currentIndex + 1) % this.tracks.length;
    this.loadTrack(nextIndex, true);
  }
}

window.LeafMusicPlayer = LeafMusicPlayer;
