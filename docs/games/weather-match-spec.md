# Weather Match - Game Specification

## Overview
**Game ID**: `weather-match`
**Educational Focus**: Weather recognition, clothing associations, practical knowledge
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/weatherMatchLogic.ts`

## Game Description
Children match weather conditions to appropriate clothing items. This builds understanding of cause-and-effect relationships and practical life skills.

## Educational Goals
1. Weather recognition
2. Clothing associations
3. Practical reasoning
4. Visual matching
5. Vocabulary building

## Game Logic

### Interfaces

```typescript
interface Weather {
  name: string;   // Display name (Sunny, Rainy, etc.)
  emoji: string;  // Emoji representation
  icon: string;   // Icon identifier for UI
}

interface Clothing {
  name: string;   // Clothing item name
  emoji: string;  // Emoji representation
}

interface LevelConfig {
  level: number;     // Level number (1-3)
  pairCount: number; // Number of pairs to match
}
```

### Weather Types (6 types)

| Name | Emoji | Icon | Clothing Options |
|------|-------|------|------------------|
| Sunny | ☀️ | sun | Sunglasses, Hat |
| Rainy | 🌧️ | cloud-rain | Raincoat, Umbrella |
| Snowy | ❄️ | snowflake | Coat, Scarf |
| Windy | 💨 | wind | Jacket |
| Cloudy | ☁️ | cloud | Light Jacket |
| Stormy | ⛈️ | cloud-lightning | Raincoat |

### Level Configuration

| Level | pairCount | Description |
|-------|-----------|-------------|
| 1 | 2 | Introduction: 2 weather types |
| 2 | 3 | Medium: 3 weather types |
| 3 | 4 | Challenge: 4 weather types |

### Core Functions

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `generateGame(level: number): Array<{weather: Weather, clothing: Clothing}>`
Generates weather-clothing pairs for a level.

**Behavior**:
1. Gets level config
2. Shuffles all 6 weather types
3. Selects first `pairCount` weather types
4. For each weather, randomly picks one matching clothing item
5. Returns array of {weather, clothing} pairs

**Random Selection**:
- Weather types are shuffled each time
- Different subset each game (with high probability)
- Clothing randomly selected from 1-2 options per weather

#### `calculateScore(streak: number, level: number): number`
Calculates score for a correct match.

**Scoring**:
- Base: 15 points
- Streak bonus: Up to +15 points
- Multiplier: Level 1 (1×), Level 2 (1.5×), Level 3 (2×)
- Max per match: 60 points (level 3, streak 5+)

**Note**: This function is deprecated. Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.high`.

## Game Progression

### Pair Count Progression

| Level | Pairs | Weather Pool | Challenge |
|-------|-------|--------------|-----------|
| 1 | 2 | 2 of 6 | Introduction |
| 2 | 3 | 3 of 6 | Medium |
| 3 | 4 | 4 of 6 | Challenge |

### Difficulty Scaling

| Dimension | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|
| Pairs | 2 | 3 | 4 |
| Score Multiplier | 1× | 1.5× | 2× |

### Variety
- **6 weather types** provide content variety
- **Random selection** ensures different combinations
- **Shuffle** prevents same order each time
- **Level 3** uses 4 of 6 types (~67% of content)

## Technical Notes

### Weather Selection Algorithm

```typescript
const shuffled = shuffle(WEATHER);  // Uses Fisher-Yates from utils/random
const selected = shuffled.slice(0, config.pairCount);
```

- All 6 weather types available
- Randomly ordered via shuffle
- First N selected based on level

### Clothing Selection

```typescript
const clothing = CLOTHING[w.name][Math.floor(Math.random() * CLOTHING[w.name].length)];
```

- CLOTHING is a Record mapping weather names to clothing arrays
- Random selection from available options per weather
- Some weather has 1 option (Windy, Cloudy, Stormy)
- Some weather has 2 options (Sunny, Rainy, Snowy)

### Shuffle Utility
Uses `shuffle` from `utils/random.ts`:
- Fisher-Yates algorithm
- In-place shuffling
- Creates new array (doesn't modify original)

### Difficulty Multipliers
```typescript
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
};
```
Preserved for backward compatibility but not used internally.

### Edge Cases
- Invalid level → Falls back to level 1
- Empty WEATHER array → Would return empty pairs
- Missing CLOTHING entry → Would throw error

## Design Decisions

### Six Weather Types
- Covers common conditions children experience
- Distinct visual representations (emojis)
- Clear clothing associations
- Culturally universal

### Progressive Pair Count
- Level 1: 2 pairs (manageable for beginners)
- Level 2: 3 pairs (more variety)
- Level 3: 4 pairs (approaching complexity limit)

### Random Weather Selection
- Prevents memorization of order
- Different experience each game
- Higher replay value
- Still fair (all weather types appropriate)

### Single Clothing per Weather
- Simplifies matching (one correct answer per card)
- Random choice from 1-2 options adds variety
- Prevents analysis paralysis

## Educational Design

### Weather-Clothing Associations
| Weather | Clothing Concept |
|---------|-----------------|
| Sunny | Sun protection (hat, sunglasses) |
| Rainy | Waterproof gear (raincoat, umbrella) |
| Snowy | Warmth (coat, scarf) |
| Windy | Wind protection (jacket) |
| Cloudy | Light protection (light jacket) |
| Stormy | Heavy protection (raincoat) |

### Cognitive Skills
- **Association**: Linking weather to clothing
- **Reasoning**: Understanding why (sun → hat)
- **Decision making**: Choosing appropriate items
- **Categorization**: Grouping by weather type

### Practical Knowledge
- Real-world skills
- Weather awareness
- Self-care concepts
- Seasonal understanding

### Vocabulary Building
- Weather terms (sunny, rainy, snowy)
- Clothing items (sunglasses, umbrella, scarf)
- Descriptive language (light jacket vs coat)

### Visual Learning
- Emoji representations provide visual context
- Icons support UI flexibility
- Non-readers can play visually
- Universal symbols

## Extension Possibilities

### Additional Weather Types
- Foggy → Fog lights caution
- Hot → Shorts, t-shirt
- Cold → Boots, gloves
- Icy → Ice grippers

### Multi-Item Matching
- Match multiple clothing items per weather
- Build complete outfits
- Dress-up game style

### Scenarios
- "It's sunny and you're going to the beach"
- "It's snowing and you're building a snowman"
- Context adds decision-making depth

## Testing Notes

### Deterministic Testing
- Shuffle algorithm is pure (given RNG)
- Can mock RNG for predictable tests
- Public APIs don't require RNG injection

### Test Coverage Points
- Level config retrieval and fallback
- Pair count per level
- Weather-clothing associations
- Shuffle variety
- Score calculation
- Edge cases (invalid levels)

## Related Files
- `utils/random.ts` - shuffle function
- `utils/scoring.ts` - calculateScore, ScorePresets.high
