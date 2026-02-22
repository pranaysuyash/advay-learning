# Assets Specification - Visual & Audio Requirements

**Date:** 2026-02-22  
**Purpose:** Catalog of required assets for current and future games

---

## 1. Current Game Assets

### 1.1 Emoji-Based (No Custom Assets)

All currently implemented games use emoji-based visuals:

| Game | Visual Style | Emoji Count | Custom Graphics |
|------|-------------|-------------|-----------------|
| Emoji Match | Emoji only | 20+ | None |
| Story Sequence | Emoji only | 40+ | None |
| Shape Safari | Emoji + Canvas | 8 shapes | None (drawn) |
| Rhyme Time | Emoji only | 50+ | None |
| Free Draw | Canvas only | N/A | None (procedural) |
| Math Monsters | Emoji only | 30+ | None |

### 1.2 CSS-Based Animations

All animations are CSS-based for performance:

```css
/* Bounce animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Shake animation */
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

/* Pulse/glow */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Rainbow */
@keyframes rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
```

---

## 2. Audio Requirements

### 2.1 Sound Categories

| Category | Events | Priority |
|----------|--------|----------|
| **UI Sounds** | Click, hover, success, error | P0 |
| **Game Sounds** | Level up, celebration, streak | P0 |
| **Voice (TTS)** | Word pronunciation, instructions | P1 |
| **Music** | Background loops, ambient | P2 |
| **Character** | Monster voices, reactions | P3 |

### 2.2 Sound Library Options

```typescript
// Free sound resources
const soundResources = {
  // Web Audio API synthesis (no files needed)
  synthesized: {
    beep: 'OscillatorNode + GainNode',
    chime: 'Multiple oscillators + envelope',
    drum: 'Noise buffer + filter',
  },
  
  // Free libraries
  libraries: {
    'sfxr.me': 'Retro game sounds, free',
    'freesound.org': 'CC0 sounds, requires attribution check',
    'kenney.nl': 'Free game assets',
    'opengameart.org': 'Various licenses',
  },
  
  // Web Speech API (no audio files)
  tts: {
    api: 'window.speechSynthesis',
    voices: 'System dependent',
    pros: 'No files, unlimited words',
    cons: 'Quality varies by device',
  },
};
```

### 2.3 Audio Implementation Pattern

```typescript
// src/utils/audioManager.ts
class AudioManager {
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  
  // Synthesize simple sounds (no files needed)
  async synthesizeTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): Promise<AudioBuffer> {
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
    }
    
    return buffer;
  }
  
  // Generate game sounds
  async initializeSounds() {
    this.sounds.set('success', await this.synthesizeTone(880, 0.3, 'sine'));
    this.sounds.set('error', await this.synthesizeTone(220, 0.3, 'sawtooth'));
    this.sounds.set('click', await this.synthesizeTone(660, 0.1, 'square'));
    this.sounds.set('celebration', await this.synthesizeChime());
  }
  
  private async synthesizeChime(): Promise<AudioBuffer> {
    // Multiple tones for celebration
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C major
    // ... implementation
  }
}
```

---

## 3. Custom Asset Needs (Future)

### 3.1 Character Designs

```typescript
// Monster variations for Math Monsters
const monsterDesigns = {
  styles: [
    { name: 'blob', features: ['round', 'squishy', 'one-eye'] },
    { name: 'dragon', features: ['wings', 'tail', 'horns'] },
    { name: 'robot', features: ['square', 'antenna', 'screen-face'] },
    { name: 'alien', features: ['tentacles', 'multi-eyes', 'slimy'] },
    { name: 'dino', features: ['long-neck', 'spots', 'tiny-arms'] },
  ],
  
  // Expressions (CSS-based)
  expressions: ['hungry', 'happy', 'excited', 'thinking', 'sleepy'],
  
  // Colors (CSS variables)
  colorPalette: [
    'var(--monster-red)',
    'var(--monster-blue)', 
    'var(--monster-green)',
    'var(--monster-purple)',
    'var(--monster-orange)',
  ],
};
```

### 3.2 Background Art

```typescript
// Scene backgrounds (CSS gradients + patterns)
const sceneStyles = {
  jungle: {
    background: 'linear-gradient(to bottom, #87CEEB 0%, #90EE90 50%, #228B22 100%)',
    elements: ['sun', 'clouds', 'trees', 'vines'],
    animation: 'swaying-trees',
  },
  
  ocean: {
    background: 'linear-gradient(to bottom, #00BFFF 0%, #1E90FF 50%, #00008B 100%)',
    elements: ['fish-silhouettes', 'bubbles', 'coral'],
    animation: 'floating-bubbles',
  },
  
  space: {
    background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
    elements: ['stars', 'planets', 'comets'],
    animation: 'twinkling-stars',
  },
  
  castle: {
    background: 'linear-gradient(to bottom, #FFD700 0%, #FFA500 50%, #8B4513 100%)',
    elements: ['towers', 'flags', 'torch-light'],
    animation: 'flickering-lights',
  },
};
```

### 3.3 SVG Icons

```typescript
// Icon set for UI
const iconRequirements = {
  navigation: ['home', 'games', 'gallery', 'settings', 'profile'],
  game: ['play', 'pause', 'restart', 'hint', 'fullscreen', 'sound-on', 'sound-off'],
  rewards: ['star', 'trophy', 'medal', 'crown', 'gem', 'chest'],
  actions: ['undo', 'redo', 'clear', 'save', 'share', 'download'],
  feedback: ['check', 'cross', 'warning', 'info', 'celebration'],
  hand: ['hand-point', 'hand-grab', 'hand-pinch', 'hand-open'],
};

// Generate SVG icons programmatically
function generateStarSVG(color: string, size: number): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  `;
}
```

---

## 4. Asset Optimization

### 4.1 Sprite Sheets

```typescript
// For games needing many small images
interface SpriteSheet {
  // Layout grid
  columns: 10;
  rows: 10;
  cellSize: 64; // px
  
  // Access by index
  getSprite(index: number): Sprite {
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);
    return {
      x: col * this.cellSize,
      y: row * this.cellSize,
      width: this.cellSize,
      height: this.cellSize,
    };
  }
}
```

### 4.2 Lazy Loading

```typescript
// Load assets on demand
class AssetLoader {
  private cache: Map<string, HTMLImageElement> = new Map();
  
  async load(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  
  // Preload critical assets
  preload(urls: string[]): Promise<void> {
    return Promise.all(urls.map(url => this.load(url))).then(() => {});
  }
}
```

---

## 5. Asset Checklist

### Phase 1 (Current) - Complete ✓

- [x] Emoji set defined for all games
- [x] CSS animations standardized
- [x] Canvas-based graphics (shapes)

### Phase 2 (Audio) - Planned

- [ ] Web Audio API integration
- [ ] Synthesized sound library
- [ ] TTS implementation
- [ ] Volume/mute controls

### Phase 3 (Visual Polish) - Future

- [ ] Custom monster SVG sprites
- [ ] Scene background gradients
- [ ] Particle effect system
- [ ] Transition animations

### Phase 4 (Advanced) - Research

- [ ] 3D models (Three.js)
- [ ] Video backgrounds
- [ ] Custom character animations
- [ ] Dynamic lighting effects

---

*Document updated as assets are added*
