# Project Status

## Current State

We have **two parallel project structures** prepared based on the tech stack decision:

### Structure A: Web-First (Recommended)
Location: `app/` directory
- Vite + React + TypeScript
- MediaPipe Tasks Vision (WebAssembly)
- IndexedDB for storage
- Easier maintenance, distribution

### Structure C: Python Desktop
Location: `src/` directory  
- Python 3.11 + PyQt6
- MediaPipe Python + OpenCV
- SQLite for storage
- More CV control, familiar stack

## Documentation Created

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview |
| `docs/PROJECT_OVERVIEW.md` | Quick navigation |
| `docs/TECH_STACK_DECISION.md` | Help choose stack |
| `docs/architecture/TECH_STACK.md` | Python stack details |
| `docs/architecture/decisions/001-004` | ADRs for both approaches |
| `docs/features/ROADMAP.md` | Product roadmap |
| `docs/security/SECURITY.md` | Privacy & security |
| `docs/project-management/*.md` | Git, PR, testing guides |

## Prompts Created

| Prompt | Purpose |
|--------|---------|
| `prompts/01_initial_planning.md` | Original Python planning |
| `prompts/00-planning-web-version.md` | Web version planning |

## Scripts Created

| Script | Purpose |
|--------|---------|
| `scripts/setup.sh` | Python env setup |
| `scripts/dev.sh` | Start dev mode |
| `scripts/check.sh` | Code quality checks |
| `scripts/check_pr_size.sh` | PR size validation |

## Decision Needed

**You need to choose:**

### Option A: Web (Browser) ⭐
- **Choose if**: You want easier maintenance, familiar web tech, or plan to share
- **Start with**: `app/` directory
- **Setup**: `npm create vite@latest app -- --template react-ts`

### Option C: Python (Desktop)
- **Choose if**: You prefer Python, need max CV control, or want a desktop app
- **Start with**: `src/` directory  
- **Setup**: `./scripts/setup.sh`

## My Strong Recommendation

**Go with Web (Option A)** because:

1. **Your time matters** - Web is easier to maintain long-term
2. **Advay's experience** - Opens instantly, no setup
3. **Future-proof** - Can package with Tauri later if needed
4. **MediaPipe Web is excellent** - Google's official support

## Next Steps (Once You Decide)

### If Web:
1. Initialize Vite project in `app/`
2. Install MediaPipe Tasks Vision
3. Download model files locally
4. Build camera + hand tracking engine
5. Create first shape-trace game

### If Python:
1. Run `./scripts/setup.sh`
2. Install MediaPipe
3. Build camera + hand tracking module
4. Create PyQt6 UI
5. Create first alphabet tracing module

## Immediate Action Required

**Please tell me:**
1. Which stack do you prefer? (Web or Python)
2. Any concerns about the recommended approach?
3. Should I proceed with setting up the chosen stack?

Once you decide, I'll:
- Set up the complete working project
- Create the first runnable MVP
- Write detailed feature specs
- Get Advay something to use within days
