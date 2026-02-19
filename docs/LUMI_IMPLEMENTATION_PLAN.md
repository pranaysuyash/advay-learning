# Lumi Companion Character Implementation Plan

**Date:** 2026-02-02  
**Status:** PLANNING  
**Priority:** P1  

---

## Overview

Lumi is the companion character that joins PIP for special scenarios: multiplayer games, lessons, story progression, and celebrations. While PIP handles core hand tracking and guidance, Lumi provides emotional support, additional guidance, and character interactions.

---

## Character Design

### Lumi's Personality

| Trait | Description | When Used |
|-------|-------------|-----------|
| **Encouraging** | "You've got this!" | When child struggles |
| **Playful** | Giggles, dances | During celebrations |
| **Curious** | "What's that?" | When discovering new things |
| **Supportive** | "Let's try together!" | During multiplayer |
| **Excited** | Jumps, sparkles | When child succeeds |

### Visual Design

| Element | Description | Colors |
|---------|-------------|--------|
| **Species** | Glow-in-the-dark firefly | Yellow-green glow |
| **Size** | Small (64x64px) | Scales with screen |
| **Features** | Wings, antennae, glowing tail | Bright yellow-green |
| **Expressions** | 8 expressions (happy, thinking, excited, supportive, curious, surprised, sleepy, dancing) | |

---

## Technical Architecture

### 1. Character State Management

**New: `characterStore.ts`**

```typescript
interface CharacterState {
  pip: {
    state: 'idle' | 'thinking' | 'happy' | 'waiting' | 'celebrating';
    position: 'camera' | 'corner';
    visible: boolean;
  };
  lumi: {
    state: 'idle' | 'thinking' | 'happy' | 'waiting' | 'celebrating' | 'dancing';
    position: 'story' | 'corner' | 'game';
    visible: boolean;
  };
  currentScene: 'home' | 'game' | 'story' | 'celebration';
}
```

### 2. Character Components

**New: `CharacterGuide.tsx`**

- Main character management component
- Handles PIP and LUMI state coordination
- Manages character transitions

**New: `Pip.tsx`**

- PIP mascot implementation (enhance existing)
- Hand tracking integration
- Gesture-based interactions

**New: `Lumi.tsx`**

- LUMI companion implementation
- Story mode appearances
- Multiplayer interactions

**New: `CharacterModal.tsx`**

- Character-driven story modals
- Celebration scenes
- Lesson presentations

### 3. Character Integration Points

| Game | PIP Role | LUMI Role |
|------|----------|-----------|
| **AlphabetGame** | Main guidance, hand tracking | Joins for celebrations, provides hints |
| **FingerNumberShow** | Number detection, feedback | Appears for special achievements |
| **ConnectTheDots** | Dot tracking, completion | Guides through treasure trails |
| **LetterHunt** | Letter detection | Helps with difficult letters |

---

## Implementation Phases

### Phase 1: Character Infrastructure (Week 1)

**Priority: P0 - High Impact, Low Effort**

#### 1.1 Character State System

- Create `characterStore.ts` with Zustand
- Define PIP and LUMI states
- Add scene management
- Integration with existing `storyStore`

**Files:**

- `src/frontend/src/store/characterStore.ts`
- `src/frontend/src/store/__tests__/characterStore.test.ts`

#### 1.2 Character Components

- Create `CharacterGuide.tsx` wrapper
- Enhance existing `Mascot.tsx` to `Pip.tsx`
- Create `Lumi.tsx` component
- Add character positioning system

**Files:**

- `src/frontend/src/components/CharacterGuide.tsx`
- `src/frontend/src/components/Pip.tsx`
- `src/frontend/src/components/Lumi.tsx`
- `src/frontend/src/components/__tests__/`

#### 1.3 Character Animations

- Add 8 PIP expressions
- Add 8 LUMI expressions
- Create character transition animations
- Add character-specific sound effects

**Files:**

- `src/frontend/src/components/animations/`
- `src/frontend/src/styles/character.ts`

### Phase 2: Character Integration (Week 2)

**Priority: P1 - Core Experience**

#### 2.1 Game Integration

- Add PIP guidance to all games
- Add LUMI appearances for special scenarios
- Create character feedback system
- Integrate with existing game logic

**Files:**

- `src/frontend/src/games/AlphabetGame.tsx` (update)
- `src/frontend/src/games/FingerNumberShow.tsx` (update)
- `src/frontend/src/games/ConnectTheDots.tsx` (update)
- `src/frontend/src/games/LetterHunt.tsx` (update)

#### 2.2 Story Integration

- Add LUMI to story modal system
- Create character-driven story progression
- Add character celebrations
- Integrate with `storyStore`

**Files:**

- `src/frontend/src/components/StoryModal.tsx` (update)
- `src/frontend/src/components/CharacterModal.tsx` (new)
- `src/frontend/src/store/storyStore.ts` (update)

#### 2.3 UI Integration

- Add character navigation indicators
- Create character-themed UI elements
- Add character status indicators
- Integrate with existing navigation

**Files:**

