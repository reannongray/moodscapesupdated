import { StarFieldManager } from './starfield.js';

// Simplified test version
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Starting starfield test...');
        
        // Force container creation
        const starField = new StarFieldManager();
        const success = await starField.initialize();
        
        if (success) {
            console.log('Starfield initialized successfully');
        } else {
            console.error('Starfield initialization failed');
        }
    } catch (error) {
        console.error('Starfield error:', error);
    }
});

