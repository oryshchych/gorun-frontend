import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { tokenManager } from '../client';

describe('API Client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Request Interceptor', () => {
    it('should attach Authorization header when token exists', async () => {
      const token = 'test-access-token';
      localStorage.setItem('access_token', token);

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
        return [200, { data: 'success' }];
      });

      await apiClient.get('/test');
    });

    it('should not attach Authorization header when token does not exist', async () => {
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: 'success' }];
      });

      await apiClient.get('/test');
    });
  });

  describe('Response Interceptor', () => {
    it('should return successful response', async () => {
      const responseData = { data: 'success' };
      mock.onGet('/test').reply(200, responseData);

      const response = await apiClient.get('/test');
      expect(response.data).toEqual(responseData);
    });

    it('should format error response with server error', async () => {
      const errorData = { message: 'Server error', error: 'Internal error' };
      mock.onGet('/test').reply(500, errorData);

      try {
        await apiClient.get('/test');
      } catch (error: any) {
        expect(error.message).toBe('Server error');
        expect(error.statusCode).toBe(500);
      }
    });

    it('should format error response with network error', async () => {
      mock.onGet('/test').networkError();

      try {
        await apiClient.get('/test');
      } catch (error: any) {
        expect(error.message).toContain('Network Error');
      }
    });
  });

  describe('Token Manager', () => {
    it('should store and retrieve access token', () => {
      const token = 'test-access-token';
      tokenManager.setTokens(token);

      expect(tokenManager.getAccessToken()).toBe(token);
    });

    it('should store and retrieve both tokens', () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      tokenManager.setTokens(accessToken, refreshToken);

      expect(tokenManager.getAccessToken()).toBe(accessToken);
      expect(tokenManager.getRefreshToken()).toBe(refreshToken);
    });

    it('should clear all tokens', () => {
      tokenManager.setTokens('access', 'refresh');
      tokenManager.clearTokens();

      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('should check if valid token exists', () => {
      expect(tokenManager.hasValidToken()).toBe(false);

      tokenManager.setTokens('test-token');
      expect(tokenManager.hasValidToken()).toBe(true);

      tokenManager.clearTokens();
      expect(tokenManager.hasValidToken()).toBe(false);
    });
  });
});
