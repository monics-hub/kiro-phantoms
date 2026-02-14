// Kiro Phantoms - Game Engine
// A browser-based arcade game built with vanilla JavaScript

// ===== Entity System =====

/**
 * Entity base class
 * Represents any game object with position, velocity, and collision bounds
 */
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
    }

    /**
     * Update entity state based on elapsed time
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Base implementation - subclasses should override
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    /**
     * Render entity to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Base implementation - subclasses should override
        // Draw a simple rectangle for debugging
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Get axis-aligned bounding box for collision detection
     * @returns {{left: number, right: number, top: number, bottom: number}}
     */
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// ===== Kiro (Player Character) =====

/**
 * Kiro class - Player character
 * Extends Entity with jump mechanics, gravity, and boundary clamping
 */
class Kiro extends Entity {
    /**
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(x, y) {
        super(x, y, 80, 80); // 80x80 pixel sprite (2x bigger)
        
        // Physics constants
        this.jumpStrength = -800;  // Upward velocity when jumping (negative = up) - 2x faster
        this.gravity = 2400;       // Downward acceleration (pixels/second²) - 2x faster
        this.maxFallSpeed = 1200;   // Maximum downward velocity (pixels/second) - 2x faster
    }

    /**
     * Make Kiro jump by applying upward velocity
     */
    jump() {
        this.velocityY = this.jumpStrength;
    }

    /**
     * Update Kiro's position and apply physics
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Apply gravity to velocity
        this.velocityY += this.gravity * deltaTime;
        
        // Clamp fall speed to maximum
        if (this.velocityY > this.maxFallSpeed) {
            this.velocityY = this.maxFallSpeed;
        }
        
        // Update position based on velocity
        super.update(deltaTime);
        
        // Clamp to top boundary (prevent going above screen)
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0; // Stop upward movement at boundary
        }
        
        // Note: No bottom boundary clamping - ocean is a hazard
    }

    /**
     * Render Kiro as a white phantom sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
            // Draw Kiro using sprite image
            if (sprites.kiro.complete) {
                ctx.drawImage(sprites.kiro, this.x, this.y, this.width, this.height);
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

}

// ===== Pelican (Enemy) =====

/**
 * Pelican class - Flying enemy
 * Extends Entity with constant horizontal movement and flying animation
 */
class Pelican extends Entity {
    /**
     * @param {number} x - Initial x position (typically right edge of screen)
     * @param {number} y - Initial y position (random vertical position in sky)
     */
    constructor(x, y) {
        super(x, y, 180, 120); // 180x120 pixel sprite (3x bigger)
        
        // Movement constants
        this.speed = -800; // Move left at constant speed (pixels/second) - 4x faster
        this.velocityX = this.speed;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 8; // Frames per animation cycle
        this.animationTimer = 0;
    }

    /**
     * Update pelican position and animation
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Update position (constant horizontal movement)
        super.update(deltaTime);
        
        // Update animation frame counter
        this.animationTimer += deltaTime;
        if (this.animationTimer >= 0.1) { // Update animation every 0.1 seconds
            this.animationFrame = (this.animationFrame + 1) % this.animationSpeed;
            this.animationTimer = 0;
        }
    }

    /**
     * Render pelican with orange beak in pixel art style
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
            // Draw Pelican using sprite image
            if (sprites.pelican.complete) {
                ctx.drawImage(sprites.pelican, this.x, this.y, this.width, this.height);
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(this.x + 10, this.y + 10, 40, 20);
            }
        }

}

// ===== Shark (Enemy) =====

/**
 * Shark class - Jumping enemy
 * Extends Entity with parabolic trajectory, gravity, and jumping animation
 */
class Shark extends Entity {
    /**
     * @param {number} x - Initial x position (random horizontal position)
     * @param {number} oceanY - Y position of ocean surface
     */
    constructor(x, oceanY) {
        super(x, oceanY, 420, 300);

        this.initialVelocityY = -1200; 
        this.gravity = 1200;
        this.oceanY = oceanY;

        // Randomize horizontal speed for variety
        this.velocityX = -300 - Math.random() * 200; 

        this.velocityY = this.initialVelocityY;
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 6; // Frames per animation cycle
        this.animationTimer = 0;
    }

