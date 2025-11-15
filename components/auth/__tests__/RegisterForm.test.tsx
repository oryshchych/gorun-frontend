import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: vi.fn(),
  }),
}));

vi.mock('@/lib/error-handler', () => ({
  handleApiError: vi.fn(),
  showSuccessToast: vi.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form with all required fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create a new account/i })).toBeInTheDocument();
  });

  it('should display validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /create a new account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for short name on submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/^name$/i);
    await user.type(nameInput, 'A');
    
    const submitButton = screen.getByRole('button', { name: /create a new account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should accept valid inputs', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('should display validation error for mismatched passwords', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    
    const submitButton = screen.getByRole('button', { name: /create a new account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<RegisterForm />);

    const form = screen.getByRole('form', { name: /registration form/i });
    expect(form).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/^name$/i);
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(nameInput).toHaveAttribute('autoComplete', 'name');

    const emailInput = screen.getByLabelText(/^email$/i);
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
  });
});
