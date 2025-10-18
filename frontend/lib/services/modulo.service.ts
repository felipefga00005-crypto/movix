import { apiClient } from '@/lib/api/client';

export interface Modulo {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  ativo: boolean;
  created_at: string;
}

export interface CreateModuloRequest {
  nome: string;
  descricao?: string;
  slug: string;
}

class ModuloService {
  /**
   * List all modules
   */
  async list(): Promise<Modulo[]> {
    const response = await apiClient.get<Modulo[]>('/admin/modulos');
    return response.data;
  }

  /**
   * Create new module
   */
  async create(data: CreateModuloRequest): Promise<Modulo> {
    const response = await apiClient.post<Modulo>('/admin/modulos', data);
    return response.data;
  }
}

export const moduloService = new ModuloService();

