import { z } from "zod";

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
      name: z
        .string()
        .min(1, t("nameRequired"))
        .min(2, t("nameMin"))
        .max(50, t("nameMax")),
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

// Default register schema for backward compatibility
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
