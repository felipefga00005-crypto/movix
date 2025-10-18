import { apiClient } from '@/lib/api/client';

export interface Usuario {
  id: string;
  empresa_id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioRequest {
  email: string;
  nome: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUsuarioRequest {
  nome?: string;
  role?: 'admin' | 'user';
  ativo?: boolean;
}

export interface CreateInviteRequest {
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  empresa_id?: string;
}

export interface InviteResponse {
  message: string;
  token: string;
  email: string;
  expires_at: string;
}

class UserService {
  /**
   * List all users of a company (Admin only)
   */
  async list(empresaId: string): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>(`/empresa/usuarios?empresa_id=${empresaId}`);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async get(id: string): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/empresa/usuarios/${id}`);
    return response.data;
  }

  /**
   * Create new user (Admin only)
   */
  async create(empresaId: string, data: CreateUsuarioRequest): Promise<Usuario> {
    const response = await apiClient.post<Usuario>('/empresa/usuarios', {
      ...data,
      empresa_id: empresaId,
    });
    return response.data;
  }

  /**
   * Update user (Admin only)
   */
  async update(id: string, data: UpdateUsuarioRequest): Promise<Usuario> {
    const response = await apiClient.put<Usuario>(`/empresa/usuarios/${id}`, data);
    return response.data;
  }

  /**
   * Delete user (Admin only - soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/empresa/usuarios/${id}`);
  }

  /**
   * Create invite for new user (Super Admin only)
   */
  async createInvite(data: CreateInviteRequest): Promise<InviteResponse> {
    const response = await apiClient.post<InviteResponse>('/admin/invites', data);
    return response.data;
  }

  /**
   * Assign module to user
   */
  async assignModulo(userId: string, moduloId: string): Promise<void> {
    await apiClient.post(`/empresa/usuarios/${userId}/modulos`, {
      modulo_id: moduloId,
    });
  }

  /**
   * Remove module from user
   */
  async removeModulo(userId: string, moduloId: string): Promise<void> {
    await apiClient.delete(`/empresa/usuarios/${userId}/modulos/${moduloId}`);
  }

  /**
   * Get user modules
   */
  async getModulos(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/empresa/usuarios/${userId}/modulos`);
    return response.data;
  }
}

export const userService = new UserService();

