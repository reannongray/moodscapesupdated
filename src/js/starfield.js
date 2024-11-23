export class StarFieldManager {
    constructor() {
        this.colors = ['#4F8FF7', '#9D50FF', '#FF50D6', '#FFFFFF'];
        this.starField = null;
        this.shootingStarContainer = null;
    }

    async initialize() {
        try {
            // Always create new containers
            await this.createContainers();
            
            // Generate stars immediately
            await this.createStarField();
            
            // Start shooting stars
            this.initShootingStars();
            
            return true;
        } catch (error) {
            console.error('Starfield error:', error);
            return false;
        }
    }

    async createContainers() {
        // Remove any existing containers
        document.querySelector('.stars')?.remove();
        document.querySelector('.shooting-stars')?.remove();

        // Create containers
        this.starField = document.createElement('div');
        this.starField.className = 'stars';
        
        this.shootingStarContainer = document.createElement('div');
        this.shootingStarContainer.className = 'shooting-stars';

        // Set essential styles inline to ensure they work
        const containerStyles = {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '0',
            overflow: 'hidden',
            backgroundColor: 'transparent'
        };

        Object.assign(this.starField.style, containerStyles);
        Object.assign(this.shootingStarContainer.style, containerStyles);

        // Add to document
        document.body.prepend(this.shootingStarContainer);
        document.body.prepend(this.starField);
    }

    async createStarField() {
        const fragment = document.createDocumentFragment();
        
        // Create stars
        for (let i = 0; i < 400; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const size = Math.random() * 2.5 + 0.5;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            // Set star styles inline
            Object.assign(star.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: color,
                borderRadius: '50%',
                boxShadow: `0 0 ${size * 2}px ${color}`,
                animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`
            });
            
            fragment.appendChild(star);
        }
        
        this.starField.appendChild(fragment);
    }

    createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        const startX = Math.random() * 100;
        const startY = Math.random() * 30;

        Object.assign(shootingStar.style, {
            position: 'absolute',
            left: `${startX}%`,
            top: `${startY}%`,
            width: '150px',
            height: '2px',
            opacity: '0',
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(79, 143, 247, 0.8) 20%, rgba(157, 113, 253, 0.3) 60%, transparent 100%)',
            transform: 'rotate(225deg)',
            borderRadius: '100%',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            animation: 'shoot 2s ease-out forwards'
        });

        this.shootingStarContainer.appendChild(shootingStar);

        // Remove after animation
        setTimeout(() => shootingStar.remove(), 2000);
    }

    initShootingStars() {
        // Create shooting stars every 2 seconds
        setInterval(() => {
            const count = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < count; i++) {
                this.createShootingStar();
            }
        }, 2000);
    }
}