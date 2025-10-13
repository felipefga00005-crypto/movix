// ============================================
// API - FORNECEDORES
// ============================================

import { apiClient } from "./client"
import type {
  Fornecedor,
  CreateFornecedorDTO,
  UpdateFornecedorDTO,
  FornecedorStats,
  QueryParams,
} from "@/types"

const ENDPOINT = "/fornecedores"

export const fornecedoresApi = {
  /**
   * Lista todos os fornecedores com filtros opcionais
   */
  getAll: async (params?: QueryParams): Promise<Fornecedor[]> => {
    return apiClient.get<Fornecedor[]>(ENDPOINT, params)
  },

  /**
   * Busca um fornecedor por ID
   */
  getById: async (id: number): Promise<Fornecedor> => {
    return apiClient.get<Fornecedor>(`${ENDPOINT}/${id}`)
  },

  /**
   * Cria um novo fornecedor
   */
  create: async (data: CreateFornecedorDTO): Promise<Fornecedor> => {
    return apiClient.post<Fornecedor>(ENDPOINT, data)
  },

  /**
   * Atualiza um fornecedor existente
   */
  update: async (id: number, data: UpdateFornecedorDTO): Promise<Fornecedor> => {
    console.log('fornecedoresApi.update - Iniciando requisição PUT para ID:', id)
    console.log('fornecedoresApi.update - URL:', `${ENDPOINT}/${id}`)
    console.log('fornecedoresApi.update - Dados enviados:', data)

    try {
      const result = await apiClient.put<Fornecedor>(`${ENDPOINT}/${id}`, data)
      console.log('fornecedoresApi.update - Resposta recebida:', result)
      return result
    } catch (error) {
      console.error('fornecedoresApi.update - Erro na requisição:', error)
      throw error
    }
  },

  /**
   * Remove um fornecedor (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`${ENDPOINT}/${id}`)
  },

  /**
   * Obtém estatísticas dos fornecedores
   */
  getStats: async (): Promise<FornecedorStats> => {
    return apiClient.get<FornecedorStats>(`${ENDPOINT}/stats`)
  },

  /**
   * Busca fornecedores por categoria
   */
  getByCategoria: async (categoria: string): Promise<Fornecedor[]> => {
    return apiClient.get<Fornecedor[]>(`${ENDPOINT}/categoria/${categoria}`)
  },

  /**
   * Busca fornecedores ativos
   */
  getAtivos: async (): Promise<Fornecedor[]> => {
    return apiClient.get<Fornecedor[]>(`${ENDPOINT}/ativos`)
  },
}

