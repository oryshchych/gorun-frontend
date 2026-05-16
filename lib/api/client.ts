import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { defaultLocale, locales, type Locale } from "@/i18n";

function getLocaleForClientRedirect(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const first = window.location.pathname.split("/").filter(Boolean)[0];
  return locales.includes(first as Locale) ? (first as Locale) : defaultLocale;
}

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/** Normalized API origin (…/api) for axios and OAuth redirect URLs. */
export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
  const host = raw || "http://localhost:3001";
  return host.endsWith("/api") ? host : `${host}/api`;
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT tokens
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token using tokenManager
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AUTH_PATHS_SKIP_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/oauth/exchange",
];

function shouldAttemptTokenRefresh(
  config: InternalAxiosRequestConfig | undefined
): boolean {
  if (!config?.url) return true;
  const path = config.url.split("?")[0] ?? "";
  return !AUTH_PATHS_SKIP_REFRESH.some((segment) => path.includes(segment));
}

interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

let refreshPromise: Promise<string> | null = null;

async function refreshTokensOnce(): Promise<string> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${getApiBaseUrl()}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  if (!accessToken || !newRefreshToken) {
    throw new Error("Invalid refresh response");
  }

  tokenManager.setTokens(accessToken, newRefreshToken);
  return accessToken;
}

function runRefreshTokensOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshTokensOnce().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      shouldAttemptTokenRefresh(originalRequest)
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await runRefreshTokensOnce();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        tokenManager.clearTokens();
        if (typeof window !== "undefined") {
          const locale = getLocaleForClientRedirect();
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(formatErrorResponse(error));
  }
);

// Format error response for consistent error handling
interface FormattedError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  code?: string; // Add code field for API code-based errors
}

function formatErrorResponse(error: AxiosError): FormattedError {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as any;

    return {
      message: data?.message || data?.error?.message || "An error occurred",
      statusCode: error.response.status,
      errors: data?.errors || data?.error?.errors,
      code: data?.code, // Preserve API code if present
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: "No response from server. Please check your connection.",
      statusCode: 0,
      code: "ERROR_INTERNAL_SERVER",
    };
  } else {
    // Error in request setup
    return {
      message: error.message || "An unexpected error occurred",
      code: "ERROR_INTERNAL_SERVER",
    };
  }
}

// Token management utilities
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
};

const setTokens = (accessToken: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      // Clear refresh token if not provided
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Failed to set tokens:", error);
    throw error;
  }
};

const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
};

const hasToken = (): boolean => {
  return !!getAccessToken();
};

export const tokenManager = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  hasToken,
};

export default apiClient;
export type { FormattedError };
