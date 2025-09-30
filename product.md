# Product Brief: Classic Snake Web App

## Objective
Build a colorful, browser-based Snake game that feels nostalgic yet polished, includes selectable speeds, and displays current and high scores.

## Target Audience
Casual players seeking a quick, retro-style gaming experience on desktop or mobile browsers.

## Success Metrics
- Game loads in under 2 seconds on modern browsers.
- 95% of actions (direction input, speed change, restart) respond within 100 ms.
- High score persists for the session and resets on browser refresh (localStorage optional stretch).

## Core Features
- Classic Snake mechanics on a grid with wrap prevention (snake dies on wall or self collision).
- Keyboard controls (`Arrow` keys / `WASD`) plus on-screen controls for touch.
- Speed selection (e.g., Slow, Normal, Fast) affecting update interval; adjustable before game start and between rounds.
- Scoreboard showing current score, session high score, and selected speed.
- Responsive layout that scales to phone, tablet, and desktop widths.

## Visual & UX Guidelines
- Bright, contrasting palette with playful vibe; avoid harsh neon.
- Grid background with subtle pattern or border to define play area.
- Smooth movement animations; no flashing.
- Prominent call-to-action buttons: `Start`, `Pause/Resume`, `Restart`.
- Tooltip or small legend for controls on initial load.

## Technical Requirements
- Framework-free vanilla HTML/CSS/JS for portability.
- Canvas-powered rendering for smooth animation.
- State-driven game loop using `requestAnimationFrame` with timing control for speed.
- Modular JS structure (input handling, game state, rendering).
- Accessible markup: semantic elements, focus outlines, ARIA labels where needed.
- Keep bundle under 200 KB uncompressed.

## Page Structure
1. Header with title and speed selector dropdown.
2. Main section:
   - Left/Top: canvas playfield (centered on smaller screens).
   - Right/Bottom: scoreboard, controls legend, buttons.
3. Footer with brief instructions or credits.

## Game Mechanics
- Grid size ~30x30 cells; snake starts at center length 3.
- Food spawns randomly on empty cells.
- Speed tiers example:
  - Slow: 8 updates/sec
  - Normal: 12 updates/sec
  - Fast: 18 updates/sec
- Score increments by 10 per food; high score updates automatically.
- Pause halts updates but keeps UI active.

## Non-Functional Requirements
- No external dependencies beyond web fonts.
- Works on latest Chrome, Firefox, Safari, Edge; graceful on mobile Safari.
- Linters: ESLint (airbnb-base or similar) and Prettier optional.

## Out of Scope
- Multiplayer or leaderboards beyond session high score.
- Persistent cloud storage.
- Skins/themes beyond base palette.

## Milestones
1. Static layout & styling scaffold.
2. Core game loop with keyboard controls.
3. Speed selector integration & pause/resume.
4. Scoreboard + high score tracking.
5. Touch controls & polish pass (animations, responsiveness).
