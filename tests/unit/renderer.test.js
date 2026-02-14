/**
 * Unit tests for Renderer class
 * Tests canvas drawing methods for background, ocean, entities, and UI elements
 */

const { Renderer, Entity, Kiro } = require('../../game.js');

describe('Renderer', () => {
    let canvas, ctx, renderer;

    beforeEach(() => {
        // Create mock canvas and context
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn()
        };

        ctx = {
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()
            })),
            fillStyle: '',
            font: '',
            textAlign: ''
        };

        canvas.getContext.mockReturnValue(ctx);
        renderer = new Renderer(canvas);
    });

    describe('constructor', () => {
        test('should initialize with canvas and context', () => {
            expect(renderer.canvas).toBe(canvas);
            expect(renderer.ctx).toBe(ctx);
        });

        test('should initialize cloud positions', () => {
            expect(renderer.cloudPositions).toBeDefined();
            expect(renderer.cloudPositions.length).toBeGreaterThan(0);
            expect(renderer.cloudPositions[0]).toHaveProperty('x');
            expect(renderer.cloudPositions[0]).toHaveProperty('y');
        });

        test('should handle null canvas', () => {
            const nullRenderer = new Renderer(null);
            expect(nullRenderer.canvas).toBeNull();
            expect(nullRenderer.ctx).toBeNull();
        });
    });

    describe('clear', () => {
        test('should clear entire canvas', () => {
            renderer.clear();
            expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.clear()).not.toThrow();
        });
    });

    describe('drawBackground', () => {
        test('should draw sky gradient', () => {
            renderer.drawBackground();
            
            // Should create gradient from top to 80% height
            expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 0, 480);
            
            // Should draw sky rectangle
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 480);
        });

        test('should call drawClouds', () => {
            const drawCloudsSpy = jest.spyOn(renderer, 'drawClouds');
            renderer.drawBackground();
            expect(drawCloudsSpy).toHaveBeenCalled();
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.drawBackground()).not.toThrow();
        });
    });

    describe('drawClouds', () => {
        test('should draw clouds at predefined positions', () => {
            renderer.drawClouds();
            
            // Should set white fill style
            expect(ctx.fillStyle).toBe('#FFFFFF');
            
            // Should draw rectangles for each cloud
            const cloudCount = renderer.cloudPositions.length;
            expect(ctx.fillRect).toHaveBeenCalled();
            
            // Each cloud has 3 rectangles (main body + 2 layers)
            expect(ctx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(cloudCount * 3);
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.drawClouds()).not.toThrow();
        });
    });

    describe('drawOcean', () => {
        test('should draw ocean at bottom 20% of canvas', () => {
            renderer.drawOcean();
            
            const oceanY = 480; // 80% of 600
            const oceanHeight = 120; // 20% of 600
            
            // Should create gradient from ocean surface to bottom
            expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, oceanY, 0, 600);
            
            // Should draw ocean rectangle
            expect(ctx.fillRect).toHaveBeenCalledWith(0, oceanY, 800, oceanHeight);
        });

        test('should draw waves at ocean surface', () => {
            renderer.drawOcean();
            
            // Should draw wave rectangles
            expect(ctx.fillRect).toHaveBeenCalled();
            
            // Check that waves are drawn (multiple fillRect calls)
            expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(1);
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.drawOcean()).not.toThrow();
        });
    });

    describe('drawEntity', () => {
        test('should call entity render method', () => {
            const entity = new Entity(100, 100, 40, 40);
            entity.render = jest.fn();
            
            renderer.drawEntity(entity);
            
            expect(entity.render).toHaveBeenCalledWith(ctx);
        });

        test('should not render inactive entity', () => {
            const entity = new Entity(100, 100, 40, 40);
            entity.active = false;
            entity.render = jest.fn();
            
            renderer.drawEntity(entity);
            
            expect(entity.render).not.toHaveBeenCalled();
        });

        test('should not throw if entity is null', () => {
            expect(() => renderer.drawEntity(null)).not.toThrow();
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            const entity = new Entity(100, 100, 40, 40);
            expect(() => renderer.drawEntity(entity)).not.toThrow();
        });
    });

    describe('drawHearts', () => {
        test('should draw correct number of hearts', () => {
            renderer.drawHearts(5);
            
            // Each heart has 5 rectangles (main body + 4 parts)
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.fillRect.mock.calls.length).toBe(5 * 5);
        });

        test('should draw hearts with red color', () => {
            renderer.drawHearts(3);
            
            // Should set red fill style
            expect(ctx.fillStyle).toBe('#FF0000');
        });

        test('should draw hearts at correct positions', () => {
            renderer.drawHearts(2);
            
            // First heart should start at x=20
            const firstHeartCalls = ctx.fillRect.mock.calls.slice(0, 5);
            expect(firstHeartCalls[0][0]).toBeGreaterThanOrEqual(20);
            
            // Second heart should be spaced apart
            const secondHeartCalls = ctx.fillRect.mock.calls.slice(5, 10);
            expect(secondHeartCalls[0][0]).toBeGreaterThan(firstHeartCalls[0][0]);
        });

        test('should handle zero lives', () => {
            renderer.drawHearts(0);
            
            // Should not draw any hearts
            expect(ctx.fillRect).not.toHaveBeenCalled();
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.drawHearts(5)).not.toThrow();
        });
    });

    describe('drawStartScreen', () => {
        test('should draw title text', () => {
            renderer.drawStartScreen();
            
            expect(ctx.fillText).toHaveBeenCalledWith(
                'Kiro Phantoms',
                400, // canvas.width / 2
                250  // canvas.height / 2 - 50
            );
        });

        test('should draw instruction text', () => {
            renderer.drawStartScreen();
            
            expect(ctx.fillText).toHaveBeenCalledWith(
                'Press Space or Tap to Start',
                400, // canvas.width / 2
                350  // canvas.height / 2 + 50
            );
        });

        test('should set white text color', () => {
            renderer.drawStartScreen();
            expect(ctx.fillStyle).toBe('#FFFFFF');
        });

        test('should center align text', () => {
            renderer.drawStartScreen();
            expect(ctx.textAlign).toBe('center');
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.drawStartScreen()).not.toThrow();
        });
    });

    describe('drawGameOverScreen', () => {
        test('should draw game over text', () => {
            renderer.drawGameOverScreen();
            
            expect(ctx.fillText).toHaveBeenCalledWith(
                'Game Over',
                400, // canvas.width / 2
                250  // canvas.height / 2 - 50
            );
        });

        test('should draw restart instruction text', () => {
            renderer.drawGameOverScreen();
            
            expect(ctx.fillText).toHaveBeenCalledWith(
                'Press Space or Tap to Restart',
                400, // canvas.width / 2
                350  // canvas.height / 2 + 50
            );
        });

        test('should set white text color', () => {
            renderer.drawGameOverScreen();
            expect(ctx.fillStyle).toBe('#FFFFFF');
        });

        test('should center align text', () => {
            renderer.drawGameOverScreen();
            expect(ctx.textAlign).toBe('center');
        });

        test('should not throw if context is null', () => {
            renderer.ctx = null;
            expect(() => renderer.drawGameOverScreen()).not.toThrow();
        });
    });

    describe('integration with Kiro', () => {
        test('should render Kiro entity', () => {
            const kiro = new Kiro(100, 200);
            
            renderer.drawEntity(kiro);
            
            // Kiro should be rendered (white rectangle + eyes)
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.fillStyle).toContain('#');
        });
    });
});
