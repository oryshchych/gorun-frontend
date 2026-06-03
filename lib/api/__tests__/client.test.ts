import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import apiClient, { getApiBaseUrl, tokenManager } from "../client";

describe("API Client", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("Request Interceptor", () => {
    it("should attach Authorization header when token exists", async () => {
      const token = "test-access-token";
      localStorage.setItem("access_token", token);

      mock.onGet("/test").reply((config) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
        return [200, { data: "success" }];
      });

      await apiClient.get("/test");
    });

    it("should not attach Authorization header when token does not exist", async () => {
      mock.onGet("/test").reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: "success" }];
      });

      await apiClient.get("/test");
    });
  });

  describe("Response Interceptor", () => {
    it("should return successful response", async () => {
      const responseData = { data: "success" };
      mock.onGet("/test").reply(200, responseData);

      const response = await apiClient.get("/test");
      expect(response.data).toEqual(responseData);
    });

    it("should format error response with server error", async () => {
      const errorData = { message: "Server error", error: "Internal error" };
      mock.onGet("/test").reply(500, errorData);

      try {
        await apiClient.get("/test");
      } catch (error) {
        const formattedError = error as { message: string; statusCode: number };
        expect(formattedError.message).toBe("Server error");
        expect(formattedError.statusCode).toBe(500);
      }
    });

    it("should format error response with network error", async () => {
      mock.onGet("/test").networkError();

      try {
        await apiClient.get("/test");
      } catch (error) {
        const formattedError = error as { message: string };
        expect(formattedError.message).toContain("Network Error");
      }
    });

    it("should refresh tokens on 401 and retry the original request", async () => {
      tokenManager.setTokens("expired-access", "old-refresh");
      const refreshSpy = vi.spyOn(axios, "post").mockResolvedValue({
        data: {
          success: true,
          data: {
            accessToken: "new-access",
            refreshToken: "new-refresh",
          },
        },
      } as never);

      mock
        .onGet("/events")
        .replyOnce(401, { code: "ERROR_AUTH_TOKEN_EXPIRED" })
        .onGet("/events")
        .reply((config) => {
          expect(config.headers?.Authorization).toBe("Bearer new-access");
          return [200, { data: [] }];
        });

      const response = await apiClient.get("/events");

      expect(response.status).toBe(200);
      expect(refreshSpy).toHaveBeenCalledWith(
        `${getApiBaseUrl()}/auth/refresh`,
        { refreshToken: "old-refresh" },
        { headers: { "Content-Type": "application/json" } }
      );
      expect(tokenManager.getAccessToken()).toBe("new-access");
      expect(tokenManager.getRefreshToken()).toBe("new-refresh");

      refreshSpy.mockRestore();
    });

    it("should not refresh on 401 from auth login", async () => {
      const refreshSpy = vi.spyOn(axios, "post");
      mock.onPost("/auth/login").reply(401, { message: "Invalid credentials" });

      await expect(
        apiClient.post("/auth/login", { email: "a@b.com", password: "x" })
      ).rejects.toMatchObject({ statusCode: 401 });

      expect(refreshSpy).not.toHaveBeenCalled();
      refreshSpy.mockRestore();
    });

    it("should dedupe parallel refresh calls on concurrent 401s", async () => {
      tokenManager.setTokens("expired-access", "old-refresh");
      const refreshSpy = vi.spyOn(axios, "post").mockResolvedValue({
        data: {
          success: true,
          data: {
            accessToken: "new-access",
            refreshToken: "new-refresh",
          },
        },
      } as never);

      mock
        .onGet("/events")
        .replyOnce(401)
        .onGet("/auth/me")
        .replyOnce(401)
        .onGet("/events")
        .reply(200, { data: [] })
        .onGet("/auth/me")
        .reply(200, { data: { id: "1" } });

      await Promise.all([apiClient.get("/events"), apiClient.get("/auth/me")]);

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      refreshSpy.mockRestore();
    });
  });

  describe("Token Manager", () => {
    it("should store and retrieve access token", () => {
      const token = "test-access-token";
      tokenManager.setTokens(token);

      expect(tokenManager.getAccessToken()).toBe(token);
    });

    it("should store and retrieve both tokens", () => {
      const accessToken = "test-access-token";
      const refreshToken = "test-refresh-token";
      tokenManager.setTokens(accessToken, refreshToken);

      expect(tokenManager.getAccessToken()).toBe(accessToken);
      expect(tokenManager.getRefreshToken()).toBe(refreshToken);
    });

    it("should clear all tokens", () => {
      tokenManager.setTokens("access", "refresh");
      tokenManager.clearTokens();

      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it("should check if valid token exists", () => {
      expect(tokenManager.hasToken()).toBe(false);

      tokenManager.setTokens("test-token");
      expect(tokenManager.hasToken()).toBe(true);

      tokenManager.clearTokens();
      expect(tokenManager.hasToken()).toBe(false);
    });
  });
});
