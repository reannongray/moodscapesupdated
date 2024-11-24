export class MoodManager {
    constructor() {
        this.selectedMoods = new Set();
        this.initializeMoodData();
        this.init();
    }

    initializeMoodData() {
        // Music mood categories (keeping existing)
        this.musicMoodCategories = {
            Sleep: {
                emoji: '😴',
                subMoods: [
                    { name: 'DeepSleep', emoji: '🛌', description: 'For deep, restful sleep' },
                    { name: 'LightSleep', emoji: '🌜', description: 'For gentle relaxation' },
                    { name: 'Restful', emoji: '💤', description: 'Calming sounds for rest' },
                    { name: 'Dreamy', emoji: '🌠', description: 'Ethereal, dream-like music' }
                ]
            },
            Focus: {
                emoji: '🎯',
                subMoods: [
                    { name: 'Productive', emoji: '🚀', description: 'Boost your productivity' },
                    { name: 'Determined', emoji: '🎯', description: 'Stay focused and driven' },
                    { name: 'Creative', emoji: '🎨', description: 'Inspire creativity' },
                    { name: 'Flow', emoji: '🌊', description: 'Get in the zone' }
                ]
            },
            Explore: {
                emoji: '🎲',
                subMoods: [
                    { name: 'Surprise', emoji: '🎉', description: 'Discover new sounds' },
                    { name: 'Journey', emoji: '🚢', description: 'Musical adventures' },
                    { name: 'Discover', emoji: '🌍', description: 'Explore new genres' },
                    { name: 'Adventure', emoji: '🏕️', description: 'Bold and exciting' }
                ]
            },
            Introspection: {
                emoji: '🪞',
                subMoods: [
                    { name: 'Reflective', emoji: '🌄', description: 'Thoughtful moments' },
                    { name: 'Meditative', emoji: '🧘', description: 'Deep meditation' },
                    { name: 'DeepThoughts', emoji: '💭', description: 'Contemplative music' },
                    { name: 'Contemplative', emoji: '📜', description: 'Inner reflection' }
                ]
            },
            Happy: {
                emoji: '😊',
                subMoods: [
                    { name: 'Joyful', emoji: '😄', description: 'Pure happiness' },
                    { name: 'Energetic', emoji: '💃', description: 'Upbeat and lively' },
                    { name: 'Playful', emoji: '🤸', description: 'Fun and light' },
                    { name: 'Grateful', emoji: '🙏', description: 'Appreciation' }
                ]
            },
            Relaxed: {
                emoji: '🌿',
                subMoods: [
                    { name: 'Calm', emoji: '🧘', description: 'Peaceful relaxation' },
                    { name: 'Tranquil', emoji: '🍃', description: 'Gentle serenity' },
                    { name: 'Soothed', emoji: '🌌', description: 'Stress relief' },
                    { name: 'Peaceful', emoji: '🌺', description: 'Inner peace' }
                ]
            }
        };

        // Updated ambient categories to match count
        this.ambientMoodCategories = {
            Nature: {
                emoji: '🌲',
                subMoods: [
                    { name: 'Forest', emoji: '🌳', description: 'Woodland ambiance' },
                    { name: 'Rain', emoji: '🌧️', description: 'Rainfall sounds' },
                    { name: 'Ocean', emoji: '🌊', description: 'Ocean waves' },
                    { name: 'Wind', emoji: '🍃', description: 'Gentle breeze' }
                ]
            },
            City: {
                emoji: '🌆',
                subMoods: [
                    { name: 'Cafe', emoji: '☕', description: 'Coffee shop ambiance' },
                    { name: 'Traffic', emoji: '🚗', description: 'Urban soundscape' },
                    { name: 'Park', emoji: '🏞️', description: 'City park sounds' },
                    { name: 'Market', emoji: '🏪', description: 'Busy marketplace' }
                ]
            },
            Meditation: {
                emoji: '🧘',
                subMoods: [
                    { name: 'Chimes', emoji: '🎐', description: 'Wind chimes' },
                    { name: 'Bowls', emoji: '🕉️', description: 'Singing bowls' },
                    { name: 'Crystal', emoji: '💎', description: 'Crystal bowls' },
                    { name: 'Bells', emoji: '🔔', description: 'Temple bells' }
                ]
            },
            Elements: {
                emoji: '🌍',
                subMoods: [
                    { name: 'Fire', emoji: '🔥', description: 'Crackling flames' },
                    { name: 'Water', emoji: '💧', description: 'Flowing water' },
                    { name: 'Storm', emoji: '⛈️', description: 'Thunder and rain' },
                    { name: 'Waves', emoji: '🌊', description: 'Beach waves' }
                ]
            },
            Spaces: {
                emoji: '🏛️',
                subMoods: [
                    { name: 'Library', emoji: '📚', description: 'Quiet study space' },
                    { name: 'Garden', emoji: '🌸', description: 'Garden sounds' },
                    { name: 'Temple', emoji: '⛩️', description: 'Sacred space' },
                    { name: 'Cave', emoji: '🗻', description: 'Cave echoes' }
                ]
            },
            Travel: {
                emoji: '🚂',
                subMoods: [
                    { name: 'Train', emoji: '🚂', description: 'Train journey' },
                    { name: 'Ship', emoji: '⛴️', description: 'Ocean voyage' },
                    { name: 'Airport', emoji: '✈️', description: 'Terminal ambiance' },
                    { name: 'Campfire', emoji: '🏕️', description: 'Camping sounds' }
                ]
            }
        };
    }
    init() {
        try {
            this.container = document.getElementById('moodCategories');
            this.selectedMoodsContainer = document.getElementById('selectedMoodTags');

            if (!this.container || !this.selectedMoodsContainer) {
                throw new Error('Required containers not found');
            }

            this.renderMoodCategories(window.appState?.isEmojiMode || false);
            this.setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('MoodManager initialization error:', error);
            return false;
        }
    }

    setupEventListeners() {
        try {
            // Mode toggle listeners
            document.querySelectorAll('[data-mode]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update mode in appState and trigger re-render
                    if (window.appState) {
                        window.appState.updateMode(btn.dataset.mode);
                    }
                    this.renderMoodCategories(window.appState?.isEmojiMode || false);
                });
            });
            // Emoji mode toggle listeners
            document.querySelectorAll('[data-display]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('[data-display]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const isEmojiMode = btn.dataset.display === 'emoji';
                    this.renderMoodCategories(isEmojiMode);
                });
            });

            return true;
        } catch (error) {
            console.error('Error setting up mood event listeners:', error);
            return false;
        }
    }

    renderMoodCategories(isEmojiMode) {
        if (!this.container) return false;

        try {
            this.container.innerHTML = '';
            
            const categories = window.appState?.currentMode === 'music' 
                ? this.musicMoodCategories 
                : this.ambientMoodCategories;
            
            Object.entries(categories).forEach(([category, data]) => {
                const card = this.createMoodCard(category, data, isEmojiMode);
                this.container.appendChild(card);
            });

            this.setupMoodListeners();
            this.updateSelectedMoodsDisplay();

            return true;
        } catch (error) {
            console.error('Error rendering mood categories:', error);
            return false;
        }
    }

    createMoodCard(category, data, isEmojiMode) {
        const card = document.createElement('div');
        card.className = 'mood-card';
        
        card.innerHTML = `
            <div class="mood-header">
                <h3>${isEmojiMode ? data.emoji : category}</h3>
                <span class="mood-category-name">${category}</span>
            </div>
            <div class="sub-moods">
                ${data.subMoods.map(mood => `
                    <button class="cosmic-btn mood-btn ${
                        this.selectedMoods.has(mood.name) ? 'selected' : ''
                    }" data-mood="${mood.name}" title="${mood.description}">
                        ${isEmojiMode ? mood.emoji : mood.name}
                    </button>
                `).join('')}
            </div>
        `;

        return card;
    }

    setupMoodListeners() {
        this.container.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const mood = btn.dataset.mood;
                this.toggleMood(mood);
                btn.classList.toggle('selected', this.selectedMoods.has(mood));
                
                this.addRippleEffect(e, btn);
            });

            if (btn.title) {
                btn.addEventListener('mouseenter', () => {
                    this.showTooltip(btn, btn.title);
                });

                btn.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
            }
        });
    }

    addRippleEffect(event, button) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size/2}px`;
        ripple.style.top = `${event.clientY - rect.top - size/2}px`;
        
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    showTooltip(element, text) {
        let tooltip = document.getElementById('mood-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'mood-tooltip';
            tooltip.className = 'mood-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = text;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = document.getElementById('mood-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    toggleMood(mood) {
        try {
            if (this.selectedMoods.has(mood)) {
                this.selectedMoods.delete(mood);
            } else {
                this.selectedMoods.add(mood);
            }
            
            this.updateSelectedMoodsDisplay();
            this.notifyMoodChange();
            
            return true;
        } catch (error) {
            console.error('Error toggling mood:', error);
            return false;
        }
    }

    updateSelectedMoodsDisplay() {
        if (!this.selectedMoodsContainer) return false;

        try {
            this.selectedMoodsContainer.innerHTML = Array.from(this.selectedMoods)
                .map(mood => {
                    const moodData = this.findMoodData(mood);
                    return `
                        <div class="mood-tag">
                            ${moodData?.emoji || ''} ${mood}
                            <button class="remove-mood" data-mood="${mood}" aria-label="Remove ${mood}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                })
                .join('');

            // Setup removal listeners
            this.selectedMoodsContainer.querySelectorAll('.remove-mood').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mood = btn.dataset.mood;
                    this.selectedMoods.delete(mood);
                    
                    const moodBtn = document.querySelector(`[data-mood="${mood}"]`);
                    if (moodBtn) {
                        moodBtn.classList.remove('selected');
                    }
                    
                    this.updateSelectedMoodsDisplay();
                    this.notifyMoodChange();
                });
            });

            return true;
        } catch (error) {
            console.error('Error updating selected moods display:', error);
            return false;
        }
    }

    findMoodData(moodName) {
        const categories = window.appState?.currentMode === 'music' 
            ? this.musicMoodCategories 
            : this.ambientMoodCategories;

        for (const category of Object.values(categories)) {
            const mood = category.subMoods.find(m => m.name === moodName);
            if (mood) return mood;
        }
        return null;
    }

    notifyMoodChange() {
        const event = new CustomEvent('moodsChanged', {
            detail: { moods: Array.from(this.selectedMoods) }
        });
        window.dispatchEvent(event);
    }

    getSelectedMoods() {
        return Array.from(this.selectedMoods);
    }

    clearMoods() {
        try {
            this.selectedMoods.clear();
            this.updateSelectedMoodsDisplay();
            
            document.querySelectorAll('.mood-btn.selected').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            this.notifyMoodChange();
            return true;
        } catch (error) {
            console.error('Error clearing moods:', error);
            return false;
        }
    }

    destroy() {
        try {
            // Remove event listeners
            this.container?.querySelectorAll('.mood-btn').forEach(btn => {
                btn.removeEventListener('click', () => {});
                btn.removeEventListener('mouseenter', () => {});
                btn.removeEventListener('mouseleave', () => {});
            });

            // Remove tooltip if exists
            document.getElementById('mood-tooltip')?.remove();

            // Clear state
            this.selectedMoods.clear();
            if (this.container) this.container.innerHTML = '';
            if (this.selectedMoodsContainer) this.selectedMoodsContainer.innerHTML = '';

            return true;
        } catch (error) {
            console.error('Error destroying MoodManager:', error);
            return false;
        }
    }
}