import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Persistent spies used by mock
const loginSpy = vi.fn(async () => {});
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
  beforeEach(() => {
    loginSpy.mockClear();
    clearErrorSpy.mockClear();
  });

  it('renders login form with proper accessibility labels', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Check for proper label associations
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login\.submitButton/i })).toBeInTheDocument();
  });

  it('keeps submit button available when form is empty', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /login\.submitButton/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('enables submit button when email and password are filled', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'testpassword' } });

    const submitButton = screen.getByRole('button', { name: /login\.submitButton/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls login when credentials provided and form submitted', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'testpassword' } });

    fireEvent.click(screen.getByRole('button', { name: /login\.submitButton/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'testpassword');
    });
  });

  it('has show/hide password toggle', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /aria\.showPassword/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('has forgot and sign up links', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /forgot\?/i })).toHaveAttribute('href', '/forgot-password');
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/register');
  });

  it('has navigation links for home and register', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /aria\.backToHome/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/register');
  });
});
