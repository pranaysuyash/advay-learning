# Game Evaluation Framework - Research & Documentation

**Date:** 2026-03-16
**Purpose:** Automated game testing and quality evaluation using Chrome DevTools Protocol (CDP)

## Overview

This framework enables automated testing and evaluation of learning games using Chrome DevTools Protocol (CDP) via Puppeteer. It connects to an actual Chrome instance with user profile to test games in a real browser environment.

## Why CDP for Game Testing?

Chrome DevTools Protocol (CDP) allows:
- **Real browser testing** - Not a headless simulation
- **User session persistence** - Login state, cookies, local storage
- **MediaPipe/Camera access** - Test CV-powered games properly
- **Screenshot capture** - Visual regression testing
- **Performance metrics** - FPS, load times, memory usage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Game Testing Framework                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  CDP Tester  │──────│ Chrome (CDP) │                    │
│  │  (Node.js)   │      │   Browser    │                    │
│  └──────────────┘      └──────┬───────┘                    │
│                                │                             │
│                                v                             │
│                        ┌──────────────┐                     │
│                        │   Dev Server │                     │
│                        │  (localhost) │                     │
│                        └──────┬───────┘                     │
│                               │                             │
│                               v                             │
│                        ┌──────────────┐                     │
│                        │  Games &     │                     │
│                        │  Components  │                     │
│                        └──────────────┘                     │
│                                                               │
│  Output: Screenshots + JSON Results                          │
└─────────────────────────────────────────────────────────────┘
```

## Tools

### 1. cdp-game-tester.mjs
Basic CDP testing tool. Launches Chrome, tests random games.

```bash
# Test 5 random games
node tools/cdp-game-tester.mjs --count 5

# Test specific games
node tools/cdp-game-tester.mjs --games alphabet,math

# Test all games
node tools/cdp-game-tester.mjs --all
```

### 2. cdp-game-tester-v2.mjs (Enhanced)
Advanced testing with login support and Chrome profile.

```bash
# Test with Chrome profile (keeps login state)
node tools/cdp-game-tester-v2.mjs --profile

# Test with auto-login
node tools/cdp-game-tester-v2.mjs --login

