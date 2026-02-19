# AI-Native Learning Platform: Technical Architecture

**Version:** 1.0.0
**Date:** 2026-01-29
**Status:** DRAFT - Awaiting Review

---

## Executive Summary

This document defines the technical architecture for transforming the Advay Vision Learning app from a static letter-tracing application into an AI-native learning platform where Pip becomes a true AI companion capable of generating responses, stories, and personalized activities.

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHILD INTERFACE LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Touch     │  │   Voice     │  │   Camera    │  │   Gesture   │    │
│  │   Input     │  │   Input     │  │   Input     │  │   Input     │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      INPUT PROCESSING LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Event     │  │   STT       │  │  MediaPipe  │  │   Hand      │    │
│  │   Handler   │  │   Engine    │  │   Vision    │  │   Tracking  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          └────────────────┼────────────────┼────────────────┘
                           ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PIP AI COMPANION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Context Manager                               │   │
│  │  - Session state    - Child profile    - Activity context        │   │
│  │  - Emotion signals  - Learning progress - Safety flags           │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│  ┌─────────────────────────────▼───────────────────────────────────┐   │
│  │                    Response Generator                            │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │  Quick    │  │  Story    │  │  Activity │  │  Feedback │    │   │
│  │  │  Reply    │  │  Builder  │  │  Creator  │  │  Engine   │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI SERVICES LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    LLM      │  │    TTS      │  │    STT      │  │   Vision    │    │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │    │
│  │ (Text Gen)  │  │  (Speech)   │  │  (Listen)   │  │  (Scene)    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PROVIDER ABSTRACTION LAYER                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Unified API Interface                               │   │
│  │  - Provider selection (local vs cloud)                           │   │
│  │  - Fallback handling                                             │   │
│  │  - Rate limiting & cost management                               │   │
│  │  - Caching layer                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │    LOCAL PROVIDERS   │  │    CLOUD PROVIDERS   │                    │
│  │  - Ollama (Llama)    │  │  - Claude API        │                    │
│  │  - Web Speech API    │  │  - OpenAI API        │                    │
│  │  - Piper TTS         │  │  - ElevenLabs        │                    │
│  │  - MediaPipe         │  │  - Google Cloud      │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SAFETY & PRIVACY LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Content    │  │   Data      │  │   Parent    │  │   Audit     │    │
│  │  Filter     │  │   Privacy   │  │   Controls  │  │   Logger    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         OUTPUT LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Pip      │  │   Audio     │  │   Visual    │  │  Activity   │    │
│  │  Animation  │  │   Output    │  │  Feedback   │  │   State     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Local-First** | Prefer local processing for latency and privacy |
| **Graceful Degradation** | App works without cloud; features scale with connectivity |
| **Privacy by Design** | No camera frames stored; minimal data retention |
| **Child Safety First** | All AI outputs filtered for age-appropriateness |
| **Parent Transparency** | Parents see what AI is doing without full transcripts |

---

## 2. Component Specifications

### 2.1 LLM Service (Text Generation)

#### Purpose

Generate Pip's responses, stories, activity descriptions, and personalized feedback.

#### Provider Options

| Provider | Type | Latency | Cost | Quality | Offline |
|----------|------|---------|------|---------|---------|
| **Claude API** | Cloud | 500-2000ms | $$ | Excellent | No |
| **OpenAI GPT-4** | Cloud | 500-1500ms | $$$ | Excellent | No |
| **Ollama (Llama 3.2)** | Local | 100-500ms | Free | Good | Yes |
| **Ollama (Phi-3)** | Local | 50-200ms | Free | Moderate | Yes |

#### Recommended Strategy

```
Primary: Ollama (Llama 3.2 3B) - Fast local responses
Fallback: Claude API - Complex generation (stories, activities)
Cache: Redis/LocalStorage - Repeated responses
```

#### Interface Definition