    /**
     * Update shark position and animation
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Apply gravity to create parabolic arc
        this.velocityY += this.gravity * deltaTime;
        
        // Apply horizontal and vertical movement explicitly
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Check if shark has returned to ocean surface
        // Use > instead of >= to allow collision detection at ocean surface
        if (this.y > this.oceanY) {
            this.active = false; // Remove shark when it returns to ocean
        }
        
        // Deactivate if moved off screen (left side)
        if (this.x + this.width < 0) {
            this.active = false;
        }
        
        // Update animation frame counter
        this.animationTimer += deltaTime;
        if (this.animationTimer >= 0.1) { // Update animation every 0.1 seconds
            this.animationFrame = (this.animationFrame + 1) % this.animationSpeed;
            this.animationTimer = 0;
        }
    }

    /**
     * Render shark with open mouth in pixel art style
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
            // Use shark_underwater sprite when at ocean surface, regular shark when jumping
            const useUnderwaterSprite = this.y >= this.oceanY - 10;
            const spriteImage = useUnderwaterSprite ? sprites.sharkUnderwater : sprites.shark;

            if (spriteImage.complete) {
                ctx.drawImage(spriteImage, this.x, this.y, this.width, this.height);
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = '#4A5568';
                ctx.fillRect(this.x + 10, this.y + 15, 50, 25);
            }
        }

}

// ===== Cloud (Background Element) =====

/**
 * Cloud class - Decorative background element
 * Extends Entity with slow horizontal movement
 */
class Cloud extends Entity {
    /**
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(x, y) {
        super(x, y, 300, 180); // 300x180 pixel sprite (even bigger clouds)
        
        // Movement constants
        this.speed = -30; // Move left slowly (pixels/second)
        this.velocityX = this.speed;
    }

    /**
     * Update cloud position
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Move horizontally
        this.x += this.velocityX * deltaTime;
        
        // Deactivate if moved off screen (left side)
        if (this.x + this.width < 0) {
            this.active = false;
        }
    }

    /**
     * Render cloud sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Draw Cloud using sprite image
        if (sprites.cloud && sprites.cloud.complete) {
            ctx.drawImage(sprites.cloud, this.x, this.y, this.width, this.height);
        } else {
            // Fallback if image not loaded
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1.0;
        }
    }
}

// ===== Enemy Spawner =====

/**
 * EnemySpawner class
 * Manages spawn timers for pelicans and sharks
 * Creates enemy entities at appropriate positions
 * Enforces maximum enemy counts
 */
class EnemySpawner {
    /**
     * @param {GameEngine} gameEngine - Reference to the game engine
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     * @param {number} oceanY - Y position of ocean surface
     */
    constructor(gameEngine, canvasWidth, canvasHeight, oceanY) {
        this.gameEngine = gameEngine;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.oceanY = oceanY;
        
        // Spawn timers (track time until next spawn)
        this.pelicanTimer = 0;
        this.sharkTimer = 0;
        this.cloudTimer = 0;
        
        // Spawn intervals (randomized on each spawn)
        this.pelicanInterval = this.getRandomPelicanInterval();
        this.sharkInterval = this.getRandomSharkInterval();
        this.cloudInterval = this.getRandomCloudInterval();
        
        // Maximum simultaneous enemy counts
        this.maxPelicans = 6;
        this.maxSharks = 3;
        this.maxClouds = 4;
    }

    /**
     * Get random spawn interval for pelicans (2-4 seconds)
     * @returns {number} Random interval in seconds
     */
    getRandomPelicanInterval() {
        return 1 + Math.random() * 1; // 1-2 seconds (2x faster spawning)
    }

    /**
     * Get random spawn interval for sharks (4-8 seconds)
     * @returns {number} Random interval in seconds
     */
    getRandomSharkInterval() {
        return 1.25 + Math.random() * 1.25; // 1.25-2.5 seconds (4x faster spawning)
    }

