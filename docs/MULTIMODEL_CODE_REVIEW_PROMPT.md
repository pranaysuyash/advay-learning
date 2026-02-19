# Multi-Model Code Review Prompt for Games UX Architecture

## Context

Learning app for children (2-9 years) with hand-tracking based games.
Currently: 4 games, basic analytics, 5 languages, 8 configured quests (hidden).
All games hardcoded to "Easy" difficulty. No age-based UI adaptation despite tracking age.

## Code to Review

### 1. Game Configuration (src/frontend/src/pages/Games.tsx)

All games hardcoded with ageRange strings. No difficulty progression. Age from profile not used for filtering.

### 2. Analytics Schema (src/backend/app/db/models/progress.py)

Progress model tracks: activity_type, content_id, score, duration_seconds, meta_data, idempotency_key.
Limited granularity - no per-attempt metrics, no gesture quality data.

### 3. UI Components (GameCard.tsx, GameSetupCard.tsx)

GameCard shows: title, ageRange, category, difficulty (identical colors for Easy/Medium/Hard).
ProfileStore tracks age but no component uses it for adaptation.

### 4. Game Components (GameContainer, GameLayout, GameControls)

Well-structured, reusable infrastructure. But no game-specific customization per age group.

### 5. Backend Endpoints (src/backend/app/api/v1/endpoints/progress.py)

GET /progress, POST /progress, POST /progress/batch (dedup), GET /progress/stats.
Simple batch save with idempotency support.

## Analysis Questions for Models

### Architecture & Design

1. Is the game configuration hardcoding (in Games.tsx) scalable for future games?
2. How should age-based content adaptation be architected?
3. Should difficulty progression be frontend state or backend-driven?
4. Is the quest system (currently hidden) a good foundation for progression?

### Code Quality

1. Are there duplication patterns in game implementations?
2. Is the analytics schema extensible enough for richer event tracking?
3. Could the UI component patterns be simplified or unified?
4. What refactoring would improve maintainability?

### UX & Engagement

1. How well do difficulty colors communicate progression levels?
2. Is the feedback loop tight enough for young children (2-3yr)?
3. Are the ageRange strings effective or too generic?
4. What engagement hooks are missing?

### Performance & Scalability

1. Are there performance concerns with hand tracking at 30fps?
2. Is the batch progress API appropriate for offline queuing?
3. Could gesture recognition be optimized per age group?

### Improvement Suggestions

1. What's the highest-impact improvement for next sprint?
2. Should we implement difficulty progression first or age-based filtering first?
3. How should the quest system be exposed?
4. What analytics events are most critical to add?

## Output Format

For EACH model (Claude, GPT, Gemini):

1. Analysis summary (3-5 sentences)
2. Top 3 findings (high confidence)
3. Top 3 improvement suggestions (ordered by impact)
4. Questions/clarifications needed
5. Confidence level (high/medium/low) on recommendations

## Cross-Model Synthesis

After all models respond:

1. Identify areas of consensus (all models agree)
2. Identify areas of disagreement (conflicting recommendations)
3. Synthesize best ideas into consolidated recommendations
4. Create prioritized improvement roadmap
