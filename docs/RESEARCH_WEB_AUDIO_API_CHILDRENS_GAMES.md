# Web Audio API Implementation Guide for Children's Educational Games (Ages 4-8)

**Document Version:** 1.0  
**Last Updated:** 2026-02-23  
**Target Audience:** Frontend developers building educational games for children  
**Research Scope:** Web Audio API fundamentals, synthesis techniques, browser compatibility, React integration, COPPA compliance

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Web Audio API Fundamentals](#web-audio-api-fundamentals)
3. [Sound Synthesis for Children's Games](#sound-synthesis-for-childrens-games)
4. [Audio File Loading and CC0 Assets](#audio-file-loading-and-cc0-assets)
5. [Volume Control and Muting](#volume-control-and-muting)
6. [Spatial Audio (3D Positioning)](#spatial-audio-3d-positioning)
7. [Performance Optimization](#performance-optimization)
8. [Browser Compatibility and Autoplay Policies](#browser-compatibility-and-autoplay-policies)
9. [Technology Comparison](#technology-comparison)
10. [React Integration Patterns](#react-integration-patterns)
11. [COPPA and Safety Considerations](#coppa-and-safety-considerations)
12. [Complete AudioManager Implementation](#complete-audiomanager-implementation)
13. [References and Resources](#references-and-resources)

---

## Executive Summary

The Web Audio API provides a powerful, modular system for generating and manipulating audio in web-based educational games. For children's games (ages 4-8), synthesized audio offers significant advantages:

- **No external assets** - Reduces loading times and network dependencies
- **Predictable performance** - No decoding delays or format compatibility issues
- **Dynamic variation** - Sounds can be pitch-shifted, combined, and modified in real-time
- **COPPA-friendly** - No third-party audio service dependencies
- **Small bundle size** - Code-based audio vs. audio file downloads

**Key Recommendation:** Use Web Audio API for all synthesized sounds (UI feedback, success/error tones, simple music) and lazy-load CC0 audio files only for complex sounds that cannot be synthesized effectively.

---

## Web Audio API Fundamentals

### Core Architecture

The Web Audio API uses a **node-based routing graph** where audio flows from sources through processing nodes to destinations.

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐
│  Source Node    │───▶│  Effect Node │───▶│  Gain Node  │───▶│ Destination│
│ (Oscillator/    │    │  (Filter/    │    │  (Volume)   │    │ (Speakers) │
│  Buffer)        │    │   Reverb)    │    │             │    │            │
└─────────────────┘    └──────────────┘    └─────────────┘    └───────────┘
```

### Essential Components

#### 1. AudioContext

The `AudioContext` is the container for all audio operations. You must create one before doing anything else.

```typescript
// Create audio context (singleton pattern recommended)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Check state (may be 'suspended' due to autoplay policy)
console.log(audioContext.state); // 'running', 'suspended', or 'closed'

// Resume after user interaction
await audioContext.resume();
```

**Key Properties:**
- `destination`: The audio output device (speakers)
- `currentTime`: High-precision time in seconds (for scheduling)
- `sampleRate`: Audio sample rate (typically 44100 or 48000 Hz)
- `state`: Current state of the context

#### 2. AudioNodes

| Node Type | Purpose | Use Case |
|-----------|---------|----------|
| `OscillatorNode` | Generate periodic waveforms | Tones, beeps, simple instruments |
| `AudioBufferSourceNode` | Play pre-recorded audio | Sound effects, voice clips |
| `GainNode` | Control volume | Master volume, fade in/out |
| `BiquadFilterNode` | Frequency filtering | Tone shaping, equalization |
| `DelayNode` | Echo/reverb effects | Spatial effects, depth |
| `PannerNode` | 3D positioning | Spatial audio |
| `AnalyserNode` | Frequency/time analysis | Visualizations |
| `DynamicsCompressorNode` | Dynamic range compression | Prevent clipping, balance levels |

#### 3. AudioParams

AudioParams allow scheduled parameter changes with precise timing:

```typescript
const gainNode = audioContext.createGain();

// Immediate value set
gainNode.gain.value = 0.5;

// Scheduled changes (high-precision)
gainNode.gain.setValueAtTime(0, audioContext.currentTime);
gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.1);
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

// Other scheduling methods:
// - setValueAtTime(value, time)
// - linearRampToValueAtTime(value, endTime)
// - exponentialRampToValueAtTime(value, endTime)
// - setTargetAtTime(target, startTime, timeConstant)
// - setValueCurveAtTime(valuesArray, startTime, duration)
```

#### 4. Oscillator Types

```typescript
const oscillator = audioContext.createOscillator();

// Available waveforms:
oscillator.type = 'sine';      // Pure tone, smooth, flute-like
oscillator.type = 'square';    // Hollow, clarinet-like, contains odd harmonics
oscillator.type = 'sawtooth';  // Bright, buzzy, string-like, all harmonics
oscillator.type = 'triangle';  // Softer than square, mellow, flute-like

// Custom periodic wave (for richer tones)
const real = new Float32Array([0, 1, 0.5, 0.25]); // Fundamental + harmonics
const imag = new Float32Array(real.length);
const customWave = audioContext.createPeriodicWave(real, imag);
oscillator.setPeriodicWave(customWave);
```

**Recommendation for Children's Games:**
- Use `'sine'` for gentle, non-startling sounds (success, UI)
- Use `'triangle'` for slightly brighter but still soft sounds
- Avoid `'square'` and `'sawtooth'` for young children (can be harsh)

---

## Sound Synthesis for Children's Games

### Frequency Guidelines for Children (Ages 4-8)

Research indicates children's hearing sensitivity differs from adults:

| Frequency Range | Perception | Recommendation |
|-----------------|------------|----------------|
| 250-500 Hz | Warm, comfortable | Good for background/ambient |
| 500-1000 Hz | Clear, present | Best for voice-like sounds |
| 1000-2000 Hz | Bright, attention-getting | Ideal for success feedback |
| 2000-4000 Hz | Sharp, piercing | Use sparingly, can be startling |
| 4000+ Hz | Very bright, potentially uncomfortable | Avoid or use at very low volumes |

**Musical Note Frequencies (Child-Friendly Range):**

```typescript
// C4 to C6 (comfortable range for children)
const NOTES = {
  // Lower octave - calming
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  
  // Middle octave - bright and clear
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 783.99, A5: 880.00, B5: 987.77,
  
  // Upper octave - use sparingly
  C6: 1046.50,
} as const;
```

### Synthesizing Common Game Sounds

#### 1. Success/Correct Answer Sounds

**Design Principles:**
- Ascending pitch pattern (positive association)
- Major chord progression (happy emotion)
- Quick attack, gentle decay
- Volume: 0.2-0.4 (not startling)

```typescript
/**
 * Play a success chime - ascending major triad
 * Creates a happy, encouraging sound perfect for correct answers
 */
async function playSuccessChord(
  audioContext: AudioContext,
  volume: number = 0.3
): Promise<void> {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major)
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    
    const startTime = audioContext.currentTime + index * 0.08;
    
    // Envelope: quick attack, gentle decay
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.4);
  });
}

/**
 * Alternative: Single pleasant chime with harmonic overtones
 */
async function playSuccessChime(
  audioContext: AudioContext,
  volume: number = 0.25
): Promise<void> {
  const fundamental = 880; // A5 - bright but not harsh
  
  // Create fundamental + gentle overtone
  const frequencies = [fundamental, fundamental * 1.5]; // Fundamental + perfect fifth
  
  frequencies.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * (i === 0 ? 1 : 0.3), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  });
}
```

#### 2. Error/Incorrect Sounds

**Design Principles:**
- Descending pitch or lower frequency (gentle, not punitive)
- Soft volume (0.1-0.2)
- Brief duration (avoid frustration)
- Non-jarring waveform

```typescript
/**
 * Gentle error feedback - descending tone
 * Encourages retry without being discouraging
 */
async function playGentleError(
  audioContext: AudioContext,
  volume: number = 0.15
): Promise<void> {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.type = 'triangle'; // Softer than square/sawtooth
  
  const now = audioContext.currentTime;
  
  // Descending pitch: gentle slide down
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
  
  // Soft envelope
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Alternative: Soft "bloop" sound
 */
async function playSoftBloop(
  audioContext: AudioContext,
  volume: number = 0.12
): Promise<void> {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.type = 'sine';
  
  const now = audioContext.currentTime;
  
  // Quick downward slide
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.start(now);
  osc.stop(now + 0.15);
}
```

#### 3. UI Clicks and Hovers

**Design Principles:**
- Very short duration (< 50ms)
- Low volume (0.05-0.1)
- High frequency for tactile feel
- Immediate response

```typescript
/**
 * Subtle click for button presses
 */
async function playClick(
  audioContext: AudioContext,
  volume: number = 0.08
): Promise<void> {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.type = 'sine';
  osc.frequency.value = 1200; // High but not piercing
  
  const now = audioContext.currentTime;
  
  // Very short, sharp envelope
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Softer hover sound
 */
async function playHover(
  audioContext: AudioContext,
  volume: number = 0.05
): Promise<void> {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.type = 'sine';
  osc.frequency.value = 600;
  
  const now = audioContext.currentTime;
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  
  osc.start(now);
  osc.stop(now + 0.08);
}
```

#### 4. Celebration/Fanfare Sounds

**Design Principles:**
- Ascending arpeggio or scale
- Major key (happy, triumphant)
- Slightly longer duration (reward feeling)
- Moderate volume (0.3-0.4)
- Can use triangle wave for fuller sound

```typescript
/**
 * Celebration fanfare - ascending then holding
 * Perfect for level completion or big achievements
 */
async function playCelebration(
  audioContext: AudioContext,
  volume: number = 0.35
): Promise<void> {
  // G4, C5, E5, G5 (ascending arpeggio)
  const notes = [
    { freq: 392.00, time: 0.00, duration: 0.15 },
    { freq: 523.25, time: 0.12, duration: 0.15 },
    { freq: 659.25, time: 0.24, duration: 0.15 },
    { freq: 783.99, time: 0.36, duration: 0.5 },  // Hold final note
  ];
  
  notes.forEach(({ freq, time, duration }) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'triangle'; // Fuller sound for celebration
    osc.frequency.value = freq;
    
    const startTime = audioContext.currentTime + time;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

/**
 * Sparkle sound effect (multiple rapid notes)
 * Great for star collection or bonus points
 */
async function playSparkle(
  audioContext: AudioContext,
  volume: number = 0.25
): Promise<void> {
  const baseFreq = 1046.50; // C6
  const notes = [1, 1.25, 1.5, 2, 2.5]; // Harmonic series intervals
  
  notes.forEach((multiplier, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    osc.frequency.value = baseFreq * multiplier;
    
    const startTime = audioContext.currentTime + i * 0.06;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * (1 - i * 0.15), startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
}
```

#### 5. Background Ambient Loops

**Design Principles:**
- Very low volume (0.05-0.1)
- Slow, gentle changes
- No sudden volume spikes
- Can use LFO (Low Frequency Oscillator) for variation
- Consider using AudioBuffer for complex ambient sounds

```typescript
/**
 * Gentle ambient drone using LFO
 * Creates a calming background atmosphere
 */
async function createAmbientDrone(
  audioContext: AudioContext,
  volume: number = 0.05
): Promise<{ stop: () => void }> {
  // Create multiple oscillators for a rich, non-repetitive sound
  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [];
  
  // Base frequencies for a calming chord (C major 7)
  const frequencies = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4
  
  frequencies.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Very slow LFO for gentle volume modulation
    lfo.type = 'sine';
    lfo.frequency.value = 0.1 + i * 0.05; // Different rates for each voice
    lfoGain.gain.value = volume * 0.3; // Modulation depth
    
    // Base volume
    gain.gain.value = volume * (0.5 + Math.random() * 0.3);
    
    osc.start();
    lfo.start();
    
    oscillators.push(osc, lfo);
    gainNodes.push(gain, lfoGain);
  });
  
  return {
    stop: () => {
      oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch { /* already stopped */ }
      });
      gainNodes.forEach(gain => gain.disconnect());
    }
  };
}
```

---

## Audio File Loading and CC0 Assets

### When to Use Audio Files vs. Synthesis

| Use Case | Recommendation | Reason |
|----------|---------------|--------|
| UI feedback | Synthesis | Faster, more responsive |
| Simple success/error | Synthesis | Consistent, no loading |
| Voice narration | Audio files | Cannot synthesize naturally |
| Complex music | Audio files | Richer than synthesis |
| Environmental sounds | Audio files | Nature sounds, animals |
| Character voices | Audio files | Personality, expression |

### Loading and Playing Audio Files

```typescript
/**
 * Audio file loader with buffer pooling
 */
class AudioFileManager {
  private context: AudioContext;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  
  constructor(context: AudioContext) {
    this.context = context;
  }
  
  /**
   * Load and decode audio file
   */
  async loadSound(url: string): Promise<AudioBuffer> {
    // Return cached buffer if available
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load sound: ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    
    this.bufferCache.set(url, audioBuffer);
    return audioBuffer;
  }
  
  /**
   * Preload multiple sounds
   */
  async preloadSounds(urls: string[]): Promise<void> {
    await Promise.all(urls.map(url => this.loadSound(url).catch(err => {
      console.warn(`Failed to preload: ${url}`, err);
    })));
  }
  
  /**
   * Play a loaded sound
   */
  playSound(
    buffer: AudioBuffer,
    options: {
      volume?: number;
      playbackRate?: number;
      loop?: boolean;
      onEnded?: () => void;
    } = {}
  ): AudioBufferSourceNode {
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    source.playbackRate.value = options.playbackRate ?? 1;
    source.loop = options.loop ?? false;
    
    gainNode.gain.value = options.volume ?? 1;
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    source.onended = () => {
      this.activeSources.delete(source);
      options.onEnded?.();
    };
    
    this.activeSources.add(source);
    source.start();
    
    return source;
  }
  
  /**
   * Stop all playing sounds
   */
  stopAll(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch { /* already stopped */ }
    });
    this.activeSources.clear();
  }
  
  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.bufferCache.clear();
  }
}
```

### Recommended CC0 Audio Sources

| Resource | URL | Content Type | Notes |
|----------|-----|--------------|-------|
| Freesound | freesound.org | All types | Filter by CC0 license |
| OpenGameArt | opengameart.org | Game audio | Organized by category |
| Kenney Assets | kenney.nl | UI, effects | High quality, consistent style |
| ZapSplat | zapsplat.com | All types | Free with account |
| BBC Sound Effects | bbcsfx.acropolis.org.uk | Archive | Historical/creative |

**File Format Recommendations:**
- **OGG/Vorbis** - Best compression, good quality (use for long sounds)
- **MP3** - Universal support, avoid for short loops (padding issues)
- **WAV** - Uncompressed, use for short sound effects (no decoding delay)
- **AAC** - Good mobile support, efficient

---

## Volume Control and Muting

### Volume Architecture

```typescript
/**
 * Volume control with multiple gain stages
 * Allows independent control of different sound categories
 */
class VolumeManager {
  private context: AudioContext;
  private masterGain: GainNode;
  private categoryGains: Map<string, GainNode> = new Map();
  
  // Volume levels (0-1)
  private masterVolume = 1;
  private categoryVolumes: Map<string, number> = new Map();
  private muted = false;
  
  constructor(context: AudioContext) {
    this.context = context;
    this.masterGain = context.createGain();
    this.masterGain.connect(context.destination);
  }
  
  /**
   * Get or create category gain node
   */
  getCategoryGain(category: string): GainNode {
    if (!this.categoryGains.has(category)) {
      const gain = this.context.createGain();
      gain.connect(this.masterGain);
      this.categoryGains.set(category, gain);
      this.categoryVolumes.set(category, 1);
    }
    return this.categoryGains.get(category)!;
  }
  
  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterGain();
  }
  
  /**
   * Set category volume
   */
  setCategoryVolume(category: string, volume: number): void {
    this.categoryVolumes.set(category, Math.max(0, Math.min(1, volume)));
    const gain = this.categoryGains.get(category);
    if (gain) {
      gain.gain.setTargetAtTime(
        this.getEffectiveCategoryVolume(category),
        this.context.currentTime,
        0.1 // Smooth transition
      );
    }
  }
  
  /**
   * Get effective volume for category
   */
  getEffectiveCategoryVolume(category: string): number {
    if (this.muted) return 0;
    const catVol = this.categoryVolumes.get(category) ?? 1;
    return catVol * this.masterVolume;
  }
  
  /**
   * Toggle mute
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.updateMasterGain();
  }
  
  private updateMasterGain(): void {
    const targetVolume = this.muted ? 0 : this.masterVolume;
    this.masterGain.gain.setTargetAtTime(
      targetVolume,
      this.context.currentTime,
      0.05
    );
  }
  
  /**
   * Get output node to connect sounds to
   */
  getOutputNode(category: string = 'default'): AudioNode {
    return this.getCategoryGain(category);
  }
}
```

### Recommended Volume Levels for Children's Games

```typescript
const VOLUME_GUIDELINES = {
  ui: {
    click: 0.08,
    hover: 0.05,
    transition: 0.1,
  },
  feedback: {
    success: 0.25,
    error: 0.15,
    celebration: 0.35,
  },
  ambient: {
    background: 0.05,
    music: 0.15,
  },
  voice: {
    narration: 0.8,
    character: 0.6,
  },
  effects: {
    short: 0.2,
    medium: 0.3,
    long: 0.25,
  },
} as const;
```

---

## Spatial Audio (3D Positioning)

### Is Spatial Audio Worth It for Children's Games?

**Verdict:** Generally **NOT recommended** for ages 4-8 educational games.

**Reasons:**
1. **Cognitive load** - Young children may find directional audio confusing
2. **Hardware variability** - Headphones not always available; device speakers provide poor spatial separation
3. **Limited benefit** - Educational games rarely need positional audio cues
4. **Complexity** - Adds code complexity for minimal educational value

**When It Might Be Useful:**
- Games specifically teaching left/right discrimination
- "Find the sound" listening games
- Older children (7-8) with headphone use

### Implementation (If Needed)

```typescript
/**
 * Simple 2D panning (simpler than full 3D spatial audio)
 * Maps x position (-1 to 1) to stereo balance
 */
function createPanner2D(
  context: AudioContext,
  x: number // -1 (left) to 1 (right)
): StereoPannerNode {
  const panner = context.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, x));
  return panner;
}

/**
 * Full 3D spatial audio (if specifically needed)
 */
function createSpatialPanner(
  context: AudioContext,
  x: number,
  y: number,
  z: number
): PannerNode {
  const panner = context.createPanner();
  panner.panningModel = 'HRTF'; // Head-related transfer function
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 100;
  panner.rolloffFactor = 1;
  
  panner.positionX.value = x;
  panner.positionY.value = y;
  panner.positionZ.value = z;
  
  return panner;
}
```

---

## Performance Optimization

### Buffer Pooling

```typescript
/**
 * Object pool for audio nodes to reduce GC pressure
 */
class AudioNodePool {
  private context: AudioContext;
  private oscillatorPool: OscillatorNode[] = [];
  private gainPool: GainNode[] = [];
  private maxPoolSize = 20;
  
  constructor(context: AudioContext) {
    this.context = context;
  }
  
  acquireOscillator(): OscillatorNode {
    return this.oscillatorPool.pop() || this.context.createOscillator();
  }
  
  acquireGain(): GainNode {
    return this.gainPool.pop() || this.context.createGain();
  }
  
  releaseOscillator(osc: OscillatorNode): void {
    if (this.oscillatorPool.length < this.maxPoolSize) {
      try {
        osc.disconnect();
        this.oscillatorPool.push(osc);
      } catch { /* ignore */ }
    }
  }
  
  releaseGain(gain: GainNode): void {
    if (this.gainPool.length < this.maxPoolSize) {
      try {
        gain.disconnect();
        this.gainPool.push(gain);
      } catch { /* ignore */ }
    }
  }
}
```

### Throttling Rapid Sounds

```typescript
/**
 * Rate limiter for audio playback
 * Prevents audio overload from rapid user actions
 */
class AudioRateLimiter {
  private lastPlayTimes: Map<string, number> = new Map();
  
  constructor(
    private minIntervalMs: number = 50 // Minimum ms between sounds
  ) {}
  
  canPlay(soundId: string): boolean {
    const now = performance.now();
    const lastPlay = this.lastPlayTimes.get(soundId) ?? 0;
    
    if (now - lastPlay >= this.minIntervalMs) {
      this.lastPlayTimes.set(soundId, now);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get throttled play function
   */
  throttle<T extends (...args: any[]) => void>(
    soundId: string,
    fn: T
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.canPlay(soundId)) {
        fn(...args);
      }
    };
  }
}
```

### Memory Management

```typescript
/**
 * Automatic cleanup of finished audio nodes
 */
class AudioCleanupManager {
  private cleanupInterval: number | null = null;
  private pendingCleanup: Set<{
    node: AudioNode;
    stopTime: number;
  }> = new Set();
  
  startCleanup(intervalMs: number = 1000): void {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = window.setInterval(() => {
      const now = performance.now();
      this.pendingCleanup.forEach(item => {
        if (now >= item.stopTime) {
          try {
            item.node.disconnect();
          } catch { /* ignore */ }
          this.pendingCleanup.delete(item);
        }
      });
    }, intervalMs);
  }
  
  scheduleCleanup(node: AudioNode, afterMs: number): void {
    this.pendingCleanup.add({
      node,
      stopTime: performance.now() + afterMs,
    });
  }
  
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.pendingCleanup.clear();
  }
}
```

---

## Browser Compatibility and Autoplay Policies

### Browser Support (2025)

| Browser | Web Audio API Support | Notes |
|---------|----------------------|-------|
| Chrome/Edge | ✅ Full | Best performance |
| Firefox | ✅ Full | Good performance |
| Safari | ✅ Full | Some quirks with AudioContext |
| Opera | ✅ Full | Chromium-based |
| iOS Safari | ✅ Full | Must handle user gesture requirement |
| Android Chrome | ✅ Full | Watch for power saving modes |

### Autoplay Policy

**Critical:** Modern browsers block audio autoplay until user interaction.

```typescript
/**
 * Autoplay policy handler
 */