    /**
     * Get random cloud spawn interval
     * @returns {number} Random interval in seconds
     */
    getRandomCloudInterval() {
        return 5 + Math.random() * 5; // 5-10 seconds
    }

    /**
     * Update spawn timers and spawn enemies
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Update timers
        this.pelicanTimer += deltaTime;
        this.sharkTimer += deltaTime;
        this.cloudTimer += deltaTime;
        
        // Check if it's time to spawn a pelican
        if (this.pelicanTimer >= this.pelicanInterval) {
            this.spawnPelican();
            this.pelicanTimer = 0;
            this.pelicanInterval = this.getRandomPelicanInterval();
        }
        
        // Check if it's time to spawn a shark
        if (this.sharkTimer >= this.sharkInterval) {
            this.spawnShark();
            this.sharkTimer = 0;
            this.sharkInterval = this.getRandomSharkInterval();
        }
        
        // Check if it's time to spawn a cloud
        if (this.cloudTimer >= this.cloudInterval) {
            this.spawnCloud();
            this.cloudTimer = 0;
            this.cloudInterval = this.getRandomCloudInterval();
        }
        
        // Clean up off-screen enemies
        this.cleanupOffscreenEnemies();
    }

    /**
     * Spawn a pelican at the right edge with random Y position
     */
    spawnPelican() {
        // Count current active pelicans
        const activePelicans = this.gameEngine.entities.filter(
            entity => entity instanceof Pelican && entity.active
        ).length;
        
        // Don't spawn if at maximum count
        if (activePelicans >= this.maxPelicans) {
            return;
        }
        
        // Spawn at right edge of screen
        const x = this.canvasWidth;
        
        // Random Y position in sky (playable area is 0 to oceanY)
        // Add some padding from top and bottom to keep pelicans visible
        const minY = 50; // Padding from top
        const maxY = this.oceanY - 100; // Padding from ocean
        const y = minY + Math.random() * (maxY - minY);
        
        // Create and add pelican to entities
        const pelican = new Pelican(x, y);
        this.gameEngine.entities.push(pelican);
    }

    /**
     * Spawn a shark at the ocean surface with random X position
     */
    spawnShark() {
        // Count current active sharks
        const activeSharks = this.gameEngine.entities.filter(
            entity => entity instanceof Shark && entity.active
        ).length;
        
        // Don't spawn if at maximum count
        if (activeSharks >= this.maxSharks) {
            return;
        }
        
        // Random X position along ocean surface
        // Add some padding from edges to keep sharks visible
        const minX = 50; // Padding from left edge
        const maxX = this.canvasWidth - 120; // Padding from right edge (shark width + margin)
        const x = minX + Math.random() * (maxX - minX);
        
        // Spawn at ocean surface
        const shark = new Shark(x, this.oceanY);
        this.gameEngine.entities.push(shark);
    }

    /**
     * Spawn a cloud at random position
     */
    spawnCloud() {
        // Count current active clouds
        const activeClouds = this.gameEngine.entities.filter(
            entity => entity instanceof Cloud && entity.active
        ).length;
        
        // Don't spawn if at maximum count
        if (activeClouds >= this.maxClouds) {
            return;
        }
        
        // Spawn at right edge of screen
        const x = this.canvasWidth;
        
        // Random Y position in upper portion of sky (top 40% of screen)
        const minY = 20;
        const maxY = this.canvasHeight * 0.9;
        const y = minY + Math.random() * (maxY - minY);
        
        const cloud = new Cloud(x, y);
        this.gameEngine.entities.push(cloud);
    }

