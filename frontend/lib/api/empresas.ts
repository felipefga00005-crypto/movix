import { apiClient } from './client';

export interface Empresa {
  id: string;
  nome: string;
  razao_social: string;
  plano: string;
  status: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpresaRequest {
  nome: string;
  razao_social?: string;
  plano?: string;
  status?: string;
}

export interface UpdateEmpresaRequest {
  nome?: string;
  razao_social?: string;
  plano?: string;
  status?: string;
  ativo?: boolean;
}

export const empresasApi = {
  // List all empresas
  list: async (): Promise<Empresa[]> => {
    const response = await apiClient.get<Empresa[]>('/admin/empresas');
    return response.data;
  },

  // Get empresa by ID
  get: async (id: string): Promise<Empresa> => {
    const response = await apiClient.get<Empresa>(`/admin/empresas/${id}`);
    return response.data;
  },

  // Create empresa
  create: async (data: CreateEmpresaRequest): Promise<Empresa> => {
    const response = await apiClient.post<Empresa>('/admin/empresas', data);
    return response.data;
  },

  // Update empresa
  update: async (id: string, data: UpdateEmpresaRequest): Promise<Empresa> => {
    const response = await apiClient.put<Empresa>(`/admin/empresas/${id}`, data);
    return response.data;
  },

  // Delete empresa
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/empresas/${id}`);
  },
};

