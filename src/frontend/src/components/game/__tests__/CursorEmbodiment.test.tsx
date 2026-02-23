import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CursorEmbodiment } from '../CursorEmbodiment';
import { resolveCursorVariant } from '../cursorEmbodimentConfig';

describe('resolveCursorVariant', () => {
  it('returns dot when globally disabled', () => {
    expect(
      resolveCursorVariant({
        gameName: 'EmojiMatch',
        env: {
          DEV: true,
          VITE_HAND_AVATAR_ENABLED: 'false',
        },
      }),
    ).toBe('dot');
  });

  it('returns hand for allowlisted game when enabled', () => {
    expect(
      resolveCursorVariant({
        gameName: 'EmojiMatch',
        env: {
          DEV: false,
          VITE_HAND_AVATAR_ENABLED: 'true',
          VITE_HAND_AVATAR_GAMES: 'EmojiMatch,ShapeSequence',
        },
      }),
    ).toBe('hand');
  });
});

describe('CursorEmbodiment component', () => {
  it('renders hand avatar when hand variant is selected', () => {
    render(
      <CursorEmbodiment
        variant='hand'
        position={{ x: 100, y: 100 }}
        isHandDetected
      />,
    );
    expect(screen.getByTestId('hand-avatar-cursor')).toBeTruthy();
  });

  it('renders dot cursor when dot variant is selected', () => {
    render(
      <CursorEmbodiment
        variant='dot'
        position={{ x: 100, y: 100 }}
        isHandDetected
        icon='👆'
      />,
    );
    expect(screen.getByText('👆')).toBeTruthy();
  });
});