class AutoplayPolicyManager {
  private context: AudioContext;
  private hasUserInteraction = false;
  
  constructor(context: AudioContext) {
    this.context = context;
    this.setupInteractionListeners();
  }
  
  private setupInteractionListeners(): void {
    const events = ['click', 'touchstart', 'keydown'];
    
    const handler = async () => {
      if (!this.hasUserInteraction) {
        this.hasUserInteraction = true;
        
        // Try to resume context
        if (this.context.state === 'suspended') {
          await this.context.resume();
        }
        
        // Remove listeners
        events.forEach(event => {
          document.removeEventListener(event, handler);
        });
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handler, { once: true });
    });
  }
  
  /**
   * Check if audio can play
   */
  canAutoplay(): boolean {
    return this.hasUserInteraction && this.context.state === 'running';
  }
  
  /**
   * Ensure context is ready before playing
   */
  async ensureReady(): Promise<boolean> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return this.context.state === 'running';
  }
}
```

### iOS Safari Specific Handling

```typescript
/**
 * iOS Safari requires special handling for AudioContext
 */
async function setupIOSSafariAudio(context: AudioContext): Promise<void> {
  // iOS Safari may suspend context when app goes to background
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      if (context.state === 'suspended') {
        await context.resume();
      }
    }
  });
  
  // Handle page show events (back button navigation)
  window.addEventListener('pageshow', async (event) => {
    if (event.persisted && context.state === 'suspended') {
      await context.resume();
    }
  });
}
```

---

## Technology Comparison

### Web Audio API vs HTML5 Audio vs Howler.js

| Feature | Web Audio API | HTML5 Audio | Howler.js |
|---------|---------------|-------------|-----------|
| **Synthesis** | ✅ Full support | ❌ None | ❌ None |
| **Precise Timing** | ✅ Sample-accurate | ❌ Limited | ✅ Via Web Audio |
| **Effects Chain** | ✅ Full routing | ❌ None | ✅ Limited |
| **Spatial Audio** | ✅ Full 3D | ❌ Stereo only | ✅ Stereo panning |
| **File Size** | ✅ Native (0KB) | ✅ Native (0KB) | ❌ ~15KB gzipped |
| **Mobile Support** | ✅ Good | ⚠️ Autoplay issues | ✅ Handles quirks |
| **Complexity** | ⚠️ Moderate | ✅ Simple | ✅ Simple API |
| **Audio Sprites** | ⚠️ Manual | ⚠️ Manual | ✅ Built-in |
| **Codec Fallback** | ❌ Manual | ✅ Built-in | ✅ Automatic |

### Recommendation Matrix

| Project Type | Recommendation |
|--------------|----------------|
| Simple games with synthesized audio only | **Web Audio API** |
| Games with many audio files | **Howler.js** |
| Educational apps with voice narration | **Howler.js** or hybrid |
| Maximum control, minimal dependencies | **Web Audio API** |
| Rapid prototyping | **Howler.js** |
| Music production/education apps | **Web Audio API** |

---

## React Integration Patterns

### Hook-Based Architecture

```typescript
// hooks/useAudioManager.ts
import { useEffect, useRef, useCallback } from 'react';

