// Simple test for CollisionSystem
const { Entity, Kiro, Pelican, CollisionSystem } = require('./game.js');

console.log('Testing CollisionSystem...\n');

// Create collision system
const collisionSystem = new CollisionSystem();

// Test 1: AABB collision detection - overlapping entities
console.log('Test 1: Overlapping entities should collide');
const kiro1 = new Kiro(100, 100);
const pelican1 = new Pelican(110, 110); // Overlaps with Kiro
const result1 = collisionSystem.checkCollision(kiro1, pelican1);
console.log(`  Kiro at (100, 100, 40x40), Pelican at (110, 110, 60x40)`);
console.log(`  Result: ${result1} (expected: true)`);
console.log(`  ${result1 === true ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 2: AABB collision detection - non-overlapping entities
console.log('Test 2: Non-overlapping entities should not collide');
const kiro2 = new Kiro(100, 100);
const pelican2 = new Pelican(200, 200); // Does not overlap with Kiro
const result2 = collisionSystem.checkCollision(kiro2, pelican2);
console.log(`  Kiro at (100, 100, 40x40), Pelican at (200, 200, 60x40)`);
console.log(`  Result: ${result2} (expected: false)`);
console.log(`  ${result2 === false ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 3: Ocean collision detection - Kiro touching ocean
console.log('Test 3: Kiro touching ocean surface should collide');
const kiro3 = new Kiro(100, 400);
const oceanY = 420; // Ocean at y=420, Kiro bottom at 440 (400 + 40)
const result3 = collisionSystem.checkOceanCollision(kiro3, oceanY);
console.log(`  Kiro at (100, 400, 40x40), Ocean at y=${oceanY}`);
console.log(`  Kiro bottom: ${kiro3.y + kiro3.height}`);
console.log(`  Result: ${result3} (expected: true)`);
console.log(`  ${result3 === true ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 4: Ocean collision detection - Kiro above ocean
console.log('Test 4: Kiro above ocean should not collide');
const kiro4 = new Kiro(100, 300);
const oceanY2 = 420; // Ocean at y=420, Kiro bottom at 340 (300 + 40)
const result4 = collisionSystem.checkOceanCollision(kiro4, oceanY2);
console.log(`  Kiro at (100, 300, 40x40), Ocean at y=${oceanY2}`);
console.log(`  Kiro bottom: ${kiro4.y + kiro4.height}`);
console.log(`  Result: ${result4} (expected: false)`);
console.log(`  ${result4 === false ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 5: checkAllCollisions - multiple collisions
console.log('Test 5: checkAllCollisions with multiple enemies and ocean');
const kiro5 = new Kiro(100, 400);
const pelican5a = new Pelican(110, 410); // Overlaps with Kiro
const pelican5b = new Pelican(300, 300); // Does not overlap
const enemies = [pelican5a, pelican5b];
const oceanY3 = 420; // Kiro touches ocean
const result5 = collisionSystem.checkAllCollisions(kiro5, enemies, oceanY3);
console.log(`  Kiro at (100, 400), 2 enemies, Ocean at y=${oceanY3}`);
console.log(`  Collisions found: ${result5.length} (expected: 2 - one enemy + ocean)`);
console.log(`  Collision types: ${result5.map(c => c === 'ocean' ? 'ocean' : c.constructor.name).join(', ')}`);
console.log(`  ${result5.length === 2 ? '✓ PASS' : '✗ FAIL'}\n`);

// Test 6: Edge case - entities barely touching
console.log('Test 6: Entities barely touching at edge');
const kiro6 = new Kiro(100, 100); // Right edge at 140
const pelican6 = new Pelican(140, 100); // Left edge at 140
const result6 = collisionSystem.checkCollision(kiro6, pelican6);
console.log(`  Kiro right edge: ${kiro6.x + kiro6.width}, Pelican left edge: ${pelican6.x}`);
console.log(`  Result: ${result6} (expected: false - edges touching but not overlapping)`);
console.log(`  ${result6 === false ? '✓ PASS' : '✗ FAIL'}\n`);

console.log('All tests completed!');
