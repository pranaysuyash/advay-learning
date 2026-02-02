# Lumi Companion Character Implementation Plan

## Executive Summary

**PIP Enhancement:** Lumi will be implemented as a complementary companion character to the existing PIP mascot system. While PIP serves as the primary character guide for individual learning activities, Lumi will focus on social-emotional learning, multiplayer interactions, and collaborative activities that teach sharing, caring, cooperation, and friendship.

**Integration Strategy:** Lumi will leverage the existing PIP infrastructure (Mascot component, TTS system, response templates) while adding new capabilities for multi-character interactions and social learning scenarios.

---

## Current PIP System Analysis

### ✅ Already Implemented
- **Mascot Component:** Video/image assets, animations, states (idle, happy, thinking, celebrating)
- **TTS Integration:** Child-friendly voice responses with language support
- **Response System:** 11 categories of responses (traceSuccess, encouragement, celebration, etc.)
- **Star Feedback:** ⭐⭐⭐, ⭐⭐, ⭐ based on accuracy
- **Letter Introductions:** Template-based introductions with example words
- **Visual Design:** Red panda character with speech bubbles

### 🎯 PIP's Current Role
- Primary character guide for individual learning activities
- Provides encouragement and feedback during tracing/number recognition
- Celebrates achievements and milestones
- Acts as a friendly companion for solo play

---

## Lumi Character Design

### Core Identity
- **Name:** Lumi (The Light Guide)
- **Appearance:** Glowing orb with friendly face and soft light emanations
- **Personality:** Gentle, empathetic, collaborative, nurturing
- **Role:** Social companion focused on relationships and cooperation

### Visual Assets Needed
```
assets/images/lumi_idle.png          # Base idle state
assets/images/lumi_happy.png         # Happy/excited state
assets/images/lumi_thinking.png      # Processing/reflecting state
assets/images/lumi_caring.png        # Empathetic/caring state
assets/images/lumi_celebrating.png   # Celebration state
assets/videos/lumi_glow.webm         # Gentle glowing animation
assets/videos/lumi_multiplayer.webm  # Multi-character interaction
```

### Voice & Audio
- **Voice Style:** Softer, more nurturing than PIP's energetic tone
- **Language Support:** Same TTS integration as PIP
- **Audio Cues:** Soft chime sounds, gentle music for social moments

---

## Lumi Response System

### New Response Categories (Extending PIP_RESPONSES)
```typescript
export type LumiResponseCategory =
  | 'sharing'           // "Great sharing! You made your friend happy!"
  | 'caring'           // "That was so caring! You're a wonderful friend!"
  | 'cooperation'      // "Teamwork makes the dream work!"
  | 'friendship'       // "Friends help each other! You're amazing!"
  | 'patience'         // "Taking turns is important. Good job waiting!"
  | 'encouragement_social'  // "Your friend needs help. Can you assist?"
  | 'celebration_group'     // "You both did amazing! High five!"
  | 'comfort'          // "It's okay to feel sad. I'm here for you."
  | 'inclusion'        // "Everyone gets a turn! That's fair!"
  | 'gratitude'        // "Thank you for being such a good friend!";
```

### Social Learning Scenarios
```typescript
// Example response templates
const LUMI_RESPONSES: Record<LumiResponseCategory, string[]> = {
  sharing: [
    "Wonderful sharing! You made your friend smile! 🌟",
    "Thank you for sharing! That's what friends do! 🤝",
    "Great job sharing! Everyone feels happy now! 😊",
    "You shared so nicely! I'm proud of you! ✨"
  ],
  caring: [
    "That was so caring! You're a kind friend! 💝",
    "You noticed your friend needed help! So thoughtful! 🌸",
    "Caring for others makes the world brighter! 🌈",
    "What a caring heart you have! Beautiful! 💕"
  ],
  // ... additional categories
};
```

---

## Implementation Architecture

### 1. Extended Mascot Component

#### Multi-Character Support
```typescript
interface MascotProps {
    character?: 'pip' | 'lumi';  // Default: 'pip'
    // ... existing props
}

// Character-specific configurations
const CHARACTER_CONFIGS = {
  pip: {
    imageSrc: '/assets/images/red_panda_no_bg.png',
    videoSrc: '/assets/videos/pip_alpha_v2.webm',
    responses: PIP_RESPONSES,
    personality: 'energetic'
  },
  lumi: {
    imageSrc: '/assets/images/lumi_idle.png',
    videoSrc: '/assets/videos/lumi_glow.webm',
    responses: LUMI_RESPONSES,
    personality: 'gentle'
  }
};
```

#### Dual Character Mode
```typescript
interface MultiCharacterProps {
  characters: Array<{
    id: 'pip' | 'lumi';
    position: 'left' | 'right';
    state: MascotState;
    message?: string;
  }>;
  interactionMode: 'dialogue' | 'parallel' | 'handover';
}
```

### 2. Social Learning Activities

#### Activity Types
1. **Turn-Taking Games:** Players alternate turns with encouragement
2. **Collaborative Challenges:** Both players contribute to success
3. **Sharing Activities:** Dividing resources or taking turns
4. **Caring Scenarios:** Helping each other through challenges
5. **Friendship Building:** Group activities with social feedback

#### Example: Collaborative Alphabet Game
```
Player A traces letter → Lumi: "Great job, Player A!"
Player B's turn → Lumi: "Now it's Player B's turn! Be patient!"
Both succeed → Lumi: "You both did amazing! Friends help friends!"
```

### 3. Multiplayer Integration

