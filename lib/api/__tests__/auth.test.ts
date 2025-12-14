import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient, { tokenManager } from "../client";
import { login, register, logout, getCurrentUser } from "../auth";

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
      };
      const mockResponse = {
        user: { id: "1", name: "Test User", email: "test@example.com" },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      mock.onPost("/auth/login").reply(200, mockResponse);

      const result = await login(credentials);

      expect(result).toEqual(mockResponse);
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
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };
      const mockResponse = {
        user: { id: "1", name: "Test User", email: "test@example.com" },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      mock.onPost("/auth/register").reply(201, mockResponse);

      const result = await register(data);

      expect(result).toEqual(mockResponse);
      expect(tokenManager.getAccessToken()).toBe("access-token");
      expect(tokenManager.getRefreshToken()).toBe("refresh-token");
    });

    it("should handle registration error", async () => {
      const data = {
        name: "Test",
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
      mock.onGet("/auth/me").reply(200, mockUser);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });
  });
});
