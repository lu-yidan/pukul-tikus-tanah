# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based whack-a-mole game ("打地鼠小游戏" / "pukul-tikus-tanah") with a political/anti-corruption theme. The game features two characters (xi and zhang) that randomly appear from holes, with different score values when hit.

**Tech Stack:** Vanilla HTML, CSS, and JavaScript (no build tools or frameworks required)

## Project Structure

```
├── index.html          # Main HTML entry point
├── js/
│   └── script.js       # Game logic and event handlers
├── css/
│   └── style.css       # All styling (CSS variables, animations, responsive design)
├── img/                # Game assets (hammer cursors, character images, hole background)
├── audio/
│   └── Pop.mp3         # Sound effect for hitting characters
```

## Development

### Running the Game

Simply open `index.html` in a web browser. No build process, dev server, or compilation required.

For live development with auto-reload:
```bash
# Using Python 3
python3 -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js (if you have npx)
npx serve
```

Then navigate to `http://localhost:8000`

### Testing

No automated tests exist. Manual testing only:
1. Open the game in a browser
2. Click "开始游戏" (Start Game) button
3. Click on characters as they appear
4. Verify scoring, countdown, speed controls, and game-over dialog

## Architecture

### Game Flow

1. **Initialization** (`js/script.js`): DOM elements selected, event listeners attached
2. **Game Start** (`mulai()` function):
   - Creates new game instance with unique `gameId`
   - Starts 30-second countdown timer
   - Begins character appearance loop
3. **Character Appearance** (`munculkanTikus()` function):
   - Randomly selects a hole (avoids repeating same hole)
   - Randomly picks character (xi or zhang, 50/50 chance)
   - Shows character for random duration based on speed slider (250-1600ms range)
   - Recursively calls itself until game ends
4. **Hit Detection** (`pukul()` function):
   - Validates hit is during active game
   - Adds/subtracts score based on character (`zhang: +1`, `xi: -1`)
   - Plays audio and shows feedback text
5. **Game End**: Dialog shows final score with message based on performance threshold (≥5 = high score)

### Key Game Mechanics

- **Character System** (`karakter` object at line 25-28):
  - `xi`: Decreases score by 1 when hit
  - `zhang`: Increases score by 1 when hit
  - Each has associated image and feedback messages

- **Speed Control** (`getSpeedMsRange()` at line 34-45):
  - Slider ranges from 1 (slowest) to 10 (fastest)
  - Maps to appearance duration: slow=800-1600ms, fast=250-850ms
  - Linear interpolation between min/max ranges

- **Game Instance Management**:
  - `gameId` increments each game to prevent old timers affecting new games
  - All async operations (setTimeout, setInterval) check `localGameId !== gameId` before executing
  - Prevents race conditions when rapidly restarting games

### Styling Architecture (`css/style.css`)

- **CSS Variables** (lines 3-20): Centralized color palette and sizing for easy theming
- **Responsive Board Sizing** (`--board-width` calculation): Ensures control panel and game board stay aligned
- **Custom Cursor** (line 200, 213): Hammer images (`palu1.png`, `palu2.png`) for normal and active states
- **Animations**:
  - `tikusPop`: Character pop-up animation with bounce effect
  - `hitText`: Floating feedback text that fades out
- **Mobile Responsive** (line 328-335): Grid layout adjusts below 520px width

## Customization Points

### Text Content

- **Hit Feedback Messages** (`js/script.js` lines 31-32):
  - `kataSaatKenaZhang`: Shown when hitting zhang (positive)
  - `kataSaatKenaXi`: Shown when hitting xi (negative)

- **Game Over Messages** (`js/script.js` lines 149-150):
  - High score message (≥5 points)
  - Low score message (<5 points)

### Game Parameters

- **Game Duration** (line 22): `DURASI_MAIN_MS = 30000` (30 seconds)
- **High Score Threshold** (line 23): `BATAS_SKOR_TINGGI = 5`
- **Character Probability** (line 103): `Math.random() < 0.5` determines 50/50 split

### Visual Assets

Replace images in `img/` directory:
- `xi.png`, `zhang.png`: Character images (should be transparent PNGs)
- `tanah.png`: Hole/ground overlay
- `palu1.png`, `palu2.png`: Cursor hammer images (normal and clicking states)

## Mobile Support

The game is fully responsive and optimized for mobile devices:
- Touch event handling with no 300ms delay
- Responsive layout adapts to screen sizes
- iOS Safari full-screen support
- Prevents accidental zoom on mobile

## Deployment

This is a pure static website (no build tools required). Deploy to any static hosting:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- Any web server

See DEPLOY.md for detailed deployment instructions.

## Notes

- The game includes Chinese text throughout (UI, comments, messages)
- Character names reference real political figures - content is satirical/commentary in nature
- Audio uses Web Audio API for Xi character (low frequency alert sound)
- Original Pop.mp3 used for Zhang character
- VSCode settings include `ros.distro: humble` which appears unrelated to this web project
