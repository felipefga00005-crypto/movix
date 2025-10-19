'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  LoginCredentials,
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  switchCompany as authSwitchCompany,
  getUserCompanies as authGetUserCompanies,
} from '@/lib/services/auth.service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  switchCompany: (companyId: string) => Promise<void>
  getUserCompanies: () => Promise<any[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from token on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to load user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authLogin(credentials)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        router.push('/dashboard')
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authLogout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchCompany = async (companyId: string) => {
    try {
      setIsLoading(true)
      const response = await authSwitchCompany(companyId)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        // Refresh the page to reload data with new company context
        router.refresh()
      } else {
        throw new Error(response.message || 'Failed to switch company')
      }
    } catch (error) {
      console.error('Switch company error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getUserCompanies = async () => {
    try {
      return await authGetUserCompanies()
    } catch (error) {
      console.error('Get user companies error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchCompany,
    getUserCompanies,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