    /**
     * Remove enemies that have moved off-screen
     */
    cleanupOffscreenEnemies() {
        for (const entity of this.gameEngine.entities) {
            // Remove pelicans that moved past left edge
            if (entity instanceof Pelican && entity.x + entity.width < 0) {
                entity.active = false;
            }
            
            // Sharks are automatically removed when they return to ocean (in Shark.update)
        }
    }
}

// ===== Collision System =====

/**
 * CollisionSystem class
 * Performs AABB (Axis-Aligned Bounding Box) intersection tests
 * Detects collisions between Kiro and enemies, and Kiro and ocean surface
 */
class CollisionSystem {
    /**
     * Check if two entities are colliding using AABB intersection
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {boolean} True if entities are overlapping
     */
    checkCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        // AABB intersection test
        // Two boxes overlap if they overlap on both X and Y axes
        return (
            bounds1.right > bounds2.left &&
            bounds1.left < bounds2.right &&
            bounds1.bottom > bounds2.top &&
            bounds1.top < bounds2.bottom
        );
    }

    /**
     * Check if Kiro is colliding with the ocean surface
     * @param {Kiro} kiro - The player character
     * @param {number} oceanY - Y position of ocean surface
     * @returns {boolean} True if Kiro is touching or below ocean surface
     */
    checkOceanCollision(kiro, oceanY) {
        const bounds = kiro.getBounds();
        
        // Check if Kiro's bottom edge touches or goes below ocean surface
        return bounds.bottom >= oceanY;
    }

    /**
     * Check all collisions for Kiro against enemies and ocean
     * @param {Kiro} kiro - The player character
     * @param {Array<Entity>} enemies - Array of enemy entities
     * @param {number} oceanY - Y position of ocean surface
     * @returns {Array<Entity|string>} Array of colliding entities or 'ocean' string
     */
    checkAllCollisions(kiro, enemies, oceanY) {
        const collisions = [];
        
        // Check collision with each enemy (exclude clouds)
        for (const enemy of enemies) {
            if (enemy.active && !(enemy instanceof Cloud) && this.checkCollision(kiro, enemy)) {
                collisions.push(enemy);
            }
        }
        
        // Check collision with ocean surface
        if (this.checkOceanCollision(kiro, oceanY)) {
            collisions.push('ocean');
        }
        
        return collisions;
    }
}

// ===== Game Engine =====

/**
 * GameEngine class
 * Orchestrates the game loop, manages game state, and coordinates all subsystems
 */
class GameEngine {
    /**
     * @param {string} canvasId - ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = (typeof document !== 'undefined') ? document.getElementById(canvasId) : null;
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Initialize renderer
        this.renderer = this.canvas ? new Renderer(this.canvas) : null;
        
        // Game state: 'start', 'playing', 'gameover'
        this.state = 'start';
        
        // Entity management
        this.entities = [];
        this.kiro = null;
        
        // Life system
        this.lives = 5;
        
        // Time tracking for delta time calculation
        this.lastTimestamp = 0;
        
        // Animation frame ID for cleanup
        this.animationFrameId = null;
        
        // Enemy spawner (will be initialized after canvas setup)
        this.enemySpawner = null;
    }

    /**
     * Initialize the game engine
     */
    init() {
        // Reset game state (always do this, even in test environment)
        this.state = 'start';
        this.lives = 5;
        this.entities = [];
        this.lastTimestamp = 0;
        
        // Only do canvas operations if canvas is available (browser environment)
        if (!this.canvas || !this.ctx) {
            console.error('Canvas not found or context unavailable');
            return;
        }

        // Set canvas size to fill viewport
        this.resizeCanvas();
        
        // Initialize enemy spawner
        const oceanY = this.canvas.height * 0.8;
        this.enemySpawner = new EnemySpawner(
            this,
            this.canvas.width,
            this.canvas.height,
            oceanY
        );
        
        // Handle window resize
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }

