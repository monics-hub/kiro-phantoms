// Test for life tracking in GameEngine (Task 10.1)
const { GameEngine, Kiro, Pelican, Shark } = require('./game.js');

console.log('Testing Life Tracking (Task 10.1)...\n');

// Create a mock canvas for testing
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => null
};

// Test 1: Lives initialized to 5 at game start
console.log('Test 1: Lives initialized to 5 at game start');
const game1 = new GameEngine('gameCanvas');
game1.canvas = mockCanvas;
game1.ctx = null;
game1.init();
console.log(`  Initial lives: ${game1.lives} (expected: 5)`);
console.log(`  ${game1.lives === 5 ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 2: Lives decrease by 1 on enemy collision
console.log('Test 2: Lives decrease by 1 on enemy collision');
const game2 = new GameEngine('gameCanvas');
game2.canvas = mockCanvas;
game2.ctx = null;
game2.init();
game2.state = 'playing';
game2.kiro = new Kiro(100, 100);
const pelican = new Pelican(110, 110); // Overlaps with Kiro
game2.entities.push(pelican);

const livesBefore = game2.lives;
game2.update(0.016); // Simulate one frame
const livesAfter = game2.lives;

console.log(`  Lives before collision: ${livesBefore}`);
console.log(`  Lives after collision: ${livesAfter}`);
console.log(`  Lives decreased by: ${livesBefore - livesAfter} (expected: 1)`);
console.log(`  ${livesBefore - livesAfter === 1 ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 3: Lives decrease by 1 on ocean collision
console.log('Test 3: Lives decrease by 1 on ocean collision');
const game3 = new GameEngine('gameCanvas');
game3.canvas = mockCanvas;
game3.ctx = null;
game3.init();
game3.state = 'playing';
const oceanY = mockCanvas.height * 0.8; // 480
game3.kiro = new Kiro(100, oceanY - 10); // Kiro bottom at 470, will touch ocean at 480

const livesBefore3 = game3.lives;
game3.update(0.016); // Simulate one frame
const livesAfter3 = game3.lives;

console.log(`  Ocean Y: ${oceanY}`);
console.log(`  Kiro bottom: ${game3.kiro.y + game3.kiro.height}`);
console.log(`  Lives before collision: ${livesBefore3}`);
console.log(`  Lives after collision: ${livesAfter3}`);
console.log(`  Lives decreased by: ${livesBefore3 - livesAfter3} (expected: 1)`);
console.log(`  ${livesBefore3 - livesAfter3 === 1 ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 4: Colliding enemies are removed from entity list
console.log('Test 4: Colliding enemies are removed from entity list');
const game4 = new GameEngine('gameCanvas');
game4.canvas = mockCanvas;
game4.ctx = null;
game4.init();
game4.state = 'playing';
game4.kiro = new Kiro(100, 100);
const pelican4a = new Pelican(110, 110); // Overlaps with Kiro
const pelican4b = new Pelican(300, 300); // Does not overlap
game4.entities.push(pelican4a, pelican4b);

const entitiesBefore = game4.entities.length;
game4.update(0.016); // Simulate one frame
const entitiesAfter = game4.entities.length;

console.log(`  Entities before collision: ${entitiesBefore} (expected: 2)`);
console.log(`  Entities after collision: ${entitiesAfter} (expected: 1)`);
console.log(`  Colliding enemy removed: ${entitiesBefore - entitiesAfter === 1}`);
console.log(`  Remaining entity is non-colliding pelican: ${game4.entities[0] === pelican4b}`);
console.log(`  ${entitiesBefore === 2 && entitiesAfter === 1 && game4.entities[0] === pelican4b ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 5: Multiple collisions in one frame (should decrease lives by 1 total)
console.log('Test 5: Multiple collisions in one frame');
const game5 = new GameEngine('gameCanvas');
game5.canvas = mockCanvas;
game5.ctx = null;
game5.init();
game5.state = 'playing';
game5.kiro = new Kiro(100, 100);
const pelican5a = new Pelican(110, 110); // Overlaps with Kiro
const pelican5b = new Pelican(105, 105); // Also overlaps with Kiro
game5.entities.push(pelican5a, pelican5b);

const livesBefore5 = game5.lives;
game5.update(0.016); // Simulate one frame
const livesAfter5 = game5.lives;

console.log(`  Lives before collisions: ${livesBefore5}`);
console.log(`  Lives after collisions: ${livesAfter5}`);
console.log(`  Lives decreased by: ${livesBefore5 - livesAfter5} (expected: 1)`);
console.log(`  Both enemies removed: ${game5.entities.length === 0}`);
console.log(`  ${livesBefore5 - livesAfter5 === 1 && game5.entities.length === 0 ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 6: Shark collision also decreases lives and removes shark
console.log('Test 6: Shark collision decreases lives and removes shark');
const game6 = new GameEngine('gameCanvas');
game6.canvas = mockCanvas;
game6.ctx = null;
game6.init();
game6.state = 'playing';
game6.kiro = new Kiro(100, 100);
const shark = new Shark(110, 480); // Overlaps with Kiro
game6.entities.push(shark);

const livesBefore6 = game6.lives;
game6.update(0.016); // Simulate one frame
const livesAfter6 = game6.lives;

console.log(`  Lives before collision: ${livesBefore6}`);
console.log(`  Lives after collision: ${livesAfter6}`);
console.log(`  Lives decreased by: ${livesBefore6 - livesAfter6} (expected: 1)`);
console.log(`  Shark removed: ${game6.entities.length === 0}`);
console.log(`  ${livesBefore6 - livesAfter6 === 1 && game6.entities.length === 0 ? '✓ PASS' : '✗ FAIL'}\n`);

console.log('All life tracking tests completed!');
