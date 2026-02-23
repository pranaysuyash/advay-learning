import { render, screen, fireEvent } from '@testing-library/react';
import { UIIcon } from '../Icon';

describe('UIIcon', () => {
  it('renders a lucide svg for named icons', () => {
    const { container } = render(<UIIcon name='home' />);
    expect(container.querySelector('svg.lucide-house')).toBeInTheDocument();
  });

  it('falls back to a glyph when src icon fails to load', () => {
    render(<UIIcon src='/missing.svg' alt='test-icon' fallback='✦' />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('✦')).toBeInTheDocument();
  });
});