#### Session Management
```typescript
interface MultiplayerSession {
  players: Player[];
  currentActivity: SocialActivity;
  activeCharacters: ('pip' | 'lumi')[];
  socialMetrics: {
    sharing: number;
    cooperation: number;
    patience: number;
  };
}
```

#### Character Handover System
- **PIP → Lumi:** When transitioning from individual learning to social activities
- **Lumi → PIP:** When returning to skill-focused learning
- **Dual Presence:** Both characters visible during collaborative moments

---

## Implementation Phases

### Phase 1: Core Lumi Character (Week 1-2)
- [ ] Create Lumi visual assets (images, video animations)
- [ ] Extend Mascot component for character switching
- [ ] Implement Lumi response system
- [ ] Add Lumi TTS voice profile (gentler tone)
- [ ] Basic Lumi animations and states

### Phase 2: Social Learning Framework (Week 3-4)
- [ ] Create social activity templates
- [ ] Implement turn-taking mechanics
- [ ] Add social feedback system
- [ ] Build sharing/caring scenario templates
- [ ] Multiplayer session management

### Phase 3: Multi-Character Interactions (Week 5-6)
- [ ] Dual character display mode
- [ ] Character handover animations
- [ ] Dialogue between PIP and Lumi
- [ ] Collaborative celebration sequences
- [ ] Social metrics tracking

### Phase 4: Activity Integration (Week 7-8)
- [ ] Integrate with existing games (Alphabet, Numbers, Connect-the-Dots)
- [ ] Create dedicated social learning activities
- [ ] Add multiplayer lobby system
- [ ] Implement social progress tracking
- [ ] Testing and refinement

---

## Technical Implementation Details

### File Structure
```
src/frontend/src/components/
├── Mascot.tsx                    # Extended for multi-character
├── LumiCompanion.tsx            # Lumi-specific features
└── MultiCharacterDisplay.tsx    # Dual character management

src/frontend/src/data/
├── lumiResponses.ts             # Lumi's response templates
└── socialActivities.ts          # Social learning scenarios

src/frontend/src/hooks/
├── useMultiplayerSession.ts    # Multiplayer state management
└── useSocialLearning.ts         # Social metrics and feedback

src/frontend/src/stores/
└── socialStore.ts               # Social learning progress
```

### State Management
```typescript
// Social learning store
interface SocialState {
  activeCharacters: ('pip' | 'lumi')[];
  currentActivity: SocialActivity | null;
  socialMetrics: SocialMetrics;
  multiplayerSession: MultiplayerSession | null;
}

// Social metrics tracking
interface SocialMetrics {
  sharingInstances: number;
  cooperationScore: number;
  patienceDemonstrated: number;
  caringActions: number;
  friendshipBuilding: number;
}
```

### API Integration
```typescript
// Social learning endpoints
POST /api/social/progress    # Record social learning achievements
GET  /api/social/activities  # Get available social activities
POST /api/multiplayer/session # Create multiplayer session
PUT  /api/multiplayer/metrics # Update social metrics
```

---

## Social Learning Curriculum

### Core Learning Objectives
1. **Sharing:** Taking turns, dividing resources fairly
2. **Caring:** Noticing others' needs, offering help
3. **Cooperation:** Working together toward common goals
4. **Patience:** Waiting for turns, understanding timing
5. **Friendship:** Building positive relationships, communication

### Activity Examples

#### 1. Sharing Circle
- Players take turns tracing letters
- Lumi encourages: "Great job waiting for your turn!"
- Rewards cooperative behavior with special animations

#### 2. Caring Quest
- One player struggles, other helps
- Lumi celebrates: "You noticed your friend needed help! So caring!"
- Teaches empathy and support

#### 3. Friendship Builder
- Collaborative connect-the-dots
- Both players contribute to the same artwork
- Lumi narrates: "Friends create beautiful things together!"

---

## Success Metrics

### Engagement Metrics
- Time spent in social activities vs. individual activities
- Frequency of multi-character interactions
- Social activity completion rates

### Learning Outcomes
- Improvement in social skill demonstrations
- Positive feedback from parents/teachers on social development
- Child-reported enjoyment of collaborative play

### Technical Metrics
- Smooth character transitions
- TTS reliability for dual characters
- Multiplayer session stability

---

## Risk Mitigation

### Technical Risks
- **Character Switching Lag:** Pre-load assets, optimize animations
- **TTS Conflicts:** Queue system for multiple character speech
- **State Synchronization:** Robust multiplayer state management

### Educational Risks
- **Over-emphasis on Social Skills:** Balance with academic learning
- **Character Confusion:** Clear visual distinction between PIP and Lumi
- **Activity Complexity:** Progressive difficulty scaling

---

## Testing Strategy

### Unit Tests
- Character switching functionality
- Response system accuracy
- Social metrics calculation
- Multiplayer state management

### Integration Tests
- Dual character interactions
- Social activity flows
- Multiplayer session handling
- TTS coordination

### User Testing
- Child engagement with social activities
- Parent feedback on social learning value
- Teacher assessment of social skill development

---

## Conclusion

Lumi represents a natural evolution of the PIP character system, extending from individual learning guidance to social-emotional development. By leveraging existing infrastructure while adding specialized social learning capabilities, we can create a comprehensive character ecosystem that supports both academic and social growth.

The implementation will maintain the app's focus on accessibility and child-friendly design while introducing collaborative learning experiences that teach essential social skills through engaging, character-driven activities.</content>
<parameter name="filePath">/Users/pranay/Projects/learning_for_kids/docs/LUMI_COMPANION_CHARACTER_PLAN.md