// ============================================
// API - CLIENTES
// ============================================

import { apiClient } from "./client"
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteStats,
  QueryParams,
} from "@/types"

const ENDPOINT = "/clientes"

export const clientesApi = {
  /**
   * Lista todos os clientes com filtros opcionais
   */
  getAll: async (params?: QueryParams): Promise<Cliente[]> => {
    return apiClient.get<Cliente[]>(ENDPOINT, params)
  },

  /**
   * Busca um cliente por ID
   */
  getById: async (id: number): Promise<Cliente> => {
    return apiClient.get<Cliente>(`${ENDPOINT}/${id}`)
  },

  /**
   * Cria um novo cliente
   */
  create: async (data: CreateClienteDTO): Promise<Cliente> => {
    return apiClient.post<Cliente>(ENDPOINT, data)
  },

  /**
   * Atualiza um cliente existente
   */
  update: async (id: number, data: UpdateClienteDTO): Promise<Cliente> => {
    console.log('clientesApi.update - Iniciando requisição PUT para ID:', id)
    console.log('clientesApi.update - URL:', `${ENDPOINT}/${id}`)
    console.log('clientesApi.update - Dados enviados:', data)

    try {
      const result = await apiClient.put<Cliente>(`${ENDPOINT}/${id}`, data)
      console.log('clientesApi.update - Resposta recebida:', result)
      return result
    } catch (error) {
      console.error('clientesApi.update - Erro na requisição:', error)
      throw error
    }
  },

  /**
   * Remove um cliente (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`${ENDPOINT}/${id}`)
  },

  /**
   * Obtém estatísticas dos clientes
   */
  getStats: async (): Promise<ClienteStats> => {
    return apiClient.get<ClienteStats>(`${ENDPOINT}/stats`)
  },
}

