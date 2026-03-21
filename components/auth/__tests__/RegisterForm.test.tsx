import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "../RegisterForm";

vi.mock("react-phone-number-input", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("react-phone-number-input")>();
  return {
    ...actual,
    default: function MockPhoneInput({
      onChange,
      value,
      id,
      disabled,
      "aria-invalid": ariaInvalid,
    }: {
      onChange?: (v: string | undefined) => void;
      value?: string;
      id?: string;
      disabled?: boolean;
      "aria-invalid"?: boolean;
    }) {
      return (
        <input
          id={id}
          type="text"
          aria-label="Phone"
          aria-invalid={ariaInvalid}
          disabled={disabled}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value || undefined)}
        />
      );
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next-intl", () => ({
  // Namespace is ignored so validation + auth keys resolve in tests
  useTranslations: () => (key: string) => {
    const all: Record<string, string> = {
      nameRequired: "First name is required",
      nameMin: "First name must be at least 2 characters",
      nameMax: "First name must not exceed 50 characters",
      surnameRequired: "Last name is required",
      surnameMin: "Last name must be at least 2 characters",
      surnameMax: "Last name must not exceed 50 characters",
      phoneRequired: "Phone is required",
      phoneInvalid: "Invalid phone number",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email address",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 8 characters",
      passwordMax: "Password must be at most 100 characters",
      confirmPasswordRequired: "Please confirm your password",
      passwordsDontMatch: "Passwords don't match",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstNamePlaceholder: "John",
      lastNamePlaceholder: "Doe",
      phonePlaceholder: "+380…",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      createAccount: "Create Account",
      creatingAccount: "Creating account…",
      registrationSuccessful: "Registration Successful",
      registrationFailed: "Registration Failed",
      registerWithGoogle: "Google",
      orContinueWith: "Or email",
    };
    return all[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    register: vi.fn(),
  }),
}));

vi.mock("@/lib/error-handler", () => ({
  handleApiError: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock("@/components/auth/GoogleOAuthButton", () => ({
  GoogleOAuthButton: () => (
    <button type="button" aria-label="Google OAuth">
      Google
    </button>
  ),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render registration fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/^first name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^last name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^phone$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("should display validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });

  it("should display validation error for mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/^first name$/i), "John");
    await user.type(screen.getByLabelText(/^last name$/i), "Doe");
    await user.type(screen.getByLabelText(/^phone$/i), "+380501112233");
    await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "different123"
    );

    await user.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });
});