```typescript
interface LLMService {
  // Quick responses (Pip reactions)
  generateQuickResponse(context: PipContext): Promise<string>;

  // Story generation
  generateStory(prompt: StoryPrompt): Promise<Story>;

  // Activity creation
  generateActivity(type: ActivityType, childProfile: ChildProfile): Promise<Activity>;

  // Feedback on tracing
  generateFeedback(traceResult: TraceResult): Promise<Feedback>;
}

interface PipContext {
  childName: string;
  childAge: number;
  currentActivity: string;
  recentActions: Action[];
  emotionSignal: 'happy' | 'frustrated' | 'curious' | 'bored';
  sessionDuration: number;
}
```

#### System Prompt Template

```
You are Pip, a friendly red panda learning companion for a {age}-year-old child named {name}.

RULES:
- Speak simply. Use short sentences (5-10 words max).
- Be warm, encouraging, and playful.
- Never use complex words. A 4-year-old should understand.
- Never mention being an AI unless directly asked.
- If asked inappropriate questions, gently redirect to learning.
- Always relate responses to learning through play.

PERSONALITY:
- Curious and easily excited
- Celebrates small wins enthusiastically
- Gets "confused" in a funny way when things go wrong
- Loves animals, colors, and silly sounds

CURRENT CONTEXT:
- Activity: {activity}
- Child's recent action: {action}
- Child seems: {emotion}

Respond as Pip would. Keep it under 20 words.
```

### 2.2 TTS Service (Text-to-Speech)

#### Purpose

Give Pip a voice. All text responses should be speakable.

#### Provider Options

| Provider | Type | Latency | Quality | Customization | Cost |
|----------|------|---------|---------|---------------|------|
| **Web Speech API** | Local | <100ms | Basic | Limited | Free |
| **ElevenLabs** | Cloud | 200-500ms | Excellent | High | $$$ |
| **Google Cloud TTS** | Cloud | 100-300ms | Very Good | Medium | $$ |
| **Piper TTS** | Local | <50ms | Good | Medium | Free |
| **Coqui TTS** | Local | 50-150ms | Good | High | Free |

#### Recommended Strategy

```
Primary: Web Speech API - Immediate feedback (letters, simple words)
Enhanced: Piper TTS (local) - Pip's voice for longer responses
Premium: ElevenLabs - Story narration (optional, parent-enabled)
```

#### Interface Definition

```typescript
interface TTSService {
  // Speak text immediately
  speak(text: string, options?: TTSOptions): Promise<void>;

  // Queue speech
  queueSpeech(text: string): void;

  // Stop speaking
  stop(): void;

  // Check if speaking
  isSpeaking(): boolean;
}

interface TTSOptions {
  voice?: 'pip' | 'narrator' | 'letter';
  rate?: number;  // 0.5 - 2.0
  pitch?: number; // 0.5 - 2.0
  volume?: number; // 0 - 1
}
```

#### Voice Personas

```typescript
const VOICE_PERSONAS = {
  pip: {
    // Pip's character voice - warm, slightly high, playful
    rate: 1.1,
    pitch: 1.2,
    provider: 'piper', // or custom ElevenLabs voice
  },
  letter: {
    // Clear letter pronunciation
    rate: 0.8,
    pitch: 1.0,
    provider: 'web-speech',
  },
  narrator: {
    // Story narration - calm, engaging
    rate: 0.9,
    pitch: 1.0,
    provider: 'elevenlabs',
  }
};
```

### 2.3 STT Service (Speech-to-Text)

#### Purpose

Allow children to talk to Pip. Voice input is more natural for young children than typing.

#### Provider Options

| Provider | Type | Latency | Accuracy | Child Voice | Cost |
|----------|------|---------|----------|-------------|------|
| **Web Speech API** | Local | Real-time | Moderate | Fair | Free |
| **Whisper API** | Cloud | 500-1500ms | Excellent | Good | $$ |
| **Whisper.cpp** | Local | 200-500ms | Very Good | Good | Free |
| **Vosk** | Local | Real-time | Good | Fair | Free |

