/**
 * AudioManager - Web Audio API implementation for game sounds
 * Synthesizes all sounds - no audio files needed
 */

export type SoundType = 
  | 'success' 
  | 'error' 
  | 'click' 
  | 'hover'
  | 'celebration'
  | 'levelUp'
  | 'bounce'
  | 'pop'
  | 'munch'
  | 'chirp'
  | 'fanfare'
  | 'flip'
  | 'shake';

interface AudioConfig {
  masterVolume: number;
  sfxVolume: number;
  muted: boolean;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private config: AudioConfig = {
    masterVolume: 0.7,
    sfxVolume: 0.6,
    muted: false,
  };

  initialize(): void {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.initialize();
    }
    return this.ctx!;
  }

  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(0.8, volume)); // Max 80% for children's safety
  }

  toggleMute(): void {
    this.config.muted = !this.config.muted;
  }

  isMuted(): boolean {
    return this.config.muted;
  }

  // ===== SYNTHESIZED SOUNDS =====

  playSuccess(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // C major arpeggio: C5, E5, G5, C6
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.05 },
      { freq: 783.99, time: 0.1 },
      { freq: 1046.50, time: 0.15 }
    ];

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.25 * vol, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.5);
    });
  }

  playError(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);

    gain.gain.setValueAtTime(0.3 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playClick(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 800;

    gain.gain.setValueAtTime(0.08 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playHover(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = 600;

    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    gain.gain.setValueAtTime(0.04 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playCelebration(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // C major scale ascending
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];

    scale.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      const startTime = now + i * 0.06;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2 * vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playLevelUp(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    const pattern = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.05 },
      { f: 783.99, t: 0.1 },
      { f: 1046.50, t: 0.15 },
      { f: 1318.51, t: 0.2 },
    ];

    pattern.forEach(({ f, t }) => {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = f;
      gain1.gain.setValueAtTime(0.15 * vol, now + t);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + t + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now + t);
      osc1.stop(now + t + 0.8);
    });
  }

  playBounce(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

    gain.gain.setValueAtTime(0.25 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playPop(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // Create noise buffer
    const bufferSize = ctx.sampleRate * 0.08;
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
    filter.frequency.value = 3000;

    gain.gain.setValueAtTime(0.25 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.08);

    // Tonal component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 800;
    oscGain.gain.setValueAtTime(0.15 * vol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Monster eating sound (for Math Monsters)
  playMunch(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // Three quick "bites"
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(100, now + i * 0.1 + 0.08);

      gain.gain.setValueAtTime(0.2 * vol, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.08);
    }
  }

  // Bird chirp (for Rhyme Time)
  playChirp(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // High pitched arpeggio
    [1200, 1500, 1800].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15 * vol, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.03 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.1);
    });
  }

  // Fanfare (for level completion)
  playFanfare(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // Triumphant brass-like sound
    const notes = [
      { f: 392, d: 0.2 }, // G4
      { f: 392, d: 0.2 }, // G4
      { f: 392, d: 0.2 }, // G4
      { f: 523.25, d: 0.6 }, // C5 (long)
    ];

    let timeOffset = 0;
    notes.forEach(({ f, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = f;

      gain.gain.setValueAtTime(0.2 * vol, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.2 * vol, now + timeOffset + d * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + d);

      timeOffset += d;
    });
  }

  // Card flip (for Story Sequence)
  playFlip(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // Whoosh sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.1 * vol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Shake sound (for incorrect)
  playShake(): void {
    if (this.config.muted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const vol = this.config.sfxVolume * this.config.masterVolume;

    // Rattle sound
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
    }

    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.2 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.2);
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
      case 'munch': this.playMunch(); break;
      case 'chirp': this.playChirp(); break;
      case 'fanfare': this.playFanfare(); break;
      case 'flip': this.playFlip(); break;
      case 'shake': this.playShake(); break;
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
