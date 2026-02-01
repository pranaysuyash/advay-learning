import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Icon } from '../Icon';

describe('Icon component', () => {
  it('renders img when single src provided', () => {
    render(<Icon src='/assets/icons/apple.svg' alt='Apple' />);
    const img = screen.getByAltText('Apple') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/assets/icons/apple.svg');
  });

  it('tries next candidate when first image fails and eventually falls back', async () => {
    render(
      <Icon
        src={['/assets/icons/nonexistent.svg', '/assets/icons/apple.svg']}
        alt='Test'
      />,
    );
    let img = screen.getByAltText('Test') as HTMLImageElement;
    // Simulate first image failing to load
    await fireEvent.error(img);
    // After error, the component should try the next candidate
    img = screen.getByAltText('Test') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/assets/icons/apple.svg');

    // Simulate second image failing as well
    await fireEvent.error(img);
    // Now the component should render the fallback span
    const fallback = screen.getByRole('img', { name: 'Test' });
    expect(fallback).toBeTruthy();
  }, 10000);

  it('shows fallback when single src fails', async () => {
    render(<Icon src='/assets/icons/nonexistent.svg' alt='Fail' />);
    const img = screen.getByAltText('Fail') as HTMLImageElement;
    await fireEvent.error(img);
    const fallback = screen.getByRole('img', { name: 'Fail' });
    expect(fallback).toBeTruthy();
  });
});
