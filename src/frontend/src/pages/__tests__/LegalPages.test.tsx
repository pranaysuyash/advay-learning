import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PrivacyPolicy } from '../PrivacyPolicy';
import { TermsOfPlay } from '../TermsOfPlay';
import { Support } from '../Support';

describe('Legal and support pages', () => {
  it('renders privacy promise copy', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Privacy Promise/i)).toBeInTheDocument();
    expect(screen.getByText(/do not store child photos/i)).toBeInTheDocument();
  });

  it('renders beta terms messaging', () => {
    render(
      <MemoryRouter>
        <TermsOfPlay />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Terms of Play/i)).toBeInTheDocument();
    expect(screen.getByText(/free only during beta/i)).toBeInTheDocument();
  });

  it('renders support contact route', () => {
    render(
      <MemoryRouter>
        <Support />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Need help/i)).toBeInTheDocument();
    expect(screen.getByText(/support@advay.app/i)).toBeInTheDocument();
  });
});
