"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  exchangeOAuthCode,
  type AuthUserPayload,
  type LoginRequest,
  type RegisterRequest,
} from "@/lib/api/auth";
import { tokenManager } from "@/lib/api/client";
import type { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Complete session after backend OAuth redirect + one-time code */
  exchangeOAuthCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapPayloadToUser(payload: AuthUserPayload): User {
  const fromParts = [payload.firstName, payload.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name =
    payload.name?.trim() || (fromParts.length > 0 ? fromParts : undefined);
  return {
    id: payload.id,
    email: payload.email,
    name,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    image: payload.image,
    provider: "credentials",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (tokenManager.hasToken()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData.data);
        } catch (error) {
          console.error("Failed to load user:", error);
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      setUser(mapPayloadToUser(response.data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await apiRegister(data);
      setUser(mapPayloadToUser(response.data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exchangeOAuthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await exchangeOAuthCode(code);
      setUser(mapPayloadToUser(response.data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (tokenManager.hasToken()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData.data);
      } catch (error) {
        console.error("Failed to refresh user:", error);
        setUser(null);
        tokenManager.clearTokens();
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    exchangeOAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
