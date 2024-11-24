import { API_KEYS } from '../utils.js';

export class FreesoundService {
    constructor() {
        this.clientId = API_KEYS.freeSound.clientId;
        this.clientSecret = API_KEYS.freeSound.clientSecret;
        this.baseUrl = 'https://freesound.org/apiv2';
    }

    async getSoundsByMood(mood, isMusic = false) {
        const moodSearchTerms = {
            // Music moods
            DeepSleep: 'sleep meditation soundtrack music',
            LightSleep: 'soft ambient sleep music',
            Restful: 'calm relaxation soundtrack',
            Dreamy: 'ethereal soundtrack ambient music',
            Productive: 'focus background music soundtrack',
            Creative: 'inspirational background music',
            Flow: 'flow state music soundtrack',
            Joyful: 'uplifting happy soundtrack',
            Energetic: 'energetic upbeat music',
            Playful: 'playful happy soundtrack',
            Grateful: 'positive uplifting soundtrack',
            Calm: 'peaceful background music',
            
            // Ambient moods
            Forest: 'forest nature ambient',
            Rain: 'rain storm ambient',
            Ocean: 'ocean waves sound',
            Wind: 'wind nature ambient',
            Cafe: 'cafe ambience atmosphere',
            Traffic: 'city ambience atmosphere',
            Park: 'park nature ambient',
            Market: 'marketplace ambience',
            Chimes: 'wind chimes sound',
            Bowls: 'singing bowls meditation',
            Crystal: 'crystal bowls meditation',
            Bells: 'temple bells meditation'
        };

        try {
            const searchTerm = moodSearchTerms[mood] || (isMusic ? `${mood} music soundtrack` : `${mood} ambient`);
            const response = await fetch(
                `${this.baseUrl}/search/text/?` + new URLSearchParams({
                    query: searchTerm,
                    page: 1,
                    page_size: 15,
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
            console.error('Error fetching from Freesound:', error);
            return [];
        }
    }
}