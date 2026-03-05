# Phase 3 AI Design: Story, Activity & Adaptive Learning

*Date: 2026‑03‑05*  
*Prepared by: Codex (execution)*

This design document breaks up the Phase 3 roadmap features into a set
of service contracts and runtime rules that will guide implementation in
Weeks 5–8.  It is intended to serve as the starting point for ticketed
engineering (TCK‑20260305‑014, ‑015).

## 1. Goals & Constraints

Phase 3 unlocks richer interactions via text generation while remaining
local-first and child-safe.  Key requirements:

* **Determinism for safety:** story and activity outputs must be
  structured and filterable; no free-form prompts allowed.
* **Latency budget:** 5 s per generation is acceptable for background
  story/activity creation, but user-visible prompts should be <2 s.
* **Offline capability:** all generators should run locally using the
  same on-device LLM infrastructure defined in Phase 2.
* **Parental control:** features must be toggleable via `ai.features` flags
  and offer explicit limits (daily/story count, export opt‑ins).
* **Data privacy:** no new telemetry beyond what adaptive learning
  already collects; all progress stays on device.


## 2. Service Interfaces

These interfaces will reside alongside `LLMService`; each generator is a
lightweight wrapper that can call the LLM or fall back to templates.

```ts
// shared between modules
interface ChildProfile {
  id: string;
  name: string;
  age: number;
  learnedLetters: string[];      // historically mastered letters
  sessionStats: Record<string, any>; // e.g. streaks, lastActivity
}

// ==== Story Generator ====
interface StoryRequest {
  profile: ChildProfile;
  theme: 'animals' | 'space' | 'ocean' | 'forest';
  featuredLetter: string;       // bring letter into text
  maxLength?: number;           // words
}

interface StoryResponse {
  text: string;
  provider: LLMProvider;        // from LLMService, or 'template'
  meta: {
    words: number;
    censored: boolean;          // whether filter altered output
  };
}

interface StoryGenerator {
  init(): Promise<boolean>;
  generate(req: StoryRequest): Promise<StoryResponse>;
}

// ==== Activity Generator ====
export type ActivityType =
  | 'letterTrace'
  | 'letterFind'
  | 'letterMatch'
  | 'wordBuild'
  | 'storyListen'
  | 'creativeDraw';

interface ActivityRequest {
  profile: ChildProfile;
  preferredTypes?: ActivityType[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Activity {
  id: string;                   // opaque, used for caching/progress
  type: ActivityType;
  content: any;                 // structured JSON used by game UI
  metadata?: Record<string, any>;
}

interface ActivityGenerator {
  init(): Promise<boolean>;
  generate(req: ActivityRequest): Promise<Activity>;
}

// ==== Adaptive Learning Path ====
interface LearningSignal {
  activityId: string;
  success: boolean;
  durationMs?: number;
  extra?: Record<string, any>;
}

interface LearningPathConfig {
  maxDailyStories?: number;
  maxDailyActivities?: number;
  thresholdStreakForUpgrade?: number;
}

interface AdaptiveLearning {
  init(config?: LearningPathConfig): void;
  record(signal: LearningSignal): void;
  nextRecommendation(profile: ChildProfile):
    | { kind: 'story'; theme: string }
    | { kind: 'activity'; types: ActivityType[] };
}
```


## 3. Runtime Rules & Templates

### 3.1 Story Templates

When the LLM is disabled or an explicit `template` provider is requested,
use a deterministic template engine:

```
"Once upon a time, {name} went to the {theme}.
 There {name} met a friendly {animal} who loved the letter {letter}.
 'Let's {letter}-dance!' said the {animal}.
 {name} and the {animal} {letter}-danced happily.
 The end."
```

Templates are parameterized and pass through the existing profanity/age
filter before being shown.

### 3.2 Activity Blueprint

Activities are JSON objects interpreted by the game framework; example
for `letterTrace`:

```json
{
  "type": "letterTrace",
  "letter": "A",
  "path": [[0,0],[1,0],[1,1],[0,1]],
  "hints": ["follow the arrow"],
  "difficulty": "easy"
}
```

Generators may call the LLM to produce bitmaps, sequences or textual
instructions which are then translated into these blueprints.

### 3.3 Adaptive Learning Logic

Basic rule engine:

1. track `LearningSignal` per activity; compute rolling success rate.
2. if success > thresholdStreak for 3 activities of same type, upgrade
   difficulty or switch to new letter.
3. if failure > 2 in a row, offer easier activity or short story for
   encouragement.
4. enforce daily caps from config; when hit, return `{ kind: 'none' }`.

This engine lives in a lightweight `AdaptiveLearning` class stored in
`AdaptiveLearning.ts` and invoked by UI controllers.


## 4. Deployment & UX

* **Feature flags:** Add `ai.storyGeneratorV1`, `ai.activityGeneratorV1` and
  `ai.adaptiveLearningV1` to `features.ts` (editable by parent).
* **Settings UI:** allow parents to set daily limits and toggle
  `homemade stories`, `surprise activities`.
* **Onboarding:** at first launch of Phase 3, show a short video explaining
  that Pip can now make up stories and suggest new games.
* **Safety audit:** all generated text passes through same filter used by
  chat inputs; templates are pre‑approved.


## 5. Tickets & Next Steps

1. **TCK-20260305-014 :: Phase 3 Service Design** (this document)
   - Create stub classes for `StoryGenerator`, `ActivityGenerator`,
     `AdaptiveLearning` in `src/frontend/src/services/ai`.  Include
     unit tests verifying interface compliance.
2. **TCK-20260305-015 :: Phase 3 Implementation Plan**
   - Task breakdown for Weeks 5–8:
     * Week 5: implement story generator (template + LLM adapter)
     * Week 6: implement activity generator and blueprints
     * Week 7: build adaptive path engine + config UI
     * Week 8: integration testing + QA audit (safety, latency)
   - Add required schema to backend if persistent progress is stored.
3. Explore LLM prompt templates in a separate review PR (audit required).


## 6. Research Links

- LLM survey: `docs/research/LLM_PROVIDER_SURVEY_2026-03-05.md`
- Story/Activity prompt examples: `prompts/ai-native/ai-feature-explore-v1.0.md`


*Document prepared as part of Phase 3 kickoff on 2026-03-05.*