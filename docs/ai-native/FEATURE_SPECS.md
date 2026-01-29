# AI Feature Specifications

**Version:** 1.0.0
**Date:** 2026-01-29
**Status:** DRAFT

---

## Feature Index

| ID | Feature | Priority | Phase | Status |
|----|---------|----------|-------|--------|
| AI-001 | Pip Voice (TTS) | P0 | 1 | Planned |
| AI-002 | Letter Pronunciation | P0 | 1 | Planned |
| AI-003 | Pip Quick Responses | P1 | 1 | Planned |
| AI-004 | Voice Input (STT) | P1 | 2 | Planned |
| AI-005 | Conversation with Pip | P1 | 2 | Planned |
| AI-006 | Story Generator | P2 | 3 | Planned |
| AI-007 | Activity Generator | P2 | 3 | Planned |
| AI-008 | Show and Tell (Vision) | P2 | 4 | Planned |
| AI-009 | AR Face Overlays | P3 | 4 | Planned |
| AI-010 | Adaptive Learning Path | P2 | 3 | Planned |

---

## Phase 1 Features (Weeks 1-2)

### AI-001: Pip Voice (TTS)

**User Story:** As a child, I want to hear Pip talk so that I don't need to read and Pip feels alive.

**Technical Spec:**
- Primary: Web Speech API
- Enhanced: Piper TTS (local)
- Voice: Rate 1.1, Pitch 1.2 (warm, friendly)
- Latency: <200ms

**Interface:**
```typescript
interface TTSService {
  speak(text: string, voice?: 'pip' | 'letter'): Promise<void>;
  stop(): void;
  setVolume(volume: number): void;
}
```

**Parent Controls:** Volume, Mute toggle

---

### AI-002: Letter Pronunciation

**User Story:** As a child, I want to hear letter sounds so I learn phonics while tracing.

**Technical Spec:**
- Pre-recorded audio (high quality)
- Format: MP3/WebM, <50KB per letter
- Includes: letter name, letter sound, example word

**Audio Structure:**
```typescript
const LETTER_AUDIO = {
  A: { name: 'ay', sound: 'ah', word: 'apple' },
  B: { name: 'bee', sound: 'buh', word: 'ball' },
  // ... all letters
};
```

---

### AI-003: Pip Quick Responses

**User Story:** As a child, I want Pip to react to what I do so learning feels like playing with a friend.

**Response Triggers:**
- TRACE_PERFECT (90%+): "Amazing! You're a superstar!"
- TRACE_GOOD (70-89%): "Great job! Keep going!"
- TRACE_TRY_AGAIN (<70%): "Almost! Let's try again!"
- SESSION_START: "Hi [Name]! Ready to learn?"
- LETTER_MASTERED: "Wow! You learned [Letter]!"

**Technical Spec:**
- Template-based responses (no LLM needed)
- 5+ variations per trigger (avoid repetition)
- TTS integration for all responses

---

## Phase 2 Features (Weeks 3-4)

### AI-004: Voice Input (STT)

**User Story:** As a child, I want to talk to Pip instead of tapping.

**Technical Spec:**
- Primary: Web Speech API
- Push-to-talk activation
- Max listen: 10 seconds
- Confidence threshold: 0.6 (lower for children)

**Interface:**
```typescript
interface STTService {
  startListening(): void;
  stopListening(): void;
  onTranscript(callback: (text: string) => void): void;
}
```

**UI Elements:**
- Large microphone button
- Pulsing animation when listening
- Clear audio feedback

---

### AI-005: Conversation with Pip

**User Story:** As a child, I want to ask Pip questions and get answers.

**Technical Spec:**
- Primary: Ollama (Llama 3.2 3B) - local
- Fallback: Claude API
- Max response: 50 words
- Latency target: <2 seconds

**System Prompt:**
```
You are Pip, a friendly red panda learning companion for children ages 4-10.

RULES:
- Use simple words (5-year-old level)
- Keep responses under 30 words
- Always be positive and encouraging
- Never discuss violence, scary, or adult topics
- Redirect inappropriate questions to learning

Child: {name}, Age: {age}
```

**Safety:**
- Input filtering (profanity, injection attempts)
- Output filtering (age-appropriate check)
- Topic redirection for unsafe queries

---

## Phase 3 Features (Weeks 5-8)

### AI-006: Story Generator

**User Story:** As a child, I want Pip to tell me stories with my name in them.

**Technical Spec:**
- Provider: Claude API (quality needed)
- Length: 3-5 sentences (~100 words)
- Generation time: <5 seconds
- Themes: Animals, Space, Ocean, Forest

**Story Template:**
```typescript
interface StoryRequest {
  childName: string;
  featuredLetter: string;
  theme: 'animals' | 'space' | 'ocean' | 'forest';
}

// Example output:
// "Once upon a time, Maya met a friendly Dragon named Dino.
//  Dino loved to Dance! 'Want to Dance with me?' asked Dino.
//  Maya and Dino Danced under the stars. The end!"
```

---

### AI-007: Activity Generator

**User Story:** As a child, I want Pip to suggest fun activities so I never get bored.

**Activity Types:**
- Letter Trace, Letter Find, Letter Match
- Word Build, Story Listen
- Creative Draw, Game Play

**Selection Logic:**
1. Prioritize struggling letters
2. Mix in mastered letters (confidence)
3. Vary activity types
4. Match difficulty to performance
5. Consider session fatigue

---

### AI-010: Adaptive Learning Path

**User Story:** As a parent, I want the app to adjust to my child's pace.

**Mastery Levels:**
| Level | Criteria | Guidance |
|-------|----------|----------|
| New | Never tried | Maximum hints |
| Learning | <70% avg | High guidance |
| Practicing | 70-85% avg | Medium guidance |
| Mastered | 85%+ (3 sessions) | Review queue |

**Spaced Repetition:**
- Review intervals: 1 day, 3 days, 7 days, 14 days
- Reset on poor performance
- Parent dashboard shows progress

---

## Phase 4 Features (Weeks 9-12)

### AI-008: Show and Tell (Vision)

**User Story:** As a child, I want to show Pip my toys and learn about them.

**Technical Spec:**
- Engine: TensorFlow.js + COCO-SSD
- Processing: 100% local
- Detection: <500ms
- NEVER store camera frames

**Object Mappings:**
```typescript
// Child shows a dog toy
// Pip: "A doggy! I love dogs! D is for Dog. Woof woof!"
// Suggested activity: Trace letter D
```

---

### AI-009: AR Face Overlays

**User Story:** As a child, I want to put silly hats on my face for fun.

**Technical Spec:**
- Engine: MediaPipe Face Mesh
- Processing: 100% local
- Frame rate: 30fps target
- NEVER store face data

**Overlay Types:**
- Letter hats (unlock by mastering)
- Achievement crowns
- Silly glasses
- Animal masks

---

## Parent Controls Summary

| Feature | Controls Available |
|---------|-------------------|
| TTS | Volume, Mute |
| Voice Input | Enable/Disable |
| Conversation | Enable/Disable, Daily limit |
| Story Generator | Enable/Disable, Daily limit |
| Camera Features | Enable/Disable, Timeout |

---

## Privacy Requirements (All Features)

- Camera frames: NEVER stored
- Audio recordings: NEVER stored
- Conversations: NEVER stored (summaries only)
- All processing: Local when possible
- Cloud data: Minimal, with consent

---

## Related Documents

- [Architecture](./ARCHITECTURE.md)
- [Safety Guidelines](./SAFETY_GUIDELINES.md)
- [Implementation Prompts](../../prompts/ai-native/)
