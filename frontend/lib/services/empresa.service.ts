import { apiClient } from '@/lib/api/client';

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

export interface Modulo {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  ativo: boolean;
  created_at: string;
}

export interface EmpresaModulo {
  id: string;
  empresa_id: string;
  modulo_id: string;
  ativo: boolean;
  created_at: string;
  modulo?: Modulo;
}

export interface CNPJ {
  id: string;
  empresa_id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  autorizado: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCNPJRequest {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  autorizado?: boolean;
}

export interface UpdateCNPJRequest {
  razao_social?: string;
  nome_fantasia?: string;
  autorizado?: boolean;
  ativo?: boolean;
}

class EmpresaService {
  /**
   * List all empresas
   */
  async list(): Promise<Empresa[]> {
    const response = await apiClient.get<Empresa[]>('/admin/empresas');
    return response.data;
  }

  /**
   * Get empresa by ID
   */
  async get(id: string): Promise<Empresa> {
    const response = await apiClient.get<Empresa>(`/admin/empresas/${id}`);
    return response.data;
  }

  /**
   * Create new empresa
   */
  async create(data: CreateEmpresaRequest): Promise<Empresa> {
    const response = await apiClient.post<Empresa>('/admin/empresas', data);
    return response.data;
  }

  /**
   * Update empresa
   */
  async update(id: string, data: UpdateEmpresaRequest): Promise<Empresa> {
    const response = await apiClient.put<Empresa>(`/admin/empresas/${id}`, data);
    return response.data;
  }

  /**
   * Delete empresa (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/empresas/${id}`);
  }

  /**
   * Get empresa modules
   */
  async getModulos(empresaId: string): Promise<EmpresaModulo[]> {
    const response = await apiClient.get<EmpresaModulo[]>(`/admin/empresas/${empresaId}/modulos`);
    return response.data;
  }

  /**
   * Activate module for empresa
   */
  async activateModulo(empresaId: string, moduloId: string): Promise<EmpresaModulo> {
    const response = await apiClient.post<EmpresaModulo>(
      `/admin/empresas/${empresaId}/modulos`,
      { modulo_id: moduloId }
    );
    return response.data;
  }

  /**
   * Deactivate module for empresa
   */
  async deactivateModulo(empresaId: string, moduloId: string): Promise<void> {
    await apiClient.delete(`/admin/empresas/${empresaId}/modulos/${moduloId}`);
  }

  /**
   * Get empresa CNPJs
   */
  async getCNPJs(empresaId: string): Promise<CNPJ[]> {
    const response = await apiClient.get<CNPJ[]>(`/admin/empresas/${empresaId}/cnpjs`);
    return response.data;
  }

  /**
   * Create CNPJ for empresa
   */
  async createCNPJ(empresaId: string, data: CreateCNPJRequest): Promise<CNPJ> {
    const response = await apiClient.post<CNPJ>(`/admin/empresas/${empresaId}/cnpjs`, data);
    return response.data;
  }

  /**
   * Update CNPJ
   */
  async updateCNPJ(cnpjId: string, data: UpdateCNPJRequest): Promise<CNPJ> {
    const response = await apiClient.put<CNPJ>(`/admin/cnpjs/${cnpjId}`, data);
    return response.data;
  }

  /**
   * Delete CNPJ (soft delete)
   */
  async deleteCNPJ(cnpjId: string): Promise<void> {
    await apiClient.delete(`/admin/cnpjs/${cnpjId}`);
  }
}

export const empresaService = new EmpresaService();

