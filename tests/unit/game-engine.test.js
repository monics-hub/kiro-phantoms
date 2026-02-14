// Unit tests for GameEngine class
// Feature: kiro-phantoms
// Tests game loop, state management, and delta time calculation

const { GameEngine, Entity } = require('../../game.js');

// Mock DOM elements
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: jest.fn(() => mockCtx)
};

const mockCtx = {
    fillStyle: '',
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    font: '',
    textAlign: '',
    fillText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn()
};

// Mock document.getElementById
global.document = {
    getElementById: jest.fn((id) => {
        if (id === 'gameCanvas') {
            return mockCanvas;
        }
        return null;
    })
};

// Mock window
global.window = {
    innerWidth: 800,
    innerHeight: 600,
    addEventListener: jest.fn()
};

// Mock performance.now
global.performance = {
    now: jest.fn(() => 0)
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
    return 1; // Return a mock frame ID
});

global.cancelAnimationFrame = jest.fn();

describe('GameEngine Class', () => {
    let game;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        mockCtx.fillRect.mockClear();
        mockCtx.fillText.mockClear();
        
        // Create new game instance
        game = new GameEngine('gameCanvas');
    });

    describe('Constructor', () => {
        test('should initialize with start state', () => {
            expect(game.state).toBe('start');
        });

        test('should initialize with 5 lives', () => {
            expect(game.lives).toBe(5);
        });

        test('should initialize empty entities array', () => {
            expect(game.entities).toEqual([]);
        });

        test('should initialize kiro as null', () => {
            expect(game.kiro).toBeNull();
        });

        test('should initialize lastTimestamp to 0', () => {
            expect(game.lastTimestamp).toBe(0);
        });

        test('should get canvas element by ID', () => {
            expect(document.getElementById).toHaveBeenCalledWith('gameCanvas');
        });

        test('should get 2D context from canvas', () => {
            expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
        });
    });

    describe('init method', () => {
        test('should reset state to start', () => {
            game.state = 'playing';
            game.init();
            expect(game.state).toBe('start');
        });

        test('should reset lives to 5', () => {
            game.lives = 2;
            game.init();
            expect(game.lives).toBe(5);
        });

        test('should clear entities array', () => {
            game.entities = [new Entity(0, 0, 10, 10)];
            game.init();
            expect(game.entities).toEqual([]);
        });

        test('should reset lastTimestamp to 0', () => {
            game.lastTimestamp = 1000;
            game.init();
            expect(game.lastTimestamp).toBe(0);
        });

        test('should set canvas size to window dimensions', () => {
            game.init();
            expect(game.canvas.width).toBe(800);
            expect(game.canvas.height).toBe(600);
        });

        test('should add resize event listener', () => {
            game.init();
            expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        });
    });

    describe('start method', () => {
        test('should change state to playing', () => {
            game.init();
            game.start();
            expect(game.state).toBe('playing');
        });

        test('should set lastTimestamp to current time', () => {
            performance.now.mockReturnValue(1234.5);
            game.init();
            game.start();
            expect(game.lastTimestamp).toBe(1234.5);
        });

        test('should call gameLoop', () => {
            performance.now.mockReturnValue(1000);
            game.init();
            game.start();
            expect(requestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('gameLoop method', () => {
        test('should calculate delta time correctly', () => {
            game.lastTimestamp = 1000;
            const updateSpy = jest.spyOn(game, 'update');
            
            game.gameLoop(1016.67); // ~16.67ms later (60 FPS)
            
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.01667, 4));
        });

        test('should update lastTimestamp', () => {
            game.lastTimestamp = 1000;
            game.gameLoop(1100);
            expect(game.lastTimestamp).toBe(1100);
        });

        test('should call update and render', () => {
            const updateSpy = jest.spyOn(game, 'update');
            const renderSpy = jest.spyOn(game, 'render');
            
            game.state = 'playing';
            game.gameLoop(1000);
            
            expect(updateSpy).toHaveBeenCalled();
            expect(renderSpy).toHaveBeenCalled();
        });

        test('should request next frame if playing', () => {
            game.state = 'playing';
            game.gameLoop(1000);
            expect(requestAnimationFrame).toHaveBeenCalled();
        });

        test('should not request next frame if not playing', () => {
            game.state = 'gameover';
            game.gameLoop(1000);
            expect(requestAnimationFrame).not.toHaveBeenCalled();
        });
    });

    describe('update method', () => {
        test('should not update entities when not playing', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 100;
            game.entities = [entity];
            game.state = 'start';
            
            game.update(1);
            
            expect(entity.x).toBe(0);
        });

        test('should update all active entities', () => {
            const entity1 = new Entity(0, 0, 10, 10);
            const entity2 = new Entity(0, 0, 10, 10);
            entity1.velocityX = 100;
            entity2.velocityX = 50;
            game.entities = [entity1, entity2];
            game.state = 'playing';
            
            game.update(1);
            
            expect(entity1.x).toBe(100);
            expect(entity2.x).toBe(50);
        });

        test('should not update inactive entities', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 100;
            entity.active = false;
            game.entities = [entity];
            game.state = 'playing';
            
            game.update(1);
            
            expect(entity.x).toBe(0);
        });

        test('should update kiro if exists', () => {
            const kiro = new Entity(0, 0, 10, 10);
            kiro.velocityX = 100;
            game.kiro = kiro;
            game.state = 'playing';
            
            game.update(1);
            
            expect(kiro.x).toBe(100);
        });

        test('should remove inactive entities from array', () => {
            const entity1 = new Entity(0, 0, 10, 10);
            const entity2 = new Entity(0, 0, 10, 10);
            entity1.active = false;
            entity2.active = true;
            game.entities = [entity1, entity2];
            game.state = 'playing';
            
            game.update(0.1);
            
            expect(game.entities).toHaveLength(1);
            expect(game.entities[0]).toBe(entity2);
        });
    });

    describe('render method', () => {
        test('should clear canvas with sky blue', () => {
            game.render();
            expect(mockCtx.fillStyle).toBe('#87CEEB');
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
        });

        test('should render start screen when in start state', () => {
            game.state = 'start';
            game.render();
            expect(mockCtx.fillText).toHaveBeenCalledWith('Kiro Phantoms', 400, 250);
        });

        test('should render game over screen when in gameover state', () => {
            game.state = 'gameover';
            game.render();
            expect(mockCtx.fillText).toHaveBeenCalledWith('Game Over', 400, 250);
        });

        test('should render lives when playing', () => {
            game.state = 'playing';
            game.lives = 3;
            game.render();
            expect(mockCtx.fillText).toHaveBeenCalledWith('Lives: 3', 20, 40);
        });
    });

    describe('gameOver method', () => {
        test('should change state to gameover', () => {
            game.state = 'playing';
            game.gameOver();
            expect(game.state).toBe('gameover');
        });

        test('should cancel animation frame', () => {
            game.animationFrameId = 123;
            game.gameOver();
            expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
        });

        test('should set animationFrameId to null', () => {
            game.animationFrameId = 123;
            game.gameOver();
            expect(game.animationFrameId).toBeNull();
        });
    });

    describe('restart method', () => {
        test('should call init', () => {
            const initSpy = jest.spyOn(game, 'init');
            game.restart();
            expect(initSpy).toHaveBeenCalled();
        });

        test('should call start', () => {
            const startSpy = jest.spyOn(game, 'start');
            game.restart();
            expect(startSpy).toHaveBeenCalled();
        });

        test('should reset game state', () => {
            game.state = 'gameover';
            game.lives = 0;
            game.entities = [new Entity(0, 0, 10, 10)];
            
            game.restart();
            
            expect(game.state).toBe('playing');
            expect(game.lives).toBe(5);
            expect(game.entities).toEqual([]);
        });
    });

    describe('Delta time calculation', () => {
        test('should handle first frame with zero delta time', () => {
            game.lastTimestamp = 0;
            const updateSpy = jest.spyOn(game, 'update');
            
            game.gameLoop(0);
            
            expect(updateSpy).toHaveBeenCalledWith(0);
        });

        test('should calculate correct delta for 60 FPS', () => {
            game.lastTimestamp = 0;
            const updateSpy = jest.spyOn(game, 'update');
            
            game.gameLoop(16.67); // 60 FPS frame time
            
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.01667, 4));
        });

        test('should calculate correct delta for 30 FPS', () => {
            game.lastTimestamp = 0;
            const updateSpy = jest.spyOn(game, 'update');
            
            game.gameLoop(33.33); // 30 FPS frame time
            
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.03333, 4));
        });

        test('should handle variable frame times', () => {
            const updateSpy = jest.spyOn(game, 'update');
            
            game.lastTimestamp = 1000;
            game.gameLoop(1020); // 20ms
            expect(updateSpy).toHaveBeenCalledWith(0.02);
            
            game.gameLoop(1050); // 30ms
            expect(updateSpy).toHaveBeenCalledWith(0.03);
            
            game.gameLoop(1066.67); // 16.67ms
            expect(updateSpy).toHaveBeenCalledWith(expect.closeTo(0.01667, 4));
        });
    });

    describe('State management', () => {
        test('should start in start state', () => {
            expect(game.state).toBe('start');
        });

        test('should transition from start to playing', () => {
            game.state = 'start';
            game.start();
            expect(game.state).toBe('playing');
        });

        test('should transition from playing to gameover', () => {
            game.state = 'playing';
            game.gameOver();
            expect(game.state).toBe('gameover');
        });

        test('should transition from gameover to playing on restart', () => {
            game.state = 'gameover';
            game.restart();
            expect(game.state).toBe('playing');
        });
    });

    describe('Edge cases', () => {
        test('should handle null canvas gracefully', () => {
            document.getElementById.mockReturnValue(null);
            const nullGame = new GameEngine('nonexistent');
            
            expect(() => nullGame.init()).not.toThrow();
            expect(() => nullGame.render()).not.toThrow();
        });

        test('should handle very large delta times', () => {
            const entity = new Entity(0, 0, 10, 10);
            entity.velocityX = 100;
            game.entities = [entity];
            game.state = 'playing';
            
            game.update(10); // 10 seconds
            
            expect(entity.x).toBe(1000);
        });

        test('should handle multiple entities of different types', () => {
            const entities = [];
            for (let i = 0; i < 10; i++) {
                const entity = new Entity(i * 10, 0, 10, 10);
                entity.velocityX = 50;
                entities.push(entity);
            }
            game.entities = entities;
            game.state = 'playing';
            
            game.update(1);
            
            entities.forEach((entity, i) => {
                expect(entity.x).toBe(i * 10 + 50);
            });
        });
    });
});
