import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-webcam', () => ({
  default: React.forwardRef((props: any, ref: any) => (
    <div data-testid='webcam-mock' ref={ref} {...props} />
  )),
}));

vi.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({
    speakInLanguage: vi.fn(),
    isEnabled: false,
  }),
}));

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

import { ConnectTheDots } from '../ConnectTheDots';
import { VirtualChemistryLab } from '../VirtualChemistryLab';
import BubblePopSymphony from '../BubblePopSymphony';
import DressForWeather from '../DressForWeather';
import FreeDraw from '../FreeDraw';
import MathMonsters from '../MathMonsters';
import RhymeTime from '../RhymeTime';
import { AlphabetGame } from '../AlphabetGame';

const renderInRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Camera routes smoke tests', () => {
  it('ConnectTheDots renders', () => {
    expect(() => renderInRouter(<ConnectTheDots />)).not.toThrow();
    expect(screen.getAllByText(/Connect The Dots/i).length).toBeGreaterThan(0);
  });

  it('VirtualChemistryLab renders', () => {
    expect(() => renderInRouter(<VirtualChemistryLab />)).not.toThrow();
    expect(
      screen.getAllByText(/Virtual Chemistry Lab/i).length,
    ).toBeGreaterThan(0);
  });

  it('BubblePopSymphony renders', () => {
    expect(() => renderInRouter(<BubblePopSymphony />)).not.toThrow();
    expect(screen.getByText(/Bubble Pop Symphony/i)).toBeTruthy();
  });

  it('DressForWeather renders', () => {
    expect(() => renderInRouter(<DressForWeather />)).not.toThrow();
    expect(screen.getByText(/Dress for Weather/i)).toBeTruthy();
  });

  it('FreeDraw renders', () => {
    expect(() => renderInRouter(<FreeDraw />)).not.toThrow();
    expect(screen.getAllByText(/Free Draw/i).length).toBeGreaterThan(0);
  });

  it('MathMonsters renders', () => {
    expect(() => renderInRouter(<MathMonsters />)).not.toThrow();
    expect(screen.getAllByText(/Math Monsters/i).length).toBeGreaterThan(0);
  });

  it('RhymeTime renders', () => {
    expect(() => renderInRouter(<RhymeTime />)).not.toThrow();
    expect(screen.getAllByText(/Rhyme Time/i).length).toBeGreaterThan(0);
  });

  it('AlphabetGame renders', () => {
    expect(() => renderInRouter(<AlphabetGame />)).not.toThrow();
    expect(
      screen.queryByText(/Alphabet Tracing/i) ||
        screen.queryByText(/Loading your child's profile/i),
    ).toBeTruthy();
  });
});