# Test specific category
node tools/cdp-game-tester-v2.mjs --category number-jungle
```

### 3. game_evaluator.html
Interactive web-based manual evaluation tool.

1. Start dev server: `cd src/frontend && pnpm run dev`
2. Open `tools/game_evaluator.html` in browser
3. Connect and evaluate games manually

## Evaluation Criteria

Games are evaluated on six dimensions:

| Criteria | Description | What to Check |
|----------|-------------|---------------|
| **Visuals** | Color scheme, animations, aesthetic appeal | • Color palette consistency<br>• Animation smoothness<br>• Child-friendly design<br>• Visual polish |
| **Appeal** | Would a child want to play? First impressions | • Exciting opening<br>• Clear value proposition<br>• Inviting interface |
| **Mechanism** | Core interaction, responsiveness, controls | • Input responsiveness<br>• Feedback on actions<br>• Control intuitiveness |
| **Rules** | Clarity of objectives, instructions, win conditions | • Clear goals<br>• Understandable instructions<br>• Visible progress |
| **Learnings** | Educational value, skills practiced | • Age-appropriate content<br>• Skill development<br>• Learning reinforcement |
| **Fun** | Engagement, replay value, enjoyment | • Immediate engagement<br>• Reward systems<br>• Replay motivation |

## Game Categories

| Category | Games | Focus |
|----------|-------|-------|
| **letter-land** | Alphabet Tracing, Letter Hunt | Literacy, letter recognition |
| **number-jungle** | Math Monsters, Math Jumpers, Number Tracing | Numeracy, counting, arithmetic |
| **word-workshop** | Word Search, Spelling Run | Spelling, vocabulary |
| **shape-garden** | Shape Safari, Shape Stacker | Geometry, spatial awareness |
| **color-splash** | Color Match, Color Mixing | Colors, creativity |
| **platform-world** | Platformer Runner, Obstacle Course | Motor skills, coordination |
| **wellness** | Yoga Animals, Breathing Bubbles | Mindfulness, movement |
| **sound-studio** | Music Conductor, Beat Bounce | Rhythm, audio |
| **body-zone** | Mirror Maze, Balance Beam | Body awareness, pose |

## Test Output

Results are saved to `test-screenshots/evaluations/`:

```
test-screenshots/evaluations/
├── game-id-2026-03-16T10-41-15-454Z.png    # Screenshot
├── game-id-2026-03-16T10-41-19-552Z.png
└── results-1773657691877.json               # Test results
```

### Result JSON Structure

```json
{
  "config": {
    "baseUrl": "http://localhost:3000",
    "count": 5,
    "category": "number-jungle"
  },
  "results": [
    {
      "id": "math-monsters",
      "name": "Math Monsters",
      "path": "/games/math-monsters",
      "status": "passed",
      "screenshot": "/path/to/screenshot.png",
      "timestamp": "2026-03-16T10:41:15.550Z",
      "analysis": {
        "hasCanvas": true,
        "hasMediaPipe": true,
        "hasInstructions": false,
        "hasScore": false,
        "elementCount": 91
      },
      "issues": ["No visible instructions"],
      "scores": {
        "visuals": 4,
        "appeal": 5,
        "mechanism": 3,
        "rules": 3,
        "learnings": 5,
        "fun": 4
      }
    }
  ],
  "summary": {
    "total": 5,
    "passed": 3,
    "warnings": 2,
    "failed": 0
  }
}
```

## Running Tests

### Quick Start

1. **Start dev server:**
   ```bash
   cd src/frontend && pnpm run dev
   ```

2. **Run tests:**
   ```bash
   node tools/cdp-game-tester-v2.mjs --count 5
   ```

3. **View results:**
   ```bash
   open test-screenshots/evaluations/
   ```

### With Login

To test games that require authentication:

```bash
node tools/cdp-game-tester-v2.mjs --login --profile
```

This will:
1. Launch Chrome with user profile
2. Auto-login with credentials
3. Keep session across game tests
4. Test authenticated game features

### Category Testing

Test games from a specific category:

```bash
node tools/cdp-game-tester-v2.mjs --category number-jungle --count 3
```

## Visual Checks

The framework performs automated visual checks:

| Check | Description |
|-------|-------------|
| `hasCanvas` | Game uses HTML5 Canvas |
| `hasMediaPipe` | MediaPipe CV library loaded |
| `hasInstructions` | Instructions visible on page |
| `hasScore` | Score/progress display |
| `hasStartButton` | Start/Play button detected |
| `hasError` | Error text detected |
| `elementCount` | DOM element count (detects incomplete loads) |
| `textLength` | Text content length |

## Common Issues

### "Cannot connect to server"
- Ensure dev server is running
- Check port (default 5173)
- Verify `baseUrl` in config

### "Screenshot shows blank page"
- Increase `waitTime` for slower games
- Check for JavaScript errors
- Game may require camera permissions

### "Login failed"
- Verify credentials in config
- Check login page URL
- Handle 2FA/CAPTCHA manually if needed

## Adding New Tests

1. Add game to registry in `src/data/gameRegistry.ts`
2. Game auto-discovered by testing framework
3. No test code needed

## Research Notes

### Key Findings from Testing (2026-03-16)

1. **Instructions Visibility**: Many games lack visible instructions
   - Recommendation: Add prominent "How to Play" section

2. **Canvas Adoption**: Most games use Canvas for rendering
   - Good: Performance, flexibility
   - Watch: Accessibility, keyboard navigation

3. **MediaPipe Integration**: CV games properly load MediaPipe
   - Games work with camera
   - Consider fallback for no-camera scenarios

4. **Score Display**: Inconsistent score/progress display
   - Recommendation: Standardize progress indicators

5. **Element Count**: Consistent ~91 elements across games
   - Indicates shared component structure
   - Good for maintainability

### Future Enhancements

- [ ] AI-powered visual evaluation
- [ ] Performance metrics (FPS, memory)
- [ ] Accessibility audit (WCAG)
- [ ] Cross-browser testing
- [ ] Mobile viewport testing
- [ ] Regression detection

## References

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Puppeteer Documentation](https://pptr.dev/)
- [MediaPipe Documentation](https://google.github.io/mediapipe/)
