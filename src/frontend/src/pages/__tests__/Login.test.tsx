import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Persistent spies used by mock
const loginSpy = vi.fn(async (email: string, password: string) => {});
const clearErrorSpy = vi.fn();

// Mock useAuthStore
vi.mock('../../store', () => {
  return {
    useAuthStore: () => ({
      login: loginSpy,
      error: null,
      clearError: clearErrorSpy,
      isLoading: false,
    }),
  };
});

import { Login } from '../Login';
import { MemoryRouter } from 'react-router-dom';

describe('Login page', () => {
  it('shows inline error when submitted empty and focuses first invalid field', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter your email and password/i)).toBeTruthy();
    });

    expect(document.activeElement?.id).toBe('login-email-input');
  });

  it('calls login when credentials provided', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'pranay.suyash@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pranaysuyash' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('pranay.suyash@gmail.com', 'pranaysuyash');
    });
  });
});