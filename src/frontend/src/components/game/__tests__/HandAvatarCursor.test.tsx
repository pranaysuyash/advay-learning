import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HandAvatarCursor } from '../HandAvatarCursor';

describe('HandAvatarCursor', () => {
  it('does not render when hand is not detected', () => {
    render(
      <HandAvatarCursor
        position={{ x: 120, y: 90 }}
        isHandDetected={false}
      />,
    );
    expect(screen.queryByTestId('hand-avatar-cursor')).toBeNull();
  });

  it('maps normalized coordinates using container bounds', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({
        left: 10,
        top: 20,
        width: 100,
        height: 80,
        right: 110,
        bottom: 100,
        x: 10,
        y: 20,
        toJSON: () => ({}),
      }),
    });

    render(
      <HandAvatarCursor
        position={{ x: 0.5, y: 0.5 }}
        coordinateSpace='normalized'
        containerRef={{ current: container }}
        size={72}
      />,
    );

    const cursor = screen.getByTestId('hand-avatar-cursor');
    expect(cursor.style.left).toBe('24px');
    expect(cursor.style.top).toBe('24px');
  });
});
