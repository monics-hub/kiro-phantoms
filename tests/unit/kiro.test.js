// Unit tests for Kiro class
// Feature: kiro-phantoms
// Tests Kiro player character: jump mechanics, gravity, boundary clamping

const { Kiro } = require('../../game.js');

// Mock canvas context for testing
const mockCtx = {
    fillStyle: '',
    fillRect: jest.fn()
};

describe('Kiro Player Character', () => {
    describe('Constructor', () => {
        test('should initialize with correct position', () => {
            const kiro = new Kiro(100, 200);
            
            expect(kiro.x).toBe(100);
            expect(kiro.y).toBe(200);
        });

        test('should initialize with 40x40 dimensions', () => {
            const kiro = new Kiro(0, 0);
            
            expect(kiro.width).toBe(40);
            expect(kiro.height).toBe(40);
        });

        test('should initialize with zero velocity', () => {
            const kiro = new Kiro(0, 0);
            
            expect(kiro.velocityX).toBe(0);
            expect(kiro.velocityY).toBe(0);
        });

        test('should initialize with correct physics constants', () => {
            const kiro = new Kiro(0, 0);
            
            expect(kiro.jumpStrength).toBe(-400);
            expect(kiro.gravity).toBe(1200);
            expect(kiro.maxFallSpeed).toBe(600);
        });

        test('should be active by default', () => {
            const kiro = new Kiro(0, 0);
            
            expect(kiro.active).toBe(true);
        });
    });

    describe('jump method', () => {
        test('should set upward velocity when jumping', () => {
            const kiro = new Kiro(100, 100);
            
            kiro.jump();
            
            expect(kiro.velocityY).toBe(-400);
        });

        test('should override current velocity when jumping', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = 100; // Falling
            
            kiro.jump();
            
            expect(kiro.velocityY).toBe(-400);
        });

        test('should allow multiple jumps', () => {
            const kiro = new Kiro(100, 100);
            
            kiro.jump();
            expect(kiro.velocityY).toBe(-400);
            
            kiro.jump();
            expect(kiro.velocityY).toBe(-400);
        });
    });

    describe('gravity application', () => {
        test('should apply gravity to increase downward velocity', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = 0;
            
            kiro.update(1); // 1 second
            
            expect(kiro.velocityY).toBe(1200);
        });

        test('should apply gravity continuously', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = 100;
            
            kiro.update(0.5); // 0.5 seconds
            
            expect(kiro.velocityY).toBe(100 + 1200 * 0.5);
            expect(kiro.velocityY).toBe(700);
        });

        test('should apply gravity after jump', () => {
            const kiro = new Kiro(100, 100);
            kiro.jump();
            
            kiro.update(0.1); // 0.1 seconds
            
            // velocityY = -400 + 1200 * 0.1 = -400 + 120 = -280
            expect(kiro.velocityY).toBe(-280);
        });

        test('should clamp velocity to maxFallSpeed', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = 500;
            
            kiro.update(1); // Would be 500 + 1200 = 1700 without clamping
            
            expect(kiro.velocityY).toBe(600); // Clamped to maxFallSpeed
        });

        test('should not clamp upward velocity', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = -500;
            
            kiro.update(0.01); // Small time step
            
            expect(kiro.velocityY).toBeLessThan(0); // Still moving upward
        });
    });

    describe('position updates', () => {
        test('should update position based on velocity', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = -400;
            
            kiro.update(1); // 1 second
            
            // Position should move up, but gravity also applies
            // velocityY after gravity: -400 + 1200 = 800
            // Average velocity during frame: (-400 + 800) / 2 = 200
            // But we apply velocity first, then gravity
            // So: y = 100 + (-400 * 1) = -300, then gravity applied to velocity
            expect(kiro.y).toBeLessThan(100); // Moved upward
        });

        test('should move downward when falling', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = 200;
            
            kiro.update(1);
            
            expect(kiro.y).toBeGreaterThan(100);
        });

        test('should scale movement by deltaTime', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = -400;
            
            kiro.update(0.5); // Half second
            
            expect(kiro.y).toBeLessThan(100);
        });
    });

    describe('top boundary clamping', () => {
        test('should clamp position to top boundary', () => {
            const kiro = new Kiro(100, 10);
            kiro.velocityY = -500; // Fast upward
            
            kiro.update(1);
            
            expect(kiro.y).toBe(0); // Clamped to top
        });

        test('should reset velocity when hitting top boundary', () => {
            const kiro = new Kiro(100, 10);
            kiro.velocityY = -500;
            
            kiro.update(1);
            
            expect(kiro.velocityY).toBe(0); // Velocity reset
        });

        test('should clamp at exact boundary', () => {
            const kiro = new Kiro(100, 0);
            kiro.velocityY = -100;
            
            kiro.update(0.1);
            
            expect(kiro.y).toBe(0);
            expect(kiro.velocityY).toBe(0);
        });

        test('should not clamp when below boundary', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = -100;
            
            kiro.update(0.5);
            
            expect(kiro.y).toBeGreaterThan(0);
            expect(kiro.velocityY).not.toBe(0);
        });

        test('should allow falling from top boundary', () => {
            const kiro = new Kiro(100, 0);
            kiro.velocityY = 0;
            
            kiro.update(1); // Gravity should pull down
            
            expect(kiro.y).toBeGreaterThan(0);
            expect(kiro.velocityY).toBeGreaterThan(0);
        });
    });

    describe('no bottom boundary', () => {
        test('should allow moving below screen (ocean is hazard)', () => {
            const kiro = new Kiro(100, 500);
            kiro.velocityY = 600;
            
            kiro.update(1);
            
            expect(kiro.y).toBeGreaterThan(500); // Can move down indefinitely
        });

        test('should not clamp at large Y values', () => {
            const kiro = new Kiro(100, 1000);
            kiro.velocityY = 600;
            
            kiro.update(1);
            
            expect(kiro.y).toBeGreaterThan(1000);
        });
    });

    describe('render method', () => {
        beforeEach(() => {
            mockCtx.fillRect.mockClear();
        });

        test('should render white phantom sprite', () => {
            const kiro = new Kiro(100, 200);
            
            kiro.render(mockCtx);
            
            expect(mockCtx.fillStyle).toBe('#FFFFFF');
            expect(mockCtx.fillRect).toHaveBeenCalledWith(100, 200, 40, 40);
        });

        test('should render eyes', () => {
            const kiro = new Kiro(100, 200);
            
            kiro.render(mockCtx);
            
            // Should have 3 fillRect calls: body + 2 eyes
            expect(mockCtx.fillRect).toHaveBeenCalledTimes(3);
        });

        test('should render at current position', () => {
            const kiro = new Kiro(50, 75);
            
            kiro.render(mockCtx);
            
            expect(mockCtx.fillRect).toHaveBeenCalledWith(50, 75, 40, 40);
        });
    });

    describe('integration - jump and fall cycle', () => {
        test('should jump up then fall back down', () => {
            const kiro = new Kiro(100, 300);
            const initialY = kiro.y;
            
            // Jump
            kiro.jump();
            expect(kiro.velocityY).toBe(-400);
            
            // Move up for a bit
            kiro.update(0.1);
            expect(kiro.y).toBeLessThan(initialY);
            expect(kiro.velocityY).toBeGreaterThan(-400); // Gravity slowing upward motion
            
            // Continue until velocity becomes positive (falling)
            while (kiro.velocityY < 0) {
                kiro.update(0.016); // ~60 FPS
            }
            
            expect(kiro.velocityY).toBeGreaterThan(0); // Now falling
            
            // Fall for a bit
            const peakY = kiro.y;
            kiro.update(0.1);
            expect(kiro.y).toBeGreaterThan(peakY); // Moving down
        });

        test('should handle rapid jumps', () => {
            const kiro = new Kiro(100, 300);
            
            kiro.jump();
            kiro.update(0.016);
            kiro.jump();
            kiro.update(0.016);
            kiro.jump();
            kiro.update(0.016);
            
            expect(kiro.velocityY).toBeLessThan(0); // Still moving upward
        });

        test('should reach terminal velocity when falling', () => {
            const kiro = new Kiro(100, 100);
            
            // Fall for a long time
            for (let i = 0; i < 100; i++) {
                kiro.update(0.1);
            }
            
            expect(kiro.velocityY).toBe(600); // At max fall speed
        });
    });

    describe('edge cases', () => {
        test('should handle zero deltaTime', () => {
            const kiro = new Kiro(100, 100);
            const initialY = kiro.y;
            const initialVelocity = kiro.velocityY;
            
            kiro.update(0);
            
            expect(kiro.y).toBe(initialY);
            expect(kiro.velocityY).toBe(initialVelocity);
        });

        test('should handle very small deltaTime', () => {
            const kiro = new Kiro(100, 100);
            kiro.velocityY = -400;
            
            kiro.update(0.001);
            
            expect(kiro.y).toBeCloseTo(99.6, 1); // Moved up slightly
        });

        test('should handle large deltaTime', () => {
            const kiro = new Kiro(100, 100);
            
            kiro.update(10); // 10 seconds
            
            expect(kiro.velocityY).toBe(600); // Clamped to max
            expect(kiro.y).toBeGreaterThan(100); // Moved down significantly
        });
    });
});
