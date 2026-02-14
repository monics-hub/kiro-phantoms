// Unit tests for InputHandler class
// Feature: kiro-phantoms
// Tests input handling: spacebar, touch, and state-based input processing

const { InputHandler, GameEngine, Kiro } = require('../../game.js');

// Mock document and event listeners
let eventListeners = {};

beforeEach(() => {
    // Reset event listeners before each test
    eventListeners = {};
    
    // Mock document.addEventListener
    global.document = {
        addEventListener: jest.fn((event, handler) => {
            if (!eventListeners[event]) {
                eventListeners[event] = [];
            }
            eventListeners[event].push(handler);
        }),
        removeEventListener: jest.fn((event, handler) => {
            if (eventListeners[event]) {
                eventListeners[event] = eventListeners[event].filter(h => h !== handler);
            }
        })
    };
});

afterEach(() => {
    // Clean up global mocks
    delete global.document;
});

describe('InputHandler', () => {
    describe('Constructor', () => {
        test('should initialize with game engine reference', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            expect(handler.gameEngine).toBe(mockEngine);
        });

        test('should initialize empty listener arrays', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            expect(handler.keyListeners).toEqual([]);
            expect(handler.touchListeners).toEqual([]);
        });
    });

    describe('init method', () => {
        test('should add keyboard event listener', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            handler.init();
            
            expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should add touch event listener', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            handler.init();
            
            expect(document.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
        });

        test('should store listener references', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            handler.init();
            
            expect(handler.keyListeners.length).toBe(1);
            expect(handler.touchListeners.length).toBe(1);
        });
    });

    describe('spacebar input', () => {
        test('should trigger jump when spacebar pressed during playing state', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            // Simulate spacebar press
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).toHaveBeenCalled();
        });

        test('should handle Space key code', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).toHaveBeenCalled();
        });

        test('should handle space character key', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ key: ' ', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).toHaveBeenCalled();
        });

        test('should prevent default spacebar behavior', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const preventDefault = jest.fn();
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault });
            
            expect(preventDefault).toHaveBeenCalled();
        });

        test('should ignore non-spacebar keys', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'KeyA', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).not.toHaveBeenCalled();
        });
    });

    describe('touch input', () => {
        test('should trigger jump when screen tapped during playing state', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            // Simulate touch
            const touchHandler = eventListeners['touchstart'][0];
            touchHandler({ preventDefault: jest.fn() });
            
            expect(mockKiro.jump).toHaveBeenCalled();
        });

        test('should prevent default touch behavior', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const preventDefault = jest.fn();
            const touchHandler = eventListeners['touchstart'][0];
            touchHandler({ preventDefault });
            
            expect(preventDefault).toHaveBeenCalled();
        });
    });

    describe('state-based input handling', () => {
        test('should start game when input received in start state', () => {
            const mockEngine = { 
                state: 'start',
                start: jest.fn()
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockEngine.start).toHaveBeenCalled();
        });

        test('should restart game when input received in gameover state', () => {
            const mockEngine = { 
                state: 'gameover',
                restart: jest.fn()
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockEngine.restart).toHaveBeenCalled();
        });

        test('should not trigger jump in start state', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'start',
                kiro: mockKiro,
                start: jest.fn()
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).not.toHaveBeenCalled();
        });

        test('should not trigger jump in gameover state', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'gameover',
                kiro: mockKiro,
                restart: jest.fn()
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).not.toHaveBeenCalled();
        });

        test('should handle missing kiro in playing state gracefully', () => {
            const mockEngine = { 
                state: 'playing',
                kiro: null
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            
            // Should not throw error
            expect(() => {
                keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            }).not.toThrow();
        });
    });

    describe('destroy method', () => {
        test('should remove keyboard event listeners', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            handler.destroy();
            
            expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should remove touch event listeners', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            handler.destroy();
            
            expect(document.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
        });

        test('should clear listener arrays', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            handler.destroy();
            
            expect(handler.keyListeners).toEqual([]);
            expect(handler.touchListeners).toEqual([]);
        });

        test('should handle destroy without init', () => {
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            // Should not throw error
            expect(() => {
                handler.destroy();
            }).not.toThrow();
        });
    });

    describe('multiple inputs', () => {
        test('should handle rapid spacebar presses', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            
            // Rapid presses
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            
            expect(mockKiro.jump).toHaveBeenCalledTimes(3);
        });

        test('should handle both keyboard and touch inputs', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            const touchHandler = eventListeners['touchstart'][0];
            
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            touchHandler({ preventDefault: jest.fn() });
            
            expect(mockKiro.jump).toHaveBeenCalledTimes(2);
        });
    });

    describe('edge cases', () => {
        test('should handle undefined document gracefully', () => {
            delete global.document;
            
            const mockEngine = { state: 'start' };
            const handler = new InputHandler(mockEngine);
            
            // Should not throw error
            expect(() => {
                handler.init();
            }).not.toThrow();
        });

        test('should handle state transitions during input', () => {
            const mockKiro = { jump: jest.fn() };
            const mockEngine = { 
                state: 'playing',
                kiro: mockKiro
            };
            const handler = new InputHandler(mockEngine);
            handler.init();
            
            const keydownHandler = eventListeners['keydown'][0];
            
            // First input in playing state
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            expect(mockKiro.jump).toHaveBeenCalledTimes(1);
            
            // Change state to gameover
            mockEngine.state = 'gameover';
            mockEngine.restart = jest.fn();
            
            // Second input in gameover state
            keydownHandler({ code: 'Space', preventDefault: jest.fn() });
            expect(mockEngine.restart).toHaveBeenCalled();
            expect(mockKiro.jump).toHaveBeenCalledTimes(1); // Not called again
        });
    });
});
