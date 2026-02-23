# Web Audio API Implementation Guide for Children's Games

**Date:** 2026-02-23  
**Purpose:** Comprehensive guide for implementing game audio using Web Audio API

---

## 1. Why Web Audio API?

### Advantages Over Traditional Audio

| Feature | Web Audio API | HTML5 Audio | Howler.js |
|---------|--------------|-------------|-----------|
| **Bundle Size** | ~0KB (built-in) | ~0KB | ~15KB |
| **Latency** | <10ms | 100-300ms | 20-50ms |
| **Synthesis** | ✅ Yes | ❌ No | ❌ No |
| **Spatial Audio** | ✅ Yes | ❌ No | ✅ Yes |
| **Processing** | Full control | Limited | Moderate |
| **Learning Curve** | Steep | Easy | Easy |

### Key Benefits for Children's Games

1. **No Audio Files Needed** - Synthesize sounds programmatically
2. **Instant Playback** - No loading delays
3. **Dynamic Sounds** - Change pitch/speed based on game state
4. **Small Bundle** - Zero additional dependencies
5. **Cross-Platform** - Works everywhere modern browsers work

---

## 2. Web Audio API Fundamentals

### 2.1 AudioContext

```typescript
// Create audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Resume context (required after user interaction)
const resumeAudio = async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};

// Call on first user interaction
button.addEventListener('click', resumeAudio);
```

### 2.2 Node-Based Architecture

```
Source Node → [Filter] → [Effect] → Destination
     ↑                              ↓
Oscillator                  AudioOutput
BufferSource
```

```typescript
// Basic sound chain
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

oscillator.start();
oscillator.stop(audioContext.currentTime + 0.5);
```

---

## 3. Complete AudioManager Implementation

```typescript
// src/utils/audioManager.ts

export type SoundType = 
  | 'success' 
  | 'error' 
  | 'click' 
  | 'hover'
  | 'celebration'
  | 'levelUp'
  | 'bounce'
  | 'pop';

export type Note = 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4' | 'C5';

interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private config: AudioConfig = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
  };
  private soundBank: Map<string, AudioBuffer> = new Map();

  // Initialize on first user interaction
  initialize(): void {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Ensure context is running
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.initialize();
    }
    return this.ctx!;
  }

  // Master volume control
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute(): void {
    this.config.muted = !this.config.muted;
  }

  // ===== SYNTHESIZED SOUNDS =====

  /**
   * Success sound - Pleasant chime (C major arpeggio)
   */
  playSuccess(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    // Play C major chord: C4, E4, G4
    const notes = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.05 }, // E5
      { freq: 783.99, time: 0.1 },  // G5
      { freq: 1046.50, time: 0.15 } // C6
    ];
    
    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.3 * this.config.sfxVolume, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + time);
      osc.stop(now + time + 0.5);
    });
  }

  /**
   * Error sound - Gentle "boink" (descending)
   */
  playError(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
    
    gain.gain.setValueAtTime(0.4 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Click sound - Short crisp tick
   */
  playClick(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.1 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Hover sound - Subtle whoosh
   */
  playHover(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.value = 400;
    
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.05 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Celebration sound - Fanfare
   */
  playCelebration(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    // C major scale ascending quickly
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
    
    scale.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25 * this.config.sfxVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  /**
   * Level up sound - Magical sparkle
   */
  playLevelUp(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    // Arpeggiated chord with shimmer
    const pattern = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.05 },
      { f: 783.99, t: 0.1 },
      { f: 1046.50, t: 0.15 },
      { f: 1318.51, t: 0.2 },
    ];
    
    pattern.forEach(({ f, t }) => {
      // Main tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = f;
      gain1.gain.setValueAtTime(0.2 * this.config.sfxVolume, now + t);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + t + 1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now + t);
      osc1.stop(now + t + 1);
      
      // Harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = f * 2;
      gain2.gain.setValueAtTime(0.05 * this.config.sfxVolume, now + t);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + t + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + t);
      osc2.stop(now + t + 0.5);
    });
  }

  /**
   * Bounce sound - Boing effect
   */
  playBounce(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    
    gain.gain.setValueAtTime(0.3 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Pop sound - Bubble pop effect
   */
  playPop(): void {
    if (this.config.muted) return;
    
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    
    // Create noise buffer for "air" sound
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    
    gain.gain.setValueAtTime(0.3 * this.config.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.1);
    
    // Add tonal component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 600;
    oscGain.gain.setValueAtTime(0.2 * this.config.sfxVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // ===== PLAY BY TYPE =====

  play(type: SoundType): void {
    switch (type) {
      case 'success': this.playSuccess(); break;
      case 'error': this.playError(); break;
      case 'click': this.playClick(); break;
      case 'hover': this.playHover(); break;
      case 'celebration': this.playCelebration(); break;
      case 'levelUp': this.playLevelUp(); break;
      case 'bounce': this.playBounce(); break;
      case 'pop': this.playPop(); break;
    }
  }

  // ===== FILE-BASED SOUNDS (Optional) =====

  /**
   * Load and cache audio file
   */
  async loadSound(name: string, url: string): Promise<void> {
    const ctx = this.ensureContext();
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.soundBank.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  /**
   * Play cached sound
   */
  playSound(name: string): void {
    if (this.config.muted) return;
    
    const buffer = this.soundBank.get(name);
    if (!buffer) {
      console.warn(`Sound not found: ${name}`);
      return;
    }
    
    const ctx = this.ensureContext();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    source.buffer = buffer;
    gain.gain.value = this.config.sfxVolume * this.config.masterVolume;
    
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }
}

// Singleton instance
export const audioManager = new AudioManager();
```

