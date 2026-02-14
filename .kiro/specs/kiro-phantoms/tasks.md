# Implementation Plan: Kiro Phantoms

## Overview

This implementation plan breaks down the Kiro Phantoms game into incremental coding steps. The game will be built using vanilla JavaScript, HTML5 Canvas, and CSS with no external dependencies. Each task builds on previous work, starting with core infrastructure and progressively adding game mechanics, collision detection, and polish.

## Tasks

- [x] 1. Set up project structure and HTML/CSS foundation
  - Create `index.html` with canvas element and basic page structure
  - Create `styles.css` with responsive canvas styling and pixel art aesthetic
  - Set up canvas to fill viewport in horizontal orientation
  - _Requirements: 6.1, 6.2, 7.1, 7.4, 9.1_

- [ ] 2. Implement core game engine and entity system
  - [x] 2.1 Create Entity base class with position, velocity, and bounding box methods
    - Implement constructor, update, render, and getBounds methods
    - _Requirements: 5.1_
  
  - [x] 2.2 Create GameEngine class with game loop
    - Implement initialization, game loop using requestAnimationFrame
    - Set up game state management (start, playing, gameover)
    - Implement delta time calculation for frame-independent movement
    - _Requirements: 8.1, 8.2, 8.3, 9.2, 9.5_
  
  - [ ]* 2.3 Write property test for delta time scaling
    - **Property 25: Movement Scales With Delta Time**
    - **Validates: Requirements 9.5**

- [ ] 3. Implement Kiro player character
  - [x] 3.1 Create Kiro class extending Entity
    - Implement jump method with upward velocity
    - Implement gravity application in update method
    - Add top boundary clamping (no bottom boundary - ocean is hazard)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 3.2 Write property tests for Kiro physics
    - **Property 1: Jump Input Triggers Upward Velocity**
    - **Property 2: Gravity Increases Downward Velocity**
    - **Property 3: Boundary Clamping Prevents Out-of-Bounds**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  
  - [ ]* 3.3 Write unit tests for Kiro edge cases
    - Test Kiro at exact top boundary
    - Test jump at maximum upward velocity
    - _Requirements: 1.5_

- [ ] 4. Implement input handling
  - [x] 4.1 Create InputHandler class
    - Add keyboard event listener for spacebar
    - Add touch event listener for mobile
    - Wire input events to Kiro's jump method
    - _Requirements: 1.1, 1.2, 7.2, 7.3_
  
  - [ ]* 4.2 Write unit tests for input handling
    - Test spacebar triggers jump
    - Test touch triggers jump
    - Test input during game over is ignored
    - _Requirements: 1.1, 1.2, 2.6_

- [ ] 5. Implement rendering system
  - [x] 5.1 Create Renderer class with canvas drawing methods
    - Implement drawBackground (sky with clouds)
    - Implement drawOcean (bottom 20% of canvas)
    - Implement drawEntity for sprite rendering
    - Render Kiro as white phantom sprite
    - _Requirements: 6.1, 6.2, 6.3, 6.7_
  
  - [x] 5.2 Add heart display for lives
    - Implement drawHearts method
    - Position hearts in top-left corner
    - _Requirements: 2.2, 6.6_
  
  - [ ]* 5.3 Write property test for lives display
    - **Property 5: Lives Display Matches Life Count**
    - **Validates: Requirements 2.2, 6.6**

- [x] 6. Checkpoint - Ensure basic game runs
  - Verify Kiro can jump and fall with gravity
  - Verify rendering works (sky, ocean, Kiro, hearts)
  - Verify input works on both desktop and mobile
  - Ask the user if questions arise

- [ ] 7. Implement enemy entities
  - [x] 7.1 Create Pelican class extending Entity
    - Implement constant horizontal movement (right to left)
    - Add animation frame counter for flying motion
    - Render pelican with orange beak in pixel art style
    - _Requirements: 3.2, 3.3, 3.5, 6.4_
  
  - [x] 7.2 Create Shark class extending Entity
    - Implement parabolic trajectory with initial upward velocity
    - Apply gravity for arc motion
    - Add animation frame counter
    - Render shark with open mouth in pixel art style
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 6.5_
  
  - [ ]* 7.3 Write property tests for enemy behavior
    - **Property 10: Pelican Velocity Remains Constant**
    - **Property 13: Shark Trajectory Is Parabolic**
    - **Property 14: Entity Animations Update Over Time**
    - **Validates: Requirements 3.3, 4.3, 3.5, 4.6**