    /**
     * Resize canvas to fill viewport
     */
    resizeCanvas() {
        if (this.canvas && typeof window !== 'undefined') {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    /**
     * Start the game
     */
    start() {
        this.state = 'playing';
        this.lastTimestamp = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        this.gameLoop(this.lastTimestamp);
    }

    /**
     * Main game loop using requestAnimationFrame
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    gameLoop(timestamp) {
        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Update and render
        this.update(deltaTime);
        this.render();

        // Continue loop if playing
        if (this.state === 'playing' && typeof requestAnimationFrame !== 'undefined') {
            this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    /**
         * Update game state
         * @param {number} deltaTime - Time elapsed since last frame in seconds
         */
        update(deltaTime) {
            if (this.state !== 'playing') {
                return;
            }

            // Update enemy spawner
            if (this.enemySpawner) {
                this.enemySpawner.update(deltaTime);
            }

            // Update all active entities
            for (const entity of this.entities) {
                if (entity.active) {
                    entity.update(deltaTime);
                }
            }

            // Update Kiro if exists
            if (this.kiro) {
                this.kiro.update(deltaTime);
            }

            // Check collisions
            if (this.kiro) {
                const collisionSystem = new CollisionSystem();
                const oceanY = this.canvas ? this.canvas.height * 0.8 : 0;
                const collisions = collisionSystem.checkAllCollisions(this.kiro, this.entities, oceanY);

                // Handle collisions
                if (collisions.length > 0) {
                    // Decrease lives by 1 for any collision
                    this.lives -= 1;

                    // Check if ocean collision occurred
                    const oceanCollision = collisions.includes('ocean');
                    
                    // Remove colliding enemies from entity list
                    for (const collision of collisions) {
                        if (collision !== 'ocean' && collision instanceof Entity) {
                            collision.active = false;
                        }
                    }
                    
                    // If Kiro hit the ocean, respawn at center Y position
                    if (oceanCollision && this.canvas) {
                        this.kiro.y = this.canvas.height * 0.4; // Center of sky area (80% of screen is sky)
                        this.kiro.velocityY = 0; // Reset velocity
                    }
                    
                    // Check for game over
                    if (this.lives <= 0) {
                        this.state = 'gameover';
                    }
                }
            }

            // Remove inactive entities
            this.entities = this.entities.filter(entity => entity.active);
        }


    /**
     * Render game state
     */
    render() {
        if (!this.renderer) {
            return;
        }

        // Clear canvas and draw background
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawOcean();

        // Render based on state
        if (this.state === 'start') {
            this.renderStartScreen();
        } else if (this.state === 'playing') {
            this.renderPlaying();
        } else if (this.state === 'gameover') {
            this.renderGameOver();
        }
    }

    /**
     * Render start screen
     */
    renderStartScreen() {
        this.renderer.drawStartScreen();
    }

    /**
     * Render playing state
     */
    renderPlaying() {
        // Render clouds first (background layer)
        for (const entity of this.entities) {
            if (entity.active && entity instanceof Cloud) {
                this.renderer.drawEntity(entity);
            }
        }
        
        // Render enemies (middle layer)
        for (const entity of this.entities) {
            if (entity.active && !(entity instanceof Cloud)) {
                this.renderer.drawEntity(entity);
            }
        }

        // Render Kiro (foreground)
        if (this.kiro) {
            this.renderer.drawEntity(this.kiro);
        }

        // Render lives as hearts (UI layer)
        this.renderer.drawHearts(this.lives);
    }

    /**
     * Render game over screen
     */
    renderGameOver() {
        this.renderer.drawGameOverScreen();
    }

    /**
     * Restart the game
     */
    restart() {
        // Reset game state
        this.state = 'playing';
        this.lives = 5;
        this.entities = [];
        
        // Reset Kiro position
        if (this.kiro && this.canvas) {
            this.kiro.x = 100;
            this.kiro.y = 200;
            this.kiro.velocityY = 0;
        }
        
        // Reset enemy spawner timers
        if (this.enemySpawner) {
            this.enemySpawner.pelicanTimer = 0;
            this.enemySpawner.sharkTimer = 0;
            this.enemySpawner.cloudTimer = 0;
        }
    }

    /**
     * Handle collision between entities
     * @param {Entity} entity1 
     * @param {Entity} entity2 
     */
    handleCollision(entity1, entity2) {
        // Placeholder - will be implemented with collision system
        console.log('Collision detected');
    }

    /**
     * Trigger game over state
     */
    gameOver() {
        this.state = 'gameover';
        
        // Cancel animation frame
        if (this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

// ===== Renderer =====

/**
 * Renderer class
 * Handles all canvas drawing operations including background, ocean, and entities
 */
class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
        
        // Cloud positions for background animation
        this.cloudPositions = [
            { x: 100, y: 80 },
            { x: 300, y: 120 },
            { x: 500, y: 60 },
            { x: 700, y: 140 }
        ];
    }

    /**
     * Clear the canvas
     */
    clear() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw sky background with clouds
     */
    drawBackground() {
        if (!this.ctx) return;
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.8);
        gradient.addColorStop(0, '#87CEEB'); // Light sky blue at top
        gradient.addColorStop(1, '#B0E0E6'); // Powder blue at horizon
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.8);
        
        // Draw simple clouds
        this.drawClouds();
    }

    /**
     * Draw clouds in the sky
     */
    drawClouds() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = '#FFFFFF';
        
        for (const cloud of this.cloudPositions) {
            // Draw cloud as a series of rectangles (pixel art style)
            const cloudWidth = 60;
            const cloudHeight = 20;
            
            // Main cloud body (rectangles for pixel art style)
            this.ctx.fillRect(cloud.x, cloud.y, cloudWidth, cloudHeight);
            this.ctx.fillRect(cloud.x + 10, cloud.y - 8, cloudWidth - 20, cloudHeight);
            this.ctx.fillRect(cloud.x + 20, cloud.y - 12, cloudWidth - 40, cloudHeight);
        }
    }