export interface AudioManager {
  playSuccess: () => Promise<void>;
  playError: () => Promise<void>;
  playClick: () => Promise<void>;
  playCelebration: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export function useAudioManager(
  enabled: boolean = true
): AudioManager {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Update ref when prop changes
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  
  // Initialize audio context
  const getContext = useCallback((): AudioContext | null => {
    if (!contextRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      
      try {
        contextRef.current = new AC();
        masterGainRef.current = contextRef.current.createGain();
        masterGainRef.current.connect(contextRef.current.destination);
      } catch (e) {
        console.warn('AudioContext init failed:', e);
        return null;
      }
    }
    return contextRef.current;
  }, []);
  
  // Ensure context is running
  const ensureRunning = useCallback(async (): Promise<AudioContext | null> => {
    const ctx = getContext();
    if (!ctx) return null;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [getContext]);
  
  // Play tone helper
  const playTone = useCallback(async (
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): Promise<void> => {
    if (!enabledRef.current) return;
    
    const ctx = await ensureRunning();
    if (!ctx || !masterGainRef.current) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  }, [ensureRunning]);
  
  // Public methods
  const playSuccess = useCallback(async () => {
    if (!enabledRef.current) return;
    const ctx = await ensureRunning();
    if (!ctx) return;
    
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.3, 'sine', 0.2);
      }, i * 80);
    });
  }, [ensureRunning, playTone]);
  
  const playError = useCallback(async () => {
    await playTone(200, 0.2, 'triangle', 0.15);
  }, [playTone]);
  
  const playClick = useCallback(async () => {
    await playTone(1200, 0.05, 'sine', 0.08);
  }, [playTone]);
  
  const playCelebration = useCallback(async () => {
    if (!enabledRef.current) return;
    const ctx = await ensureRunning();
    if (!ctx) return;
    
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, i === 3 ? 0.5 : 0.15, 'triangle', 0.3);
      }, i * 120);
    });
  }, [ensureRunning, playTone]);
  
  const setMuted = useCallback((muted: boolean) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        muted ? 0 : 1,
        (getContext()?.currentTime ?? 0),
        0.1
      );
    }
  }, [getContext]);
  
  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)),
        (getContext()?.currentTime ?? 0),
        0.1
      );
    }
  }, [getContext]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, []);
  
  return {
    playSuccess,
    playError,
    playClick,
    playCelebration,
    setMuted,
    setVolume,
  };
}
```

### Context Provider Pattern

```typescript
// context/AudioContext.tsx
import React, { createContext, useContext, useCallback } from 'react';
import { useAudioManager } from '../hooks/useAudioManager';
import type { AudioManager } from '../hooks/useAudioManager';

