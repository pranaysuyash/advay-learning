# Kids-Focused Open Datasets, APIs, and CC0 / Open Asset Catalog

**Date:** 2026-03-03  
**Purpose:** preserve the resource catalog the prior agent was trying to write into `/tmp/open_assets_research.md`, but in a real repo document.  
**Important:** this is a captured research starting point, not a live-verified procurement list. External APIs, quotas, and licenses can change; verify current terms before shipping against them.

---

## Evidence Discipline

### Project-Confirmed

- `Observed`: this repo already uses Kenney assets as a local canonical source.
- `Observed`: the purchased bundle path is `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`.
- `Observed`: the current runtime asset source of truth is `src/frontend/public/assets/kenney/`.
- `Observed`: the repo already includes a sync tool at `tools/sync_kenney_platformer_assets.sh`.
- `Observed`: Matter.js and MediaPipe-style CV infrastructure already exist in the project.

### Transcript-Derived External Leads

- `Observed`: the prior agent was trying to capture a broad external resource list spanning APIs, datasets, CC0 assets, audio, CV, and speech.
- `Unknown`: the current live terms, quotas, and exact licensing details for every external source listed below.
- `Rule`: treat these as candidate sources to evaluate, not as automatically approved production dependencies.

---

## 1. Project-Confirmed Existing Asset Sources

### Kenney (Primary Current Asset Source)

- **Local source:** `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`
- **Runtime path:** `src/frontend/public/assets/kenney/`
- **Current synced platformer subset:** `src/frontend/public/assets/kenney/platformer`
- **Typical use in this project:** sprites, backgrounds, collectibles, UI-adjacent art, sound effects
- **Workflow:** check in-project assets first, then source from the local bundle, then sync into the canonical runtime path

### Existing In-Repo Asset Buckets

- `src/frontend/public/assets/backgrounds`
- `src/frontend/public/assets/icons`
- `src/frontend/public/assets/images`
- `src/frontend/public/assets/items`
- `src/frontend/public/assets/kenney`
- `src/frontend/public/assets/sounds`

### Existing Core Runtime Libraries

- **Matter.js** for 2D physics
- **MediaPipe / hand-tracking stack** for CV-driven interactions
- **Web platform audio + in-repo hooks** for sound and TTS orchestration

---

## 2. Kids-Relevant Open Data / API Categories

These are the categories the prior agent was aiming to capture, refocused around kid-appropriate exploratory gameplay and educational content.

### Space / Astronomy

Good fit for:

- Space Explorer
- Constellation Myth Maker
- Weather / Earth-from-space discovery

Candidate sources:

