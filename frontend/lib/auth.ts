const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface User {
  id: number;
  codigo: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil: string;
  status: string;
  avatar?: string;
  ultimo_acesso?: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SetupStatusResponse {
  setupRequired: boolean;
}

export async function checkSetupStatus(): Promise<SetupStatusResponse> {
  const response = await fetch(`${API_URL}/auth/setup/status`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to check setup status');
  }

  return response.json();
}

export async function setupSuperAdmin(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to setup super admin');
  }

  return response.json();
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }

  return response.json();
}

export async function register(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil?: string;
}): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register');
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to get current user');
  }

  return response.json();
}

export async function refreshToken(token: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data.token;
}

// Client-side helpers
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

export function setCurrentUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('current_user', JSON.stringify(user));
  }
}

export function getCurrentUserFromStorage(): User | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Função getCurrentUser já existe acima, removendo alias conflitante

export function removeCurrentUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('current_user');
  }
}

export function logout() {
  removeAuthToken();
  removeCurrentUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function clearAllAuthData() {
  if (typeof window !== 'undefined') {
    // Remove todos os dados de autenticação
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');

    // Remove outros dados que possam estar relacionados
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('[Auth] Todos os dados de autenticação foram limpos');
  }
}

