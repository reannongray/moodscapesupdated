import { AppState } from './utils.js';
import { StarFieldManager } from './starfield.js';
import { MoodManager } from './moods.js';

class App {
    constructor() {
        this.initialized = false;
        this.components = new Map();
    }

    static async create() {
        const app = new App();
        return await app.initializeApp();
    }

    async initializeApp() {
        try {
            console.log('Starting initialization...');

            // Debug starfield
            console.log('Creating StarFieldManager...');
            const starField = new StarFieldManager();
            console.log('Initializing StarField...');
            const starFieldSuccess = await starField.initialize();
            console.log('StarField initialization:', starFieldSuccess ? 'success' : 'failed');
            this.components.set('starField', starField);

            // Debug state
            console.log('Creating AppState...');
            window.appState = new AppState();
            console.log('AppState created');

            // Debug mood manager
            console.log('Creating MoodManager...');
            window.moodManager = new MoodManager();
            console.log('MoodManager created');

            // Debug UI render
            console.log('Rendering initial UI...');
            this.renderInitialUI();

            this.initialized = true;
            console.log('Initialization complete');
            return true;
        } catch (error) {
            console.error('Initialization failed:', error);
            return false;
        }
    }

    renderInitialUI() {
        try {
            if (window.moodManager && window.appState) {
                window.moodManager.renderMoodCategories(window.appState.isEmojiMode);
                this.updateToggleStates();
            }
        } catch (error) {
            console.warn('Error in initial UI render:', error);
        }
    }

    updateToggleStates() {
        try {
            const modeButtons = document.querySelectorAll('[data-mode]');
            modeButtons.forEach(btn => {
                if (window.appState && btn instanceof HTMLElement) {
                    const mode = btn.dataset.mode;
                    btn.classList.toggle('active', mode === window.appState.currentMode);
                    btn.setAttribute('aria-pressed', String(mode === window.appState.currentMode));
                }
            });

            const displayButtons = document.querySelectorAll('[data-display]');
            displayButtons.forEach(btn => {
                if (window.appState && btn instanceof HTMLElement) {
                    const display = btn.dataset.display;
                    const isEmoji = display === 'emoji';
                    btn.classList.toggle('active', isEmoji === window.appState.isEmojiMode);
                    btn.setAttribute('aria-pressed', String(isEmoji === window.appState.isEmojiMode));
                }
            });
        } catch (error) {
            console.warn('Error updating toggle states:', error);
        }
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.innerHTML = `
            <h2>Initialization Error</h2>
            <p>We encountered an error while starting up. Please try refreshing the page.</p>
            <button onclick="window.location.reload()" class="cosmic-btn">
                Refresh Page
            </button>
        `;
        document.body?.appendChild(errorContainer);
    }

    destroy() {
        try {
            for (const [, component] of this.components) {
                if (component?.destroy) {
                    component.destroy();
                }
            }
            return true;
        } catch (error) {
            console.error('Error during cleanup:', error);
            return false;
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.create().catch(error => {
            console.error('Failed to create app:', error);
        });
    });
} else {
    App.create().catch(error => {
        console.error('Failed to create app:', error);
    });
}

export default App;

