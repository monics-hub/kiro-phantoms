module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'game.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ]
};
