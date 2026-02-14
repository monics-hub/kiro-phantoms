// Unit tests for EnemySpawner class
// Feature: kiro-phantoms
// Tests enemy spawning: timers, spawn positions, maximum counts, cleanup

const { EnemySpawner, GameEngine, Pelican, Shark } = require('../../game.js');

// Mock GameEngine for testing
class MockGameEngine {
    constructor() {
        this.entities = [];
        this.canvas = { width: 1920, height: 1080 };
    }
}

// Test suite for EnemySpawner class
describe('EnemySpawner Class', () => {
    let mockGameEngine;
    let spawner;
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    const oceanY = canvasHeight * 0.8; // 864

    beforeEach(() => {
        mockGameEngine = new MockGameEngine();
        spawner = new EnemySpawner(mockGameEngine, canvasWidth, canvasHeight, oceanY);
    });

    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(spawner.gameEngine).toBe(mockGameEngine);
            expect(spawner.canvasWidth).toBe(canvasWidth);
            expect(spawner.canvasHeight).toBe(canvasHeight);
            expect(spawner.oceanY).toBe(oceanY);
        });

        test('should initialize spawn timers to 0', () => {
            expect(spawner.pelicanTimer).toBe(0);
            expect(spawner.sharkTimer).toBe(0);
        });

        test('should set maximum enemy counts - Requirement 10.5, 10.6', () => {
            expect(spawner.maxPelicans).toBe(2);
            expect(spawner.maxSharks).toBe(1);
        });

        test('should initialize spawn intervals within valid ranges', () => {
            // Pelican interval should be 2-4 seconds
            expect(spawner.pelicanInterval).toBeGreaterThanOrEqual(2);
            expect(spawner.pelicanInterval).toBeLessThanOrEqual(4);
            
            // Shark interval should be 4-8 seconds
            expect(spawner.sharkInterval).toBeGreaterThanOrEqual(4);
            expect(spawner.sharkInterval).toBeLessThanOrEqual(8);
        });
    });

    describe('getRandomPelicanInterval - Requirement 10.1', () => {
        test('should return interval between 2 and 4 seconds', () => {
            for (let i = 0; i < 100; i++) {
                const interval = spawner.getRandomPelicanInterval();
                expect(interval).toBeGreaterThanOrEqual(2);
                expect(interval).toBeLessThanOrEqual(4);
            }
        });

        test('should return different values on multiple calls', () => {
            const intervals = new Set();
            for (let i = 0; i < 20; i++) {
                intervals.add(spawner.getRandomPelicanInterval());
            }
            // Should have multiple unique values (randomness check)
            expect(intervals.size).toBeGreaterThan(1);
        });
    });

    describe('getRandomSharkInterval - Requirement 10.2', () => {
        test('should return interval between 4 and 8 seconds', () => {
            for (let i = 0; i < 100; i++) {
                const interval = spawner.getRandomSharkInterval();
                expect(interval).toBeGreaterThanOrEqual(4);
                expect(interval).toBeLessThanOrEqual(8);
            }
        });

        test('should return different values on multiple calls', () => {
            const intervals = new Set();
            for (let i = 0; i < 20; i++) {
                intervals.add(spawner.getRandomSharkInterval());
            }
            // Should have multiple unique values (randomness check)
            expect(intervals.size).toBeGreaterThan(1);
        });
    });

    describe('spawnPelican - Requirement 3.2, 10.3', () => {
        test('should spawn pelican at right edge of screen', () => {
            spawner.spawnPelican();
            
            expect(mockGameEngine.entities.length).toBe(1);
            const pelican = mockGameEngine.entities[0];
            expect(pelican).toBeInstanceOf(Pelican);
            expect(pelican.x).toBe(canvasWidth);
        });

        test('should spawn pelican with random Y position in sky', () => {
            const yPositions = new Set();
            
            for (let i = 0; i < 20; i++) {
                mockGameEngine.entities = [];
                spawner.spawnPelican();
                
                const pelican = mockGameEngine.entities[0];
                yPositions.add(pelican.y);
                
                // Y should be within playable sky area
                expect(pelican.y).toBeGreaterThanOrEqual(50);
                expect(pelican.y).toBeLessThanOrEqual(oceanY - 100);
            }
            
            // Should have multiple unique Y positions (randomness check)
            expect(yPositions.size).toBeGreaterThan(1);
        });

        test('should not spawn if maximum pelican count reached - Requirement 10.5', () => {
            // Add 2 active pelicans (maximum)
            mockGameEngine.entities.push(new Pelican(800, 200));
            mockGameEngine.entities.push(new Pelican(600, 300));
            
            spawner.spawnPelican();
            
            // Should still have only 2 pelicans
            expect(mockGameEngine.entities.length).toBe(2);
        });

        test('should spawn if below maximum pelican count', () => {
            // Add 1 active pelican
            mockGameEngine.entities.push(new Pelican(800, 200));
            
            spawner.spawnPelican();
            
            // Should now have 2 pelicans
            expect(mockGameEngine.entities.length).toBe(2);
        });

        test('should spawn if pelican is inactive', () => {
            // Add 2 pelicans but one is inactive
            const inactivePelican = new Pelican(800, 200);
            inactivePelican.active = false;
            mockGameEngine.entities.push(inactivePelican);
            mockGameEngine.entities.push(new Pelican(600, 300));
            
            spawner.spawnPelican();
            
            // Should spawn new pelican (only 1 active before)
            expect(mockGameEngine.entities.length).toBe(3);
        });
    });

    describe('spawnShark - Requirement 4.2, 10.4', () => {
        test('should spawn shark at ocean surface', () => {
            spawner.spawnShark();
            
            expect(mockGameEngine.entities.length).toBe(1);
            const shark = mockGameEngine.entities[0];
            expect(shark).toBeInstanceOf(Shark);
            expect(shark.y).toBe(oceanY);
        });

        test('should spawn shark with random X position', () => {
            const xPositions = new Set();
            
            for (let i = 0; i < 20; i++) {
                mockGameEngine.entities = [];
                spawner.spawnShark();
                
                const shark = mockGameEngine.entities[0];
                xPositions.add(shark.x);
                
                // X should be within canvas bounds with padding
                expect(shark.x).toBeGreaterThanOrEqual(50);
                expect(shark.x).toBeLessThanOrEqual(canvasWidth - 120);
            }
            
            // Should have multiple unique X positions (randomness check)
            expect(xPositions.size).toBeGreaterThan(1);
        });

        test('should not spawn if maximum shark count reached - Requirement 10.6', () => {
            // Add 1 active shark (maximum)
            mockGameEngine.entities.push(new Shark(500, oceanY));
            
            spawner.spawnShark();
            
            // Should still have only 1 shark
            expect(mockGameEngine.entities.length).toBe(1);
        });

        test('should spawn if no sharks exist', () => {
            spawner.spawnShark();
            
            // Should have 1 shark
            expect(mockGameEngine.entities.length).toBe(1);
        });

        test('should spawn if shark is inactive', () => {
            // Add 1 inactive shark
            const inactiveShark = new Shark(500, oceanY);
            inactiveShark.active = false;
            mockGameEngine.entities.push(inactiveShark);
            
            spawner.spawnShark();
            
            // Should spawn new shark (0 active before)
            expect(mockGameEngine.entities.length).toBe(2);
        });
    });

    describe('cleanupOffscreenEnemies - Requirement 3.4', () => {
        test('should remove pelicans that moved past left edge', () => {
            const pelican = new Pelican(-100, 200);
            mockGameEngine.entities.push(pelican);
            
            spawner.cleanupOffscreenEnemies();
            
            expect(pelican.active).toBe(false);
        });

        test('should not remove pelicans still on screen', () => {
            const pelican = new Pelican(100, 200);
            mockGameEngine.entities.push(pelican);
            
            spawner.cleanupOffscreenEnemies();
            
            expect(pelican.active).toBe(true);
        });

        test('should remove pelicans at exact left edge', () => {
            const pelican = new Pelican(-60, 200); // x + width = 0
            mockGameEngine.entities.push(pelican);
            
            spawner.cleanupOffscreenEnemies();
            
            expect(pelican.active).toBe(false);
        });

        test('should not affect sharks (they self-cleanup)', () => {
            const shark = new Shark(-100, oceanY);
            mockGameEngine.entities.push(shark);
            
            spawner.cleanupOffscreenEnemies();
            
            // Shark active state should not be changed by spawner
            expect(shark.active).toBe(true);
        });

        test('should handle mixed entities', () => {
            const offscreenPelican = new Pelican(-100, 200);
            const onscreenPelican = new Pelican(500, 300);
            const shark = new Shark(400, oceanY);
            
            mockGameEngine.entities.push(offscreenPelican, onscreenPelican, shark);
            
            spawner.cleanupOffscreenEnemies();
            
            expect(offscreenPelican.active).toBe(false);
            expect(onscreenPelican.active).toBe(true);
            expect(shark.active).toBe(true);
        });
    });

    describe('update method - Requirement 3.1, 4.1', () => {
        test('should increment pelican timer', () => {
            spawner.update(1.0);
            
            expect(spawner.pelicanTimer).toBe(1.0);
        });

        test('should increment shark timer', () => {
            spawner.update(1.5);
            
            expect(spawner.sharkTimer).toBe(1.5);
        });

        test('should spawn pelican when timer reaches interval', () => {
            spawner.pelicanInterval = 2.0;
            spawner.pelicanTimer = 0;
            
            spawner.update(2.0);
            
            // Should have spawned a pelican
            const pelicans = mockGameEngine.entities.filter(e => e instanceof Pelican);
            expect(pelicans.length).toBe(1);
        });

        test('should reset pelican timer after spawn', () => {
            spawner.pelicanInterval = 2.0;
            spawner.pelicanTimer = 0;
            
            spawner.update(2.0);
            
            expect(spawner.pelicanTimer).toBe(0);
        });

        test('should set new random pelican interval after spawn', () => {
            const oldInterval = spawner.pelicanInterval;
            spawner.pelicanTimer = 0;
            
            spawner.update(oldInterval);
            
            // New interval should be in valid range
            expect(spawner.pelicanInterval).toBeGreaterThanOrEqual(2);
            expect(spawner.pelicanInterval).toBeLessThanOrEqual(4);
        });

        test('should spawn shark when timer reaches interval', () => {
            spawner.sharkInterval = 4.0;
            spawner.sharkTimer = 0;
            
            spawner.update(4.0);
            
            // Should have spawned a shark
            const sharks = mockGameEngine.entities.filter(e => e instanceof Shark);
            expect(sharks.length).toBe(1);
        });

        test('should reset shark timer after spawn', () => {
            spawner.sharkInterval = 4.0;
            spawner.sharkTimer = 0;
            
            spawner.update(4.0);
            
            expect(spawner.sharkTimer).toBe(0);
        });

        test('should set new random shark interval after spawn', () => {
            const oldInterval = spawner.sharkInterval;
            spawner.sharkTimer = 0;
            
            spawner.update(oldInterval);
            
            // New interval should be in valid range
            expect(spawner.sharkInterval).toBeGreaterThanOrEqual(4);
            expect(spawner.sharkInterval).toBeLessThanOrEqual(8);
        });

        test('should call cleanup on each update', () => {
            const offscreenPelican = new Pelican(-100, 200);
            mockGameEngine.entities.push(offscreenPelican);
            
            spawner.update(0.1);
            
            expect(offscreenPelican.active).toBe(false);
        });

        test('should handle multiple spawns over time', () => {
            spawner.pelicanInterval = 2.0;
            spawner.sharkInterval = 4.0;
            
            // Update for 5 seconds
            spawner.update(5.0);
            
            // Should have spawned at least 2 pelicans and 1 shark
            const pelicans = mockGameEngine.entities.filter(e => e instanceof Pelican);
            const sharks = mockGameEngine.entities.filter(e => e instanceof Shark);
            
            expect(pelicans.length).toBeGreaterThanOrEqual(2);
            expect(sharks.length).toBeGreaterThanOrEqual(1);
        });

        test('should respect maximum counts during update', () => {
            // Add maximum pelicans
            mockGameEngine.entities.push(new Pelican(800, 200));
            mockGameEngine.entities.push(new Pelican(600, 300));
            
            spawner.pelicanInterval = 1.0;
            spawner.update(1.0);
            
            // Should not spawn more pelicans
            const pelicans = mockGameEngine.entities.filter(e => e instanceof Pelican);
            expect(pelicans.length).toBe(2);
        });
    });

    describe('Edge cases', () => {
        test('should handle zero deltaTime', () => {
            const initialPelicanTimer = spawner.pelicanTimer;
            const initialSharkTimer = spawner.sharkTimer;
            
            spawner.update(0);
            
            expect(spawner.pelicanTimer).toBe(initialPelicanTimer);
            expect(spawner.sharkTimer).toBe(initialSharkTimer);
        });

        test('should handle very small deltaTime', () => {
            spawner.update(0.001);
            
            expect(spawner.pelicanTimer).toBeCloseTo(0.001, 5);
            expect(spawner.sharkTimer).toBeCloseTo(0.001, 5);
        });

        test('should handle very large deltaTime', () => {
            spawner.pelicanInterval = 2.0;
            spawner.sharkInterval = 4.0;
            
            spawner.update(100.0);
            
            // Should spawn enemies (but respect max counts)
            expect(mockGameEngine.entities.length).toBeGreaterThan(0);
        });

        test('should handle empty entity list', () => {
            mockGameEngine.entities = [];
            
            expect(() => spawner.cleanupOffscreenEnemies()).not.toThrow();
        });

        test('should handle canvas at minimum size', () => {
            const smallSpawner = new EnemySpawner(mockGameEngine, 320, 240, 192);
            
            smallSpawner.spawnPelican();
            smallSpawner.spawnShark();
            
            expect(mockGameEngine.entities.length).toBe(2);
        });
    });
});