const AudioContext = createContext<AudioManager | null>(null);

export const AudioProvider: React.FC<{
  children: React.ReactNode;
  enabled?: boolean;
}> = ({ children, enabled = true }) => {
  const audio = useAudioManager(enabled);
  
  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioManager => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

// Usage in component:
// const { playSuccess } = useAudio();
```

---

## COPPA and Safety Considerations

### COPPA Compliance for Audio

**Federal Trade Commission (FTC) Guidelines:**

1. **Voice Recordings Are Personal Information**
   - Under COPPA, voice recordings are classified as personal information
   - Verifiable parental consent required before recording children's voices

2. **Temporary Voice Recording Exception**
   - FTC allows temporary voice recordings for immediate processing ONLY
   - Must be deleted immediately after processing
   - Cannot be stored, shared, or used for other purposes

### Audio Safety Best Practices

```typescript
/**
 * Audio safety configuration for children's games
 */
const AUDIO_SAFETY_CONFIG = {
  // Volume limits (prevent hearing damage)
  maxVolume: 0.8, // Never exceed 80%
  defaultVolume: 0.5,
  
  // Frequency limits (avoid uncomfortable ranges)
  maxFrequency: 8000, // Hz - avoid very high pitches
  minFrequency: 100,  // Hz - avoid very low rumbles
  
  // Duration limits (prevent annoyance)
  maxEffectDuration: 3000, // ms
  loopWarningThreshold: 30000, // Warn if looping > 30s
  
  // Time-based muting (late night)
  quietHours: {
    start: 21, // 9 PM
    end: 7,    // 7 AM
    maxVolumeDuringQuiet: 0.2,
  },
} as const;
```

### Privacy-Safe Audio Implementation

```typescript
/**
 * Privacy-safe audio recorder (for games requiring voice input)
 * Follows COPPA guidelines for temporary processing
 */
class PrivacySafeAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  /**
   * Start recording (requires parental consent)
   */
  async startRecording(): Promise<boolean> {
    // TODO: Implement verifiable parental consent check
    // This is a legal requirement under COPPA
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Recording failed:', err);
      return false;
    }
  }
  
  /**
   * Stop and process recording immediately
   * IMPORTANT: Audio is processed and discarded - never stored
   */
  async stopAndProcess<T>(
    processor: (audioBlob: Blob) => Promise<T>
  ): Promise<T | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        
        // Process immediately
        const result = await processor(blob);
        
        // CRITICAL: Clear all audio data
        this.recordedChunks = [];
        this.stopStream();
        
        resolve(result);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  private stopStream(): void {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.mediaRecorder = null;
  }
  
  /**
   * Emergency cleanup
   */
  dispose(): void {
    this.recordedChunks = [];
    this.stopStream();
  }
}
```

### Audio Content Safety Checklist

- [ ] No startling loud sounds
- [ ] No sudden frequency jumps
- [ ] Volume defaults to 50% or lower
- [ ] Clear mute/unmute control
- [ ] No audio that could trigger seizures (no rapid flashing patterns if audio-visual synced)
- [ ] No microphone recording without parental consent
- [ ] No audio file uploads by children
- [ ] All audio is locally generated or from trusted sources
- [ ] Volume cannot exceed safe levels even at "100%"

---

## Complete AudioManager Implementation

```typescript
// services/AudioManager.ts