    /**
     * Draw ocean at the bottom 20% of canvas
     */
    drawOcean() {
        if (!this.ctx) return;
        
        const oceanY = this.canvas.height * 0.8;
        const oceanHeight = this.canvas.height * 0.2;
        
        // Draw ocean with gradient
        const gradient = this.ctx.createLinearGradient(0, oceanY, 0, this.canvas.height);
        gradient.addColorStop(0, '#1E90FF'); // Dodger blue at surface
        gradient.addColorStop(1, '#0047AB'); // Darker blue at bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, oceanY, this.canvas.width, oceanHeight);
        
        // Draw simple waves at the surface (pixel art style)
        this.ctx.fillStyle = '#4169E1'; // Royal blue for wave details
        const waveHeight = 4;
        const waveWidth = 20;
        
        for (let x = 0; x < this.canvas.width; x += waveWidth * 2) {
            this.ctx.fillRect(x, oceanY, waveWidth, waveHeight);
        }
    }

    /**
     * Draw an entity sprite
     * @param {Entity} entity - The entity to render
     */
    drawEntity(entity) {
        if (!this.ctx || !entity || !entity.active) return;
        
        // Use the entity's own render method
        entity.render(this.ctx);
    }

    /**
     * Draw heart icons representing remaining lives
     * @param {number} lives - Number of lives to display
     */
    drawHearts(lives) {
        if (!this.ctx) return;
        
        const heartSize = 40;
        const heartSpacing = 10;
        const startX = 20;
        const startY = 20;
        
        for (let i = 0; i < lives; i++) {
            const x = startX + i * (heartSize + heartSpacing);
            
            // Draw heart using sprite image
            if (sprites.heart && sprites.heart.complete) {
                this.ctx.drawImage(sprites.heart, x, startY, heartSize, heartSize);
            } else {
                // Fallback if image not loaded
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(x + 8, startY, 14, 14);
                this.ctx.fillRect(x + 4, startY + 4, 22, 14);
                this.ctx.fillRect(x + 8, startY + 18, 14, 8);
                this.ctx.fillRect(x, startY + 4, 8, 8);
                this.ctx.fillRect(x + 22, startY + 4, 8, 8);
            }
        }
    }

    /**
     * Draw start screen
     */
    drawStartScreen() {
            if (!this.ctx) return;

            // Dibujar título
            if (sprites.title && sprites.title.naturalWidth > 0) {
                const titleWidth = 600;   // ajusta según tu sprite
                const titleHeight = 200;  // ajusta según tu sprite
                const titleX = (this.canvas.width - titleWidth) / 2;
                const titleY = this.canvas.height / 2 - 150;

                this.ctx.drawImage(
                    sprites.title,
                    0, 0, sprites.title.naturalWidth, sprites.title.naturalHeight, // fuente
                    titleX, titleY, titleWidth, titleHeight                        // destino
                );
            }

            // Texto de instrucción
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Press Space or Tap to Start',
                this.canvas.width / 2,
                this.canvas.height / 2 + 100
            );
        }


