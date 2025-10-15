/**
 * Types de Autenticação
 * Alinhados com o backend Go (backend/internal/models/user.go)
 */

// ============================================
// USER MODEL
// ============================================

export interface User {
  id: number
  codigo: string
  nome: string
  email: string
  telefone?: string
  cargo?: string
  departamento?: string
  perfil: UserPerfil
  status: UserStatus
  avatar?: string
  ultimo_acesso?: string
  data_cadastro: string
  data_atualizacao: string
}

export type UserPerfil = 'super_admin' | 'admin' | 'gerente' | 'vendedor' | 'operador'

export type UserStatus = 'Ativo' | 'Inativo' | 'Pendente'

// ============================================
// REQUEST DTOs
// ============================================

export interface LoginRequest {
  email: string
  senha: string
}

export interface SetupRequest {
  nome: string
  email: string
  senha: string
  telefone?: string
}

export interface CreateUserRequest {
  nome: string
  email: string
  senha: string
  telefone?: string
  cargo?: string
  departamento?: string
  perfil?: UserPerfil
  status?: UserStatus
}

export interface UpdateUserRequest {
  nome?: string
  email?: string
  telefone?: string
  cargo?: string
  departamento?: string
  perfil?: UserPerfil
  status?: UserStatus
  avatar?: string
}

export interface ChangePasswordRequest {
  senhaAtual: string
  senhaNova: string
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface LoginResponse {
  token: string
  user: User
}

export interface SetupStatusResponse {
  setupRequired: boolean
}

// ============================================
// AUTH STATE
// ============================================

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  setup: (data: SetupRequest) => Promise<void>
  register: (data: CreateUserRequest) => Promise<User>
  checkAuth: () => Promise<void>
  refreshToken: () => Promise<void>
}