/**
 * Comprehensive AudioManager for children's educational games
 * Features:
 * - Sound synthesis (no external files needed for basic sounds)
 * - Volume control with categories
 * - Rate limiting for rapid events
 * - Autoplay policy handling
 * - COPPA-safe design
 */

export type SoundCategory = 'ui' | 'feedback' | 'ambient' | 'voice' | 'effect';

export interface AudioManagerConfig {
  enabled?: boolean;
  masterVolume?: number;
  categoryVolumes?: Partial<Record<SoundCategory, number>>;
  rateLimitMs?: number;
  maxPolyphony?: number;
}

export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private categoryGains: Map<SoundCategory, GainNode> = new Map();
  private enabled = true;
  private masterVolume = 1;
  private categoryVolumes: Map<SoundCategory, number> = new Map();
  private lastPlayTimes: Map<string, number> = new Map();
  private activeSources: Set<AudioScheduledSourceNode> = new Set();
  private maxPolyphony: number;
  private rateLimitMs: number;
  
  // Frequency constants (child-friendly)
  private readonly NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
  } as const;
  
  constructor(config: AudioManagerConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.masterVolume = config.masterVolume ?? 1;
    this.maxPolyphony = config.maxPolyphony ?? 32;
    this.rateLimitMs = config.rateLimitMs ?? 50;
    
    // Initialize category volumes
    const defaultCategoryVolumes: Record<SoundCategory, number> = {
      ui: 0.8,
      feedback: 1,
      ambient: 0.5,
      voice: 1,
      effect: 0.8,
    };
    
    Object.entries(defaultCategoryVolumes).forEach(([cat, vol]) => {
      this.categoryVolumes.set(
        cat as SoundCategory,
        config.categoryVolumes?.[cat as SoundCategory] ?? vol
      );
    });
    
    this.setupInteractionHandling();
  }
  
  /**
   * Initialize audio context (call after user interaction)
   */
  async initialize(): Promise<boolean> {
    if (this.context) {
      return this.ensureRunning();
    }
    
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) {
      console.warn('Web Audio API not supported');
      return false;
    }
    
    try {
      this.context = new AC();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.updateMasterGain();
      
      // Create category gain nodes
      const categories: SoundCategory[] = ['ui', 'feedback', 'ambient', 'voice', 'effect'];
      categories.forEach(cat => {
        const gain = this.context!.createGain();
        gain.connect(this.masterGain!);
        this.categoryGains.set(cat, gain);
        this.updateCategoryGain(cat);
      });
      
      return this.ensureRunning();
    } catch (e) {
      console.error('Audio initialization failed:', e);
      return false;
    }
  }
  
  /**
   * Ensure context is running
   */
  private async ensureRunning(): Promise<boolean> {
    if (!this.context) return false;
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return this.context.state === 'running';
  }
  
  /**
   * Setup user interaction handling for autoplay policy
   */
  private setupInteractionHandling(): void {
    const events = ['click', 'touchstart', 'keydown'];
    const handler = () => {
      this.initialize();
      events.forEach(e => document.removeEventListener(e, handler));
    };
    events.forEach(e => document.addEventListener(e, handler, { once: true }));
  }
  
  // ==================== SOUND SYNTHESIS ====================
  
  /**
   * Play success sound - ascending major triad
   */
  async playSuccess(): Promise<void> {
    if (!this.canPlay('success')) return;
    if (!await this.ensureRunning()) return;
    
    const notes = [this.NOTES.C5, this.NOTES.E5, this.NOTES.G5];
    const now = this.context!.currentTime;
    
    notes.forEach((freq, i) => {
      this.scheduleTone({
        frequency: freq,
        startTime: now + i * 0.08,
        duration: 0.35,
        type: 'sine',
        volume: 0.2,
        category: 'feedback',
      });
    });
  }
  
  /**
   * Play gentle error sound
   */
  async playError(): Promise<void> {
    if (!this.canPlay('error')) return;
    if (!await this.ensureRunning()) return;
    
    const now = this.context!.currentTime;
    this.scheduleTone({
      frequency: 250,
      startTime: now,
      duration: 0.25,
      type: 'triangle',
      volume: 0.12,
      category: 'feedback',
      frequencySlide: { to: 180, duration: 0.25 },
    });
  }
  
  /**
   * Play UI click sound
   */
  async playClick(): Promise<void> {
    if (!this.canPlay('click')) return;
    if (!await this.ensureRunning()) return;
    
    this.scheduleTone({
      frequency: 1200,
      startTime: this.context!.currentTime,
      duration: 0.05,
      type: 'sine',
      volume: 0.06,
      category: 'ui',
    });
  }
  
  /**
   * Play hover sound
   */
  async playHover(): Promise<void> {
    if (!this.canPlay('hover')) return;
    if (!await this.ensureRunning()) return;
    
    this.scheduleTone({
      frequency: 600,
      startTime: this.context!.currentTime,
      duration: 0.08,
      type: 'sine',
      volume: 0.04,
      category: 'ui',
    });
  }
  
  /**
   * Play celebration fanfare
   */
  async playCelebration(): Promise<void> {
    if (!this.canPlay('celebration')) return;
    if (!await this.ensureRunning()) return;
    
    const notes = [
      { freq: this.NOTES.G4, time: 0, duration: 0.15 },
      { freq: this.NOTES.C5, time: 0.12, duration: 0.15 },
      { freq: this.NOTES.E5, time: 0.24, duration: 0.15 },
      { freq: this.NOTES.G5, time: 0.36, duration: 0.5 },
    ];
    const now = this.context!.currentTime;
    
    notes.forEach(({ freq, time, duration }) => {
      this.scheduleTone({
        frequency: freq,
        startTime: now + time,
        duration,
        type: 'triangle',
        volume: 0.25,
        category: 'feedback',
      });
    });
  }
  
  /**
   * Play pop sound
   */
  async playPop(): Promise<void> {
    if (!this.canPlay('pop')) return;
    if (!await this.ensureRunning()) return;
    
    this.scheduleTone({
      frequency: 400,
      startTime: this.context!.currentTime,
      duration: 0.1,
      type: 'sine',
      volume: 0.1,
      category: 'effect',
    });
  }
  
  /**
   * Play start/game begin sound
   */
  async playStart(): Promise<void> {
    if (!this.canPlay('start')) return;
    if (!await this.ensureRunning()) return;
    
    this.scheduleTone({
      frequency: this.NOTES.A4,
      startTime: this.context!.currentTime,
      duration: 0.2,
      type: 'sine',
      volume: 0.18,
      category: 'feedback',
    });
  }
  
  // ==================== CORE SCHEDULING ====================
  
  private scheduleTone(params: {
    frequency: number;
    startTime: number;
    duration: number;
    type: OscillatorType;
    volume: number;
    category: SoundCategory;
    frequencySlide?: { to: number; duration: number };
  }): void {
    if (!this.context) return;
    
    // Check polyphony limit
    if (this.activeSources.size >= this.maxPolyphony) {
      // Remove oldest source
      const oldest = this.activeSources.values().next().value;
      if (oldest) {
        try { oldest.stop(); } catch { }
        this.activeSources.delete(oldest);
      }
    }
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const categoryGain = this.categoryGains.get(params.category);
    
    osc.connect(gain);
    if (categoryGain) {
      gain.connect(categoryGain);
    } else {
      gain.connect(this.masterGain!);
    }
    
    osc.type = params.type;
    osc.frequency.setValueAtTime(params.frequency, params.startTime);
    
    if (params.frequencySlide) {
      osc.frequency.exponentialRampToValueAtTime(
        params.frequencySlide.to,
        params.startTime + params.frequencySlide.duration
      );
    }
    
    // Envelope
    gain.gain.setValueAtTime(0, params.startTime);
    gain.gain.linearRampToValueAtTime(
      params.volume,
      params.startTime + 0.02
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      params.startTime + params.duration
    );
    
    osc.start(params.startTime);
    osc.stop(params.startTime + params.duration);
    
    this.activeSources.add(osc);
    osc.onended = () => {
      this.activeSources.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
  }
  
  // ==================== RATE LIMITING ====================
  
  private canPlay(soundId: string): boolean {
    if (!this.enabled) return false;
    
    const now = performance.now();
    const lastPlay = this.lastPlayTimes.get(soundId) ?? 0;
    
    if (now - lastPlay < this.rateLimitMs) {
      return false;
    }
    
    this.lastPlayTimes.set(soundId, now);
    return true;
  }
  
  // ==================== VOLUME CONTROL ====================
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }
  
  setMuted(muted: boolean): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : this.masterVolume,
        this.context?.currentTime ?? 0,
        0.1
      );
    }
  }
  
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterGain();
  }
  
  private updateMasterGain(): void {
    if (this.masterGain && this.enabled) {
      this.masterGain.gain.setTargetAtTime(
        this.masterVolume,
        this.context?.currentTime ?? 0,
        0.1
      );
    }
  }
  
  setCategoryVolume(category: SoundCategory, volume: number): void {
    this.categoryVolumes.set(category, Math.max(0, Math.min(1, volume)));
    this.updateCategoryGain(category);
  }
  
  private updateCategoryGain(category: SoundCategory): void {
    const gain = this.categoryGains.get(category);
    if (!gain || !this.context) return;
    
    const vol = this.categoryVolumes.get(category) ?? 1;
    gain.gain.setTargetAtTime(vol, this.context.currentTime, 0.1);
  }
  
  // ==================== LIFECYCLE ====================
  
  stopAll(): void {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch { }
    });
    this.activeSources.clear();
  }
  
  dispose(): void {
    this.stopAll();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(config?: AudioManagerConfig): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager(config);
  }
  return audioManagerInstance;
}

