import { FreesoundService } from '../services/freesound.js';

export class AudioPlayer {
    constructor() {
        // Core audio components
        this.context = null;
        this.gainNode = null;
        this.analyser = null;
        this.audioSource = null;

        // State tracking
        this.isInitialized = false;
        this.currentTrackData = null;
        this.currentMode = 'music';  // Default mode
        this.hasWarnedAboutAudio = false;

        // Playlist management
        this.playlist = [];
        this.currentTrackIndex = 0;

        // Audio settings
        this.crossfadeDuration = 2; // seconds
        this.fadeInterval = null;

        // Bind methods for event listeners
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleProgressClick = this.handleProgressClick.bind(this);
        this.initializeAudioContext = this.initializeAudioContext.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
    }

    async initialize() {
        if (this.isInitialized) return true;
        
        try {
            await this.initializeAudioContext();
            this.setupControls();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Audio initialization error:', error);
            return false;
        }
    }

    async initializeAudioContext() {
        if (this.context) return true;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Create gain node for volume control
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
            
            // Create analyser for visualization
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            this.gainNode.connect(this.analyser);

            return true;
        } catch (error) {
            console.error('Audio context initialization failed:', error);
            return false;
        }
    }

    setupControls() {
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', this.handleVolumeChange);
            this.setVolume(volumeSlider.value / 100);
        }

        // Progress bar
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.addEventListener('click', this.handleProgressClick);
        }

        // Play/Pause button
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', this.handlePlayPause);
        }

        // Next/Previous buttons
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
        }

        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }
    }

    async loadPlaylist(tracks) {
        try {
            this.playlist = tracks;
            this.currentTrackIndex = 0;
            if (tracks.length > 0) {
                console.log('Loading first track from playlist');
                await this.loadTrack(tracks[0]);
            }
        } catch (error) {
            console.error('Error loading playlist:', error);
        }
    }

    async loadTrack(track) {
        if (!this.context || !track.previewUrl) return false;

        try {
            if (this.audioSource) {
                await this.fadeOut();
            }

            const response = await fetch(track.previewUrl);
            if (!response.ok) throw new Error('Failed to fetch audio');
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            if (this.audioSource) {
                this.audioSource.stop();
                this.audioSource.disconnect();
            }

            this.audioSource = this.context.createBufferSource();
            this.audioSource.buffer = audioBuffer;
            this.audioSource.connect(this.gainNode);
            
            this.currentTrackData = track;
            this.updateTrackDisplay();
            
            await this.play();
            return true;
        } catch (error) {
            console.error('Error loading track:', error);
            return false;
        }
    }

    async nextTrack() {
        if (this.playlist.length === 0) return;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        await this.loadTrack(this.playlist[this.currentTrackIndex]);
    }

    async previousTrack() {
        if (this.playlist.length === 0) return;
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        await this.loadTrack(this.playlist[this.currentTrackIndex]);
    }

    handleVolumeChange(e) {
        const value = e.target.value;
        this.setVolume(value / 100);
    }

    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(
                Math.max(0, Math.min(1, value)),
                this.context.currentTime
            );
        }
    }

    async handlePlayPause() {
        if (this.audioSource) {
            if (this.context.state === 'running') {
                await this.context.suspend();
            } else {
                await this.context.resume();
            }
            this.updatePlayButton(this.context.state === 'running');
        }
    }

    async play() {
        if (!this.audioSource || !this.context) return;

        try {
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            
            this.audioSource.start(0);
            await this.fadeIn();
            this.updatePlayButton(true);
        } catch (error) {
            console.error('Playback error:', error);
        }
    }

    stop() {
        if (this.audioSource) {
            this.audioSource.stop();
            this.audioSource.disconnect();
            this.audioSource = null;
            this.updatePlayButton(false);
        }
    }

    handleProgressClick(e) {
        if (!this.audioSource?.buffer) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.seekToPosition(percent);
    }

    seekToPosition(percent) {
        if (!this.audioSource?.buffer) return;
        
        const duration = this.audioSource.buffer.duration;
        const seekTime = duration * percent;
        
        this.stop();
        this.audioSource.start(0, seekTime);
        this.updateProgressBar(percent);
    }

    updateProgressBar(percent) {
        const progressBar = document.getElementById('audioProgress');
        if (progressBar) {
            progressBar.value = percent * 100;
        }

        if (this.audioSource?.buffer) {
            const duration = this.audioSource.buffer.duration;
            const currentTime = duration * percent;
            this.updateTimeDisplay(currentTime, duration);
        }
    }

    updateTrackDisplay() {
        if (!this.currentTrackData) return;

        const trackTitle = document.getElementById('currentTrack');
        const artistName = document.getElementById('currentArtist');

        if (trackTitle) {
            trackTitle.textContent = this.currentTrackData.name || 'Unknown Track';
        }
        if (artistName) {
            artistName.textContent = this.currentTrackData.artist || '';
        }
    }

    updateTimeDisplay(currentTime, duration) {
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(duration);
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updatePlayButton(isPlaying) {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;

        const icon = playBtn.querySelector('i');
        if (icon) {
            icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    async fadeOut() {
        return new Promise(resolve => {
            const startVolume = this.gainNode.gain.value;
            const steps = 20;
            const stepTime = this.crossfadeDuration * 1000 / steps;
            let currentStep = 0;

            this.fadeInterval = setInterval(() => {
                currentStep++;
                const volume = startVolume * (1 - currentStep / steps);
                this.setVolume(volume);

                if (currentStep >= steps) {
                    clearInterval(this.fadeInterval);
                    this.stop();
                    resolve();
                }
            }, stepTime);
        });
    }

    async fadeIn() {
        return new Promise(resolve => {
            const volumeSlider = document.getElementById('volumeSlider');
            const targetVolume = volumeSlider ? volumeSlider.value / 100 : 1;
            const steps = 20;
            const stepTime = this.crossfadeDuration * 1000 / steps;
            let currentStep = 0;

            this.fadeInterval = setInterval(() => {
                currentStep++;
                const volume = targetVolume * (currentStep / steps);
                this.setVolume(volume);

                if (currentStep >= steps) {
                    clearInterval(this.fadeInterval);
                    resolve();
                }
            }, stepTime);
        });
    }

    destroy() {
        try {
            if (this.fadeInterval) {
                clearInterval(this.fadeInterval);
            }

            if (this.audioSource) {
                this.stop();
            }

            if (this.context) {
                this.context.close();
            }

            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.removeEventListener('input', this.handleVolumeChange);
            }

            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer) {
                progressContainer.removeEventListener('click', this.handleProgressClick);
            }

            const playBtn = document.getElementById('playBtn');
            if (playBtn) {
                playBtn.removeEventListener('click', this.handlePlayPause);
            }

            this.isInitialized = false;
            return true;
        } catch (error) {
            console.error('Error destroying AudioPlayer:', error);
            return false;
        }
    }
}