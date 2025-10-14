"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as authLib from "@/lib/auth";

// Tipos
interface User {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  telefone?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: { nome: string; email: string; senha: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se está autenticado
  const isAuthenticated = !!user;

  /**
   * Carrega o usuário atual do localStorage e valida o token
   */
  const loadUser = useCallback(async () => {
    try {
      const token = authLib.getAuthToken();
      const storedUser = authLib.getCurrentUserFromStorage();

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      // Define o usuário do localStorage primeiro (para evitar flash)
      setUser(storedUser);

      // Valida o token fazendo uma chamada para /auth/me
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Token inválido");
        }

        const data = await response.json();

        // A API retorna o usuário diretamente, não em data.user
        const userData = data.user || data;

        setUser(userData);
      } catch (error) {
        console.error("[AuthContext] Erro ao validar token:", error);
        // Token inválido, limpa o localStorage
        authLib.removeAuthToken();
        authLib.removeCurrentUser();
        setUser(null);
      }
    } catch (error) {
      console.error("[AuthContext] Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Efeito para carregar o usuário ao montar o componente
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Login do usuário
   */
  const login = useCallback(
    async (email: string, senha: string) => {
      try {
        const response = await authLib.login(email, senha);

        // Salva o token e usuário
        authLib.setAuthToken(response.token);
        authLib.setCurrentUser(response.user);

        // Atualiza o estado
        setUser(response.user);

        toast.success("Login realizado com sucesso!");
      } catch (error: any) {
        toast.error(error.message || "Erro ao fazer login");
        throw error;
      }
    },
    []
  );

  /**
   * Registro de novo usuário
   */
  const register = useCallback(
    async (data: { nome: string; email: string; senha: string }) => {
      try {
        await authLib.register(data);

        // Faz login automaticamente após o registro
        const response = await authLib.login(data.email, data.senha);

        // Salva o token e usuário
        authLib.setAuthToken(response.token);
        authLib.setCurrentUser(response.user);

        // Atualiza o estado
        setUser(response.user);

        toast.success("Conta criada com sucesso!");
      } catch (error: any) {
        toast.error(error.message || "Erro ao criar conta");
        throw error;
      }
    },
    []
  );

  /**
   * Logout do usuário
   */
  const logout = useCallback(() => {
    // Remove do localStorage
    authLib.removeAuthToken();
    authLib.removeCurrentUser();

    // Limpa o estado
    setUser(null);

    // Redireciona para o login
    router.push("/login");

    toast.success("Logout realizado com sucesso!");
  }, [router]);

  /**
   * Refresh do token
   */
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = authLib.getAuthToken();

      if (!currentToken) {
        throw new Error("Nenhum token encontrado");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao renovar token");
      }

      const data = await response.json();

      // Atualiza o token
      authLib.setAuthToken(data.token);

      toast.success("Sessão renovada!");
    } catch (error: any) {
      toast.error("Sessão expirada. Faça login novamente.");
      logout();
      throw error;
    }
  }, [logout]);

  /**
   * Atualiza os dados do usuário
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    authLib.setCurrentUser(updatedUser);
  }, []);

  // Auto-refresh do token a cada 6 horas
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(
      () => {
        refreshToken().catch(() => {
          // Erro já tratado no refreshToken
        });
      },
      6 * 60 * 60 * 1000
    ); // 6 horas

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}

