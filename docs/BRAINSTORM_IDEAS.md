# Wild Idea Vault

This document captures uncapped, free‑thinking concepts generated on demand.  It is maintained whenever a user asks for "more ideas" or comparable open‑ended brainstorming.  All content is assumed to be governed by the same vision rules in `PLAYGROUND_ARCHITECTURE_LIVING.md`.

## Recent Brainstorm (2026‑03‑10)

### Environmental Augmenter <!-- priority: P1 -->
- Camera scans room and plants virtual flora/fauna reacting to real conditions (light, temperature via microphone, movement via accelerometer). <!-- priority: P1 -->

### Kimi Stack Ideas (2026‑03‑10)

#### Gesture & Body as Controller <!-- priority: P1 -->
- Air Typing/Drawing with hand landmarks and phonetic Kokoro feedback. <!-- priority: P1 -->
- Puppeteering bodies control Kenny NL joints, pinch=grab, open=jump. <!-- priority: P2 -->
- Shadow Physics: silhouette segmentation produces realtime colliders letting child become platforms or shields. <!-- priority: P0 -->
- Breath Control via face mesh to power wind in sailing or candle counting. <!-- priority: P2 -->
- Velocity-based spells (fast swipe fire, slow circle ice). <!-- priority: P1 -->
- Occlusion games hide virtual objects behind real hand (depth‑aware). <!-- priority: P1 -->
- Two-Player Mirror cooperation via pose mapping. <!-- priority: P1 -->

#### Subject Matter Explorations
- Phonics Tai Chi: body shapes match letter forms with Kokoro songs. <!-- priority: P2 -->
- Story Co-Author: act verbs, Kokoro generates mad‑lib narrative. <!-- priority: P1 -->
- Sign Language Bridge: ASL fingerspelling validation with Kokoro audio. <!-- priority: P1 -->
- Molecule Builder: pinch atoms to bond; surprise face triggers reaction. <!-- priority: P2 -->
- Geometry Gymnastics: arm angles measured and displayed. <!-- priority: P2 -->
- Coding by Choreography: dance sequences become code blocks. <!-- priority: P2 -->
- Conductor Mode: hand height/position control tempo/pitch in orchestra. <!-- priority: P1 -->
- Pottery wheel via circular hand motion and pinch to shape clay. <!-- priority: P2 -->
- Color Hunter: segmentation isolates real object color to validate. <!-- priority: P2 -->

#### Social-Emotional Learning
- Emotion Mirror: face mesh drives avatar emotions for regulation. <!-- priority: P2 -->
- Personal Space Bubble: pose detection field teaches consent. <!-- priority: P2 -->

#### Technical Architecture Ideas <!-- priority: P2 -->
- WebWorker+WASM for MediaPipe off‑main thread. <!-- priority: P2 -->
- Adaptive complexity auto‑fallback Holistic→Hands based on FPS. <!-- priority: P2 -->
- Calibration mini-game wave to establish limb baselines. <!-- priority: P2 -->
- Kokoro TTS modes whisper/excited; JSON scripts for dynamic character voices. <!-- priority: P2 -->
- Phonetic highlighting synced with Kokoro audio. <!-- priority: P2 -->
- Kenny NL modularity: swap textures based on CV input. <!-- priority: P2 -->
- Procedural backgrounds using segmentation masks. <!-- priority: P3 -->

#### Engagement Mechanics <!-- priority: P2 -->
- Daily streaks via biometrics gesture similarity score. <!-- priority: P3 -->
- Sticker album unlocking via CV-detected feats. <!-- priority: P2 -->
- Async Ghost Mode recording pose data to race friends. <!-- priority: P2 -->
- Accessibility: Seated Mode toggle, Low‑Vision audio cues, Motor forgiveness slider. <!-- priority: P2 -->

#### Wild Card Concepts <!-- priority: P3 -->
- AR Shadow Puppets interactive. <!-- priority: P2 -->
- Paper Craft Bridge print‑scan templates to import characters. <!-- priority: P2 -->
- Full-Body Typing using pose→keyboard zones. <!-- priority: P3 -->
- Whisper Detection with lip-reading validation. <!-- priority: P2 -->

#### Content Expansion Vectors Table <!-- priority: P3 -->
- Zoology, Cooking Math, Astronomy, History with Kokoro roles and CV mechanics. <!-- priority: P3 -->

#### Immediate Prototype Next Steps
1. Hand Tracker sandbox debug view overlays.
2. Voice+Gesture combo validation example.
3. Performance budget Holistic vs Hands test.

**Where to get lost deeper?**
- Creative physics? SEL? Bureaucratic satire? Tech poetry?

---

*Next brainstorming session: TBD. Future ideas should append above.*

### Object‑As‑Controller <!-- priority: P1 -->
- Recognize household objects to turn them into in‑app tools (cup = paintbrush, toy car = in‑game vehicle, spoon = stirring tool). <!-- priority: P1 -->

### Time‑Layered Play <!-- priority: P2 -->
- Games change based on time of day/season; night‑flowers, shadows matching actual room time. <!-- priority: P2 -->

### Tangible‑to‑Digital Bridges <!-- priority: P1 -->
- Printable cut‑outs unlocking in‑app content when shown to the camera; stickers triggering secret modes. <!-- priority: P1 -->

### Peer‑to‑Peer Play <!-- priority: P1 -->
- Nearby devices share canvas/physics via WebRTC; drag on one moves object on the other. <!-- priority: P1 -->