- [ ] 8. Implement enemy spawning system
  - [x] 8.1 Create EnemySpawner class
    - Implement spawn timers for pelicans (2-4s intervals)
    - Implement spawn timers for sharks (4-8s intervals)
    - Spawn pelicans at right edge with random Y position in sky
    - Spawn sharks at ocean surface with random X position
    - Enforce maximum counts (2 pelicans, 1 shark simultaneously)
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 8.2 Implement off-screen enemy cleanup
    - Remove pelicans that move past left edge
    - Remove sharks that return to ocean surface
    - _Requirements: 3.4, 4.5_
  
  - [ ]* 8.3 Write property tests for spawning
    - **Property 8: Enemies Spawn Over Time**
    - **Property 9: Pelicans Spawn at Right Edge**
    - **Property 12: Sharks Spawn at Ocean Surface**
    - **Property 11: Off-Screen Entities Are Removed**
    - **Property 27: Spawn Intervals Within Range**
    - **Property 28: Maximum Simultaneous Enemy Counts Enforced**
    - **Validates: Requirements 3.1, 3.2, 4.1, 4.2, 3.4, 4.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

- [ ] 9. Implement collision detection system
  - [x] 9.1 Create CollisionSystem class
    - Implement AABB collision detection between Kiro and enemies
    - Implement ocean surface collision detection for Kiro
    - Return list of colliding entities
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 9.2 Write property test for collision detection
    - **Property 15: AABB Collision Detection**
    - **Property 18: Ocean Contact Decreases Lives**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 2.4, 5.7**
  
  - [ ]* 9.3 Write unit tests for collision edge cases
    - Test collision at entity edges (barely touching)
    - Test no collision when entities are adjacent but not overlapping
    - Test ocean collision at exact surface level
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Implement life system and game over logic
  - [x] 10.1 Add life tracking to GameEngine
    - Initialize lives to 5 at game start
    - Decrease lives by 1 on enemy collision
    - Decrease lives by 1 on ocean collision
    - Remove colliding enemies from entity list
    - _Requirements: 2.1, 2.3, 2.4, 5.6, 5.7, 5.9_
  
  - [x] 10.2 Implement game over state
    - Transition to game over when lives reach 0
    - Prevent gameplay updates in game over state
    - Display game over message
    - _Requirements: 2.5, 2.6, 8.4, 8.5_
  
  - [ ]* 10.3 Write property tests for life system
    - **Property 4: Collision Decreases Lives**
    - **Property 6: Zero Lives Triggers Game Over**
    - **Property 7: Game Over Prevents Gameplay Updates**
    - **Property 17: Colliding Enemies Are Removed**
    - **Validates: Requirements 2.3, 2.4, 5.6, 5.7, 2.5, 8.4, 5.9**
  
  - [ ]* 10.4 Write unit tests for life system edge cases
    - Test multiple simultaneous collisions
    - Test lives don't go negative
    - Test game over at exactly 0 lives
    - _Requirements: 2.3, 2.4, 2.5_

- [ ] 11. Add visual feedback and polish
  - [x] 11.1 Implement collision visual feedback
    - Add flash or color change on collision
    - Add brief invincibility frames to prevent double-hits
    - _Requirements: 5.8_
  
  - [x] 11.2 Add start screen
    - Display title and "Press Space or Tap to Start" message
    - Transition to playing state on input
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.3 Add restart functionality
    - Add restart button/prompt on game over screen
    - Reset game state (lives, entities, timers) on restart
    - _Requirements: 8.6_
  
  - [ ]* 11.4 Write property tests for state transitions
    - **Property 22: Start Screen Transitions to Playing**
    - **Property 23: Playing State Executes Game Loop**
    - **Property 24: Game Over Provides Restart Option**
    - **Property 16: Collision Triggers Visual Feedback**
    - **Validates: Requirements 8.2, 8.3, 8.6, 5.8**

- [ ] 12. Implement responsive design and window handling
  - [x] 12.1 Add window resize handling
    - Scale canvas on window resize
    - Maintain aspect ratio
    - Scale entity positions and sizes proportionally
    - _Requirements: 7.4, 7.5, 9.6_
  
  - [ ]* 12.2 Write property tests for responsive behavior
    - **Property 19: Canvas Maintains Horizontal Orientation**
    - **Property 20: Canvas Scales Proportionally**
    - **Property 21: Entities Scale With Canvas**
    - **Property 26: Resize Events Don't Break Game**
    - **Validates: Requirements 7.1, 7.4, 7.5, 9.6**

- [ ] 13. Performance optimization and frame rate testing
  - [x] 13.1 Optimize rendering and update loops
    - Ensure consistent frame timing
    - Add frame rate monitoring (development only)
    - _Requirements: 6.8, 9.5_
  
  - [ ]* 13.2 Write property test for frame rate
    - **Property 19: Frame Rate Meets Minimum Threshold**
    - **Validates: Requirements 6.8**

- [x] 14. Final checkpoint - Complete testing and polish
  - Run all property-based tests (minimum 100 iterations each)
  - Run all unit tests
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on mobile devices (iOS and Android)
  - Verify all requirements are met
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each property test should run minimum 100 iterations
- Use fast-check or jsverify for property-based testing
- All property tests must include comment tags: `// Feature: kiro-phantoms, Property N: [property text]`
- The game uses vanilla JavaScript with no external dependencies (except testing libraries)
- Focus on pixel art aesthetic throughout visual implementation
- Ocean is a hazard - touching it decreases lives (no bottom boundary clamping)
- Maximum 2 pelicans and 1 shark can be active simultaneously