#### Recommended Strategy

```
Primary: Web Speech API - Real-time, works on most browsers
Enhanced: Whisper.cpp (local) - Better accuracy for child voices
Fallback: Whisper API - When local fails
```

#### Interface Definition

```typescript
interface STTService {
  // Start listening
  startListening(options?: STTOptions): void;

  // Stop listening
  stopListening(): void;

  // Get transcript
  onTranscript(callback: (text: string, isFinal: boolean) => void): void;

  // Check microphone status
  getMicrophoneStatus(): 'active' | 'inactive' | 'denied' | 'unavailable';
}

interface STTOptions {
  language?: string;  // 'en-US', 'hi-IN', etc.
  continuous?: boolean;
  interimResults?: boolean;
  maxDuration?: number; // Max seconds to listen
}
```

#### Child Voice Considerations

```typescript
const CHILD_VOICE_CONFIG = {
  // Children speak differently - adjust processing
  minConfidence: 0.6,        // Lower threshold for acceptance
  maxSilenceDuration: 2000,  // Kids pause longer
  promptOnSilence: true,     // Pip prompts if silence too long
  repeatThreshold: 2,        // Ask to repeat after 2 low-confidence results
};
```

### 2.4 Vision Service (Camera/Scene Understanding)

#### Purpose

Understand what the child shows to the camera and enable AR-style interactions.

#### Provider Options

| Provider | Type | Use Case | Latency | Cost |
|----------|------|----------|---------|------|
| **MediaPipe** | Local | Hand tracking, face mesh | <50ms | Free |
| **TensorFlow.js** | Local | Object detection | 50-200ms | Free |
| **Claude Vision** | Cloud | Scene understanding | 1-3s | $$$ |
| **GPT-4 Vision** | Cloud | Scene understanding | 1-3s | $$$ |

#### Recommended Strategy

```
Primary: MediaPipe - Hand tracking (already implemented)
Enhanced: TensorFlow.js - Object detection for "show and tell"
Premium: Claude Vision - Complex scene understanding (optional)

IMPORTANT: Never store camera frames. Process and discard.
```

#### Interface Definition

```typescript
interface VisionService {
  // Hand tracking (existing)
  getHandLandmarks(): HandLandmarks | null;

  // Object detection
  detectObjects(frame: ImageData): Promise<DetectedObject[]>;

  // Scene description (cloud)
  describeScene(frame: ImageData): Promise<string>;

  // Face mesh for AR overlays
  getFaceMesh(): FaceMesh | null;
}

interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
}
```

#### Privacy Safeguards

```typescript
const VISION_PRIVACY = {
  // NEVER store frames
  storeFrames: false,

  // Process locally when possible
  preferLocal: true,

  // Clear indicator when camera active
  showCameraIndicator: true,

  // Parent can disable vision features
  parentControlled: true,

  // No face recognition/identification
  faceRecognition: false,

  // No biometric data storage
  biometricStorage: false,
};
```

---

## 3. Data Flow Examples

### 3.1 Child Asks Pip a Question

```
Child says: "Pip, why is the sky blue?"
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 1. STT: Web Speech API captures audio   │
│    → Transcript: "Pip why is sky blue"  │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 2. Context Manager builds prompt        │
│    → Child: Maya, Age: 5                │
│    → Session: 3 minutes in              │
│    → Activity: Free exploration         │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 3. LLM Service (Ollama local)           │
│    → Generates: "Ooh! The sky is like   │
│      a big blue blanket! Want to paint  │
│      the sky together?"                 │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 4. Safety Filter checks response        │
│    → Age-appropriate: YES               │
│    → Safe content: YES                  │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 5. TTS Service (Piper) speaks response  │
│ 6. Pip Animation: Excited/curious pose  │
│ 7. UI: Shows sky-painting activity card │
└─────────────────────────────────────────┘
```

