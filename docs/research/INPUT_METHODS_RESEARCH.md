# Input Methods Research - Beyond Hand Tracking

**Date:** 2026-02-22  
**Status:** Research Document - Active  
**Purpose:** Explore additional input methods to enhance gameplay variety

---

## 1. Voice/Blow Input

### 1.1 Web Audio API Capabilities

```typescript
// Basic audio input setup
interface AudioInputConfig {
  sampleRate: number;
  fftSize: number;
  smoothingTimeConstant: number;
}

// Capabilities available in modern browsers
const CAPABILITIES = {
  volumeDetection: '✅ Supported',     // Detect blow strength
  pitchDetection: '✅ Supported',      // For singing games
  frequencyAnalysis: '✅ Supported',   // For timbre/sound type
  clapDetection: '✅ Implementable',  // Transient detection
  hummingDetection: '✅ Implementable',// Pitch + volume
};
```

### 1.2 Blow Detection Algorithm

```typescript
class BlowDetector {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode;
  
  // Thresholds calibrated for children
  private BLOW_THRESHOLD = 0.3;        // Normalized 0-1
  private SUSTAINED_BLOW_MS = 200;     // Min duration
  private PEAK_DETECTION_WINDOW = 50;  // ms
  
  detectBlow(): BlowResult {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Focus on low frequencies (blow vs voice)
    const lowFreqAvg = this.calculateLowFrequencyAverage(dataArray);
    
    return {
      isBlowing: lowFreqAvg > this.BLOW_THRESHOLD,
      strength: lowFreqAvg,
      duration: this.calculateBlowDuration(),
    };
  }
}
```

### 1.3 Use Cases for Blow Input

| Game | Mechanic | Implementation |
|------|----------|----------------|
| **Virtual Bubbles** | Blow to create bubbles | Volume → bubble size |
| **Candle Blower** | Blow out candles | Sustained blow detection |
| **Pinwheel Spin** | Blow to spin | Continuous blow → rotation speed |
| **Leaf Blower** | Clear leaves | Directional blow (with hand position) |
| **Dandelion** | Blow seeds | Single strong blow |
| **Hot/Cold** | Cool down hot objects | Sustained gentle blow |
| **Musical Bubbles** | Different notes by blow strength | Volume → pitch |

### 1.4 Clap Detection

```typescript
interface ClapDetector {
  // Detect sharp volume transients
  detectClap(): boolean {
    const currentVolume = getCurrentVolume();
    const volumeDelta = currentVolume - this.previousVolume;
    
    // Clap characteristics:
    // - Sharp volume spike (>0.5 in <50ms)
    // - Short duration (<200ms)
    // - Wide frequency spectrum
    return volumeDelta > 0.5 && 
           this.isTransient(currentVolume) &&
           this.hasWideSpectrum();
  }
}
```

**Clap Use Cases:**
- Rhythm games (copy clap patterns)
- Magic spell casting
- Applause meter (cheering)
- Start/stop controls

---

## 2. Pose + Hand Combined Interactions

### 2.1 Technical Architecture

```typescript
interface CombinedCVInput {
  hand: HandData;
  pose: PoseData;
  face: FaceData;
  
  // Combined gestures
  gestures: {
    // Yoga + Hand: Hold tree pose while tracing
    yogaTracing: boolean;
    
    // Dance + Fingers: Dance then show number
    danceNumber: boolean;
    
    // Attention-based: Game speeds up when looking away
    attentionMeter: number;
    
    // Posture + Precision: Better posture = easier game
    postureBonus: number;
  };
}
```

### 2.2 Combined Game Mechanics

| Combination | Game Concept | Implementation |
|-------------|--------------|----------------|
| **Pose + Hand** | Yoga Tracing | Tree pose (balance) + trace letters |
| **Pose + Hand** | Freeze Dance Fingers | Dance → Freeze → Show number with fingers |
| **Face + Hand** | Attention Drawing | Look at canvas + draw with hand |
| **Face + Pose** | Expression Mirror | Copy face expression + body pose |
| **All Three** | Full Body Simon Says | "Touch head with left hand while showing 3 fingers and smiling" |
| **Pose + Voice** | Action Songs | "Jump" (pose) + "Up" (voice) |

### 2.3 Attention Detection (Face/Eye Tracking)

```typescript
interface AttentionDetector {
  // Detect if child is looking at screen
  isLookingAtScreen(): boolean {
    const eyePosition = getEyePosition();
    const faceOrientation = getFaceOrientation();
    
    // Check if eyes are directed toward screen center
    return this.isGazeOnScreen(eyePosition) &&
           this.isFaceTowardScreen(faceOrientation);
  }
  
  // Game mechanic: Speed up when attention wanders
  getAttentionLevel(): number {
    const recentLookAways = this.lookAwayHistory
      .filter(t => Date.now() - t < 5000).length;
    return Math.max(0, 1 - recentLookAways * 0.2);
  }
}
```

