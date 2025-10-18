import { apiClient } from '@/lib/api/client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'super_admin' | 'admin' | 'user';
  empresa_id?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SetupRequest {
  nome: string;
  email: string;
  password: string;
}

export interface InviteData {
  email: string;
  role: string;
  empresa_id?: string;
  expires_at: string;
}

export interface AcceptInviteRequest {
  token: string;
  nome: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  /**
   * Get current user data
   */
  async me(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    return response.data;
  }

  /**
   * Check if system needs setup
   */
  async checkSetup(): Promise<{ needs_setup: boolean }> {
    const response = await apiClient.get<{ needs_setup: boolean }>('/setup/status');
    return response.data;
  }

  /**
   * Create initial super admin (setup)
   */
  async setup(data: SetupRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/setup', data);
    return response.data;
  }

  /**
   * Get invite details
   */
  async getInvite(token: string): Promise<InviteData> {
    const response = await apiClient.get<InviteData>(`/auth/invites/${token}`);
    return response.data;
  }

  /**
   * Accept invite and create account
   */
  async acceptInvite(data: AcceptInviteRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/invites/accept', data);
    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string; token?: string }> {
    const response = await apiClient.post<{ message: string; token?: string }>('/auth/password-reset/request', data);
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset/confirm', data);
    return response.data;
  }

  /**
   * Save authentication data to storage
   */
  saveAuth(token: string, user: User): void {
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Save to cookies for middleware
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  /**
   * Clear authentication data from storage
   */
  clearAuth(): void {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove from cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();

