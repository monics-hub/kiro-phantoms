// Test setup file
// Load game.js classes into global scope for testing

const fs = require('fs');
const path = require('path');

// Read and evaluate game.js to make classes available
const gameCode = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');

// Extract only the Entity class definition for testing
const entityClassMatch = gameCode.match(/class Entity[\s\S]*?^}/m);
if (entityClassMatch) {
  eval(entityClassMatch[0]);
  global.Entity = Entity;
}
