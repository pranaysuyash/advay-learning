# Antonym Hunt

**Game ID:** antonym-hunt  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Manifest:** To be added to `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/AntonymHunt.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/antonymHuntLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** Hunt for opposite word pairs by catching them before they escape — like capturing "fast" ⚡ and "slow" 🐢 as they scurry across the screen to learn antonyms through active play!
- **Genre:** Educational / Word Hunting / Active Vocabulary Building
- **Target audience:** Ages 4-7, children developing vocabulary and conceptual understanding
- **Core player fantasy:** "I'm a word hunter tracking down opposite pairs in the wild!"
- **Primary skill tested:** Antonym recognition, vocabulary development, conceptual relationships, quick decision-making
- **Session length:** 5-8 minutes (6-10 word pairs per game)
- **Platform context:** Hand tracking CV game with active catching mechanics for pairing opposite concepts

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Similar catching pattern in `LetterCatcher.tsx` for falling object gameplay
  - Tap/selection mechanics from EmojiMatch and other games
  - Hand tracking via `useGameHandTracking`
  - TTS system for word pronunciation
  - Celebration and particle effects
  - Streak tracking from `useStreakTracking` hook
- **What is partial/missing:**
  - Main game component `AntonymHunt.tsx`
  - Game logic module `antonymHuntLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Antonym word bank with animated word creatures
  - Catching mechanics for moving word pairs
  - "Hunt" chase mechanics
  - Opposite relationship validation
- **Evidence:**
  - No file exists at `src/frontend/src/pages/AntonymHunt.tsx`
  - No file exists at `src/frontend/src/games/antonymHuntLogic.ts`
  - No registry entry found for "antonym-hunt"
  - Related spec exists: `docs/games/specs/opposites-attract.md` (different mechanics)
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (Easy: slow words, Medium: faster, Hard: quick scurry)
2. **Game Start:** Word creatures begin scurrying across the screen
3. **Gameplay Loop:**
   - Pairs of opposite words appear as animated creatures (e.g., "hot 🔥" scurries left, "cold ❄️" scurries right)
   - Word creatures move at varying speeds based on difficulty
   - Player must catch/tap both words in a pair
   - Catch first word to "tag" it
   - Quickly catch its opposite before they escape
   - Successful pair capture triggers capture animation
   - Words pronounced and opposite relationship explained
   - Continue until all pairs captured
4. **Feedback:** Immediate visual and audio feedback on successful capture
5. **Progression:** Faster, trickier antonyms as difficulty increases
6. **Completion:** Score summary with pairs captured and rewards

### Controls
- **Hand catch:** Move hand to word creature, pinch to catch/tag
- **Hand tracking:** Index finger position for cursor
- **Pinch gesture:** Quick pinch to catch/tag a word
- **Double catch:** Must catch both words in a pair
- **Touch/mouse:** Click/tap to catch (fallback)
- **CV primary:** Full hand tracking with quick catch mechanics

### Mechanics
- **Word creature generation:** Random selection from antonym pairs bank
- **Movement patterns:** Words scurry in various directions (left, right, up, down, zigzag)
- **Speed scaling:** Movement speed increases with difficulty
- **Catch detection:** Raycast/point collision with word creatures
- **Pair matching:** Must catch both opposites within time window
- **Escape mechanic:** Words exit screen if not caught in time
- **TTS pronunciation:** Both words spoken after successful capture
- **Streak system:** Consecutive quick captures earn bonus points
- **Freeze power:** Brief slow-motion to help catch tricky pairs

### Visuals/UI
- **Background:** Wilderness/hunting theme with grass and trails
- **Word creatures:** Animated bugs/animals carrying word signs
- **Movement trails:** Visual path showing where words are going
- **Capture net:** Visual effect when words are caught
- **Escape warning:** Visual alert when words near screen edge
- **Progress tracker:** Pairs captured / total counter
- **Streak indicator:** Visual spark with consecutive count
- **Freeze button:** Brief slow-motion power-up

### Gaps/Issues
- No implementation exists to analyze
- Movement speed needs balancing for age group
- Catch window timing needs tuning
- Need visual clarity for tagged vs. untagged words
- Consider accessibility for children with motor difficulties

---

## 4. Intended Design

### Educational Goal
Develop vocabulary and understanding of antonyms (opposite words). Builds conceptual thinking by teaching relationships between contrasting ideas through active engagement.

