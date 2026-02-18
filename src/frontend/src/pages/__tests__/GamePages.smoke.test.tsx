import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock react-webcam (not in global setup)
vi.mock('react-webcam', () => ({
  default: React.forwardRef((props: any, ref: any) => (
    <div data-testid="webcam-mock" ref={ref} />
  )),
}));

// @mediapipe/tasks-vision is already mocked globally in setupTests.ts

// Mock AudioContext for useSoundEffects
const AudioContextMock = vi.fn(() => ({
  createGain: () => ({
    connect: vi.fn(),
    gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  }),
  createOscillator: () => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440, setValueAtTime: vi.fn() },
    type: 'sine',
  }),
  destination: {},
  currentTime: 0,
  resume: vi.fn().mockResolvedValue(undefined),
}));
vi.stubGlobal('AudioContext', AudioContextMock);
vi.stubGlobal('webkitAudioContext', AudioContextMock);

// Mock speechSynthesis for useTTS
vi.stubGlobal('speechSynthesis', {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: () => [],
  speaking: false,
  pending: false,
  paused: false,
  onvoiceschanged: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

// Import game components
import { LetterHunt } from '../LetterHunt';
import { MusicPinchBeat } from '../MusicPinchBeat';
import { SteadyHandLab } from '../SteadyHandLab';
import { ShapePop } from '../ShapePop';
import { ColorMatchGarden } from '../ColorMatchGarden';
import { NumberTapTrail } from '../NumberTapTrail';
import { ShapeSequence } from '../ShapeSequence';
import { YogaAnimals } from '../YogaAnimals';
import { FreezeDance } from '../FreezeDance';
import { SimonSays } from '../SimonSays';
import { FingerNumberShow } from '../../games/FingerNumberShow';

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Game pages smoke tests', () => {
  describe('LetterHunt', () => {
    it('renders without throwing and shows key UI', () => {
      expect(() => renderInRouter(<LetterHunt />)).not.toThrow();
      expect(screen.getByText('Letter Hunt')).toBeTruthy();
      expect(screen.getByText('Letter Hunt Challenge')).toBeTruthy();
    });
  });

  describe('MusicPinchBeat', () => {
    it('renders without throwing and shows start button', () => {
      expect(() => renderInRouter(<MusicPinchBeat />)).not.toThrow();
      expect(screen.getByText('Start Music Game')).toBeTruthy();
    });
  });

  describe('SteadyHandLab', () => {
    it('renders without throwing and shows start button', () => {
      expect(() => renderInRouter(<SteadyHandLab />)).not.toThrow();
      expect(screen.getByText('Start Steady Hand')).toBeTruthy();
    });
  });

  describe('ShapePop', () => {
    it('renders without throwing and shows start button', () => {
      expect(() => renderInRouter(<ShapePop />)).not.toThrow();
      expect(screen.getByText('Start Shape Pop')).toBeTruthy();
    });
  });

  describe('ColorMatchGarden', () => {
    it('renders without throwing and shows start button', () => {
      expect(() => renderInRouter(<ColorMatchGarden />)).not.toThrow();
      expect(screen.getByText('Start Color Match')).toBeTruthy();
    });
  });

  describe('NumberTapTrail', () => {
    it('renders without throwing and shows start button', () => {
      expect(() => renderInRouter(<NumberTapTrail />)).not.toThrow();
      expect(screen.getByText('Start Number Trail')).toBeTruthy();
    });
  });

  describe('ShapeSequence', () => {
    it('renders without throwing and shows start button', () => {
      expect(() => renderInRouter(<ShapeSequence />)).not.toThrow();
      expect(screen.getByText('Start Shape Sequence')).toBeTruthy();
    });
  });

  describe('YogaAnimals', () => {
    it('renders without throwing and shows key UI', () => {
      expect(() => renderInRouter(<YogaAnimals />)).not.toThrow();
      // Initial render shows loading state
      expect(
        screen.queryByText('Yoga Animals') ||
          screen.queryByText(/Loading Yoga Animals/),
      ).toBeTruthy();
    });
  });

  describe('FreezeDance', () => {
    it('renders without throwing and shows key UI', () => {
      expect(() => renderInRouter(<FreezeDance />)).not.toThrow();
      // Initial render shows loading state
      expect(
        screen.queryByText('Freeze Dance') ||
          screen.queryByText(/Loading Freeze Dance/),
      ).toBeTruthy();
    });
  });

  describe('SimonSays', () => {
    it('renders without throwing and shows key UI', () => {
      expect(() => renderInRouter(<SimonSays />)).not.toThrow();
      // Initial render shows loading state
      expect(
        screen.queryByText('Simon Says') ||
          screen.queryByText(/Loading Simon Says/),
      ).toBeTruthy();
    });
  });

  describe('FingerNumberShow', () => {
    it('renders without throwing and shows key UI', () => {
      expect(() => renderInRouter(<FingerNumberShow />)).not.toThrow();
      expect(screen.getByText('Finger Number Show')).toBeTruthy();
    });
  });
});