### Parent‑Child Co‑Creation <!-- priority: P2 -->
- Simple authoring UI that turns a parent sketch or word list into a playable prototype via LLMs/vision. <!-- priority: P2 -->

### Sensory‑Augmented Stories <!-- priority: P2 -->
- Smart bulbs and camera coordinate with story narration to change room ambience. <!-- priority: P2 -->

### Gesture‑Triggered World Events <!-- priority: P2 -->
- Global events activated when enough children perform a gesture (e.g. Rainbow Day, Treasure Hunt unlocking). <!-- priority: P2 -->

### Adaptive Soundscapes <!-- priority: P2 -->
- Microphone ambient noise becomes part of game audio (quiet → nature, loud → party). <!-- priority: P2 -->

### Memory‑Tower Game <!-- priority: P2 -->
- Persistent tower in parent dashboard built from play sessions; children can visit it in "explore" mode. <!-- priority: P2 -->

### Mood Mesh System <!-- priority: P3 -->
- Multi‑vector mood state (energy, curiosity, focus, frustration) that games can query. <!-- priority: P3 -->

### Gesture Analytics Playground <!-- priority: P3 -->
- Internal tool to design gesture sequences and simulate age‑based performance with real data. <!-- priority: P3 -->

### Play‑Style Personas <!-- priority: P2 -->
- Automatic clustering into emergent personas like "Builder" or "Artist" displayed non‑judgmentally in parent view. <!-- priority: P2 -->

### Sci‑Fi Themes and API for External Toys <!-- priority: P3 -->
- Seasonal themes (Space Ship Repair) and open API for IoT toy interaction. <!-- priority: P3 -->

### Composite & Forbidden Metrics <!-- priority: P3 -->
- Define Play Quotient; maintain living "Never‑Metrics" registry with linter. <!-- priority: P3 -->

### Privilege‑Aware Mode <!-- priority: P2 -->
- Detect school vs home network and toggle "field trip" mode. <!-- priority: P2 -->

### Wild Creative Sparks
- Augmented Shadow Orchestra, Reverse Day controls, Emotion‑Powered Cosmetics.

## 🧠 Priority Scoring

To transform this freeform vault into actionable work, apply the audit/priority framework:

1. Review each idea and assign a priority (P0, P1, P2, P3) based on impact/effort.
2. Stamp ideas with `<!-- priority: P# -->` comments or move them into a "scored" section below.
3. New high-priority ideas automatically spawn tickets via the general Brainstorm Scoring & Queue issue (TCK-20260311-005).
4. Periodically run `./scripts/audit_review.sh` to ensure high-value vault entries have tickets.

Use this section as a living checklist; when an idea graduates, remove it or mark as done to keep the vault lean.

---

### Kimi Stack Ideas Continued (2026‑03‑10)

#### Object-as-Controller (Your Seed, Extended)
- **The Hot Wheels Hypnosis:** physical car history grants digital loop momentum; drive in real world to climb walls digitally; Kokoro narrates the car's dreams.
- **The Wobbly Controller:** CV loss triggers "quantum drift" allowing strategic cheating; teaches CV failure states as mechanic.
- **Scale Treason:** toy distance to camera controls in-game scale (monster truck vs micro-machine) teaching parallax.

#### Puppetry Dimension (Object = Character)
- **The Lego Possession:** minifig silhouette controls avatar movement; toy articulation shapes personality.
- **The Stuffed Animal Skin:** scan plushie color histogram to generate terrain.
- **The Shadow Government:** character exists in shadow; move toy to change shadow, light source puzzles.

#### Object Alchemy (Combinatorics)
- **The Syntax of Stuff:** proximity of objects crafts new items; physical banging as crafting gesture.
- **The Weight of Imagination:** CV size sets character weight; vocal lying (stress/tone) overrides reality.
- **The Lost Property Office:** objects have "souls"; show toy creates matching NPC; carry toy to edge to reunite.

#### Portal Mechanics (Object as Key)
- **The Backside of Things:** show toy underside vs top flips gravity/level.
- **The Secret Life of Chairs:** shape detection grants powers (roll, bridge, cloud platform).
- **The Memory Card:** show photo unlocks themed levels via meta-vision face detection.

#### Physics Betrayal
- **The Anti-Gravity Spoon:** spoon orientation flips game gravity using reflection mapping.
- **The Friction Heist:** rub toy on surfaces; texture recognition imports friction.
- **The String Theory:** string tension controls slingshot/stealth; tether UI.

#### Narrative Possessions
- **The Hitchhiker:** toy haunted; Kokoro narrates as toy; toy earns XP via real-world travel; neglect kills it.
- **The Traitor Object:** real toy spawns enemy clone; hide physical toy to vanish enemy.
- **The Scale Model:** physical diorama becomes game world; move pieces to alter history.

#### Absurd/Surreal Layer
- **The Object Confusion:** CV misclassification (banana=phone) teaches ML limits.
- **The Existential Controller:** game runs only when you’re not looking; rely on voice/proprioception.
- **The Object Hunger:** digital character eats physical toy when close; toy vanishes until traded.
- **The Reflection Rebellion:** mirror image as enemy, race lagging self.

#### Curriculum Integration (Stealth Learning)
- **The Taxonomy Chase:** Kokoro prompts find symmetry, etc., using toybox as database.
- **The Material Science Gauntlet:** detect conductivity via specular reflection to complete circuits.
- **The Archaeological Brush:** brush toy to clean digital fossil; tactile feedback loop.

---

*Next brainstorming session: TBD. Future ideas should append above.*