- `src/frontend/src/components/Layout.tsx` (update)
- `src/frontend/src/components/Navigation.tsx` (update)
- `src/frontend/src/styles/navigation.ts` (update)

### Phase 3: Advanced Features (Week 3)

**Priority: P2 - Differentiation**

#### 3.1 Multiplayer Integration

- Add LUMI for multiplayer scenarios
- Create turn-taking guidance
- Add collaborative celebrations
- Integrate with existing multiplayer logic

**Files:**

- `src/frontend/src/components/MultiplayerGuide.tsx` (new)
- `src/frontend/src/games/MultiplayerGame.tsx` (new)
- `src/frontend/src/store/multiplayerStore.ts` (new)

#### 3.2 Advanced Character AI

- Add context-aware character responses
- Create character memory system
- Add character personality variations
- Integrate with existing AI systems

**Files:**

- `src/frontend/src/services/characterAI.ts` (new)
- `src/frontend/src/hooks/useCharacterAI.ts` (new)
- `src/frontend/src/utils/characterLogic.ts` (new)

#### 3.3 Character Customization

- Add character appearance options
- Create character outfit system
- Add character voice options
- Integrate with existing customization

**Files:**

- `src/frontend/src/components/CharacterCustomizer.tsx` (new)
- `src/frontend/src/store/customizationStore.ts` (new)
- `src/frontend/src/styles/characterCustomizer.ts` (new)

---

## Character Integration Matrix

### PIP Integration Points

| Component | PIP Role | Implementation |
|-----------|----------|----------------|
| **Camera View** | Main guide, hand tracking | `Pip.tsx` in camera overlay |
| **Game Feedback** | Success/failure reactions | Character state updates |
| **Navigation** | Point to next action | Guide animations |
| **Story Progression** | Main narrative guide | Story modal appearances |

### LUMI Integration Points

| Component | LUMI Role | Implementation |
|-----------|-----------|----------------|
| **Story Modal** | Companion guide | `Lumi.tsx` in modal |
| **Multiplayer** | Turn-taking guide | Multiplayer character system |
| **Celebrations** | Extra encouragement | Celebration animations |
| **Lessons** | Additional guidance | Lesson companion mode |

---

## Technical Requirements

### 1. Performance Considerations

- Character animations optimized for 60fps
- Lazy loading for character assets
- Memory management for character states
- Responsive character sizing

### 2. Accessibility Requirements

- ARIA labels for character interactions
- Keyboard navigation for character controls
- Screen reader support for character dialogue
- Reduced motion support for character animations

### 3. Browser Compatibility

- Works on all modern browsers
- Fallback for older browsers
- Mobile-optimized character interactions
- Touch-friendly character controls

### 4. Testing Strategy

- Unit tests for character components
- Integration tests for character interactions
- Visual regression tests for character animations
- Accessibility tests for character features

---

## Success Metrics

### 1. Engagement Metrics

- Character interaction rate
- Time spent with characters
- Character completion rates
- User satisfaction scores

### 2. Performance Metrics

- Character animation performance
- Memory usage for character system
- Loading times for character assets
- Cross-browser compatibility

### 3. Learning Metrics

- Character-assisted learning improvement
- Character-guided task completion
- Character-supported engagement increase
- Character-enhanced retention rates

---

## Risk Assessment

### 1. Technical Risks

- Character animation performance issues
- Memory management challenges
- Cross-browser compatibility problems
- Integration complexity with existing systems

### 2. User Experience Risks

- Character distraction from learning
- Character complexity overwhelming young users
- Character personality inconsistencies
- Character interaction confusion

### 3. Development Risks

- Scope creep with character features
- Timeline delays for character implementation
- Resource allocation challenges
- Quality assurance complexity

---

## Next Steps

### Immediate Actions (Week 1)

1. Create character state management system
2. Implement basic PIP and LUMI components
3. Add character animation framework
4. Integrate with existing game systems

### Short-term Goals (Week 2-3)

1. Complete character integration with all games
2. Implement story progression with characters
3. Add character celebrations and feedback
4. Test character performance and accessibility

### Long-term Vision (Week 4+)

1. Advanced character AI and personalization
2. Multiplayer character interactions
3. Character customization and appearance options
4. Cross-platform character synchronization

---

## Success Criteria

### 1. Technical Success

- Characters load and animate smoothly
- Character interactions work consistently
- Character system integrates seamlessly
- Character performance meets benchmarks

### 2. User Experience Success

- Children engage positively with characters
- Characters enhance learning experience
- Character interactions feel natural
- Character system is intuitive to use

### 3. Business Success

- Increased user engagement and retention
- Positive user feedback on character features
- Character system supports learning goals
- Character implementation delivers ROI

---

## Conclusion

The Lumi companion character system will enhance the existing PIP guidance system by providing additional emotional support, specialized guidance for multiplayer and lessons, and enhanced story progression. This dual-character approach creates a richer, more engaging learning experience while maintaining the core functionality of PIP's hand tracking and guidance system.

By implementing Lumi as a companion rather than a replacement, we preserve the proven PIP system while adding new dimensions of engagement and support that will make the learning experience more magical and effective for young children.
