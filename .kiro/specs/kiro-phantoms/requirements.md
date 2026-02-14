# Requirements Document: Kiro Phantoms

## Introduction

Kiro Phantoms is a browser-based arcade game inspired by Flappy Bird mechanics. The player controls Kiro, a phantom character, who must navigate through a dangerous environment (kiro will fly in the sky above the ocean) while avoiding flying pelicans and jumping sharks. The game features a life system where players start with 5 lives and lose one life per collision. The game is built using pure vanilla JavaScript, HTML, and CSS without any frameworks or build tools, making it easily deployable and playable in any modern web browser.

## Glossary

- **Kiro**: The player-controlled phantom character
- **Game_Engine**: The core system managing game state, rendering, and updates
- **Collision_System**: The subsystem responsible for detecting sprite overlaps
- **Input_Handler**: The subsystem managing keyboard and touch inputs
- **Enemy_Spawner**: The subsystem responsible for creating and managing enemy entities
- **Pelican**: A horizontally-flying enemy that moves across the screen
- **Shark**: An enemy that jumps from the ocean in parabolic arcs
- **Life**: A unit of health; player starts with 5 lives
- **Sprite**: A 2D graphical element representing a game entity
- **Hit_Detection**: The process of determining if two sprites overlap
- **Game_Over_State**: The state when player lives reach zero
- **Canvas**: The HTML5 canvas element used for rendering
- **Frame**: A single update cycle of the game loop

## Requirements

### Requirement 1: Player Character Control

**User Story:** As a player, I want to control Kiro's jumping, so that I can navigate through the game environment.

#### Acceptance Criteria

1. WHEN the player presses the spacebar on desktop, THE Game_Engine SHALL make Kiro jump upward
2. WHEN the player taps the screen on mobile, THE Game_Engine SHALL make Kiro jump upward
3. WHEN Kiro jumps, THE Game_Engine SHALL apply an upward velocity to Kiro
4. WHILE Kiro is airborne, THE Game_Engine SHALL apply gravity to pull Kiro downward
5. WHEN Kiro reaches the top boundary of the play area, THE Game_Engine SHALL prevent Kiro from moving beyond it

### Requirement 2: Life System

**User Story:** As a player, I want to see my remaining lives, so that I know how close I am to game over.

#### Acceptance Criteria

1. WHEN the game starts, THE Game_Engine SHALL initialize Kiro with 5 lives
2. THE Game_Engine SHALL display the current number of lives as heart icons on the screen
3. WHEN Kiro collides with an enemy, THE Game_Engine SHALL decrease lives by 1
4. WHEN Kiro touches the ocean surface, THE Game_Engine SHALL decrease lives by 1
5. WHEN lives reach 0, THE Game_Engine SHALL transition to the Game_Over_State
6. WHILE in Game_Over_State, THE Game_Engine SHALL prevent further gameplay

### Requirement 3: Pelican Enemy Behavior

**User Story:** As a player, I want pelicans to fly across the screen, so that I have obstacles to avoid.

#### Acceptance Criteria

1. THE Enemy_Spawner SHALL create pelican enemies at random intervals
2. WHEN a pelican spawns, THE Enemy_Spawner SHALL position it at the right edge of the screen at a random vertical position
3. WHILE a pelican is active, THE Game_Engine SHALL move it horizontally from right to left at constant speed
4. WHEN a pelican moves beyond the left edge of the screen, THE Game_Engine SHALL remove it from the game
5. THE Game_Engine SHALL animate the pelican sprite to show flying motion

### Requirement 4: Shark Enemy Behavior

**User Story:** As a player, I want sharks to jump from the ocean, so that I face varied threats.

#### Acceptance Criteria

1. THE Enemy_Spawner SHALL create shark enemies at random intervals
2. WHEN a shark spawns, THE Enemy_Spawner SHALL position it at the ocean surface at a random horizontal position
3. WHEN a shark becomes active, THE Game_Engine SHALL move it along a parabolic trajectory upward and forward
4. WHILE a shark is jumping, THE Game_Engine SHALL apply gravity to create the parabolic arc
5. WHEN a shark returns to the ocean surface, THE Game_Engine SHALL remove it from the game
6. THE Game_Engine SHALL animate the shark sprite during its jump

### Requirement 5: Collision Detection

**User Story:** As a player, I want the game to detect when I hit enemies or hazards, so that the game responds to my mistakes.

#### Acceptance Criteria