### 3.2 Child Shows Object to Camera

```
Child holds up toy dinosaur
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 1. Vision: TensorFlow.js detects object │
│    → Label: "dinosaur" (0.87 confidence)│
│    → Frame discarded immediately        │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 2. LLM generates response               │
│    → "Wow! Is that a dinosaur?! I love  │
│      dinosaurs! What's its name?"       │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 3. TTS speaks, Pip animation plays      │
│ 4. Activity suggestion: "Learn letter D │
│    for Dinosaur!"                       │
└─────────────────────────────────────────┘
```

### 3.3 Generating a Personalized Story

```
Child traces letter "D" successfully
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 1. Feedback: "Amazing! You learned D!"  │
│ 2. Pip: "D is for Dragon. Want a story?"│
│ 3. Child: "Yes!"                        │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 4. LLM (Claude API - complex task)      │
│    → System prompt with child context   │
│    → Request: Short story, letter D,    │
│      child's name, 3-4 sentences        │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 5. Generated Story:                     │
│    "Once upon a time, a dragon named    │
│    Dino lived on a tall mountain.       │
│    One day, Maya came to visit.         │
│    'Hello!' said Dino. 'Want to fly?'   │
│    Maya and Dino flew over the clouds!" │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ 6. TTS (ElevenLabs narrator voice)      │
│ 7. UI: Simple illustrations generated   │
│    or selected from asset library       │
└─────────────────────────────────────────┘
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Basic AI infrastructure with local-first approach

| Component | Task | Priority |
|-----------|------|----------|
| TTS | Integrate Web Speech API | P0 |
| TTS | Create Pip voice persona | P0 |
| LLM | Set up Ollama with Llama 3.2 | P1 |
| LLM | Create basic response templates | P1 |
| Architecture | Provider abstraction layer | P1 |

### Phase 2: Voice Input (Weeks 3-4)

**Goal:** Children can talk to Pip

| Component | Task | Priority |
|-----------|------|----------|
| STT | Integrate Web Speech API | P0 |
| STT | Child voice optimization | P1 |
| LLM | Conversation context manager | P1 |
| UI | Microphone indicator and controls | P0 |
| Safety | Input content filtering | P0 |

### Phase 3: Smart Responses (Weeks 5-6)

**Goal:** Pip responds contextually

| Component | Task | Priority |
|-----------|------|----------|
| LLM | Claude API integration | P1 |
| LLM | Story generation pipeline | P2 |
| LLM | Activity generation | P2 |
| Safety | Output content filtering | P0 |
| Cache | Response caching layer | P1 |

### Phase 4: Vision Features (Weeks 7-8)

**Goal:** Camera-based interactions

| Component | Task | Priority |
|-----------|------|----------|
| Vision | Object detection (TensorFlow.js) | P1 |
| Vision | "Show and tell" feature | P2 |
| Vision | AR overlays (face stickers) | P3 |
| Safety | Camera privacy indicators | P0 |
| Parent | Camera feature toggle | P0 |

---

## 5. Configuration

### 5.1 Environment Variables

```bash
# AI Provider Configuration
AI_LLM_PROVIDER=ollama          # ollama | claude | openai
AI_LLM_MODEL=llama3.2:3b        # Model identifier
AI_LLM_FALLBACK_PROVIDER=claude # Fallback provider

AI_TTS_PROVIDER=web-speech      # web-speech | piper | elevenlabs
AI_TTS_VOICE_ID=pip_v1          # Voice identifier

AI_STT_PROVIDER=web-speech      # web-speech | whisper
AI_STT_LANGUAGE=en-US           # Default language

# API Keys (only if using cloud)
CLAUDE_API_KEY=sk-xxx
OPENAI_API_KEY=sk-xxx
ELEVENLABS_API_KEY=xxx

