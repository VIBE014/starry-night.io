 // Star class definition
class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 3 + 1;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.speed = Math.random() * 0.2 + 0.05;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
        this.colorIntensity = Math.random() * 0.7 + 0.3;
        this.attraction = 0; // For cursor attraction effect
    }
    
    update(mouseX, mouseY, attractMode) {
        // Calculate distance to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move stars slightly towards mouse (gravity effect) if attractMode is true
        const maxDistance = 400;
        if (distance < maxDistance && mouseX !== 0 && mouseY !== 0 && attractMode) {
            const force = (maxDistance - distance) / maxDistance;
            this.x += (dx / distance) * force * 3;
            this.y += (dy / distance) * force * 3;
            this.attraction = force * 0.5;
        } else {
            this.attraction *= 0.95; // Gradually reduce attraction
        }
        
        // Twinkle effect
        this.brightness += this.twinkleSpeed * this.twinkleDirection;
        
        if (this.brightness > 1) {
            this.brightness = 1;
            this.twinkleDirection = -1;
        } else if (this.brightness < 0.2) {
            this.brightness = 0.2;
            this.twinkleDirection = 1;
        }
        
        // Move stars slowly
        this.x += this.speed;
        
        // Wrap around edges
        if (this.x > this.canvas.width + 10) {
            this.x = -10;
            this.y = Math.random() * this.canvas.height;
        }
    }
    
    draw(ctx) {
        // Enhanced glow for stars being attracted
        const glowSize = this.size * (3 + this.attraction * 5);
        
        // Create gradient for star glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );
        
        // Red color with varying brightness
        const redValue = Math.floor(255 * this.colorIntensity * this.brightness);
        const alphaValue = this.brightness * 0.7 + this.attraction * 0.3;
        
        gradient.addColorStop(0, `rgba(${redValue}, 0, 0, ${alphaValue})`);
        gradient.addColorStop(0.6, `rgba(${redValue}, 0, 0, ${alphaValue * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        // Draw star glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw star core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${redValue}, 0, 0)`;
        ctx.fill();
    }
}

// Main application
class StarryNight {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.attractMode = false;
        this.starCount = 150;
        this.animationId = null;
    }
    
    init() {
        // Get canvas element
        this.canvas = document.getElementById('starCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to window size
        this.resizeCanvas();
        
        // Redraw on window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Initialize stars
        this.initStars();
        
        // Set up controls
        this.setupControls();
        
        // Start animation
        this.animate();
        
        // Start shooting stars interval
        setInterval(() => this.createShootingStar(), 100);
    }
    
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    
    initStars(count = this.starCount) {
        this.stars = [];
        if (!this.canvas) return;
        
        for (let i = 0; i < count; i++) {
            this.stars.push(new Star(this.canvas));
        }
        this.starCount = count;
    }
    
    addMoreStars() {
        if (!this.canvas) return;
        
        const additionalStars = 50;
        for (let i = 0; i < additionalStars; i++) {
            this.stars.push(new Star(this.canvas));
        }
        this.starCount += additionalStars;
    }
    
    increaseTwinkleSpeed() {
        this.stars.forEach(star => {
            star.twinkleSpeed = Math.random() * 0.05 + 0.03;
        });
    }
    
    animate() {
        if (!this.canvas || !this.ctx) return;
        
        // Clear canvas with subtle fade effect for trails
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw some faint distant stars in background
        for (let i = 0; i < 30; i++) {
            const x = (i * this.canvas.width / 30 + Date.now() / 5000) % this.canvas.width;
            const y = (Math.sin(i) * this.canvas.height / 4 + this.canvas.height / 2) + Math.sin(Date.now() / 3000 + i) * 20;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(80, 0, 0, 0.5)`;
            this.ctx.fill();
        }
        
        // Update and draw each star
        this.stars.forEach(star => {
            star.update(this.mouseX, this.mouseY, this.attractMode);
            star.draw(this.ctx);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    createShootingStar() {
        if (!this.canvas || !this.ctx) return;
        
        // Only create shooting star occasionally
        if (Math.random() > 0.995) {
            const shootingStar = {
                x: Math.random() * this.canvas.width / 2,
                y: Math.random() * this.canvas.height / 4,
                speedX: Math.random() * 10 + 5,
                speedY: Math.random() * 3 + 1,
                size: Math.random() * 2 + 1,
                life: 100,
                trail: []
            };
            
            // Animate shooting star
            const animateShootingStar = () => {
                if (shootingStar.life > 0) {
                    shootingStar.x += shootingStar.speedX;
                    shootingStar.y += shootingStar.speedY;
                    shootingStar.life--;
                    
                    // Add to trail
                    shootingStar.trail.push({
                        x: shootingStar.x,
                        y: shootingStar.y,
                        size: shootingStar.size
                    });
                    
                    // Keep trail length limited
                    if (shootingStar.trail.length > 20) {
                        shootingStar.trail.shift();
                    }
                    
                    // Draw shooting star with trail
                    for (let i = 0; i < shootingStar.trail.length; i++) {
                        const point = shootingStar.trail[i];
                        const alpha = i / shootingStar.trail.length;
                        
                        this.ctx.beginPath();
                        this.ctx.arc(point.x, point.y, point.size * alpha, 0, Math.PI * 2);
                        this.ctx.fillStyle = `rgba(255, ${Math.floor(100 * alpha)}, 0, ${alpha})`;
                        this.ctx.fill();
                    }
                    
                    requestAnimationFrame(animateShootingStar);
                }
            };
            
            animateShootingStar();
        }
    }
    
    setupControls() {
        // Control buttons - check if they exist first
        const twinkleButton = document.getElementById('twinkleFaster');
        const moreStarsButton = document.getElementById('moreStars');
        const attractButton = document.getElementById('attractStars');
        const resetButton = document.getElementById('resetStars');
        
        if (!twinkleButton || !moreStarsButton || !attractButton || !resetButton) {
            console.error('One or more control buttons not found!');
            return;
        }
        
        // Twinkle faster button
        twinkleButton.addEventListener('click', () => {
            this.increaseTwinkleSpeed();
            twinkleButton.textContent = "Twinkling Faster!";
            setTimeout(() => {
                twinkleButton.textContent = "Make Stars Twinkle Faster";
            }, 2000);
        });
        
        // More stars button
        moreStarsButton.addEventListener('click', () => {
            this.addMoreStars();
            moreStarsButton.textContent = `Stars Added! (${this.starCount} total)`;
            setTimeout(() => {
                moreStarsButton.textContent = "Add More Stars";
            }, 2000);
        });
        
        // Attract stars button
        attractButton.addEventListener('click', () => {
            this.attractMode = !this.attractMode;
            attractButton.textContent = this.attractMode ? "Attraction On!" : "Attract Stars to Cursor";
            attractButton.style.backgroundColor = this.attractMode ? '#990000' : '#330000';
        });
        
        // Reset stars button
        resetButton.addEventListener('click', () => {
            this.initStars(150);
            this.starCount = 150;
            this.attractMode = false;
            attractButton.textContent = "Attract Stars to Cursor";
            attractButton.style.backgroundColor = '#330000';
            resetButton.textContent = "Stars Reset!";
            setTimeout(() => {
                resetButton.textContent = "Reset Stars";
            }, 2000);
        });
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const starryNight = new StarryNight();
    starryNight.init();
    
    // Also make sure the window resize event works
    window.addEventListener('load', () => {
        starryNight.resizeCanvas();
    });
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const starryNight = new StarryNight();
        starryNight.init();
    });
} else {
    // DOM already loaded, initialize immediately
    const starryNight = new StarryNight();
    starryNight.init();
}