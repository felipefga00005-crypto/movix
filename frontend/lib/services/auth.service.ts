import { jwtDecode } from 'jwt-decode'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'superadmin' | 'admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  account_id?: string
  company_id?: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    refresh_token: string
    expires_at: string
    user: User
  }
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface SwitchCompanyRequest {
  company_id: string
}

export interface JWTClaims {
  user_id: string
  account_id?: string
  company_id?: string
  email: string
  name: string
  role: string
  exp: number
  iat: number
  nbf: number
  iss: string
  sub: string
}

export interface Company {
  id: string
  account_id: string
  trade_name: string
  legal_name: string
  document: string
  status: string
  created_at: string
  updated_at: string
}

// Token management
export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    // Set cookies with secure flags
    const isProduction = process.env.NODE_ENV === 'production'
    const secureFlag = isProduction ? 'Secure;' : ''

    // Access token - 7 days
    document.cookie = `auth_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; ${secureFlag}`

    // Refresh token - 30 days
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; ${secureFlag}`
  }
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token='))

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1]
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(c => c.trim().startsWith('refresh_token='))

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1]
}

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'refresh_token=; path=/; max-age=0'
  }
}

// JWT utilities
export const decodeToken = (token: string): JWTClaims | null => {
  try {
    return jwtDecode<JWTClaims>(token)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const claims = decodeToken(token)
  if (!claims) return true

  const now = Date.now() / 1000
  // Add 60 seconds buffer to refresh before actual expiration
  return claims.exp < (now + 60)
}

export const getCurrentUser = (): User | null => {
  const token = getToken()
  if (!token) return null

  if (isTokenExpired(token)) {
    clearTokens()
    return null
  }

  const claims = decodeToken(token)
  if (!claims) return null

  return {
    id: claims.user_id,
    email: claims.email,
    name: claims.name,
    role: claims.role as 'superadmin' | 'admin' | 'user',
    status: 'active',
    account_id: claims.account_id,
    company_id: claims.company_id,
    created_at: new Date(claims.iat * 1000).toISOString(),
    updated_at: new Date(claims.iat * 1000).toISOString(),
  }
}

// API calls
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  // Store tokens
  if (data.success && data.data) {
    setTokens(data.data.access_token, data.data.refresh_token)
  }

  return data
}

export const logout = async () => {
  clearTokens()

  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      clearTokens()
      return null
    }

    // Store new tokens
    setTokens(data.data.access_token, data.data.refresh_token)

    return data.data.access_token
  } catch (error) {
    console.error('Failed to refresh token:', error)
    clearTokens()
    return null
  }
}

// Fetch with authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = getToken()

  // Check if token is expired and refresh if needed
  if (token && isTokenExpired(token)) {
    token = await refreshAccessToken()
    if (!token) {
      logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // If unauthorized, try to refresh token once
  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      return fetch(url, {
        ...options,
        headers,
      })
    } else {
      // Redirect to login
      logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  return response
}

// Switch company (for users with multiple companies)
export const switchCompany = async (companyId: string): Promise<LoginResponse> => {
  const response = await fetchWithAuth(`${API_URL}/api/v1/auth/switch-company`, {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to switch company')
  }

  // Store new tokens with updated company context
  if (data.success && data.data) {
    setTokens(data.data.access_token, data.data.refresh_token)
  }

  return data
}

// Get user companies
export const getUserCompanies = async (): Promise<Company[]> => {
  const response = await fetchWithAuth(`${API_URL}/api/v1/user/companies`)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user companies')
  }

  return data.data || []
}

// Check if user has specific role
export const hasRole = (role: string | string[]): boolean => {
  const user = getCurrentUser()
  if (!user) return false

  if (Array.isArray(role)) {
    return role.includes(user.role)
  }

  return user.role === role
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false

  return !isTokenExpired(token)
}

// Auth service object
export const authService = {
  login,
  logout,
  refreshAccessToken,
  switchCompany,
  getUserCompanies,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  getToken,
  fetchWithAuth,
}

export default authService
