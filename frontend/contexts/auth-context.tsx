'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginCredentials } from '@/lib/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const savedUser = authService.getStoredUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const userData = await authService.me();
          setUser(userData);
        } catch (error) {
          // Token is invalid
          authService.clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      // Save authentication data
      authService.saveAuth(response.token, response.user);

      setUser(response.user);

      // Redirect based on role
      if (response.user.role === 'super_admin') {
        router.push('/dashboard/super-admin');
      } else if (response.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear authentication data
      authService.clearAuth();

      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

