import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const registerSpy = vi.fn(async () => {});
const clearErrorSpy = vi.fn();

vi.mock('../../store', () => ({
  useAuthStore: () => ({
    register: registerSpy,
    error: null,
    clearError: clearErrorSpy,
    isLoading: false,
  }),
}));

import { Register } from '../Register';

describe('Register page', () => {
  beforeEach(() => {
    registerSpy.mockClear();
    clearErrorSpy.mockClear();
    window.localStorage.clear();
  });

  it('stores learner details for deferred creation after account signup', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'parent@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'TestPassword123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'TestPassword123' },
    });
    fireEvent.change(screen.getByLabelText(/what's the explorer's name/i), {
      target: { value: 'Mira' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith(
        'parent@example.com',
        'TestPassword123',
      );
    });

    expect(window.localStorage.getItem('pending-learner-profile')).toBe(
      JSON.stringify({
        name: 'Mira',
        age: 5,
        preferred_language: 'en',
      }),
    );
  });
});
