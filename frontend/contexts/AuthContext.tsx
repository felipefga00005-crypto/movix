'use client'

/**
 * AuthContext - Context de Autenticação
 * Gerencia estado global de autenticação da aplicação
 */

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { config } from '@/lib/config'
import type {
  AuthContextType,
  User,
  SetupRequest,
  CreateUserRequest,
} from '@/types/auth'

// ============================================
// CONTEXT
// ============================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  /**
   * Verifica autenticação ao carregar a aplicação
   */
  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 checkAuth - Verificando autenticação...')
      setIsLoading(true)

      // Verifica se existe token e user no localStorage
      if (!authService.isAuthenticated()) {
        console.log('❌ checkAuth - Não autenticado (sem token/user)')
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // Recupera dados do localStorage
      const storedToken = authService.getToken()
      const storedUser = authService.getCurrentUser()

      if (storedToken && storedUser) {
        console.log('✅ checkAuth - Token e user encontrados no localStorage')
        setToken(storedToken)
        setUser(storedUser)
        setIsAuthenticated(true)
        setIsLoading(false)

        // NÃO busca dados atualizados do backend automaticamente
        // Isso evita re-renders e problemas de navegação
        // Os dados serão atualizados quando necessário
      } else {
        console.log('❌ checkAuth - Token ou user não encontrados')
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('❌ checkAuth - Erro:', error)
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }, [])

  /**
   * Login
   */
  const login = useCallback(
    async (email: string, senha: string) => {
      try {
        console.log('🔐 Iniciando login...')
        const response = await authService.login({ email, senha })
        console.log('✅ Login response:', response)

        // Atualiza estado ANTES de redirecionar
        setToken(response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        setIsLoading(false)

        console.log('✅ Estado atualizado, redirecionando para /dashboard')
        toast.success('Login realizado com sucesso!')

        // Pequeno delay para garantir que o estado foi atualizado
        setTimeout(() => {
          router.replace('/dashboard')
        }, 100)
      } catch (error: any) {
        console.error('❌ Erro no login:', error)
        const message = error.message || 'Erro ao fazer login'
        toast.error(message)
        setIsLoading(false)
        throw error
      }
    },
    [router]
  )

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout()

      setUser(null)
      setToken(null)
      setIsAuthenticated(false)

      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error: any) {
      const message = error.message || 'Erro ao fazer logout'
      toast.error(message)
      throw error
    }
  }, [router])

  /**
   * Setup inicial do sistema
   */
  const setup = useCallback(
    async (data: SetupRequest) => {
      try {
        console.log('⚙️ Iniciando setup...')
        const response = await authService.setup(data)
        console.log('✅ Setup response:', response)

        // Atualiza estado ANTES de redirecionar
        setToken(response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        setIsLoading(false)

        console.log('✅ Setup completo, redirecionando para /dashboard')
        toast.success('Sistema configurado com sucesso!')

        // Pequeno delay para garantir que o estado foi atualizado
        setTimeout(() => {
          router.replace('/dashboard')
        }, 100)
      } catch (error: any) {
        console.error('❌ Erro no setup:', error)
        const message = error.message || 'Erro ao configurar sistema'
        toast.error(message)
        setIsLoading(false)
        throw error
      }
    },
    [router]
  )

  /**
   * Registro de novo usuário
   */
  const register = useCallback(async (data: CreateUserRequest) => {
    try {
      setIsLoading(true)

      const newUser = await authService.register(data)

      toast.success('Usuário registrado com sucesso!')
      return newUser
    } catch (error: any) {
      const message = error.message || 'Erro ao registrar usuário'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Refresh token automático
   */
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await authService.refreshToken()
      setToken(newToken)
    } catch (error) {
      console.error('Erro ao fazer refresh do token:', error)
      // Se falhar o refresh, faz logout
      await logout()
    }
  }, [logout])

  /**
   * Verifica autenticação ao montar o componente
   */
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * Configura refresh automático do token
   */
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      refreshToken()
    }, config.refreshTokenInterval)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshToken])

  // ============================================
  // PROVIDER VALUE
  // ============================================

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setup,
    register,
    checkAuth,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

