# Voice Stories - Game Specification

## Overview
**Game ID**: `voice-stories`
**Educational Focus**: Listening comprehension, story recall, speech recognition
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/voiceStoriesLogic.ts`

## Game Description
Children listen to short stories with emoji illustrations, then answer comprehension questions. Stories are read aloud using text-to-speech, building listening skills and narrative understanding.

## Educational Goals
1. Listening comprehension
2. Story recall and retention
3. Attention and focus
4. Vocabulary development
5. Understanding narrative structure

## Game Logic

### Interfaces

```typescript
interface StoryLine {
  text: string;  // Story text
  emoji: string; // Visual illustration emoji
}

interface Story {
  title: string;        // Story title
  lines: StoryLine[];   // Array of story segments
}

interface LevelConfig {
  level: number;        // Level number (1-3)
  storyLength: number;  // Number of lines to present
}
```

### Stories (3 total)

#### The Little Star
| Line | Text | Emoji |
|------|------|-------|
| 1 | "Once upon a time, there was a little star." | ⭐ |
| 2 | "The star lived in the night sky." | 🌙 |
| 3 | "Every night, the star shone very bright." | ✨ |
| 4 | "One day, a little girl wished upon the star." | 👧 |
| 5 | "The star granted her wish!" | 💫 |

#### The Friendly Dragon
| Line | Text | Emoji |
|------|------|-------|
| 1 | "There was a dragon named Draco." | 🐉 |
| 2 | "Draco was not like other dragons." | 🤔 |
| 3 | "He did not breathe fire." | 🚫🔥 |
| 4 | "He made friends with the villagers." | 🏘️ |
| 5 | "They all lived happily ever after." | ❤️ |

#### The Magic Garden
| Line | Text | Emoji |
|------|------|-------|
| 1 | "Lily found a magic garden." | 🌸 |
| 2 | "The flowers could talk!" | 🌺 |
| 3 | "A butterfly showed her around." | 🦋 |
| 4 | "She learned the secret of the garden." | 🔮 |
| 5 | "Now she visits every day." | 🌻 |

### Level Configuration

| Level | storyLength | Description |
|-------|-------------|-------------|
| 1 | 3 lines | Short stories for beginners |
| 2 | 4 lines | Medium-length stories |
| 3 | 5 lines | Full stories for advanced listeners |

### Core Functions

#### `getStoriesForLevel(level: number): Story[]`
Returns stories truncated to the specified length.

**Behavior**:
1. Gets level config (defaults to level 1)
2. Shuffles all stories (random selection)
3. Returns 1 random story
4. Truncates lines to `storyLength` for that level

**Story Selection**:
- Randomly selected from 3 available stories
- Different story each time (with high probability)
- Stories are shuffled using `Math.random() - 0.5`

## Game Progression

### Story Length Progression
| Level | Lines | Total Duration (approx) |
|-------|-------|-------------------------|
| 1 | 3 lines | ~15-20 seconds |
| 2 | 4 lines | ~20-25 seconds |
| 3 | 5 lines | ~25-30 seconds |

### Listening Stamina Building
- **Level 1**: Short attention span (3 lines)
- **Level 2**: Building focus (4 lines)
- **Level 3**: Sustained attention (5 lines)

### Story Structure (consistent across levels)
1. **Introduction**: "Once upon a time" / "There was" / Character introduction
2. **Development**: Problem or situation
3. **Action**: What happens next
4. **Climax**: Turning point (levels 2-3)
5. **Resolution**: Happy ending (level 3)

## Technical Notes

### Story Truncation
```typescript
lines: s.lines.slice(0, config.storyLength)
```
- Level 1: First 3 lines only
- Level 2: First 4 lines
- Level 3: All 5 lines (complete story)

### Random Selection
```typescript
const shuffled = [...STORIES].sort(() => Math.random() - 0.5);
return shuffled.slice(0, 1).map(s => ({
  ...s,
  lines: s.lines.slice(0, config.storyLength),
}));
```

### Emoji Support
- Each line has exactly one emoji
- Emojis provide visual context
- Supports pre-readers and emergent readers
- Universal visual language

### Edge Cases
- Invalid level → Falls back to level 1 config
- Empty story array → Returns empty array (error case)
- storyLength > actual lines → Returns all available lines

## Design Decisions

### Three Stories
- Small pool allows mastery
- Stories are distinct themes (space, fantasy, nature)
- Children can revisit favorites
- Reduces decision paralysis

### Emoji Illustrations
- No need for external image assets
- Instant visual feedback
- Consistent across platforms
- Culturally universal

### Progressive Length
- Builds listening stamina gradually
- Each level adds one more line
- Prevents overwhelming young children
- Completing full story is rewarding

### Positive Themes
All stories feature:
- Friendly characters
- Happy endings
- No conflict resolution needed
- Wonder and magic
- Safe, comforting content

## Educational Design

### Story Genres
| Story | Genre | Theme |
|-------|-------|-------|
| The Little Star | Fantasy | Wishes, magic |
| The Friendly Dragon | Adventure | Friendship, acceptance |
| The Magic Garden | Nature | Discovery, wonder |

### Listening Skills
- **Sustained attention**: Longer stories at higher levels
- **Recall**: Remembering story details
- **Sequencing**: Understanding order of events
- **Comprehension**: Following narrative arc

### Vocabulary Building
- Simple sentence structures
- Repetition for emphasis
- Context clues from emojis
- Age-appropriate words (3-6 years)

### Pre-Literacy Skills
- Left-to-right text progression
- Story has beginning, middle, end
- Characters and plot
- Emotional engagement

### Speech Integration
The game is designed to work with text-to-speech:
- Stories are read aloud
- Child listens, not reads
- Builds auditory processing
- Supports diverse reading levels

### Comprehension Questions
After listening, children can be asked:
- "What was the star's name?" (recall)
- "What did Draco do differently?" (detail)
- "Where did Lily go?" (setting)
- "How did the story end?" (sequencing)

Note: Question implementation varies by game layer; logic layer provides story content only.
