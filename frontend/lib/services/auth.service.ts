/**
 * Auth Service - Serviço de Autenticação
 * Responsável por toda lógica de autenticação da aplicação
 */

import { httpClient } from '../http-client'
import { tokenStorage, userStorage, clearAuthStorage } from '../storage'
import type {
  LoginRequest,
  LoginResponse,
  SetupRequest,
  CreateUserRequest,
  User,
  SetupStatusResponse,
} from '@/types/auth'

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  /**
   * Login do usuário
   * @param data - Email e senha
   * @returns Token JWT e dados do usuário
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>('/auth/login', data)

      // Salva token e user no localStorage
      tokenStorage.save(response.token)
      userStorage.save(response.user)

      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout do usuário
   * Remove token e dados do usuário do localStorage
   */
  async logout(): Promise<void> {
    try {
      // Limpa storage local
      clearAuthStorage()

      // Nota: Backend não tem endpoint de logout pois JWT é stateless
      // O token simplesmente expira após 7 dias
    } catch (error) {
      // Mesmo se houver erro, limpa o storage local
      clearAuthStorage()
      throw error
    }
  },

  /**
   * Setup inicial do sistema
   * Cria o primeiro usuário (super admin)
   * @param data - Nome, email, senha e telefone
   * @returns Token JWT e dados do usuário criado
   */
  async setup(data: SetupRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>('/auth/setup', data)

      // Salva token e user no localStorage (login automático)
      tokenStorage.save(response.token)
      userStorage.save(response.user)

      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Registro de novo usuário
   * @param data - Dados do usuário a ser criado
   * @returns Dados do usuário criado
   */
  async register(data: CreateUserRequest): Promise<User> {
    try {
      return await httpClient.post<User>('/auth/register', data)
    } catch (error) {
      throw error
    }
  },

  /**
   * Busca dados do usuário autenticado
   * @returns Dados atualizados do usuário
   */
  async me(): Promise<User> {
    try {
      const user = await httpClient.get<User>('/auth/me')

      // Atualiza dados do usuário no localStorage
      userStorage.save(user)

      return user
    } catch (error) {
      throw error
    }
  },

  /**
   * Refresh do token JWT
   * Gera um novo token antes do atual expirar
   * @returns Novo token JWT
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await httpClient.post<{ token: string }>('/auth/refresh')

      // Salva novo token
      tokenStorage.save(response.token)

      return response.token
    } catch (error) {
      // Se falhar o refresh, faz logout
      clearAuthStorage()
      throw error
    }
  },

  /**
   * Verifica se o sistema precisa de setup inicial
   * @returns true se precisa de setup, false caso contrário
   */
  async checkSetupRequired(): Promise<boolean> {
    try {
      const response = await httpClient.get<SetupStatusResponse>(
        '/auth/setup/status'
      )
      return response.setupRequired
    } catch (error) {
      throw error
    }
  },

  /**
   * Verifica se o usuário está autenticado
   * Verifica se existe token e user no localStorage
   * @returns true se autenticado, false caso contrário
   */
  isAuthenticated(): boolean {
    return tokenStorage.exists() && userStorage.exists()
  },

  /**
   * Recupera o usuário do localStorage
   * @returns Dados do usuário ou null
   */
  getCurrentUser(): User | null {
    return userStorage.get()
  },

  /**
   * Recupera o token do localStorage
   * @returns Token JWT ou null
   */
  getToken(): string | null {
    return tokenStorage.get()
  },
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default authService

