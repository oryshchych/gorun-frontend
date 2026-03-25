import type { UpdateProfileRequest, User } from "@/types/auth";
import apiClient, { getApiBaseUrl, tokenManager } from "./client";

/** User payload returned with login/register/OAuth (subset of full User) */
export interface AuthUserPayload {
  id: string;
  email: string;
  /** Display name or legacy full name from API */
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  image?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  /** When true, backend issues refresh token with longer TTL */
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
  };
}

export interface CurrentUserResponse {
  data: User;
  success: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface OAuthExchangeRequest {
  code: string;
}

/**
 * Public origin of the Next app (no trailing slash). Used for OAuth redirect_uri whitelist on the API.
 */
export function getFrontendOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "";
}

/** Build absolute URL to start Google OAuth on the API (browser redirect). */
export function buildGoogleOAuthStartUrl(options: {
  locale: string;
  rememberMe?: boolean;
}): string {
  const url = new URL(`${getApiBaseUrl()}/auth/google`);
  const origin = getFrontendOrigin();
  if (!origin) {
    throw new Error(
      "OAuth: set NEXT_PUBLIC_APP_URL or open the app in the browser (origin required for redirect_uri)"
    );
  }
  const redirectUri = `${origin}/${options.locale}/auth/callback`;
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("locale", options.locale);
  if (options.rememberMe) {
    url.searchParams.set("remember_me", "true");
  }
  return url.toString();
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials
  );

  tokenManager.setTokens(
    response.data.data.accessToken,
    response.data.data.refreshToken
  );

  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);

  tokenManager.setTokens(
    response.data.data.accessToken,
    response.data.data.refreshToken
  );

  return response.data;
}

/** Exchange one-time code from OAuth redirect for JWT pair (same shape as login). */
export async function exchangeOAuthCode(code: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/oauth/exchange", {
    code,
  } satisfies OAuthExchangeRequest);

  tokenManager.setTokens(
    response.data.data.accessToken,
    response.data.data.refreshToken
  );

  return response.data;
}

export async function forgotPassword(
  body: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    body
  );
  return response.data;
}

export async function resetPassword(body: ResetPasswordRequest): Promise<void> {
  await apiClient.post("/auth/reset-password", body);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    tokenManager.clearTokens();
  }
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await apiClient.get<CurrentUserResponse>("/auth/me");
  return response.data;
}

/** Update editable profile fields (email is not accepted). */
export async function updateProfile(
  body: UpdateProfileRequest
): Promise<CurrentUserResponse> {
  const response = await apiClient.patch<CurrentUserResponse>("/auth/me", body);
  return response.data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const response = await apiClient.post("/auth/refresh", { refreshToken });

  const { accessToken, refreshToken: newRefreshToken } = response.data;

  tokenManager.setTokens(accessToken, newRefreshToken);

  return accessToken;
}
