// Unit tests for Entity base class
// Feature: kiro-phantoms
// Tests basic entity functionality: position, velocity, bounding box

const { Entity } = require('../../game.js');

// Mock canvas context for testing
const mockCtx = {
    fillStyle: '',
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {}
};

// Test suite for Entity class
describe('Entity Base Class', () => {
    describe('Constructor', () => {
        test('should initialize with correct position and dimensions', () => {
            const entity = new Entity(100, 200, 50, 60);
            
            expect(entity.x).toBe(100);
            expect(entity.y).toBe(200);
            expect(entity.width).toBe(50);
            expect(entity.height).toBe(60);
        });

        test('should initialize velocities to zero', () => {
            const entity = new Entity(0, 0, 10, 10);
            
            expect(entity.velocityX).toBe(0);
            expect(entity.velocityY).toBe(0);
        });

        test('should initialize as active', () => {
            const entity = new Entity(0, 0, 10, 10);
            
            expect(entity.active).toBe(true);
        });
    });

    describe('update method', () => {
        test('should update position based on velocity and deltaTime', () => {
            const entity = new Entity(100, 100, 10, 10);
            entity.velocityX = 50;  // 50 pixels per second
            entity.velocityY = -30; // -30 pixels per second
            
            entity.update(1); // 1 second
            
            expect(entity.x).toBe(150);
            expect(entity.y).toBe(70);
        });

        test('should scale movement by deltaTime', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 100;
            entity.velocityY = 100;
            
            entity.update(0.5); // Half second
            
            expect(entity.x).toBe(50);
            expect(entity.y).toBe(50);
        });

        test('should handle zero deltaTime', () => {
            const entity = new Entity(100, 100, 10, 10);
            entity.velocityX = 50;
            entity.velocityY = 50;
            
            entity.update(0);
            
            expect(entity.x).toBe(100);
            expect(entity.y).toBe(100);
        });

        test('should handle negative velocities', () => {
            const entity = new Entity(100, 100, 10, 10);
            entity.velocityX = -50;
            entity.velocityY = -50;
            
            entity.update(1);
            
            expect(entity.x).toBe(50);
            expect(entity.y).toBe(50);
        });
    });

    describe('getBounds method', () => {
        test('should return correct bounding box', () => {
            const entity = new Entity(100, 200, 50, 60);
            const bounds = entity.getBounds();
            
            expect(bounds.left).toBe(100);
            expect(bounds.right).toBe(150);
            expect(bounds.top).toBe(200);
            expect(bounds.bottom).toBe(260);
        });

        test('should update bounds after position change', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.x = 50;
            entity.y = 50;
            
            const bounds = entity.getBounds();
            
            expect(bounds.left).toBe(50);
            expect(bounds.right).toBe(60);
            expect(bounds.top).toBe(50);
            expect(bounds.bottom).toBe(60);
        });

        test('should handle zero-sized entities', () => {
            const entity = new Entity(100, 100, 0, 0);
            const bounds = entity.getBounds();
            
            expect(bounds.left).toBe(100);
            expect(bounds.right).toBe(100);
            expect(bounds.top).toBe(100);
            expect(bounds.bottom).toBe(100);
        });
    });

    describe('render method', () => {
        test('should call canvas fillRect with correct parameters', () => {
            const entity = new Entity(100, 200, 50, 60);
            const mockContext = {
                fillStyle: '',
                fillRect: jest.fn()
            };
            
            entity.render(mockContext);
            
            expect(mockContext.fillRect).toHaveBeenCalledWith(100, 200, 50, 60);
        });

        test('should set fillStyle before rendering', () => {
            const entity = new Entity(0, 0, 10, 10);
            const mockContext = {
                fillStyle: '',
                fillRect: jest.fn()
            };
            
            entity.render(mockContext);
            
            expect(mockContext.fillStyle).toBe('#FF00FF');
        });
    });

    describe('Edge cases', () => {
        test('should handle very small deltaTime values', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 1000;
            
            entity.update(0.001); // 1 millisecond
            
            expect(entity.x).toBeCloseTo(1, 5);
        });

        test('should handle large velocity values', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 10000;
            
            entity.update(0.1);
            
            expect(entity.x).toBe(1000);
        });

        test('should maintain active state through updates', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 100;
            
            entity.update(1);
            
            expect(entity.active).toBe(true);
        });
    });
});
