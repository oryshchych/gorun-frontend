import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

type TranslationFunction = (key: string) => string;

// Login schema generator
export const createLoginSchema = (t: TranslationFunction) =>
  z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")).min(8, t("passwordMin")),
  });

// Default login schema for backward compatibility
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schema generator
export const createRegisterSchema = (t: TranslationFunction) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, t("nameRequired"))
        .min(2, t("nameMin"))
        .max(50, t("nameMax")),
      lastName: z
        .string()
        .min(1, t("surnameRequired"))
        .min(2, t("surnameMin"))
        .max(50, t("surnameMax")),
      phone: z
        .string()
        .min(1, t("phoneRequired"))
        .refine((val) => isValidPhoneNumber(val), {
          message: t("phoneInvalid"),
        }),
      email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
      password: z
        .string()
        .min(1, t("passwordRequired"))
        .min(8, t("passwordMin"))
        .max(100, t("passwordMax")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });

// Default register schema for backward compatibility (uses English messages)
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .refine((val) => isValidPhoneNumber(val), {
        message: "Invalid phone number",
      }),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const createForgotPasswordSchema = (t: TranslationFunction) =>
  z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const createResetPasswordSchema = (t: TranslationFunction) =>
  z
    .object({
      password: z
        .string()
        .min(1, t("passwordRequired"))
        .min(8, t("passwordMin"))
        .max(100, t("passwordMax")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
