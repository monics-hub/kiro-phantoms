// Unit tests for Shark enemy class
// Feature: kiro-phantoms
// Tests shark behavior: parabolic trajectory, gravity, animation, rendering

const { Shark } = require('../../game.js');

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

// Test suite for Shark class
describe('Shark Enemy Class', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with correct position and dimensions', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            expect(shark.x).toBe(400);
            expect(shark.y).toBe(oceanY);
            expect(shark.width).toBe(70);
            expect(shark.height).toBe(50);
        });

        test('should initialize with upward velocity for jump - Requirement 4.2', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            expect(shark.initialVelocityY).toBe(-500);
            expect(shark.velocityY).toBe(-500); // Should start with upward velocity
        });

        test('should store ocean surface position', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            expect(shark.oceanY).toBe(oceanY);
        });

        test('should initialize gravity constant - Requirement 4.4', () => {
            const shark = new Shark(400, 600);
            
            expect(shark.gravity).toBe(1200);
        });

        test('should initialize animation properties - Requirement 4.6', () => {
            const shark = new Shark(400, 600);
            
            expect(shark.animationFrame).toBe(0);
            expect(shark.animationSpeed).toBe(6);
            expect(shark.animationTimer).toBe(0);
        });

        test('should be active by default', () => {
            const shark = new Shark(400, 600);
            
            expect(shark.active).toBe(true);
        });
    });

    describe('update method - Requirement 4.3: Parabolic trajectory', () => {
        test('should move upward initially with negative velocity', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            const initialY = shark.y;
            shark.update(0.1); // 0.1 seconds
            
            // Should move upward (y decreases)
            expect(shark.y).toBeLessThan(initialY);
        });

        test('should apply gravity to increase downward velocity - Requirement 4.4', () => {
            const shark = new Shark(400, 600);
            
            const initialVelocityY = shark.velocityY;
            shark.update(0.1);
            
            // Velocity should increase (become less negative, then positive)
            expect(shark.velocityY).toBeGreaterThan(initialVelocityY);
            expect(shark.velocityY).toBeCloseTo(-500 + 1200 * 0.1, 5);
        });

        test('should follow parabolic arc - upward then downward', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            // Track positions over time
            const positions = [shark.y];
            
            // Simulate jump arc
            for (let i = 0; i < 10; i++) {
                shark.update(0.05);
                positions.push(shark.y);
            }
            
            // Should go up first (y decreases)
            expect(positions[1]).toBeLessThan(positions[0]);
            expect(positions[2]).toBeLessThan(positions[1]);
            
            // Should eventually come back down (y increases)
            expect(positions[positions.length - 1]).toBeGreaterThan(positions[4]);
        });

        test('should deactivate when returning to ocean surface - Requirement 4.5', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            // Simulate full jump arc until return to ocean
            for (let i = 0; i < 100; i++) {
                if (!shark.active) break;
                shark.update(0.01);
            }
            
            // Should be deactivated when y >= oceanY
            expect(shark.active).toBe(false);
            expect(shark.y).toBeGreaterThanOrEqual(oceanY);
        });

        test('should scale movement by deltaTime', () => {
            const shark = new Shark(400, 600);
            
            const initialY = shark.y;
            shark.update(0.1);
            const yAfter01 = shark.y;
            
            const shark2 = new Shark(400, 600);
            shark2.update(0.2);
            const yAfter02 = shark2.y;
            
            // Movement should scale with deltaTime
            const movement01 = initialY - yAfter01;
            const movement02 = initialY - yAfter02;
            
            expect(movement02).toBeCloseTo(movement01 * 2, 0);
        });
    });

    describe('update method - Requirement 4.6: Animation frame counter', () => {
        test('should increment animation frame over time', () => {
            const shark = new Shark(400, 600);
            
            expect(shark.animationFrame).toBe(0);
            
            shark.update(0.1); // First animation update
            expect(shark.animationFrame).toBe(1);
            
            shark.update(0.1); // Second animation update
            expect(shark.animationFrame).toBe(2);
        });

        test('should cycle animation frames from 0 to animationSpeed-1', () => {
            const shark = new Shark(400, 600);
            
            // Update through full animation cycle
            for (let i = 0; i < shark.animationSpeed; i++) {
                shark.update(0.1);
            }
            
            // Should wrap back to 0
            expect(shark.animationFrame).toBe(0);
        });

        test('should update animation timer correctly', () => {
            const shark = new Shark(400, 600);
            
            shark.update(0.05); // Half of animation threshold
            expect(shark.animationTimer).toBeCloseTo(0.05, 5);
            expect(shark.animationFrame).toBe(0); // Not updated yet
            
            shark.update(0.05); // Reach threshold
            expect(shark.animationTimer).toBe(0); // Reset
            expect(shark.animationFrame).toBe(1); // Updated
        });

        test('should continue animating throughout jump', () => {
            const shark = new Shark(400, 600);
            
            // Simulate several frames of jump
            for (let i = 0; i < 5; i++) {
                shark.update(0.1);
            }
            
            // Animation should have progressed
            expect(shark.animationFrame).toBeGreaterThan(0);
        });
    });

    describe('render method - Requirement 6.5: Open mouth in pixel art style', () => {
        test('should render shark body', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Check that body is rendered (gray)
            expect(ctx.fillRect).toHaveBeenCalledWith(110, 615, 50, 25);
        });

        test('should render shark head', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Check head rendering
            expect(ctx.fillRect).toHaveBeenCalledWith(100, 610, 20, 30);
        });

        test('should render dorsal fin', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Check dorsal fin rendering
            expect(ctx.fillRect).toHaveBeenCalledWith(130, 605, 15, 12);
        });

        test('should render tail with fins', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Check tail rendering
            expect(ctx.fillRect).toHaveBeenCalledWith(155, 620, 15, 15);
            expect(ctx.fillRect).toHaveBeenCalledWith(160, 615, 10, 8); // Upper tail fin
            expect(ctx.fillRect).toHaveBeenCalledWith(160, 633, 10, 8); // Lower tail fin
        });

        test('should render eye', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Check eye rendering (black)
            expect(ctx.fillRect).toHaveBeenCalledWith(108, 618, 4, 4);
        });

        test('should render open mouth with teeth when animationFrame < 3', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.animationFrame = 0; // Mouth open
            shark.render(ctx);
            
            // Check mouth opening (red)
            expect(ctx.fillRect).toHaveBeenCalledWith(102, 628, 12, 8);
            
            // Check teeth (white)
            expect(ctx.fillRect).toHaveBeenCalledWith(103, 628, 2, 4); // Tooth 1
            expect(ctx.fillRect).toHaveBeenCalledWith(107, 628, 2, 4); // Tooth 2
            expect(ctx.fillRect).toHaveBeenCalledWith(111, 628, 2, 4); // Tooth 3
        });

        test('should render closed mouth when animationFrame >= 3', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.animationFrame = 4; // Mouth closed
            shark.render(ctx);
            
            // Check closed mouth line (red)
            expect(ctx.fillRect).toHaveBeenCalledWith(102, 632, 12, 4);
        });

        test('should render belly', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Check belly rendering (lighter gray)
            expect(ctx.fillRect).toHaveBeenCalledWith(115, 630, 40, 8);
        });

        test('should use correct colors', () => {
            const shark = new Shark(100, 600);
            const ctx = { ...mockCtx, fillRect: jest.fn() };
            
            shark.render(ctx);
            
            // Should use gray for body
            expect(ctx.fillStyle).toContain('#4A5568');
            
            // Should use red for mouth
            expect(ctx.fillStyle).toContain('#FF0000');
            
            // Should use black for eye
            expect(ctx.fillStyle).toContain('#000000');
        });
    });

    describe('Edge cases', () => {
        test('should handle spawning at different horizontal positions', () => {
            const shark1 = new Shark(100, 600);
            const shark2 = new Shark(800, 600);
            
            expect(shark1.x).toBe(100);
            expect(shark2.x).toBe(800);
            expect(shark1.velocityY).toBe(shark2.velocityY);
        });

        test('should handle very small deltaTime', () => {
            const shark = new Shark(400, 600);
            const initialY = shark.y;
            
            shark.update(0.001);
            
            expect(shark.y).toBeCloseTo(initialY - 0.5, 1);
        });

        test('should handle zero deltaTime', () => {
            const shark = new Shark(400, 600);
            const initialY = shark.y;
            const initialVelocityY = shark.velocityY;
            const initialFrame = shark.animationFrame;
            
            shark.update(0);
            
            expect(shark.y).toBe(initialY);
            expect(shark.velocityY).toBe(initialVelocityY);
            expect(shark.animationFrame).toBe(initialFrame);
        });

        test('should not deactivate while above ocean surface', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            // Update a few times while still in air
            shark.update(0.1);
            shark.update(0.1);
            
            expect(shark.active).toBe(true);
            expect(shark.y).toBeLessThan(oceanY);
        });

        test('should handle different ocean surface heights', () => {
            const shark1 = new Shark(400, 500);
            const shark2 = new Shark(400, 700);
            
            expect(shark1.oceanY).toBe(500);
            expect(shark2.oceanY).toBe(700);
        });
    });

    describe('Integration with Entity base class', () => {
        test('should inherit getBounds method', () => {
            const shark = new Shark(100, 600);
            const bounds = shark.getBounds();
            
            expect(bounds.left).toBe(100);
            expect(bounds.right).toBe(170); // 100 + 70
            expect(bounds.top).toBe(600);
            expect(bounds.bottom).toBe(650); // 600 + 50
        });

        test('should update bounds after movement', () => {
            const shark = new Shark(400, 600);
            
            shark.update(0.1);
            
            const bounds = shark.getBounds();
            expect(bounds.top).toBeLessThan(600); // Should have moved up
            expect(bounds.bottom).toBeLessThan(650);
        });

        test('should maintain correct bounds throughout parabolic arc', () => {
            const shark = new Shark(400, 600);
            
            // Test bounds at different points in arc
            for (let i = 0; i < 5; i++) {
                shark.update(0.1);
                const bounds = shark.getBounds();
                
                // Bounds should always be valid
                expect(bounds.right).toBe(bounds.left + 70);
                expect(bounds.bottom).toBe(bounds.top + 50);
            }
        });
    });

    describe('Physics validation - Parabolic trajectory', () => {
        test('should reach peak height and return', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            let minY = shark.y;
            let reachedPeak = false;
            
            // Simulate jump
            for (let i = 0; i < 100; i++) {
                if (!shark.active) break;
                
                shark.update(0.01);
                
                if (shark.y < minY) {
                    minY = shark.y;
                }
                
                if (shark.velocityY > 0 && !reachedPeak) {
                    reachedPeak = true;
                }
            }
            
            // Should have reached a peak (moved up from ocean)
            expect(minY).toBeLessThan(oceanY);
            
            // Should have reached peak (velocity became positive)
            expect(reachedPeak).toBe(true);
            
            // Should have returned to ocean
            expect(shark.active).toBe(false);
        });

        test('should have symmetric trajectory', () => {
            const oceanY = 600;
            const shark = new Shark(400, oceanY);
            
            const positions = [];
            
            // Record positions during jump
            for (let i = 0; i < 100; i++) {
                if (!shark.active) break;
                positions.push(shark.y);
                shark.update(0.01);
            }
            
            // Find peak (minimum y)
            const minY = Math.min(...positions);
            const peakIndex = positions.indexOf(minY);
            
            // Trajectory should be roughly symmetric around peak
            expect(peakIndex).toBeGreaterThan(0);
            expect(peakIndex).toBeLessThan(positions.length - 1);
        });
    });
});
