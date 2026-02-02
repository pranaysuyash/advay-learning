import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ButtonLink } from '../Button';

describe('ButtonLink', () => {
  it('renders a link with button styling', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/games" icon="sparkles">
          Go
        </ButtonLink>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /go/i });
    expect(link).toHaveAttribute('href', '/games');
  });
});

