// API Keys - for development
export const API_KEYS = {
    freeSound: {
        clientId: 'wAoFYxl4qT4rBWVRgeZj',
        clientSecret: process.env.FREESOUND_CLIENT_SECRET || 'your-freesound-client-secret'
    }
};

// Array shuffle utility
export const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Time formatting utility
export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Application state management
export class AppState {
    constructor() {
        this.currentMode = 'music';
        this.isEmojiMode = false;
        this.isPlaying = false;
        this.listeners = {};
    }

    updateMode(mode) {
        if (mode === this.currentMode) return;
        this.currentMode = mode;
        this.updateUI();
        this.emit('modeChange', mode);
    }

    toggleEmojiMode() {
        this.isEmojiMode = !this.isEmojiMode;
        this.updateUI();
        this.emit('emojiModeChange', this.isEmojiMode);
    }

    updateUI() {
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
        });

        document.querySelectorAll('[data-display]').forEach(btn => {
            btn.classList.toggle('active', 
                (btn.dataset.display === 'emoji') === this.isEmojiMode);
        });

        const saveBtn = document.getElementById('savePlaylistBtn');
        if (saveBtn) {
            // Always enable save button since we don't require login
            saveBtn.disabled = false;
        }
    }

    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// Error handling utility
export const handleError = (error, context = '') => {
    console.error(`Error in ${context}:`, error);
};

// Local storage utilities
export const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            handleError(error, 'storage.set');
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            handleError(error, 'storage.get');
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            handleError(error, 'storage.remove');
        }
    }
};