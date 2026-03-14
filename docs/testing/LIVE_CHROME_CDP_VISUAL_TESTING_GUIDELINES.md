# Live Chrome CDP Visual Testing Guidelines (Digital Jenga and Other WebGL Games)

Date: 2026-03-14  
Scope: `learning_for_kids` frontend visual testing where Playwright-launched Chromium is not enough.

## Why this exists

Headless/spawned browsers often fail to match real gameplay behavior for:
- WebGL + GPU rendering
- Camera permissions / MediaPipe runtime
- Existing authenticated user sessions

For those cases, use the **actual user-open Chrome tab** via CDP instead of spawning a fresh Playwright Chromium shell.

## Decision rules

Use Playwright-launched browser when:
- Route/navigation smoke checks are enough
- No camera/WebGL fidelity is needed

Use Live Chrome over CDP when:
- User asks for actual visual tests
- You need to validate camera/hand-tracking behavior
- You need real session state and real rendering conditions

## Standard flow (Live Chrome via CDP)

1. Ensure Chrome is running with remote debugging:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

2. Verify endpoint:

```bash
curl -s http://127.0.0.1:9222/json/version
curl -s http://127.0.0.1:9222/json/list
```

3. Attach through CDP tooling (DevTools MCP preferred in Codex desktop):
- List pages
- Select the already-open `http://localhost:6173/games/digital-jenga` page
- Inspect DOM/UI state, console, and screenshots in that same live tab

4. Capture evidence:
- Screenshot path under repo (for example `src/screenshots/...png`)
- Console/network notes for regressions
- Exact mode/phase observed (classic, single dice, double dice, math)

5. Document Observed vs Inferred in worklog.

## Required evidence checklist

- Confirmed CDP endpoint reachable (`9222`)
- Confirmed attachment to the real gameplay tab (not a spawned test shell)
- At least one screenshot from live tab state
- Mode controls + critical interaction verified in live tab
- Any blockers recorded (auth gate, camera denial, GPU issue)

## Jenga-specific visual test checklist

- Mode selector buttons visible and clickable in all 4 modes
- Block can be grabbed and extracted without forced auto-placement
- `place` phase shows explicit action path (HUD/button)
- Tower stability indicator updates after placement and settle
- Hand toggle transitions do not loop/error
- Pointer/mouse fallback remains playable

## Known anti-patterns

- Treating headless WebGL/camera failures as product regressions without live-tab verification
- Claiming “visual verified” using only unit tests
- Using only Playwright-spawned Chromium when user explicitly requested actual visual validation

## Notes on tool choice

- CDP is transport/protocol to attach to an existing real browser.
- Playwright is still useful, but default Playwright runs open isolated browser instances; that is different from validating an already-open real user tab.