- **NASA Open APIs** — [api.nasa.gov](https://api.nasa.gov/)
- **NASA Image and Video Library** — [images.nasa.gov](https://images.nasa.gov/)
- **NOAA open data** — [noaa.gov](https://www.noaa.gov/)

Why useful:

- real space photos
- astronomy facts
- Earth imagery
- weather / climate learning hooks

### Plants / Nature / Leaves

Good fit for:

- Plant a Garden
- Plant Doctor
- Nature Explorer
- Seed Dispersal Wind

Candidate sources:

- **Pl@ntNet** — [plantnet.org](https://plantnet.org/)
- **USDA plant database** — [plants.usda.gov](https://plants.usda.gov/)
- **iNaturalist developer resources** — [inaturalist.org/pages/developers](https://www.inaturalist.org/pages/developers)
- **OpenTree of Life** — [tree.opentreeoflife.org](https://tree.opentreeoflife.org/)

Why useful:

- plant identification
- leaf / taxonomy references
- biodiversity discovery
- structured plant metadata

### General Knowledge / Facts

Good fit for:

- “Why?” style exploration
- kid-safe fact cards
- world knowledge modes

Candidate sources:

- **Wikipedia / MediaWiki API** — [mediawiki.org/wiki/API:Main_page](https://www.mediawiki.org/wiki/API:Main_page)
- **Wikidata** — [wikidata.org](https://www.wikidata.org/)
- **DBpedia** — [dbpedia.org](https://www.dbpedia.org/)
- **Open Library** — [openlibrary.org/developers/api](https://openlibrary.org/developers/api)
- **Project Gutenberg / Gutendex** — [gutendex.com](https://gutendex.com/)

Why useful:

- structured fact retrieval
- public-domain reading material
- kid-readable enrichment for exploratory modes

---

## 3. CC0 / Open Art and Game Asset Sources

These are the broad asset sources the prior agent was trying to list for future expansion beyond Kenney.

### Best-Fit Candidates For This Project

- **Kenney** — already in use, strongest current fit
- **OpenGameArt** — [opengameart.org](https://opengameart.org/)
- **itch.io game assets (license must be checked pack-by-pack)** — [itch.io/game-assets/free](https://itch.io/game-assets/free)
- **Wikimedia Commons** — [commons.wikimedia.org](https://commons.wikimedia.org/)
- **unDraw** — [undraw.co](https://undraw.co/)
- **Pixabay** — [pixabay.com](https://pixabay.com/)
- **Pexels** — [pexels.com](https://www.pexels.com/)
- **Unsplash** — [unsplash.com](https://unsplash.com/)

Recommended use here:

- use Kenney first for game-native art consistency
- use Wikimedia / public-domain image sources for educational reference art
- use illustration sources sparingly for content where a soft educational visual helps more than game-sprite art

### Licensing Discipline

Before importing from non-Kenney sources:

1. verify the exact asset license for the specific pack or file
2. prefer CC0 / public-domain / clearly permissive sources
3. record attribution requirements if any
4. avoid mixing unclear licenses into runtime assets

---

## 4. Audio / Sound Sources

Good fit for:

- animal sounds
- nature ambience
- feedback effects
- music / rhythm play

Candidate sources captured from the prior draft:

- **Freesound** — [freesound.org](https://freesound.org/)
- **OpenGameArt audio** — [opengameart.org](https://opengameart.org/)
- **BBC Sound Effects** — [sound-effects.bbcrewind.co.uk](https://sound-effects.bbcrewind.co.uk/)
- **YouTube Audio Library** — [youtube.com/audiolibrary](https://www.youtube.com/audiolibrary)
- **Incompetech** — [incompetech.com](https://incompetech.com/)

Project-first note:

- The project already has usable Kenney SFX and in-repo sound folders.
- Only reach for external audio when the in-repo assets do not cover the intended interaction.

---

## 5. Visual / Illustration / UI Sources

Good fit for:

- educational diagrams
- soft explanatory art
- child-friendly UI embellishments

Candidate sources captured from the prior draft:

- **Wikimedia Commons** — [commons.wikimedia.org](https://commons.wikimedia.org/)
- **Noun Project** — [thenounproject.com](https://thenounproject.com/)
- **Font Awesome** — [fontawesome.com](https://fontawesome.com/)
- **Material Design Icons** — [fonts.google.com/icons](https://fonts.google.com/icons)
- **Feather Icons** — [feathericons.com](https://feathericons.com/)
- **unDraw** — [undraw.co](https://undraw.co/)
- **Blush** — [blush.design](https://blush.design/)
- **DrawKit** — [drawkit.com](https://www.drawkit.com/)

Guidance:

- for game UI, keep consistency with the repo’s existing design language
- for reference art, prefer sources that do not drag in attribution complexity unless the value is clear

---

## 6. Computer Vision / ML Model Sources

Good fit for:

- hand / pose / face upgrades
- object recognition
- kid-specific exploratory interactions

Project-confirmed and transcript-derived sources:

- **MediaPipe** — already the primary fit
- **TensorFlow.js** — [tensorflow.org/js](https://www.tensorflow.org/js)
- **OpenCV.js** — [docs.opencv.org](https://docs.opencv.org/)
- **ml5.js** — [ml5js.org](https://ml5js.org/)
- **Teachable Machine** — [teachablemachine.withgoogle.com](https://teachablemachine.withgoogle.com/)
- **Hugging Face model hub** — [huggingface.co/models](https://huggingface.co/models)

Practical note:

- For this app, simple browser-native or browser-friendly inference is more useful than heavyweight research models.
- Only adopt a new CV stack if it materially improves a kid-facing interaction that MediaPipe does not already cover.

---

## 7. Voice / Speech Sources

Good fit for:

- speaking prompts
- pronunciation games
- narration
- speech mirroring

Project-confirmed and transcript-derived candidates:

- **Web Speech API** — browser-native baseline
- **Google Cloud Speech** — [cloud.google.com/speech-to-text](https://cloud.google.com/speech-to-text)
- **Google Cloud Text-to-Speech** — [cloud.google.com/text-to-speech](https://cloud.google.com/text-to-speech)
- **Azure Speech** — [azure.microsoft.com](https://azure.microsoft.com/)
- **Pico / lightweight open TTS tools**
- **Festival**
- **Vosk** for offline recognition

Project-first note:

- This repo already has TTS-related hooks and local TTS strategy docs.
- Prefer the existing project path first before adding a new speech dependency.

---

## 8. Best-Fit Resource Themes For Kids In This App

The prior draft was too broad in places. For this project, the highest-value external resource themes are:

### A. Wonder / Exploration Content

- NASA imagery
- nature / plant data
- animal / habitat reference content
- weather / Earth systems

### B. Safe, Reusable Creative Assets

- Kenney first
- clearly licensed CC0 game art
- public-domain educational imagery

### C. Playful Audio

- nature sounds
- animal sounds
- simple musical loops
- tactile feedback SFX

### D. Structured But Open Knowledge

- simple facts
- taxonomy
- public-domain stories
- kid-safe explanation layers

The goal is not “more APIs.” The goal is richer exploratory play with low-friction, safe content.

---

## Codex Findings

These are my own repo-specific conclusions added on top of the captured draft.

### 1. The Prior Draft Was Too Broad

The previous list mixed:

- child-appropriate content sources
- general developer libraries
- enterprise cloud APIs
- adult-oriented or broad-purpose datasets

That is useful as a brainstorming universe, but too noisy for implementation.

For this app, the better filter is:

- does it directly improve playful exploration for kids?
- does it fit browser-first delivery?
- can it be cached or curated safely?
- does it add value beyond what the repo already has?

### 2. The Most Useful External Content Classes Are Narrow

The highest-value external inputs for this app are:

- **space imagery / simple astronomy facts**
- **plant / animal / habitat reference content**
- **public-domain story / knowledge snippets**
- **ambient / nature / animal sounds**
- **clearly licensed CC0 art for missing thematic gaps**

Those are much more actionable than broad “open data” shopping lists.

### 3. We Already Have A Strong Asset Baseline

Because the repo already has:

- Kenney as a large local CC0 art source
- existing runtime asset buckets
- Matter.js
- hand / pose infrastructure
- local TTS strategy and in-repo hooks

the next bottleneck is not raw asset availability. It is:

- curation
- thematic fit
- consistency
- deciding when external content is actually necessary

### 4. Best External Asset Use Cases

External sources should mainly fill these gaps:

- realistic reference images (space, plants, animals, weather)
- audio the Kenney packs do not cover (authentic animal / nature sounds)
- culturally specific or domain-specific content that generic game packs do not provide

They should not become the default source for core game UI art if Kenney or in-repo assets already cover it.

### 5. Best Safety / Product Posture

For this app, the safest long-term approach is:

1. use local / bundled / CC0 assets first
2. use cacheable public-domain or clearly permissive sources second
3. use live APIs only when they add meaningful discovery value
4. avoid unnecessary runtime dependence on third-party services for core gameplay loops

That keeps the product more stable, more private, and easier to reason about for kid-facing use.

---

## 9. Recommended Next Research Actions

Before implementation, do the next pass as real scoped research:

1. Pick one domain at a time, not “all open data”.
2. Verify current live terms for only the sources relevant to the selected game batch.
3. Prefer sources that are:
   - child-appropriate
   - stable
   - low-friction
   - easy to cache locally
4. For any asset source, check:
   - license
   - attribution requirement
   - whether we already have equivalent in-project assets
5. For any API, check:
   - quota
   - auth model
   - caching plan
   - COPPA / privacy implications

### Suggested Research Order

If we do this next as real implementation-facing research, the best order is:

1. **Space content pass**
   - NASA imagery + simple astronomy content for `Space Explorer` / `Constellation Myth Maker`
2. **Nature content pass**
   - plant, leaf, habitat, and weather sources for garden / nature games
3. **Audio pass**
   - kid-safe ambient / nature / animal sound sources missing from current assets
4. **Thematic art gap pass**
   - only for areas where Kenney does not give us the right visual language

That sequence is tighter and more useful than trying to validate the entire universe at once.

---

## 10. What Was Not Saved Before

The prior agent attempted to save:

- `/tmp/areas_to_explore.md`
- `/tmp/open_assets_research.md`

Those were scratch paths, not repo docs.

This document and [AREAS_TO_EXPLORE_BACKLOG_2026-03-03.md](/Users/pranay/Projects/learning_for_kids/docs/research/AREAS_TO_EXPLORE_BACKLOG_2026-03-03.md) are the persisted replacements.
