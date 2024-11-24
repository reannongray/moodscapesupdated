// Handles audio visualization with particle effects
export class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('audioVisualizer');
        this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Visualization settings
        this.colors = ['#4F8FF7', '#9D50FF', '#FF50D6', '#FFFFFF'];
        this.fftSize = 256;
        this.bufferLength = 0;
        
        // Particle system properties
        this.particles = [];
        this.particleCount = 100;
        this.baseRadius = 5;
        this.animationFrame = null;
        this.dataArray = null;
    }

    async initialize(audioContext, analyser) {
        if (!this.canvas || !audioContext) return false;
        
        this.analyser = analyser;
        this.analyser.fftSize = this.fftSize;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        this.initializeCanvas();
        return true;
    }

    initializeCanvas() {
        const resize = () => {
            const container = this.canvas.parentElement;
            if (!container) return;
            
            this.canvas.width = container.offsetWidth;
            this.canvas.height = container.offsetHeight;
            this.initializeParticles();
        };

        resize();
        window.addEventListener('resize', resize);
        this.initializeParticles();
    }
    async testWithAudioFile(file) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.connect(audioContext.destination);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser);
            
            await this.initialize(audioContext, analyser);
            source.start(0);
            this.start();
            
            return true;
        } catch (error) {
            console.error('Error testing audio file:', error);
            return false;
        }
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * this.baseRadius + 3,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                velocity: Math.random() * 1 + 0.5,
                angle: Math.random() * Math.PI * 2,
                spin: Math.random() * 0.01 - 0.0025,
                originalRadius: Math.random() * this.baseRadius + 2
            });
        }
    }

    start() {
        if (!this.canvas || !this.canvasCtx) return;

        const draw = () => {
            this.animationFrame = requestAnimationFrame(draw);

            // Create fade effect
            this.canvasCtx.fillStyle = 'rgba(11, 11, 31, 0.15)';
            this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Get frequency data
            this.analyser.getByteFrequencyData(this.dataArray);
            this.updateParticles();
            this.drawParticles();
        };

        draw();
    }

    updateParticles() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.particles.forEach((particle, index) => {
            const frequencyIndex = Math.floor(index / this.particles.length * this.dataArray.length);
            const frequency = this.dataArray[frequencyIndex];
            const intensity = frequency / 255;

            // Update particle position and properties
            particle.angle += particle.spin + (intensity * 0.1);
            const radius = particle.velocity * (50 + intensity * 100);
            
            particle.x = centerX + Math.cos(particle.angle) * radius;
            particle.y = centerY + Math.sin(particle.angle) * radius;
            particle.radius = particle.originalRadius + (intensity * this.baseRadius * 2);

            // Keep particles within bounds
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    }

    drawParticles() {
        this.particles.forEach((particle, index) => {
            const frequencyIndex = Math.floor(index / this.particles.length * this.dataArray.length);
            const frequency = this.dataArray[frequencyIndex];
            const intensity = frequency / 255;

            // Create glowing particle effect
            const gradient = this.canvasCtx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * (1 + intensity)
            );

            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');

            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                particle.x, 
                particle.y, 
                particle.radius * (1 + intensity), 
                0, 
                Math.PI * 2
            );
            this.canvasCtx.fillStyle = gradient;
            this.canvasCtx.fill();

            // Draw connections between nearby particles
            this.drawParticleConnections(particle, intensity);
        });
    }

    drawParticleConnections(particle, intensity) {
        this.particles.forEach(otherParticle => {
            if (particle === otherParticle) return;
            
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                this.canvasCtx.beginPath();
                this.canvasCtx.moveTo(particle.x, particle.y);
                this.canvasCtx.lineTo(otherParticle.x, otherParticle.y);
                
                const opacity = (1 - distance / 100) * 0.2 * intensity;
                this.canvasCtx.strokeStyle = `rgba(79, 143, 247, ${opacity})`;
                this.canvasCtx.stroke();
            }
        });
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    // Clean up resources
    destroy() {
        this.stop();
        this.particles = [];
        if (this.canvas && this.canvasCtx) {
            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}
