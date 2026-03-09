# Shadow Puppet - Game Specification

## Overview
**Game ID**: `shadow-puppet`
**Educational Focus**: Fine motor skills, hand-eye coordination, creative expression
**Target Age**: 3-7 years
**Code Location**: `src/frontend/src/games/shadowPuppetLogic.ts`

## Game Description
Children create shadow puppet shapes with their hands, detected through camera/hand tracking. The game encourages creative expression and fine motor control through imitating animal shapes.

## Educational Goals
1. Fine motor skills (finger positioning)
2. Hand-eye coordination
3. Creative expression
4. Following visual instructions
5. Animal recognition

## Game Logic

### Interfaces

```typescript
interface PuppetShape {
  id: string;          // Unique identifier
  name: string;        // Shape name (e.g., "Dog")
  emoji: string;       // Visual emoji representation
  description: string; // Encouraging instruction text
  difficulty: 1 | 2 | 3; // Difficulty rating
  fingerPattern?: number[]; // Optional: [thumb, index, middle, ring, pinky]
}

interface LevelConfig {
  level: number;        // Level number (1-3)
  shapesPerRound: number; // How many shapes to complete
  timePerShape: number;    // Seconds per shape
  passThreshold: number;   // Required correct to pass
}
```

### Puppet Shapes (15 total)

#### Difficulty 1 (5 shapes) - Simple
| ID | Name | Emoji | Description |
|----|------|-------|-------------|
| dog | Dog | 🐕 | "Make a dog face with your hand!" |
| cat | Cat | 🐱 | "Meow! Make cat ears!" |
| rabbit | Rabbit | 🐰 | "Hop hop! Rabbit ears!" |
| bird | Bird | 🐦 | "Flap your wings!" |
| duck | Duck | 🦆 | "Quack quack!" |

#### Difficulty 2 (5 shapes) - Medium
| ID | Name | Emoji | Description |
|----|------|-------|-------------|
| wolf | Wolf | 🐺 | "Howl at the moon!" |
| bear | Bear | 🐻 | "Growl like a bear!" |
| lion | Lion | 🦁 | "King of the jungle!" |
| eagle | Eagle | 🦅 | "Soar through the sky!" |
| monkey | Monkey | 🐵 | "Ooh ooh ah ah!" |

#### Difficulty 3 (5 shapes) - Complex
| ID | Name | Emoji | Description |
|----|------|-------|-------------|
| butterfly | Butterfly | 🦋 | "Flutter your wings!" |
| spider | Spider | 🕷️ | "Creepy crawly!" |
| scorpion | Scorpion | 🦂 | "Watch out for the tail!" |
| crab | Crab | 🦀 | "Side to side!" |
| octopus | Octopus | 🐙 | "Lots of wiggle arms!" |

### Level Configuration

| Level | shapesPerRound | timePerShape | passThreshold | Available Shapes |
|-------|----------------|--------------|---------------|------------------|
| 1 | 4 | 15s | 3 | Difficulty 1 (5 shapes) |
| 2 | 6 | 12s | 4 | Difficulty 1-2 (10 shapes) |
| 3 | 8 | 10s | 6 | Difficulty 1-3 (15 shapes) |

### Core Functions

#### `getShapesForLevel(level: number): PuppetShape[]`
Returns all shapes with difficulty ≤ level.

**Behavior**:
- Level 1: Returns 5 shapes (difficulty 1 only)
- Level 2: Returns 10 shapes (difficulty 1-2)
- Level 3: Returns all 15 shapes

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `getRandomShape(level: number, usedShapes?: string[]): PuppetShape`
Gets a random shape for the specified level.

**Parameters**:
- `level`: Difficulty level (1-3)
- `usedShapes`: IDs to avoid (prevents repetition)

**Behavior**:
1. Gets available shapes for level
2. Filters out used shapes
3. Randomly selects from remaining
4. Falls back to full pool if all used

#### `speakShape(shape: PuppetShape): void`
Speaks the shape name and description using text-to-speech.

**Speech Parameters**:
- Rate: 0.8 (slower for children)
- Pitch: 1.1 (friendly tone)
- Text: "{name}! {description}"

## Game Progression

### Difficulty Scaling
| Dimension | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|
| Shapes | 5 | 10 | 15 |
| Per Round | 4 | 6 | 8 |
| Time/Shape | 15s | 12s | 10s |
| Pass Rate | 75% | 67% | 75% |

### Time Pressure
- Level 1: 15 seconds per shape (leisurely)
- Level 2: 12 seconds per shape (moderate)
- Level 3: 10 seconds per shape (challenging)

### Shape Complexity
- **Difficulty 1**: Simple hand poses (ears, basic faces)
- **Difficulty 2**: More detailed animals (multiple features)
- **Difficulty 3**: Complex poses (multiple fingers, specific positions)

## Technical Notes

### Hand Detection Integration
The `fingerPattern` property (optional) stores finger positions:
- Array of 5 values: [thumb, index, middle, ring, pinky]
- 1 = extended/finger up
- 0 = curled/finger down
- Used by computer vision system to detect poses

### Speech Synthesis
Uses Web Speech API (`SpeechSynthesisUtterance`):
- Gracefully handles unsupported browsers
- Provides audio feedback for non-readers
- Rate and pitch optimized for children

### Random Shape Selection
```typescript
const available = getShapesForLevel(level).filter(s => !usedShapes.includes(s.id));
const pool = available.length > 0 ? available : getShapesForLevel(level);
return pool[Math.floor(Math.random() * pool.length)];
```

### Anti-Repetition
- Tracks used shape IDs per round
- Filters out already-completed shapes
- Resets when round starts

### Edge Cases
- All shapes used → Falls back to full pool
- Invalid level → Returns level 1 config
- Speech unavailable → Function silently does nothing

## Design Decisions

### Animal Theme
- Universal appeal to children
- Clear visual associations
- Emojis provide instant recognition
- Sound associations (meow, woof, etc.)

### Progressive Complexity
- Starts with familiar animals (dog, cat)
- Adds complexity gradually
- Difficulty 3 challenges skilled children
- Each level builds on previous

### Time Limits
- Reasonable for toddlers (10-15 seconds)
- Decreases with level (skill development)
- Not punitive (pass threshold achievable)
- Encourages without frustrating

### Speech Feedback
- Helps non-readers
- Reinforces shape names
- Encouraging descriptions
- Multi-sensory learning

## Educational Design

### Fine Motor Skills
- Finger isolation (moving one finger at a time)
- Hand positioning (specific poses)
- Muscle memory (repeating shapes)
- Precision (accurate pose matching)

### Following Instructions
- Verbal descriptions
- Visual emoji prompts
- Step-by-step guidance
- Immediate feedback

### Creativity
- Open-ended interpretation
- Multiple ways to make shapes
- Personal expression
- Imagination engagement

### Confidence Building
- Starts easy (5 simple shapes)
- Achievable pass thresholds
- Positive reinforcement
- Progressive challenge

### Speech Integration
| Component | Purpose |
|-----------|---------|
| Name | Teaches vocabulary |
| Description | Encourages action |
| Rate 0.8 | Slower for comprehension |
| Pitch 1.1 | Friendly tone |