1. THE Collision_System SHALL check for overlaps between Kiro's sprite and enemy sprites every frame
2. THE Collision_System SHALL check for overlaps between Kiro's sprite and the ocean surface every frame
3. WHEN Kiro's sprite overlaps with a pelican sprite, THE Collision_System SHALL register a collision
4. WHEN Kiro's sprite overlaps with a shark sprite, THE Collision_System SHALL register a collision
5. WHEN Kiro's sprite touches the ocean surface, THE Collision_System SHALL register a collision
6. WHEN a collision with an enemy is registered, THE Game_Engine SHALL decrease Kiro's lives by 1
7. WHEN a collision with the ocean is registered, THE Game_Engine SHALL decrease Kiro's lives by 1
8. WHEN a collision is registered, THE Game_Engine SHALL provide visual feedback to the player
9. WHEN a collision with an enemy is registered, THE Game_Engine SHALL remove the enemy that caused the collision

### Requirement 6: Visual Rendering

**User Story:** As a player, I want to see a visually appealing game environment, so that the game is enjoyable to play.

#### Acceptance Criteria

1. THE Game_Engine SHALL render a sky background with clouds
2. THE Game_Engine SHALL render an ocean at the bottom of the screen
3. THE Game_Engine SHALL render Kiro as a white phantom sprite
4. THE Game_Engine SHALL render pelicans with orange beaks in pixel art style
5. THE Game_Engine SHALL render sharks with open mouths in pixel art style
6. THE Game_Engine SHALL render heart icons representing remaining lives
7. THE Game_Engine SHALL maintain a consistent pixel art aesthetic across all visual elements
8. THE Game_Engine SHALL update the display at least 30 frames per second

### Requirement 7: Responsive Design

**User Story:** As a player, I want the game to work on both desktop and mobile devices, so that I can play anywhere.

#### Acceptance Criteria

1. THE Game_Engine SHALL render the game in horizontal orientation on all devices
2. WHEN the game loads on desktop, THE Input_Handler SHALL enable spacebar controls
3. WHEN the game loads on mobile, THE Input_Handler SHALL enable touch controls
4. THE Game_Engine SHALL scale the canvas to fit the available screen size while maintaining aspect ratio
5. THE Game_Engine SHALL ensure all game elements remain visible and proportional on different screen sizes

### Requirement 8: Game State Management

**User Story:** As a player, I want clear game states, so that I understand when to play and when the game has ended.

#### Acceptance Criteria

1. WHEN the page loads, THE Game_Engine SHALL display a start screen
2. WHEN the player initiates input on the start screen, THE Game_Engine SHALL transition to the playing state
3. WHILE in the playing state, THE Game_Engine SHALL update game logic and render frames
4. WHEN lives reach 0, THE Game_Engine SHALL transition to the Game_Over_State
5. WHEN in Game_Over_State, THE Game_Engine SHALL display a game over message
6. WHEN in Game_Over_State, THE Game_Engine SHALL provide an option to restart the game

### Requirement 9: Performance and Compatibility

**User Story:** As a player, I want the game to run smoothly in my browser, so that I have a good gameplay experience.

#### Acceptance Criteria

1. THE Game_Engine SHALL use HTML5 Canvas for rendering
2. THE Game_Engine SHALL implement a game loop using requestAnimationFrame
3. THE Game_Engine SHALL run without requiring any external libraries or frameworks
4. THE Game_Engine SHALL function in modern browsers supporting HTML5, CSS3, and ES6 JavaScript
5. THE Game_Engine SHALL maintain consistent frame timing regardless of device performance
6. THE Game_Engine SHALL handle window resize events gracefully

### Requirement 10: Enemy Spawn Management

**User Story:** As a player, I want enemies to appear at reasonable intervals, so that the game is challenging but fair.

#### Acceptance Criteria

1. THE Enemy_Spawner SHALL spawn pelicans at intervals between 2 and 4 seconds
2. THE Enemy_Spawner SHALL spawn sharks at intervals between 4 and 8 seconds
3. THE Enemy_Spawner SHALL ensure pelicans spawn at random vertical positions within the playable sky area
4. THE Enemy_Spawner SHALL ensure sharks spawn at random horizontal positions along the ocean surface
5. THE Enemy_Spawner SHALL prevent spawning more than 2 pelicans simultaneously
6. THE Enemy_Spawner SHALL prevent spawning more than 1 sharks simultaneously
