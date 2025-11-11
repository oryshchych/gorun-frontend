'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '@/lib/api/auth';
import { tokenManager } from '@/lib/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/lib/api/auth';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (tokenManager.hasValidToken()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await apiRegister(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (tokenManager.hasValidToken()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error('Failed to refresh user:', error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
