import { FreesoundService } from './services/freesound.js';

/**
 * AudioPlayer class handles all audio playback functionality for Moodscapes
 */
export class AudioPlayer {
    constructor() {
        // Core audio components stay the same
        this.context = null;
        this.gainNode = null;
        this.analyser = null;
        this.audioSource = null;

        // Add Freesound service
        this.freesoundService = new FreesoundService();

        // State tracking (simplified)
        this.isInitialized = false;
        this.currentTrackData = null;
        this.currentMode = 'music';
        this.hasWarnedAboutAudio = false;

        // Audio settings
        this.crossfadeDuration = 2;
        this.fadeInterval = null;

        // Bind event handlers
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleProgressClick = this.handleProgressClick.bind(this);
        this.initializeAudioContext = this.initializeAudioContext.bind(this);
    }

    async initialize() {
        if (this.isInitialized) return true;
        
        try {
            const initOnInteraction = async () => {
                await this.initializeAudioContext();
                document.removeEventListener('click', initOnInteraction);
                document.removeEventListener('touchstart', initOnInteraction);
                this.setupControls();
            };

            document.addEventListener('click', initOnInteraction, { once: true });
            document.addEventListener('touchstart', initOnInteraction, { once: true });

            // Initialize volume and controls
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
            if (!this.hasWarnedAboutAudio) {
                console.warn('Audio initialization deferred until user interaction');
                this.hasWarnedAboutAudio = true;
            }
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

        // Play button
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.audioSource) {
                    if (this.context.state === 'suspended') {
                        this.context.resume();
                    }
                    this.togglePlay();
                }
            });
        }
    }

    togglePlay() {
        if (!this.audioSource) return;
        
        if (this.context.state === 'running') {
            this.context.suspend();
            this.updatePlayButton(false);
        } else {
            this.context.resume();
            this.updatePlayButton(true);
        }
    }

    async loadTrack(track) {
        if (!this.context || !track.previewUrl) return false;

        try {
            // Fade out current track if playing
            if (this.audioSource) {
                await this.fadeOut();
            }

            // Load and decode new track from Freesound
            const response = await fetch(track.previewUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch audio');
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            // Stop and disconnect current source if exists
            if (this.audioSource) {
                this.audioSource.stop();
                this.audioSource.disconnect();
            }

            // Create and connect new source
            this.audioSource = this.context.createBufferSource();
            this.audioSource.buffer = audioBuffer;
            this.audioSource.connect(this.gainNode);
            
            // Update track info
            this.currentTrackData = track;
            this.updateTrackDisplay();
            
            // Auto-play with fade in
            await this.play();
            
            return true;
        } catch (error) {
            console.error('Error loading track:', error);
            this.updateTrackDisplay({ name: 'Error loading track', artist: 'Please try again' });
            return false;
        }
    }

    async loadMoodTracks(moods) {
        try {
            // Get tracks from Freesound based on moods
            const tracks = [];
            for (const mood of moods) {
                const moodTracks = await this.freesoundService.getSoundsByMood(mood);
                tracks.push(...moodTracks);
            }

            if (tracks.length === 0) {
                throw new Error('No tracks found for selected moods');
            }

            // Load the first track
            await this.loadTrack(tracks[0]);
            return true;
        } catch (error) {
            console.error('Error loading mood tracks:', error);
            return false;
        }
    }

    updateTrackDisplay(override = null) {
        const trackData = override || this.currentTrackData;
        if (!trackData) return;

        const trackTitle = document.getElementById('currentTrack');
        const artistName = document.getElementById('currentArtist');

        if (trackTitle) {
            trackTitle.textContent = trackData.name || 'Unknown Track';
        }
        if (artistName) {
            artistName.textContent = trackData.artist || '';
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

    switchMode(mode) {
        try {
            if (mode === this.currentMode) return true;

            // Stop current playback if any
            if (this.audioSource) {
                this.stop();
            }

            this.currentMode = mode;

            // Reset track info display
            this.updateTrackDisplay({
                name: 'Select a mood to begin',
                artist: ''
            });

            return true;
        } catch (error) {
            console.error('Error switching audio mode:', error);
            return false;
        }
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

            // Remove event listeners
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
                playBtn.removeEventListener('click', this.togglePlay);
            }

            this.isInitialized = false;
            return true;
        } catch (error) {
            console.error('Error destroying AudioPlayer:', error);
            return false;
        }
    }
}