import { API_KEYS } from '../utils.js';

export class FreesoundService {
    constructor() {
        this.clientId = API_KEYS.freeSound.clientId;
        this.clientSecret = API_KEYS.freeSound.clientSecret;
        this.baseUrl = 'https://freesound.org/apiv2';
        this.pageSize = 15;
    }

    async searchSounds(query, page = 1) {
        try {
            const response = await fetch(
                `${this.baseUrl}/search/text/?` + new URLSearchParams({
                    query,
                    page,
                    page_size: this.pageSize,
                    fields: 'id,name,url,previews,duration,username',
                    token: this.clientSecret
                })
            );

            if (!response.ok) {
                throw new Error(`Freesound API error: ${response.status}`);
            }

            const data = await response.json();
            return data.results.map(sound => ({
                id: sound.id,
                name: sound.name,
                artist: sound.username,
                duration: sound.duration,
                previewUrl: sound.previews['preview-hq-mp3']
            }));
        } catch (error) {
            console.error('Error searching Freesound:', error);
            return [];
        }
    }

    async getSoundsByMood(mood) {
        // Map moods to relevant search terms
        const moodSearchTerms = {
            // Music moods
            DeepSleep: 'ambient sleep meditation',
            LightSleep: 'gentle sleep sounds',
            Restful: 'calming relaxation',
            Dreamy: 'ethereal ambient',
            Productive: 'focus background',
            Determined: 'motivational ambient',
            Creative: 'creative inspiration',
            Flow: 'flow state music',
            // ... other music moods ...

            // Ambient moods
            Forest: 'forest nature sounds',
            Rain: 'rain ambient',
            Ocean: 'ocean waves',
            Wind: 'wind nature',
            Cafe: 'coffee shop ambience',
            Traffic: 'city traffic ambient',
            Park: 'park nature sounds',
            Market: 'marketplace ambience',
            // ... other ambient moods ...
        };

        const searchTerm = moodSearchTerms[mood] || mood;
        return await this.searchSounds(searchTerm);
    }

    // Helper method to get ambient sounds
    async getAmbientSounds(category) {
        return await this.searchSounds(`ambient ${category}`);
    }
}