### Pedagogical Approach
- **Active learning:** Physical movement to catch words
- **Time pressure learning:** Quick recognition under gentle pressure
- **Multisensory engagement:** Visual (creatures), auditory (TTS), kinesthetic (catching)
- **Conceptual understanding:** "Hot" is opposite of "cold" — they contrast
- **Pattern recognition:** Learn to identify opposite relationships quickly

### Difficulty Progression
| Level | Opposite Types | Speed | Catch Window | Examples |
|-------|---------------|-------|--------------|----------|
| Easy | Concrete sensory | Slow | 8 seconds | hot/cold, big/small |
| Medium | Action opposites | Medium | 6 seconds | open/close, up/down |
| Hard | Abstract concepts | Fast | 4 seconds | always/never |
| Expert | Complex antonyms | Very fast | 3 seconds | difficult/easy |

### Accessibility
- **Visual:** Large word creatures, clear emojis, high contrast
- **Auditory:** Both words pronounced on capture
- **Motor:** Generous catch radius, freeze power-up available
- **Cognitive:** Emoji support for pre-readers, gradual speed increase
- **Timing:** Freeze power for children who need more time

### Engagement
- **Hunt excitement:** Thrill of the chase to catch words
- **Visual reward:** Satisfying capture net animation
- **Speed challenge:** Faster captures = more points
- **Streak excitement:** Multiplier for consecutive quick captures
- **Thematic consistency:** Wilderness hunt — words are creatures to catch!

### Core Loop
1. Watch for scurrying word creatures
2. Identify opposite pair (e.g., "hot" and "cold")
3. Move hand to first word and pinch to catch
4. Quickly find and catch the opposite word
5. See capture animation and hear pronunciation
6. Learn the opposite relationship
7. Continue until all pairs captured

---

## 5. Drift Analysis

### Where Implementation Matches Intent
📝 N/A - Game not yet implemented

### Where Implementation Exceeds Intent
📝 N/A - Game not yet implemented

### Where Implementation Falls Short
📝 N/A - Game not yet implemented

### Overall Assessment
**Alignment: 0%** - Game is in specification phase, no implementation exists

**Target Implementation Score: 90%+**
- Responsive catching mechanics
- Smooth word creature movement
- Clear visual feedback
- Responsive hand tracking
- Engaging antonym word bank
- Proper difficulty progression
- Exciting hunt atmosphere

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Four difficulty tiers:**
   - Easy: Slow movement, long catch window, concrete opposites
   - Medium: Medium speed, moderate window, action opposites
   - Hard: Fast movement, short window, abstract concepts
   - Expert: Very fast, quick window, challenging vocabulary

2. **Hand tracking catch mechanics:**
   - Pinch to catch/tag word creature
   - Must catch both words in pair
   - Time window for catching opposite
   - Visual indicator for tagged words

3. **Word creature movement system:**
   - Various movement patterns (linear, zigzag, curved)
   - Speed increases with difficulty
   - Visual trail showing path
   - Escape warning at screen edges

4. **Word bank by category:**
   - Sensory (hot/cold, loud/quiet, light/dark)
   - Size (big/small, tall/short, huge/tiny)
   - Actions (open/close, start/stop, give/take)
   - Concepts (same/different, full/empty, always/never)

5. **Scoring system:**
   - Base: 100 points per captured pair
   - Speed bonus: Up to 50 points for fast capture
   - Streak multiplier: 1.2x at 3+, 1.5x at 6+
   - Escape penalty: -10 if word escapes

### Enhancements for Future Versions
1. **Boss mode:** Large words that require multiple catches
2. **Category hunt:** Only opposites from specific category
3. **Memory hunt:** Words hide, remember positions
4. **Team hunt:** Cooperative mode with two players
5. **Pattern mode:** Words move in predictable patterns

### Experimental Features
- **AR hunt:** Words appear in real room to catch
- **Voice tag:** Say "got it!" to catch
- **Multiplayer race:** Compete to catch pairs first
- **Seasonal themes:** Winter hunt, jungle hunt, ocean hunt

---

## 7. Visual Identity

