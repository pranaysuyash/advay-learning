import { render, screen, fireEvent } from '@testing-library/react';
import { UIIcon } from '../Icon';

describe('UIIcon', () => {
  it('renders an img by default', () => {
    render(<UIIcon name="home" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('falls back to a glyph when the image fails to load', () => {
    render(<UIIcon name="home" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('✦')).toBeInTheDocument();
  });
});