# Safety Configuration
AI_CONTENT_FILTER_LEVEL=strict # strict | moderate
AI_MAX_RESPONSE_LENGTH=100     # Max words in response
AI_SESSION_TIMEOUT=1800        # 30 minutes max

# Privacy Configuration
AI_STORE_CONVERSATIONS=false   # Never store
AI_CAMERA_FRAMES_STORED=false  # Never store
AI_PARENT_SUMMARY_ONLY=true    # Parents see summaries, not transcripts
```

### 5.2 Feature Flags

```typescript
const AI_FEATURES = {
  // Core features
  tts_enabled: true,
  stt_enabled: true,
  llm_responses: true,

  // Advanced features
  story_generation: false,    // Enable in Phase 3
  activity_generation: false, // Enable in Phase 3
  object_detection: false,    // Enable in Phase 4
  ar_overlays: false,         // Enable in Phase 4

  // Cloud features (cost implications)
  cloud_llm: false,           // Parent-enabled
  cloud_tts: false,           // Parent-enabled
  cloud_vision: false,        // Parent-enabled
};
```

---

## 6. Performance Budgets

| Operation | Target Latency | Max Latency | Notes |
|-----------|----------------|-------------|-------|
| Pip quick response | <500ms | 1000ms | Local LLM |
| TTS start speaking | <200ms | 500ms | Web Speech |
| STT transcript | Real-time | 500ms delay | Web Speech |
| Object detection | <200ms | 500ms | TensorFlow.js |
| Story generation | <3000ms | 5000ms | Cloud LLM |

---

## 7. Error Handling

### 7.1 Graceful Degradation

```typescript
const FALLBACK_CHAIN = {
  llm: [
    'ollama',      // Try local first
    'claude',      // Fall back to cloud
    'templates',   // Fall back to pre-written responses
  ],
  tts: [
    'piper',       // Try local first
    'web-speech',  // Fall back to browser
    'text-only',   // Fall back to text display
  ],
  stt: [
    'web-speech',  // Try browser first
    'whisper',     // Fall back to cloud
    'text-input',  // Fall back to keyboard/touch
  ],
};
```

### 7.2 Child-Friendly Errors

```typescript
const CHILD_ERROR_MESSAGES = {
  llm_unavailable: "Pip is thinking really hard... Let's try again!",
  tts_unavailable: "Pip lost their voice! Can you read what Pip says?",
  stt_unavailable: "Pip can't hear right now. Can you tap instead?",
  camera_denied: "Pip can't see! Ask a grown-up to help with the camera.",
  network_error: "Pip got lost in the clouds. Let's play something else!",
};
```

---

## 8. Security Considerations

### 8.1 API Key Protection

- Never expose API keys in frontend code
- Use backend proxy for all cloud API calls
- Rotate keys regularly

### 8.2 Input Sanitization

- Sanitize all text before sending to LLM
- Filter inappropriate words before processing
- Validate audio input length

### 8.3 Output Filtering

- All LLM responses pass through content filter
- Block responses mentioning violence, adult content, etc.
- Fallback to safe templates if filter fails

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

- Response latency (p50, p95, p99)
- Provider fallback rate
- Content filter trigger rate
- Session duration with AI features
- Parent feature toggle patterns

### 9.2 Logging (Privacy-Preserving)

```typescript
// DO log
logger.info('ai_response_generated', {
  provider: 'ollama',
  latency_ms: 342,
  response_length: 45,
});

// DO NOT log
// - Actual response content
// - Child's speech input
// - Camera frames
// - Any PII
```

---

## 10. Related Documents

- [AI Safety Guidelines](./SAFETY_GUIDELINES.md)
- [AI Feature Specifications](./FEATURE_SPECS.md)
- [Parent Controls](./PARENT_CONTROLS.md)
- [Privacy Policy](../security/PRIVACY.md)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial architecture document |
