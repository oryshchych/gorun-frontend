import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email is required");
      }
    });
  });

  describe("registerSchema", () => {
    const validBase = {
      firstName: "John",
      lastName: "Doe",
      phone: "+380501112233",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    it("should validate correct registration data", () => {
      const result = registerSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("should reject empty first name", () => {
      const result = registerSchema.safeParse({ ...validBase, firstName: "" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid phone", () => {
      const result = registerSchema.safeParse({
        ...validBase,
        phone: "123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject mismatched passwords", () => {
      const result = registerSchema.safeParse({
        ...validBase,
        confirmPassword: "other",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate email", () => {
      expect(
        forgotPasswordSchema.safeParse({ email: "a@b.com" }).success
      ).toBe(true);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate matching passwords", () => {
      expect(
        resetPasswordSchema.safeParse({
          password: "password123",
          confirmPassword: "password123",
        }).success
      ).toBe(true);
    });
  });
});
