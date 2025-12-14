import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      email: "Email",
      password: "Password",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      login: "Login",
      loggingIn: "Logging in...",
      welcomeBack: "Welcome back!",
      loginSuccessful: "Login Successful",
      loginFailed: "Login Failed",
    };
    return translations[key] || key;
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

vi.mock("@/lib/error-handler", () => ({
  handleApiError: vi.fn(),
  showSuccessToast: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should display validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("should accept valid email and password inputs", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should display validation error for short password on submit", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "short");

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("should have proper accessibility attributes", () => {
    render(<LoginForm />);

    const form = screen.getByRole("form", { name: /login form/i });
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("aria-required", "true");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("aria-required", "true");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });
});
