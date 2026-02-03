import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OptionChips } from '../OptionChips';

describe('OptionChips', () => {
  it('invokes onSelect when clicking an option', () => {
    const onSelect = vi.fn();
    render(
      <OptionChips
        label='Difficulty'
        options={[
          { id: '0', label: 'Easy' },
          { id: '1', label: 'Hard' },
        ]}
        selectedId='0'
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Hard/i }));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});

