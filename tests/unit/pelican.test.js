// Unit tests for Pelican enemy class
// Feature: kiro-phantoms
// Tests pelican behavior: constant horizontal movement, animation, rendering

const { Pelican } = require('../../game.js');

// Mock canvas context for testing
const mockCtx = {
    fillStyle: '',
    fillRect: jest.fn(),
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {}
};

// Test suite for Pelican class
describe('Pelican Enemy Class', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with correct position and dimensions', () => {
            const pelican = new Pelican(800, 200);
            
            expect(pelican.x).toBe(800);
            expect(pelican.y).toBe(200);
            expect(pelican.width).toBe(60);
            expect(pelican.height).toBe(40);
        });

        test('should initialize with constant leftward velocity', () => {
            const pelican = new Pelican(800, 200);
            
            expect(pelican.speed).toBe(-200);
            expect(pelican.velocityX).toBe(-200);
        });

        test('should initialize animation properties', () => {
            const pelican = new Pelican(800, 200);
            
            expect(pelican.animationFrame).toBe(0);
            expect(pelican.animationSpeed).toBe(8);
            expect(pelican.animationTimer).toBe(0);
        });

        test('should be active by default', () => {
            const pelican = new Pelican(800, 200);
            
            expect(pelican.active).toBe(true);
        });
    });

    describe('update method - Requirement 3.3: Constant horizontal movement', () => {
        test('should move left at constant speed', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(1); // 1 second
            
            expect(pelican.x).toBe(600); // 800 + (-200 * 1)
            expect(pelican.y).toBe(200); // Y should not change
        });

        test('should maintain constant velocity over multiple updates', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(0.5);
            expect(pelican.x).toBe(700); // 800 + (-200 * 0.5)
            
            pelican.update(0.5);
            expect(pelican.x).toBe(600); // 700 + (-200 * 0.5)
            
            // Velocity should remain constant
            expect(pelican.velocityX).toBe(-200);
        });

        test('should scale movement by deltaTime', () => {
            const pelican = new Pelican(1000, 300);
            
            pelican.update(0.1); // 0.1 seconds
            
            expect(pelican.x).toBe(980); // 1000 + (-200 * 0.1)
        });

        test('should not change vertical position', () => {
            const pelican = new Pelican(800, 150);
            
            pelican.update(1);
            pelican.update(1);
            pelican.update(1);
            
            expect(pelican.y).toBe(150); // Y should remain constant
        });
    });

    describe('update method - Requirement 3.5: Animation frame counter', () => {
        test('should increment animation frame over time', () => {
            const pelican = new Pelican(800, 200);
            
            expect(pelican.animationFrame).toBe(0);
            
            pelican.update(0.1); // First animation update
            expect(pelican.animationFrame).toBe(1);
            
            pelican.update(0.1); // Second animation update
            expect(pelican.animationFrame).toBe(2);
        });

        test('should cycle animation frames from 0 to animationSpeed-1', () => {
            const pelican = new Pelican(800, 200);
            
            // Update through full animation cycle
            for (let i = 0; i < pelican.animationSpeed; i++) {
                pelican.update(0.1);
            }
            
            // Should wrap back to 0
            expect(pelican.animationFrame).toBe(0);
        });

        test('should update animation timer correctly', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(0.05); // Half of animation threshold
            expect(pelican.animationTimer).toBeCloseTo(0.05, 5);
            expect(pelican.animationFrame).toBe(0); // Not updated yet
            
            pelican.update(0.05); // Reach threshold
            expect(pelican.animationTimer).toBe(0); // Reset
            expect(pelican.animationFrame).toBe(1); // Updated
        });

        test('should handle multiple animation updates in single frame', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(0.3); // 3x animation threshold
            
            // Should update animation 3 times
            expect(pelican.animationFrame).toBe(3);
        });
    });

    describe('render method - Requirement 6.4: Orange beak in pixel art style', () => {
        test('should render pelican body', () => {
            const pelican = new Pelican(100, 100);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            pelican.render(ctx);
            
            // Check that body is rendered (white)
            expect(ctx.fillRect).toHaveBeenCalledWith(110, 110, 40, 20);
        });

        test('should render orange beak', () => {
            const pelican = new Pelican(100, 100);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            pelican.render(ctx);
            
            // Check that fillStyle is set to orange for beak
            expect(ctx.fillStyle).toContain('#FF8C00');
            
            // Check that beak is rendered
            expect(ctx.fillRect).toHaveBeenCalledWith(154, 116, 6, 8);
        });

        test('should render head and eye', () => {
            const pelican = new Pelican(100, 100);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            pelican.render(ctx);
            
            // Check head rendering
            expect(ctx.fillRect).toHaveBeenCalledWith(140, 108, 20, 24);
            
            // Check eye rendering
            expect(ctx.fillRect).toHaveBeenCalledWith(148, 114, 4, 4);
        });

        test('should animate wings based on animation frame', () => {
            const pelican = new Pelican(100, 100);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            // Wings up (animationFrame < 4)
            pelican.animationFrame = 0;
            pelican.render(ctx);
            
            // Check wings up position
            expect(ctx.fillRect).toHaveBeenCalledWith(115, 104, 20, 8); // Top wing up
            expect(ctx.fillRect).toHaveBeenCalledWith(115, 128, 20, 8); // Bottom wing up
            
            ctx.fillRect.mockClear();
            
            // Wings down (animationFrame >= 4)
            pelican.animationFrame = 5;
            pelican.render(ctx);
            
            // Check wings down position
            expect(ctx.fillRect).toHaveBeenCalledWith(115, 108, 20, 8); // Top wing down
            expect(ctx.fillRect).toHaveBeenCalledWith(115, 124, 20, 8); // Bottom wing down
        });

        test('should render tail', () => {
            const pelican = new Pelican(100, 100);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            pelican.render(ctx);
            
            // Check tail rendering
            expect(ctx.fillRect).toHaveBeenCalledWith(100, 114, 12, 12);
        });
    });

    describe('Edge cases', () => {
        test('should handle spawning at right edge of screen', () => {
            const pelican = new Pelican(1920, 100);
            
            expect(pelican.x).toBe(1920);
            expect(pelican.velocityX).toBe(-200);
        });

        test('should handle very small deltaTime', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(0.001);
            
            expect(pelican.x).toBeCloseTo(799.8, 5);
        });

        test('should handle zero deltaTime', () => {
            const pelican = new Pelican(800, 200);
            const initialX = pelican.x;
            const initialFrame = pelican.animationFrame;
            
            pelican.update(0);
            
            expect(pelican.x).toBe(initialX);
            expect(pelican.animationFrame).toBe(initialFrame);
        });

        test('should maintain active state through updates', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(1);
            pelican.update(1);
            
            expect(pelican.active).toBe(true);
        });
    });

    describe('Integration with Entity base class', () => {
        test('should inherit getBounds method', () => {
            const pelican = new Pelican(100, 200);
            const bounds = pelican.getBounds();
            
            expect(bounds.left).toBe(100);
            expect(bounds.right).toBe(160); // 100 + 60
            expect(bounds.top).toBe(200);
            expect(bounds.bottom).toBe(240); // 200 + 40
        });

        test('should update bounds after movement', () => {
            const pelican = new Pelican(800, 200);
            
            pelican.update(1);
            
            const bounds = pelican.getBounds();
            expect(bounds.left).toBe(600);
            expect(bounds.right).toBe(660);
        });
    });
});