export function resetAudioManager(): void {
  audioManagerInstance?.dispose();
  audioManagerInstance = null;
}
```

---

## References and Resources

### Official Documentation

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN Web Audio Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Web Audio Autoplay Policy](https://developer.chrome.com/blog/web-audio-autoplay)
- [Audio for Web Games (MDN)](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games)

### FTC COPPA Resources

- [FTC COPPA Guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [COPPA and Voice Recordings](https://www.ftc.gov/news-events/news/press-releases/2017/10/ftc-provides-additional-guidance-coppa-and-voice-recordings)

### Audio Design Resources

- [Web Audio Weekly](https://www.webaudioweekly.com/) - Newsletter with techniques
- [The Theory and Technique of Electronic Music](https://msp.ucsd.edu/techniques.htm) - Miller Puckette
- [Acoustics for Engineers](https://link.springer.com/book/10.1007/978-3-030-61198-0) - Jens Blauert

### Tools

- [Web Audio Inspector (Chrome DevTools)](https://developer.chrome.com/docs/devtools/web-audio)
- [Web Audio Playground](https://webaudioplayground.appspot.com/) - Visual node editor
- [Sonic Pi](https://sonic-pi.net/) - Code-based music (inspiration for synthesis)

---

## Summary

### Key Takeaways

1. **Use synthesized audio for UI and feedback** - Faster, more reliable, no network dependency
2. **Master the envelope** - Attack/decay/sustain/release shapes the character of sounds
3. **Keep volumes low for children** - Default to 20-30% of maximum
4. **Handle autoplay policy** - Always initialize after user interaction
5. **Respect COPPA** - Voice recordings require parental consent
6. **Prefer sine/triangle waves** - Gentler for young ears
7. **Use frequency range 200-2000 Hz** - Comfortable for children
8. **Test on actual devices** - Mobile audio behaves differently

### Implementation Checklist

- [ ] AudioManager singleton created
- [ ] User interaction handling for autoplay
- [ ] Volume controls accessible in UI
- [ ] All synthesized sounds tested on target devices
- [ ] Rate limiting implemented for rapid events
- [ ] Cleanup/dispose methods implemented
- [ ] COPPA compliance verified (if recording audio)
- [ ] Mobile testing completed
- [ ] Fallback for unsupported browsers

---

*Document created for the Advay Vision Learning project. Last updated 2026-02-23.*