---

## 4. React Integration Hook

```typescript
// src/hooks/useAudio.ts
import { useCallback, useEffect } from 'react';
import { audioManager, SoundType } from '../utils/audioManager';

export function useAudio() {
  // Initialize on mount
  useEffect(() => {
    const handleInteraction = () => {
      audioManager.initialize();
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const play = useCallback((sound: SoundType) => {
    audioManager.play(sound);
  }, []);

  const playSuccess = useCallback(() => audioManager.play('success'), []);
  const playError = useCallback(() => audioManager.play('error'), []);
  const playClick = useCallback(() => audioManager.play('click'), []);
  const playCelebration = useCallback(() => audioManager.play('celebration'), []);

  const setVolume = useCallback((volume: number) => {
    audioManager.setSFXVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    audioManager.toggleMute();
  }, []);

  return {
    play,
    playSuccess,
    playError,
    playClick,
    playCelebration,
    setVolume,
    toggleMute,
  };
}
```

---

## 5. Game Integration Examples

### 5.1 Math Monsters

```tsx
function MathMonsters() {
  const { playSuccess, playError, playCelebration } = useAudio();
  
  const handleSubmitAnswer = (answer: number) => {
    if (answer === correctAnswer) {
      playSuccess();
      if (streak === 5) {
        setTimeout(playCelebration, 300);
      }
    } else {
      playError();
    }
  };
  
  return (
    <button onClick={() => playClick()}>
      Submit Answer
    </button>
  );
}
```

### 5.2 Bubble Pop

```tsx
function BubblePop() {
  const { playPop, playCelebration } = useAudio();
  
  const popBubble = (bubble: Bubble) => {
    playPop();
    // Vary pitch based on bubble size
    if (bubble.isGolden) {
      setTimeout(playCelebration, 100);
    }
  };
}
```

### 5.3 Shape Safari

```tsx
function ShapeSafari() {
  const { playSuccess, playBounce } = useAudio();
  
  const onShapeFound = () => {
    playSuccess();
  };
  
  const onShapeAnimate = () => {
    playBounce();
  };
}
```

---

## 6. Frequency Reference for Children's Sounds

### Pleasant Frequencies (Use These)

| Frequency | Note | Use Case |
|-----------|------|----------|
| 523.25 Hz | C5 | Success base |
| 659.25 Hz | E5 | Success harmony |
| 783.99 Hz | G5 | Success sparkle |
| 1046.50 Hz | C6 | High chime |
| 880 Hz | A5 | Neutral UI |

### Avoid (Harsh/Unpleasant)

- Below 100 Hz (rumble)
- Above 3000 Hz (sharp)
- Square waves at high volume
- Sudden volume spikes

---

## 7. Browser Compatibility

```typescript
// Feature detection
const isWebAudioSupported = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

// Fallback to no audio
if (!isWebAudioSupported()) {
  console.warn('Web Audio API not supported');
  // Provide silent mock
  export const audioManager = {
    play: () => {},
    initialize: () => {},
  };
}
```

### Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 14+ | ✅ |
| Firefox | 23+ | ✅ |
| Safari | 6+ | ✅ (webkit prefix) |
| Edge | 12+ | ✅ |
| iOS Safari | 7+ | ✅ |
| Chrome Android | 33+ | ✅ |

---

## 8. COPPA/Safety Considerations

### Volume Limits

```typescript
const MAX_VOLUME = 0.8; // Never exceed 80%

// Protect children's hearing
setVolume(volume: number) {
  this.config.sfxVolume = Math.min(MAX_VOLUME, volume);
}
```

### No Surprise Sounds

```typescript
// Always start muted until user interaction
// Never autoplay loud sounds
// Fade in/out instead of sudden starts
```

### Parent Controls

```tsx
// Settings component
function AudioSettings() {
  return (
    <div>
      <label>Sound Effects</label>
      <input 
        type="range" 
        min="0" 
        max="0.8" 
        step="0.1"
        onChange={(e) => audioManager.setSFXVolume(parseFloat(e.target.value))}
      />
      <button onClick={() => audioManager.toggleMute()}>
        Mute All
      </button>
    </div>
  );
}
```

---

## 9. Comparison with Alternatives

### vs Howler.js

| Aspect | Web Audio API | Howler.js |
|--------|---------------|-----------|
| Bundle | 0KB | 15KB |
| Setup | Complex | Simple |
| Features | Full control | Pre-built |
| Learning | Steep | Easy |
| Recommendation | Use for synthesized sounds | Use if loading many audio files |

### When to Use Audio Files

Use Web Audio API synthesis for:
- UI sounds (clicks, hovers)
- Simple game feedback (success/error)
- Procedural sounds (varying pitch)

Use audio files for:
- Voiceovers
- Music
- Complex sound effects
- Realistic sounds (animal noises, etc.)

---

## 10. Migration Checklist

- [ ] Implement AudioManager class
- [ ] Create useAudio hook
- [ ] Add to Math Monsters (success/error sounds)
- [ ] Add to Bubble Pop (pop sounds)
- [ ] Add to Shape Safari (shape complete sounds)
- [ ] Test on mobile devices
- [ ] Add volume controls in settings
- [ ] Ensure COPPA compliance (volume limits)
- [ ] Test with screen readers
- [ ] Document sound patterns for each game

---

## 11. Next Steps

1. **Immediate:** Add AudioManager to project
2. **This Week:** Implement sounds in Math Monsters
3. **Next Week:** Add to all games
4. **Future:** Consider music synthesis or CC0 background loops

---

*All sounds synthesized - zero audio files needed!*