    /**
     * Draw game over screen
     */
    drawGameOverScreen() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px monospace';
        this.ctx.fillText('Press Space or Tap to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}

// ===== Input Handler =====

/**
 * InputHandler class
 * Manages keyboard and touch input events
 * Translates user input into game actions
 */
class InputHandler {
    /**
     * @param {GameEngine} gameEngine - Reference to the game engine
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.keyListeners = [];
        this.touchListeners = [];
    }

    /**
     * Initialize input listeners
     */
    init() {
        // Only set up listeners in browser environment
        if (typeof document === 'undefined') {
            return;
        }

        // Keyboard listener for spacebar
        const handleKeyDown = (event) => {
            if (event.code === 'Space' || event.key === ' ') {
                event.preventDefault(); // Prevent page scroll
                this.handleInput();
            }
        };

        // Touch listener for mobile
        const handleTouchStart = (event) => {
            event.preventDefault(); // Prevent default touch behavior
            this.handleInput();
        };

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('touchstart', handleTouchStart);

        // Store references for cleanup
        this.keyListeners.push(handleKeyDown);
        this.touchListeners.push(handleTouchStart);
    }

    /**
     * Handle input event (spacebar or touch)
     */
    handleInput() {
        if (this.gameEngine.state === 'playing' && this.gameEngine.kiro) {
            // Make Kiro jump during gameplay
            this.gameEngine.kiro.jump();
        } else if (this.gameEngine.state === 'start') {
            // Start game from start screen
            this.gameEngine.start();
        } else if (this.gameEngine.state === 'gameover') {
            // Restart game from game over screen
            this.gameEngine.restart();
        }
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (typeof document === 'undefined') {
            return;
        }

        // Remove all keyboard listeners
        for (const listener of this.keyListeners) {
            document.removeEventListener('keydown', listener);
        }

        // Remove all touch listeners
        for (const listener of this.touchListeners) {
            document.removeEventListener('touchstart', listener);
        }

        // Clear listener arrays
        this.keyListeners = [];
        this.touchListeners = [];
    }
}

// ===== Canvas Setup =====

// Preload sprite images
const sprites = {
    kiro: new Image(),
    pelican: new Image(),
    shark: new Image(),
    sharkUnderwater: new Image(),
    heart: new Image(),
    cloud: new Image(),
    title: new Image()
};

sprites.kiro.src = 'img/kiro.png';
sprites.pelican.src = 'img/pelican.png';
sprites.shark.src = 'img/shark.png';
sprites.sharkUnderwater.src = 'img/shark_underwater.png';
sprites.heart.src = 'img/heart.png';
sprites.cloud.src = 'img/cloud.png';
sprites.title.src = 'img/title.png';
sprites.title.onload = () => { // Force a redraw once the image is ready 
if (window.game) { 
    window.game.render(); 
} };

// Only run canvas setup in browser environment with actual canvas element
if (typeof document !== 'undefined') {
    const canvas = document.getElementById('gameCanvas');
    
    if (canvas) {
        // Initialize game engine
        const game = new GameEngine('gameCanvas');
        window.game = game; // Make globally accessible for debugging
        game.init();
        
        // Create Kiro instance for the game
        game.kiro = new Kiro(100, 200);
        
        // Initialize input handler
        const inputHandler = new InputHandler(game);
        inputHandler.init();
        
        // Make game instance and input handler globally accessible for debugging
        window.game = game;
        window.inputHandler = inputHandler;
        
        // Render initial start screen
        game.render();
    }
}

// ===== Module Exports (for testing) =====
// Export classes for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Entity,
        Kiro,
        Pelican,
        Shark,
        Cloud,
        CollisionSystem,
        GameEngine,
        InputHandler,
        Renderer,
        EnemySpawner
    };
}
