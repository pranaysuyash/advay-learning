import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Minimal browser API shims for jsdom test environment.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '';
    readonly thresholds: ReadonlyArray<number> = [0];
    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    unobserve(): void {}
  }
  globalThis.IntersectionObserver = MockIntersectionObserver;
}

// jsdom does not implement media playback APIs; provide no-op stubs for unit tests.
if (typeof HTMLMediaElement !== 'undefined') {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
    configurable: true,
    writable: true,
    value: vi.fn(() => 'probably'),
  });
}

// Some components render to canvas in unit tests; provide a lightweight 2D context.
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: vi.fn(
      () =>
        ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          beginPath: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          drawImage: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          fillText: vi.fn(),
          strokeText: vi.fn(),
        }) as unknown as CanvasRenderingContext2D,
    ),
  });
}

// Ensure speech synthesis exists for hooks/components that query it.
if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
}

// jsdom does not provide SpeechSynthesisUtterance; stub it for TTS paths in tests.
if (typeof globalThis.SpeechSynthesisUtterance === 'undefined') {
  class MockSpeechSynthesisUtterance {
    text: string;
    lang = 'en-US';
    rate = 1;
    pitch = 1;
    volume = 1;
    voice: SpeechSynthesisVoice | null = null;
    onend:
      | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
      | null = null;
    onerror:
      | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any)
      | null = null;

    constructor(text: string) {
      this.text = text;
    }
  }

  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
    configurable: true,
    writable: true,
    value: MockSpeechSynthesisUtterance,
  });
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const speakMock = vi.fn((utterance?: { onend?: () => void }) => {
    if (utterance?.onend) {
      setTimeout(() => utterance.onend?.(), 0);
    }
  });

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      ...(window.speechSynthesis ?? {}),
      speak: speakMock,
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
}

// Mock Web Audio API for hooks/services that create AudioContext in unit tests.
if (
  typeof window !== 'undefined' &&
  typeof (window as any).AudioContext === 'undefined'
) {
  class MockAudioContext {
    state: AudioContextState = 'running';
    currentTime = 0;
    destination = {} as AudioDestinationNode;

    resume = vi.fn(async () => undefined);
    close = vi.fn(async () => undefined);

    createOscillator = vi.fn(
      () =>
        ({
          connect: vi.fn(),
          disconnect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          type: 'sine',
          frequency: {
            setValueAtTime: vi.fn(),
          },
        }) as unknown as OscillatorNode,
    );

    createGain = vi.fn(
      () =>
        ({
          connect: vi.fn(),
          disconnect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        }) as unknown as GainNode,
    );
  }

  Object.defineProperty(window, 'AudioContext', {
    configurable: true,
    writable: true,
    value: MockAudioContext,
  });

  Object.defineProperty(window, 'webkitAudioContext', {
    configurable: true,
    writable: true,
    value: MockAudioContext,
  });
}

// Ensure global Audio() exists and is inert in unit tests.
if (typeof globalThis.Audio === 'undefined') {
  Object.defineProperty(globalThis, 'Audio', {
    configurable: true,
    writable: true,
    value: vi.fn(() => {
      const audio = document.createElement('audio');
      audio.play = vi.fn().mockResolvedValue(undefined);
      audio.pause = vi.fn();
      audio.load = vi.fn();
      return audio;
    }),
  });
}

// Most component tests are not subscription-gating tests; keep them focused on
// render/interaction behavior by default.
vi.mock('../hooks/useSubscription', () => ({
  useSubscription: () => ({
    canAccessGame: () => true,
    hasActiveSubscription: true,
    isLoading: false,
    isFullyAccessible: true,
  }),
}));
