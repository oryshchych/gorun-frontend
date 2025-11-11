import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT tokens
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem(REFRESH_TOKEN_KEY) 
          : null;

        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            if (newRefreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            }
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Format error response
    const formattedError = formatErrorResponse(error);
    return Promise.reject(formattedError);
  }
);

// Format error response for consistent error handling
interface FormattedError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

function formatErrorResponse(error: AxiosError): FormattedError {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as any;
    
    return {
      message: data?.message || data?.error || 'An error occurred',
      statusCode: error.response.status,
      errors: data?.errors,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'No response from server. Please check your connection.',
      statusCode: 0,
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }
}

// Token management utilities
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  hasValidToken: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

export default apiClient;
export type { FormattedError };
