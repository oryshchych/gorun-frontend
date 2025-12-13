import apiClient, { tokenManager } from "./client";

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

// Login function
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/auth/login", credentials);

  // Store tokens
  tokenManager.setTokens(response.data.data.accessToken, response.data.data.refreshToken);

  return response.data;
}

// Register function
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/auth/register", data);

  // Store tokens
  tokenManager.setTokens(response.data.data.accessToken, response.data.data.refreshToken);

  return response.data;
}

// Logout function
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint to invalidate refresh token on server
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    // Continue with local logout even if server request fails
    console.error("Logout error:", error);
  } finally {
    // Clear tokens from localStorage
    tokenManager.clearTokens();
  }
}

// Get current user
export async function getCurrentUser() {
  const response = await apiClient.get("/api/auth/me");
  return response.data;
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await apiClient.post("/api/auth/refresh", { refreshToken });

  const { accessToken, refreshToken: newRefreshToken } = response.data;

  // Update stored tokens
  tokenManager.setTokens(accessToken, newRefreshToken);

  return accessToken;
}
