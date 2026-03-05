# Pilot Strategy and MVP Philosophy

This document explains the team's approach to building and releasing pilot games / MVPs
rather than attempting to deliver "full" educational titles immediately. It captures the
rationale, current state of the pilots, what constitutes a pilot versus a full game, and
what gaps remain before the project can safely scale into larger titles.

---

## 1. What we mean by *pilots* or *MVPs*

- A **pilot** is a deliberately small, self‑contained experience built primarily to validate
the infrastructure and core interaction patterns. It exercises the key technical subsystems
(hand‑tracking, fallback controls, TTS, progress/score management, feature flags, camera
permissions, settings, etc.) without requiring dozens of levels, custom assets, or
extensive curriculum mapping.
- The pilot itself **is** a functioning game from a user's perspective (Beginning
Sounds, EmojiMatch, LetterHunt, etc.), but it is scoped to a handful of rounds or question
types. Pilots double as demos for parents, teachers, and investors and as testbeds for
real‑world trials in classrooms.
- An MVP is **not** a full educational product; it is a thin slice that allows rapid
iteration and learning with minimal development cost.

## 2. Why we favour pilots now

1. **Risk reduction.** Building a complete game (levels, art, narrative, analytics,
   localization, etc.) is time‑consuming and expensive. Pilots let us verify that the
   underpinning systems work across devices and that the UX patterns are appropriate for
   pre‑literate children before we invest heavily.
2. **Incremental learning.** Each pilot surfaces new insights about asset pipelines,
   performance, accessibility (voice fallback, TTS, captioning), feature‑flag rollouts,
   packaging, and deployment. We can fix problems earlier when the codebase is smaller.
3. **Stakeholder readiness.** We can show a running experience to teachers, parents, and
   potential school partners without waiting for a full title. Pilots are easier to ship
   and instrument for early research and pilot agreements.
4. **Modular engineering.** Pilots force us to build reusable hooks, services, and
   patterns (e.g. `ttsService`, `useFallbackControls`,`featureFlags`, `ProgressQueue`). Those
   modules become the foundation of later full games, so the larger work is never
   duplicated.
5. **Resource constraints.** With a small team, we prioritise shipping working slices to
   maintain momentum and demonstrate progress to funders.

## 3. Current state of pilot work

| Pilot | Description | Key systems exercised |
|-------|-------------|------------------------|
| **Beginning Sounds** | Tap the sound that matches the initial phoneme | Voice fallback, fallback controls, pregen/TTS, feature flag, subscription gating |
| **Emoji Match** | Match animated emojis using hand tracking | Hand‑tracking pipeline, camera privacy, gesture UI, progress queue |
| **Letter Hunt** | Identify letters around the screen | Spatial cursors, audio feedback, progress store |

Each of the above is fully playable and integrated into the main app. Feature flags and
unit tests exist to verify flag behaviour; voice/TTS fallback is implemented with
`ttsService` supporting three tiers; the `useFallbackControls` hook works across pilots.

## 4. What is *not* yet part of a pilot (i.e. what would make a full game)?

- **Rich content catalogue.** Full games require dozens of levels, varied assets, songs,
  illustrations, animations, etc. Pilots usually reuse a handful of stock assets.
- **Curriculum/learning path.** A production title will have pedagogical design, skill
  progression, teacher guides, and analytics for mastery. Pilots have minimal scoring and
  no outside‑school reporting.
- **Localization and voice talent.** Pilots often use browser TTS or basic audio clips; a
  polished title will need professionally recorded audio and text translation.
- **Polish & QA.** Pilots are deliberately rough around the edges. Full games require
  high‑quality UI, animation, error handling, accessibility testing, and bug‑free cross
  platform performance.
- **Monetisation & deployment pipeline.** Pilot builds are ad‑hoc; production games need
  signed binaries, app store packaging, licensing, analytics instrumentation, and A/B
  testing infrastructure.
- **Comprehensive analytics and retention features.** The minimal telemetry in pilots will
  expand to full funnel tracking, user accounts, and long‑term usage metrics.

Until these elements are in place and piloted repeatedly across multiple titles, the
team considers the platform “under validation” and focuses on small, iterative pilots
rather than full game deliverables.

## 5. Next steps for scaling beyond pilots

1. Complete at least two distinct pilot titles using the reusable engine to ensure
   cross‑title consistency.
2. Audit the pilot code for common functionality and refactor into shared modules.
3. Build out the feature‑flag system further to support A/B tests and phased rollouts.
4. Develop an asset pipeline and style guide for rapid level creation.
5. Design a curriculum framework and data model for tracking learning objectives.
6. Implement localization infrastructure and contract voice talent.
7. Add production‑grade analytics, error reporting, and deployment automation.
8. Plan the first “full game” project only after the above foundations are proven.

---

The pilot strategy document should be referenced by team members working on new games
and by anyone evaluating project progress. It captures the reasoning behind the current
MVP‑centric approach and clarifies what remains to call something a full educational
title.
