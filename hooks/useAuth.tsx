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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthenticatedUser = useCallback(async () => {
    const userData = await getCurrentUser();
    setUser(userData.data);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (tokenManager.hasToken()) {
        try {
          await loadAuthenticatedUser();
        } catch (error) {
          console.error("Failed to load user:", error);
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [loadAuthenticatedUser]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        await apiLogin(credentials);
        await loadAuthenticatedUser();
      } finally {
        setIsLoading(false);
      }
    },
    [loadAuthenticatedUser]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      try {
        await apiRegister(data);
        await loadAuthenticatedUser();
      } finally {
        setIsLoading(false);
      }
    },
    [loadAuthenticatedUser]
  );

  const exchangeOAuthCallback = useCallback(
    async (code: string) => {
      setIsLoading(true);
      try {
        await exchangeOAuthCode(code);
        await loadAuthenticatedUser();
      } finally {
        setIsLoading(false);
      }
    },
    [loadAuthenticatedUser]
  );

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
    if (!tokenManager.hasToken()) return;
    try {
      await loadAuthenticatedUser();
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      tokenManager.clearTokens();
    }
  }, [loadAuthenticatedUser]);

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
