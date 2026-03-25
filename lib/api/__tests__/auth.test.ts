import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient, { tokenManager } from "../client";
import {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  exchangeOAuthCode,
} from "../auth";

const authPayload = (overrides?: Partial<{ name: string }>) => ({
  data: {
    user: {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      ...overrides,
    },
    accessToken: "access-token",
    refreshToken: "refresh-token",
  },
});

describe("Auth API Service", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("login", () => {
    it("should login successfully and store tokens", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
        rememberMe: true,
      };
      const body = authPayload();

      mock.onPost("/auth/login").reply(200, body);

      const result = await login(credentials);

      expect(result).toEqual(body);
      expect(tokenManager.getAccessToken()).toBe("access-token");
      expect(tokenManager.getRefreshToken()).toBe("refresh-token");
    });

    it("should handle login error", async () => {
      const credentials = { email: "test@example.com", password: "wrong" };
      mock.onPost("/auth/login").reply(401, { message: "Invalid credentials" });

      await expect(login(credentials)).rejects.toMatchObject({
        message: "Invalid credentials",
        statusCode: 401,
      });
    });
  });

  describe("register", () => {
    it("should register successfully and store tokens", async () => {
      const data = {
        firstName: "Test",
        lastName: "User",
        phone: "+380501112233",
        email: "test@example.com",
        password: "password123",
      };
      const body = authPayload();

      mock.onPost("/auth/register").reply(201, body);

      const result = await register(data);

      expect(result).toEqual(body);
      expect(tokenManager.getAccessToken()).toBe("access-token");
    });

    it("should handle registration error", async () => {
      const data = {
        firstName: "Test",
        lastName: "User",
        phone: "+380501112233",
        email: "test@example.com",
        password: "pass",
      };
      mock
        .onPost("/auth/register")
        .reply(400, { message: "Email already exists" });

      await expect(register(data)).rejects.toMatchObject({
        message: "Email already exists",
        statusCode: 400,
      });
    });
  });

  describe("exchangeOAuthCode", () => {
    it("should exchange code and store tokens", async () => {
      const body = authPayload();
      mock.onPost("/auth/oauth/exchange").reply(200, body);

      const result = await exchangeOAuthCode("one-time-code");

      expect(result).toEqual(body);
      expect(tokenManager.getAccessToken()).toBe("access-token");
    });
  });

  describe("forgotPassword", () => {
    it("should post email", async () => {
      mock
        .onPost("/auth/forgot-password")
        .reply(200, { message: "If account exists, email sent" });

      const result = await forgotPassword({ email: "a@b.com" });
      expect(result.message).toBeDefined();
    });
  });

  describe("logout", () => {
    it("should logout and clear tokens", async () => {
      tokenManager.setTokens("access-token", "refresh-token");
      mock.onPost("/auth/logout").reply(200);

      await logout();

      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it("should clear tokens even if server request fails", async () => {
      tokenManager.setTokens("access-token", "refresh-token");
      mock.onPost("/auth/logout").reply(500);

      await logout();

      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user", async () => {
      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
      };
      mock.onGet("/auth/me").reply(200, { data: mockUser, success: true });

      const result = await getCurrentUser();

      expect(result).toEqual({ data: mockUser, success: true });
    });
  });

  describe("updateProfile", () => {
    it("should patch profile and return user", async () => {
      tokenManager.setTokens("access-token", "refresh-token");
      const body = {
        firstName: "Jane",
        lastName: "Doe",
        phone: "+380501112233",
        dateOfBirth: "1990-01-15",
        gender: "female" as const,
        emergencyContactName: null,
        emergencyContactPhone: null,
        runningClub: null,
        city: "Lviv",
        deliveryAddress: null,
      };
      const updated = {
        id: "1",
        email: "test@example.com",
        ...body,
      };
      mock.onPatch("/auth/me").reply(200, { data: updated, success: true });

      const result = await updateProfile(body);

      expect(result).toEqual({ data: updated, success: true });
    });
  });
});
