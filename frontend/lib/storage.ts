/**
 * Storage - Wrapper genérico para localStorage
 * Com helpers específicos para token e user
 */

import { config } from './config'
import type { User } from '@/types/auth'

// ============================================
// STORAGE GENÉRICO
// ============================================

export const storage = {
  /**
   * Salva um valor no localStorage
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return

    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      console.log(`💾 Storage.set - Salvou ${key}:`, value)
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error)
    }
  },

  /**
   * Recupera um valor do localStorage
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(key)
      const value = item ? JSON.parse(item) : null
      return value
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error)
      return null
    }
  },

  /**
   * Remove um item do localStorage
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error)
    }
  },

  /**
   * Limpa todo o localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  /**
   * Verifica se uma chave existe
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(key) !== null
  },
}

// ============================================
// HELPERS ESPECÍFICOS - TOKEN
// ============================================

export const tokenStorage = {
  /**
   * Salva o token JWT
   */
  save(token: string): void {
    storage.set(config.tokenKey, token)
  },

  /**
   * Recupera o token JWT
   */
  get(): string | null {
    return storage.get<string>(config.tokenKey)
  },

  /**
   * Remove o token JWT
   */
  remove(): void {
    storage.remove(config.tokenKey)
  },

  /**
   * Verifica se existe um token salvo
   */
  exists(): boolean {
    return storage.has(config.tokenKey)
  },
}

// ============================================
// HELPERS ESPECÍFICOS - USER
// ============================================

export const userStorage = {
  /**
   * Salva os dados do usuário
   */
  save(user: User): void {
    storage.set(config.userKey, user)
  },

  /**
   * Recupera os dados do usuário
   */
  get(): User | null {
    return storage.get<User>(config.userKey)
  },

  /**
   * Remove os dados do usuário
   */
  remove(): void {
    storage.remove(config.userKey)
  },

  /**
   * Verifica se existe um usuário salvo
   */
  exists(): boolean {
    return storage.has(config.userKey)
  },
}

// ============================================
// HELPER - LIMPAR TUDO DE AUTH
// ============================================

export const clearAuthStorage = (): void => {
  tokenStorage.remove()
  userStorage.remove()
}