**Attention-Based Games:**
- **Focus Finder**: Objects move faster when not looking
- **Peek-a-Boo**: Game pauses when looking away
- **Concentration Challenge**: Points for sustained attention

---

## 3. Microphone Input - Speech Recognition

### 3.1 Web Speech API

```typescript
interface SpeechGameInput {
  recognition: SpeechRecognition;
  
  // For "Say the color" games
  listenForColor(): Promise<Color | null> {
    return new Promise((resolve) => {
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(this.parseColor(transcript));
      };
      this.recognition.start();
    });
  }
}
```

### 3.2 Voice-Controlled Games

| Game | Voice Command | Action |
|------|--------------|--------|
| **Voice Potion** | Say ingredient name | Add to cauldron |
| **Color Catcher** | "Red!" "Blue!" | Filter for that color |
| **Number Jump** | "Three!" | Jump that many times |
| **Simon Says Voice** | "Jump!" "Clap!" | Perform action |
| **Story Builder** | Add one word | Build sentence together |
| **Animal Sounds** | Make animal sound | Match to correct animal |

---

## 4. Device Motion & Orientation

### 4.1 Mobile-Specific Inputs

```typescript
interface DeviceMotionInput {
  // Accelerometer
  detectShake(): boolean;
  detectTilt(): TiltDirection;
  
  // Gyroscope
  detectRotation(): RotationData;
  
  // Game integration
  useCases: {
    marbleMaze: 'Tilt to roll ball',
    balanceBeam: 'Keep device level',
    steering: 'Tilt to steer',
    shakeToClear: 'Shake to erase',
  };
}
```

---

## 5. Multiplayer Input Methods

### 5.1 Same-Screen Multiplayer

| Mode | Input | Game |
|------|-------|------|
| **Co-op** | Two hands tracked | Carry object together |
| **Versus** | Left vs Right side | Race to complete |
| **Team** | Multiple poses | Group dance |
| **Hot Seat** | Take turns | Pass the device |

### 5.2 WebRTC for Remote Multiplayer

```typescript
interface MultiplayerCV {
  // Share gesture data, not video
  shareGesture(gesture: GestureData): void;
  
  // Synchronized game state
  syncGameState(state: GameState): void;
  
  // Privacy-first: landmarks only, no video
  privacyMode: 'landmarks-only' | 'silhouette' | 'full-video';
}
```

---

## 6. Haptic Feedback (Mobile)

```typescript
interface HapticFeedback {
  // Vibration API
  vibrate(pattern: number[]): void;
  
  // Use cases
  onCorrectAnswer: [50];           // Short pulse
  onWrongAnswer: [50, 100, 50];    // Double pulse
  onLevelComplete: [100, 50, 100]; // Celebration
  onProximity: [20];                // Near target
}
```

---

## 7. Accessibility Input Alternatives

### 7.1 Switch Control Support

```typescript
interface SwitchControl {
  // For children with motor disabilities
  supportsSwitchControl: true;
  
  // Single switch: Scanning
  scanningMode: {
    items: SelectableItem[];
    currentIndex: number;
    scanInterval: number;
  };
  
  // Double switch: Navigate + Select
  navigateSwitch: () => void;
  selectSwitch: () => void;
}
```

### 7.2 Eye Gaze (Future)

- Eye tracking via webcam
- Dwell-to-select
- Blink-to-click

---

## 8. Implementation Priority Matrix

| Input Method | Effort | Impact | Age Suitability | Priority |
|--------------|--------|--------|-----------------|----------|
| Blow detection | 2 days | High | 3-8 years | **P0** |
| Clap detection | 1 day | Medium | 4-8 years | **P1** |
| Pose+Hand combo | 3 days | Very High | 5-10 years | **P0** |
| Attention meter | 2 days | High | 4-8 years | **P1** |
| Voice commands | 2 days | Medium | 4-8 years | **P2** |
| Device tilt | 1 day | Medium | 5-8 years | **P2** |
| Haptic feedback | 0.5 day | Low | All | **P3** |
| Multiplayer | 1 week | Very High | 5-12 years | **P2** |

---

## 9. Recommended Next Implementations

### Immediate (This Week)
1. **Blow detection** for Virtual Bubbles game
2. **Pose+Hand combo** for Freeze Dance + Fingers

### Short-term (Next 2 Weeks)
3. **Attention meter** as wellness/game mechanic
4. **Clap detection** for rhythm games

### Medium-term (Next Month)
5. **Voice commands** for simple interactions
6. **Multiplayer** architecture

---

*Research ongoing - last updated 2026-02-22*