- **Overall look:** Lively wilderness hunt where word creatures scurry and players catch them
- **Camera view:** Full screen hunting ground
- **Art style:** Cartoon creature style with word signs
- **Mood:** Exciting, adventurous, fast-paced
- **Colors:**
  - Background: Wilderness green (#4CAF50)
  - Grass accents: Light green (#81C784)
  - Word creature A: Warm orange (#FF9800)
  - Word creature B: Cool blue (#2196F3)
  - Capture net: Bright yellow (#FFEB3B)
  - Escape warning: Alert red (#F44336)
  - Accent: Trail dust (#D7CCC8)
- **Environment:** Grass field with hunting trails and bushes
- **UI style:** Rounded creatures with word signs
- **Active vibe:** "Catch the opposite words!" 🏃🔤

### Word Creature Design
```
    🦗                    🐞
  ┌─────┐               ┌─────┐
  │ HOT │  ←───────→   │ COLD│
  │  🔥 │   Catch!     │  ❄️ │
  └─────┘               └─────┘
   ↗ scurrying        scurrying ↘

   [Catch both opposites!]
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Easy/Medium/Hard/Expert buttons |
| **Tutorial** | Learn catch controls | Animated hand demo, catch demo |
| **Gameplay** | Core experience | Scurrying word creatures, trails |
| **Capture Animation** | Success moment | Net capture, creature caught |
| **Pair Complete** | Show result | Both words, pronunciation |
| **Level Complete** | Progress milestone | Stats, pairs captured, next level |
| **Game Complete** | Final celebration | Total score, all pairs, rewards |
| **Hunter's Journal** | Collection view | All antonyms learned |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows hand |
| Catch word | Pinch (index + thumb) | Net appears, word caught |
| Tag first word | Pinch on word A | Word glows, timer starts |
| Catch opposite | Pinch on word B (within window) | Both captured, celebration |
| Use freeze | Click freeze button | Slow motion for 3 seconds |
| Touch catch (fallback) | Tap word | Same catch feedback |

### CV Control Details
- **Hand tracking:** Index finger tip position
- **Pinch threshold:** < 0.05 normalized distance
- **Catch detection:** Raycast from finger to creature collider
- **Catch radius:** 60px for generous catching
- **Tag duration:** 8s (easy) → 3s (expert)
- **Freeze duration:** 3 seconds slow-motion

---

## 10. Core Mechanics

### Antonym Word Bank Structure
```typescript
interface AntonymPair {
  id: string;
  wordA: string;          // "hot"
  wordB: string;          // "cold"
  emojiA: string;         // 🔥
  emojiB: string;         // ❄️
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'sensory' | 'size' | 'action' | 'concept' | 'time';
  explanation?: string;   // "Hot and cold are opposite temperatures"
}

const ANTONYM_PAIRS: AntonymPair[] = [
  { id: '1', wordA: 'hot', wordB: 'cold', emojiA: '🔥', emojiB: '❄️', 
    difficulty: 'easy', category: 'sensory', explanation: 'Hot and cold are opposite temperatures' },
  { id: '2', wordA: 'big', wordB: 'small', emojiA: '🐘', emojiB: '🐁', 
    difficulty: 'easy', category: 'size', explanation: 'Big and small are opposite sizes' },
  // ... more pairs
];
```

### Movement System
```typescript
// Word creature follows movement pattern
function updateCreaturePosition(
  creature: WordCreature,
  deltaTime: number,
  difficulty: Difficulty
): void {
  const speed = getSpeedForDifficulty(difficulty);
  
  switch (creature.movementPattern) {
    case 'linear':
      creature.x += creature.directionX * speed * deltaTime;
      break;
    case 'zigzag':
      creature.x += creature.directionX * speed * deltaTime;
      creature.y += Math.sin(creature.x * 0.01) * speed * deltaTime;
      break;
    case 'curved':
      creature.x += creature.directionX * speed * deltaTime;
      creature.directionY += 0.1; // Curving
      creature.y += creature.directionY * speed * deltaTime;
      break;
  }
  
  // Check escape
  if (isOffScreen(creature)) {
    creature.escaped = true;
    triggerEscapePenalty();
  }
}
```

### Catch Detection
```typescript
function checkCatch(
  handPos: Vector2,
  creatures: WordCreature[]
): WordCreature | null {
  for (const creature of creatures) {
    const distance = getDistance(handPos, creature.position);
    if (distance < CATCH_RADIUS && !creature.caught) {
      return creature;
    }
  }
  return null;
}

// Handle pair catching
function handleCatch(creature: WordCreature): void {
  if (!gameState.taggedCreature) {
    // First catch - tag this creature
    gameState.taggedCreature = creature;
    gameState.tagTimer = getTagWindowForDifficulty();
    creature.isTagged = true;
    playTagSound();
  } else {
    // Second catch - check if opposite
    if (isOppositePair(gameState.taggedCreature, creature)) {
      capturePair(gameState.taggedCreature, creature);
    } else {
      // Wrong pair - untag and penalty
      gameState.taggedCreature.isTagged = false;
      gameState.taggedCreature = null;
      playWrongSound();
    }
  }
}
```

### Capture Animation Sequence
```typescript
async function animateCapture(creatureA: WordCreature, creatureB: WordCreature): Promise<void> {
  // Phase 1: Net appears over both creatures
  await animate({
    targets: [creatureA, creatureB],
    scale: 0.8,
    duration: 200,
    easing: 'easeOutQuad'
  });
  
  // Phase 2: Net capture effect
  showCaptureNet(creatureA.position, creatureB.position);
  playCaptureSound();
  
  // Phase 3: Pronounce both words
  speak(`${creatureA.word}... ${creatureB.word}`);
  await delay(500);
  speak("These words are opposites!");
  
  // Phase 4: Creatures caught animation
  await animate({
    targets: [creatureA, creatureB],
    y: -100, // Move up off screen
    opacity: 0,
    duration: 300,
    easing: 'easeInQuad'
  });
  
  // Phase 5: Score and streak update
  updateScore(creatureA, creatureB);
  incrementStreak();
}
```

### Scoring Formula
```
Base Points: 100 per captured pair
Speed Bonus: max(0, 50 - captureTimeSeconds × 5)
Streak Multiplier:
  - 1-2 pairs: 1.0x
  - 3-5 pairs: 1.2x
  - 6+ pairs: 1.5x
Escape Penalty: difficulty-based (-5 easy, -10 medium, -15 hard, -20 expert)

Total = (Base + Speed - EscapePenalty) × StreakMultiplier
```

### Streak System
- Increments on each successful pair capture
- Resets to 0 on wrong match or escape
- Visual spark indicator with number
- Multiplier shown during score calculation
- Milestone celebration at 3, 5, and 8 streak

---

## 11. Rules

- **Start:** Select difficulty, click Start
- **Objective:** Capture all opposite word pairs by catching both words
- **Allowed:**
  - Catch any word creature
  - Tag first word, then catch opposite within time window
  - Use freeze power-up (limited uses)
  - Touch/mouse fallback available
  - Request word pronunciation on capture
- **Restricted:**
  - Cannot capture non-opposite pairs (wrong match)
  - Cannot catch already caught words
  - Time window expires if opposite not caught quickly
- **Scoring:** Based on speed + streak + escapes
- **Wrong match:** Tagged word untags, no streak penalty
- **Escape:** Word leaves screen, -10 points
- **Win condition:** Capture all opposite pairs

### Difficulty-Specific Rules
| Difficulty | Pairs | Speed | Catch Window | Escape Penalty |
|------------|-------|-------|--------------|----------------|
| Easy | 6 pairs | Slow | 8 seconds | -5 points |
| Medium | 8 pairs | Medium | 6 seconds | -10 points |
| Hard | 10 pairs | Fast | 4 seconds | -15 points |
| Expert | 12 pairs | Very fast | 3 seconds | -20 points |

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Word Creatures | Antonym pairs to catch | Each new round |
| Tagged Indicator | Shows which word is tagged | On first catch |
| Timer Bar | Time to catch opposite | After first catch |
| Progress | Pairs captured / total | After each capture |
| Score | Current points | After each capture |
| Streak | Consecutive successful captures | On success |
| Freeze Button | Slow-motion power-up | Limited uses |
| Escape Warning | Word near screen edge | When applicable |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 380    Pairs: 3 of 8        │
├─────────────────────────────────────┤
│                                     │
│    🦗                               │
│  ┌─────┐                            │
│  │ HOT │  ←── Tagged!               │
│  │  🔥 │      ⏱️⏱️⏱️⏱️               │
│  └─────┘                            │
│                                     │
│              [Catch opposite!]      │
│                                     │
│                            🐞       │
│                          ┌─────┐    │
│                          │COLD │    │
│                          │  ❄️ │    │
│                          └─────┘    │
│                                     │
├─────────────────────────────────────┤
│  🔥 Streak: 3    [Freeze ❄️ x2]     │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Pair Captured)
- Satisfying "swoosh" net capture sound
- Net appears over both creatures
- Success chime
- Words pronounced: "Hot... Cold!"
- Explanation spoken: "These words are opposites!"
- Creatures animate up off screen
- Points float up with "+150" animation
- Streak counter increments with spark animation
- Haptic success pulse

### Tag Effect
- Tagged creature glows yellow
- Timer bar appears
- "Catch the opposite!" voice prompt
- Tagged creature slows slightly

### Failure (Wrong Match)
- Tagged word untags with "whoosh"
- Incorrect creature shakes briefly
- Soft "not opposites" tone
- Voice: "Those aren't opposites, try again!"
- No streak penalty (encouragement-focused)

### Escape
- Word creature exits screen
- "Escaped!" text appears
- -10 points shown
- New creature appears to replace

### Streak Feedback
| Streak | Visual | Sound | Effect |
|--------|--------|-------|--------|
| 1-2 | Small spark | Standard | - |
| 3-5 | Hunter badge | Rising scale | 1.2x multiplier |
| 6-8 | Trophy icon | Fanfare | 1.5x multiplier |
| 9+ | Crown badge | Epic music | 1.5x + special title |

### Milestone Celebrations
- **3 streak:** "Quick Catcher!" badge
- **5 streak:** "Antonym Hunter!" badge
- **8 streak:** "Master Tracker!" badge with gold effects
- **Level complete:** Hunter's horn celebration

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Pair | 100 points |
| Speed Bonus | Up to 50 points (faster = more) |
| Streak Multiplier | 1.0x → 1.2x → 1.5x |
| Escape Penalty | -10 per escaped word |

### Example Score Calculation
```
Pair 1 (3s capture): (100 + 35 + 0) × 1.0 = 135
Pair 2 (2s capture): (100 + 40 + 0) × 1.0 = 140
Pair 3 (4s capture): (100 + 30 - 10) × 1.2 = 144
Pair 4 (2s capture): (100 + 40 + 0) × 1.2 = 168
Total: 587 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- `bug-net` (20% chance) - Thematic for hunting game
- `compass` (15% chance) - Explorer reward
- `star-silver` (12% chance) - Standard reward
- `trophy-hunter` (5% chance at 80%+ accuracy) - Master hunter

### Easter Eggs
- **Speed Catcher:** Capture pair in under 2 seconds
  - Reward: Lightning Net sticker
  - Hint: "Catch at lightning speed!"
- **Perfect Hunt:** Complete with no escapes
  - Reward: Perfect Hunter Badge
  - Hint: "Don't let any escape!"
- **Category Master:** Capture all pairs in single category
  - Reward: Category Trophy
  - Hint: "Master all opposites in a category!"
- **Antonym Expert:** Complete Expert difficulty
  - Reward: Master Tracker Trophy
  - Hint: "Conquer the fastest opposites!"

### Progression
- Hunter's journal shows all antonyms learned
- Categories unlock as you complete previous ones
- Personal best tracking per difficulty
- Capture speed records
- Total antonyms learned counter

---

## 15. End States

### Pair Captured Successfully
- Net capture animation plays
- Both words pronounced via TTS
- Explanation spoken
- Score calculated and displayed
- Streak incremented
- Creatures removed from field
- Next pair spawns

### Level Complete
- Level stats displayed (pairs captured, escapes, score)
- All captured pairs displayed
- Category progress updated
- Bonus points for completion
- Unlock notification (if applicable)
- Option to continue or view journal

### Game Complete
- Final score with breakdown
- Total pairs captured
- Rewards earned display
- Hunter's journal view option
- Category completion status
- Play Again / Change Difficulty / Exit

### Early Exit
- Progress saved up to current pair
- Partial rewards based on completion percentage
- Return to menu with option to resume

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking Catch)
Full hand tracking with pinch-to-catch and timed pair capture as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click/tap to catch words
- Same tag-and-catch mechanics
- Same timing windows
- Accessible for all devices

### Mode C: Freeze Focus
- Unlimited freeze power
- Focus on learning, not speed
- Longer catch windows
- Educational emphasis

### Mode D: Speed Challenge
- Shorter catch windows
- Faster word movement
- Bonus for ultra-fast captures
- For advanced players

### Mode E: Category Hunt
- Only antonyms from single category
- Themed backgrounds per category
- Category mastery challenge

### Mode F: Team Hunt
- Two players cooperate
- Each player catches one word
- Shared score and celebration

---

## 17. Improvement Opportunities

### Low Cost
- Add more antonym pairs (target: 80+)
- Catch sound variations
- Background music (adventure theme)
- Achievement badges for milestones
- Word pronunciation speed options
- Category filtering in journal

### Medium Effort
- Freeze power-up upgrades
- Custom movement patterns
- Seasonal hunt themes (winter, jungle, ocean)
- Multiplayer racing mode
- Difficulty fine-tuning per pair

### Ambitious
- AI-generated antonym validation
- User-created creature designs
- AR mode with room-scale hunting
- Multi-language antonym support
- Integration with reading curriculum
- Parent/teacher progress dashboard
- Boss word creatures

---

## 18. Content Model

### Antonym Pair Data Structure
```typescript
interface AntonymPair {
  id: string;
  wordA: string;
  wordB: string;
  emojiA: string;
  emojiB: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'sensory' | 'size' | 'action' | 'concept' | 'time' | 'direction';
  explanation: string;
}

// Antonym word bank
const ANTONYM_PAIRS: AntonymPair[] = [
  // Easy - Sensory
  { id: '1', wordA: 'hot', wordB: 'cold', emojiA: '🔥', emojiB: '❄️', 
    difficulty: 'easy', category: 'sensory', explanation: 'Hot and cold are opposite temperatures' },
  { id: '2', wordA: 'loud', wordB: 'quiet', emojiA: '🔊', emojiB: '🔇', 
    difficulty: 'easy', category: 'sensory', explanation: 'Loud and quiet are opposite sounds' },
  { id: '3', wordA: 'light', wordB: 'dark', emojiA: '💡', emojiB: '🌑', 
    difficulty: 'easy', category: 'sensory', explanation: 'Light and dark are opposite brightness' },
  { id: '4', wordA: 'happy', wordB: 'sad', emojiA: '😊', emojiB: '😢', 
    difficulty: 'easy', category: 'sensory', explanation: 'Happy and sad are opposite feelings' },
  
  // Easy - Size
  { id: '5', wordA: 'big', wordB: 'small', emojiA: '🐘', emojiB: '🐁', 
    difficulty: 'easy', category: 'size', explanation: 'Big and small are opposite sizes' },
  { id: '6', wordA: 'tall', wordB: 'short', emojiA: '🦒', emojiB: '🐹', 
    difficulty: 'easy', category: 'size', explanation: 'Tall and short are opposite heights' },
  { id: '7', wordA: 'huge', wordB: 'tiny', emojiA: '🐋', emojiB: '🐜', 
    difficulty: 'easy', category: 'size', explanation: 'Huge and tiny are opposite sizes' },
  
  // Easy - Actions
  { id: '8', wordA: 'open', wordB: 'close', emojiA: '🚪', emojiB: '🚪', 
    difficulty: 'easy', category: 'action', explanation: 'Open and close are opposite actions' },
  { id: '9', wordA: 'up', wordB: 'down', emojiA: '⬆️', emojiB: '⬇️', 
    difficulty: 'easy', category: 'direction', explanation: 'Up and down are opposite directions' },
  { id: '10', wordA: 'fast', wordB: 'slow', emojiA: '🐆', emojiB: '🐢', 
    difficulty: 'easy', category: 'action', explanation: 'Fast and slow are opposite speeds' },
  
  // Medium - Actions
  { id: '11', wordA: 'push', wordB: 'pull', emojiA: '👋', emojiB: '🤚', 
    difficulty: 'medium', category: 'action', explanation: 'Push and pull are opposite forces' },
  { id: '12', wordA: 'give', wordB: 'take', emojiA: '🎁', emojiB: '✋', 
    difficulty: 'medium', category: 'action', explanation: 'Give and take are opposite actions' },
  { id: '13', wordA: 'start', wordB: 'stop', emojiA: '▶️', emojiB: '⏹️', 
    difficulty: 'medium', category: 'action', explanation: 'Start and stop are opposite actions' },
  { id: '14', wordA: 'win', wordB: 'lose', emojiA: '🏆', emojiB: '😔', 
    difficulty: 'medium', category: 'concept', explanation: 'Win and lose are opposite outcomes' },
  
  // Medium - Concepts
  { id: '15', wordA: 'same', wordB: 'different', emojiA: '👯', emojiB: '🎭', 
    difficulty: 'medium', category: 'concept', explanation: 'Same and different are opposites' },
  { id: '16', wordA: 'full', wordB: 'empty', emojiA: '🥤', emojiB: '🥛', 
    difficulty: 'medium', category: 'concept', explanation: 'Full and empty are opposite amounts' },
  { id: '17', wordA: 'clean', wordB: 'dirty', emojiA: '✨', emojiB: '😷', 
    difficulty: 'medium', category: 'concept', explanation: 'Clean and dirty are opposites' },
  
  // Hard - Time/Direction
  { id: '18', wordA: 'early', wordB: 'late', emojiA: '🌅', emojiB: '🌙', 
    difficulty: 'hard', category: 'time', explanation: 'Early and late are opposite times' },
  { id: '19', wordA: 'before', wordB: 'after', emojiA: '⏮️', emojiB: '⏭️', 
    difficulty: 'hard', category: 'time', explanation: 'Before and after are opposite orders' },
  { id: '20', wordA: 'left', wordB: 'right', emojiA: '⬅️', emojiB: '➡️', 
    difficulty: 'medium', category: 'direction', explanation: 'Left and right are opposite sides' },
  
  // Hard - Abstract
  { id: '21', wordA: 'always', wordB: 'never', emojiA: '♾️', emojiB: '🚫', 
    difficulty: 'hard', category: 'concept', explanation: 'Always and never are opposite frequencies' },
  { id: '22', wordA: 'everything', wordB: 'nothing', emojiA: '🌌', emojiB: '⚫', 
    difficulty: 'hard', category: 'concept', explanation: 'Everything and nothing are opposites' },
  { id: '23', wordA: 'remember', wordB: 'forget', emojiA: '🧠', emojiB: '💭', 
    difficulty: 'hard', category: 'concept', explanation: 'Remember and forget are opposites' },
  
  // Expert
  { id: '24', wordA: 'difficult', wordB: 'easy', emojiA: '🤯', emojiB: '👌', 
    difficulty: 'expert', category: 'concept', explanation: 'Difficult and easy are opposites' },
  { id: '25', wordA: 'dangerous', wordB: 'safe', emojiA: '⚠️', emojiB: '🛡️', 
    difficulty: 'expert', category: 'concept', explanation: 'Dangerous and safe are opposites' },
];
```

### Level Configuration
```typescript
interface LevelConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  pairCount: number;
  categories: string[];
  catchWindow: number; // seconds
  movementSpeed: number;
  showExplanation: boolean;
}

const LEVELS: LevelConfig[] = [
  { difficulty: 'easy', pairCount: 6, categories: ['sensory', 'size'], catchWindow: 8, movementSpeed: 1.0, showExplanation: true },
  { difficulty: 'medium', pairCount: 8, categories: ['sensory', 'size', 'action'], catchWindow: 6, movementSpeed: 1.5, showExplanation: true },
  { difficulty: 'hard', pairCount: 10, categories: ['all'], catchWindow: 4, movementSpeed: 2.0, showExplanation: false },
  { difficulty: 'expert', pairCount: 12, categories: ['all'], catchWindow: 3, movementSpeed: 2.5, showExplanation: false },
];
```

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `AntonymHunt.tsx` | Main React component | 450-550 |
| `antonymHuntLogic.ts` | Pure game logic functions | 300-350 |
| `antonymHunt.types.ts` | TypeScript interfaces | 70-90 |
| `antonymPairsBank.ts` | Word pair data | 150-200 |

### Key Components in AntonymHunt.tsx
- `AntonymHuntContent` - Core game implementation
- `AntonymHunt` (default) - GameShell wrapper
- `WordCreature` - Animated creature carrying word
- `CaptureNet` - Net visual effect component
- `MovementTrail` - Visual path behind creatures
- `HuntingGround` - Background with wilderness theme
- `HuntersJournal` - Collection view component
- `HandCursor` - Custom cursor with catch states

### Logic Functions (antonymHuntLogic.ts)
| Function | Purpose |
|----------|---------|
| `getPairsForLevel()` | Select appropriate pairs for difficulty |
| `createWordCreatures()` | Initialize creatures with movement patterns |
| `updateCreatureMovement()` | Handle creature physics |
| `checkCatch()` | Detect when creature is caught |
| `isOppositePair()` | Verify if two creatures are opposites |
| `animateCapture()` | Trigger capture sequence |
| `calculateScore()` | Compute capture score |
| `spawnCreature()` | Create new creature when needed |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Word pronunciation and explanations
- `useStreakTracking` - Streak management
- `useAnimationFrame` - Smooth creature movement

### State Management
```typescript
interface GameState {
  creatures: WordCreature[];
  capturedPairs: CapturedPair[];
  score: number;
  streak: number;
  pairsCaptured: number;
  totalPairs: number;
  gameStatus: 'menu' | 'playing' | 'capturing' | 'complete';
  taggedCreature: WordCreature | null;
  tagTimer: number;
  freezeCharges: number;
  isFrozen: boolean;
  handPosition: { x: number; y: number };
  isPinching: boolean;
}
```

### Dependencies
- MediaPipe hand tracking
- Framer Motion for animations
- Canvas or DOM for creature rendering
- TTS engine for pronunciation

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Optimal movement speed | 1.0-2.5x scaling | Medium |
| Catch window timing | 3-8 seconds | Medium |
| Word bank size needed | 40+ pairs minimum | High |
| Freeze duration | 3 seconds feels right | Low |
| Catch radius size | 60px for generous catch | Medium |
| Creature size | 80px for visibility | High |
| Spawn rate timing | 2 seconds between pairs | Medium |
| Accessibility for motor disabilities | Freeze power helps | High |

---

## 21. Implementation Notes

### Strengths to Build On
- LetterCatcher provides falling/catching patterns
- Hand tracking tap infrastructure exists
- TTS provides excellent word reinforcement
- Streak tracking system available
- EmojiMatch shows selection mechanics
- OppositesAttract provides antonym patterns

### Architecture Patterns
- Separate movement physics from rendering
- Use refs for position updates (60fps)
- Debounce catch detection
- Animate with CSS transforms
- Use GameShell for consistent game wrapper

### Testing Considerations
- Test catch feel with various hand sizes
- Verify timing windows are fair
- Test word bank randomization (no repeats)
- Validate with target age group for speed
- Test freeze power doesn't break flow

### Performance Notes
- Pool creature objects to reduce garbage
- Optimize collision detection (spatial grid)
- Limit particle effects during busy scenes
- Preload audio for upcoming words

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes with cursor visible
- [ ] Pinch gesture catches word creatures accurately
- [ ] Tag system works (first catch tags, second catches opposite)
- [ ] Catch window timing works correctly
- [ ] Creatures move at appropriate speeds
- [ ] Match detection works within radius
- [ ] Capture animation plays successfully
- [ ] Both words pronounced via TTS after capture
- [ ] Explanation spoken after capture (if enabled)
- [ ] Four difficulty levels work
- [ ] Word bank provides appropriate antonym pairs
- [ ] Freeze power-up slows time correctly
- [ ] Score calculates with bonuses and multipliers
- [ ] Streak multiplier applies correctly
- [ ] Escape penalty applies correctly
- [ ] Touch/mouse fallback works
- [ ] Hunter's journal tracks learned pairs
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, capture all pairs
- [ ] Play medium mode, verify shorter catch window
- [ ] Play hard mode, verify faster movement
- [ ] Play expert mode, verify challenge level
- [ ] Build 5+ streak, verify multiplier
- [ ] Use freeze power, verify slow-motion
- [ ] Let word escape, verify penalty
- [ ] Complete level, verify progress tracking
- [ ] View hunter's journal, verify all pairs recorded

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Pinch catches word creature consistently
- [ ] Tag system works correctly
- [ ] Catch window times accurately
- [ ] No hand = safe state (pause or continue)

### Fallback Tests
- [ ] Tap to catch works
- [ ] Click to catch with mouse works
- [ ] Touch works on tablet
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid catch attempts (no crash)
- [ ] Multiple creatures on screen (performance)
- [ ] Hand lost mid-tag (tag expires)
- [ ] Word bank exhausted (loop or end)
- [ ] Category with no pairs (fallback to all)

### Performance
- [ ] 60fps during movement
- [ ] Smooth creature animations
- [ ] No memory leaks in spawn loop
- [ ] Fast creature loading between spawns

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/LetterCatcher.tsx`, `src/frontend/src/pages/EmojiMatch.tsx`
- Opposites Spec: `docs/games/specs/opposites-attract.md`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- Streak System: `src/frontend/src/hooks/useStreakTracking.ts`
